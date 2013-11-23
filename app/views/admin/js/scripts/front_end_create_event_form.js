
/**
 * @license RequireJS domReady 2.0.0 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */
/*jslint */
/*global require: false, define: false, requirejs: false,
  window: false, clearInterval: false, document: false,
  self: false, setInterval: false */


timely.define('domReady',[],function () {
    

    var isBrowser = typeof window !== "undefined" && window.document,
        isPageLoaded = !isBrowser,
        doc = isBrowser ? document : null,
        readyCalls = [],
        isTop, testDiv, scrollIntervalId;

    function runCallbacks(callbacks) {
        var i;
        for (i = 0; i < callbacks.length; i++) {
            callbacks[i](doc);
        }
    }

    function callReady() {
        var callbacks = readyCalls;

        if (isPageLoaded) {
            //Call the DOM ready callbacks
            if (callbacks.length) {
                readyCalls = [];
                runCallbacks(callbacks);
            }
        }
    }

    /**
     * Sets the page as loaded.
     */
    function pageLoaded() {
        if (!isPageLoaded) {
            isPageLoaded = true;
            if (scrollIntervalId) {
                clearInterval(scrollIntervalId);
            }

            callReady();
        }
    }

    if (isBrowser) {
        if (document.addEventListener) {
            //Standards. Hooray! Assumption here that if standards based,
            //it knows about DOMContentLoaded.
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else if (window.attachEvent) {
            window.attachEvent("onload", pageLoaded);

            testDiv = document.createElement('div');
            try {
                isTop = window.frameElement === null;
            } catch(e) {}

            //DOMContentLoaded approximation that uses a doScroll, as found by
            //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
            //but modified by other contributors, including jdalton
            if (testDiv.doScroll && isTop && window.external) {
                scrollIntervalId = setInterval(function () {
                    try {
                        testDiv.doScroll();
                        pageLoaded();
                    } catch (e) {}
                }, 30);
            }
        }

        //Check if document already complete, and if so, just trigger page load
        //listeners. Latest webkit browsers also use "interactive", and
        //will fire the onDOMContentLoaded before "interactive" but not after
        //entering "interactive" or "complete". More details:
        //http://dev.w3.org/html5/spec/the-end.html#the-end
        //http://stackoverflow.com/questions/3665561/document-readystate-of-interactive-vs-ondomcontentloaded
        if (document.readyState === "complete" ||
            document.readyState === "interactive") {
            pageLoaded();
        }
    }

    /** START OF PUBLIC API **/

    /**
     * Registers a callback for DOM ready. If DOM is already ready, the
     * callback is called immediately.
     * @param {Function} callback
     */
    function domReady(callback) {
        if (isPageLoaded) {
            callback(doc);
        } else {
            readyCalls.push(callback);
        }
        return domReady;
    }

    domReady.version = '2.0.0';

    /**
     * Loader Plugin API method
     */
    domReady.load = function (name, req, onLoad, config) {
        if (config.isBuild) {
            onLoad(null);
        } else {
            domReady(onLoad);
        }
    };

    /** END OF PUBLIC API **/

    return domReady;
});

timely.define('external_libs/bootstrap_tab', ["jquery_timely"],
		function( $ ) {
	   // jshint ;_;


	 /* TAB CLASS DEFINITION
	  * ==================== */

	  var Tab = function ( element ) {
	    this.element = $(element)
	  }

	  Tab.prototype = {

	    constructor: Tab

	  , show: function () {
	      var $this = this.element
	        , $ul = $this.closest('ul:not(.dropdown-menu)')
	        , selector = $this.attr('data-target')
	        , previous
	        , $target
	        , e

	      if (!selector) {
	        selector = $this.attr('href')
	        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
	      }

	      if ( $this.parent('li').hasClass('active') ) return

	      previous = $ul.find('.active a').last()[0]

	      e = $.Event('show', {
	        relatedTarget: previous
	      })

	      $this.trigger(e)

	      if (e.isDefaultPrevented()) return

	      $target = $(selector)

	      this.activate($this.parent('li'), $ul)
	      this.activate($target, $target.parent(), function () {
	        $this.trigger({
	          type: 'shown'
	        , relatedTarget: previous
	        })
	      })
	    }

	  , activate: function ( element, container, callback) {
	      var $active = container.find('> .active')
	        , transition = callback
	            && $.support.transition
	            && $active.hasClass('fade')

	      function next() {
	        $active
	          .removeClass('active')
	          .find('> .dropdown-menu > .active')
	          .removeClass('active')

	        element.addClass('active')

	        if (transition) {
	          element[0].offsetWidth // reflow for transition
	          element.addClass('in')
	        } else {
	          element.removeClass('fade')
	        }

	        if ( element.parent('.dropdown-menu') ) {
	          element.closest('li.dropdown').addClass('active')
	        }

	        callback && callback()
	      }

	      transition ?
	        $active.one($.support.transition.end, next) :
	        next()

	      $active.removeClass('in')
	    }
	  }


	 /* TAB PLUGIN DEFINITION
	  * ===================== */

	  $.fn.tab = function ( option ) {
	    return this.each(function () {
	      var $this = $(this)
	        , data = $this.data('tab')
	      if (!data) $this.data('tab', (data = new Tab(this)))
	      if (typeof option == 'string') data[option]()
	    })
	  }

	  $.fn.tab.Constructor = Tab


	 /* TAB DATA-API
	  * ============ */

	  $(function () {
	    $('body').on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
	      e.preventDefault()
	      $(this).tab('show')
	    })
	  })
} );
timely.define('libs/utils',
		[
		 "jquery_timely",
		 "external_libs/bootstrap_tab"
		 ],
		 function( $ ) {
	 // jshint ;_;
	var AI1EC_UTILS = function() {
			// We just return an object. This is useful if we ever need to define some private variables.
			return {
				/**
				 * check if a number is float
				 *
				 * @param the value to check
				 *
				 * @return boolean true if the value is float, false if it's not
				 */
				"is_float": function( n ) {
					return ! isNaN( parseFloat( n ) );
				},
				/**
				 * check if the value is a valid coordinate
				 *
				 * @param mixed the value to check
				 *
				 * @param boolean true if we are validating latitude
				 *
				 * @return boolean true if the value is a valid coordinate
				 */
				"is_valid_coordinate": function( n, is_latitude ) {
					// Longitude is valid between +180 and -180 while Latitude is valid between +90 an -90
					var max_value = is_latitude ? 90 : 180;
					return this.is_float( n ) && Math.abs( n ) < max_value;
				},
				/**
				 * Converts all the commas to dots so that the value can be used as a float
				 */
				"convert_comma_to_dot": function( value ) {
					return value.replace( ',', '.' );
				},
				/**
				 * Check if a field has a value.
				 *
				 * @param string id, the id of the element to check
				 *
				 * @return boolean Whether the fields has a value or not
				 */
				"field_has_value": function( id ) {
					var selector = '#' + id;
					var $field = $( selector );
					var has_value = false;
					// Check if the field was found. If it's not found we treat it as having no value.
					if( $field.length === 1 ) {
						has_value = $.trim( $field.val() ) !== '';
					}
					return has_value;
				},
				/**
				 * Create a twitter bootstrap aler
				 *
				 * @param text the text of the message
				 *
				 * @param type the type of the message
				 *
				 * @return the alert, ready to be inserted in the DOM
				 *
				 */
				"make_alert": function( text, type, hide_close_button ) {
					var alert_class = '';
					switch (type) {
						case 'error'  : alert_class = 'alert alert-error';
							break;
						case 'success': alert_class = 'alert alert-success';
							break;
						default: alert_class = 'alert';
							break;
					}
					// Create the alert
					var $alert = $( '<div />', {
						"class" : alert_class,
						"html"  : text
					} );
					if ( ! hide_close_button ) {
						// Create the close button
						var $close = $( '<a />', {
							"class"        : "close",
							"data-dismiss" : "alert",
							"href"         : "#",
							"text"         : "x"
						} );
						// Prepend the close button to the alert.
						$alert.prepend( $close );
					}
					return $alert;
				},
				/**
				 * Define the ajax url. If undefined we hardcode a value. This is needed for testing purpose only because in the testing environment the variable ajaxurl is undefined.
				 */
				"get_ajax_url": function() {
					if( typeof window.ajaxurl === "undefined" ) {
						return "http://localhost/wordpress/wp-admin/admin-ajax.php";
					} else {
						return window.ajaxurl;
					}
				},
				/**
				 * isUrl checks to see if the passed parameter is a valid url
				 * and returns true on access and false on failure
				 *
				 * @param String s String to validate
				 *
				 * @return boolean True if the string is a valid url, false otherwise
				 */
				 "isUrl" : function( s ) {
					var regexp = /(http|https|webcal):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
					return regexp.test(s);
				},
				/**
				 * isValidEmail checks if the mail passed is valid.
				 *
				 * @param email string
				 * @returns boolean
				 */
				"isValidEmail" : function( email ) {
					var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					return re.test( email );
				},
				/**
				 * activates the passed tab or the first one if no tab is passed.
				 * 
				 * @param active_tab
				 * @returns
				 */
				activate_saved_tab_on_page_load : function( active_tab ) {
					if ( null === active_tab || undefined === active_tab ){
						// Activate the first tab
						$( 'ul.nav-tabs a:first' ).tab( 'show' );
					} else {
						// Activate the correct tab
						$( 'ul.nav-tabs a[href=' + active_tab + ']' ).tab( 'show' );
					}
				}
			};
	}();
	return AI1EC_UTILS;
} );

timely.define('scripts/add_new_event/event_location/input_coordinates_utility_functions',
		[
		 "jquery_timely",
		 "ai1ec_config",
		 "libs/utils"
		 ],
		 function( $, ai1ec_config, AI1EC_UTILS ) {
	 // jshint ;_;
			/**
			 *
			 * converts commas to dots as in some regions (Europe for example) floating point numbers are defined with a comma instead of a dot
			 *
			 */
			var ai1ec_convert_commas_to_dots_for_coordinates = function() {
				if ( $( '#ai1ec_input_coordinates:checked' ).length > 0 ) {
					$( '#ai1ec_table_coordinates input.coordinates' ).each( function() {
						this.value = AI1EC_UTILS.convert_comma_to_dot( this.value );
					} );
				}
			};
			/**
			 * Shows the error message after the field
			 *
			 * @param Object the dom element after which we put the error
			 *
			 * @param the error message
			 *
			 */
			var ai1ec_show_error_message_after_element = function( el, error_message ) {
				// Create the element to append in case of error
				var error = $( '<div />',
						{
							"text" : error_message,
							"class" : "ai1ec-error"
						}
				);
				// Insert error message
				$( el ).after( error );
			};
			/**
			 * INTERNAL FUNCTION (not exported)
			 * prevent default actions and stop immediate propagation if the publish button was clicked and
			 * gives focus to the passed element
			 *
			 * @param Object the event object
			 *
			 * @param Object the element to focus
			 *
			 */
			var ai1ec_prevent_actions_and_focus_on_errors = function( e, el ) {
				// If the validation was triggered  by clicking publish
				if ( e.target.id === 'post' ) {
					// Prevent other events from firing
					e.stopImmediatePropagation();
					// Prevent the submit
					e.preventDefault();
					// Just in case, hide the ajax spinner and remove the disabled status
					$( '#publish' ).removeClass( 'button-primary-disabled' );
					$( '#publish' ).siblings( '.spinner' ).css( 'visibility', 'hidden' );
					
				}
				// Focus on the first field that has an error
				$( el ).focus();
			};
			/**
			 * Check if either the coordinates or the address are set
			 *
			 * @returns boolean true if at least one is set between the address and both coordinates
			 */
			var check_if_address_or_coordinates_are_set = function() {
				var address_set = AI1EC_UTILS.field_has_value( 'ai1ec_address' );
				var lat_long_set = true;
				$( '.coordinates' ).each( function() {
					var is_set = AI1EC_UTILS.field_has_value( this.id );
					if ( ! is_set ) {
						lat_long_set = false;
					}
				} );
				return address_set || lat_long_set;
			};
			/**
			 * check that both latitude and longitude are not empty when publishing an event if the "Input coordinates" check-box
			 * is checked
			 *
			 * @param Object the event object
			 *
			 * @returns boolean true if the check is ok, false otherwise
			 *
			 */
			var ai1ec_check_lat_long_fields_filled_when_publishing_event = function( e ) {
				var valid = true;
				// We will save the first non valid field in this variable so whe can focus
				var first_not_valid = false;
				if ( $( '#ai1ec_input_coordinates:checked' ).length > 0 ) {
					// Clean up old error messages
					$( 'div.ai1ec-error' ).remove();
					$( '#ai1ec_table_coordinates input.coordinates' ).each( function() {
						// Check if we are validating latitude or longitude
						var latitude = $( this ).hasClass( 'latitude' );
						// Get the correct error message
						var error_message = latitude ? ai1ec_config.error_message_not_entered_lat : ai1ec_config.error_message_not_entered_long;
						if ( this.value === '' ) {
							valid = false;
							if( first_not_valid === false ) {
								first_not_valid = this;
							}
							ai1ec_show_error_message_after_element( this, error_message );
						}
					});
				}
				if ( valid === false ) {
					ai1ec_prevent_actions_and_focus_on_errors( e, first_not_valid );
				}
				return valid;
			};
			/**
			 * checks if latitude and longitude fields are valid and a search can be performed
			 *
			 * @param Object the event object that is passed to the handler function
			 *
			 * @return boolean true if the values are valid and both fields have a value, false otherwise;
			 */
			var ai1ec_check_lat_long_ok_for_search = function( e ) {
				// If the coordinates checkbox is checked
				if ( $( '#ai1ec_input_coordinates:checked' ).length === 1 ) {
					// Clean up old error messages
					$( 'div.ai1ec-error' ).remove();
					var valid = true;
					// We will save the first non valid field in this variable so whe can focus
					var first_not_valid = false;
					// If a field is empty, we will return false so that the map is not updated.
					var at_least_one_field_empty = false;
					// Let's iterate over the coordinates.
					$( '#ai1ec_table_coordinates input.coordinates' ).each( function() {
						if ( this.value === '' ) {
							at_least_one_field_empty = true;
							return;
						}
						// Check if we are validating latitude or longitude
						var latitude = $( this ).hasClass( 'latitude' );
						// Get the correct error message
						var error_message = latitude ? ai1ec_config.error_message_not_valid_lat : ai1ec_config.error_message_not_valid_long;
						// Check if the coordinate is valid.
						if( ! AI1EC_UTILS.is_valid_coordinate( this.value, latitude ) ) {
							valid = false;
							// Save the elements so that we can focus later
							if ( first_not_valid === false ) {
								first_not_valid = this;
							}
							ai1ec_show_error_message_after_element( this, error_message );
						}
					});
					// Check if there are errors
					if ( valid === false ) {
						ai1ec_prevent_actions_and_focus_on_errors( e, first_not_valid );
					}
					if ( at_least_one_field_empty === true ) {
						valid = false;
					}
					return valid;
				}
			};
			return {
				ai1ec_convert_commas_to_dots_for_coordinates             : ai1ec_convert_commas_to_dots_for_coordinates,
				ai1ec_show_error_message_after_element                   : ai1ec_show_error_message_after_element,
				check_if_address_or_coordinates_are_set                  : check_if_address_or_coordinates_are_set,
				ai1ec_check_lat_long_fields_filled_when_publishing_event : ai1ec_check_lat_long_fields_filled_when_publishing_event,
				ai1ec_check_lat_long_ok_for_search                       : ai1ec_check_lat_long_ok_for_search
			};
} );
timely.define('external_libs/jquery.autocomplete_geomod', 
		[
		 "jquery_timely"
		 ],
function( $ ) {
	
	$.fn.extend({
		autocomplete: function(urlOrData, options) {
			var isUrl = typeof urlOrData == "string";
			options = $.extend({}, $.Autocompleter.defaults, {
				url: isUrl ? urlOrData : null,
				data: isUrl ? null : urlOrData,
				delay: isUrl ? $.Autocompleter.defaults.delay : 10,
				max: options && !options.scroll ? 10 : 150
			}, options);
			
			// if highlight is set to false, replace it with a do-nothing function
			options.highlight = options.highlight || function(value) { return value; };
			
			// if the formatMatch option is not specified, then use formatItem for backwards compatibility
			options.formatMatch = options.formatMatch || options.formatItem;
			
			return this.each(function() {
				new $.Autocompleter(this, options);
			});
		},
		result: function(handler) {
			return this.bind("result", handler);
		},
		search: function(handler) {
			return this.trigger("search", [handler]);
		},
		flushCache: function() {
			return this.trigger("flushCache");
		},
		setOptions: function(options){
			return this.trigger("setOptions", [options]);
		},
		unautocomplete: function() {
			return this.trigger("unautocomplete");
		}
	});

	$.Autocompleter = function(input, options) {

		var KEY = {
			UP: 38,
			DOWN: 40,
			DEL: 46,
			TAB: 9,
			RETURN: 13,
			ESC: 27,
			COMMA: 188,
			PAGEUP: 33,
			PAGEDOWN: 34,
			BACKSPACE: 8
		};

		// Create $ object for input element
		var $input = $(input).attr("autocomplete", "off").addClass(options.inputClass);

		var timeout;
		var previousValue = "";
		var cache = $.Autocompleter.Cache(options);
		var hasFocus = 0;
		var lastKeyPressCode;
		var isOpera = navigator.userAgent.match(/opera/i)
		var config = {
			mouseDownOnSelect: false
		};
		var select = $.Autocompleter.Select(options, input, selectCurrent, config);
		
		var blockSubmit;
		
		// prevent form submit in opera when selecting with return key
		isOpera && $(input.form).bind("submit.autocomplete", function() {
			if (blockSubmit) {
				blockSubmit = false;
				return false;
			}
		});
		
		// only opera doesn't trigger keydown multiple times while pressed, others don't work with keypress at all
		$input.bind((isOpera ? "keypress" : "keydown") + ".autocomplete", function(event) {
			// a keypress means the input has focus
			// avoids issue where input had focus before the autocomplete was applied
			hasFocus = 1;
			// track last key pressed
			lastKeyPressCode = event.keyCode;
			switch(event.keyCode) {
			
				case KEY.UP:
					event.preventDefault();
					if ( select.visible() ) {
						select.prev();
					} else {
						onChange(0, true);
					}
					break;
					
				case KEY.DOWN:
					event.preventDefault();
					if ( select.visible() ) {
						select.next();
					} else {
						onChange(0, true);
					}
					break;
					
				case KEY.PAGEUP:
					event.preventDefault();
					if ( select.visible() ) {
						select.pageUp();
					} else {
						onChange(0, true);
					}
					break;
					
				case KEY.PAGEDOWN:
					event.preventDefault();
					if ( select.visible() ) {
						select.pageDown();
					} else {
						onChange(0, true);
					}
					break;
				
				// matches also semicolon
				case options.multiple && $.trim(options.multipleSeparator) == "," && KEY.COMMA:
				case KEY.TAB:
				case KEY.RETURN:
					if( selectCurrent() ) {
						// stop default to prevent a form submit, Opera needs special handling
						event.preventDefault();
						blockSubmit = true;
						return false;
					}
					break;
					
				case KEY.ESC:
					select.hide();
					break;
					
				default:
					clearTimeout(timeout);
					timeout = setTimeout(onChange, options.delay);
					break;
			}
		}).focus(function(){
			// track whether the field has focus, we shouldn't process any
			// results if the field no longer has focus
			hasFocus++;
		}).blur(function() {
			hasFocus = 0;
			if (!config.mouseDownOnSelect) {
				hideResults();
			}
		}).click(function() {
			// show select when clicking in a focused field
			if ( hasFocus++ > 1 && !select.visible() ) {
				onChange(0, true);
			}
		}).bind("search", function() {
			// TODO why not just specifying both arguments?
			var fn = (arguments.length > 1) ? arguments[1] : null;
			function findValueCallback(q, data) {
				var result;
				if( data && data.length ) {
					for (var i=0; i < data.length; i++) {
						if( data[i].result.toLowerCase() == q.toLowerCase() ) {
							result = data[i];
							break;
						}
					}
				}
				if( typeof fn == "function" ) fn(result);
				else $input.trigger("result", result && [result.data, result.value]);
			}
			$.each(trimWords($input.val()), function(i, value) {
				request(value, findValueCallback, findValueCallback);
			});
		}).bind("flushCache", function() {
			cache.flush();
		}).bind("setOptions", function() {
			$.extend(options, arguments[1]);
			// if we've updated the data, repopulate
			if ( "data" in arguments[1] )
				cache.populate();
		}).bind("unautocomplete", function() {
			select.unbind();
			$input.unbind();
			$(input.form).unbind(".autocomplete");
		});
		
		
		function selectCurrent() {
			var selected = select.selected();
			if( !selected )
				return false;
			
			var v = selected.result;
			previousValue = v;
			
			if ( options.multiple ) {
				var words = trimWords($input.val());
				if ( words.length > 1 ) {
					var seperator = options.multipleSeparator.length;
					var cursorAt = $(input).selection().start;
					var wordAt, progress = 0;
					$.each(words, function(i, word) {
						progress += word.length;
						if (cursorAt <= progress) {
							wordAt = i;
							return false;
						}
						progress += seperator;
					});
					words[wordAt] = v;
					// TODO this should set the cursor to the right position, but it gets overriden somewhere
					//$.Autocompleter.Selection(input, progress + seperator, progress + seperator);
					v = words.join( options.multipleSeparator );
				}
				v += options.multipleSeparator;
			}
			
			$input.val(v);
			hideResultsNow();
			$input.trigger("result", [selected.data, selected.value]);
			return true;
		}
		
		function onChange(crap, skipPrevCheck) {
			if( lastKeyPressCode == KEY.DEL ) {
				select.hide();
				return;
			}
			
			var currentValue = $input.val();
			
			if ( !skipPrevCheck && currentValue == previousValue )
				return;
			
			previousValue = currentValue;
			
			currentValue = lastWord(currentValue);
			if ( currentValue.length >= options.minChars) {
				$input.addClass(options.loadingClass);
				if (!options.matchCase)
					currentValue = currentValue.toLowerCase();
				request(currentValue, receiveData, hideResultsNow);
			} else {
				stopLoading();
				select.hide();
			}
		};
		
		function trimWords(value) {
			if (!value)
				return [""];
			if (!options.multiple)
				return [$.trim(value)];
			return $.map(value.split(options.multipleSeparator), function(word) {
				return $.trim(value).length ? $.trim(word) : null;
			});
		}
		
		function lastWord(value) {
			if ( !options.multiple )
				return value;
			var words = trimWords(value);
			if (words.length == 1) 
				return words[0];
			var cursorAt = $(input).selection().start;
			if (cursorAt == value.length) {
				words = trimWords(value)
			} else {
				words = trimWords(value.replace(value.substring(cursorAt), ""));
			}
			return words[words.length - 1];
		}
		
		// fills in the input box w/the first match (assumed to be the best match)
		// q: the term entered
		// sValue: the first matching result
		function autoFill(q, sValue){
			// autofill in the complete box w/the first match as long as the user hasn't entered in more data
			// if the last user key pressed was backspace, don't autofill
			if( options.autoFill && (lastWord($input.val()).toLowerCase() == q.toLowerCase()) && lastKeyPressCode != KEY.BACKSPACE ) {
				// fill in the value (keep the case the user has typed)
				$input.val($input.val() + sValue.substring(lastWord(previousValue).length));
				// select the portion of the value not typed by the user (so the next character will erase)
				$(input).selection(previousValue.length, previousValue.length + sValue.length);
			}
		};

		function hideResults() {
			clearTimeout(timeout);
			timeout = setTimeout(hideResultsNow, 200);
		};

		function hideResultsNow() {
			var wasVisible = select.visible();
			select.hide();
			clearTimeout(timeout);
			stopLoading();
			if (options.mustMatch) {
				// call search and run callback
				$input.search(
					function (result){
						// if no value found, clear the input box
						if( !result ) {
							if (options.multiple) {
								var words = trimWords($input.val()).slice(0, -1);
								$input.val( words.join(options.multipleSeparator) + (words.length ? options.multipleSeparator : "") );
							}
							else {
								$input.val( "" );
								$input.trigger("result", null);
							}
						}
					}
				);
			}
		};

		function receiveData(q, data) {
			if ( data && data.length && hasFocus ) {
				stopLoading();
				select.display(data, q);
				autoFill(q, data[0].value);
				select.show();
			} else {
				hideResultsNow();
			}
		};

		function request(term, success, failure) {
			if (!options.matchCase)
				term = term.toLowerCase();
			var data = cache.load(term);
			// recieve the cached data
			if (data && data.length) {
				success(term, data);

			// start geo_Autocomplete mod
			// request handler for google geocoder
			} else if (options.geocoder) {
				var _query = lastWord(term);
				var _opts = { 'address': _query };
				if( options.region )
					_opts.region = options.region;
				
				options.geocoder.geocode( _opts, function(_results, _status) {
					var parsed = options.parse(_results, _status, _query);
					cache.add(term, parsed);
					success(term, parsed);
				});
			// end geo_Autocomplete mod
					
			// if an AJAX url has been supplied, try loading the data now
			} else if( (typeof options.url == "string") && (options.url.length > 0) ){
				
				var extraParams = {
					timestamp: +new Date()
				};
				$.each(options.extraParams, function(key, param) {
					extraParams[key] = typeof param == "function" ? param() : param;
				});
							
				$.ajax({
					// try to leverage ajaxQueue plugin to abort previous requests
					mode: "abort",
					// limit abortion to this input
					port: "autocomplete" + input.name,
					dataType: options.dataType,
					url: options.url,
					data: $.extend({
						q: lastWord(term),
						limit: options.max
					}, extraParams),
					success: function(data) {
						var parsed = options.parse && options.parse(data) || parse(data);
						cache.add(term, parsed);
						success(term, parsed);
					}
				});
				
			} else {
				// if we have a failure, we need to empty the list -- this prevents the the [TAB] key from selecting the last successful match
				select.emptyList();
				failure(term);
			}
		};
		
		function parse(data) {
			var parsed = [];
			var rows = data.split("\n");
			for (var i=0; i < rows.length; i++) {
				var row = $.trim(rows[i]);
				if (row) {
					row = row.split("|");
					parsed[parsed.length] = {
						data: row,
						value: row[0],
						result: options.formatResult && options.formatResult(row, row[0]) || row[0]
					};
				}
			}
			return parsed;
		};

		function stopLoading() {
			$input.removeClass(options.loadingClass);
		};

	};

	$.Autocompleter.defaults = {
		inputClass: "ac_input",
		resultsClass: "ac_results",
		loadingClass: "ac_loading",
		minChars: 1,
		delay: 400,
		matchCase: false,
		matchSubset: true,
		matchContains: false,
		cacheLength: 10,
		max: 100,
		mustMatch: false,
		extraParams: {},
		selectFirst: true,
		formatItem: function(row) { return row[0]; },
		formatMatch: null,
		autoFill: false,
		width: 0,
		multiple: false,
		multipleSeparator: ", ",
		highlight: function(value, term) {
			return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<strong>$1</strong>");
		},
	    scroll: true,
	    scrollHeight: 180
	};

	$.Autocompleter.Cache = function(options) {

		var data = {};
		var length = 0;
		
		function matchSubset(s, sub) {
			if (!options.matchCase) 
				s = s.toLowerCase();
			var i = s.indexOf(sub);
			if (options.matchContains == "word"){
				i = s.toLowerCase().search("\\b" + sub.toLowerCase());
			}
			if (i == -1) return false;
			return i == 0 || options.matchContains;
		};
		
		function add(q, value) {
			if (length > options.cacheLength){
				flush();
			}
			if (!data[q]){ 
				length++;
			}
			data[q] = value;
		}
		
		function populate(){
			if( !options.data ) return false;
			// track the matches
			var stMatchSets = {},
				nullData = 0;

			// no url was specified, we need to adjust the cache length to make sure it fits the local data store
			if( !options.url ) options.cacheLength = 1;
			
			// track all options for minChars = 0
			stMatchSets[""] = [];
			
			// loop through the array and create a lookup structure
			for ( var i = 0, ol = options.data.length; i < ol; i++ ) {
				var rawValue = options.data[i];
				// if rawValue is a string, make an array otherwise just reference the array
				rawValue = (typeof rawValue == "string") ? [rawValue] : rawValue;
				
				var value = options.formatMatch(rawValue, i+1, options.data.length);
				if ( value === false )
					continue;
					
				var firstChar = value.charAt(0).toLowerCase();
				// if no lookup array for this character exists, look it up now
				if( !stMatchSets[firstChar] ) 
					stMatchSets[firstChar] = [];

				// if the match is a string
				var row = {
					value: value,
					data: rawValue,
					result: options.formatResult && options.formatResult(rawValue) || value
				};
				
				// push the current match into the set list
				stMatchSets[firstChar].push(row);

				// keep track of minChars zero items
				if ( nullData++ < options.max ) {
					stMatchSets[""].push(row);
				}
			};

			// add the data items to the cache
			$.each(stMatchSets, function(i, value) {
				// increase the cache size
				options.cacheLength++;
				// add to the cache
				add(i, value);
			});
		}
		
		// populate any existing data
		setTimeout(populate, 25);
		
		function flush(){
			data = {};
			length = 0;
		}
		
		return {
			flush: flush,
			add: add,
			populate: populate,
			load: function(q) {
				if (!options.cacheLength || !length)
					return null;
				/* 
				 * if dealing w/local data and matchContains than we must make sure
				 * to loop through all the data collections looking for matches
				 */
				if( !options.url && options.matchContains ){
					// track all matches
					var csub = [];
					// loop through all the data grids for matches
					for( var k in data ){
						// don't search through the stMatchSets[""] (minChars: 0) cache
						// this prevents duplicates
						if( k.length > 0 ){
							var c = data[k];
							$.each(c, function(i, x) {
								// if we've got a match, add it to the array
								if (matchSubset(x.value, q)) {
									csub.push(x);
								}
							});
						}
					}				
					return csub;
				} else 
				// if the exact item exists, use it
				if (data[q]){
					return data[q];
				} else
				if (options.matchSubset) {
					for (var i = q.length - 1; i >= options.minChars; i--) {
						var c = data[q.substr(0, i)];
						if (c) {
							var csub = [];
							$.each(c, function(i, x) {
								if (matchSubset(x.value, q)) {
									csub[csub.length] = x;
								}
							});
							return csub;
						}
					}
				}
				return null;
			}
		};
	};

	$.Autocompleter.Select = function (options, input, select, config) {
		var CLASSES = {
			ACTIVE: "ac_over"
		};
		
		var listItems,
			active = -1,
			data,
			term = "",
			needsInit = true,
			element,
			list;
		
		// Create results
		function init() {
			if (!needsInit)
				return;
			element = $("<div/>")
			.hide()
			.addClass(options.resultsClass)
			.css("position", "absolute")
			.appendTo(document.body);
		
			list = $("<ul/>").appendTo(element).mouseover( function(event) {
				if(target(event).nodeName && target(event).nodeName.toUpperCase() == 'LI') {
		            active = $("li", list).removeClass(CLASSES.ACTIVE).index(target(event));
				    $(target(event)).addClass(CLASSES.ACTIVE);            
		        }
			}).click(function(event) {
				$(target(event)).addClass(CLASSES.ACTIVE);
				select();
				// TODO provide option to avoid setting focus again after selection? useful for cleanup-on-focus
				input.focus();
				return false;
			}).mousedown(function() {
				config.mouseDownOnSelect = true;
			}).mouseup(function() {
				config.mouseDownOnSelect = false;
			});
			
			if( options.width > 0 )
				element.css("width", options.width);
				
			needsInit = false;
		} 
		
		function target(event) {
			var element = event.target;
			while(element && element.tagName != "LI")
				element = element.parentNode;
			// more fun with IE, sometimes event.target is empty, just ignore it then
			if(!element)
				return [];
			return element;
		}

		function moveSelect(step) {
			listItems.slice(active, active + 1).removeClass(CLASSES.ACTIVE);
			movePosition(step);
	        var activeItem = listItems.slice(active, active + 1).addClass(CLASSES.ACTIVE);
	        if(options.scroll) {
	            var offset = 0;
	            listItems.slice(0, active).each(function() {
					offset += this.offsetHeight;
				});
	            if((offset + activeItem[0].offsetHeight - list.scrollTop()) > list[0].clientHeight) {
	                list.scrollTop(offset + activeItem[0].offsetHeight - list.innerHeight());
	            } else if(offset < list.scrollTop()) {
	                list.scrollTop(offset);
	            }
	        }
		};
		
		function movePosition(step) {
			active += step;
			if (active < 0) {
				active = listItems.size() - 1;
			} else if (active >= listItems.size()) {
				active = 0;
			}
		}
		
		function limitNumberOfItems(available) {
			return options.max && options.max < available
				? options.max
				: available;
		}
		
		function fillList() {
			list.empty();
			var max = limitNumberOfItems(data.length);
			for (var i=0; i < max; i++) {
				if (!data[i])
					continue;
				var formatted = options.formatItem(data[i].data, i+1, max, data[i].value, term);
				if ( formatted === false )
					continue;
				var li = $("<li/>").html( options.highlight(formatted, term) ).addClass(i%2 == 0 ? "ac_even" : "ac_odd").appendTo(list)[0];
				$.data(li, "ac_data", data[i]);
			}
			listItems = list.find("li");
			if ( options.selectFirst ) {
				listItems.slice(0, 1).addClass(CLASSES.ACTIVE);
				active = 0;
			}
			// apply bgiframe if available
			if ( $.fn.bgiframe )
				list.bgiframe();
		}
		
		return {
			display: function(d, q) {
				init();
				data = d;
				term = q;
				fillList();
			},
			next: function() {
				moveSelect(1);
			},
			prev: function() {
				moveSelect(-1);
			},
			pageUp: function() {
				if (active != 0 && active - 8 < 0) {
					moveSelect( -active );
				} else {
					moveSelect(-8);
				}
			},
			pageDown: function() {
				if (active != listItems.size() - 1 && active + 8 > listItems.size()) {
					moveSelect( listItems.size() - 1 - active );
				} else {
					moveSelect(8);
				}
			},
			hide: function() {
				element && element.hide();
				listItems && listItems.removeClass(CLASSES.ACTIVE);
				active = -1;
			},
			visible : function() {
				return element && element.is(":visible");
			},
			current: function() {
				return this.visible() && (listItems.filter("." + CLASSES.ACTIVE)[0] || options.selectFirst && listItems[0]);
			},
			show: function() {
				var offset = $(input).offset();
				element.css({
					width: typeof options.width == "string" || options.width > 0 ? options.width : $(input).width(),
					top: offset.top + input.offsetHeight,
					left: offset.left
				}).show();
	            if(options.scroll) {
	                list.scrollTop(0);
	                list.css({
						maxHeight: options.scrollHeight,
						overflow: 'auto'
					});
					
	                if(navigator.userAgent.match(/msie/i) && typeof document.body.style.maxHeight === "undefined") {
						var listHeight = 0;
						listItems.each(function() {
							listHeight += this.offsetHeight;
						});
						var scrollbarsVisible = listHeight > options.scrollHeight;
	                    list.css('height', scrollbarsVisible ? options.scrollHeight : listHeight );
						if (!scrollbarsVisible) {
							// IE doesn't recalculate width when scrollbar disappears
							listItems.width( list.width() - parseInt(listItems.css("padding-left")) - parseInt(listItems.css("padding-right")) );
						}
	                }
	                
	            }
			},
			selected: function() {
				var selected = listItems && listItems.filter("." + CLASSES.ACTIVE).removeClass(CLASSES.ACTIVE);
				return selected && selected.length && $.data(selected[0], "ac_data");
			},
			emptyList: function (){
				list && list.empty();
			},
			unbind: function() {
				element && element.remove();
			}
		};
	};

	$.fn.selection = function(start, end) {
		if (start !== undefined) {
			return this.each(function() {
				if( this.createTextRange ){
					var selRange = this.createTextRange();
					if (end === undefined || start == end) {
						selRange.move("character", start);
						selRange.select();
					} else {
						selRange.collapse(true);
						selRange.moveStart("character", start);
						selRange.moveEnd("character", end);
						selRange.select();
					}
				} else if( this.setSelectionRange ){
					this.setSelectionRange(start, end);
				} else if( this.selectionStart ){
					this.selectionStart = start;
					this.selectionEnd = end;
				}
			});
		}
		var field = this[0];
		if ( field.createTextRange ) {
			var range = document.selection.createRange(),
				orig = field.value,
				teststring = "<->",
				textLength = range.text.length;
			range.text = teststring;
			var caretAt = field.value.indexOf(teststring);
			field.value = orig;
			this.selection(caretAt, caretAt + textLength);
			return {
				start: caretAt,
				end: caretAt + textLength
			}
		} else if( field.selectionStart !== undefined ){
			return {
				start: field.selectionStart,
				end: field.selectionEnd
			}
		}
	};
} );
timely.define('external_libs/geo_autocomplete',
		[
		 "jquery_timely",
		 "external_libs/jquery.autocomplete_geomod"
		 ],
		 function( $ ) {

$.fn.extend({
	geo_autocomplete: function( _geocoder, _options ) {
		options = $.extend({}, $.Autocompleter.defaults, {
			geocoder: _geocoder,
			mapwidth: 100,
			mapheight: 100,
			maptype: 'terrain',
			mapkey: 'ABQIAAAAbnvDoAoYOSW2iqoXiGTpYBT2yXp_ZAY8_ufC3CFXhHIE1NvwkxQNumU68AwGqjbSNF9YO8NokKst8w', // localhost
			mapsensor: false,
			parse: function(_results, _status, _query) {
				var _parsed = [];
				if (_results && _status && _status == 'OK') {
					$.each(_results, function(_key, _result) {
						if (_result.geometry && _result.geometry.viewport) {
							// place is first matching segment, or first segment
							var _place_parts = _result.formatted_address.split(',');
							var _place = _place_parts[0];
							$.each(_place_parts, function(_key, _part) {
								if (_part.toLowerCase().indexOf(_query.toLowerCase()) != -1) {
									_place = $.trim(_part);
									return false; // break
								}
							});
							_parsed.push({
								data: _result,
								value: _place,
								result: _place
							});
						}
					});
				}
				return _parsed;
			},
			formatItem: function(_data, _i, _n, _value) {
				var _src = 'https://maps.google.com/maps/api/staticmap?visible=' +
					_data.geometry.viewport.getSouthWest().toUrlValue() + '|' +
					_data.geometry.viewport.getNorthEast().toUrlValue() +
					'&size=' + options.mapwidth + 'x' + options.mapheight +
					'&maptype=' + options.maptype +
					'&key=' + options.mapkey +
					'&sensor=' + (options.mapsensor ? 'true' : 'false');
				var _place = _data.formatted_address.replace(/,/gi, ',<br/>');
				return '<img src="' + _src + '" width="' + options.mapwidth +
					'" height="' + options.mapheight + '" /> ' + _place +
					'<br clear="both"/>';
			}
		}, _options);

		// if highlight is set to false, replace it with a do-nothing function
		options.highlight = options.highlight || function(value) { return value; };

		// if the formatMatch option is not specified, then use formatItem for backwards compatibility
		options.formatMatch = options.formatMatch || options.formatItem;

		// Add class to hide results until restyled below.
		options.resultsClass = 'ai1ec-geo-ac-results-not-ready';

		return this.each( function() {
			// Schedule polling function the first time the form element is focused.
			// The polling function will check once a second if the results have been
			// shown, and if so, apply markup-based styling to it. Then the function
			// is cancelled.
			$( this ).one( 'focus', function() {
				var interval_id = setInterval(
					function() {
						var $results = $( '.ai1ec-geo-ac-results-not-ready' );
						if ( $results.length ) {
							$results
								.removeClass( 'ai1ec-geo-ac-results-not-ready' )
								.addClass( 'ai1ec-geo-ac-results' )
								.wrap( '<div class="timely"/>' )
								.children( 'ul' )
									.addClass( 'dropdown-menu' );
							clearInterval( interval_id );
						}
					},
					500
				);
			} );

			new $.Autocompleter( this, options );
		} );
	}
});

} );

timely.define('scripts/add_new_event/event_location/gmaps_helper',
		[
		 "jquery_timely",
		 'domReady',
		 'ai1ec_config',
		 'scripts/add_new_event/event_location/input_coordinates_utility_functions',
		 'external_libs/jquery.autocomplete_geomod',
		 'external_libs/geo_autocomplete'
		 ],
		function( $, domReady, ai1ec_config, input_utility_functions ) {
	 // jshint ;_;
	// Local Variables (killing those would be even better)
	var ai1ec_geocoder,
	    ai1ec_default_location,
	    ai1ec_myOptions,
	    ai1ec_map,
	    ai1ec_marker,
	    ai1ec_position;

	var gmap_event_listener = function( e ) {
		$( 'input.longitude' ).val( e.latLng.lng() );
		$( 'input.latitude' ).val( e.latLng.lat() );
		// If the checkbox to input coordinates is not checked, trigger the click event on it.
		if( $( '#ai1ec_input_coordinates:checked' ).length === 0 ) {
			$( '#ai1ec_input_coordinates' ).trigger( 'click' );
		}
	};
	var set_position_with_geolocator_if_available = function() {
		// Check if browser supports W3C Geolocation API. Use !! to have a boolean that reflect the truthiness of the original value.
		if ( !! navigator.geolocation ) {
			// Ask the user for his position. If the User denies it or if anything else goes wrong, we just fail silently and keep using our default.
			navigator.geolocation.getCurrentPosition( function( position ) {
				// The callback takes some time bofore it's called, we need to be sure to set the starting position only when no previous position was set.
				// So we check if the coordinates or the address have been set.
				var address_or_coordinates_set = input_utility_functions.check_if_address_or_coordinates_are_set();
				// If they have not been set, we use geolocation data.
				if ( address_or_coordinates_set === false ) {
					var lat = position.coords.latitude;
					var long = position.coords.longitude;
					// Update default location.
					ai1ec_default_location = new google.maps.LatLng( lat, long );
					// Set the marker position.
					ai1ec_marker.setPosition( ai1ec_default_location );
					// Center the Map and adjust the zoom level.
					ai1ec_map.setCenter( ai1ec_default_location );
					ai1ec_map.setZoom( 15 );
					ai1ec_position = position;
				}
			} );
		}
	};
	var set_autocomplete_if_needed = function() {
		if( ! ai1ec_config.disable_autocompletion ) {
			// This is the only way to stop the autocomplete from firing when the
			// coordinates checkbox is checked. The new jQuery UI autocomplete
			// supports the method .autocomplete( "disable" ) but not this version.
			$( '#ai1ec_address' )
				.bind( "keypress keyup keydown change", function( e ) {
					if( $( '#ai1ec_input_coordinates:checked' ).length ) {
						e.stopImmediatePropagation();
					}
				})
				// Initialize geo_autocomplete plugin
				.geo_autocomplete(
					new google.maps.Geocoder(),
					{
						selectFirst: false,
						minChars: 3,
						cacheLength: 50,
						width: 300,
						scroll: true,
						scrollHeight: 330,
						region: ai1ec_config.region
					}
				)
				.result(
					function( _event, _data ) {
						if( _data ) {
							ai1ec_update_address( _data );
						}
					}
				)
				// Each time user changes address field, reformat field and update map.
				.change(
					function() {
						// Position map based on provided address value
						if( $( this ).val().length > 0 ) {
							var address = $( this ).val();

							ai1ec_geocoder.geocode(
								{
									'address': address,
									'region': ai1ec_config.region
								},
								function( results, status ) {
									if( status === google.maps.GeocoderStatus.OK ) {
										ai1ec_update_address( results[0] );
									}
								}
							);
						}
					}
				);
		}
	};
	var init_gmaps = function() {
		/**
		 * Google map setup
		 */
		// If the user is updating an event, initialize the map to the event
		// location, otherwise if the user is creating a new event initialize
		// the map to the whole world
		ai1ec_geocoder = new google.maps.Geocoder();
		//world = map.setCenter(new GLatLng(9.965, -83.327), 1);
		//africa = map.setCenter(new GLatLng(-3, 27), 3);
		//europe = map.setCenter(new GLatLng(47, 19), 3);
		//asia = map.setCenter(new GLatLng(32, 130), 3);
		//south pacific = map.setCenter(new GLatLng(-24, 134), 3);
		//north america = map.setCenter(new GLatLng(50, -114), 3);
		//latin america = map.setCenter(new GLatLng(-20, -70), 3);
		ai1ec_default_location = new google.maps.LatLng( 9.965, -83.327 );
		ai1ec_myOptions = {
			zoom: 0,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: ai1ec_default_location
		};
		domReady( function() {
			// This is mainly for testing purpose but it makes sense in any case, start the work only if there is a container
			if( $( '#ai1ec_map_canvas' ).length > 0 ) {
				// initialize map
				ai1ec_map = new google.maps.Map( $( '#ai1ec_map_canvas' ).get(0), ai1ec_myOptions );
				// Initialize Marker
				ai1ec_marker = new google.maps.Marker({
					map: ai1ec_map,
					draggable: true
				});
				// When the marker is dropped, update the latitude and longitude fields.
				google.maps.event.addListener( ai1ec_marker, 'dragend', gmap_event_listener );
				ai1ec_marker.setPosition( ai1ec_default_location );
				// If the browser supports geolocation, use it
				set_position_with_geolocator_if_available();
				// Start the autocompleter if the user decided to use it
				set_autocomplete_if_needed();
				// Set the map location and show / hide the coordinates
				init_coordinates_visibility();
			}
		} );

	};
	/**
	 * Given a location, update the address field with a reformatted version,
	 * update hidden location fields with address data, and center map on
	 * new location.
	 *
	 * @param object result  single result of a Google geocode() call
	 */
	var ai1ec_update_address = function( result ) {
		ai1ec_map.setCenter( result.geometry.location );
		ai1ec_map.setZoom( 15 );
		ai1ec_marker.setPosition( result.geometry.location );
		$( '#ai1ec_address' ).val( result.formatted_address );
		$( '#ai1ec_latitude' ).val( result.geometry.location.lat() );
		$( '#ai1ec_longitude' ).val( result.geometry.location.lng() );
		// check the checkbox if not checked, we want to store the lat/lng data
		if( ! $( '#ai1ec_input_coordinates' ).is( ':checked' ) ) {
			$( '#ai1ec_input_coordinates' ).click();
		}
		

		var street_number = '',
					street_name = '',
					city = '',
					postal_code = 0,
					country = 0,
					province = '';

		for( var i = 0; i < result.address_components.length; i++ ) {
			switch( result.address_components[i].types[0] ) {
				case 'street_number':
					street_number = result.address_components[i].long_name;
					break;
				case 'route':
					street_name = result.address_components[i].long_name;
					break;
				case 'locality':
					city = result.address_components[i].long_name;
					break;
				case 'administrative_area_level_1':
					province = result.address_components[i].long_name;
					break;
				case 'postal_code':
					postal_code = result.address_components[i].long_name;
					break;
				case 'country':
					country = result.address_components[i].long_name;
					break;
			}
		}
		// Combine street number with street address
		var address = street_number.length > 0 ? street_number + ' ' : '';
		address += street_name.length > 0 ? street_name : '';
		// Clean up postal code if necessary
		postal_code = postal_code !== 0 ? postal_code : '';

		$( '#ai1ec_city' ).val( city );
		$( '#ai1ec_province' ).val( province );
		$( '#ai1ec_postal_code' ).val( postal_code );
		$( '#ai1ec_country' ).val( country );
	};
	/**
	 * Updates the map taking the coordinates from the input fields
	 */
	var ai1ec_update_map_from_coordinates = function() {
		var lat = parseFloat( $( 'input.latitude' ).val() );
		var long = parseFloat( $( 'input.longitude' ).val() );
		var LatLong = new google.maps.LatLng( lat, long );

		ai1ec_map.setCenter( LatLong );
		ai1ec_map.setZoom( 15 );
		ai1ec_marker.setPosition( LatLong );
	};
	var init_coordinates_visibility = function() {
		// If the coordinates checkbox is not checked
		if( $( '#ai1ec_input_coordinates:checked' ).length === 0 ) {
			// Hide the table (i hide things in js for progressive enhancement reasons)
			$( '#ai1ec_table_coordinates' ).css( { visibility : 'hidden' } );
			// Trigger the change event on the address to show the map
			$( '#ai1ec_address' ).change();
		} else {
			// If the checkbox is checked, show the map using the coordinates
			ai1ec_update_map_from_coordinates();
		}
	};
	// This allows another function to access the marker ( if the marker is set ). I mainly use this for testing.
	var get_marker = function() {
		return ai1ec_marker;
	};
	// This allows another function to access the position ( if the position is set ). I mainly use this for testing.
	var get_position = function() {
		return ai1ec_position;
	};
	return {
		init_gmaps                        : init_gmaps,
		ai1ec_update_map_from_coordinates : ai1ec_update_map_from_coordinates,
		get_marker                        : get_marker,
		get_position                      : get_position
	};
} );

timely.define('external_libs/select2',
		[
		 "jquery_timely"
		 ],
function( jQuery ) {

/*
Copyright 2012 Igor Vaynberg

Version: 3.3.1 Timestamp: Wed Feb 20 09:57:22 PST 2013

This software is licensed under the Apache License, Version 2.0 (the "Apache License") or the GNU
General Public License version 2 (the "GPL License"). You may choose either license to govern your
use of this software only upon the condition that you accept all of the terms of either the Apache
License or the GPL License.

You may obtain a copy of the Apache License and the GPL License at:

    http://www.apache.org/licenses/LICENSE-2.0
    http://www.gnu.org/licenses/gpl-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the
Apache License or the GPL Licesnse is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the Apache License and the GPL License for
the specific language governing permissions and limitations under the Apache License and the GPL License.
*/
 (function ($) {
 	if(typeof $.fn.each2 == "undefined"){
 		$.fn.extend({
 			/*
			* 4-10 times faster .each replacement
			* use it carefully, as it overrides jQuery context of element on each iteration
			*/
			each2 : function (c) {
				var j = $([0]), i = -1, l = this.length;
				while (
					++i < l
					&& (j.context = j[0] = this[i])
					&& c.call(j[0], i, j) !== false //"this"=DOM, i=index, j=jQuery object
				);
				return this;
			}
 		});
 	}
})(jQuery);

(function ($, undefined) {
    
    /*global document, window, jQuery, console */

    var KEY, AbstractSelect2, SingleSelect2, MultiSelect2, nextUid, sizer,
        lastMousePosition, $document;

    KEY = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        HOME: 36,
        END: 35,
        BACKSPACE: 8,
        DELETE: 46,
        isArrow: function (k) {
            k = k.which ? k.which : k;
            switch (k) {
            case KEY.LEFT:
            case KEY.RIGHT:
            case KEY.UP:
            case KEY.DOWN:
                return true;
            }
            return false;
        },
        isControl: function (e) {
            var k = e.which;
            switch (k) {
            case KEY.SHIFT:
            case KEY.CTRL:
            case KEY.ALT:
                return true;
            }

            if (e.metaKey) return true;

            return false;
        },
        isFunctionKey: function (k) {
            k = k.which ? k.which : k;
            return k >= 112 && k <= 123;
        }
    };

    $document = $(document);

    nextUid=(function() { var counter=1; return function() { return counter++; }; }());

    function indexOf(value, array) {
        var i = 0, l = array.length;
        for (; i < l; i = i + 1) {
            if (equal(value, array[i])) return i;
        }
        return -1;
    }

    /**
     * Compares equality of a and b
     * @param a
     * @param b
     */
    function equal(a, b) {
        if (a === b) return true;
        if (a === undefined || b === undefined) return false;
        if (a === null || b === null) return false;
        if (a.constructor === String) return a === b+'';
        if (b.constructor === String) return b === a+'';
        return false;
    }

    /**
     * Splits the string into an array of values, trimming each value. An empty array is returned for nulls or empty
     * strings
     * @param string
     * @param separator
     */
    function splitVal(string, separator) {
        var val, i, l;
        if (string === null || string.length < 1) return [];
        val = string.split(separator);
        for (i = 0, l = val.length; i < l; i = i + 1) val[i] = $.trim(val[i]);
        return val;
    }

    function getSideBorderPadding(element) {
        return element.outerWidth(false) - element.width();
    }

    function installKeyUpChangeEvent(element) {
        var key="keyup-change-value";
        element.bind("keydown", function () {
            if ($.data(element, key) === undefined) {
                $.data(element, key, element.val());
            }
        });
        element.bind("keyup", function () {
            var val= $.data(element, key);
            if (val !== undefined && element.val() !== val) {
                $.removeData(element, key);
                element.trigger("keyup-change");
            }
        });
    }

    $document.bind("mousemove", function (e) {
        lastMousePosition = {x: e.pageX, y: e.pageY};
    });

    /**
     * filters mouse events so an event is fired only if the mouse moved.
     *
     * filters out mouse events that occur when mouse is stationary but
     * the elements under the pointer are scrolled.
     */
    function installFilteredMouseMove(element) {
	    element.bind("mousemove", function (e) {
            var lastpos = lastMousePosition;
            if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {
                $(e.target).trigger("mousemove-filtered", e);
            }
        });
    }

    /**
     * Debounces a function. Returns a function that calls the original fn function only if no invocations have been made
     * within the last quietMillis milliseconds.
     *
     * @param quietMillis number of milliseconds to wait before invoking fn
     * @param fn function to be debounced
     * @param ctx object to be used as this reference within fn
     * @return debounced version of fn
     */
    function debounce(quietMillis, fn, ctx) {
        ctx = ctx || undefined;
        var timeout;
        return function () {
            var args = arguments;
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function() {
                fn.apply(ctx, args);
            }, quietMillis);
        };
    }

    /**
     * A simple implementation of a thunk
     * @param formula function used to lazily initialize the thunk
     * @return {Function}
     */
    function thunk(formula) {
        var evaluated = false,
            value;
        return function() {
            if (evaluated === false) { value = formula(); evaluated = true; }
            return value;
        };
    };

    function installDebouncedScroll(threshold, element) {
        var notify = debounce(threshold, function (e) { element.trigger("scroll-debounced", e);});
        element.bind("scroll", function (e) {
            if (indexOf(e.target, element.get()) >= 0) notify(e);
        });
    }

    function focus($el) {
        if ($el[0] === document.activeElement) return;

        /* set the focus in a 0 timeout - that way the focus is set after the processing
            of the current event has finished - which seems like the only reliable way
            to set focus */
        window.setTimeout(function() {
            var el=$el[0], pos=$el.val().length, range;

            $el.focus();

            /* after the focus is set move the caret to the end, necessary when we val()
                just before setting focus */
            if(el.setSelectionRange)
            {
                el.setSelectionRange(pos, pos);
            }
            else if (el.createTextRange) {
                range = el.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }

        }, 0);
    }

    function killEvent(event) {
        event.preventDefault();
        event.stopPropagation();
    }
    function killEventImmediately(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    function measureTextWidth(e) {
        if (!sizer){
        	var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
        	sizer = $(document.createElement("div")).css({
	            position: "absolute",
	            left: "-10000px",
	            top: "-10000px",
	            display: "none",
	            fontSize: style.fontSize,
	            fontFamily: style.fontFamily,
	            fontStyle: style.fontStyle,
	            fontWeight: style.fontWeight,
	            letterSpacing: style.letterSpacing,
	            textTransform: style.textTransform,
	            whiteSpace: "nowrap"
	        });
            sizer.attr("class","select2-sizer");
        	$("body").append(sizer);
        }
        sizer.text(e.val());
        return sizer.width();
    }

    function syncCssClasses(dest, src, adapter) {
        var classes, replacements = [], adapted;

        classes = dest.attr("class");
        if (typeof classes === "string") {
            $(classes.split(" ")).each2(function() {
                if (this.indexOf("select2-") === 0) {
                    replacements.push(this);
                }
            });
        }
        classes = src.attr("class");
        if (typeof classes === "string") {
            $(classes.split(" ")).each2(function() {
                if (this.indexOf("select2-") !== 0) {
                    adapted = adapter(this);
                    if (typeof adapted === "string" && adapted.length > 0) {
                        replacements.push(this);
                    }
                }
            });
        }
        dest.attr("class", replacements.join(" "));
    }


    function markMatch(text, term, markup, escapeMarkup) {
        var match=text.toUpperCase().indexOf(term.toUpperCase()),
            tl=term.length;

        if (match<0) {
            markup.push(escapeMarkup(text));
            return;
        }

        markup.push(escapeMarkup(text.substring(0, match)));
        markup.push("<span class='select2-match'>");
        markup.push(escapeMarkup(text.substring(match, match + tl)));
        markup.push("</span>");
        markup.push(escapeMarkup(text.substring(match + tl, text.length)));
    }

    /**
     * Produces an ajax-based query function
     *
     * @param options object containing configuration paramters
     * @param options.transport function that will be used to execute the ajax request. must be compatible with parameters supported by $.ajax
     * @param options.url url for the data
     * @param options.data a function(searchTerm, pageNumber, context) that should return an object containing query string parameters for the above url.
     * @param options.dataType request data type: ajax, jsonp, other datatatypes supported by jQuery's $.ajax function or the transport function if specified
     * @param options.traditional a boolean flag that should be true if you wish to use the traditional style of param serialization for the ajax request
     * @param options.quietMillis (optional) milliseconds to wait before making the ajaxRequest, helps debounce the ajax function if invoked too often
     * @param options.results a function(remoteData, pageNumber) that converts data returned form the remote request to the format expected by Select2.
     *      The expected format is an object containing the following keys:
     *      results array of objects that will be used as choices
     *      more (optional) boolean indicating whether there are more results available
     *      Example: {results:[{id:1, text:'Red'},{id:2, text:'Blue'}], more:true}
     */
    function ajax(options) {
        var timeout, // current scheduled but not yet executed request
            requestSequence = 0, // sequence used to drop out-of-order responses
            handler = null,
            quietMillis = options.quietMillis || 100,
            ajaxUrl = options.url,
            self = this;

        return function (query) {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(function () {
                requestSequence += 1; // increment the sequence
                var requestNumber = requestSequence, // this request's sequence number
                    data = options.data, // ajax data function
                    url = ajaxUrl, // ajax url string or function
                    transport = options.transport || $.ajax,
                    type = options.type || 'GET', // set type of request (GET or POST)
                    params = {};

                data = data ? data.call(self, query.term, query.page, query.context) : null;
                url = (typeof url === 'function') ? url.call(self, query.term, query.page, query.context) : url;

                if( null !== handler) { handler.abort(); }

                if (options.params) {
                    if ($.isFunction(options.params)) {
                        $.extend(params, options.params.call(self));
                    } else {
                        $.extend(params, options.params);
                    }
                }

                $.extend(params, {
                    url: url,
                    dataType: options.dataType,
                    data: data,
                    type: type,
                    cache: false,
                    success: function (data) {
                        if (requestNumber < requestSequence) {
                            return;
                        }
                        // TODO - replace query.page with query so users have access to term, page, etc.
                        var results = options.results(data, query.page);
                        query.callback(results);
                    }
                });
                handler = transport.call(self, params);
            }, quietMillis);
        };
    }

    /**
     * Produces a query function that works with a local array
     *
     * @param options object containing configuration parameters. The options parameter can either be an array or an
     * object.
     *
     * If the array form is used it is assumed that it contains objects with 'id' and 'text' keys.
     *
     * If the object form is used ti is assumed that it contains 'data' and 'text' keys. The 'data' key should contain
     * an array of objects that will be used as choices. These objects must contain at least an 'id' key. The 'text'
     * key can either be a String in which case it is expected that each element in the 'data' array has a key with the
     * value of 'text' which will be used to match choices. Alternatively, text can be a function(item) that can extract
     * the text.
     */
    function local(options) {
        var data = options, // data elements
            dataText,
            tmp,
            text = function (item) { return ""+item.text; }; // function used to retrieve the text portion of a data item that is matched against the search

		 if ($.isArray(data)) {
            tmp = data;
            data = { results: tmp };
        }

		 if ($.isFunction(data) === false) {
            tmp = data;
            data = function() { return tmp; };
        }

        var dataItem = data();
        if (dataItem.text) {
            text = dataItem.text;
            // if text is not a function we assume it to be a key name
            if (!$.isFunction(text)) {
                dataText = data.text; // we need to store this in a separate variable because in the next step data gets reset and data.text is no longer available
                text = function (item) { return item[dataText]; };
            }
        }

        return function (query) {
            var t = query.term, filtered = { results: [] }, process;
            if (t === "") {
                query.callback(data());
                return;
            }

            process = function(datum, collection) {
                var group, attr;
                datum = datum[0];
                if (datum.children) {
                    group = {};
                    for (attr in datum) {
                        if (datum.hasOwnProperty(attr)) group[attr]=datum[attr];
                    }
                    group.children=[];
                    $(datum.children).each2(function(i, childDatum) { process(childDatum, group.children); });
                    if (group.children.length || query.matcher(t, text(group), datum)) {
                        collection.push(group);
                    }
                } else {
                    if (query.matcher(t, text(datum), datum)) {
                        collection.push(datum);
                    }
                }
            };

            $(data().results).each2(function(i, datum) { process(datum, filtered.results); });
            query.callback(filtered);
        };
    }

    // TODO javadoc
    function tags(data) {
        var isFunc = $.isFunction(data);
        return function (query) {
            var t = query.term, filtered = {results: []};
            $(isFunc ? data() : data).each(function () {
                var isObject = this.text !== undefined,
                    text = isObject ? this.text : this;
                if (t === "" || query.matcher(t, text)) {
                    filtered.results.push(isObject ? this : {id: this, text: this});
                }
            });
            query.callback(filtered);
        };
    }

    /**
     * Checks if the formatter function should be used.
     *
     * Throws an error if it is not a function. Returns true if it should be used,
     * false if no formatting should be performed.
     *
     * @param formatter
     */
    function checkFormatter(formatter, formatterName) {
        if ($.isFunction(formatter)) return true;
        if (!formatter) return false;
        throw new Error("formatterName must be a function or a falsy value");
    }

    function evaluate(val) {
        return $.isFunction(val) ? val() : val;
    }

    function countResults(results) {
        var count = 0;
        $.each(results, function(i, item) {
            if (item.children) {
                count += countResults(item.children);
            } else {
                count++;
            }
        });
        return count;
    }

    /**
     * Default tokenizer. This function uses breaks the input on substring match of any string from the
     * opts.tokenSeparators array and uses opts.createSearchChoice to create the choice object. Both of those
     * two options have to be defined in order for the tokenizer to work.
     *
     * @param input text user has typed so far or pasted into the search field
     * @param selection currently selected choices
     * @param selectCallback function(choice) callback tho add the choice to selection
     * @param opts select2's opts
     * @return undefined/null to leave the current input unchanged, or a string to change the input to the returned value
     */
    function defaultTokenizer(input, selection, selectCallback, opts) {
        var original = input, // store the original so we can compare and know if we need to tell the search to update its text
            dupe = false, // check for whether a token we extracted represents a duplicate selected choice
            token, // token
            index, // position at which the separator was found
            i, l, // looping variables
            separator; // the matched separator

        if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;

        while (true) {
            index = -1;

            for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
                separator = opts.tokenSeparators[i];
                index = input.indexOf(separator);
                if (index >= 0) break;
            }

            if (index < 0) break; // did not find any token separator in the input string, bail

            token = input.substring(0, index);
            input = input.substring(index + separator.length);

            if (token.length > 0) {
                token = opts.createSearchChoice(token, selection);
                if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
                    dupe = false;
                    for (i = 0, l = selection.length; i < l; i++) {
                        if (equal(opts.id(token), opts.id(selection[i]))) {
                            dupe = true; break;
                        }
                    }

                    if (!dupe) selectCallback(token);
                }
            }
        }

        if (original!==input) return input;
    }

    /**
     * Creates a new class
     *
     * @param superClass
     * @param methods
     */
    function clazz(SuperClass, methods) {
        var constructor = function () {};
        constructor.prototype = new SuperClass;
        constructor.prototype.constructor = constructor;
        constructor.prototype.parent = SuperClass.prototype;
        constructor.prototype = $.extend(constructor.prototype, methods);
        return constructor;
    }

    AbstractSelect2 = clazz(Object, {

        // abstract
        bind: function (func) {
            var self = this;
            return function () {
                func.apply(self, arguments);
            };
        },

        // abstract
        init: function (opts) {
            var results, search, resultsSelector = ".select2-results", mask;

            // prepare options
            this.opts = opts = this.prepareOpts(opts);

            this.id=opts.id;

            // destroy if called on an existing component
            if (opts.element.data("select2") !== undefined &&
                opts.element.data("select2") !== null) {
                this.destroy();
            }

            this.enabled=true;
            this.container = this.createContainer();

            this.containerId="s2id_"+(opts.element.attr("id") || "autogen"+nextUid());
            this.containerSelector="#"+this.containerId.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
            this.container.attr("id", this.containerId);

            // cache the body so future lookups are cheap
            this.body = thunk(function() { return opts.element.closest("body"); });

            syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);

            this.container.css(evaluate(opts.containerCss));
            this.container.addClass(evaluate(opts.containerCssClass));

            this.elementTabIndex = this.opts.element.attr("tabIndex");

            // swap container for the element
            this.opts.element
                .data("select2", this)
                .addClass("select2-offscreen")
                .bind("focus.select2", function() { $(this).select2("focus"); })
                .attr("tabIndex", "-1")
                .before(this.container);
            this.container.data("select2", this);

            this.dropdown = this.container.find(".select2-drop");
            this.dropdown.addClass(evaluate(opts.dropdownCssClass));
            this.dropdown.data("select2", this);

            this.results = results = this.container.find(resultsSelector);
            this.search = search = this.container.find("input.select2-input");

            search.attr("tabIndex", this.elementTabIndex);

            this.resultsPage = 0;
            this.context = null;

            // initialize the container
            this.initContainer();

            installFilteredMouseMove(this.results);
            this.dropdown.delegate(resultsSelector, "mousemove-filtered touchstart touchmove touchend", this.bind(this.highlightUnderEvent));

            installDebouncedScroll(80, this.results);
            this.dropdown.delegate(resultsSelector, "scroll-debounced", this.bind(this.loadMoreIfNeeded));

            // if jquery.mousewheel plugin is installed we can prevent out-of-bounds scrolling of results via mousewheel
            if ($.fn.mousewheel) {
                results.mousewheel(function (e, delta, deltaX, deltaY) {
                    var top = results.scrollTop(), height;
                    if (deltaY > 0 && top - deltaY <= 0) {
                        results.scrollTop(0);
                        killEvent(e);
                    } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {
                        results.scrollTop(results.get(0).scrollHeight - results.height());
                        killEvent(e);
                    }
                });
            }

            installKeyUpChangeEvent(search);
            search.bind("keyup-change input paste", this.bind(this.updateResults));
            search.bind("focus", function () { search.addClass("select2-focused"); });
            search.bind("blur", function () { search.removeClass("select2-focused");});

            this.dropdown.delegate(resultsSelector, "mouseup", this.bind(function (e) {
                if ($(e.target).closest(".select2-result-selectable").length > 0) {
                    this.highlightUnderEvent(e);
                    this.selectHighlighted(e);
                }
            }));

            // trap all mouse events from leaving the dropdown. sometimes there may be a modal that is listening
            // for mouse events outside of itself so it can close itself. since the dropdown is now outside the select2's
            // dom it will trigger the popup close, which is not what we want
            this.dropdown.bind("click mouseup mousedown", function (e) { e.stopPropagation(); });

            if ($.isFunction(this.opts.initSelection)) {
                // initialize selection based on the current value of the source element
                this.initSelection();

                // if the user has provided a function that can set selection based on the value of the source element
                // we monitor the change event on the element and trigger it, allowing for two way synchronization
                this.monitorSource();
            }

            if (opts.element.is(":disabled") || opts.element.is("[readonly='readonly']")) this.disable();
        },

        // abstract
        destroy: function () {
            var select2 = this.opts.element.data("select2");

            if (this.propertyObserver) { delete this.propertyObserver; this.propertyObserver = null; }

            if (select2 !== undefined) {

                select2.container.remove();
                select2.dropdown.remove();
                select2.opts.element
                    .removeClass("select2-offscreen")
                    .removeData("select2")
                    .unbind(".select2")
                    .attr({"tabIndex": this.elementTabIndex})
                    .show();
            }
        },

        // abstract
        prepareOpts: function (opts) {
            var element, select, idKey, ajaxUrl;

            element = opts.element;

            if (element.get(0).tagName.toLowerCase() === "select") {
                this.select = select = opts.element;
            }

            if (select) {
                // these options are not allowed when attached to a select because they are picked up off the element itself
                $.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function () {
                    if (this in opts) {
                        throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.");
                    }
                });
            }

            opts = $.extend({}, {
                populateResults: function(container, results, query) {
                    var populate,  data, result, children, id=this.opts.id, self=this;

                    populate=function(results, container, depth) {

                        var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;

                        results = opts.sortResults(results, container, query);

                        for (i = 0, l = results.length; i < l; i = i + 1) {

                            result=results[i];

                            disabled = (result.disabled === true);
                            selectable = (!disabled) && (id(result) !== undefined);

                            compound=result.children && result.children.length > 0;

                            node=$("<li></li>");
                            node.addClass("select2-results-dept-"+depth);
                            node.addClass("select2-result");
                            node.addClass(selectable ? "select2-result-selectable" : "select2-result-unselectable");
                            if (disabled) { node.addClass("select2-disabled"); }
                            if (compound) { node.addClass("select2-result-with-children"); }
                            node.addClass(self.opts.formatResultCssClass(result));

                            label=$(document.createElement("div"));
                            label.addClass("select2-result-label");

                            formatted=opts.formatResult(result, label, query, self.opts.escapeMarkup);
                            if (formatted!==undefined) {
                                label.html(formatted);
                            }

                            node.append(label);

                            if (compound) {

                                innerContainer=$("<ul></ul>");
                                innerContainer.addClass("select2-result-sub");
                                populate(result.children, innerContainer, depth+1);
                                node.append(innerContainer);
                            }

                            node.data("select2-data", result);
                            container.append(node);
                        }
                    };

                    populate(results, container, 0);
                }
            }, $.fn.select2.defaults, opts);

            if (typeof(opts.id) !== "function") {
                idKey = opts.id;
                opts.id = function (e) { return e[idKey]; };
            }

            if ($.isArray(opts.element.data("select2Tags"))) {
                if ("tags" in opts) {
                    throw "tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + opts.element.attr("id");
                }
                opts.tags=opts.element.attr("data-select2-tags");
            }

            if (select) {
                opts.query = this.bind(function (query) {
                    var data = { results: [], more: false },
                        term = query.term,
                        children, firstChild, process;

                    process=function(element, collection) {
                        var group;
                        if (element.is("option")) {
                            if (query.matcher(term, element.text(), element)) {
                                collection.push({id:element.attr("value"), text:element.text(), element: element.get(), css: element.attr("class"), disabled: equal(element.attr("disabled"), "disabled") });
                            }
                        } else if (element.is("optgroup")) {
                            group={text:element.attr("label"), children:[], element: element.get(), css: element.attr("class")};
                            element.children().each2(function(i, elm) { process(elm, group.children); });
                            if (group.children.length>0) {
                                collection.push(group);
                            }
                        }
                    };

                    children=element.children();

                    // ignore the placeholder option if there is one
                    if (this.getPlaceholder() !== undefined && children.length > 0) {
                        firstChild = children[0];
                        if ($(firstChild).text() === "") {
                            children=children.not(firstChild);
                        }
                    }

                    children.each2(function(i, elm) { process(elm, data.results); });

                    query.callback(data);
                });
                // this is needed because inside val() we construct choices from options and there id is hardcoded
                opts.id=function(e) { return e.id; };
                opts.formatResultCssClass = function(data) { return data.css; };
            } else {
                if (!("query" in opts)) {

                    if ("ajax" in opts) {
                        ajaxUrl = opts.element.data("ajax-url");
                        if (ajaxUrl && ajaxUrl.length > 0) {
                            opts.ajax.url = ajaxUrl;
                        }
                        opts.query = ajax.call(opts.element, opts.ajax);
                    } else if ("data" in opts) {
                        opts.query = local(opts.data);
                    } else if ("tags" in opts) {
                        opts.query = tags(opts.tags);
                        if (opts.createSearchChoice === undefined) {
                            opts.createSearchChoice = function (term) { return {id: term, text: term}; };
                        }
                        if (opts.initSelection === undefined) {
                            opts.initSelection = function (element, callback) {
                                var data = [];
                                $(splitVal(element.val(), opts.separator)).each(function () {
                                    var id = this, text = this, tags=opts.tags;
                                    if ($.isFunction(tags)) tags=tags();
                                    $(tags).each(function() { if (equal(this.id, id)) { text = this.text; return false; } });
                                    data.push({id: id, text: text});
                                });

                                callback(data);
                            };
                        }
                    }
                }
            }
            if (typeof(opts.query) !== "function") {
                throw "query function not defined for Select2 " + opts.element.attr("id");
            }

            return opts;
        },

        /**
         * Monitor the original element for changes and update select2 accordingly
         */
        // abstract
        monitorSource: function () {
            var el = this.opts.element, sync;

            el.bind("change.select2", this.bind(function (e) {
                if (this.opts.element.data("select2-change-triggered") !== true) {
                    this.initSelection();
                }
            }));

            sync = this.bind(function () {

                var enabled, readonly, self = this;

                // sync enabled state

                enabled = this.opts.element.attr("disabled") !== "disabled";
                readonly = this.opts.element.attr("readonly") === "readonly";

                enabled = enabled && !readonly;

                if (this.enabled !== enabled) {
                    if (enabled) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                }


                syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
                this.container.addClass(evaluate(this.opts.containerCssClass));

                syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
                this.dropdown.addClass(evaluate(this.opts.dropdownCssClass));

            });

            // mozilla and IE
            el.bind("propertychange.select2 DOMAttrModified.select2", sync);
            // safari and chrome
            if (typeof WebKitMutationObserver !== "undefined") {
                if (this.propertyObserver) { delete this.propertyObserver; this.propertyObserver = null; }
                this.propertyObserver = new WebKitMutationObserver(function (mutations) {
                    mutations.forEach(sync);
                });
                this.propertyObserver.observe(el.get(0), { attributes:true, subtree:false });
            }
        },

        /**
         * Triggers the change event on the source element
         */
        // abstract
        triggerChange: function (details) {

            details = details || {};
            details= $.extend({}, details, { type: "change", val: this.val() });
            // prevents recursive triggering
            this.opts.element.data("select2-change-triggered", true);
            this.opts.element.trigger(details);
            this.opts.element.data("select2-change-triggered", false);

            // some validation frameworks ignore the change event and listen instead to keyup, click for selects
            // so here we trigger the click event manually
            this.opts.element.click();

            // ValidationEngine ignorea the change event and listens instead to blur
            // so here we trigger the blur event manually if so desired
            if (this.opts.blurOnChange)
                this.opts.element.blur();
        },

        // abstract
        enable: function() {
            if (this.enabled) return;

            this.enabled=true;
            this.container.removeClass("select2-container-disabled");
            this.opts.element.removeAttr("disabled");
        },

        // abstract
        disable: function() {
            if (!this.enabled) return;

            this.close();

            this.enabled=false;
            this.container.addClass("select2-container-disabled");
            this.opts.element.attr("disabled", "disabled");
        },

        // abstract
        opened: function () {
            return this.container.hasClass("select2-dropdown-open");
        },

        // abstract
        positionDropdown: function() {
            var offset = this.container.offset(),
                height = this.container.outerHeight(false),
                width = this.container.outerWidth(false),
                dropHeight = this.dropdown.outerHeight(false),
	            viewPortRight = $(window).scrollLeft() + $(window).width(),
                viewportBottom = $(window).scrollTop() + $(window).height(),
                dropTop = offset.top + height,
                dropLeft = offset.left,
                enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
                enoughRoomAbove = (offset.top - dropHeight) >= this.body().scrollTop(),
	            dropWidth = this.dropdown.outerWidth(false),
	            enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight,
                aboveNow = this.dropdown.hasClass("select2-drop-above"),
                bodyOffset,
                above,
                css;

            //console.log("below/ droptop:", dropTop, "dropHeight", dropHeight, "sum", (dropTop+dropHeight)+" viewport bottom", viewportBottom, "enough?", enoughRoomBelow);
            //console.log("above/ offset.top", offset.top, "dropHeight", dropHeight, "top", (offset.top-dropHeight), "scrollTop", this.body().scrollTop(), "enough?", enoughRoomAbove);

            // fix positioning when body has an offset and is not position: static

            if (this.body().css('position') !== 'static') {
                bodyOffset = this.body().offset();
                dropTop -= bodyOffset.top;
                dropLeft -= bodyOffset.left;
            }

            // always prefer the current above/below alignment, unless there is not enough room

            if (aboveNow) {
                above = true;
                if (!enoughRoomAbove && enoughRoomBelow) above = false;
            } else {
                above = false;
                if (!enoughRoomBelow && enoughRoomAbove) above = true;
            }

            if (!enoughRoomOnRight) {
               dropLeft = offset.left + width - dropWidth;
            }

            if (above) {
                dropTop = offset.top - dropHeight;
                this.container.addClass("select2-drop-above");
                this.dropdown.addClass("select2-drop-above");
            }
            else {
                this.container.removeClass("select2-drop-above");
                this.dropdown.removeClass("select2-drop-above");
            }

            css = $.extend({
                top: dropTop,
                left: dropLeft,
                width: width
            }, evaluate(this.opts.dropdownCss));

            this.dropdown.css(css);
        },

        // abstract
        shouldOpen: function() {
            var event;

            if (this.opened()) return false;

            event = $.Event("opening");
            this.opts.element.trigger(event);
            return !event.isDefaultPrevented();
        },

        // abstract
        clearDropdownAlignmentPreference: function() {
            // clear the classes used to figure out the preference of where the dropdown should be opened
            this.container.removeClass("select2-drop-above");
            this.dropdown.removeClass("select2-drop-above");
        },

        /**
         * Opens the dropdown
         *
         * @return {Boolean} whether or not dropdown was opened. This method will return false if, for example,
         * the dropdown is already open, or if the 'open' event listener on the element called preventDefault().
         */
        // abstract
        open: function () {

            if (!this.shouldOpen()) return false;

            window.setTimeout(this.bind(this.opening), 1);

            return true;
        },

        /**
         * Performs the opening of the dropdown
         */
        // abstract
        opening: function() {
            var cid = this.containerId,
                scroll = "scroll." + cid,
                resize = "resize."+cid,
                orient = "orientationchange."+cid,
                mask;

            this.clearDropdownAlignmentPreference();

            this.container.addClass("select2-dropdown-open").addClass("select2-container-active");


            if(this.dropdown[0] !== this.body().children().last()[0]) {
                this.dropdown.detach().appendTo(this.body());
            }

            this.updateResults(true);

            // create the dropdown mask if doesnt already exist
            mask = $("#select2-drop-mask");
            if (mask.length == 0) {
                mask = $(document.createElement("div"));
                mask.attr("id","select2-drop-mask").attr("class","select2-drop-mask");
                mask.hide();
                mask.appendTo(this.body());
                mask.bind("mousedown touchstart", function (e) {
                    var dropdown = $("#select2-drop"), self;
                    if (dropdown.length > 0) {
                        self=dropdown.data("select2");
                        if (self.opts.selectOnBlur) {
                            self.selectHighlighted({noFocus: true});
                        }
                        self.close();
                    }
                });
            }

            // ensure the mask is always right before the dropdown
            if (this.dropdown.prev()[0] !== mask[0]) {
                this.dropdown.before(mask);
            }

            // move the global id to the correct dropdown
            $("#select2-drop").removeAttr("id");
            this.dropdown.attr("id", "select2-drop");

            // show the elements
            mask.css({
                width: document.documentElement.scrollWidth,
                height: document.documentElement.scrollHeight});
            mask.show();
            this.dropdown.show();
            this.positionDropdown();

            this.dropdown.addClass("select2-drop-active");
            this.ensureHighlightVisible();

            // attach listeners to events that can change the position of the container and thus require
            // the position of the dropdown to be updated as well so it does not come unglued from the container
            var that = this;
            this.container.parents().add(window).each(function () {
                $(this).bind(resize+" "+scroll+" "+orient, function (e) {
                    $("#select2-drop-mask").css({
                        width:document.documentElement.scrollWidth,
                        height:document.documentElement.scrollHeight});
                    that.positionDropdown();
                });
            });

            this.focusSearch();
        },

        // abstract
        close: function () {
            if (!this.opened()) return;

            var cid = this.containerId,
                scroll = "scroll." + cid,
                resize = "resize."+cid,
                orient = "orientationchange."+cid;

            // unbind event listeners
            this.container.parents().add(window).each(function () { $(this).unbind(scroll).unbind(resize).unbind(orient); });

            this.clearDropdownAlignmentPreference();

            $("#select2-drop-mask").hide();
            this.dropdown.removeAttr("id"); // only the active dropdown has the select2-drop id
            this.dropdown.hide();
            this.container.removeClass("select2-dropdown-open");
            this.results.empty();
            this.clearSearch();

            this.opts.element.trigger($.Event("close"));
        },

        // abstract
        clearSearch: function () {

        },

        //abstract
        getMaximumSelectionSize: function() {
            return evaluate(this.opts.maximumSelectionSize);
        },

        // abstract
        ensureHighlightVisible: function () {
            var results = this.results, children, index, child, hb, rb, y, more;

            index = this.highlight();

            if (index < 0) return;

            if (index == 0) {

                // if the first element is highlighted scroll all the way to the top,
                // that way any unselectable headers above it will also be scrolled
                // into view

                results.scrollTop(0);
                return;
            }

            children = this.findHighlightableChoices();

            child = $(children[index]);

            hb = child.offset().top + child.outerHeight(true);

            // if this is the last child lets also make sure select2-more-results is visible
            if (index === children.length - 1) {
                more = results.find("li.select2-more-results");
                if (more.length > 0) {
                    hb = more.offset().top + more.outerHeight(true);
                }
            }

            rb = results.offset().top + results.outerHeight(true);
            if (hb > rb) {
                results.scrollTop(results.scrollTop() + (hb - rb));
            }
            y = child.offset().top - results.offset().top;

            // make sure the top of the element is visible
            if (y < 0 && child.css('display') != 'none' ) {
                results.scrollTop(results.scrollTop() + y); // y is negative
            }
        },

        // abstract
        findHighlightableChoices: function() {
            var h=this.results.find(".select2-result-selectable:not(.select2-selected):not(.select2-disabled)");
            return this.results.find(".select2-result-selectable:not(.select2-selected):not(.select2-disabled)");
        },

        // abstract
        moveHighlight: function (delta) {
            var choices = this.findHighlightableChoices(),
                index = this.highlight();

            while (index > -1 && index < choices.length) {
                index += delta;
                var choice = $(choices[index]);
                if (choice.hasClass("select2-result-selectable") && !choice.hasClass("select2-disabled") && !choice.hasClass("select2-selected")) {
                    this.highlight(index);
                    break;
                }
            }
        },

        // abstract
        highlight: function (index) {
            var choices = this.findHighlightableChoices(),
                choice,
                data;

            if (arguments.length === 0) {
                return indexOf(choices.filter(".select2-highlighted")[0], choices.get());
            }

            if (index >= choices.length) index = choices.length - 1;
            if (index < 0) index = 0;

            this.results.find(".select2-highlighted").removeClass("select2-highlighted");

            choice = $(choices[index]);
            choice.addClass("select2-highlighted");

            this.ensureHighlightVisible();

            data = choice.data("select2-data");
            if (data) {
                this.opts.element.trigger({ type: "highlight", val: this.id(data), choice: data });
            }
        },

        // abstract
        countSelectableResults: function() {
            return this.findHighlightableChoices().length;
        },

        // abstract
        highlightUnderEvent: function (event) {
            var el = $(event.target).closest(".select2-result-selectable");
            if (el.length > 0 && !el.is(".select2-highlighted")) {
        		var choices = this.findHighlightableChoices();
                this.highlight(choices.index(el));
            } else if (el.length == 0) {
                // if we are over an unselectable item remove al highlights
                this.results.find(".select2-highlighted").removeClass("select2-highlighted");
            }
        },

        // abstract
        loadMoreIfNeeded: function () {
            var results = this.results,
                more = results.find("li.select2-more-results"),
                below, // pixels the element is below the scroll fold, below==0 is when the element is starting to be visible
                offset = -1, // index of first element without data
                page = this.resultsPage + 1,
                self=this,
                term=this.search.val(),
                context=this.context;

            if (more.length === 0) return;
            below = more.offset().top - results.offset().top - results.height();

            if (below <= this.opts.loadMorePadding) {
                more.addClass("select2-active");
                this.opts.query({
                        element: this.opts.element,
                        term: term,
                        page: page,
                        context: context,
                        matcher: this.opts.matcher,
                        callback: this.bind(function (data) {

                    // ignore a response if the select2 has been closed before it was received
                    if (!self.opened()) return;


                    self.opts.populateResults.call(this, results, data.results, {term: term, page: page, context:context});

                    if (data.more===true) {
                        more.detach().appendTo(results).text(self.opts.formatLoadMore(page+1));
                        window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);
                    } else {
                        more.remove();
                    }
                    self.positionDropdown();
                    self.resultsPage = page;
                    self.context = data.context;
                })});
            }
        },

        /**
         * Default tokenizer function which does nothing
         */
        tokenize: function() {

        },

        /**
         * @param initial whether or not this is the call to this method right after the dropdown has been opened
         */
        // abstract
        updateResults: function (initial) {
            var search = this.search, results = this.results, opts = this.opts, data, self=this, input;

            // if the search is currently hidden we do not alter the results
            if (initial !== true && (this.showSearchInput === false || !this.opened())) {
                return;
            }

            search.addClass("select2-active");

            function postRender() {
                results.scrollTop(0);
                search.removeClass("select2-active");
                self.positionDropdown();
            }

            function render(html) {
                results.html(html);
                postRender();
            }

            var maxSelSize = this.getMaximumSelectionSize();
            if (maxSelSize >=1) {
                data = this.data();
                if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, "formatSelectionTooBig")) {
            	    render("<li class='select2-selection-limit'>" + opts.formatSelectionTooBig(maxSelSize) + "</li>");
            	    return;
                }
            }

            if (search.val().length < opts.minimumInputLength) {
                if (checkFormatter(opts.formatInputTooShort, "formatInputTooShort")) {
                    render("<li class='select2-no-results'>" + opts.formatInputTooShort(search.val(), opts.minimumInputLength) + "</li>");
                } else {
                    render("");
                }
                return;
            }
            else if (opts.formatSearching() && initial===true) {
                render("<li class='select2-searching'>" + opts.formatSearching() + "</li>");
            }

            if (opts.maximumInputLength && search.val().length > opts.maximumInputLength) {
                if (checkFormatter(opts.formatInputTooLong, "formatInputTooLong")) {
                    render("<li class='select2-no-results'>" + opts.formatInputTooLong(search.val(), opts.maximumInputLength) + "</li>");
                } else {
                    render("");
                }
                return;
            }

            // give the tokenizer a chance to pre-process the input
            input = this.tokenize();
            if (input != undefined && input != null) {
                search.val(input);
            }

            this.resultsPage = 1;

            opts.query({
                element: opts.element,
                    term: search.val(),
                    page: this.resultsPage,
                    context: null,
                    matcher: opts.matcher,
                    callback: this.bind(function (data) {
                var def; // default choice

                // ignore a response if the select2 has been closed before it was received
                if (!this.opened()) return;

                // save context, if any
                this.context = (data.context===undefined) ? null : data.context;
                // create a default choice and prepend it to the list
                if (this.opts.createSearchChoice && search.val() !== "") {
                    def = this.opts.createSearchChoice.call(null, search.val(), data.results);
                    if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null) {
                        if ($(data.results).filter(
                            function () {
                                return equal(self.id(this), self.id(def));
                            }).length === 0) {
                            data.results.unshift(def);
                        }
                    }
                }

                if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, "formatNoMatches")) {
                    render("<li class='select2-no-results'>" + opts.formatNoMatches(search.val()) + "</li>");
                    return;
                }

                results.empty();
                self.opts.populateResults.call(this, results, data.results, {term: search.val(), page: this.resultsPage, context:null});

                if (data.more === true && checkFormatter(opts.formatLoadMore, "formatLoadMore")) {
                    results.append("<li class='select2-more-results'>" + self.opts.escapeMarkup(opts.formatLoadMore(this.resultsPage)) + "</li>");
                    window.setTimeout(function() { self.loadMoreIfNeeded(); }, 10);
                }

                this.postprocessResults(data, initial);

                postRender();
            })});
        },

        // abstract
        cancel: function () {
            this.close();
        },

        // abstract
        blur: function () {
            // if selectOnBlur == true, select the currently highlighted option
            if (this.opts.selectOnBlur)
                this.selectHighlighted({noFocus: true});

            this.close();
            this.container.removeClass("select2-container-active");
            // synonymous to .is(':focus'), which is available in jquery >= 1.6
            if (this.search[0] === document.activeElement) { this.search.blur(); }
            this.clearSearch();
            this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
        },

        // abstract
        focusSearch: function () {
            focus(this.search);
        },

        // abstract
        selectHighlighted: function (options) {
            var index=this.highlight(),
                highlighted=this.results.find(".select2-highlighted"),
                data = highlighted.closest('.select2-result').data("select2-data");

            if (data) {
                this.highlight(index);
                this.onSelect(data, options);
            }
        },

        // abstract
        getPlaceholder: function () {
            return this.opts.element.attr("placeholder") ||
                this.opts.element.attr("data-placeholder") || // jquery 1.4 compat
                this.opts.element.data("placeholder") ||
                this.opts.placeholder;
        },

        /**
         * Get the desired width for the container element.  This is
         * derived first from option `width` passed to select2, then
         * the inline 'style' on the original element, and finally
         * falls back to the jQuery calculated element width.
         */
        // abstract
        initContainerWidth: function () {
            function resolveContainerWidth() {
                var style, attrs, matches, i, l;

                if (this.opts.width === "off") {
                    return null;
                } else if (this.opts.width === "element"){
                    return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px';
                } else if (this.opts.width === "copy" || this.opts.width === "resolve") {
                    // check if there is inline style on the element that contains width
                    style = this.opts.element.attr('style');
                    if (style !== undefined) {
                        attrs = style.split(';');
                        for (i = 0, l = attrs.length; i < l; i = i + 1) {
                            matches = attrs[i].replace(/\s/g, '')
                                .match(/width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/);
                            if (matches !== null && matches.length >= 1)
                                return matches[1];
                        }
                    }

                    if (this.opts.width === "resolve") {
                        // next check if css('width') can resolve a width that is percent based, this is sometimes possible
                        // when attached to input type=hidden or elements hidden via css
                        style = this.opts.element.css('width');
                        if (style.indexOf("%") > 0) return style;

                        // finally, fallback on the calculated width of the element
                        return (this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px');
                    }

                    return null;
                } else if ($.isFunction(this.opts.width)) {
                    return this.opts.width();
                } else {
                    return this.opts.width;
               }
            };

            var width = resolveContainerWidth.call(this);
            if (width !== null) {
                this.container.css("width", width);
            }
        }
    });

    SingleSelect2 = clazz(AbstractSelect2, {

        // single

		createContainer: function () {
            var container = $(document.createElement("div")).attr({
                "class": "select2-container"
            }).html([
                "<a href='javascript:void(0)' onclick='return false;' class='select2-choice' tabindex='-1'>",
                "   <span></span><abbr class='select2-search-choice-close' style='display:none;'></abbr>",
                "   <div><b></b></div>" ,
                "</a>",
                "<input class='select2-focusser select2-offscreen' type='text'/>",
                "<div class='select2-drop' style='display:none'>" ,
                "   <div class='select2-search'>" ,
                "       <input type='text' autocomplete='off' class='select2-input'/>" ,
                "   </div>" ,
                "   <ul class='select2-results'>" ,
                "   </ul>" ,
                "</div>"].join(""));
            return container;
        },

        // single
        disable: function() {
            if (!this.enabled) return;

            this.parent.disable.apply(this, arguments);

            this.focusser.attr("disabled", "disabled");
        },

        // single
        enable: function() {
            if (this.enabled) return;

            this.parent.enable.apply(this, arguments);

            this.focusser.removeAttr("disabled");
        },

        // single
        opening: function () {
            this.parent.opening.apply(this, arguments);
            this.focusser.attr("disabled", "disabled");

            this.opts.element.trigger($.Event("open"));
        },

        // single
        close: function () {
            if (!this.opened()) return;
            this.parent.close.apply(this, arguments);
            this.focusser.removeAttr("disabled");
            focus(this.focusser);
        },

        // single
        focus: function () {
            if (this.opened()) {
                this.close();
            } else {
                this.focusser.removeAttr("disabled");
                this.focusser.focus();
            }
        },

        // single
        isFocused: function () {
            return this.container.hasClass("select2-container-active");
        },

        // single
        cancel: function () {
            this.parent.cancel.apply(this, arguments);
            this.focusser.removeAttr("disabled");
            this.focusser.focus();
        },

        // single
        initContainer: function () {

            var selection,
                container = this.container,
                dropdown = this.dropdown,
                clickingInside = false;

            this.showSearch(this.opts.minimumResultsForSearch >= 0);

            this.selection = selection = container.find(".select2-choice");

            this.focusser = container.find(".select2-focusser");

            this.search.bind("keydown", this.bind(function (e) {
                if (!this.enabled) return;

                if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
                    // prevent the page from scrolling
                    killEvent(e);
                    return;
                }

                switch (e.which) {
                    case KEY.UP:
                    case KEY.DOWN:
                        this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                        killEvent(e);
                        return;
                    case KEY.TAB:
                    case KEY.ENTER:
                        this.selectHighlighted();
                        killEvent(e);
                        return;
                    case KEY.ESC:
                        this.cancel(e);
                        killEvent(e);
                        return;
                }
            }));

            this.focusser.bind("keydown", this.bind(function (e) {
                if (!this.enabled) return;

                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC) {
                    return;
                }

                if (this.opts.openOnEnter === false && e.which === KEY.ENTER) {
                    killEvent(e);
                    return;
                }

                if (e.which == KEY.DOWN || e.which == KEY.UP
                    || (e.which == KEY.ENTER && this.opts.openOnEnter)) {
                    this.open();
                    killEvent(e);
                    return;
                }

                if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE) {
                    if (this.opts.allowClear) {
                        this.clear();
                    }
                    killEvent(e);
                    return;
                }
            }));


            installKeyUpChangeEvent(this.focusser);
            this.focusser.bind("keyup-change input", this.bind(function(e) {
                if (this.opened()) return;
                this.open();
                if (this.showSearchInput !== false) {
                    this.search.val(this.focusser.val());
                }
                this.focusser.val("");
                killEvent(e);
            }));

            selection.delegate("abbr", "mousedown", this.bind(function (e) {
                if (!this.enabled) return;
                this.clear();
                killEventImmediately(e);
                this.close();
                this.selection.focus();
            }));

            selection.bind("mousedown", this.bind(function (e) {
                clickingInside = true;

                if (this.opened()) {
                    this.close();
                } else if (this.enabled) {
                    this.open();
                }

                killEvent(e);

                clickingInside = false;
            }));

            dropdown.bind("mousedown", this.bind(function() { this.search.focus(); }));

            selection.bind("focus", this.bind(function(e) {
                killEvent(e);
            }));

            this.focusser.bind("focus", this.bind(function(){
                this.container.addClass("select2-container-active");
            })).bind("blur", this.bind(function() {
                if (!this.opened()) {
                    this.container.removeClass("select2-container-active");
                }
            }));
            this.search.bind("focus", this.bind(function(){
                this.container.addClass("select2-container-active");
            }))

            this.initContainerWidth();
            this.setPlaceholder();

        },

        // single
        clear: function() {
            var data=this.selection.data("select2-data");
            this.opts.element.val("");
            this.selection.find("span").empty();
            this.selection.removeData("select2-data");
            this.setPlaceholder();

            this.opts.element.trigger({ type: "removed", val: this.id(data), choice: data });
            this.triggerChange({removed:data});
        },

        /**
         * Sets selection based on source element's value
         */
        // single
        initSelection: function () {
            var selected;
            if (this.opts.element.val() === "" && this.opts.element.text() === "") {
                this.close();
                this.setPlaceholder();
            } else {
                var self = this;
                this.opts.initSelection.call(null, this.opts.element, function(selected){
                    if (selected !== undefined && selected !== null) {
                        self.updateSelection(selected);
                        self.close();
                        self.setPlaceholder();
                    }
                });
            }
        },

        // single
        prepareOpts: function () {
            var opts = this.parent.prepareOpts.apply(this, arguments);

            if (opts.element.get(0).tagName.toLowerCase() === "select") {
                // install the selection initializer
                opts.initSelection = function (element, callback) {
                    var selected = element.find(":selected");
                    // a single select box always has a value, no need to null check 'selected'
                    if ($.isFunction(callback))
                        callback({id: selected.attr("value"), text: selected.text(), element:selected});
                };
            } else if ("data" in opts) {
                // install default initSelection when applied to hidden input and data is local
                opts.initSelection = opts.initSelection || function (element, callback) {
                    var id = element.val();
                    //search in data by id
                    opts.query({
                        matcher: function(term, text, el){
                            return equal(id, opts.id(el));
                        },
                        callback: !$.isFunction(callback) ? $.noop : function(filtered) {
                            callback(filtered.results.length ? filtered.results[0] : null);
                        }
                    });
                };
            }

            return opts;
        },

        // single
        getPlaceholder: function() {
            // if a placeholder is specified on a single select without the first empty option ignore it
            if (this.select) {
                if (this.select.find("option").first().text() !== "") {
                    return undefined;
                }
            }

            return this.parent.getPlaceholder.apply(this, arguments);
        },

        // single
        setPlaceholder: function () {
            var placeholder = this.getPlaceholder();

            if (this.opts.element.val() === "" && placeholder !== undefined) {

                // check for a first blank option if attached to a select
                if (this.select && this.select.find("option:first").text() !== "") return;

                this.selection.find("span").html(this.opts.escapeMarkup(placeholder));

                this.selection.addClass("select2-default");

                this.selection.find("abbr").hide();
            }
        },

        // single
        postprocessResults: function (data, initial) {
            var selected = 0, self = this, showSearchInput = true;

            // find the selected element in the result list

            this.findHighlightableChoices().each2(function (i, elm) {
                if (equal(self.id(elm.data("select2-data")), self.opts.element.val())) {
                    selected = i;
                    return false;
                }
            });

            // and highlight it

            this.highlight(selected);

            // hide the search box if this is the first we got the results and there are a few of them

            if (initial === true) {
                var min=this.opts.minimumResultsForSearch;
                showSearchInput  = min < 0 ? false : countResults(data.results) >= min;
                this.showSearch(showSearchInput);
            }

        },

        // single
        showSearch: function(showSearchInput) {
            this.showSearchInput = showSearchInput;

            this.dropdown.find(".select2-search")[showSearchInput ? "removeClass" : "addClass"]("select2-search-hidden");
            //add "select2-with-searchbox" to the container if search box is shown
            $(this.dropdown, this.container)[showSearchInput ? "addClass" : "removeClass"]("select2-with-searchbox");
        },

        // single
        onSelect: function (data, options) {
            var old = this.opts.element.val();

            this.opts.element.val(this.id(data));
            this.updateSelection(data);

            this.opts.element.trigger({ type: "selected", val: this.id(data), choice: data });

            this.close();

            if (!options || !options.noFocus)
                this.selection.focus();

            if (!equal(old, this.id(data))) { this.triggerChange(); }
        },

        // single
        updateSelection: function (data) {

            var container=this.selection.find("span"), formatted;

            this.selection.data("select2-data", data);

            container.empty();
            formatted=this.opts.formatSelection(data, container);
            if (formatted !== undefined) {
                container.append(this.opts.escapeMarkup(formatted));
            }

            this.selection.removeClass("select2-default");

            if (this.opts.allowClear && this.getPlaceholder() !== undefined) {
                this.selection.find("abbr").show();
            }
        },

        // single
        val: function () {
            var val, triggerChange = false, data = null, self = this;

            if (arguments.length === 0) {
                return this.opts.element.val();
            }

            val = arguments[0];

            if (arguments.length > 1) {
                triggerChange = arguments[1];
            }

            if (this.select) {
                this.select
                    .val(val)
                    .find(":selected").each2(function (i, elm) {
                        data = {id: elm.attr("value"), text: elm.text()};
                        return false;
                    });
                this.updateSelection(data);
                this.setPlaceholder();
                if (triggerChange) {
                    this.triggerChange();
                }
            } else {
                if (this.opts.initSelection === undefined) {
                    throw new Error("cannot call val() if initSelection() is not defined");
                }
                // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
                if (!val && val !== 0) {
                    this.clear();
                    if (triggerChange) {
                        this.triggerChange();
                    }
                    return;
                }
                this.opts.element.val(val);
                this.opts.initSelection(this.opts.element, function(data){
                    self.opts.element.val(!data ? "" : self.id(data));
                    self.updateSelection(data);
                    self.setPlaceholder();
                    if (triggerChange) {
                        self.triggerChange();
                    }
                });
            }
        },

        // single
        clearSearch: function () {
            this.search.val("");
            this.focusser.val("");
        },

        // single
        data: function(value) {
            var data;

            if (arguments.length === 0) {
                data = this.selection.data("select2-data");
                if (data == undefined) data = null;
                return data;
            } else {
                if (!value || value === "") {
                    this.clear();
                } else {
                    this.opts.element.val(!value ? "" : this.id(value));
                    this.updateSelection(value);
                }
            }
        }
    });

    MultiSelect2 = clazz(AbstractSelect2, {

        // multi
        createContainer: function () {
            var container = $(document.createElement("div")).attr({
                "class": "select2-container select2-container-multi"
            }).html([
                "    <ul class='select2-choices'>",
                //"<li class='select2-search-choice'><span>California</span><a href="javascript:void(0)" class="select2-search-choice-close"></a></li>" ,
                "  <li class='select2-search-field'>" ,
                "    <input type='text' autocomplete='off' class='select2-input'>" ,
                "  </li>" ,
                "</ul>" ,
                "<div class='select2-drop select2-drop-multi' style='display:none;'>" ,
                "   <ul class='select2-results'>" ,
                "   </ul>" ,
                "</div>"].join(""));
			return container;
        },

        // multi
        prepareOpts: function () {
            var opts = this.parent.prepareOpts.apply(this, arguments);

            // TODO validate placeholder is a string if specified

            if (opts.element.get(0).tagName.toLowerCase() === "select") {
                // install sthe selection initializer
                opts.initSelection = function (element, callback) {

                    var data = [];

                    element.find(":selected").each2(function (i, elm) {
                        data.push({id: elm.attr("value"), text: elm.text(), element: elm[0]});
                    });
                    callback(data);
                };
            } else if ("data" in opts) {
                // install default initSelection when applied to hidden input and data is local
                opts.initSelection = opts.initSelection || function (element, callback) {
                    var ids = splitVal(element.val(), opts.separator);
                    //search in data by array of ids
                    opts.query({
                        matcher: function(term, text, el){
                            return $.grep(ids, function(id) {
                                return equal(id, opts.id(el));
                            }).length;
                        },
                        callback: !$.isFunction(callback) ? $.noop : function(filtered) {
                            callback(filtered.results);
                        }
                    });
                };
            }

            return opts;
        },

        // multi
        initContainer: function () {

            var selector = ".select2-choices", selection;

            this.searchContainer = this.container.find(".select2-search-field");
            this.selection = selection = this.container.find(selector);

            this.search.bind("input paste", this.bind(function() {
                if (!this.enabled) return;
                if (!this.opened()) {
                    this.open();
                }
            }));

            this.search.bind("keydown", this.bind(function (e) {
                if (!this.enabled) return;

                if (e.which === KEY.BACKSPACE && this.search.val() === "") {
                    this.close();

                    var choices,
                        selected = selection.find(".select2-search-choice-focus");
                    if (selected.length > 0) {
                        this.unselect(selected.first());
                        this.search.width(10);
                        killEvent(e);
                        return;
                    }

                    choices = selection.find(".select2-search-choice:not(.select2-locked)");
                    if (choices.length > 0) {
                        choices.last().addClass("select2-search-choice-focus");
                    }
                } else {
                    selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
                }

                if (this.opened()) {
                    switch (e.which) {
                    case KEY.UP:
                    case KEY.DOWN:
                        this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                        killEvent(e);
                        return;
                    case KEY.ENTER:
                    case KEY.TAB:
                        this.selectHighlighted();
                        killEvent(e);
                        return;
                    case KEY.ESC:
                        this.cancel(e);
                        killEvent(e);
                        return;
                    }
                }

                if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e)
                 || e.which === KEY.BACKSPACE || e.which === KEY.ESC) {
                    return;
                }

                if (e.which === KEY.ENTER) {
                    if (this.opts.openOnEnter === false) {
                        return;
                    } else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                        return;
                    }
                }

                this.open();

                if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN) {
                    // prevent the page from scrolling
                    killEvent(e);
                }
            }));

            this.search.bind("keyup", this.bind(this.resizeSearch));

            this.search.bind("blur", this.bind(function(e) {
                this.container.removeClass("select2-container-active");
                this.search.removeClass("select2-focused");
                if (!this.opened()) this.clearSearch();
                e.stopImmediatePropagation();
            }));

            this.container.delegate(selector, "mousedown", this.bind(function (e) {
                if (!this.enabled) return;
                if ($(e.target).closest(".select2-search-choice").length > 0) {
                    // clicked inside a select2 search choice, do not open
                    return;
                }
                this.clearPlaceholder();
                this.open();
                this.focusSearch();
                e.preventDefault();
            }));

            this.container.delegate(selector, "focus", this.bind(function () {
                if (!this.enabled) return;
                this.container.addClass("select2-container-active");
                this.dropdown.addClass("select2-drop-active");
                this.clearPlaceholder();
            }));

            this.initContainerWidth();

            // set the placeholder if necessary
            this.clearSearch();
        },

        // multi
        enable: function() {
            if (this.enabled) return;

            this.parent.enable.apply(this, arguments);

            this.search.removeAttr("disabled");
        },

        // multi
        disable: function() {
            if (!this.enabled) return;

            this.parent.disable.apply(this, arguments);

            this.search.attr("disabled", true);
        },

        // multi
        initSelection: function () {
            var data;
            if (this.opts.element.val() === "" && this.opts.element.text() === "") {
                this.updateSelection([]);
                this.close();
                // set the placeholder if necessary
                this.clearSearch();
            }
            if (this.select || this.opts.element.val() !== "") {
                var self = this;
                this.opts.initSelection.call(null, this.opts.element, function(data){
                    if (data !== undefined && data !== null) {
                        self.updateSelection(data);
                        self.close();
                        // set the placeholder if necessary
                        self.clearSearch();
                    }
                });
            }
        },

        // multi
        clearSearch: function () {
            var placeholder = this.getPlaceholder();

            if (placeholder !== undefined  && this.getVal().length === 0 && this.search.hasClass("select2-focused") === false) {
                this.search.val(placeholder).addClass("select2-default");
                // stretch the search box to full width of the container so as much of the placeholder is visible as possible
                this.resizeSearch();
            } else {
                this.search.val("").width(10);
            }
        },

        // multi
        clearPlaceholder: function () {
            if (this.search.hasClass("select2-default")) {
                this.search.val("").removeClass("select2-default");
            }
        },

        // multi
        opening: function () {
            this.parent.opening.apply(this, arguments);

            this.clearPlaceholder();
			this.resizeSearch();
            this.focusSearch();

            this.opts.element.trigger($.Event("open"));
        },

        // multi
        close: function () {
            if (!this.opened()) return;
            this.parent.close.apply(this, arguments);
        },

        // multi
        focus: function () {
            this.close();
            this.search.focus();
            this.opts.element.triggerHandler("focus");
        },

        // multi
        isFocused: function () {
            return this.search.hasClass("select2-focused");
        },

        // multi
        updateSelection: function (data) {
            var ids = [], filtered = [], self = this;

            // filter out duplicates
            $(data).each(function () {
                if (indexOf(self.id(this), ids) < 0) {
                    ids.push(self.id(this));
                    filtered.push(this);
                }
            });
            data = filtered;

            this.selection.find(".select2-search-choice").remove();
            $(data).each(function () {
                self.addSelectedChoice(this);
            });
            self.postprocessResults();
        },

        tokenize: function() {
            var input = this.search.val();
            input = this.opts.tokenizer(input, this.data(), this.bind(this.onSelect), this.opts);
            if (input != null && input != undefined) {
                this.search.val(input);
                if (input.length > 0) {
                    this.open();
                }
            }

        },

        // multi
        onSelect: function (data, options) {
            this.addSelectedChoice(data);

            this.opts.element.trigger({ type: "selected", val: this.id(data), choice: data });

            if (this.select || !this.opts.closeOnSelect) this.postprocessResults();

            if (this.opts.closeOnSelect) {
                this.close();
                this.search.width(10);
            } else {
                if (this.countSelectableResults()>0) {
                    this.search.width(10);
                    this.resizeSearch();
                    if (this.val().length >= this.getMaximumSelectionSize()) {
                        // if we reached max selection size repaint the results so choices
                        // are replaced with the max selection reached message
                        this.updateResults(true);
                    }
                    this.positionDropdown();
                } else {
                    // if nothing left to select close
                    this.close();
                    this.search.width(10);
                }
            }

            // since its not possible to select an element that has already been
            // added we do not need to check if this is a new element before firing change
            this.triggerChange({ added: data });

            if (!options || !options.noFocus)
                this.focusSearch();
        },

        // multi
        cancel: function () {
            this.close();
            this.focusSearch();
        },

        addSelectedChoice: function (data) {
            var enableChoice = !data.locked,
                enabledItem = $(
                    "<li class='select2-search-choice'>" +
                    "    <div></div>" +
                    "    <a href='#' onclick='return false;' class='select2-search-choice-close' tabindex='-1'></a>" +
                    "</li>"),
                disabledItem = $(
                    "<li class='select2-search-choice select2-locked'>" +
                    "<div></div>" +
                    "</li>");
            var choice = enableChoice ? enabledItem : disabledItem,
                id = this.id(data),
                val = this.getVal(),
                formatted;

            formatted=this.opts.formatSelection(data, choice.find("div"));
            if (formatted != undefined) {
                choice.find("div").replaceWith("<div>"+this.opts.escapeMarkup(formatted)+"</div>");
            }

            if(enableChoice){
              choice.find(".select2-search-choice-close")
                  .bind("mousedown", killEvent)
                  .bind("click dblclick", this.bind(function (e) {
                  if (!this.enabled) return;

                  $(e.target).closest(".select2-search-choice").fadeOut('fast', this.bind(function(){
                      this.unselect($(e.target));
                      this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
                      this.close();
                      this.focusSearch();
                  })).dequeue();
                  killEvent(e);
              })).bind("focus", this.bind(function () {
                  if (!this.enabled) return;
                  this.container.addClass("select2-container-active");
                  this.dropdown.addClass("select2-drop-active");
              }));
            }

            choice.data("select2-data", data);
            choice.insertBefore(this.searchContainer);

            val.push(id);
            this.setVal(val);
        },

        // multi
        unselect: function (selected) {
            var val = this.getVal(),
                data,
                index;

            selected = selected.closest(".select2-search-choice");

            if (selected.length === 0) {
                throw "Invalid argument: " + selected + ". Must be .select2-search-choice";
            }

            data = selected.data("select2-data");

            if (!data) {
                // prevent a race condition when the 'x' is clicked really fast repeatedly the event can be queued
                // and invoked on an element already removed
                return;
            }

            index = indexOf(this.id(data), val);

            if (index >= 0) {
                val.splice(index, 1);
                this.setVal(val);
                if (this.select) this.postprocessResults();
            }
            selected.remove();

            this.opts.element.trigger({ type: "removed", val: this.id(data), choice: data });
            this.triggerChange({ removed: data });
        },

        // multi
        postprocessResults: function () {
            var val = this.getVal(),
                choices = this.results.find(".select2-result"),
                compound = this.results.find(".select2-result-with-children"),
                self = this;

            choices.each2(function (i, choice) {
                var id = self.id(choice.data("select2-data"));
                if (indexOf(id, val) >= 0) {
                    choice.addClass("select2-selected");
                    // mark all children of the selected parent as selected
                    choice.find(".select2-result-selectable").addClass("select2-selected");
                }
            });

            compound.each2(function(i, choice) {
                // hide an optgroup if it doesnt have any selectable children
                if (!choice.is('.select2-result-selectable')
                    && choice.find(".select2-result-selectable:not(.select2-selected)").length === 0) {
                    choice.addClass("select2-selected");
                }
            });

            if (this.highlight() == -1){
                self.highlight(0);
            }

        },

        // multi
        resizeSearch: function () {
            var minimumWidth, left, maxWidth, containerLeft, searchWidth,
            	sideBorderPadding = getSideBorderPadding(this.search);

            minimumWidth = measureTextWidth(this.search) + 10;

            left = this.search.offset().left;

            maxWidth = this.selection.width();
            containerLeft = this.selection.offset().left;

            searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;

            if (searchWidth < minimumWidth) {
                searchWidth = maxWidth - sideBorderPadding;
            }

            if (searchWidth < 40) {
                searchWidth = maxWidth - sideBorderPadding;
            }

            if (searchWidth <= 0) {
              searchWidth = minimumWidth;
            }

            this.search.width(searchWidth);
        },

        // multi
        getVal: function () {
            var val;
            if (this.select) {
                val = this.select.val();
                return val === null ? [] : val;
            } else {
                val = this.opts.element.val();
                return splitVal(val, this.opts.separator);
            }
        },

        // multi
        setVal: function (val) {
            var unique;
            if (this.select) {
                this.select.val(val);
            } else {
                unique = [];
                // filter out duplicates
                $(val).each(function () {
                    if (indexOf(this, unique) < 0) unique.push(this);
                });
                this.opts.element.val(unique.length === 0 ? "" : unique.join(this.opts.separator));
            }
        },

        // multi
        val: function () {
            var val, triggerChange = false, data = [], self=this;

            if (arguments.length === 0) {
                return this.getVal();
            }

            val = arguments[0];

            if (arguments.length > 1) {
                triggerChange = arguments[1];
            }

            // val is an id. !val is true for [undefined,null,'',0] - 0 is legal
            if (!val && val !== 0) {
                this.opts.element.val("");
                this.updateSelection([]);
                this.clearSearch();
                if (triggerChange) {
                    this.triggerChange();
                }
                return;
            }

            // val is a list of ids
            this.setVal(val);

            if (this.select) {
                this.opts.initSelection(this.select, this.bind(this.updateSelection));
                if (triggerChange) {
                    this.triggerChange();
                }
            } else {
                if (this.opts.initSelection === undefined) {
                    throw new Error("val() cannot be called if initSelection() is not defined");
                }

                this.opts.initSelection(this.opts.element, function(data){
                    var ids=$(data).map(self.id);
                    self.setVal(ids);
                    self.updateSelection(data);
                    self.clearSearch();
                    if (triggerChange) {
                        self.triggerChange();
                    }
                });
            }
            this.clearSearch();
        },

        // multi
        onSortStart: function() {
            if (this.select) {
                throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");
            }

            // collapse search field into 0 width so its container can be collapsed as well
            this.search.width(0);
            // hide the container
            this.searchContainer.hide();
        },

        // multi
        onSortEnd:function() {

            var val=[], self=this;

            // show search and move it to the end of the list
            this.searchContainer.show();
            // make sure the search container is the last item in the list
            this.searchContainer.appendTo(this.searchContainer.parent());
            // since we collapsed the width in dragStarted, we resize it here
            this.resizeSearch();

            // update selection

            this.selection.find(".select2-search-choice").each(function() {
                val.push(self.opts.id($(this).data("select2-data")));
            });
            this.setVal(val);
            this.triggerChange();
        },

        // multi
        data: function(values) {
            var self=this, ids;
            if (arguments.length === 0) {
                 return this.selection
                     .find(".select2-search-choice")
                     .map(function() { return $(this).data("select2-data"); })
                     .get();
            } else {
                if (!values) { values = []; }
                ids = $.map(values, function(e) { return self.opts.id(e); });
                this.setVal(ids);
                this.updateSelection(values);
                this.clearSearch();
            }
        }
    });

    $.fn.select2 = function () {

        var args = Array.prototype.slice.call(arguments, 0),
            opts,
            select2,
            value, multiple, allowedMethods = ["val", "destroy", "opened", "open", "close", "focus", "isFocused", "container", "onSortStart", "onSortEnd", "enable", "disable", "positionDropdown", "data"];

        this.each(function () {
            if (args.length === 0 || typeof(args[0]) === "object") {
                opts = args.length === 0 ? {} : $.extend({}, args[0]);
                opts.element = $(this);

                if (opts.element.get(0).tagName.toLowerCase() === "select") {
                    multiple = opts.element.attr("multiple");
                } else {
                    multiple = opts.multiple || false;
                    if ("tags" in opts) {opts.multiple = multiple = true;}
                }

                select2 = multiple ? new MultiSelect2() : new SingleSelect2();
                select2.init(opts);
            } else if (typeof(args[0]) === "string") {

                if (indexOf(args[0], allowedMethods) < 0) {
                    throw "Unknown method: " + args[0];
                }

                value = undefined;
                select2 = $(this).data("select2");
                if (select2 === undefined) return;
                if (args[0] === "container") {
                    value=select2.container;
                } else {
                    value = select2[args[0]].apply(select2, args.slice(1));
                }
                if (value !== undefined) {return false;}
            } else {
                throw "Invalid arguments to select2 plugin: " + args;
            }
        });
        return (value === undefined) ? this : value;
    };

    // plugin defaults, accessible to users
    $.fn.select2.defaults = {
        width: "copy",
        loadMorePadding: 0,
        closeOnSelect: true,
        openOnEnter: true,
        containerCss: {},
        dropdownCss: {},
        containerCssClass: "",
        dropdownCssClass: "",
        formatResult: function(result, container, query, escapeMarkup) {
            var markup=[];
            markMatch(result.text, query.term, markup, escapeMarkup);
            return markup.join("");
        },
        formatSelection: function (data, container) {
            return data ? data.text : undefined;
        },
        sortResults: function (results, container, query) {
            return results;
        },
        formatResultCssClass: function(data) {return undefined;},
        formatNoMatches: function () { return "No matches found"; },
        formatInputTooShort: function (input, min) { var n = min - input.length; return "Please enter " + n + " more character" + (n == 1? "" : "s"); },
        formatInputTooLong: function (input, max) { var n = input.length - max; return "Please enter " + n + " less character" + (n == 1? "" : "s"); },
        formatSelectionTooBig: function (limit) { return "You can only select " + limit + " item" + (limit == 1 ? "" : "s"); },
        formatLoadMore: function (pageNumber) { return "Loading more results..."; },
        formatSearching: function () { return "Searching..."; },
        minimumResultsForSearch: 0,
        minimumInputLength: 0,
        maximumInputLength: null,
        maximumSelectionSize: 0,
        id: function (e) { return e.id; },
        matcher: function(term, text) {
            return text.toUpperCase().indexOf(term.toUpperCase()) >= 0;
        },
        separator: ",",
        tokenSeparators: [],
        tokenizer: defaultTokenizer,
        escapeMarkup: function (markup) {
            var replace_map = {
                '\\': '&#92;',
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&apos;',
                "/": '&#47;'
            };

            return String(markup).replace(/[&<>"'/\\]/g, function (match) {
                    return replace_map[match[0]];
            });
        },
        blurOnChange: false,
        selectOnBlur: false,
        adaptContainerCssClass: function(c) { return c; },
        adaptDropdownCssClass: function(c) { return null; }
    };

}(jQuery));
} );

timely.define('libs/select2_multiselect_helper',
	[
		"jquery_timely",
		"external_libs/select2"
	],
	function( $ ) {
	 // jshint ;_;

	/**
	 * Formatter for selected event categories shown in the Select2 widget.
	 *
	 * @param  {object} category Passed by Select2 representing selected item
	 * @return {string}          Markup for formatted item
	 */
	var format_selection = function( option ) {
		var $option = $( option.element ),
				color = $option.data( 'color' ),
				description = $option.data( 'description' ),
				markup = '';

		if ( typeof color !== 'undefined' && color !== '' ) {
			markup += '<span class="ai1ec-color-swatch" style="background: ' +
				$option.data( 'color' ) + '"></span> ';
		}
		markup += option.text;
		markup = '<span title="' + description + '">' + markup + '</span>';

		return markup;
	};

	/**
	 * Formatter for event categories shown in the Select2 widget dropdown.
	 *
	 * @param  {object} category Passed by Select2 representing selected item
	 * @return {string}          Markup for formatted item
	 */
	var format_result = function( option ) {
		var $option = $( option.element ),
				color = $option.data( 'color' ),
				description = $option.data( 'description' ),
				markup = '';

		if ( typeof color !== 'undefined' && color !== '' ) {
			markup += '<span class="ai1ec-color-swatch" style="background: ' +
				$option.data( 'color' ) + '"></span> ';
		}
		else {
			markup += '<span class="ai1ec-color-swatch-empty"></span> ';
		}
		markup += option.text;
		markup = '<span title="' + description + '">' + markup + '</span>';

		return markup;
	};

	/**
	 * Initialize any category selectors on the page. Limit search to $container
	 * parent element if provided.
	 *
	 * @param  {object} $container jQuery object representing parent container
	 */
	var init = function( $container ) {
		if ( typeof $container === 'undefined' ) {
			$container = $( document );
		}
		$( '.ai1ec-select2-multiselect-selector', $container )
			.select2( {
				allowClear: true,
				formatResult: format_result,
				formatSelection: format_selection,
				escapeMarkup: function( m ) { return m; }
			} );
	};

	/**
	 * Refresh any category selectors on the page, usually to allow absolutely
	 * positioned components to be properly aligned when the selector is shown.
	 * Limit search to $container parent element if provided.
	 *
	 * @param  {object} $container jQuery object representing parent container
	 */
	var refresh = function( $container ) {
		$( '.ai1ec-select2-multiselect-selector.select2-container', $container ).each( function() {
			$( this ).data( 'select2' ).resizeSearch();
		} );
	};

	return {
		init: init,
		refresh: refresh
	};
} );

timely.define('libs/tags_select',
	[
		"jquery_timely",
		"external_libs/select2"
	],
	function( $ ) {
	 // jshint ;_;

	/**
	 * Initialize any tag selectors on the page. Limit search to $container
	 * parent element if provided.
	 *
	 * @param  {object} $container jQuery object representing parent container
	 */
	var init = function( $container ) {
		if ( typeof $container === 'undefined' ) {
			$container = $( document );
		}
		$( '.ai1ec-tags-selector', $container ).each( function() {
			var $this = $( this );
			$this
				.select2( {
					tags: $this.data( 'ai1ecTags' ),
					tokenSeparators: [ ',' ]
				} );
		} );
	};

	/**
	 * Refresh any tag selectors on the page, usually to allow absolutely
	 * positioned components to be properly aligned when the selector is shown.
	 * Limit search to $container parent element if provided.
	 *
	 * @param  {object} $container jQuery object representing parent container
	 */
	var refresh = function( $container ) {
		$( '.ai1ec-tags-selector.select2-container', $container ).each( function() {
			$( this ).data( 'select2' ).resizeSearch();
		} );
	};

	return {
		init: init,
		refresh: refresh
	};
} );

timely.define('libs/ajax_fileupload',
	[
		"jquery_timely",
	],
	function( $ ) {
	 // jshint ;_;

	/**
	 * Submits the given $form into a hidden iframe so that file uploads can be
	 * received by the server.
	 *
	 * @param  {object}   $form   jQuery object representing form to POST
	 * @param  {string}   type    Either 'json', 'xml-json', 'xml', or 'html' -
	 *                            the expected format of the HTTP response; if
	 *                            'json' or 'xml-json', data argument in success
	 *                            callback is the parsed JSON object; if 'xml' or
	 *                            'html', data argument is XML/HTML content parsed
	 *                            into a jQuery object.
	 * @param  {function} success Callback that receives 1 argument, data,
	 *                            containing the HTTP response of the submission.
	 */
	var post = function( $form, type, success ) {
		// Attempt to generate unique ID.
		var id = "ajax_fileupload" + ( new Date().getTime() );

		// Create hidden iframe and append to page.
		var $iframe = $( '<iframe name="' + id + '"/>' )
			.css( { border: 'none', width: 0, height: 0 } );
		$iframe.appendTo( 'body' );

		// Handle load event once.
		$iframe.one( 'load', function() {
			var data;
			// Return JS object if JSON format expected.
			// NOTE: Not typically used as it causes issues in Internet Explorer
			// (which prompts to download any file that has JSON content type), and
			// issues a warning in other browsers.
			if ( type === 'json' ) {
				data = $.parseJSON( $iframe.contents().text() );
			}
			// XML wrapper around JSON object.
			else if ( type === 'xml-json' ) {
				// Handle IE's wonderfully special and uniquely different way of
				// providing access to XML document data. So nice that MS give us the
				// chance to spend hours studying their curious departure from the norm.
				var doc;
				if ( typeof ( doc = $iframe[0].contentWindow.document.XMLDocument ) !==
				     'undefined' ) {
					data = $( doc ).text();
				}
				else {
					data = $iframe.contents().text();
				}
				data = $.parseJSON( data );
			}
			// Else return jQuery object containing returned XML/HTML structure.
			else {
				data = $iframe.contents().children();
			}

			// Pass to callback.
			success( data );

			// Clean up.
			$iframe.remove();
		} );

		// Prepare form.
		$form.attr( {
			target: id,
			method: 'post',
			enctype: 'multipart/form-data',
			encoding: 'multipart/form-data'
		} );

		$form.submit();
	};

	return {
		post: post
	};
} );

// moment.js
// version : 1.7.2
// author : Tim Wood
// license : MIT
// momentjs.com
timely.define('external_libs/moment',[],	function() {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "1.7.2",
        round = Math.round, i,
        // internal storage for language config files
        languages = {},
        currentLanguage = 'en',

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // Parameters to check for on the lang config.  This list of properties
        // will be inherited from English if not provided in a language
        // definition.  monthsParse is also a lang config property, but it
        // cannot be inherited and as such cannot be enumerated here.
        langConfigProperties = 'months|monthsShort|weekdays|weekdaysShort|weekdaysMin|longDateFormat|calendar|relativeTime|ordinal|meridiem'.split('|'),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|YYYY|YY|a|A|hh?|HH?|mm?|ss?|SS?S?|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?)/g,

        // parsing tokens
        parseMultipleFormatChunker = /([0-9a-zA-Z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)/gi,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenWord = /[0-9a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+/i, // any word characters or numbers
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/i, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO seperator)

        // preliminary iso regex
        // 0000-00-00 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000
        isoRegex = /^\s*\d{4}-\d\d-\d\d(T(\d\d(:\d\d(:\d\d(\.\d\d?\d?)?)?)?)?([\+\-]\d\d:?\d\d)?)?/,
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.S', /T\d\d:\d\d:\d\d\.\d{1,3}/],
            ['HH:mm:ss', /T\d\d:\d\d:\d\d/],
            ['HH:mm', /T\d\d:\d\d/],
            ['HH', /T\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Month|Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        // format function strings
        formatFunctions = {},

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w M D d'.split(' '),
        paddedTokens = 'M D H h m s w'.split(' '),

        /*
         * moment.fn.format uses new Function() to create an inlined formatting function.
         * Results are a 3x speed boost
         * http://jsperf.com/momentjs-cached-format-functions
         *
         * These strings are appended into a function using replaceFormatTokens and makeFormatFunction
         */
        formatTokenFunctions = {
            // a = placeholder
            // b = placeholder
            // t = the current moment being formatted
            // v = getValueAtKey function
            // o = language.ordinal function
            // p = leftZeroFill function
            // m = language.meridiem value or function
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return getValueFromArray("monthsShort", this.month(), this, format);
            },
            MMMM : function (format) {
                return getValueFromArray("months", this.month(), this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                var a = new Date(this.year(), this.month(), this.date()),
                    b = new Date(this.year(), 0, 1);
                return ~~(((a - b) / 864e5) + 1.5);
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return getValueFromArray("weekdaysMin", this.day(), this, format);
            },
            ddd  : function (format) {
                return getValueFromArray("weekdaysShort", this.day(), this, format);
            },
            dddd : function (format) {
                return getValueFromArray("weekdays", this.day(), this, format);
            },
            w    : function () {
                var a = new Date(this.year(), this.month(), this.date() - this.day() + 5),
                    b = new Date(a.getFullYear(), 0, 4);
                return ~~((a - b) / 864e5 / 7 + 1.5);
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return ~~(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(~~(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(a / 60), 2) + ":" + leftZeroFill(~~a % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(~~(10 * a / 6), 4);
            }
        };

    function getValueFromArray(key, index, m, format) {
        var lang = m.lang();
        return lang[key].call ? lang[key](m, format) : lang[key][index];
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func) {
        return function (a) {
            var b = func.call(this, a);
            return b + this.lang().ordinal(b);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i]);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/


    // Moment prototype object
    function Moment(date, isUTC, lang) {
        this._d = date;
        this._isUTC = !!isUTC;
        this._a = date._a || null;
        this._lang = lang || false;
    }

    // Duration Constructor
    function Duration(duration) {
        var data = this._data = {},
            years = duration.years || duration.y || 0,
            months = duration.months || duration.M || 0,
            weeks = duration.weeks || duration.w || 0,
            days = duration.days || duration.d || 0,
            hours = duration.hours || duration.h || 0,
            minutes = duration.minutes || duration.m || 0,
            seconds = duration.seconds || duration.s || 0,
            milliseconds = duration.milliseconds || duration.ms || 0;

        // representation for dateAddRemove
        this._milliseconds = milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = months +
            years * 12;

        // The following code bubbles up values, see the tests for
        // examples of what that means.
        data.milliseconds = milliseconds % 1000;
        seconds += absRound(milliseconds / 1000);

        data.seconds = seconds % 60;
        minutes += absRound(seconds / 60);

        data.minutes = minutes % 60;
        hours += absRound(minutes / 60);

        data.hours = hours % 24;
        days += absRound(hours / 24);

        days += weeks * 7;
        data.days = days % 30;

        months += absRound(days / 30);

        data.months = months % 12;
        years += absRound(months / 12);

        data.years = years;

        this._lang = false;
    }


    /************************************
        Helpers
    ************************************/


    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength) {
        var output = number + '';
        while (output.length < targetLength) {
            output = '0' + output;
        }
        return output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding) {
        var ms = duration._milliseconds,
            d = duration._days,
            M = duration._months,
            currentDate;

        if (ms) {
            mom._d.setTime(+mom + ms * isAdding);
        }
        if (d) {
            mom.date(mom.date() + d * isAdding);
        }
        if (M) {
            currentDate = mom.date();
            mom.date(1)
                .month(mom.month() + M * isAdding)
                .date(Math.min(currentDate, mom.daysInMonth()));
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if (~~array1[i] !== ~~array2[i]) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromArray(input, asUTC, hoursOffset, minutesOffset) {
        var i, date, forValid = [];
        for (i = 0; i < 7; i++) {
            forValid[i] = input[i] = (input[i] == null) ? (i === 2 ? 1 : 0) : input[i];
        }
        // we store whether we used utc or not in the input array
        input[7] = forValid[7] = asUTC;
        // if the parser flagged the input as invalid, we pass the value along
        if (input[8] != null) {
            forValid[8] = input[8];
        }
        // add the offsets to the time to be parsed so that we can have a clean array
        // for checking isValid
        input[3] += hoursOffset || 0;
        input[4] += minutesOffset || 0;
        date = new Date(0);
        if (asUTC) {
            date.setUTCFullYear(input[0], input[1], input[2]);
            date.setUTCHours(input[3], input[4], input[5], input[6]);
        } else {
            date.setFullYear(input[0], input[1], input[2]);
            date.setHours(input[3], input[4], input[5], input[6]);
        }
        date._a = forValid;
        return date;
    }

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        var i, m,
            parse = [];

        if (!values && hasModule) {
            values = require('./lang/' + key);
        }

        for (i = 0; i < langConfigProperties.length; i++) {
            // If a language definition does not provide a value, inherit
            // from English
            values[langConfigProperties[i]] = values[langConfigProperties[i]] ||
              languages.en[langConfigProperties[i]];
        }

        for (i = 0; i < 12; i++) {
            m = moment([2000, i]);
            parse[i] = new RegExp('^' + (values.months[i] || values.months(m, '')) +
                '|^' + (values.monthsShort[i] || values.monthsShort(m, '')).replace('.', ''), 'i');
        }
        values.monthsParse = values.monthsParse || parse;

        languages[key] = values;

        return values;
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.  If you pass in a moment or duration instance, it
    // will decide the language based on that, or default to the global
    // language.
    function getLangDefinition(m) {
        var langKey = (typeof m === 'string') && m ||
                      m && m._lang ||
                      null;

        return langKey ? (languages[langKey] || loadLang(langKey)) : moment;
    }


    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[.*\]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += typeof array[i].call === 'function' ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return m.lang().longDateFormat[input] || input;
        }

        while (i-- && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        }

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token) {
        switch (token) {
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
            return parseTokenFourDigits;
        case 'S':
        case 'SS':
        case 'SSS':
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
        case 'a':
        case 'A':
            return parseTokenWord;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
            return parseTokenOneOrTwoDigits;
        default :
            return new RegExp(token.replace('\\', ''));
        }
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, datePartArray, config) {
        var a, b;

        switch (token) {
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            datePartArray[1] = (input == null) ? 0 : ~~input - 1;
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            for (a = 0; a < 12; a++) {
                if (getLangDefinition().monthsParse[a].test(input)) {
                    datePartArray[1] = a;
                    b = true;
                    break;
                }
            }
            // if we didn't find a month name, mark the date as invalid.
            if (!b) {
                datePartArray[8] = false;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DDDD
        case 'DD' : // fall through to DDDD
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                datePartArray[2] = ~~input;
            }
            break;
        // YEAR
        case 'YY' :
            datePartArray[0] = ~~input + (~~input > 70 ? 1900 : 2000);
            break;
        case 'YYYY' :
            datePartArray[0] = ~~Math.abs(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config.isPm = ((input + '').toLowerCase() === 'pm');
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[3] = ~~input;
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[4] = ~~input;
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[5] = ~~input;
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
            datePartArray[6] = ~~ (('0.' + input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config.isUTC = true;
            a = (input + '').match(parseTimezoneChunker);
            if (a && a[1]) {
                config.tzh = ~~a[1];
            }
            if (a && a[2]) {
                config.tzm = ~~a[2];
            }
            // reverse offsets
            if (a && a[0] === '+') {
                config.tzh = -config.tzh;
                config.tzm = -config.tzm;
            }
            break;
        }

        // if the input is null, the date is not valid
        if (input == null) {
            datePartArray[8] = false;
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(string, format) {
        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        // We store some additional data on the array for validation
        // datePartArray[7] is true if the Date was created with `Date.UTC` and false if created with `new Date`
        // datePartArray[8] is false if the Date is invalid, and undefined if the validity is unknown.
        var datePartArray = [0, 0, 1, 0, 0, 0, 0],
            config = {
                tzh : 0, // timezone hour offset
                tzm : 0  // timezone minute offset
            },
            tokens = format.match(formattingTokens),
            i, parsedInput;

        for (i = 0; i < tokens.length; i++) {
            parsedInput = (getParseRegexForToken(tokens[i]).exec(string) || [])[0];
            if (parsedInput) {
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
            }
            // don't parse if its not a known token
            if (formatTokenFunctions[tokens[i]]) {
                addTimeToArrayFromToken(tokens[i], parsedInput, datePartArray, config);
            }
        }
        // handle am pm
        if (config.isPm && datePartArray[3] < 12) {
            datePartArray[3] += 12;
        }
        // if is 12 am, change hours to 0
        if (config.isPm === false && datePartArray[3] === 12) {
            datePartArray[3] = 0;
        }
        // return
        return dateFromArray(datePartArray, config.isUTC, config.tzh, config.tzm);
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(string, formats) {
        var output,
            inputParts = string.match(parseMultipleFormatChunker) || [],
            formattedInputParts,
            scoreToBeat = 99,
            i,
            currentDate,
            currentScore;
        for (i = 0; i < formats.length; i++) {
            currentDate = makeDateFromStringAndFormat(string, formats[i]);
            formattedInputParts = formatMoment(new Moment(currentDate), formats[i]).match(parseMultipleFormatChunker) || [];
            currentScore = compareArrays(inputParts, formattedInputParts);
            if (currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                output = currentDate;
            }
        }
        return output;
    }

    // date from iso format
    function makeDateFromString(string) {
        var format = 'YYYY-MM-DDT',
            i;
        if (isoRegex.exec(string)) {
            for (i = 0; i < 4; i++) {
                if (isoTimes[i][1].exec(string)) {
                    format += isoTimes[i][0];
                    break;
                }
            }
            return parseTokenTimezone.exec(string) ?
                makeDateFromStringAndFormat(string, format + ' Z') :
                makeDateFromStringAndFormat(string, format);
        }
        return new Date(string);
    }


    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        var rt = lang.relativeTime[string];
        return (typeof rt === 'function') ?
            rt(number || 1, !!withoutSuffix, string, isFuture) :
            rt.replace(/%d/i, number || 1);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < 45 && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < 22 && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= 25 && ['dd', days] ||
                days <= 45 && ['M'] ||
                days < 345 && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Top Level Functions
    ************************************/


    moment = function (input, format) {
        if (input === null || input === '') {
            return null;
        }
        var date,
            matched;
        // parse Moment object
        if (moment.isMoment(input)) {
            return new Moment(new Date(+input._d), input._isUTC, input._lang);
        // parse string and format
        } else if (format) {
            if (isArray(format)) {
                date = makeDateFromStringAndArray(input, format);
            } else {
                date = makeDateFromStringAndFormat(input, format);
            }
        // evaluate it as a JSON-encoded date
        } else {
            matched = aspNetJsonRegex.exec(input);
            date = input === undefined ? new Date() :
                matched ? new Date(+matched[1]) :
                input instanceof Date ? input :
                isArray(input) ? dateFromArray(input) :
                typeof input === 'string' ? makeDateFromString(input) :
                new Date(input);
        }

        return new Moment(date);
    };

    // creating with utc
    moment.utc = function (input, format) {
        if (isArray(input)) {
            return new Moment(dateFromArray(input, true), true);
        }
        // if we don't have a timezone, we need to add one to trigger parsing into utc
        if (typeof input === 'string' && !parseTokenTimezone.exec(input)) {
            input += ' +0000';
            if (format) {
                format += ' Z';
            }
        }
        return moment(input, format).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var isDuration = moment.isDuration(input),
            isNumber = (typeof input === 'number'),
            duration = (isDuration ? input._data : (isNumber ? {} : input)),
            ret;

        if (isNumber) {
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        }

        ret = new Duration(duration);

        if (isDuration) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // humanizeDuration
    // This method is deprecated in favor of the new Duration object.  Please
    // see the moment.duration method.
    moment.humanizeDuration = function (num, type, withSuffix) {
        return moment.duration(num, type === true ? null : type).humanize(type === true ? true : withSuffix);
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var i;

        if (!key) {
            return currentLanguage;
        }
        if (values || !languages[key]) {
            loadLang(key, values);
        }
        if (languages[key]) {
            // deprecated, to get the language definition variables, use the
            // moment.fn.lang method or the getLangDefinition function.
            for (i = 0; i < langConfigProperties.length; i++) {
                moment[langConfigProperties[i]] = languages[key][langConfigProperties[i]];
            }
            moment.monthsParse = languages[key].monthsParse;
            currentLanguage = key;
        }
    };

    // returns language data
    moment.langData = getLangDefinition;

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment;
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },
        calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[last] dddd [at] LT',
            sameElse : 'L'
        },
        relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        ordinal : function (number) {
            var b = number % 10;
            return (~~ (number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        }
    });


    /************************************
        Moment Prototype
    ************************************/


    moment.fn = Moment.prototype = {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d;
        },

        unix : function () {
            return Math.floor(+this._d / 1000);
        },

        toString : function () {
            return this._d.toString();
        },

        toDate : function () {
            return this._d;
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds(),
                !!this._isUTC
            ];
        },

        isValid : function () {
            if (this._a) {
                // if the parser finds that the input is invalid, it sets
                // the eighth item in the input array to false.
                if (this._a[8] != null) {
                    return !!this._a[8];
                }
                return !compareArrays(this._a, (this._a[7] ? moment.utc(this._a) : moment(this._a)).toArray());
            }
            return !isNaN(this._d.getTime());
        },

        utc : function () {
            this._isUTC = true;
            return this;
        },

        local : function () {
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            return formatMoment(this, inputString ? inputString : moment.defaultFormat);
        },

        add : function (input, val) {
            var dur = val ? moment.duration(+val, input) : moment.duration(input);
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur = val ? moment.duration(+val, input) : moment.duration(input);
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, val, asFloat) {
            var inputMoment = this._isUTC ? moment(input).utc() : moment(input).local(),
                zoneDiff = (this.zone() - inputMoment.zone()) * 6e4,
                diff = this._d - inputMoment._d - zoneDiff,
                year = this.year() - inputMoment.year(),
                month = this.month() - inputMoment.month(),
                date = this.date() - inputMoment.date(),
                output;
            if (val === 'months') {
                output = year * 12 + month + date / 30;
            } else if (val === 'years') {
                output = year + (month + date / 30) / 12;
            } else {
                output = val === 'seconds' ? diff / 1e3 : // 1000
                    val === 'minutes' ? diff / 6e4 : // 1000 * 60
                    val === 'hours' ? diff / 36e5 : // 1000 * 60 * 60
                    val === 'days' ? diff / 864e5 : // 1000 * 60 * 60 * 24
                    val === 'weeks' ? diff / 6048e5 : // 1000 * 60 * 60 * 24 * 7
                    diff;
            }
            return asFloat ? output : round(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this._lang).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function () {
            var diff = this.diff(moment().sod(), 'days', true),
                calendar = this.lang().calendar,
                allElse = calendar.sameElse,
                format = diff < -6 ? allElse :
                diff < -1 ? calendar.lastWeek :
                diff < 0 ? calendar.lastDay :
                diff < 1 ? calendar.sameDay :
                diff < 2 ? calendar.nextDay :
                diff < 7 ? calendar.nextWeek : allElse;
            return this.format(typeof format === 'function' ? format.apply(this) : format);
        },

        isLeapYear : function () {
            var year = this.year();
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        },

        isDST : function () {
            return (this.zone() < moment([this.year()]).zone() ||
                this.zone() < moment([this.year(), 5]).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            return input == null ? day :
                this.add({ d : input - day });
        },

        startOf: function (val) {
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (val.replace(/s$/, '')) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'month':
                this.date(1);
                /* falls through */
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }
            return this;
        },

        endOf: function (val) {
            return this.startOf(val).add(val.replace(/s?$/, 's'), 1).subtract('ms', 1);
        },

        sod: function () {
            return this.clone().startOf('day');
        },

        eod: function () {
            // end of day = start of day plus 1 day, minus 1 millisecond
            return this.clone().endOf('day');
        },

        zone : function () {
            return this._isUTC ? 0 : this._d.getTimezoneOffset();
        },

        daysInMonth : function () {
            return moment.utc([this.year(), this.month() + 1, 0]).date();
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (lang) {
            if (lang === undefined) {
                return getLangDefinition(this);
            } else {
                this._lang = lang;
                return this;
            }
        }
    };

    // helper for adding shortcuts
    function makeGetterAndSetter(name, key) {
        moment.fn[name] = function (input) {
            var utc = this._isUTC ? 'UTC' : '';
            if (input != null) {
                this._d['set' + utc + key](input);
                return this;
            } else {
                return this._d['get' + utc + key]();
            }
        };
    }

    // loop through and add shortcuts (Month, Date, Hours, Minutes, Seconds, Milliseconds)
    for (i = 0; i < proxyGettersAndSetters.length; i ++) {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase(), proxyGettersAndSetters[i]);
    }

    // add shortcut for year (uses different syntax than the getter/setter 'year' == 'FullYear')
    makeGetterAndSetter('year', 'FullYear');


    /************************************
        Duration Prototype
    ************************************/


    moment.duration.fn = Duration.prototype = {
        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              this._months * 2592e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                rel = this.lang().relativeTime,
                output = relativeTime(difference, !withSuffix, this.lang()),
                fromNow = difference <= 0 ? rel.past : rel.future;

            if (withSuffix) {
                if (typeof fromNow === 'function') {
                    output = fromNow(output);
                } else {
                    output = fromNow.replace(/%s/i, output);
                }
            }

            return output;
        },

        lang : moment.fn.lang
    };

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);


    /************************************
        Exposing Moment
    ************************************/

    return moment;
} );

/*!
 * Timepicker Component for Twitter Bootstrap
 *
 * Copyright 2013 Joris de Wit
 *
 * Contributors https://github.com/jdewit/bootstrap-timepicker/graphs/contributors
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
timely.define('external_libs/bootstrap_timepicker', ["jquery_timely"],
	function( $ ) {

     // jshint ;_;
    ;(function($, window, document, undefined) {

    	   // jshint ;_;

    	  // TIMEPICKER PUBLIC CLASS DEFINITION
    	  var Timepicker = function(element, options) {
    	    this.widget = '';
    	    this.$element = $(element);
    	    this.defaultTime = options.defaultTime;
    	    this.disableFocus = options.disableFocus;
    	    this.isOpen = options.isOpen;
    	    this.minuteStep = options.minuteStep;
    	    this.modalBackdrop = options.modalBackdrop;
    	    this.secondStep = options.secondStep;
    	    this.showInputs = options.showInputs;
    	    this.showMeridian = options.showMeridian;
    	    this.showSeconds = options.showSeconds;
    	    this.template = options.template;
    	    this.appendWidgetTo = options.appendWidgetTo;

    	    this._init();
    	  };

    	  Timepicker.prototype = {

    	    constructor: Timepicker,

    	    _init: function() {
    	      var self = this;

    	      if (this.$element.parent().hasClass('input-append') || this.$element.parent().hasClass('input-prepend')) {
    	          this.$element.parent('.input-append, .input-prepend').find('.add-on').on({
    	            'click.timepicker': $.proxy(this.showWidget, this)
    	          });
    	          this.$element.on({
    	            'focus.timepicker': $.proxy(this.highlightUnit, this),
    	            'click.timepicker': $.proxy(this.highlightUnit, this),
    	            'keydown.timepicker': $.proxy(this.elementKeydown, this),
    	            'blur.timepicker': $.proxy(this.blurElement, this)
    	          });
    	      } else {
    	        if (this.template) {
    	          this.$element.on({
    	            'focus.timepicker': $.proxy(this.showWidget, this),
    	            'click.timepicker': $.proxy(this.showWidget, this),
    	            'blur.timepicker': $.proxy(this.blurElement, this)
    	          });
    	        } else {
    	          this.$element.on({
    	            'focus.timepicker': $.proxy(this.highlightUnit, this),
    	            'click.timepicker': $.proxy(this.highlightUnit, this),
    	            'keydown.timepicker': $.proxy(this.elementKeydown, this),
    	            'blur.timepicker': $.proxy(this.blurElement, this)
    	          });
    	        }
    	      }

    	      if (this.template !== false) {
    	        this.$widget = $(this.getTemplate()).prependTo(this.$element.parents(this.appendWidgetTo)).on('click', $.proxy(this.widgetClick, this));
    	      } else {
    	        this.$widget = false;
    	      }

    	      if (this.showInputs && this.$widget !== false) {
    	          this.$widget.find('input').each(function() {
    	            $(this).on({
    	              'click.timepicker': function() { $(this).select(); },
    	              'keydown.timepicker': $.proxy(self.widgetKeydown, self)
    	            });
    	          });
    	      }

    	      this.setDefaultTime(this.defaultTime);
    	    },

    	    blurElement: function() {
    	      this.highlightedUnit = undefined;
    	      this.updateFromElementVal();
    	    },

    	    decrementHour: function() {
    	      if (this.showMeridian) {
    	        if (this.hour === 1) {
    	          this.hour = 12;
    	        } else if (this.hour === 12) {
    	          this.hour--;

    	          return this.toggleMeridian();
    	        } else if (this.hour === 0) {
    	          this.hour = 11;

    	          return this.toggleMeridian();
    	        } else {
    	          this.hour--;
    	        }
    	      } else {
    	        if (this.hour === 0) {
    	          this.hour = 23;
    	        } else {
    	          this.hour--;
    	        }
    	      }
    	      this.update();
    	    },

    	    decrementMinute: function(step) {
    	      var newVal;

    	      if (step) {
    	        newVal = this.minute - step;
    	      } else {
    	        newVal = this.minute - this.minuteStep +
    	          ((this.minuteStep - this.minute) % this.minuteStep);
    	      }

    	      if (newVal < 0) {
    	        this.decrementHour();
    	        this.minute = newVal + 60;
    	      } else {
    	        this.minute = newVal;
    	      }
    	      this.update();
    	    },

    	    decrementSecond: function() {
    	      var newVal = this.second - this.secondStep;

    	      if (newVal < 0) {
    	        this.decrementMinute(true);
    	        this.second = newVal + 60;
    	      } else {
    	        this.second = newVal;
    	      }
    	      this.update();
    	    },

    	    elementKeydown: function(e) {
    	      switch (e.keyCode) {
    	        case 9: //tab
    	          this.updateFromElementVal();

    	          switch (this.highlightedUnit) {
    	            case 'hour':
    	              e.preventDefault();
    	              this.highlightNextUnit();
    	            break;
    	            case 'minute':
    	              if (this.showMeridian || this.showSeconds) {
    	                e.preventDefault();
    	                this.highlightNextUnit();
    	              }
    	            break;
    	            case 'second':
    	              if (this.showMeridian) {
    	                e.preventDefault();
    	                this.highlightNextUnit();
    	              }
    	            break;
    	          }
    	        break;
    	        case 27: // escape
    	          this.updateFromElementVal();
    	        break;
    	        case 37: // left arrow
    	          e.preventDefault();
    	          this.highlightPrevUnit();
    	          this.updateFromElementVal();
    	        break;
    	        case 38: // up arrow
    	          e.preventDefault();
    	          switch (this.highlightedUnit) {
    	            case 'hour':
    	              this.incrementHour();
    	              this.highlightHour();
    	            break;
    	            case 'minute':
    	              this.incrementMinute();
    	              this.highlightMinute();
    	            break;
    	            case 'second':
    	              this.incrementSecond();
    	              this.highlightSecond();
    	            break;
    	            case 'meridian':
    	              this.toggleMeridian();
    	              this.highlightMeridian();
    	            break;
    	          }
    	        break;
    	        case 39: // right arrow
    	          e.preventDefault();
    	          this.updateFromElementVal();
    	          this.highlightNextUnit();
    	        break;
    	        case 40: // down arrow
    	          e.preventDefault();
    	          switch (this.highlightedUnit) {
    	            case 'hour':
    	              this.decrementHour();
    	              this.highlightHour();
    	            break;
    	            case 'minute':
    	              this.decrementMinute();
    	              this.highlightMinute();
    	            break;
    	            case 'second':
    	              this.decrementSecond();
    	              this.highlightSecond();
    	            break;
    	            case 'meridian':
    	              this.toggleMeridian();
    	              this.highlightMeridian();
    	            break;
    	          }
    	        break;
    	      }
    	    },

    	    formatTime: function(hour, minute, second, meridian) {
    	      hour = hour < 10 ? '0' + hour : hour;
    	      minute = minute < 10 ? '0' + minute : minute;
    	      second = second < 10 ? '0' + second : second;

    	      return hour + ':' + minute + (this.showSeconds ? ':' + second : '') + (this.showMeridian ? ' ' + meridian : '');
    	    },

    	    getCursorPosition: function() {
    	      var input = this.$element.get(0);

    	      if ('selectionStart' in input) {// Standard-compliant browsers

    	        return input.selectionStart;
    	      } else if (document.selection) {// IE fix
    	        input.focus();
    	        var sel = document.selection.createRange(),
    	          selLen = document.selection.createRange().text.length;

    	        sel.moveStart('character', - input.value.length);

    	        return sel.text.length - selLen;
    	      }
    	    },

    	    getTemplate: function() {
    	      var template,
    	        hourTemplate,
    	        minuteTemplate,
    	        secondTemplate,
    	        meridianTemplate,
    	        templateContent;

    	      if (this.showInputs) {
    	        hourTemplate = '<input type="text" name="hour" class="bootstrap-timepicker-hour" maxlength="2"/>';
    	        minuteTemplate = '<input type="text" name="minute" class="bootstrap-timepicker-minute" maxlength="2"/>';
    	        secondTemplate = '<input type="text" name="second" class="bootstrap-timepicker-second" maxlength="2"/>';
    	        meridianTemplate = '<input type="text" name="meridian" class="bootstrap-timepicker-meridian" maxlength="2"/>';
    	      } else {
    	        hourTemplate = '<span class="bootstrap-timepicker-hour"></span>';
    	        minuteTemplate = '<span class="bootstrap-timepicker-minute"></span>';
    	        secondTemplate = '<span class="bootstrap-timepicker-second"></span>';
    	        meridianTemplate = '<span class="bootstrap-timepicker-meridian"></span>';
    	      }

    	      templateContent = '<table>'+
    	         '<tr>'+
    	           '<td><a href="#" data-action="incrementHour"><i class="icon-chevron-up"></i></a></td>'+
    	           '<td class="separator">&nbsp;</td>'+
    	           '<td><a href="#" data-action="incrementMinute"><i class="icon-chevron-up"></i></a></td>'+
    	           (this.showSeconds ?
    	             '<td class="separator">&nbsp;</td>'+
    	             '<td><a href="#" data-action="incrementSecond"><i class="icon-chevron-up"></i></a></td>'
    	           : '') +
    	           (this.showMeridian ?
    	             '<td class="separator">&nbsp;</td>'+
    	             '<td class="meridian-column"><a href="#" data-action="toggleMeridian"><i class="icon-chevron-up"></i></a></td>'
    	           : '') +
    	         '</tr>'+
    	         '<tr>'+
    	           '<td>'+ hourTemplate +'</td> '+
    	           '<td class="separator">:</td>'+
    	           '<td>'+ minuteTemplate +'</td> '+
    	           (this.showSeconds ?
    	            '<td class="separator">:</td>'+
    	            '<td>'+ secondTemplate +'</td>'
    	           : '') +
    	           (this.showMeridian ?
    	            '<td class="separator">&nbsp;</td>'+
    	            '<td>'+ meridianTemplate +'</td>'
    	           : '') +
    	         '</tr>'+
    	         '<tr>'+
    	           '<td><a href="#" data-action="decrementHour"><i class="icon-chevron-down"></i></a></td>'+
    	           '<td class="separator"></td>'+
    	           '<td><a href="#" data-action="decrementMinute"><i class="icon-chevron-down"></i></a></td>'+
    	           (this.showSeconds ?
    	            '<td class="separator">&nbsp;</td>'+
    	            '<td><a href="#" data-action="decrementSecond"><i class="icon-chevron-down"></i></a></td>'
    	           : '') +
    	           (this.showMeridian ?
    	            '<td class="separator">&nbsp;</td>'+
    	            '<td><a href="#" data-action="toggleMeridian"><i class="icon-chevron-down"></i></a></td>'
    	           : '') +
    	         '</tr>'+
    	       '</table>';

    	      switch(this.template) {
    	        case 'modal':
    	          template = '<div class="bootstrap-timepicker-widget modal hide fade in" data-backdrop="'+ (this.modalBackdrop ? 'true' : 'false') +'">'+
    	            '<div class="modal-header">'+
    	              '<a href="#" class="close" data-dismiss="modal">×</a>'+
    	              '<h3>Pick a Time</h3>'+
    	            '</div>'+
    	            '<div class="modal-content">'+
    	              templateContent +
    	            '</div>'+
    	            '<div class="modal-footer">'+
    	              '<a href="#" class="btn btn-primary" data-dismiss="modal">OK</a>'+
    	            '</div>'+
    	          '</div>';
    	        break;
    	        case 'dropdown':
    	          template = '<div class="bootstrap-timepicker-widget dropdown-menu">'+ templateContent +'</div>';
    	        break;
    	      }

    	      return template;
    	    },

    	    getTime: function() {
    	      return this.formatTime(this.hour, this.minute, this.second, this.meridian);
    	    },

    	    hideWidget: function() {
    	      if (this.isOpen === false) {
    	        return;
    	      }

    				if (this.showInputs) {
    					this.updateFromWidgetInputs();
    				}

    	      this.$element.trigger({
    	        'type': 'hide.timepicker',
    	        'time': {
    	            'value': this.getTime(),
    	            'hours': this.hour,
    	            'minutes': this.minute,
    	            'seconds': this.second,
    	            'meridian': this.meridian
    	         }
    	      });

    	      if (this.template === 'modal') {
    	        this.$widget.modal('hide');
    	      } else {
    	        this.$widget.removeClass('open');
    	      }

    	      $(document).off('mousedown.timepicker');

    	      this.isOpen = false;
    	    },

    	    highlightUnit: function() {
    	      this.position = this.getCursorPosition();
    	      if (this.position >= 0 && this.position <= 2) {
    	        this.highlightHour();
    	      } else if (this.position >= 3 && this.position <= 5) {
    	        this.highlightMinute();
    	      } else if (this.position >= 6 && this.position <= 8) {
    	        if (this.showSeconds) {
    	          this.highlightSecond();
    	        } else {
    	          this.highlightMeridian();
    	        }
    	      } else if (this.position >= 9 && this.position <= 11) {
    	        this.highlightMeridian();
    	      }
    	    },

    	    highlightNextUnit: function() {
    	      switch (this.highlightedUnit) {
    	        case 'hour':
    	          this.highlightMinute();
    	        break;
    	        case 'minute':
    	          if (this.showSeconds) {
    	            this.highlightSecond();
    	          } else if (this.showMeridian){
    	            this.highlightMeridian();
    	          } else {
    	            this.highlightHour();
    	          }
    	        break;
    	        case 'second':
    	          if (this.showMeridian) {
    	            this.highlightMeridian();
    	          } else {
    	            this.highlightHour();
    	          }
    	        break;
    	        case 'meridian':
    	          this.highlightHour();
    	        break;
    	      }
    	    },

    	    highlightPrevUnit: function() {
    	      switch (this.highlightedUnit) {
    	        case 'hour':
    	          this.highlightMeridian();
    	        break;
    	        case 'minute':
    	          this.highlightHour();
    	        break;
    	        case 'second':
    	          this.highlightMinute();
    	        break;
    	        case 'meridian':
    	          if (this.showSeconds) {
    	            this.highlightSecond();
    	          } else {
    	            this.highlightMinute();
    	          }
    	        break;
    	      }
    	    },

    	    highlightHour: function() {
    	      var $element = this.$element.get(0);

    	      this.highlightedUnit = 'hour';

    				if ($element.setSelectionRange) {
    					setTimeout(function() {
    						$element.setSelectionRange(0,2);
    					}, 0);
    				}
    	    },

    	    highlightMinute: function() {
    	      var $element = this.$element.get(0);

    	      this.highlightedUnit = 'minute';

    				if ($element.setSelectionRange) {
    					setTimeout(function() {
    						$element.setSelectionRange(3,5);
    					}, 0);
    				}
    	    },

    	    highlightSecond: function() {
    	      var $element = this.$element.get(0);

    	      this.highlightedUnit = 'second';

    				if ($element.setSelectionRange) {
    					setTimeout(function() {
    						$element.setSelectionRange(6,8);
    					}, 0);
    				}
    	    },

    	    highlightMeridian: function() {
    	      var $element = this.$element.get(0);

    	      this.highlightedUnit = 'meridian';

    				if ($element.setSelectionRange) {
    					if (this.showSeconds) {
    						setTimeout(function() {
    							$element.setSelectionRange(9,11);
    						}, 0);
    					} else {
    						setTimeout(function() {
    							$element.setSelectionRange(6,8);
    						}, 0);
    					}
    				}
    	    },

    	    incrementHour: function() {
    	      if (this.showMeridian) {
    	        if (this.hour === 11) {
    	          this.hour++;
    	          return this.toggleMeridian();
    	        } else if (this.hour === 12) {
    	          this.hour = 0;
    	        }
    	      }
    	      if (this.hour === 23) {
    	        return this.hour = 0;
    	      }
    	      this.hour++;
    	      this.update();
    	    },

    	    incrementMinute: function(step) {
    	      var newVal;

    	      if (step) {
    	        newVal = this.minute + step;
    	      } else {
    	        newVal = this.minute + this.minuteStep - (this.minute % this.minuteStep);
    	      }

    	      if (newVal > 59) {
    	        this.incrementHour();
    	        this.minute = newVal - 60;
    	      } else {
    	        this.minute = newVal;
    	      }
    	      this.update();
    	    },

    	    incrementSecond: function() {
    	      var newVal = this.second + this.secondStep - (this.second % this.secondStep);

    	      if (newVal > 59) {
    	        this.incrementMinute(true);
    	        this.second = newVal - 60;
    	      } else {
    	        this.second = newVal;
    	      }
    	      this.update();
    	    },

    	    remove: function() {
    	      $('document').off('.timepicker');
    	      if (this.$widget) {
    	        this.$widget.remove();
    	      }
    	      delete this.$element.data().timepicker;
    	    },

    	    setDefaultTime: function(defaultTime){
    	      if (!this.$element.val()) {
    	        if (defaultTime === 'current') {
    	          var dTime = new Date(),
    	            hours = dTime.getHours(),
    	            minutes = Math.floor(dTime.getMinutes() / this.minuteStep) * this.minuteStep,
    	            seconds = Math.floor(dTime.getSeconds() / this.secondStep) * this.secondStep,
    	            meridian = 'AM';

    	          if (this.showMeridian) {
    	            if (hours === 0) {
    	              hours = 12;
    	            } else if (hours >= 12) {
    	              if (hours > 12) {
    	                hours = hours - 12;
    	              }
    	              meridian = 'PM';
    	            } else {
    	              meridian = 'AM';
    	            }
    	          }

    	          this.hour = hours;
    	          this.minute = minutes;
    	          this.second = seconds;
    	          this.meridian = meridian;

    	          this.update();

    	        } else if (defaultTime === false) {
    	          this.hour = 0;
    	          this.minute = 0;
    	          this.second = 0;
    	          this.meridian = 'AM';
    	        } else {
    	          this.setTime(defaultTime);
    	        }
    	      } else {
    	        this.updateFromElementVal();
    	      }
    	    },

    	    setTime: function(time) {
    	      var arr,
    	        timeArray;

    	      if (this.showMeridian) {
    	        arr = time.split(' ');
    	        timeArray = arr[0].split(':');
    	        this.meridian = arr[1];
    	      } else {
    	        timeArray = time.split(':');
    	      }

    	      this.hour = parseInt(timeArray[0], 10);
    	      this.minute = parseInt(timeArray[1], 10);
    	      this.second = parseInt(timeArray[2], 10);

    	      if (isNaN(this.hour)) {
    	        this.hour = 0;
    	      }
    	      if (isNaN(this.minute)) {
    	        this.minute = 0;
    	      }

    	      if (this.showMeridian) {
    	        if (this.hour > 12) {
    	          this.hour = 12;
    	        } else if (this.hour < 1) {
    	          this.hour = 12;
    	        }

    	        if (this.meridian === 'am' || this.meridian === 'a') {
    	          this.meridian = 'AM';
    	        } else if (this.meridian === 'pm' || this.meridian === 'p') {
    	          this.meridian = 'PM';
    	        }

    	        if (this.meridian !== 'AM' && this.meridian !== 'PM') {
    	          this.meridian = 'AM';
    	        }
    	      } else {
    	         if (this.hour >= 24) {
    	          this.hour = 23;
    	        } else if (this.hour < 0) {
    	          this.hour = 0;
    	        }
    	      }

    	      if (this.minute < 0) {
    	        this.minute = 0;
    	      } else if (this.minute >= 60) {
    	        this.minute = 59;
    	      }

    	      if (this.showSeconds) {
    	        if (isNaN(this.second)) {
    	          this.second = 0;
    	        } else if (this.second < 0) {
    	          this.second = 0;
    	        } else if (this.second >= 60) {
    	          this.second = 59;
    	        }
    	      }

    	      this.update();
    	    },

    	    showWidget: function() {
    	      if (this.isOpen) {
    	        return;
    	      }

    	      var self = this;
    	      $(document).on('mousedown.timepicker', function (e) {
    	        // Clicked outside the timepicker, hide it
    	        if ($(e.target).closest('.bootstrap-timepicker-widget').length === 0) {
    	          self.hideWidget();
    	        }
    	      });

    	      this.$element.trigger({
    	        'type': 'show.timepicker',
    	        'time': {
    	            'value': this.getTime(),
    	            'hours': this.hour,
    	            'minutes': this.minute,
    	            'seconds': this.second,
    	            'meridian': this.meridian
    	         }
    	      });

    	      if (this.disableFocus) {
    	        this.$element.blur();
    	      }

    	      this.updateFromElementVal();

    	      if (this.template === 'modal') {
    	        this.$widget.modal('show').on('hidden', $.proxy(this.hideWidget, this));
    	      } else {
    	        if (this.isOpen === false) {
    	          this.$widget.addClass('open');
    	        }
    	      }

    	      this.isOpen = true;
    	    },

    	    toggleMeridian: function() {
    	      this.meridian = this.meridian === 'AM' ? 'PM' : 'AM';
    	      this.update();
    	    },

    	    update: function() {
    	      this.$element.trigger({
    	        'type': 'changeTime.timepicker',
    	        'time': {
    	            'value': this.getTime(),
    	            'hours': this.hour,
    	            'minutes': this.minute,
    	            'seconds': this.second,
    	            'meridian': this.meridian
    	         }
    	      });

    	      this.updateElement();
    	      this.updateWidget();
    	    },

    	    updateElement: function() {
    	      this.$element.val(this.getTime()).change();
    	    },

    	    updateFromElementVal: function() {
    				var val = this.$element.val();

    				if (val) {
    					this.setTime(val);
    				}
    	    },

    	    updateWidget: function() {
    	      if (this.$widget === false) {
    	        return;
    	      }

    	      var hour = this.hour < 10 ? '0' + this.hour : this.hour,
    	          minute = this.minute < 10 ? '0' + this.minute : this.minute,
    	          second = this.second < 10 ? '0' + this.second : this.second;

    	      if (this.showInputs) {
    	        this.$widget.find('input.bootstrap-timepicker-hour').val(hour);
    	        this.$widget.find('input.bootstrap-timepicker-minute').val(minute);

    	        if (this.showSeconds) {
    	          this.$widget.find('input.bootstrap-timepicker-second').val(second);
    	        }
    	        if (this.showMeridian) {
    	          this.$widget.find('input.bootstrap-timepicker-meridian').val(this.meridian);
    	        }
    	      } else {
    	        this.$widget.find('span.bootstrap-timepicker-hour').text(hour);
    	        this.$widget.find('span.bootstrap-timepicker-minute').text(minute);

    	        if (this.showSeconds) {
    	          this.$widget.find('span.bootstrap-timepicker-second').text(second);
    	        }
    	        if (this.showMeridian) {
    	          this.$widget.find('span.bootstrap-timepicker-meridian').text(this.meridian);
    	        }
    	      }
    	    },

    	    updateFromWidgetInputs: function() {
    	      if (this.$widget === false) {
    	        return;
    	      }
    	      var time = $('input.bootstrap-timepicker-hour', this.$widget).val() + ':' +
    	        $('input.bootstrap-timepicker-minute', this.$widget).val() +
    	        (this.showSeconds ? ':' + $('input.bootstrap-timepicker-second', this.$widget).val() : '') +
    	        (this.showMeridian ? ' ' + $('input.bootstrap-timepicker-meridian', this.$widget).val() : '');

    	      this.setTime(time);
    	    },

    	    widgetClick: function(e) {
    	      e.stopPropagation();
    	      e.preventDefault();

    	      var action = $(e.target).closest('a').data('action');
    	      if (action) {
    	        this[action]();
    	      }
    	    },

    	    widgetKeydown: function(e) {
    	      var $input = $(e.target).closest('input'),
    	          name = $input.attr('name');

    	      switch (e.keyCode) {
    	        case 9: //tab
    	          if (this.showMeridian) {
    	            if (name === 'meridian') {
    	              return this.hideWidget();
    	            }
    	          } else {
    	            if (this.showSeconds) {
    	              if (name === 'second') {
    	                return this.hideWidget();
    	              }
    	            } else {
    	              if (name === 'minute') {
    	                return this.hideWidget();
    	              }
    	            }
    	          }

    	          this.updateFromWidgetInputs();
    	        break;
    	        case 27: // escape
    	          this.hideWidget();
    	        break;
    	        case 38: // up arrow
    	          e.preventDefault();
    	          switch (name) {
    	            case 'hour':
    	              this.incrementHour();
    	            break;
    	            case 'minute':
    	              this.incrementMinute();
    	            break;
    	            case 'second':
    	              this.incrementSecond();
    	            break;
    	            case 'meridian':
    	              this.toggleMeridian();
    	            break;
    	          }
    	        break;
    	        case 40: // down arrow
    	          e.preventDefault();
    	          switch (name) {
    	            case 'hour':
    	              this.decrementHour();
    	            break;
    	            case 'minute':
    	              this.decrementMinute();
    	            break;
    	            case 'second':
    	              this.decrementSecond();
    	            break;
    	            case 'meridian':
    	              this.toggleMeridian();
    	            break;
    	          }
    	        break;
    	      }
    	    }
    	  };


    	  //TIMEPICKER PLUGIN DEFINITION
    	  $.fn.timepicker = function(option) {
    	    var args = Array.apply(null, arguments);
    	    args.shift();
    	    return this.each(function() {
    	      var $this = $(this),
    	        data = $this.data('timepicker'),
    	        options = typeof option === 'object' && option;

    	      if (!data) {
    	        $this.data('timepicker', (data = new Timepicker(this, $.extend({}, $.fn.timepicker.defaults, options, $(this).data()))));
    	      }

    	      if (typeof option === 'string') {
    	        data[option].apply(data, args);
    	      }
    	    });
    	  };

    	  $.fn.timepicker.defaults = {
    	    defaultTime: 'current',
    	    disableFocus: false,
    	    isOpen: false,
    	    minuteStep: 15,
    	    modalBackdrop: false,
    	    secondStep: 15,
    	    showSeconds: false,
    	    showInputs: true,
    	    showMeridian: true,
    	    template: 'dropdown',
    	    appendWidgetTo: '.bootstrap-timepicker'
    	  };

    	  $.fn.timepicker.Constructor = Timepicker;

    	})($, window, document);
} );

timely.define('libs/timepicker_helper',
	[
		"jquery_timely",
		"external_libs/moment",
		"external_libs/bootstrap_timepicker"
	],
	function( $, moment, domReady ) {
	

	/**
	 * Event handler for timepicker's first focus. Initialize widget.
	 */
	var init_timepicker = function() {
		var $this = $( this );
		if ( typeof $this.data( 'timepicker' ) === 'undefined' ) {

			// If the input field lacks a value, provide current time (in UTC).
			if ( $this.val() === '' ) {
				var def_time = moment().utc();
				var time_format = $this.data( 'showMeridian' ) ? 'hh:mm A' : 'HH:mm';
				$this.val( def_time.format( time_format ) );
			}

			// Activate timepicker.
			$this
				.timepicker( {
					showMeridian: $this.data( 'showMeridian' ),
					showInputs: false,
					defaultTime: $this.val()
				} )
				// Toggle class on root element to disable "overflow: none" on Bootstrap
				// Collapse elements while timepicker is visible.
				.on( 'show.timepicker', function() {
					$this.parents( '.collapse' ).addClass( 'ai1ec-timepicker-visible' );
				} )
				.on( 'hide.timepicker', function() {
					$this.parents( '.collapse' ).removeClass( 'ai1ec-timepicker-visible' );
				} );

			// Wrap timepicker in div.timely to avoid polluting global namespace.
			var $widget = $this.data( 'timepicker' ).$widget;
			$widget.wrapAll( '<div class="timely">' );

			// Apply alignment class.
			var alignment = $this.data( 'alignment' );
			if ( typeof alignment === 'undefined' ) alignment = 'left';
			$widget.addClass( 'ai1ec-alignment-' + alignment );
		}
	};

	/**
	 * Initialize any tag selectors on the page. Limit search to $container
	 * parent element if provided.
	 *
	 * @param  {object} $container jQuery object representing parent container
	 */
	var init = function( $container ) {
		if ( typeof $container === 'undefined' ) {
			$container = $( document );
		}

		// Initialize timepickers only on first focus to provide default time value
		// if empty.
		$container.on( 'focus', '.ai1ec-timepicker', init_timepicker );
	};

	return {
		init: init
	};
} );

timely.define('libs/recaptcha',
		[
		 "jquery_timely",
		 "//www.google.com/recaptcha/api/js/recaptcha_ajax.js"
		 ],
		 function( $ ) {
	 // jshint ;_;

	/**
	 * Initialize reCAPTCHA field if it hasn't been already.
	 */
	var init_recaptcha = function( $form ) {
		var $recaptcha = $( '.ai1ec-recaptcha', $form );

		if ( $recaptcha.length === 0 ) {
			return;
		}
		if ( $recaptcha.is( '.ai1ec-initializing, .ai1ec-initialized' ) ) {
			return;
		}
		if ( typeof Recaptcha === 'undefined' ) {
			return;
		}
		Recaptcha.create(
			$recaptcha.data( 'recaptchaKey' ),
			$recaptcha[0],
			{
				theme: 'white',
				callback: function() {
					$( '#recaptcha_response_field', $recaptcha )
						.attr( 'placeholder', $recaptcha.data( 'placeholder' ) );
					$recaptcha
						.removeClass( 'ai1ec-initializing' )
						.addClass( 'ai1ec-initialized' );
				},
			}
		);
		$recaptcha.addClass( 'ai1ec-initializing' );
	};
	return {
		init_recaptcha : init_recaptcha
	};
} );

timely.define('external_libs/Placeholders', [],
	function() {

		
/*
 * The MIT License
 *
 * Copyright (c) 2012 James Allardice
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

		// Cross-browser DOM event binding
		function addEventListener(elem, event, fn) {
			if (elem.addEventListener) {
				return elem.addEventListener(event, fn, false);
			}
			if (elem.attachEvent) {
				return elem.attachEvent("on" + event, fn);
			}
		}

		// Check whether an item is in an array (we don't use Array.prototype.indexOf so we don't clobber any existing polyfills - this is a really simple alternative)
		function inArray(arr, item) {
			var i, len;
			for (i = 0, len = arr.length; i < len; i++) {
				if (arr[i] === item) {
					return true;
				}
			}
			return false;
		}

		// Move the caret to the index position specified. Assumes that the element has focus
		function moveCaret(elem, index) {
			var range;
			if (elem.createTextRange) {
				range = elem.createTextRange();
				range.move("character", index);
				range.select();
			} else if (elem.selectionStart) {
				elem.focus();
				elem.setSelectionRange(index, index);
			}
		}

		// Attempt to change the type property of an input element
		function changeType(elem, type) {
			try {
				elem.type = type;
				return true;
			} catch (e) {
						// You can't change input type in IE8 and below
						return false;
					}
				}

		// Expose public methods
		var Placeholders = {
			Utils: {
				addEventListener: addEventListener,
				inArray: inArray,
				moveCaret: moveCaret,
				changeType: changeType
			}
		};

		var validTypes = [
		"text",
		"search",
		"url",
		"tel",
		"email",
		"password",
		"number",
		"textarea"
		],

				// The list of keycodes that are not allowed when the polyfill is configured to hide-on-input
				badKeys = [

						// The following keys all cause the caret to jump to the end of the input value
						27, // Escape
						33, // Page up
						34, // Page down
						35, // End
						36, // Home

						// Arrow keys allow you to move the caret manually, which should be prevented when the placeholder is visible
						37, // Left
						38, // Up
						39, // Right
						40, // Down

						// The following keys allow you to modify the placeholder text by removing characters, which should be prevented when the placeholder is visible
						8, // Backspace
						46 // Delete
						],

				// Styling variables
				placeholderStyleColor = "#ccc",
				placeholderClassName = "placeholdersjs",
				classNameRegExp = new RegExp("\\b" + placeholderClassName + "\\b"),

				// These will hold references to all elements that can be affected. NodeList objects are live, so we only need to get those references once
				inputs, textareas,

				// The various data-* attributes used by the polyfill
				ATTR_CURRENT_VAL = "data-placeholder-value",
				ATTR_ACTIVE = "data-placeholder-active",
				ATTR_INPUT_TYPE = "data-placeholder-type",
				ATTR_FORM_HANDLED = "data-placeholder-submit",
				ATTR_EVENTS_BOUND = "data-placeholder-bound",
				ATTR_OPTION_FOCUS = "data-placeholder-focus",
				ATTR_OPTION_LIVE = "data-placeholder-live",

				// Various other variables used throughout the rest of the script
				test = document.createElement("input"),
				head = document.getElementsByTagName("head")[0],
				root = document.documentElement,
				Utils = Placeholders.Utils,
				hideOnInput, liveUpdates, keydownVal, styleElem, styleRules, placeholder, timer, form, elem, len, i;

		// Hide the placeholder value on a single element. Returns true if the placeholder was hidden and false if it was not (because it wasn't visible in the first place)
		function hidePlaceholder(elem) {
			var type;
			if (elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {
				elem.setAttribute(ATTR_ACTIVE, "false");
				elem.value = "";
				elem.className = elem.className.replace(classNameRegExp, "");

						// If the polyfill has changed the type of the element we need to change it back
						type = elem.getAttribute(ATTR_INPUT_TYPE);
						if (type) {
							elem.type = type;
						}
						return true;
					}
					return false;
				}

		// Show the placeholder value on a single element. Returns true if the placeholder was shown and false if it was not (because it was already visible)
		function showPlaceholder(elem) {
			var type;
			if (elem.value === "") {
				elem.setAttribute(ATTR_ACTIVE, "true");
				elem.value = elem.getAttribute(ATTR_CURRENT_VAL);
				elem.className += " " + placeholderClassName;

						// If the type of element needs to change, change it (e.g. password inputs)
						type = elem.getAttribute(ATTR_INPUT_TYPE);
						if (type) {
							elem.type = "text";
						} else if (elem.type === "password") {
							if (Utils.changeType(elem, "text")) {
								elem.setAttribute(ATTR_INPUT_TYPE, "password");
							}
						}
						return true;
					}
					return false;
				}

				function handleElem(node, callback) {

					var inputs, textareas, elem, len, i;

				// Check if the passed in node is an input/textarea (in which case it can't have any affected descendants)
				if (node && node.getAttribute(ATTR_CURRENT_VAL)) {
					callback(node);
				} else {

						// If an element was passed in, get all affected descendants. Otherwise, get all affected elements in document
						inputs = node ? node.getElementsByTagName("input") : inputs;
						textareas = node ? node.getElementsByTagName("textarea") : textareas;

						// Run the callback for each element
						for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
							elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];
							callback(elem);
						}
					}
				}

		// Return all affected elements to their normal state (remove placeholder value if present)
		function disablePlaceholders(node) {
			handleElem(node, hidePlaceholder);
		}

		// Show the placeholder value on all appropriate elements
		function enablePlaceholders(node) {
			handleElem(node, showPlaceholder);
		}

		// Returns a function that is used as a focus event handler
		function makeFocusHandler(elem) {
			return function () {

						// Only hide the placeholder value if the (default) hide-on-focus behaviour is enabled
						if (hideOnInput && elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {

								// Move the caret to the start of the input (this mimics the behaviour of all browsers that do not hide the placeholder on focus)
								Utils.moveCaret(elem, 0);

							} else {

								// Remove the placeholder
								hidePlaceholder(elem);
							}
						};
					}

		// Returns a function that is used as a blur event handler
		function makeBlurHandler(elem) {
			return function () {
				showPlaceholder(elem);
			};
		}

		// Functions that are used as a event handlers when the hide-on-input behaviour has been activated - very basic implementation of the "input" event
		function makeKeydownHandler(elem) {
			return function (e) {
				keydownVal = elem.value;

				//Prevent the use of the arrow keys (try to keep the cursor before the placeholder)
				if (elem.getAttribute(ATTR_ACTIVE) === "true") {
					return !(keydownVal === elem.getAttribute(ATTR_CURRENT_VAL) && Utils.inArray(badKeys, e.keyCode));
				}
			};
		}
		function makeKeyupHandler(elem) {
			return function () {
				var type;

				if (elem.getAttribute(ATTR_ACTIVE) === "true" && elem.value !== keydownVal) {

						// Remove the placeholder
						elem.className = elem.className.replace(classNameRegExp, "");
						elem.value = elem.value.replace(elem.getAttribute(ATTR_CURRENT_VAL), "");
						elem.setAttribute(ATTR_ACTIVE, false);

						// If the type of element needs to change, change it (e.g. password inputs)
						type = elem.getAttribute(ATTR_INPUT_TYPE);
						if (type) {
							elem.type = type;
						}
					}

				// If the element is now empty we need to show the placeholder
				if (elem.value === "") {
					elem.blur();
					Utils.moveCaret(elem, 0);
				}
			};
		}
		function makeClickHandler(elem) {
			return function () {
				if (elem === document.activeElement && elem.value === elem.getAttribute(ATTR_CURRENT_VAL) && elem.getAttribute(ATTR_ACTIVE) === "true") {
					Utils.moveCaret(elem, 0);
				}
			};
		}

		// Returns a function that is used as a submit event handler on form elements that have children affected by this polyfill
		function makeSubmitHandler(form) {
			return function () {
				// Turn off placeholders on all appropriate descendant elements
				disablePlaceholders(form);
			};
		}

		// Bind event handlers to an element that we need to affect with the polyfill
		function newElement(elem) {

				// If the element is part of a form, make sure the placeholder string is not submitted as a value
				if (elem.form) {
					form = elem.form;

					// Set a flag on the form so we know it's been handled (forms can contain multiple inputs)
					if (!form.getAttribute(ATTR_FORM_HANDLED)) {
						Utils.addEventListener(form, "submit", makeSubmitHandler(form));
						form.setAttribute(ATTR_FORM_HANDLED, "true");
					}
				}

				// Bind event handlers to the element so we can hide/show the placeholder as appropriate
				Utils.addEventListener(elem, "focus", makeFocusHandler(elem));
				Utils.addEventListener(elem, "blur", makeBlurHandler(elem));

				// If the placeholder should hide on input rather than on focus we need additional event handlers
				if (hideOnInput) {
					Utils.addEventListener(elem, "keydown", makeKeydownHandler(elem));
					Utils.addEventListener(elem, "keyup", makeKeyupHandler(elem));
					Utils.addEventListener(elem, "click", makeClickHandler(elem));
				}

				// Remember that we've bound event handlers to this element
				elem.setAttribute(ATTR_EVENTS_BOUND, "true");
				elem.setAttribute(ATTR_CURRENT_VAL, placeholder);

				// If the element doesn't have a value, set it to the placeholder string
				showPlaceholder(elem);
			}

			if (test.placeholder === void 0) {

				// Get references to all the input and textarea elements currently in the DOM (live NodeList objects to we only need to do this once)
				inputs = document.getElementsByTagName("input");
				textareas = document.getElementsByTagName("textarea");

				// Get any settings declared as data-* attributes on the root element (currently the only options are whether to hide the placeholder on focus or input and whether to auto-update)
				hideOnInput = root.getAttribute(ATTR_OPTION_FOCUS) === "false";
				liveUpdates = root.getAttribute(ATTR_OPTION_LIVE) !== "false";

				// Create style element for placeholder styles (instead of directly setting style properties on elements - allows for better flexibility alongside user-defined styles)
				styleElem = document.createElement("style");
				styleElem.type = "text/css";

				// Create style rules as text node
				styleRules = document.createTextNode("." + placeholderClassName + " { color:" + placeholderStyleColor + "; }");

				// Append style rules to newly created stylesheet
				if (styleElem.styleSheet) {
					styleElem.styleSheet.cssText = styleRules.nodeValue;
				} else {
					styleElem.appendChild(styleRules);
				}

				// Prepend new style element to the head (before any existing stylesheets, so user-defined rules take precedence)
				head.insertBefore(styleElem, head.firstChild);

				// Set up the placeholders
				for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
					elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];

					// Only apply the polyfill if this element is of a type that supports placeholders, and has a placeholder attribute with a non-empty value
					placeholder = elem.getAttribute("placeholder");
					if (placeholder && Utils.inArray(validTypes, elem.type)) {
						newElement(elem);
					}
				}

				// If enabled, the polyfill will repeatedly check for changed/added elements and apply to those as well
				timer = setInterval(function () {
				for (i = 0, len = inputs.length + textareas.length; i < len; i++) {
					elem = i < inputs.length ? inputs[i] : textareas[i - inputs.length];

					// Only apply the polyfill if this element is of a type that supports placeholders, and has a placeholder attribute with a non-empty value
					placeholder = elem.getAttribute("placeholder");
					if (placeholder && Utils.inArray(validTypes, elem.type)) {

						// If the element hasn't had event handlers bound to it then add them
						if (!elem.getAttribute(ATTR_EVENTS_BOUND)) {
							newElement(elem);
						}

						// If the placeholder value has changed or not been initialised yet we need to update the display
						if (placeholder !== elem.getAttribute(ATTR_CURRENT_VAL) || (elem.type === "password" && !elem.getAttribute(ATTR_INPUT_TYPE))) {

							// Attempt to change the type of password inputs (fails in IE < 9)
							if (elem.type === "password" && !elem.getAttribute(ATTR_INPUT_TYPE) && Utils.changeType(elem, "text")) {
								elem.setAttribute(ATTR_INPUT_TYPE, "password");
							}

							// If the placeholder value has changed and the placeholder is currently on display we need to change it
							if (elem.value === elem.getAttribute(ATTR_CURRENT_VAL)) {
								elem.value = placeholder;
							}

							// Keep a reference to the current placeholder value in case it changes via another script
							elem.setAttribute(ATTR_CURRENT_VAL, placeholder);
						}
					}
				}

				// If live updates are not enabled cancel the timer
				if (!liveUpdates) {
					clearInterval(timer);
				}
			}, 100);
		}

		// Expose public methods
		Placeholders.disable = disablePlaceholders;
		Placeholders.enable = enablePlaceholders;

		return Placeholders;
} );

/**
 * Bulgarian translation for bootstrap-datepicker
 * Apostol Apostolov <apostol.s.apostolov@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.bg', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['bg'] = {
		days: ["Неделя", "Понеделник", "Вторник", "Сряда", "Четвъртък", "Петък", "Събота", "Неделя"],
		daysShort: ["Нед", "Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"],
		daysMin: ["Н", "П", "В", "С", "Ч", "П", "С", "Н"],
		months: ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"],
		monthsShort: ["Ян", "Фев", "Мар", "Апр", "Май", "Юни", "Юли", "Авг", "Сеп", "Окт", "Ное", "Дек"],
		today: "днес"
			} } };
} );

/**
 * Brazilian translation for bootstrap-datepicker
 * Cauan Cabral <cauan@radig.com.br>
 */
timely.define('external_libs/locales/bootstrap-datepicker.br', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['br'] = {
		days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
		daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
		daysMin: ["Do", "Se", "Te", "Qu", "Qu", "Se", "Sa", "Do"],
		months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
			} } };
} );

/**
 * Czech translation for bootstrap-datepicker
 * Matěj Koubík <matej@koubik.name>
 */
timely.define('external_libs/locales/bootstrap-datepicker.cs', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['cs'] = {
		days: ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"],
		daysShort: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
		daysMin: ["N", "P", "Ú", "St", "Č", "P", "So", "N"],
		months: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
		monthsShort: ["Led", "Úno", "Bře", "Dub", "Kvě", "Čer", "Čnc", "Srp", "Zář", "Říj", "Lis", "Pro"],
		today: "Dnes"
			} } };
} );

/**
 * Danish translation for bootstrap-datepicker
 * Christian Pedersen <http://github.com/chripede>
 */
timely.define('external_libs/locales/bootstrap-datepicker.da', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['da'] = {
		days: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
		daysShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
		daysMin: ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"],
		months: ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
		today: "I Dag"
			} } };
} );

/**
 * German translation for bootstrap-datepicker
 * Sam Zurcher <sam@orelias.ch>
 */
timely.define('external_libs/locales/bootstrap-datepicker.de', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['de'] = {
		days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
		daysShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam", "Son"],
		daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
		months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		monthsShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
		today: "Heute"
			} } };
} );

/**
 * Spanish translation for bootstrap-datepicker
 * Bruno Bonamin <bruno.bonamin@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.es', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['es'] = {
		days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
		daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
		daysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"],
		months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
		monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
		today: "Hoy"
			} } };
} );

/**
 * Finnish translation for bootstrap-datepicker
 * Jaakko Salonen <https://github.com/jsalonen>
 */
timely.define('external_libs/locales/bootstrap-datepicker.fi', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['fi'] = {
		days: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai", "sunnuntai"],
		daysShort: ["sun", "maa", "tii", "kes", "tor", "per", "lau", "sun"],
		daysMin: ["su", "ma", "ti", "ke", "to", "pe", "la", "su"],
		months: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
		monthsShort: ["tam", "hel", "maa", "huh", "tou", "kes", "hei", "elo", "syy", "lok", "mar", "jou"],
		today: "tänään"
			} } };
} );

/**
 * French translation for bootstrap-datepicker
 * Nico Mollet <nico.mollet@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.fr', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['fr'] = {
		days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
		daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
		daysMin: ["D", "L", "Ma", "Me", "J", "V", "S", "D"],
		months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
		monthsShort: ["Jan", "Fev", "Mar", "Avr", "Mai", "Jui", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"],
		today: "Aujourd'hui"
			} } };
} );

/**
 * Bahasa translation for bootstrap-datepicker
 * Azwar Akbar <azwar.akbar@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.id', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['id'] = {
		days: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
		daysShort: ["Mgu", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Mgu"],
		daysMin: ["Mg", "Sn", "Sl", "Ra", "Ka", "Ju", "Sa", "Mg"],
		months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"]
			} } };
} );

/**
 * Icelandic translation for bootstrap-datepicker
 * Hinrik Örn Sigurðsson <hinrik.sig@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.is', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['is'] = {
		days: ["Sunnudagur", "Mánudagur", "Þriðjudagur", "Miðvikudagur", "Fimmtudagur", "Föstudagur", "Laugardagur", "Sunnudagur"],
		daysShort: ["Sun", "Mán", "Þri", "Mið", "Fim", "Fös", "Lau", "Sun"],
		daysMin: ["Su", "Má", "Þr", "Mi", "Fi", "Fö", "La", "Su"],
		months: ["Janúar", "Febrúar", "Mars", "Apríl", "Maí", "Júní", "Júlí", "Ágúst", "September", "Október", "Nóvember", "Desember"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Maí", "Jún", "Júl", "Ágú", "Sep", "Okt", "Nóv", "Des"],
		today: "Í Dag"
			} } };
} );

/**
 * Italian translation for bootstrap-datepicker
 * Enrico Rubboli <rubboli@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.it', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['it'] = {
		days: ["Domenica", "Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica"],
		daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
		daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
		months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
		monthsShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
		today: "Oggi"
			} } };
} );

/**
 * Japanese translation for bootstrap-datepicker
 * Norio Suzuki <https://github.com/suzuki/>
 */
timely.define('external_libs/locales/bootstrap-datepicker.ja', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['ja'] = {
		days: ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"],
		daysShort: ["日", "月", "火", "水", "木", "金", "土", "日"],
		daysMin: ["日", "月", "火", "水", "木", "金", "土", "日"],
		months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
			} } };
} );

/**
 * Korean translation for bootstrap-datepicker
 * Gu Youn <http://github.com/guyoun>
 */
timely.define('external_libs/locales/bootstrap-datepicker.kr', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['kr'] = {
		days: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"],
		daysShort: ["일", "월", "화", "수", "목", "금", "토", "일"],
		daysMin: ["일", "월", "화", "수", "목", "금", "토", "일"],
		months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
		monthsShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
			} } };
} );

/**
 * Lithuanian translation for bootstrap-datepicker
 * Šarūnas Gliebus <ssharunas@yahoo.co.uk>
 */

timely.define('external_libs/locales/bootstrap-datepicker.lt', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['lt'] = {
        days: ["Sekmadienis", "Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis", "Sekmadienis"],
        daysShort: ["S", "Pr", "A", "T", "K", "Pn", "Š", "S"],
        daysMin: ["Sk", "Pr", "An", "Tr", "Ke", "Pn", "Št", "Sk"],
        months: ["Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis"],
        monthsShort: ["Sau", "Vas", "Kov", "Bal", "Geg", "Bir", "Lie", "Rugp", "Rugs", "Spa", "Lap", "Gru"],
        weekStart: 1
    		} } };
} );

/**
 * Latvian translation for bootstrap-datepicker
 * Artis Avotins <artis@apit.lv>
 */

timely.define('external_libs/locales/bootstrap-datepicker.lv', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['lv'] = {
        days: ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena", "Svētdiena"],
        daysShort: ["Sv", "P", "O", "T", "C", "Pk", "S", "Sv"],
        daysMin: ["Sv", "Pr", "Ot", "Tr", "Ce", "Pk", "St", "Sv"],
        months: ["Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec."],
        today: "Šodien",
        weekStart: 1
    		} } };
} );

/**
 * Malay translation for bootstrap-datepicker
 * Ateman Faiz <noorulfaiz@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.ms', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['ms'] = {
		days: ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"],
		daysShort: ["Aha", "Isn", "Sel", "Rab", "Kha", "Jum", "Sab", "Aha"],
		daysMin: ["Ah", "Is", "Se", "Ra", "Kh", "Ju", "Sa", "Ah"],
		months: ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"],
		today: "Hari Ini"
			} } };
} );

/**
 * Norwegian (bokmål) translation for bootstrap-datepicker
 * Fredrik Sundmyhr <http://github.com/fsundmyhr>
 */
timely.define('external_libs/locales/bootstrap-datepicker.nb', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['nb'] = {
		days: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
		daysShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
		daysMin: ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"],
		months: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"],
		today: "I Dag"
			} } };
} );

/**
 * Dutch translation for bootstrap-datepicker
 * Reinier Goltstein <mrgoltstein@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.nl', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['nl'] = {
		days: ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"],
		daysShort: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
		daysMin: ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
		months: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
		today: "Vandaag"
			} } };
} );

/**
 * Polish translation for bootstrap-datepicker
 * Robert <rtpm@gazeta.pl>
 */
timely.define('external_libs/locales/bootstrap-datepicker.pl', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['pl'] = {
                days: ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"],
                daysShort: ["Nie", "Pn", "Wt", "Śr", "Czw", "Pt", "So", "Nie"],
                daysMin: ["N", "Pn", "Wt", "Śr", "Cz", "Pt", "So", "N"],
                months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
                monthsShort: ["Sty", "Lu", "Mar", "Kw", "Maj", "Cze", "Lip", "Sie", "Wrz", "Pa", "Lis", "Gru"],
                today: "Dzisiaj"
        		} } };
} );

/**
 * Brazilian translation for bootstrap-datepicker
 * Cauan Cabral <cauan@radig.com.br>
 */
timely.define('external_libs/locales/bootstrap-datepicker.pt-BR', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['pt-BR'] = {
		days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
		daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
		daysMin: ["Do", "Se", "Te", "Qu", "Qu", "Se", "Sa", "Do"],
		months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
		today: "Hoje"
			} } };
} );

/**
 * Portuguese translation for bootstrap-datepicker
 * Original code: Cauan Cabral <cauan@radig.com.br>
 * Tiago Melo <tiago.blackcode@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.pt', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['pt'] = {
		days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
		daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
		daysMin: ["Do", "Se", "Te", "Qu", "Qu", "Se", "Sa", "Do"],
		months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
			} } };
} );

/**
 * Russian translation for bootstrap-datepicker
 * Victor Taranenko <darwin@snowdale.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.ru', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['ru'] = {
		days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
		daysShort: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб", "Вск"],
		daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
		months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
		monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
		today: "Сегодня"
			} } };
} );

/**
 * Slovene translation for bootstrap-datepicker
 * Gregor Rudolf <gregor.rudolf@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.sl', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['sl'] = {
		days: ["Nedelja", "Ponedeljek", "Torek", "Sreda", "Četrtek", "Petek", "Sobota", "Nedelja"],
		daysShort: ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob", "Ned"],
		daysMin: ["Ne", "Po", "To", "Sr", "Če", "Pe", "So", "Ne"],
		months: ["Januar", "Februar", "Marec", "April", "Maj", "Junij", "Julij", "Avgust", "September", "Oktober", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"],
		today: "Danes"
			} } };
} );

/**
 * Swedish translation for bootstrap-datepicker
 * Patrik Ragnarsson <patrik@starkast.net>
 */
timely.define('external_libs/locales/bootstrap-datepicker.sv', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['sv'] = {
		days: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"],
		daysShort: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"],
		daysMin: ["Sö", "Må", "Ti", "On", "To", "Fr", "Lö", "Sö"],
		months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
		today: "I Dag"
			} } };
} );

/**
 * Thai translation for bootstrap-datepicker
 * Suchau Jiraprapot <seroz24@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.th', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['th'] = {
		days: ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"],
		daysShort: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"],
		daysMin: ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"],
		months: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
		monthsShort: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."],
		today: "วันนี้"
			} } };
} );

/**
 * Turkish translation for bootstrap-datepicker
 * Serkan Algur <kaisercrazy_2@hotmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.tr', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['tr'] = {
		days: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
		daysShort: ["Pz", "Pzt", "Sal", "Çrş", "Prş", "Cu", "Cts", "Pz"],
		daysMin: ["Pz", "Pzt", "Sa", "Çr", "Pr", "Cu", "Ct", "Pz"],
		months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
		monthsShort: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
		today: "Bugün"
			} } };
} );


/**
 * Simplified Chinese translation for bootstrap-datepicker
 * Yuan Cheung <advanimal@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.zh-CN', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['zh-CN'] = {
				days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
			daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
			daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
			months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			today: "今日"
			} } };
} );

/**
 * Traditional Chinese translation for bootstrap-datepicker
 * Rung-Sheng Jang <daniel@i-trend.co.cc>
 */
timely.define('external_libs/locales/bootstrap-datepicker.zh-TW', ["jquery_timely"], function( $ ) {
	return { localize: function() { $.fn.datepicker.dates['zh-TW'] = {
				days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
			daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
			daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
			months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
			} } };
} );

/* =========================================================
 * bootstrap-datepicker.js
 * http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Copyright 2012 Stefan Petre
 * Improvements by Andrew Rowls
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

timely.define('external_libs/bootstrap_datepicker',
	[
		"jquery_timely",
		"ai1ec_config",
		"external_libs/locales/bootstrap-datepicker.bg",
		"external_libs/locales/bootstrap-datepicker.br",
		"external_libs/locales/bootstrap-datepicker.cs",
		"external_libs/locales/bootstrap-datepicker.da",
		"external_libs/locales/bootstrap-datepicker.de",
		"external_libs/locales/bootstrap-datepicker.es",
		"external_libs/locales/bootstrap-datepicker.fi",
		"external_libs/locales/bootstrap-datepicker.fr",
		"external_libs/locales/bootstrap-datepicker.id",
		"external_libs/locales/bootstrap-datepicker.is",
		"external_libs/locales/bootstrap-datepicker.it",
		"external_libs/locales/bootstrap-datepicker.ja",
		"external_libs/locales/bootstrap-datepicker.kr",
		"external_libs/locales/bootstrap-datepicker.lt",
		"external_libs/locales/bootstrap-datepicker.lv",
		"external_libs/locales/bootstrap-datepicker.ms",
		"external_libs/locales/bootstrap-datepicker.nb",
		"external_libs/locales/bootstrap-datepicker.nl",
		"external_libs/locales/bootstrap-datepicker.pl",
		"external_libs/locales/bootstrap-datepicker.pt-BR",
		"external_libs/locales/bootstrap-datepicker.pt",
		"external_libs/locales/bootstrap-datepicker.ru",
		"external_libs/locales/bootstrap-datepicker.sl",
		"external_libs/locales/bootstrap-datepicker.sv",
		"external_libs/locales/bootstrap-datepicker.th",
		"external_libs/locales/bootstrap-datepicker.tr",
		"external_libs/locales/bootstrap-datepicker.zh-CN",
		"external_libs/locales/bootstrap-datepicker.zh-TW"
	],
	function(
		$,
		ai1ec_config
	) {

	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function UTCToday(){
		var today = new Date();
		return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
	}

	// Picker object

	var Datepicker = function(element, options) {
		var that = this;

		this.element = $(element);
		this.language = options.language||this.element.data('date-language')||ai1ec_config.language||"en";
		this.language = this.language in dates ? this.language : "en";
		this.format = DPGlobal.parseFormat(options.format||this.element.data('date-format')||'mm/dd/yyyy');
		this.picker = $(DPGlobal.template)
							.appendTo('body')
							.on({
								click: $.proxy(this.click, this)
							});
		this.isInput = this.element.is('input');
		this.component = this.element.is('.date') ? this.element.find('.add-on') : false;
		this.hasInput = this.component && this.element.find('input').length;
		if(this.component && this.component.length === 0)
			this.component = false;

		if (this.isInput) {
			this.element.on({
				focus: $.proxy(this.show, this),
				keyup: $.proxy(this.update, this),
				keydown: $.proxy(this.keydown, this)
			});
		} else {
			if (this.component && this.hasInput){
				// For components that are not readonly, allow keyboard nav
				this.element.find('input').on({
					focus: $.proxy(this.show, this),
					keyup: $.proxy(this.update, this),
					keydown: $.proxy(this.keydown, this)
				});

				this.component.on('click', $.proxy(this.show, this));
			} else {
				this.element.on('click', $.proxy(this.show, this));
			}
		}

		$(document).on('mousedown', function (e) {
			// Clicked outside the datepicker, hide it
			if ($(e.target).closest('.datepicker').length == 0) {
				that.hide();
			}
		});

		this.autoclose = false;
		if ('autoclose' in options) {
			this.autoclose = options.autoclose;
		} else if ('dateAutoclose' in this.element.data()) {
			this.autoclose = this.element.data('date-autoclose');
		}

		this.keyboardNavigation = true;
		if ('keyboardNavigation' in options) {
			this.keyboardNavigation = options.keyboardNavigation;
		} else if ('dateKeyboardNavigation' in this.element.data()) {
			this.keyboardNavigation = this.element.data('date-keyboard-navigation');
		}

		switch(options.startView || this.element.data('date-start-view')){
			case 2:
			case 'decade':
				this.viewMode = this.startViewMode = 2;
				break;
			case 1:
			case 'year':
				this.viewMode = this.startViewMode = 1;
				break;
			case 0:
			case 'month':
			default:
				this.viewMode = this.startViewMode = 0;
				break;
		}

		this.todayBtn = (options.todayBtn||this.element.data('date-today-btn')||false);
		this.todayHighlight = (options.todayHighlight||this.element.data('date-today-highlight')||false);

		this.weekStart = ((options.weekStart||this.element.data('date-weekstart')||dates[this.language].weekStart||0) % 7);
		this.weekEnd = ((this.weekStart + 6) % 7);
		this.startDate = -Infinity;
		this.endDate = Infinity;
		this.setStartDate(options.startDate||this.element.data('date-startdate'));
		this.setEndDate(options.endDate||this.element.data('date-enddate'));
		this.fillDow();
		this.fillMonths();
		this.update();
		this.showMode();
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		show: function(e) {
			this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.update();
			this.place();
			$(window).on('resize', $.proxy(this.place, this));
			if (e ) {
				e.stopPropagation();
				e.preventDefault();
			}
			this.element.trigger({
				type: 'show',
				date: this.date
			});
		},

		hide: function(e){
			this.picker.hide();
			$(window).off('resize', this.place);
			this.viewMode = this.startViewMode;
			this.showMode();
			if (!this.isInput) {
				$(document).off('mousedown', this.hide);
			}
			if (e && e.currentTarget.value)
				this.setValue();
			this.element.trigger({
				type: 'hide',
				date: this.date
			});
		},

		getDate: function() {
			var d = this.getUTCDate();
			return new Date(d.getTime() + (d.getTimezoneOffset()*60000))
		},

		getUTCDate: function() {
			return this.date;
		},

		setDate: function(d) {
			this.setUTCDate(new Date(d.getTime() - (d.getTimezoneOffset()*60000)));
		},

		setUTCDate: function(d) {
			this.date = d;
			this.setValue();
		},

		setValue: function() {
			var formatted = DPGlobal.formatDate(this.date, this.format, this.language);
			if (!this.isInput) {
				if (this.component){
					this.element.find('input').prop('value', formatted);
				}
				this.element.data('date', formatted);
			} else {
				this.element.prop('value', formatted);
			}
		},

		setStartDate: function(startDate){
			this.startDate = startDate||-Infinity;
			if (this.startDate !== -Infinity) {
				this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.language);
			}
			this.update();
			this.updateNavArrows();
		},

		setEndDate: function(endDate){
			this.endDate = endDate||Infinity;
			if (this.endDate !== Infinity) {
				this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.language);
			}
			this.update();
			this.updateNavArrows();
		},

		place: function(){
			var zIndex = parseInt(this.element.parents().filter(function() {
							return $(this).css('z-index') != 'auto';
						}).first().css('z-index'))+10;
			var offset = this.component ? this.component.offset() : this.element.offset();
			this.picker.css({
				top: offset.top + this.height,
				left: offset.left,
				zIndex: zIndex
			});
		},

		update: function(){
			this.date = DPGlobal.parseDate(
				this.isInput ? this.element.prop('value') : this.element.data('date') || this.element.find('input').prop('value'),
				this.format, this.language
			);
			if (this.date < this.startDate) {
				this.viewDate = new Date(this.startDate);
			} else if (this.date > this.endDate) {
				this.viewDate = new Date(this.endDate);
			} else {
				this.viewDate = new Date(this.date);
			}
			this.fill();
		},

		fillDow: function(){
			var dowCnt = this.weekStart;
			var html = '<tr>';
			while (dowCnt < this.weekStart + 7) {
				html += '<th class="dow">'+dates[this.language].daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.datepicker-days thead').append(html);
		},

		fillMonths: function(){
			var html = '';
			var i = 0
			while (i < 12) {
				html += '<span class="month">'+dates[this.language].monthsShort[i++]+'</span>';
			}
			this.picker.find('.datepicker-months td').html(html);
		},

		fill: function() {
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.startDate !== -Infinity ? this.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.startDate !== -Infinity ? this.startDate.getUTCMonth() : -Infinity,
				endYear = this.endDate !== Infinity ? this.endDate.getUTCFullYear() : Infinity,
				endMonth = this.endDate !== Infinity ? this.endDate.getUTCMonth() : Infinity,
				currentDate = this.date.valueOf(),
				today = new Date();
			this.picker.find('.datepicker-days thead th:eq(1)')
						.text(dates[this.language].months[month]+' '+year);
			this.picker.find('tfoot th.today')
						.text(dates[this.language].today)
						.toggle(this.todayBtn);
			this.updateNavArrows();
			this.fillMonths();
			var prevMonth = UTCDate(year, month-1, 28,0,0,0,0),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while(prevMonth.valueOf() < nextMonth) {
				if (prevMonth.getUTCDay() == this.weekStart) {
					html.push('<tr>');
				}
				clsName = '';
				if (prevMonth.getUTCFullYear() < year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() < month)) {
					clsName += ' old';
				} else if (prevMonth.getUTCFullYear() > year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() > month)) {
					clsName += ' new';
				}
				// Compare internal UTC date with local today, not UTC today
				if (this.todayHighlight &&
					prevMonth.getUTCFullYear() == today.getFullYear() &&
					prevMonth.getUTCMonth() == today.getMonth() &&
					prevMonth.getUTCDate() == today.getDate()) {
					clsName += ' today';
				}
				if (prevMonth.valueOf() == currentDate) {
					clsName += ' active';
				}
				if (prevMonth.valueOf() < this.startDate || prevMonth.valueOf() > this.endDate) {
					clsName += ' disabled';
				}
				html.push('<td class="day'+clsName+'">'+prevMonth.getUTCDate() + '</td>');
				if (prevMonth.getUTCDay() == this.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate()+1);
			}
			this.picker.find('.datepicker-days tbody').empty().append(html.join(''));
			var currentYear = this.date.getUTCFullYear();

			var months = this.picker.find('.datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('active');
			if (currentYear == year) {
				months.eq(this.date.getUTCMonth()).addClass('active');
			}
			if (year < startYear || year > endYear) {
				months.addClass('disabled');
			}
			if (year == startYear) {
				months.slice(0, startMonth).addClass('disabled');
			}
			if (year == endYear) {
				months.slice(endMonth+1).addClass('disabled');
			}

			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			for (var i = -1; i < 11; i++) {
				html += '<span class="year'+(i == -1 || i == 10 ? ' old' : '')+(currentYear == year ? ' active' : '')+(year < startYear || year > endYear ? ' disabled' : '')+'">'+year+'</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		updateNavArrows: function() {
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
			switch (this.viewMode) {
				case 0:
					if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear() && month <= this.startDate.getUTCMonth()) {
						this.picker.find('.prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear() && month >= this.endDate.getUTCMonth()) {
						this.picker.find('.next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
				case 1:
				case 2:
					if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()) {
						this.picker.find('.prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.prev').css({visibility: 'visible'});
					}
					if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()) {
						this.picker.find('.next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.next').css({visibility: 'visible'});
					}
					break;
			}
		},

		click: function(e) {
			e.stopPropagation();
			e.preventDefault();
			var target = $(e.target).closest('span, td, th');
			if (target.length == 1) {
				switch(target[0].nodeName.toLowerCase()) {
					case 'th':
						switch(target[0].className) {
							case 'switch':
								this.showMode(1);
								break;
							case 'prev':
							case 'next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1);
								switch(this.viewMode){
									case 0:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										break;
									case 1:
									case 2:
										this.viewDate = this.moveYear(this.viewDate, dir);
										break;
								}
								this.fill();
								break;
							case 'today':
								var date = new Date();
								date.setUTCHours(0);
								date.setUTCMinutes(0);
								date.setUTCSeconds(0);
								date.setUTCMilliseconds(0);

								this.showMode(-2);
								var which = this.todayBtn == 'linked' ? null : 'view';
								this._setDate(date, which);
								break;
						}
						break;
					case 'span':
						if (!target.is('.disabled')) {
							this.viewDate.setUTCDate(1);
							if (target.is('.month')) {
								var month = target.parent().find('span').index(target);
								this.viewDate.setUTCMonth(month);
								this.element.trigger({
									type: 'changeMonth',
									date: this.viewDate
								});
							} else {
								var year = parseInt(target.text(), 10)||0;
								this.viewDate.setUTCFullYear(year);
								this.element.trigger({
									type: 'changeYear',
									date: this.viewDate
								});
							}
							this.showMode(-1);
							this.fill();
						}
						break;
					case 'td':
						if (target.is('.day') && !target.is('.disabled')){
							var day = parseInt(target.text(), 10)||1;
							var year = this.viewDate.getUTCFullYear(),
								month = this.viewDate.getUTCMonth();
							if (target.is('.old')) {
								if (month == 0) {
									month = 11;
									year -= 1;
								} else {
									month -= 1;
								}
							} else if (target.is('.new')) {
								if (month == 11) {
									month = 0;
									year += 1;
								} else {
									month += 1;
								}
							}
							this._setDate(UTCDate(year, month, day,0,0,0,0));
						}
						break;
				}
			}
		},

		_setDate: function(date, which){
			if (!which || which == 'date')
				this.date = date;
			if (!which || which  == 'view')
				this.viewDate = date;
			this.fill();
			this.setValue();
			this.element.trigger({
				type: 'changeDate',
				date: this.date
			});
			var element;
			if (this.isInput) {
				element = this.element;
			} else if (this.component){
				element = this.element.find('input');
			}
			if (element) {
				element.change();
				if (this.autoclose) {
									this.hide();
				}
			}
		},

		moveMonth: function(date, dir){
			if (!dir) return date;
			var new_date = new Date(date.valueOf()),
				day = new_date.getUTCDate(),
				month = new_date.getUTCMonth(),
				mag = Math.abs(dir),
				new_month, test;
			dir = dir > 0 ? 1 : -1;
			if (mag == 1){
				test = dir == -1
					// If going back one month, make sure month is not current month
					// (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
					? function(){ return new_date.getUTCMonth() == month; }
					// If going forward one month, make sure month is as expected
					// (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
					: function(){ return new_date.getUTCMonth() != new_month; };
				new_month = month + dir;
				new_date.setUTCMonth(new_month);
				// Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
				if (new_month < 0 || new_month > 11)
					new_month = (new_month + 12) % 12;
			} else {
				// For magnitudes >1, move one month at a time...
				for (var i=0; i<mag; i++)
					// ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
					new_date = this.moveMonth(new_date, dir);
				// ...then reset the day, keeping it in the new month
				new_month = new_date.getUTCMonth();
				new_date.setUTCDate(day);
				test = function(){ return new_month != new_date.getUTCMonth(); };
			}
			// Common date-resetting loop -- if date is beyond end of month, make it
			// end of month
			while (test()){
				new_date.setUTCDate(--day);
				new_date.setUTCMonth(new_month);
			}
			return new_date;
		},

		moveYear: function(date, dir){
			return this.moveMonth(date, dir*12);
		},

		dateWithinRange: function(date){
			return date >= this.startDate && date <= this.endDate;
		},

		keydown: function(e){
			if (this.picker.is(':not(:visible)')){
				if (e.keyCode == 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, day, month,
				newDate, newViewDate;
			switch(e.keyCode){
				case 27: // escape
					this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.keyboardNavigation) break;
					dir = e.keyCode == 37 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.date, dir);
						newViewDate = this.moveYear(this.viewDate, dir);
					} else if (e.shiftKey){
						newDate = this.moveMonth(this.date, dir);
						newViewDate = this.moveMonth(this.viewDate, dir);
					} else {
						newDate = new Date(this.date);
						newDate.setUTCDate(this.date.getUTCDate() + dir);
						newViewDate = new Date(this.viewDate);
						newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir);
					}
					if (this.dateWithinRange(newDate)){
						this.date = newDate;
						this.viewDate = newViewDate;
						this.setValue();
						this.update();
						e.preventDefault();
						dateChanged = true;
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.keyboardNavigation) break;
					dir = e.keyCode == 38 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.date, dir);
						newViewDate = this.moveYear(this.viewDate, dir);
					} else if (e.shiftKey){
						newDate = this.moveMonth(this.date, dir);
						newViewDate = this.moveMonth(this.viewDate, dir);
					} else {
						newDate = new Date(this.date);
						newDate.setUTCDate(this.date.getUTCDate() + dir * 7);
						newViewDate = new Date(this.viewDate);
						newViewDate.setUTCDate(this.viewDate.getUTCDate() + dir * 7);
					}
					if (this.dateWithinRange(newDate)){
						this.date = newDate;
						this.viewDate = newViewDate;
						this.setValue();
						this.update();
						e.preventDefault();
						dateChanged = true;
					}
					break;
				case 13: // enter
					this.hide();
					e.preventDefault();
					break;
				case 9: // tab
					this.hide();
					break;
			}
			if (dateChanged){
				this.element.trigger({
					type: 'changeDate',
					date: this.date
				});
				var element;
				if (this.isInput) {
					element = this.element;
				} else if (this.component){
					element = this.element.find('input');
				}
				if (element) {
					element.change();
				}
			}
		},

		showMode: function(dir) {
			if (dir) {
				this.viewMode = Math.max(0, Math.min(2, this.viewMode + dir));
			}
			this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
			this.updateNavArrows();
		}
	};

	$.fn.datepicker = function ( option ) {
		var args = Array.apply(null, arguments);
		args.shift();
		return this.each(function () {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option == 'object' && option;
			if (!data) {
				$this.data('datepicker', (data = new Datepicker(this, $.extend({}, $.fn.datepicker.defaults,options))));
			}
			if (typeof option == 'string' && typeof data[option] == 'function') {
				data[option].apply(data, args);
			}
		});
	};

	$.fn.datepicker.defaults = {
	};
	$.fn.datepicker.Constructor = Datepicker;
	var dates = $.fn.datepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today"
		}
	}

	var DPGlobal = {
		modes: [
			{
				clsName: 'days',
				navFnc: 'Month',
				navStep: 1
			},
			{
				clsName: 'months',
				navFnc: 'FullYear',
				navStep: 1
			},
			{
				clsName: 'years',
				navFnc: 'FullYear',
				navStep: 10
		}],
		isLeapYear: function (year) {
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
		},
		getDaysInMonth: function (year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
		},
		validParts: /dd?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\[-`{-~\t\n\r]+/g,
		parseFormat: function(format){
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length == 0){
				throw new Error("Invalid date format.");
			}
			return {separators: separators, parts: parts};
		},
		parseDate: function(date, format, language) {
			if (date instanceof Date) return date;
			if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(date)) {
				var part_re = /([-+]\d+)([dmwy])/,
					parts = date.match(/([-+]\d+)([dmwy])/g),
					part, dir;
				date = new Date();
				for (var i=0; i<parts.length; i++) {
					part = part_re.exec(parts[i]);
					dir = parseInt(part[1]);
					switch(part[2]){
						case 'd':
							date.setUTCDate(date.getUTCDate() + dir);
							break;
						case 'm':
							date = Datepicker.prototype.moveMonth.call(Datepicker.prototype, date, dir);
							break;
						case 'w':
							date.setUTCDate(date.getUTCDate() + dir * 7);
							break;
						case 'y':
							date = Datepicker.prototype.moveYear.call(Datepicker.prototype, date, dir);
							break;
					}
				}
				return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
			}
			var parts = date && date.match(this.nonpunctuation) || [],
				date = new Date(),
				parsed = {},
				setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
				setters_map = {
					yyyy: function(d,v){ return d.setUTCFullYear(v); },
					yy: function(d,v){ return d.setUTCFullYear(2000+v); },
					m: function(d,v){
						v -= 1;
						while (v<0) v += 12;
						v %= 12;
						d.setUTCMonth(v);
						while (d.getUTCMonth() != v)
							d.setUTCDate(d.getUTCDate()-1);
						return d;
					},
					d: function(d,v){ return d.setUTCDate(v); }
				},
				val, filtered, part;
			setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
			setters_map['dd'] = setters_map['d'];
			date = UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0);
			if (parts.length == format.parts.length) {
				for (var i=0, cnt = format.parts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10);
					part = format.parts[i];
					if (isNaN(val)) {
						switch(part) {
							case 'MM':
								filtered = $(dates[language].months).filter(function(){
									var m = this.slice(0, parts[i].length),
										p = parts[i].slice(0, m.length);
									return m == p;
								});
								val = $.inArray(filtered[0], dates[language].months) + 1;
								break;
							case 'M':
								filtered = $(dates[language].monthsShort).filter(function(){
									var m = this.slice(0, parts[i].length),
										p = parts[i].slice(0, m.length);
									return m == p;
								});
								val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
								break;
						}
					}
					parsed[part] = val;
				}
				for (var i=0, s; i<setters_order.length; i++){
					s = setters_order[i];
					if (s in parsed)
						setters_map[s](date, parsed[s])
				}
			}
			return date;
		},
		formatDate: function(date, format, language){
			var val = {
				d: date.getUTCDate(),
				m: date.getUTCMonth() + 1,
				M: dates[language].monthsShort[date.getUTCMonth()],
				MM: dates[language].months[date.getUTCMonth()],
				yy: date.getUTCFullYear().toString().substring(2),
				yyyy: date.getUTCFullYear()
			};
			val.dd = (val.d < 10 ? '0' : '') + val.d;
			val.mm = (val.m < 10 ? '0' : '') + val.m;
			var date = [],
				seps = $.extend([], format.separators);
			for (var i=0, cnt = format.parts.length; i < cnt; i++) {
				if (seps.length)
					date.push(seps.shift())
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>'+
							'<tr>'+
								'<th class="prev"><i class="icon-arrow-left"/></th>'+
								'<th colspan="5" class="switch"></th>'+
								'<th class="next"><i class="icon-arrow-right"/></th>'+
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot><tr><th colspan="7" class="today"></th></tr></tfoot>'
	};
	DPGlobal.template = '<div class="datepicker dropdown-menu">'+
							'<div class="datepicker-days">'+
								'<table class=" table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-months">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="datepicker-years">'+
								'<table class="table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
						'</div>';

	// Load language files.
	for ( var i = 2, len = arguments.length; i < len; i++ ) {
		arguments[i].localize();
	}
} );

timely.define('external_libs/bootstrap_collapse', ["jquery_timely"],
	function( $ ) {

/* =============================================================
 * bootstrap-collapse.js v2.0.4
 * http://twitter.github.com/bootstrap/javascript.html#collapse
 * =============================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ============================================================ */

   // jshint ;_;


 /* COLLAPSE PUBLIC CLASS DEFINITION
  * ================================ */

  var Collapse = function (element, options) {
    this.$element = $(element)
    this.options = $.extend({}, $.fn.collapse.defaults, options)

    if (this.options.parent) {
      this.$parent = $(this.options.parent)
    }

    this.options.toggle && this.toggle()
  }

  Collapse.prototype = {

    constructor: Collapse

  , dimension: function () {
      var hasWidth = this.$element.hasClass('width')
      return hasWidth ? 'width' : 'height'
    }

  , show: function () {
      var dimension
        , scroll
        , actives
        , hasData

      if (this.transitioning) return

      dimension = this.dimension()
      scroll = $.camelCase(['scroll', dimension].join('-'))
      actives = this.$parent && this.$parent.find('> .accordion-group > .in')

      if (actives && actives.length) {
        hasData = actives.data('collapse')
        if (hasData && hasData.transitioning) return
        actives.collapse('hide')
        hasData || actives.data('collapse', null)
      }

      this.$element[dimension](0)
      this.transition('addClass', $.Event('show'), 'shown')
      this.$element[dimension](this.$element[0][scroll])
    }

  , hide: function () {
      var dimension
      if (this.transitioning) return
      dimension = this.dimension()
      this.reset(this.$element[dimension]())
      this.transition('removeClass', $.Event('hide'), 'hidden')
      this.$element[dimension](0)
    }

  , reset: function (size) {
      var dimension = this.dimension()

      this.$element
        .removeClass('collapse')
        [dimension](size || 'auto')
        [0].offsetWidth

      this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')

      return this
    }

  , transition: function (method, startEvent, completeEvent) {
      var that = this
        , complete = function () {
            if (startEvent.type == 'show') that.reset()
            that.transitioning = 0
            that.$element.trigger(completeEvent)
          }

      this.$element.trigger(startEvent)

      if (startEvent.isDefaultPrevented()) return

      this.transitioning = 1

      this.$element[method]('in')

      $.support.transition && this.$element.hasClass('collapse') ?
        this.$element.one($.support.transition.end, complete) :
        complete()
    }

  , toggle: function () {
      this[this.$element.hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* COLLAPSIBLE PLUGIN DEFINITION
  * ============================== */

  $.fn.collapse = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('collapse')
        , options = typeof option == 'object' && option
      if (!data) $this.data('collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.collapse.defaults = {
    toggle: true
  }

  $.fn.collapse.Constructor = Collapse


 /* COLLAPSIBLE DATA-API
  * ==================== */

  $(function () {
    $('body').on('click.collapse.data-api', '[data-toggle=ai1ec_collapse]', function ( e ) {
      var $this = $(this), href
        , target = $this.attr('data-target')
          || e.preventDefault()
          || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
        , option = $(target).data('collapse') ? 'toggle' : $this.data()
      $(target).collapse(option)
    })
  })

} );

timely.define('external_libs/bootstrap_alert', ["jquery_timely"],
		function( $ ) {

	   // jshint ;_;


	 /* ALERT CLASS DEFINITION
	  * ====================== */

	  var dismiss = '[data-dismiss="alert"]'
	    , Alert = function (el) {
	        $(el).on('click', dismiss, this.close)
	      }

	  Alert.prototype.close = function (e) {
	    var $this = $(this)
	      , selector = $this.attr('data-target')
	      , $parent

	    if (!selector) {
	      selector = $this.attr('href')
	      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
	    }

	    $parent = $(selector)

	    e && e.preventDefault()

	    $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent())

	    $parent.trigger(e = $.Event('close'))

	    if (e.isDefaultPrevented()) return

	    $parent.removeClass('in')

	    function removeElement() {
	      $parent
	        .trigger('closed')
	        .remove()
	    }

	    $.support.transition && $parent.hasClass('fade') ?
	      $parent.on($.support.transition.end, removeElement) :
	      removeElement()
	  }


	 /* ALERT PLUGIN DEFINITION
	  * ======================= */

	  $.fn.alert = function (option) {
	    return this.each(function () {
	      var $this = $(this)
	        , data = $this.data('alert')
	      if (!data) $this.data('alert', (data = new Alert(this)))
	      if (typeof option == 'string') data[option].call($this)
	    })
	  }

	  $.fn.alert.Constructor = Alert


	 /* ALERT DATA-API
	  * ============== */

	  $(function () {
	    $('body').on('click.alert.data-api', dismiss, Alert.prototype.close)
	  })
} );
timely.define('external_libs/bootstrap_fileupload', ["jquery_timely"],
	function( $ ) {

/* ===========================================================
 * bootstrap-fileupload.js j2
 * http://jasny.github.com/bootstrap/javascript.html#fileupload
 * ===========================================================
 * Copyright 2012 Jasny BV, Netherlands.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

   // jshint ;_

 /* INPUTMASK PUBLIC CLASS DEFINITION
  * ================================= */

  var Fileupload = function (element, options) {
    this.$element = $(element)
    this.type = this.$element.data('uploadtype') || (this.$element.find('.thumbnail').length > 0 ? "image" : "file")

    this.$input = this.$element.find(':file')
    if (this.$input.length === 0) return

    this.name = this.$input.attr('name') || options.name

    this.$hidden = this.$element.find(':hidden[name="'+this.name+'"]')
    if (this.$hidden.length === 0) {
      this.$hidden = $('<input type="hidden" />')
      this.$element.prepend(this.$hidden)
    }

    this.$preview = this.$element.find('.fileupload-preview')
    var height = this.$preview.css('height')
    if (this.$preview.css('display') != 'inline' && height != '0px' && height != 'none') this.$preview.css('line-height', height)

    this.$remove = this.$element.find('[data-dismiss="fileupload"]')

    this.$element.find('[data-trigger="fileupload"]').on('click.fileupload', $.proxy(this.trigger, this))

    this.listen()
  }

  Fileupload.prototype = {

    listen: function() {
      this.$input.on('change.fileupload', $.proxy(this.change, this))
      if (this.$remove) this.$remove.on('click.fileupload', $.proxy(this.clear, this))
    },

    change: function(e, invoked) {
      var file = e.target.files !== undefined ? e.target.files[0] : (e.target.value ? { name: e.target.value.replace(/^.+\\/, '') } : null)
      if (invoked === 'clear') return

      if (!file) {
        this.clear()
        return
      }

      this.$hidden.val('')
      this.$hidden.attr('name', '')
      this.$input.attr('name', this.name)

      if (this.type === "image" && this.$preview.length > 0 && (typeof file.type !== "undefined" ? file.type.match('image.*') : file.name.match('\\.(gif|png|jpe?g)$')) && typeof FileReader !== "undefined") {
        var reader = new FileReader()
        var preview = this.$preview
        var element = this.$element

        reader.onload = function(e) {
          preview.html('<img src="' + e.target.result + '" ' + (preview.css('max-height') != 'none' ? 'style="max-height: ' + preview.css('max-height') + ';"' : '') + ' />')
          element.addClass('fileupload-exists').removeClass('fileupload-new')
        }

        reader.readAsDataURL(file)
      } else {
        this.$preview.text(file.name)
        this.$element.addClass('fileupload-exists').removeClass('fileupload-new')
      }
    },

    clear: function(e) {
      this.$hidden.val('')
      this.$hidden.attr('name', this.name)
      this.$input.attr('name', '')
      this.$input.val('') // Doesn't work in IE, which causes issues when selecting the same file twice

      this.$preview.html('')
      this.$element.addClass('fileupload-new').removeClass('fileupload-exists')

      if (e) {
        this.$input.trigger('change', [ 'clear' ])
        e.preventDefault()
      }
    },

    trigger: function(e) {
      this.$input.trigger('click')
      e.preventDefault()
    }
  }


 /* INPUTMASK PLUGIN DEFINITION
  * =========================== */

  $.fn.fileupload = function (options) {
    return this.each(function () {
      var $this = $(this)
      , data = $this.data('fileupload')
      if (!data) $this.data('fileupload', (data = new Fileupload(this, options)))
    })
  }

  $.fn.fileupload.Constructor = Fileupload


 /* INPUTMASK DATA-API
  * ================== */

  $(function () {
    $('body').on('click.fileupload.data-api', '[data-provides="fileupload"]', function (e) {
      var $this = $(this)
      if ($this.data('fileupload')) return
      $this.fileupload($this.data())

      var $target = $(e.target).parents('[data-dismiss=fileupload],[data-trigger=fileupload]').first()
      if ($target.length > 0) {
          $target.trigger('click.fileupload')
          e.preventDefault()
      }
    })
  })

} );

timely.define('external_libs/jquery.scrollTo',
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
/*!
 * jQuery.ScrollTo
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 12/14/2012
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @author Ariel Flesler
 * @version 1.4.5 BETA
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
 *		- A percentage of the container's dimension/s, for example: 50% to go to the middle.
 *		- The string 'max' for go-to-end.
 * @param {Number, Function} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number, Function} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends.
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @desc Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @desc Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');
 *			}});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */

	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
		limit:true
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window)._scrollable();
	};

	// Hack, hack, hack :)
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	$.fn._scrollable = function(){
		return this.map(function(){
			var elem = this,
				isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

				if( !isWin )
					return elem;

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

			return /webkit/i.test(navigator.userAgent) || doc.compatMode == 'BackCompat' ?
				doc.body :
				doc.documentElement;
		});
	};

	$.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };

		if( target == 'max' )
			target = 9e9;

		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;

		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this._scrollable().each(function(){
			// Null target yields nothing, just like jQuery does
			if (target == null) return;

			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
					if (!targ.length) return;
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					max = $scrollTo.max(elem, axis);

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}

					attr[key] += settings.offset[pos] || 0;

					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
				}else{
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) == '%' ?
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if( settings.limit && /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate( settings.onAfter );

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, target, settings);
				});
			};

		}).end();
	};

	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	$scrollTo.max = function( elem, axis ){
		var Dim = axis == 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;

		if( !$(elem).is('html,body') )
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();

		var size = 'client' + Dim,
			html = elem.ownerDocument.documentElement,
			body = elem.ownerDocument.body;

		return Math.max( html[scroll], body[scroll] )
			 - Math.min( html[size]  , body[size]   );
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

} );

/*global Recaptcha: true */
timely.define('scripts/front_end_create_event_form',
	[
		"jquery_timely",
		"scripts/add_new_event/event_location/gmaps_helper",
		"libs/select2_multiselect_helper",
		"libs/tags_select",
		"libs/ajax_fileupload",
		"libs/timepicker_helper",
		"ai1ec_config",
		"external_libs/moment",
		"libs/recaptcha",
		"external_libs/Placeholders",
		"external_libs/bootstrap_datepicker",
		"external_libs/bootstrap_collapse",
		"external_libs/bootstrap_alert",
		"external_libs/bootstrap_fileupload",
		"external_libs/jquery.scrollTo"
	],
	function(
		$,
		gmaps_helper,
		select2_multiselect_helper,
		tags_select,
		ajax_fileupload,
		timepicker_helper,
		ai1ec_config,
		moment,
		recaptcha
	) {

	 // jshint ;_;

	var $form = $( '.ai1ec-create-event-form' ),
	    $form_container = $form.parent(),
	    $spinner = $form_container.siblings( '.ai1ec-loading' );

	/**
	 * Initialize form.
	 */
	var init = function() {
		// Only load interactive gMaps code if address autocomplete is enabled.
		if ( ! ai1ec_config.disable_autocompletion ) {
			// We load gMaps here so that we can start acting on the DOM as soon as
			// possibe. All initialization is done in the callback.
			timely.require( ['libs/gmaps'], function( gMapsLoader ) {
				gMapsLoader( gmaps_helper.init_gmaps );
			} );
		}
		// when clicking on the toggle of the collapsible, just check
		// checkbox if it's unchecked, do not bubble up event to the 
		// label if it's not checked, otherwise it would uncheck 
		// the checkbox
		$( '#open_require_disclaimer' ).on( 'click', function( e ) {
			if( $( '#require_disclaimer' ).is( ':checked' ) ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				if( $( '#show_disclaimer' ).hasClass( 'in' ) ) {
					$( '#show_disclaimer' ).collapse( 'hide' );
				} else {
					$( '#show_disclaimer' ).collapse( 'show' );
				}
			}
		} );

		// Initialize datepickers.
		$( '.ai1ec-datepicker', $form )
			.datepicker( {
				autoclose: true,
				todayHighlight: true
			} )
			// Wrap each datepicker in div.timely to avoid polluting global namespace.
			.each( function() {
				$( this ).data( 'datepicker' ).picker.wrapAll( '<div class="timely">' );
			} );

		// Initialize timepickers.
		timepicker_helper.init( $form );

		// Initialize Category & Tag widgets.
		select2_multiselect_helper.init( $form );
		tags_select.init( $form );

		// Initialize reCAPTCHA (check is done to make sure it hasn't already been
		// initialized).
		recaptcha.init_recaptcha( $form );

		// Enable alert dismissal.
		$( '.alert', $form ).alert();

		// Focus first interactive input after a delay of 350 ms (after modal has
		// slid down).
		window.setTimeout(
			function() {
				$( ':input[type!="hidden"]:first', $form ).focus();
			},
			350
		);
	};

	/**
	 * Called when the form had an error and it needs the user's attention again.
	 * Brings attention to alert and reloads CAPTCHA.
	 */
	var retry_form = function() {
		if ( $( '#recaptcha_response_field', $form ).length &&
		     typeof Recaptcha !== 'undefined' ) {
			// Fetch new CAPTCHA challenge.
			Recaptcha.reload();
		}
		$( '.ai1ec-modal-body', $form ).scrollTo( '.alert:first', 1000 );
	};

	/**
	 * Handle toggling of "Add time" checkbox.
	 */
	var handle_has_time_checkbox = function() {
		if ( this.checked ) {
			$( '#ai1ec-end-time-input-wrap', $form ).collapse( 'show' );
			$( '#ai1ec-has-end-time ~ .ai1ec-without-time', $form ).hide();
			$( '#ai1ec-has-end-time ~ .ai1ec-with-time', $form ).show();
		}
		else {
			$( '#ai1ec-end-time-input-wrap', $form ).collapse( 'hide' );
			$( '#ai1ec-has-end-time ~ .ai1ec-without-time', $form ).show();
			$( '#ai1ec-has-end-time ~ .ai1ec-with-time', $form ).hide();
		}
		set_disabled_fields();
	};

	/**
	 * Returns whether the current form state would be a valid submission.
	 *
	 * @return {boolean}      True if the form fields pass validation
	 */
	var is_form_valid = function() {
		var has_end_time = $( '#ai1ec-has-end-time', $form )[0].checked;

		// Submit button disabled state.
		var $required = $(
			'#ai1ec-event-title, ' +
			'#ai1ec-start-date-input, ' +
			'#recaptcha_response_field',
			$form
		);
		if ( has_end_time ) {
			$required = $required.add( $( '#ai1ec-end-date-input', $form ) );
		}

		var valid = true;
		var $require_disc = $( '#require_disclaimer' );
		$( '.alert-error', $form ).addClass( 'hide' );
		if( $require_disc.length > 0 && ! $require_disc.is( ':checked' ) ) {
			valid = false;
			$( '.ai1ec-required-disclaimer', $form ).removeClass( 'hide' );
		}
		$required.each( function() {
			var $field = $( this );
			var val = $field.val();
			// Handle the possibility that the value of the field is the placeholder
			// (required by placeholder plugin).
			if ( '' === val || $field.attr( 'placeholder' ) === val ) {
				valid = false;
				// Add field name to alert message.
				$( '.ai1ec-missing-field', $form )
					.find( 'em' )
						.text( $field.attr( 'placeholder' ) )
						.end()
					.removeClass( 'hide' );
				$field.focus();
				return false;
			}
		} );

		return valid;
	};

	/**
	 * Calculate UNIX timestamps of currently entered date/time and save to form
	 * data storage. If start timestamp has changed since the last time,
	 * update the end time to preserve duration between start & end. If end time
	 * is before start time, set it to the start time.
	 */
	var update_timestamps = function() {
		var $start_date_input = $( '#ai1ec-start-date-input', $form ),
		    $end_date_input = $( '#ai1ec-end-date-input', $form ),
		    $start_time_input = $( '#ai1ec-start-time-input', $form ),
		    $end_time_input = $( '#ai1ec-end-time-input', $form ),
		    has_time = $( '#ai1ec-has-time', $form )[0].checked,
		    start_date = $start_date_input.val(),
		    start_time = $start_time_input.val(),
		    end_date = $end_date_input.val(),
		    end_time = $end_time_input.val(),
		    start = '',
		    end = '',
		    date_format,
		    time_format,
		    datetime_format,
		    prev_start = $form.data( 'ai1ecStartTime' ),
		    prev_end = $form.data( 'ai1ecEndTime' ),
		    update_end_widgets = false;

		// Normalize default values.
		if ( typeof prev_start === 'undefined' ) {
			prev_start = '';
		}
		if ( typeof prev_end === 'undefined' ) {
			prev_end = '';
		}

		// Build moment.js-compatible format strings.
		date_format = $start_date_input.data( 'dateFormat' ).toUpperCase();
		if ( $start_time_input.data( 'showMeridian' ) ) {
			time_format = 'hh:mm A'; // 12-hour time component
		} else {
			time_format = 'HH:mm';   // 24-hour time component
		}
		datetime_format = date_format + ' ' + time_format;

		// Parse start date/time.
		if ( start_date !== '' ) {
			if ( has_time && start_time !== '' ) {
				start = moment.utc( start_date + ' ' + start_time, datetime_format );
			} else {
				start = moment.utc( start_date, date_format );
			}
			start = start.unix();
		}

		// Find out if the new start timestamp is different from the previous start
		// timestamp. If so, then set end timestamp to the previous difference
		// between start and end times.
		if ( start !== '' &&
		     ( prev_start === '' || parseInt( prev_start, 10 ) !== start ) ) {

			// Provide default values to previous start/end timestamps.
			if ( prev_start === '' ) {
				prev_start = start;
			} else {
				prev_start = parseInt( prev_start, 10 );
			}
			if ( prev_end === '' ) {
				prev_end = prev_start;
			} else {
				prev_end = parseInt( prev_end, 10 );
			}

			// Calculate new end timestamp.
			end = start + prev_end - prev_start;
			update_end_widgets = true;
		}
		// Else parse end date/time.
		else if ( end_date !== '' ) {
			if ( has_time && end_time !== '' ) {
				end = moment.utc( end_date + ' ' + end_time, datetime_format );
			} else {
				end = moment.utc( end_date, date_format );
			}
			end = end.unix();

			// End time cannot be before start time. Update widgets if this is so.
			if ( end < start ) {
				end = start;
				update_end_widgets = true;
			}
		}

		if ( update_end_widgets ) {
			// Update end date/time widgets.
			var end_moment = moment.unix( end ).utc();

			$end_date_input
				.val( end_moment.format( date_format ) )
				.datepicker( 'update' )
				.datepicker( 'setStartDate', start_date );
			if ( has_time  && start_time !== '' ) {
				// Only update end time if start time was provided.
				$end_time_input.val( end_moment.format( time_format ) );
			}
		}

		$form.data( 'ai1ecStartTime', start );
		$form.data( 'ai1ecEndTime', end );
	};

	/**
	 * Set enabled/disabled state of various form fields depending on current
	 * checkbox state.
	 */
	var set_disabled_fields = function() {
		// Date/time field disabled state.
		var has_time = $( '#ai1ec-has-time', $form )[0].checked,
		    has_end_time = $( '#ai1ec-has-end-time', $form )[0].checked;

		$( '#ai1ec-start-time-input', $form ).attr( 'disabled', ! has_time );
		$( '#ai1ec-end-date-input', $form ).attr( 'disabled', ! has_end_time );
		$( '#ai1ec-end-time-input', $form ).attr( 'disabled',
			! ( has_time && has_end_time ) );

		// Update stored UNIX timestamp values based on new disabled state.
		update_timestamps();
	};

	/**
	 * Handles the Submit Event button click.
	 */
	var handle_form_submission = function( e ) {
		e.preventDefault();
		if ( ! is_form_valid() ) {
			retry_form();
			return;
		}

		// Process stored timestamps before placing them into hidden fields.
		var start_time = $form.data( 'ai1ecStartTime' ),
		    end_time = $form.data( 'ai1ecEndTime' );

		var has_time =
			$( '#ai1ec-has-time', $form )[0].checked &&
			$( '#ai1ec-start-time-input', $form ).val() !== '';
		var has_end_time = $( '#ai1ec-has-end-time', $form )[0].checked;
		if ( ! has_time ) {
			// For all-day events without end date: default to start date.
			if ( ! has_end_time ) {
				end_time = start_time;
			}
			// Add 1 day to end date timestamp to span 1 full day.
			end_time = moment.unix( end_time ).add( 'd', 1 ).unix();
			// No longer an instantaneous event.
			has_end_time = true;
		}
		// For non-all-day events without end time, clear end date timestamp
		// (genuinely instantaneous events).
		else if ( ! has_end_time ) {
			end_time = '';
		}

		// use the blog timezone.
		// We are using UTC time now, so subtracting the timezone puts
		// the event in the correct time
		start_time -= 60 * 60 * ai1ec_config.blog_timezone;
		end_time -= 60 * 60 * ai1ec_config.blog_timezone;

		// Save processed timestamp data into hidden fields.
		$( '#ai1ec-start-time', $form ).val( start_time );
		$( '#ai1ec-end-time', $form ).val( end_time );

		// Set all-day/instant event fields to what the event creation form
		// processor expects.
		$( '#ai1ec-all-day-event', $form ).val( has_time ? '' : '1' );
		$( '#ai1ec-instant-event', $form ).val( has_end_time ? '' : '1' );

		$spinner.addClass( 'show' );
		ajax_fileupload.post(
			$form,
			'xml-json',
			function( data ) {
				// Display alert if there is a problem.
				if ( data.error ) {
					// Add field name to alert message.
					$( '.ai1ec-submit-error', $form )
						.text( data.message )
						.removeClass( 'hide' );
					// Fetch new CAPTCHA challenge.
					retry_form();
				}
				// Else display the new page.
				else {
					$form_container.html( data.html );
				}
				$spinner.removeClass( 'show' );
			}
		);
	};

	/**
	 * Handle "Post Another" button click. Reload fresh form and re-initialize it.
	 */
	var handle_post_another = function( e ) {
		e.preventDefault();
		$spinner.addClass( 'show' );
		$form_container.load(
			ai1ec_config.ajax_url + '?action=ai1ec_front_end_create_event_form',
			function() {
				$form = $( '.ai1ec-create-event-form', $form_container );
				init();
				$spinner.removeClass( 'show' );
			}
		);
	};

	/**
	 * Handle "Free Event" checkbox change
	 */
	var handle_is_free_checkbox = function( evt ) {
		var message = ai1ec_config.label_buy_tickets_url;
		if ( this.checked ) {
			message = ai1ec_config.label_rsvp_url;
		}
		$( '#ai1ec_ticket_url', $form ).attr( 'placeholder', message );
	};

	/**
	 * Attach all event handlers.
	 */
	var attach_event_handlers = function() {
		// Synchronize time input collapsibles.
		$form_container.on( 'click', '#ai1ec-has-time', handle_has_time_checkbox );

		$form_container.on( 'change', '#ai1ec_is_free', handle_is_free_checkbox );

		// Synchronize end date disabled with checkbox.
		$form_container.on( 'click', '#ai1ec-has-end-time', set_disabled_fields );

		// Update values of hidden date/time timestamp fields.
		$form_container.on( 'changeDate', '.ai1ec-datepicker', function() {
			update_timestamps();
			// Enable checkboxes now that a start date has been chosen.
			$( '#ai1ec-has-time, #ai1ec-has-end-time', $form )
				.removeAttr( 'disabled' );
		} );
		$form_container.on( 'change', '.ai1ec-timepicker', update_timestamps );

		// Synchronize Show Map disabled state with collapsible.
		$form_container.on( 'keyup', '#ai1ec_address', function() {
			var $checkbox = $( '#ai1ec-google-map', $form );
			if ( this.value === '' ) {
				if ( $checkbox[0].checked ) {
					$checkbox.click();
				}
				$checkbox.attr( 'disabled', 'disabled' );
			}
			else {
				$checkbox.removeAttr( 'disabled' );
			}
		} );

		// Handle form submission.
		$form_container.on( 'click', '.ai1ec-submit', handle_form_submission );

		// Handle "Post Another" button.
		$form_container.on( 'click', '.ai1ec-post-another', handle_post_another );
	};

	/**
	 * Initialize event creation form.
	 */
	var start = function() {
		init();
		attach_event_handlers();
	};

	var init_recaptcha = function() {
		recaptcha.init_recaptcha( $form );
	};

	return {
		start: start,
		init_recaptcha : init_recaptcha
	};
} );
