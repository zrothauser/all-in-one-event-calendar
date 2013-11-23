
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

timely.define('scripts/add_new_event/event_location/input_coordinates_event_handlers',
	[
		"jquery_timely",
		"scripts/add_new_event/event_location/input_coordinates_utility_functions",
		"scripts/add_new_event/event_location/gmaps_helper",
		"ai1ec_config"
	],
	function( $, input_utility_functions, gmaps_helper, ai1ec_config ) {
	 // jshint ;_;

	// Toggle the visibility of google map on checkbox click
	var toggle_visibility_of_google_map_on_click = function( e ) {
		if( $( this ).is( ':checked' ) ) {
			// show the map
			$( '.ai1ec_box_map' )
				.addClass( 'ai1ec_box_map_visible')
				.hide()
				.slideDown( 'fast' );
		} else {
			// hide the map
			$( '.ai1ec_box_map' ).slideUp( 'fast' );
		}
	};

	// Hide / Show the coordinates table when clicking the checkbox
	var toggle_visibility_of_coordinate_fields_on_click = function( e ) {
		// If the checkbox is checked
		if( this.checked === true ) {
			$( '#ai1ec_table_coordinates' ).css( { visibility : 'visible' } );
		} else {
			// Hide the table
			$( '#ai1ec_table_coordinates' ).css( { visibility : 'hidden' } );
			// Erase the input fields
			$( '#ai1ec_table_coordinates input' ).val( '' );
			// Clean up error messages
			$( 'div.ai1ec-error' ).remove();
		}
	};

	var update_map_from_coordinates_on_blur = function( e ) {
		// Convert commas to dots
		input_utility_functions.ai1ec_convert_commas_to_dots_for_coordinates();
		// Check if the coordinates are valid.
		var valid = input_utility_functions.ai1ec_check_lat_long_ok_for_search( e );
		// If they are valid, update the map.
		if( valid === true ) {
			gmaps_helper.ai1ec_update_map_from_coordinates();
		}
	};

	return {
		"toggle_visibility_of_google_map_on_click"        : toggle_visibility_of_google_map_on_click,
		"toggle_visibility_of_coordinate_fields_on_click" : toggle_visibility_of_coordinate_fields_on_click,
		"update_map_from_coordinates_on_blur"             : update_map_from_coordinates_on_blur
	};
} );

timely.define('scripts/add_new_event/event_date_time/date_time_utility_functions',
		[
		 "jquery_timely",
		 "ai1ec_config",
		 "libs/utils"
		 ],
		 function( $, ai1ec_config, AI1EC_UTILS ) {
	 // jshint ;_;
	var ajaxurl = AI1EC_UTILS.get_ajax_url();

	var hide_all_end_fields = function() {
		$( '#ai1ec_count_holder, #ai1ec_until_holder' ).hide();
	};

	var ai1ec_repeat_form_success = function( s1, s2, s3, rule, button, response ) {
		$( s1 ).val( rule );
		$.unblockUI();
		var txt = $.trim( $( s2 ).text() );
		if( txt.lastIndexOf( ':' ) === -1 ) {
			txt = txt.substring( 0, txt.length - 3 );
			$( s2 ).text( txt + ':' );
		}
		$(button).attr( 'disabled', false );
		$( s3 ).fadeOut( 'fast', function() {
			$( this ).text( response.message );
			$( this ).fadeIn( 'fast' );
		});
	};

	var ai1ec_repeat_form_error = function( s1, s2, response, button ) {
		$.growlUI( 'Error', response.message );
		$( button ).attr( 'disabled', false );
		$( s1 ).val( '' );
		var txt = $.trim( $( s2 ).text() );
		if( txt.lastIndexOf( '...' ) === -1 ) {
			txt = txt.substring( 0, txt.length - 1 );
			$( s2 ).text( txt + '...' );
		}
		// If there is no text, uncheck the checkbox, otherwise keep it as the provious rule is still valid.
		if( $( this ).closest( 'tr' ).find( '.ai1ec_rule_text' ).text() === '' ) {
			$( s1 ).siblings( 'input:checkbox' ).removeAttr( 'checked' );
		}
	};

	var ai1ec_click_on_ics_rule_text = function( s1, s2, s3, data, fn ) {
		$( document ).on( 'click', s1, function() {
			if( ! $( s2 ).is( ':checked' ) ) {
				$( s2 ).attr( 'checked', true );
				var txt = $.trim( $( s3 ).text() );
				txt = txt.substring( 0, txt.length - 3 );
				$( s3 ).text( txt + ':' );
			}
			ai1ec_show_repeat_tabs( data, fn );
			return false;
		});
	};

	var ai1ec_click_on_checkbox = function( s1, s2, s3, data, fn ) {
		$( s1 ).click( function() {
			if( $(this).is( ':checked' ) ) {
				if( this.id === 'ai1ec_repeat' ) {
					$( '#ai1ec_exclude' ).removeAttr( 'disabled' );
				};
				ai1ec_show_repeat_tabs( data, fn );
			} else {
				if( this.id === 'ai1ec_repeat' ) {
					$( '#ai1ec_exclude' ).attr( 'disabled', true );
				};
				$( s2 ).text( '' );
				var txt = $.trim( $( s3 ).text() );
				txt = txt.substring( 0, txt.length - 1 );
				$( s3 ).text( txt + '...' );
			}
		});
	};

	var ai1ec_click_on_modal_cancel = function( s1, s2, s3 ) {
		if( $.trim( $( s1 ).text() ) === '' ) {
			$( s2 ).removeAttr( 'checked' );
			if( ! $( '#ai1ec_repeat' ).is( ':checked' ) ) {
				$( '#ai1ec_exclude' ).attr( 'disabled', true );
			}
			var txt = $.trim( $( s3 ).text() );
			if( txt.lastIndexOf( '...' ) === -1 ) {
				txt = txt.substring( 0, txt.length - 1 );
				$( s3 ).text( txt + '...' );
			}
		}
	};

	// called after the repeat block is inserted in the DOM
	var ai1ec_apply_js_on_repeat_block = function() {
		// Initialize count range slider
		$( '#ai1ec_count, #ai1ec_daily_count, #ai1ec_weekly_count, #ai1ec_monthly_count, #ai1ec_yearly_count' ).rangeinput( {
			css: {
				input: 'ai1ec-range',
				slider: 'ai1ec-slider',
				progress: 'ai1ec-progress',
				handle: 'ai1ec-handle'
			}
		} );
		// Initialize inputdate plugin on our "until" date input.
		var data = {
			start_date_input : '#ai1ec_until-date-input',
			start_time       : '#ai1ec_until-time',
			date_format      : ai1ec_config.date_format,
			month_names      : ai1ec_config.month_names,
			day_names        : ai1ec_config.day_names,
			week_start_day   : ai1ec_config.week_start_day,
			twentyfour_hour  : ai1ec_config.twentyfour_hour,
			now              : new Date( ai1ec_config.now * 1000 )
		};
		$.inputdate( data );
	};

	var ai1ec_show_repeat_tabs = function( data, post_ajax_func ) {
		$.blockUI( {
			message: '<div class="ai1ec-repeat-box-loading"></div>',
			css: {
				width: '358px',
				border: '0',
				background: 'transparent',
				cursor: 'normal'
			}
		} );
		$.post(
			ajaxurl,
			data,
			function( response ) {
				if( response.error ) {
					// tell the user there is an error
					// TODO: Use other method of notification
					window.alert( response.message );
					$.unblockUI();
				} else {
					// display the form
					$.blockUI( {
						message: response.message,
						css: {
							width: '358px',
							border: '0',
							background: 'transparent',
							cursor: 'normal'
						}
					});
					if( typeof post_ajax_func === 'function' ) {
						post_ajax_func();
					}
				}
			},
			'json'
		);
	};
	return {
		ai1ec_show_repeat_tabs         : ai1ec_show_repeat_tabs,
		ai1ec_apply_js_on_repeat_block : ai1ec_apply_js_on_repeat_block,
		ai1ec_click_on_modal_cancel    : ai1ec_click_on_modal_cancel,
		ai1ec_click_on_checkbox        : ai1ec_click_on_checkbox,
		ai1ec_click_on_ics_rule_text   : ai1ec_click_on_ics_rule_text,
		ai1ec_repeat_form_error        : ai1ec_repeat_form_error,
		ai1ec_repeat_form_success      : ai1ec_repeat_form_success,
		hide_all_end_fields            : hide_all_end_fields
	};
		} );

timely.define('external_libs/jquery.calendrical_timespan',
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
// I merged two plugins into one because they had a lot of dependencies.
var calendricalDateFormats = {
		us  : { //US date format (eg. 12/1/2011)
			pattern : /([\d]{1,2})\/([\d]{1,2})\/([\d]{4}|[\d]{2})/,
			format  : 'm/d/y',
			order   : 'middleEndian',
			zeroPad : false },
		iso : { //ISO 8601 (eg. 2011-12-01)
			pattern : /([\d]{4}|[\d]{2})-([\d]{1,2})-([\d]{1,2})/,
			format  : 'y-m-d',
			order   : 'bigEndian',
			zeroPad : true },
		dot : { //Little endian with dots (eg. 1.12.2011)
			pattern : /([\d]{1,2}).([\d]{1,2}).([\d]{4}|[\d]{2})/,
			format  : 'd.m.y',
			order   : 'littleEndian',
			zeroPad : false },
		def : { //Default (eg. 1/12/2011)
			pattern : /([\d]{1,2})\/([\d]{1,2})\/([\d]{4}|[\d]{2})/,
			format  : 'd/m/y',
			order   : 'littleEndian',
			zeroPad : false }
	};

	var formatDate = function(date, format, noutc)
	{
		var y, m, d;
		if( typeof calendricalDateFormats[format] === 'undefined' ){
			format = 'def';
		}
		if( typeof noutc === 'undefined' ) {
			noutc = false;
		}
		if( true === noutc ) {
			y = ( date.getFullYear() ).toString();
			m = ( date.getMonth() + 1 ).toString();
			d = ( date.getDate() ).toString();
		} else {
			y = ( date.getUTCFullYear() ).toString();
			m = ( date.getUTCMonth() + 1 ).toString();
			d = ( date.getUTCDate() ).toString();
		}

		if( calendricalDateFormats[format].zeroPad ) {
			if( m.length == 1 ) m = '0' + m;
			if( d.length == 1 ) d = '0' + d;
		}
		var dt = calendricalDateFormats[format].format;
		dt = dt.replace('d', d);
		dt = dt.replace('m', m);
		dt = dt.replace('y', y);
		return dt;
	};

	var formatTime = function(hour, minute, iso)
	{
		var printMinute = minute;
		if( minute < 10 ) printMinute = '0' + minute;

		if( iso ) {
			var printHour = hour
			if( printHour < 10 ) printHour = '0' + hour;
			return printHour + ':' + printMinute;
		} else {
			var printHour = hour % 12;
			if( printHour == 0 ) printHour = 12;
			var half = ( hour < 12 ) ? 'am' : 'pm';
			return printHour + ':' + printMinute + half;
		}
	};

	var parseDate = function(date, format)
	{
		if( typeof calendricalDateFormats[format] === 'undefined' )
			format = 'def';

		var matches = date.match(calendricalDateFormats[format].pattern);
		if( !matches || matches.length != 4 ) {
			// Return an "invalid date" date instance like the original parseDate
			return Date( 'invalid' );
		}

		switch( calendricalDateFormats[format].order ) {
			case 'bigEndian' :
				var d = matches[3];	var m = matches[2];	var y = matches[1];
				break;
			case 'littleEndian' :
				var d = matches[1];	var m = matches[2];	var y = matches[3];
				break;
			case 'middleEndian' :
				var d = matches[2];	var m = matches[1];	var y = matches[3];
				break;
			default : //Default to little endian
				var d = matches[1];	var m = matches[2];	var y = matches[3];
				break;
		}

		// Add century to a two digit year
		if( y.length == 2 ) {
			y = new Date().getUTCFullYear().toString().substr(0, 2) + y;
		}

		// This is how the original parseDate does it
		return new Date( m + '/' + d + '/' + y + ' GMT' );
	};

	var parseTime = function(text)
	{
		var match = match = /(\d+)\s*[:\-\.,]\s*(\d+)\s*(am|pm)?/i.exec(text);
		if( match && match.length >= 3 ) {
			var hour = Number(match[1]);
			var minute = Number(match[2]);
			if( hour == 12 && match[3] ) hour -= 12;
			if( match[3] && match[3].toLowerCase() == 'pm' ) hour += 12;
			return {
				hour:   hour,
				minute: minute
			};
		} else {
			return null;
		}
	};

    function getToday()
    {
        var date = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function areDatesEqual(date1, date2)
    {
			if( typeof date1 === 'string' )
				date1 = new Date( date1 );

			if( typeof date2 === 'string' )
				date2 = new Date(date2);

			if( date1.getUTCDate() === date2.getUTCDate() ) {
				if( date1.getUTCMonth() === date2.getUTCMonth() ) {
					if( date1.getUTCFullYear() === date2.getUTCFullYear() ) {
						return true;
					}
				}
			}
			return false;
    }

    function daysInMonth(year, month)
    {
        if (year instanceof Date) return daysInMonth(year.getUTCFullYear(), year.getUTCMonth());
        if (month == 1) {
            var leapYear = (year % 4 == 0) &&
                (!(year % 100 == 0) || (year % 400 == 0));
            return leapYear ? 29 : 28;
        } else if (month == 3 || month == 5 || month == 8 || month == 10) {
            return 30;
        } else {
            return 31;
        }
    }

		function dayAfter(date)
    {
				// + 1 day
        return new Date( date.getTime() + (1*24*60*60*1000) );
    }

    function dayBefore(date)
    {
				// - 1 day
        return new Date( date.getTime() - (1*24*60*60*1000) );
    }

    function monthAfter(year, month)
    {
        return (month == 11) ?
            new Date(year + 1, 0, 1) :
            new Date(year, month + 1, 1);
    }

    /**
     * Generates calendar header, with month name, << and >> controls, and
     * initials for days of the week.
     */
    function renderCalendarHeader(element, year, month, options)
    {
				var monthNames = options.monthNames.split(',');
        //Prepare thead element
        var thead = $('<thead />');
        var titleRow = $('<tr />').appendTo(thead);

        //Generate << (back a month) link
        $('<th />').addClass('monthCell').append(
          $('<a href="javascript:;">&laquo;</a>')
                  .addClass('prevMonth')
                  .mousedown(function(e) {
                      renderCalendarPage(element,
                          month == 0 ? (year - 1) : year,
                          month == 0 ? 11 : (month - 1), options
                      );
                      e.preventDefault();
                  })
        ).appendTo(titleRow);

        //Generate month title
        $('<th />').addClass('monthCell').attr('colSpan', 5).append(
            $('<a href="javascript:;">' + monthNames[month] + ' ' +
                year + '</a>').addClass('monthName')
        ).appendTo(titleRow);

        //Generate >> (forward a month) link
        $('<th />').addClass('monthCell').append(
            $('<a href="javascript:;">&raquo;</a>')
                .addClass('nextMonth')
                .mousedown(function() {
                    renderCalendarPage(element,
                        month == 11 ? (year + 1) : year,
                        month == 11 ? 0 : (month + 1), options
                    );
                })
        ).appendTo(titleRow);

        // Generate weekday initials row. Adjust for week start day
				var names = options.dayNames.split(',');
				var startDay = parseInt(options.weekStartDay);
				var adjustedNames = [];
				for( var i = 0, len = names.length; i < len; i++ ) {
					adjustedNames[i] = names[(i + startDay) % len];
				}
        var dayNames = $('<tr />').appendTo(thead);
        $.each( adjustedNames, function( k, v ) {
            $('<td />').addClass('dayName').append(v).appendTo(dayNames);
        });

        return thead;
    }

    function renderCalendarPage(element, year, month, options)
    {
        options = options || {};

				var startDay = parseInt(options.weekStartDay);
        var today = options.today ? options.today : getToday();
        // Normalize
				today.setHours(0);
				today.setMinutes(0);

        var date = new Date(year, month, 1);
				var endDate = monthAfter(year, month);

        //Adjust dates for current timezone. This is a workaround to get
				//date comparison to work properly.
				var tzOffset = Math.abs(today.getTimezoneOffset());
				if (tzOffset != 0) {
					today.setHours(today.getHours() + tzOffset / 60);
					today.setMinutes(today.getMinutes() + tzOffset % 60);
					date.setHours(date.getHours() + tzOffset / 60);
					date.setMinutes(date.getMinutes() + tzOffset % 60);
					endDate.setHours(endDate.getHours() + tzOffset / 60);
					endDate.setMinutes(endDate.getMinutes() + tzOffset % 60);
				}

				//Wind end date forward to last day of week
				var ff = endDate.getUTCDay() - startDay;
				if (ff < 0) {
					ff = Math.abs(ff) - 1;
				} else {
					ff = 6 - ff;
				}
        for (var i = 0; i < ff; i++) endDate = dayAfter(endDate);

        var table = $('<table />');
        renderCalendarHeader(element, year, month, options).appendTo(table);

        var tbody = $('<tbody />').appendTo(table);
        var row = $('<tr />');

				//Rewind date to first day of week
				var rewind = date.getUTCDay() - startDay;
				if (rewind < 0) rewind = 7 + rewind;
        for (var i = 0; i < rewind; i++) date = dayBefore(date);

        while (date <= endDate) {
            var td = $('<td />')
                .addClass('day')
                .append(
                    $('<a href="javascript:;">' +
                        date.getUTCDate() + '</a>'
                    ).click((function() {
                        var thisDate = date;

                        return function() {
                            if (options && options.selectDate) {
                                options.selectDate(thisDate);
                            }
                        }
                    }()))
                )
                .appendTo(row);

            var isToday     = areDatesEqual(date, today);
            var isSelected  = options.selected &&
                                areDatesEqual(options.selected, date);

            if (isToday)                    td.addClass('today');
            if (isSelected)                 td.addClass('selected');
            if (isToday && isSelected)      td.addClass('today_selected');
            if (date.getUTCMonth() != month)   td.addClass('nonMonth');

           	var dow = date.getUTCDay();
						if (((dow + 1) % 7) == startDay) {
                tbody.append(row);
                row = $('<tr />');
            }
            date = dayAfter(date);
        }
        if (row.children().length) {
            tbody.append(row);
        } else {
            row.remove();
        }

        element.empty().append(table);
    }

    function renderTimeSelect(element, options)
    {
        var selection = options.selection && parseTime(options.selection);
        if (selection) {
            selection.minute = Math.floor(selection.minute / 15.0) * 15;
        }
        var startTime = options.startTime &&
            (options.startTime.hour * 60 + options.startTime.minute);

        var scrollTo;   //Element to scroll the dropdown box to when shown
        var ul = $('<ul />');
        for (var hour = 0; hour < 24; hour++) {
            for (var minute = 0; minute < 60; minute += 15) {
                if (startTime && startTime > (hour * 60 + minute)) continue;

                (function() {
                    var timeText = formatTime(hour, minute, options.isoTime);
                    var fullText = timeText;
                    if (startTime != null) {
                        var duration = (hour * 60 + minute) - startTime;
                        if (duration < 60) {
                            fullText += ' (' + duration + ' min)';
                        } else if (duration == 60) {
                            fullText += ' (1 hr)';
                        } else {
                            fullText += ' (' + Math.floor( duration / 60.0 ) + ' hr ' + ( duration % 60 ) + ' min)';
                        }
                    }
                    var li = $('<li />').append(
                        $('<a href="javascript:;">' + fullText + '</a>')
                        .click(function() {
                            if (options && options.selectTime) {
                                options.selectTime(timeText);
                            }
                        }).mousemove(function() {
                            $('li.selected', ul).removeClass('selected');
                        })
                    ).appendTo(ul);

                    //Set to scroll to the default hour, unless already set
                    if (!scrollTo && hour == options.defaultHour) {
                        scrollTo = li;
                    }

                    if (selection &&
                        selection.hour == hour &&
                        selection.minute == minute)
                    {
                        //Highlight selected item
                        li.addClass('selected');

                        //Set to scroll to the selected hour
                        //
                        //This is set even if scrollTo is already set, since
                        //scrolling to selected hour is more important than
                        //scrolling to default hour
                        scrollTo = li;
                    }
                })();
            }
        }
        if (scrollTo) {
            //Set timeout of zero so code runs immediately after any calling
            //functions are finished (this is needed, since box hasn't been
            //added to the DOM yet)
            setTimeout(function() {
                //Scroll the dropdown box so that scrollTo item is in
                //the middle
                element[0].scrollTop =
                    scrollTo[0].offsetTop - scrollTo.height() * 2;
            }, 0);
        }
        element.empty().append(ul);
    }

    $.fn.calendricalDate = function(options)
    {
        options = options || {};
        options.padding = options.padding || 4;
				options.monthNames = options.monthNames ||
														 'January,February,March,April,May,June,July,August,September,October,November,December';
				options.dayNames = options.dayNames || 'S,M,T,W,T,F,S';
				options.weekStartDay = options.weekStartDay || 0;

        return this.each(function() {
            var element = $(this);
            var div;
            var within = false;

            element.bind('focus', function() {
                if (div) return;
                var offset = element.position();
                var padding = element.css('padding-left');
                div = $('<div />')
                    .addClass('calendricalDatePopup')
                    .mouseenter(function() { within = true; })
                    .mouseleave(function() { within = false; })
                    .mousedown(function(e) {
                        e.preventDefault();
                    })
                    .css({
                        position: 'absolute',
                        left: offset.left,
                        top: offset.top + element.height() +
                            options.padding * 2
                    });
                element.after(div);

                var selected = parseDate(element.val(), options.dateFormat);
                if (!selected.getUTCFullYear()) selected = options.today ? options.today : getToday();

                renderCalendarPage(
                    div,
                    selected.getUTCFullYear(),
                    selected.getUTCMonth(), {
												today: options.today,
                        selected: selected,
												monthNames: options.monthNames,
												dayNames: options.dayNames,
												weekStartDay: options.weekStartDay,
                        selectDate: function(date) {
                            within = false;
                            element.val(formatDate(date, options.dateFormat));
                            div.remove();
                            div = null;
                            if (options.endDate) {
                                var endDate = parseDate(
                                    options.endDate.val(), options.dateFormat
                                );
                                if (endDate >= selected) {
                                    options.endDate.val(formatDate(
                                        new Date(
                                            date.getTime() +
                                            endDate.getTime() -
                                            selected.getTime()
                                        ),
                                        options.dateFormat
                                    ));
                                }
                            }
                        }
                    }
                );
            }).blur(function() {
                if (within){
                    if (div) element.focus();
                    return;
                }
                if (!div) return;
                div.remove();
                div = null;
            });
        });
    };

    $.fn.calendricalDateRange = function(options)
    {
        if (this.length >= 2) {
            $(this[0]).calendricalDate($.extend({
                endDate:   $(this[1])
            }, options));
            $(this[1]).calendricalDate(options);
        }
        return this;
    };

		$.fn.calendricalDateRangeSingle = function(options)
    {
        if (this.length == 1) {
            $(this).calendricalDate(options);
        }
        return this;
    };

    $.fn.calendricalTime = function(options)
    {
        options = options || {};
        options.padding = options.padding || 4;

        return this.each(function() {
            var element = $(this);
            var div;
            var within = false;

            element.bind('focus click', function() {
                if (div) return;

                var useStartTime = options.startTime;
                if (useStartTime) {
                    if (options.startDate && options.endDate &&
                        !areDatesEqual(parseDate(options.startDate.val()),
                            parseDate(options.endDate.val())))
                        useStartTime = false;
                }

                var offset = element.position();
                div = $('<div />')
                    .addClass('calendricalTimePopup')
                    .mouseenter(function() { within = true; })
                    .mouseleave(function() { within = false; })
                    .mousedown(function(e) {
                        e.preventDefault();
                    })
                    .css({
                        position: 'absolute',
                        left: offset.left,
                        top: offset.top + element.height() +
                            options.padding * 2
                    });
                if (useStartTime) {
                    div.addClass('calendricalEndTimePopup');
                }

                element.after(div);

                var opts = {
                    selection: element.val(),
                    selectTime: function(time) {
                        within = false;
                        element.val(time);
                        div.remove();
                        div = null;
                    },
                    isoTime: options.isoTime || false,
                    defaultHour: (options.defaultHour != null) ?
                                    options.defaultHour : 8
                };

                if (useStartTime) {
                    opts.startTime = parseTime(options.startTime.val());
                }

                renderTimeSelect(div, opts);
            }).blur(function() {
                if (within){
                    if (div) element.focus();
                    return;
                }
                if (!div) return;
                div.remove();
                div = null;
            });
        });
    },

    $.fn.calendricalTimeRange = function(options)
    {
        if (this.length >= 2) {
            $(this[0]).calendricalTime(options);
            $(this[1]).calendricalTime($.extend({
                startTime: $(this[0])
            }, options));
        }
        return this;
    };

    $.fn.calendricalDateTimeRange = function(options)
    {
        if (this.length >= 4) {
            $(this[0]).calendricalDate($.extend({
                endDate:   $(this[2])
            }, options));
            $(this[1]).calendricalTime(options);
            $(this[2]).calendricalDate(options);
            $(this[3]).calendricalTime($.extend({
                startTime: $(this[1]),
                startDate: $(this[0]),
                endDate:   $(this[2])
            }, options));
        }
        return this;
    };
    /**
     * Private functions
     */

    // Helper function - reset contents of current field to stored original
    // value and alert user.
    function reset_invalid( field )
    {
    	field
    		.addClass( 'error' )
    		.fadeOut( 'normal', function() {
    			field
    				.val( field.data( 'timespan.stored' ) )
    				.removeClass( 'error' )
    				.fadeIn( 'fast' );
    		});
    }

    // Stores the value of the HTML element in context to its "stored" jQuery data.
    function store_value() {
    	$(this).data( 'timespan.stored', this.value );
    }

    /**
     * Value initialization
     */
    function reset( start_date_input, start_time_input, start_time,
    		end_date_input, end_time_input, end_time, allday, twentyfour_hour,
    		date_format, now )
    {
    	// Restore original values of fields when the page was loaded
    	start_time.val( start_time.data( 'timespan.initial_value' ) );
    	end_time.val( end_time.data( 'timespan.initial_value' ) );
    	allday.get(0).checked = allday.data( 'timespan.initial_value' );

    	// Fill out input fields with default date/time based on these original
    	// values.

    	var start = parseInt( start_time.val() );
    	// If start_time field has a valid integer, use it, else use current time
    	// rounded to nearest quarter-hour.
    	if( ! isNaN( parseInt( start ) ) ) {
    		start = new Date( parseInt( start ) * 1000 );
    		start_time_input.val( formatTime( start.getUTCHours(), start.getUTCMinutes(), twentyfour_hour ) );
    	} else {
    		start = new Date( now );
    		// Round minutes to nearest quarter-hour.
    		start_time_input.val(
    			formatTime( start.getUTCHours(), start.getUTCMinutes() - start.getUTCMinutes() % 15, twentyfour_hour ) );
    	}
    	start_date_input.val( formatDate( start, date_format ) );

    	var end = parseInt( end_time.val() );
    	// If end_time field has a valid integer, use it, else use start time plus
    	// one hour.
    	if( ! isNaN( parseInt( end ) ) ) {
    		end = new Date( parseInt( end ) * 1000 );
    		end_time_input.val( formatTime( end.getUTCHours(), end.getUTCMinutes(), twentyfour_hour ) );
    	} else {
    		end = new Date( start.getTime() + 3600000 );
    		// Round minutes to nearest quarter-hour.
    		end_time_input.val(
    			formatTime( end.getUTCHours(), end.getUTCMinutes() - end.getUTCMinutes() % 15, twentyfour_hour ) );
    	}
    	// If all-day is checked, end date one day *before* last day of the span,
    	// provided we were given an iCalendar-spec all-day timespan.
    	if( allday.get(0).checked )
    		end.setUTCDate( end.getUTCDate() - 1 );
    	end_date_input.val( formatDate( end, date_format ) );

    	// Trigger function (defined above) to internally store values of each
    	// input field (used in calculations later).
    	start_date_input.each( store_value );
    	start_time_input.each( store_value );
    	end_date_input.each( store_value );
    	end_time_input.each( store_value );

    	// Set up visibility of controls and Calendrical activation based on
    	// original "checked" status of "All day" box.
    	allday.trigger( 'change.timespan' );
    	$( '#ai1ec_instant_event' ).trigger( 'change.timespan' );
    }

    /**
     * Private constants
     */

    var default_options = {
    	allday: '#allday',
    	start_date_input: '#start-date-input',
    	start_time_input: '#start-time-input',
    	start_time: '#start-time',
    	end_date_input: '#end-date-input',
    	end_time_input: '#end-time-input',
    	end_time: '#end-time',
    	twentyfour_hour: false,
    	date_format: 'def',
    	now: new Date()
    };

    /**
     * Public methods
     */

    var methods = {

    	/**
    	 * Initialize settings.
    	 */
    	init: function( options )
    	{
    		var o = $.extend( {}, default_options, options );

    		// Shortcut jQuery objects
    		var allday = $(o.allday);
    		var start_date_input = $(o.start_date_input);
    		var start_time_input = $(o.start_time_input);
    		var start_time = $(o.start_time);
    		var end_date_input = $(o.end_date_input);
    		var end_time_input = $(o.end_time_input);
    		var end_time = $(o.end_time);
    		var instant = $('#ai1ec_instant_event');

    		var end_date_time = end_date_input.add( end_time_input );
    		var date_inputs = start_date_input.add( o.end_date_input );
    		var time_inputs = start_time_input.add( o.end_time_input );
    		var all_inputs = start_date_input.add( o.start_time_input )
    			.add( o.end_date_input ).add( o.end_time_input );

    		/**
    		 * Event handlers
    		 */
    		// Save original (presumably valid) value of every input field upon focus.
    		all_inputs.bind( 'focus.timespan', store_value );

    		instant
				.bind( 'change.timespan', function() {
					if( this.checked ) {
						end_date_time.closest('tr').fadeOut();
						allday.attr( 'disabled', true );
					} else {
						allday.removeAttr( 'disabled' );
						end_date_time.closest('tr').fadeIn();
					}
				} );

    		// When "All day" is toggled, show/hide time.
    		var today = new Date( o.now.getFullYear(), o.now.getMonth(), o.now.getDate() );
    		var all_inputs_set = false;
    		allday
			.bind( 'change.timespan', function() {
				if( this.checked ) {
					time_inputs.fadeOut();
					instant.attr( 'disabled', true );
				} else {
					instant.removeAttr( 'disabled' );
					time_inputs.fadeIn();
				}
				if( ! all_inputs_set ) {
					all_inputs_set = true;
					all_inputs.calendricalDateTimeRange( {
						today: today, dateFormat: o.date_format, isoTime: o.twentyfour_hour,
						monthNames: o.month_names, dayNames: o.day_names, weekStartDay: o.week_start_day
					} );
				}
			} )
			.get().checked = false;

    		// Validate and update saved value of DATE fields upon blur.
    		date_inputs
    			.bind( 'blur.timespan', function() {
    				// Validate contents of this field.
    				var date = parseDate( this.value, o.date_format );
    				if( isNaN( date ) ) {
    					// This field is invalid.
    					reset_invalid( $(this) );
    				} else {
    					// Value is valid, so store it for later use (below).
    					$(this).data( 'timespan.stored', this.value );
    					// Re-format contents of field correctly (in case parsable but not
    					// perfect).
    					$(this).val( formatDate( date, o.date_format ) );
    				}
    			});

    		// Validate and update saved value of TIME fields upon blur.
    		time_inputs
    			.bind( 'blur.timespan', function() {
    				// Validate contents of this field.
    				var time = parseTime( this.value );
    				if( ! time ) {
    					// This field is invalid.
    					reset_invalid( $(this) );
    				} else {
    					// Value is valid, so store it for later use (below).
    					$(this).data( 'timespan.stored', this.value );
    					// Re-format contents of field correctly (in case parsable but not
    					// perfect).
    					$(this).val( formatTime( time.hour, time.minute, o.twentyfour_hour ) );
    				}
    			});

    		// Gets the time difference between start and end dates
    		function get_startend_time_difference() {
    			var start_date_val = parseDate( start_date_input.val(), o.date_format ).getTime() / 1000;
    			var start_time_val = parseTime( start_time_input.val() );
    			start_date_val += start_time_val.hour * 3600 + start_time_val.minute * 60;
    			var end_date_val = parseDate( end_date_input.val(), o.date_format ).getTime() / 1000;
    			var end_time_val = parseTime( end_time_input.val() );
    			end_date_val += end_time_val.hour * 3600 + end_time_val.minute * 60;

    			return end_date_val - start_date_val;
    		}

    		function shift_jqts_enddate() {
    			var start_date_val = parseDate( start_date_input.data( 'timespan.stored' ), o.date_format );
    			var start_time_val = parseTime( start_time_input.data( 'timespan.stored' ) );
    			var end_time_val = start_date_val.getTime() / 1000
    				+ start_time_val.hour * 3600 + start_time_val.minute * 60
    				+ start_date_input.data( 'time_diff' );
    			end_time_val = new Date( end_time_val * 1000 );
    			end_date_input.val( formatDate( end_time_val, o.date_format ) );
    			end_time_input.val( formatTime( end_time_val.getUTCHours(), end_time_val.getUTCMinutes(), o.twentyfour_hour ) );

    			return true;
    		}

    		// When start date/time are modified, update end date/time by shifting the
    		// appropriate amount.
    		start_date_input.add( o.start_time_input )
    			.bind( 'focus.timespan', function() {
    				// Calculate the time difference between start & end and save it.
    				start_date_input.data( 'time_diff', get_startend_time_difference() );
    			} )
    			.bind( 'blur.timespan', function() {
    				// If End date is earlier than StartDate, reset it to 15 mins after startDate
    				if ( start_date_input.data( 'time_diff' ) < 0 ) {
    					start_date_input.data( 'time_diff', 15 * 60 );
    				}
    				// Shift end date/time as appropriate.
    				var shift_jqts = shift_jqts_enddate();
    			} );

    		// When end date/time is modified, check if it is earlier than start date/time and shift it if needed
    		end_date_input.add( o.start_time_input )
    			.bind( 'blur.timespan', function() {
    				// If End date is earlier than StartDate, reset it to 15 mins after startDate
    				if ( get_startend_time_difference() < 0 ) {
    					start_date_input.data( 'time_diff', 15 * 60 );
    					// Shift end date/time as appropriate.
    					var shift_jqts = shift_jqts_enddate();
    				}
    			} );

    		// Validation upon form submission
    		start_date_input.closest( 'form' )
    			.bind( 'submit.timespan', function() {
    				// Update hidden field values with chosen date/time.
    				//
    				// 1. Start date/time

    				// Convert Date object into UNIX timestamp for form submission
    				var unix_start_time = parseDate( start_date_input.val(), o.date_format ).getTime() / 1000;
    				// If parsed correctly, proceed to add the time.
    				if( ! isNaN( unix_start_time ) ) {
    					// Add time quantity to date, unless "All day" is checked.
    					if( ! allday.get(0).checked ) {
    						var time = parseTime( start_time_input.val() );
    						// If parsed correctly, proceed add its value.
    						if( time ) {
    							unix_start_time += time.hour * 3600 + time.minute * 60;
    						} else {
    							// Else entire calculation is invalid.
    							unix_start_time = '';
    						}
    					}
    				} else {
    					// Else entire calculation is invalid.
    					unix_start_time = '';
    				}
    				// Set start date value to valid unix time, or empty string, depending
    				// on above validation.
    				start_time.val( unix_start_time );

    				// 2. End date/time

    				// Convert Date object into UNIX timestamp for form submission
    				var unix_end_time = parseDate( end_date_input.val(), o.date_format ).getTime() / 1000;
    				// If parsed correctly, proceed to add the time.
    				if( ! isNaN( unix_end_time ) ) {
    					// If "All day" is checked, store an end date that is one day
    					// *after* the start date (following iCalendar spec).
    					if( allday.get(0).checked ) {
    						unix_end_time += 24 * 60 * 60;
    					// Else add time quantity to date.
    					} else {
    						var time = parseTime( end_time_input.val() );
    						// If parsed correctly, proceed add its value.
    						if( time ) {
    							unix_end_time += time.hour * 3600 + time.minute * 60;
    						} else {
    							// Else entire calculation is invalid.
    							unix_end_time = '';
    						}
    					}
    				} else {
    					// Else entire calculation is invalid.
    					unix_end_time = '';
    				}
    				// Set end date value to valid unix time, or empty string, depending
    				// on above validation.
    				end_time.val( unix_end_time );
    			} );

    		// Store original form values
    		start_time.data( 'timespan.initial_value', start_time.val() );
    		end_time.data( 'timespan.initial_value', end_time.val() );
    		allday.data( 'timespan.initial_value', allday.get(0).checked );

    		// Initialize input fields
    		reset( start_date_input,
    				start_time_input,
    				start_time,
    				end_date_input,
    				end_time_input,
    				end_time,
    				allday,
    				o.twentyfour_hour,
    				o.date_format,
    				o.now )

    		return this;
    	},

    	/**
    	 * Reset values to defaults.
    	 */
    	reset: function( options )
    	{
    		var o = $.extend( {}, default_options, options );

    		reset( $(o.start_date_input),
    				$(o.start_time_input),
    				$(o.start_time),
    				$(o.end_date_input),
    				$(o.end_time_input),
    				$(o.end_time),
    				$(o.allday),
    				o.twentyfour_hour,
    				o.date_format,
    				o.now );

    		return this;
    	},

    	/**
    	 * Destroy registered event handlers.
    	 */
    	destroy: function( options )
     	{
    		options = $.extend( {}, default_options, options );

    		$.each( options, function( option_name, value ) {
    			$(value).unbind( '.timespan' );
    		} );
    		$(options.start_date_input).closest('form').unbind( '.timespan' );

    		return this;
    	}
    }

    /**
     * Main jQuery plugin definition
     */

    $.timespan = function( arg )
    {
    	// Method calling logic
    	if( methods[arg] ) {
    		return methods[arg].apply( this, Array.prototype.slice.call( arguments, 1 ));
    	} else if( typeof arg === 'object' || ! arg ) {
    		return methods.init.apply( this, arguments );
    	} else {
    		$.error( 'Method ' + arg + ' does not exist on jQuery.timespan' );
    	}
    };
    return {
    	formatDate : formatDate,
    	parseDate  : parseDate
    };
} );

timely.define('scripts/add_new_event/event_date_time/date_time_event_handlers',
		[
		 "jquery_timely",
		 'ai1ec_config',
		 'scripts/add_new_event/event_date_time/date_time_utility_functions',
		 'external_libs/jquery.calendrical_timespan',
		 "libs/utils"
		 ],
		 function( $, ai1ec_config, date_time_utility_functions, calendrical_functions, AI1EC_UTILS ) {
	 // jshint ;_;
	var ajaxurl = AI1EC_UTILS.get_ajax_url();
	/**
	 * Show/hide elements that show selectors for ending until/after events
	 */
	var show_end_fields = function() {
		var selected = $( '#ai1ec_end option:selected' ).val();
		switch( selected ) {
			// Never selected, hide end fields
			case '0':
				date_time_utility_functions.hide_all_end_fields();
				break;
			// After selected
			case '1':
				if( $( '#ai1ec_count_holder' ).css( 'display' ) === 'none' ) {
					date_time_utility_functions.hide_all_end_fields();
					$( '#ai1ec_count_holder' ).fadeIn();
				}
				break;
			// On date selected
			case '2':
				if( $( '#ai1ec_until_holder' ).css( 'display' ) === 'none' ) {
					date_time_utility_functions.hide_all_end_fields();
					$( '#ai1ec_until_holder' ).fadeIn();
				}
				break;
		}
	};
	var trigger_publish = function() {
		$( '#publish' ).trigger( 'click' );
	};
	// Handles clicks on the tabs when the modal is open
	var handle_click_on_tab_modal = function( e ) {
		if( ! $( this ).hasClass( 'ai1ec_active' ) ) {
			var $active_tab = $( '.ai1ec_repeat_tabs > li > a.ai1ec_active' );
			var $active_content = $( $active_tab.attr( 'href' ) );

			var $becoming_active = $( $( this ).attr( 'href' ) );

			$active_tab.removeClass( 'ai1ec_active' );
			$active_content.hide();

			$( this ).addClass( 'ai1ec_active' );
			$becoming_active.append( $( '#ai1ec_repeat_tab_append' ) );
			$( '#ai1ec_ending_box' ).show();
			$becoming_active.show();
		}
		return false;
	};
	// Handle click on the Apply button
	var handle_click_on_apply_button = function( e ) {
		var $button = $( this );
		var rule = '';
		var $active_tab = $( $( '.ai1ec_active' ).attr( 'href' ) );
		var frequency = $active_tab.attr( 'title' );
		switch( frequency ) {
			case 'daily':
				rule += 'FREQ=DAILY;';
				var interval_day = $( '#ai1ec_daily_count' ).val();
				if( interval_day > 1 ) {
					rule += 'INTERVAL=' + interval_day + ';';
				}
				break;
			case 'weekly':
				rule += 'FREQ=WEEKLY;';
				var interval_week = $( '#ai1ec_weekly_count' ).val();
				if( interval_week > 1 ) {
					rule += 'INTERVAL=' + interval_week + ';';
				}
				var week_days = $( 'input[name="ai1ec_weekly_date_select"]:first' ).val();
				var wkst = $( '#ai1ec_weekly_date_select > li:first > input[type="hidden"]:first' ).val();
				if( week_days.length > 0 ) {
					rule += 'WKST=' + wkst + ';BYday=' + week_days + ';';
				}
				break;
			case 'monthly':
				rule += 'FREQ=MONTHLY;';
				var interval_month  = $( '#ai1ec_monthly_count' ).val();
				var monthtype = $( 'input[name="ai1ec_monthly_type"]:checked' ).val();
				if( interval_month > 1 ) {
					rule += 'INTERVAL=' + interval_month + ';';
				}
				var month_days = $( 'input[name="ai1ec_montly_date_select"]:first' ).val();
				if( month_days.length > 0 && monthtype === 'bymonthday' ) {
					rule += 'BYMONTHDAY=' + month_days + ';';
				} else if ( monthtype === 'byday' ) {
					var byday_num     = $( '#ai1ec_monthly_byday_num' ).val();
					var byday_weekday = $( '#ai1ec_monthly_byday_weekday' ).val();
					rule += 'BYday=' + byday_num + byday_weekday + ';';
				}
				break;
			case 'yearly':
				rule += 'FREQ=YEARLY;';
				var interval_year = $( '#ai1ec_yearly_count' ).val();
				if( interval_year > 1 ) {
					rule += 'INTERVAL=' + interval_year + ';';
				}
				var months = $( 'input[name="ai1ec_yearly_date_select"]:first' ).val();
				if( months.length > 0 ) {
					rule += 'BYMONTH=' + months + ';';
				}
				break;
		}

		var ending = $( '#ai1ec_end' ).val();
		// After
		if( ending === '1' ) {
			rule += 'COUNT=' + $( '#ai1ec_count' ).val() + ';';
		}
		// On Date
		if( ending === '2' ) {
			var until = calendrical_functions.parseDate( $( '#ai1ec_until-date-input' ).val(), ai1ec_config.date_format );


			// Take the starting date to set hour and minute
			var start = new Date( calendrical_functions.parseDate( $( '#ai1ec_start-time' ).val(), ai1ec_config.date_format ) );
			// Get UTC Day and UTC Month, and then add leading zeroes if required
			var d     = until.getUTCDate();
			var m     = until.getUTCMonth() + 1;
			var hh    = start.getUTCHours();
			var mm    = start.getUTCMinutes();

			// months
			m         = ( m < 10 )  ? '0' + m  : m;
			// days
			d         = ( d < 10 )  ? '0' + d  : d;
			// hours
			hh        = ( hh < 10 ) ? '0' + hh : hh;
			// minutes
			mm        = ( mm < 10 ) ? '0' + mm : mm;
			// Now, set the UTC friendly date string
			until     = until.getUTCFullYear() + '' + m + d + 'T235959Z';
			rule += 'UNTIL=' + until + ';';
		}

		var data = {
			action       : 'ai1ec_rrule_to_text',
			rrule        :  rule
		};

		$( this ).attr( 'disabled', true );
		$.post(
			ajaxurl,
			data,
			function( response ) {
				if( response.error ) {
					if( $( '#ai1ec_is_box_repeat' ).val() === '1' ) {
						date_time_utility_functions.ai1ec_repeat_form_error( '#ai1ec_rrule', '#ai1ec_repeat_label', response, $button );
					} else {
						date_time_utility_functions.ai1ec_repeat_form_error( '#ai1ec_exrule', '#ai1ec_exclude_label', response, $button );
					}
				} else {
					if( $( '#ai1ec_is_box_repeat' ).val() === '1' ) {
						date_time_utility_functions.ai1ec_repeat_form_success( '#ai1ec_rrule', '#ai1ec_repeat_label', '#ai1ec_repeat_text > a', rule, $button, response );
					} else {
						date_time_utility_functions.ai1ec_repeat_form_success( '#ai1ec_exrule', '#ai1ec_exclude_label', '#ai1ec_exclude_text > a', rule, $button, response );
					}
				}
			},
			'json'
		);
	};
	// Handle clicking on cancel button
	var handle_click_on_cancel_modal = function( e ) {
		if( $( '#ai1ec_is_box_repeat' ).val() === '1' ) {
			// handles click on cancel for RRULE
			date_time_utility_functions.ai1ec_click_on_modal_cancel( '#ai1ec_repeat_text > a', '#ai1ec_repeat', '#ai1ec_repeat_label' );
		} else {
			// handles click on cancel for EXRULE
			date_time_utility_functions.ai1ec_click_on_modal_cancel( '#ai1ec_exclude_text > a', '#ai1ec_exclude', '#ai1ec_exclude_label' );
		}
		$.unblockUI();
		return false;
	};
	// Handle clicking on the two checkboxes in the monthly tab
	var handle_checkbox_monthly_tab_modal = function( e ) {
		$( '#ai1c_repeat_monthly_bymonthday' ).toggle();
		$( '#ai1c_repeat_monthly_byday' ).toggle();
	};
	var handle_click_on_day_month_in_modal = function( e ) {
		var $this = $( e.target );
		if( $this.hasClass( 'ai1ec_selected' ) ) {
			$this.removeClass( 'ai1ec_selected' );
		} else {
			$this.addClass( 'ai1ec_selected' );
		}
		var data = [];
		var $ul = $this.closest( 'ul' );
		$( 'li', $ul ).each( function( i, el ) {
			if( $( el ).hasClass( 'ai1ec_selected' ) ) {
				var value = $( el ).children( 'input[type="hidden"]:first' ).val();
				data.push( value );
			}
		});
		$ul.next().val( data.join() );
	};
	// This are pseudo handlers, they might require a refactoring sooner or later
	var execute_pseudo_handlers = function() {
		// handles click on rrule text
		date_time_utility_functions.ai1ec_click_on_ics_rule_text(
			'#ai1ec_repeat_text > a',
			'#ai1ec_repeat',
			'#ai1ec_repeat_label',
			{
				action: 'ai1ec_get_repeat_box',
				repeat: 1,
				post_id: $( '#post_ID' ).val()
			},
			date_time_utility_functions.ai1ec_apply_js_on_repeat_block
		);
		// handles click on exrule text
		date_time_utility_functions.ai1ec_click_on_ics_rule_text(
			'#ai1ec_exclude_text > a',
			'#ai1ec_exclude',
			'#ai1ec_exclude_label',
			{
				action: 'ai1ec_get_repeat_box',
				repeat: 0,
				post_id: $( '#post_ID' ).val()
			},
			date_time_utility_functions.ai1ec_apply_js_on_repeat_block
		);

		// handles click on repeat checkbox
		date_time_utility_functions.ai1ec_click_on_checkbox(
			'#ai1ec_repeat',
			'#ai1ec_repeat_text > a',
			'#ai1ec_repeat_label',
			{
				action: 'ai1ec_get_repeat_box',
				repeat: 1,
				post_id: $( '#post_ID' ).val()
			},
			date_time_utility_functions.ai1ec_apply_js_on_repeat_block
		);

		// handles click on exclude checkbox
		date_time_utility_functions.ai1ec_click_on_checkbox(
			'#ai1ec_exclude',
			'#ai1ec_exclude_text > a',
			'#ai1ec_exclude_label',
			{
				action: 'ai1ec_get_repeat_box',
				repeat: 0,
				post_id: $( '#post_ID' ).val()
			},
			date_time_utility_functions.ai1ec_apply_js_on_repeat_block
		);
	};
	var handle_animation_of_calendar_widget = function( e ) {
		// On the first run it will be undefined, so we set it to false
		var state = $( this ).data( 'state' ) === undefined ? false : $( this ).data( 'state' );
		$('#widgetCalendar').stop().animate( { height: state ? 0 : $( '#widgetCalendar div.datepicker' ).get( 0 ).offsetHeight }, 500 );
		$( this ).data( 'state', ! state );
		return false;
	};
	return {
		show_end_fields                     : show_end_fields,
		trigger_publish                     : trigger_publish,
		handle_click_on_tab_modal           : handle_click_on_tab_modal,
		handle_click_on_apply_button        : handle_click_on_apply_button,
		handle_click_on_cancel_modal        : handle_click_on_cancel_modal,
		handle_checkbox_monthly_tab_modal   : handle_checkbox_monthly_tab_modal,
		execute_pseudo_handlers             : execute_pseudo_handlers,
		handle_animation_of_calendar_widget : handle_animation_of_calendar_widget,
		handle_click_on_day_month_in_modal  : handle_click_on_day_month_in_modal
	};
} );
// Bootstrap Modals, manually namespaced
// Important: Whenever updating this file from Bootstrap, replace all
// occurrences as follows:
// 	data-dismiss="modal" => data-dismiss="ai1ec_modal"
// 	data-toggle="modal" => data-toggle="ai1ec_modal"
// 	modal-backdrop => ai1ec-modal-backdrop
// 	modal-body => ai1ec-modal-body

timely.define('external_libs/bootstrap_modal', ["jquery_timely"],
		function( $ ) {

	/* =========================================================
	 * bootstrap-modal.js v2.2.2
	 * http://twitter.github.com/bootstrap/javascript.html#modals
	 * =========================================================
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
	 * ========================================================= */




	   // jshint ;_;


	 /* MODAL CLASS DEFINITION
	  * ====================== */

	  var Modal = function (element, options) {
	    this.options = options
	    this.$element = $(element)
	      .delegate('[data-dismiss="ai1ec_modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
	    this.options.remote && this.$element.find('.ai1ec-modal-body').load(this.options.remote)
	  }

	  Modal.prototype = {

	      constructor: Modal

	    , toggle: function () {
	        return this[!this.isShown ? 'show' : 'hide']()
	      }

	    , show: function () {
	        var that = this
	          , e = $.Event('show')

	        this.$element.trigger(e)

	        if (this.isShown || e.isDefaultPrevented()) return

	        this.isShown = true

	        this.escape()

	        this.backdrop(function () {
	          var transition = $.support.transition && that.$element.hasClass('fade')

	          if (!that.$element.parent().length) {
	            that.$element.appendTo(document.body) //don't move modals dom position
	          }

	          that.$element
	            .show()

	          if (transition) {
	            that.$element[0].offsetWidth // force reflow
	          }

	          that.$element
	            .addClass('in')
	            .attr('aria-hidden', false)

	          that.enforceFocus()

	          transition ?
	            that.$element.one($.support.transition.end, function () { that.$element.focus().trigger('shown') }) :
	            that.$element.focus().trigger('shown')

	        })
	      }

	    , hide: function (e) {
	        e && e.preventDefault()

	        var that = this

	        e = $.Event('hide')

	        this.$element.trigger(e)

	        if (!this.isShown || e.isDefaultPrevented()) return

	        this.isShown = false

	        this.escape()

	        $(document).off('focusin.modal')

	        this.$element
	          .removeClass('in')
	          .attr('aria-hidden', true)

	        $.support.transition && this.$element.hasClass('fade') ?
	          this.hideWithTransition() :
	          this.hideModal()
	      }

	    , enforceFocus: function () {
	        var that = this
	        $(document).on('focusin.modal', function (e) {
	          if (that.$element[0] !== e.target && !that.$element.has(e.target).length) {
	            that.$element.focus()
	          }
	        })
	      }

	    , escape: function () {
	        var that = this
	        if (this.isShown && this.options.keyboard) {
	          this.$element.on('keyup.dismiss.modal', function ( e ) {
	            e.which == 27 && that.hide()
	          })
	        } else if (!this.isShown) {
	          this.$element.off('keyup.dismiss.modal')
	        }
	      }

	    , hideWithTransition: function () {
	        var that = this
	          , timeout = setTimeout(function () {
	              that.$element.off($.support.transition.end)
	              that.hideModal()
	            }, 500)

	        this.$element.one($.support.transition.end, function () {
	          clearTimeout(timeout)
	          that.hideModal()
	        })
	      }

	    , hideModal: function (that) {
	        this.$element
	          .hide()
	          .trigger('hidden')

	        this.backdrop()
	      }

	    , removeBackdrop: function () {
	        this.$backdrop.remove()
	        this.$backdrop = null
	      }

	    , backdrop: function (callback) {
	        var that = this
	          , animate = this.$element.hasClass('fade') ? 'fade' : ''

	        if (this.isShown && this.options.backdrop) {
	          var doAnimate = $.support.transition && animate

	          this.$backdrop = $('<div class="ai1ec-modal-backdrop ' + animate + '" />')
	            .appendTo(document.body)

	          this.$backdrop.click(
	            this.options.backdrop == 'static' ?
	              $.proxy(this.$element[0].focus, this.$element[0])
	            : $.proxy(this.hide, this)
	          )

	          if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

	          this.$backdrop.addClass('in')

	          doAnimate ?
	            this.$backdrop.one($.support.transition.end, callback) :
	            callback()

	        } else if (!this.isShown && this.$backdrop) {
	          this.$backdrop.removeClass('in')

	          $.support.transition && this.$element.hasClass('fade')?
	            this.$backdrop.one($.support.transition.end, $.proxy(this.removeBackdrop, this)) :
	            this.removeBackdrop()

	        } else if (callback) {
	          callback()
	        }
	      }
	  }


	 /* MODAL PLUGIN DEFINITION
	  * ======================= */

	  var old = $.fn.modal

	  $.fn.modal = function (option) {
	    return this.each(function () {
	      var $this = $(this)
	        , data = $this.data('modal')
	        , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
	      if (!data) $this.data('modal', (data = new Modal(this, options)))
	      if (typeof option == 'string') data[option]()
	      else if (options.show) data.show()
	    })
	  }

	  $.fn.modal.defaults = {
	      backdrop: true
	    , keyboard: true
	    , show: true
	  }

	  $.fn.modal.Constructor = Modal


	 /* MODAL NO CONFLICT
	  * ================= */

	  $.fn.modal.noConflict = function () {
	    $.fn.modal = old
	    return this
	  }


	 /* MODAL DATA-API
	  * ============== */

	  $(document).on('click.modal.data-api', '[data-toggle="ai1ec_modal"]', function (e) {
	    var $this = $(this)
	      , href = $this.attr('href')
	      , $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
	      , option = $target.data('modal') ? 'toggle' : $.extend({ remote:!/#/.test(href) && href }, $target.data(), $this.data())

	    e.preventDefault()

	    $target
	      .modal(option)
	      .one('hide', function () {
	        $this.focus()
	      })
	  })


} );

timely.define('libs/modal_helper',
	[
		"jquery_timely",
		"domReady",
		"external_libs/bootstrap_modal"
	],
	function( $, domReady ) {
	

	domReady( function() {
		// Reproduce old Bootstrap behaviour of adding "modal-open" class to body
		// element while modal is open.
		var $body = $( 'body' );
		$body
			.on( 'shown', '.ai1ec-modal', function () {
				$body.addClass( 'ai1ec-modal-open' )
			} )
			.on( 'hidden', '.ai1ec-modal', function () {
				$body.removeClass( 'ai1ec-modal-open' )
			} );
	} );
} );

timely.define('scripts/add_new_event/facebook_export',
	[
		"jquery_timely",
		"libs/modal_helper"
	],
	function( $ ) {
	

	var open_modal_when_user_chooses_to_unpublish_event = function( e ) {
		if( ! $( this ).is( ':checked' ) && $( '#ai1ec-facebook-export-modal' ).length ) {
			$( '#ai1ec-facebook-export-modal' ).modal( {
				"show": true,
				"backdrop" : 'static'
			} );
		} else {
			// Remove th hidden input if present
			$( '#ai1ec-remove-event-hidden' ).remove();
		}
	};
	var add_hidden_field_when_user_click_remove_in_modal = function() {
		$( '#ai1ec-facebook-export-modal' ).modal( 'hide' );
		if( $( this ).hasClass( 'remove' ) ) {
			var $input = $( '<input />', {
				type  : "hidden",
				name  : "ai1ec-remove-event",
				value : 1,
				id    : "ai1ec-remove-event-hidden"
			} );
			$( '#ai1ec-facebook-publish' ).append( $input );
		}
	};
	var refresh_page_tokens = function( e ) {
		e.preventDefault();
		var data = {
				"action"     : 'ai1ec_refresh_tokens'
			};
		$.post(
			ajaxurl,
			data,
			function( data ) {
				var $facebook = $( e.target ).closest( '#ai1ec-facebook-publish' );
				var $radios = $facebook.find( '.ai1ec_export_radios' );
				var $multi = $radios.find( '.ai1ec_multi_choiches' );
				// are the radios hidden or not?
				var hidden = true;
				if( $multi.length > 0 ) {
					hidden = $multi.hasClass( 'hide' );
				}
				
				// if the radio buttons exist, replace them
				if( $radios.length > 0 ) {
					$radios.replaceWith( data );
				} else {
					$facebook.find( '.ai1ec_refresh_tokens' ).before( data );
				}
				if( false === hidden ) {
					$( '#ai1ec-facebook-publish' ).find( '.ai1ec_multi_choiches' ).removeClass( 'hide' );
				}
			},
			'json'
		);
	};
	var show_multi_choices_when_present = function( e ) {
		var $multi = $( '.ai1ec_multi_choiches' ), $this = $( this );

		if( 0 !== $multi.length ) {
			if( this.checked ) {
				$multi.removeClass( 'hide' );
			} else {
				$multi.addClass( 'hide' );
			}
		}
	};
	return {
		open_modal_when_user_chooses_to_unpublish_event  : open_modal_when_user_chooses_to_unpublish_event,
		add_hidden_field_when_user_click_remove_in_modal : add_hidden_field_when_user_click_remove_in_modal,
		show_multi_choices_when_present                  : show_multi_choices_when_present,
		refresh_page_tokens                              : refresh_page_tokens
	};
} );

timely.define('scripts/add_new_event/event_cost_helper',
	[
		"jquery_timely",
		"ai1ec_config"
	],
	function( $, ai1ec_config ) {
		

		var is_free = function() {
			return $( '#ai1ec_is_free' ).is( ':checked' );
		};

		var is_price_entered = function() {
			return ( $( '#ai1ec_cost' ).val() !== '' );
		};

		var is_free_click_handler = function( evt ) {
			var $wrap = $( this ).parents( 'table:eq(0)' );
			var $cost = $( '#ai1ec_cost', $wrap );
			var label = ai1ec_config.label_a_buy_tickets_url;
			if ( is_free() ) {
				$cost.attr( 'value', '' ).addClass( 'ai1ec-hidden' );
				label = ai1ec_config.label_a_rsvp_url;
			} else {
				$cost.removeClass( 'ai1ec-hidden' );
			}
			$( 'label[for=ai1ec_ticket_url]', $wrap ).text( label );
		};

		return {
			handle_change_is_free:  is_free_click_handler,
			check_is_free:          is_free,
			check_is_price_entered: is_price_entered
		};
	}
);

timely.define('external_libs/jquery.inputdate', 
		[
		 "jquery_timely",
		 "external_libs/jquery.calendrical_timespan"
		 ],
		 function( $, calendrical_functions ) {

	/**
	 * Private functions
	 */
	
	// Helper function - reset contents of current field to stored original
	// value and alert user.
	function reset_invalid( field )
	{
		field
			.addClass( 'error' )
			.fadeOut( 'normal', function() {
				field
					.val( field.data( 'timespan.stored' ) )
					.removeClass( 'error' )
					.fadeIn( 'fast' );
			});
	}
	
	// Stores the value of the HTML element in context to its "stored" jQuery data.
	function store_value() {
		$(this).data( 'timespan.stored', this.value );
	}
	
	/**
	 * Value initialization
	 */
	function reset( start_date_input, start_time, twentyfour_hour, date_format, now )
	{
		// Restore original values of fields when the page was loaded
		start_time.val( start_time.data( 'timespan.initial_value' ) );
	
		// Fill out input field with default date/time based on this original
		// value.
	
		var start = parseInt( start_time.val() );
		// If start_time field has a valid integer, use it, else use current time
		// rounded to nearest quarter-hour.
		if( ! isNaN( parseInt( start ) ) ) {
			start = new Date( parseInt( start ) * 1000 );
		} else {
			start = new Date( now );
		}
		start_date_input.val( calendrical_functions.formatDate( start, date_format ) );
	
		// Trigger function (defined above) to internally store values of each
		// input field (used in calculations later).
		start_date_input.each( store_value );
	}
	
	/**
	 * Private constants
	 */
	
	var default_options = {
		start_date_input: 'date-input',
		start_time: 'time',
		twentyfour_hour: false,
		date_format: 'def',
		now: new Date()
	};
	
	/**
	 * Public methods
	 */
	
	var methods = {
	
		/**
		 * Initialize settings.
		 */
		init: function( options )
		{
			var o = $.extend( {}, default_options, options );
	
			// Shortcut jQuery objects
			var start_date_input = $(o.start_date_input);
			var start_time = $(o.start_time);
	
			var date_inputs = start_date_input;
			var all_inputs = start_date_input;
	
			/**
			 * Event handlers
			 */
	
			// Save original (presumably valid) value of every input field upon focus.
			all_inputs.bind( 'focus.timespan', store_value );
			date_inputs.calendricalDate( {
				today: new Date( o.now.getFullYear(), o.now.getMonth(), o.now.getDate() ),
				dateFormat: o.date_format, monthNames: o.month_names, dayNames: o.day_names,
				weekStartDay: o.week_start_day
			} );
	
			// Validate and update saved value of DATE fields upon blur.
			date_inputs
				.bind( 'blur.timespan', function() {
					// Validate contents of this field.
					var date = calendrical_functions.parseDate( this.value, o.date_format );
					if( isNaN( date ) ) {
						// This field is invalid.
						reset_invalid( $(this) );
					} else {
						// Value is valid, so store it for later use (below).
						$(this).data( 'timespan.stored', this.value );
						// Re-format contents of field correctly (in case parsable but not
						// perfect).
						$(this).val( calendrical_functions.formatDate( date, o.date_format ) );
					}
				});
	
			// When start date/time are modified, update end date/time by shifting the
			// appropriate amount.
			start_date_input.bind( 'focus.timespan', function() {
					// Calculate the time difference between start & end and save it.
					var start_date_val = calendrical_functions.parseDate( start_date_input.val(), o.date_format ).getTime() / 1000;
				} )
				.bind( 'blur.timespan', function() {
					var start_date_val = calendrical_functions.parseDate( start_date_input.data( 'timespan.stored' ), o.date_format );
					// Shift end date/time as appropriate.
				} );
	
			// Validation upon form submission
			start_date_input.closest( 'form' )
				.bind( 'submit.timespan', function() {
					// Update hidden field value with chosen date/time.
	
					// Convert Date object into UNIX timestamp for form submission
					var unix_start_time = calendrical_functions.parseDate( start_date_input.val(), o.date_format ).getTime() / 1000;
					// If parsed incorrectly, entire calculation is invalid.
					if( isNaN( unix_start_time ) ) {
						unix_start_time = '';
					}
					// Set start date value to valid unix time, or empty string, depending
					// on above validation.
					start_time.val( unix_start_time );
				} );
	
			// Store original form value
			start_time.data( 'timespan.initial_value', start_time.val() );
	
			// Initialize input fields
			reset( start_date_input,
					start_time,
					o.twentyfour_hour,
					o.date_format,
					o.now )
	
			return this;
		},
	
		/**
		 * Reset values to defaults.
		 */
		reset: function( options )
		{
			var o = $.extend( {}, default_options, options );
	
			reset( $(o.start_date_input),
					$(o.start_time),
					o.twentyfour_hour,
					o.date_format,
					o.now );
	
			return this;
		},
	
		/**
		 * Destroy registered event handlers.
		 */
		destroy: function( options )
	 	{
			options = $.extend( {}, default_options, options );
	
			$.each( options, function( option_name, value ) {
				$(value).unbind( '.timespan' );
			} );
			$(options.start_date_input).closest('form').unbind( '.timespan' );
	
			return this;
		}
	}
	
	/**
	 * Main jQuery plugin definition
	 */
	
	$.inputdate = function( arg )
	{
		// Method calling logic
		if( methods[arg] ) {
			return methods[arg].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if( typeof arg === 'object' || ! arg ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' + arg + ' does not exist on jQuery.timespan' );
		}
	};
} );
timely.define('external_libs/jquery.tools', 
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
			
			$.tools = $.tools || {version: '1.2.7'};

			var tool;

			tool = $.tools.rangeinput = {

				conf: {
					min: 0,
					max: 100,		// as defined in the standard
					step: 'any', 	// granularity of the value. a non-zero float or int (or "any")
					steps: 0,
					value: 0,			
					precision: undefined,
					vertical: 0,
					keyboard: true,
					progress: false,
					speed: 100,

					// set to null if not needed
					css: {
						input:		'range',
						slider: 		'slider',
						progress: 	'progress',
						handle: 		'handle'					
					}

				} 
			};

		//{{{ fn.drag

			/* 
				FULL featured drag and drop. 0.7 kb minified, 0.3 gzipped. done.
				Who told d'n'd is rocket science? Usage:
				
				$(".myelement").drag({y: false}).on("drag", function(event, x, y) {
					// do your custom thing
				});
				 
				Configuration: 
					x: true, 		// enable horizontal drag
					y: true, 		// enable vertical drag 
					drag: true 		// true = perform drag, false = only fire events 
					
				Events: dragStart, drag, dragEnd. 
			*/
			var doc, draggable;

			$.fn.drag = function(conf) {

				// disable IE specialities
				document.ondragstart = function () { return false; };

				conf = $.extend({x: true, y: true, drag: true}, conf);

				doc = doc || $(document).on("mousedown mouseup", function(e) {

					var el = $(e.target);  

					// start 
					if (e.type == "mousedown" && el.data("drag")) {

						var offset = el.position(),
							 x0 = e.pageX - offset.left, 
							 y0 = e.pageY - offset.top,
							 start = true;    

						doc.on("mousemove.drag", function(e) {  
							var x = e.pageX -x0, 
								 y = e.pageY -y0,
								 props = {};

							if (conf.x) { props.left = x; }
							if (conf.y) { props.top = y; } 

							if (start) {
								el.trigger("dragStart");
								start = false;
							}
							if (conf.drag) { el.css(props); }
							el.trigger("drag", [y, x]);
							draggable = el;
						}); 

						e.preventDefault();

					} else {

						try {
							if (draggable) {  
								draggable.trigger("dragEnd");  
							}
						} finally { 
							doc.off("mousemove.drag");
							draggable = null; 
						}
					} 

				});

				return this.data("drag", true); 
			};	

		//}}}



			function round(value, precision) {
				var n = Math.pow(10, precision);
				return Math.round(value * n) / n;
			}

			// get hidden element's width or height even though it's hidden
			function dim(el, key) {
				var v = parseInt(el.css(key), 10);
				if (v) { return v; }
				var s = el[0].currentStyle; 
				return s && s.width && parseInt(s.width, 10);	
			}

			function hasEvent(el) {
				var e = el.data("events");
				return e && e.onSlide;
			}

			function RangeInput(input, conf) {

				// private variables
				var self = this,  
					 css = conf.css, 
					 root = $("<div><div/><a href='#'/></div>").data("rangeinput", self),	
					 vertical,		
					 value,			// current value
					 origo,			// handle's start point
					 len,				// length of the range
					 pos;				// current position of the handle		

				// create range	 
				input.before(root);	

				var handle = root.addClass(css.slider).find("a").addClass(css.handle), 	
					 progress = root.find("div").addClass(css.progress);

				// get (HTML5) attributes into configuration
				$.each("min,max,step,value".split(","), function(i, key) {
					var val = input.attr(key);
					if (parseFloat(val)) {
						conf[key] = parseFloat(val, 10);
					}
				});			   

				var range = conf.max - conf.min, 
					 step = conf.step == 'any' ? 0 : conf.step,
					 precision = conf.precision;

				if (precision === undefined) {
					precision = step.toString().split(".");
					precision = precision.length === 2 ? precision[1].length : 0;
				}  

				// Replace built-in range input (type attribute cannot be changed)
				if (input.attr("type") == 'range') {			
					var def = input.clone().wrap("<div/>").parent().html(),
						 clone = $(def.replace(/type/i, "type=text data-orig-type"));

					clone.val(conf.value);
					input.replaceWith(clone);
					input = clone;
				}

				input.addClass(css.input);

				var fire = $(self).add(input), fireOnSlide = true;


				/**
				 	The flesh and bone of this tool. All sliding is routed trough this.
					
					@param evt types include: click, keydown, blur and api (setValue call)
					@param isSetValue when called trough setValue() call (keydown, blur, api)
					
					vertical configuration gives additional complexity. 
				 */
				function slide(evt, x, val, isSetValue) { 

					// calculate value based on slide position
					if (val === undefined) {
						val = x / len * range;  

					// x is calculated based on val. we need to strip off min during calculation	
					} else if (isSetValue) {
						val -= conf.min;	
					}

					// increment in steps
					if (step) {
						val = Math.round(val / step) * step;
					}

					// count x based on value or tweak x if stepping is done
					if (x === undefined || step) {
						x = val * len / range;	
					}  

					// crazy value?
					if (isNaN(val)) { return self; }       

					// stay within range
					x = Math.max(0, Math.min(x, len));  
					val = x / len * range;   

					if (isSetValue || !vertical) {
						val += conf.min;
					}

					// in vertical ranges value rises upwards
					if (vertical) {
						if (isSetValue) {
							x = len -x;
						} else {
							val = conf.max - val;	
						}
					}	

					// precision
					val = round(val, precision); 

					// onSlide
					var isClick = evt.type == "click";
					if (fireOnSlide && value !== undefined && !isClick) {
						evt.type = "onSlide";           
						fire.trigger(evt, [val, x]); 
						if (evt.isDefaultPrevented()) { return self; }  
					}				

					// speed & callback
					var speed = isClick ? conf.speed : 0,
						 callback = isClick ? function()  {
							evt.type = "change";
							fire.trigger(evt, [val]);
						 } : null;

					if (vertical) {
						handle.animate({top: x}, speed, callback);
						if (conf.progress) { 
							progress.animate({height: len - x + handle.height() / 2}, speed);	
						}				

					} else {
						handle.animate({left: x}, speed, callback);
						if (conf.progress) { 
							progress.animate({width: x + handle.width() / 2}, speed); 
						}
					}

					// store current value
					value = val; 
					pos = x;			 

					// se input field's value
					input.val(val);

					return self;
				} 


				$.extend(self, {  

					getValue: function() {
						return value;	
					},

					setValue: function(val, e) {
						init();
						return slide(e || $.Event("api"), undefined, val, true); 
					}, 			  

					getConf: function() {
						return conf;	
					},

					getProgress: function() {
						return progress;	
					},

					getHandle: function() {
						return handle;	
					},			

					getInput: function() {
						return input;	
					}, 

					step: function(am, e) {
						e = e || $.Event();
						var step = conf.step == 'any' ? 1 : conf.step;
						self.setValue(value + step * (am || 1), e);	
					},

					// HTML5 compatible name
					stepUp: function(am) { 
						return self.step(am || 1);
					},

					// HTML5 compatible name
					stepDown: function(am) { 
						return self.step(-am || -1);
					}

				});

				// callbacks
				$.each("onSlide,change".split(","), function(i, name) {

					// from configuration
					if ($.isFunction(conf[name]))  {
						$(self).on(name, conf[name]);	
					}

					// API methods
					self[name] = function(fn) {
						if (fn) { $(self).on(name, fn); }
						return self;	
					};
				}); 


				// dragging		                                  
				handle.drag({drag: false}).on("dragStart", function() {

					/* do some pre- calculations for seek() function. improves performance */			
					init();

					// avoid redundant event triggering (= heavy stuff)
					fireOnSlide = hasEvent($(self)) || hasEvent(input);


				}).on("drag", function(e, y, x) {        

					if (input.is(":disabled")) { return false; } 
					slide(e, vertical ? y : x); 

				}).on("dragEnd", function(e) {
					if (!e.isDefaultPrevented()) {
						e.type = "change";
						fire.trigger(e, [value]);	 
					}

				}).click(function(e) {
					return e.preventDefault();	 
				});		

				// clicking
				root.click(function(e) { 
					if (input.is(":disabled") || e.target == handle[0]) { 
						return e.preventDefault(); 
					}				  
					init(); 
					var fix = vertical ? handle.height() / 2 : handle.width() / 2;
					slide(e, vertical ? len-origo-fix + e.pageY  : e.pageX -origo -fix);  
				});

				if (conf.keyboard) {

					input.keydown(function(e) {

						if (input.attr("readonly")) { return; }

						var key = e.keyCode,
							 up = $([75, 76, 38, 33, 39]).index(key) != -1,
							 down = $([74, 72, 40, 34, 37]).index(key) != -1;					 

						if ((up || down) && !(e.shiftKey || e.altKey || e.ctrlKey)) {

							// UP: 	k=75, l=76, up=38, pageup=33, right=39			
							if (up) {
								self.step(key == 33 ? 10 : 1, e);

							// DOWN:	j=74, h=72, down=40, pagedown=34, left=37
							} else if (down) {
								self.step(key == 34 ? -10 : -1, e); 
							} 
							return e.preventDefault();
						} 
					});
				}


				input.blur(function(e) {	
					var val = $(this).val();
					if (val !== value) {
						self.setValue(val, e);
					}
				});    


				// HTML5 DOM methods
				$.extend(input[0], { stepUp: self.stepUp, stepDown: self.stepDown});


				// calculate all dimension related stuff
				function init() { 
				 	vertical = conf.vertical || dim(root, "height") > dim(root, "width");

					if (vertical) {
						len = dim(root, "height") - dim(handle, "height");
						origo = root.offset().top + len; 

					} else {
						len = dim(root, "width") - dim(handle, "width");
						origo = root.offset().left;	  
					} 	  
				}

				function begin() {
					init();	
					self.setValue(conf.value !== undefined ? conf.value : conf.min);
				} 
				begin();

				// some browsers cannot get dimensions upon initialization
				if (!len) {  
					$(window).load(begin);
				}
			}

			$.expr[':'].range = function(el) {
				var type = el.getAttribute("type");
				return type && type == 'range' || !!$(el).filter("input").data("rangeinput");
			};


			// jQuery plugin implementation
			$.fn.rangeinput = function(conf) {

				// already installed
				if (this.data("rangeinput")) { return this; } 

				// extend configuration with globals
				conf = $.extend(true, {}, tool.conf, conf);		

				var els;

				this.each(function() {				
					var el = new RangeInput($(this), $.extend(true, {}, conf));		 
					var input = el.getInput().data("rangeinput", el);
					els = els ? els.add(input) : input;	
				});		

				return els ? els : this; 
			};	
		} );
timely.define('external_libs/jquery.blockui', 
		[
		 "jquery_timely"
		 ],
		 function( jQuery ) {
			
			/*!
			 * jQuery blockUI plugin
			 * Version 2.59.0-2013.04.05
			 * @requires jQuery v1.7 or later
			 *
			 * Examples at: http://malsup.com/jquery/block/
			 * Copyright (c) 2007-2013 M. Alsup
			 * Dual licensed under the MIT and GPL licenses:
			 * http://www.opensource.org/licenses/mit-license.php
			 * http://www.gnu.org/licenses/gpl.html
			 *
			 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
			 */

			;(function() {
			/*jshint eqeqeq:false curly:false latedef:false */
			

				function setup($) {
					$.fn._fadeIn = $.fn.fadeIn;

					var noOp = $.noop || function() {};

					// this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
					// retarded userAgent strings on Vista)
					var msie = /MSIE/.test(navigator.userAgent);
					var ie6  = /MSIE 6.0/.test(navigator.userAgent) && ! /MSIE 8.0/.test(navigator.userAgent);
					var mode = document.documentMode || 0;
					var setExpr = $.isFunction( document.createElement('div').style.setExpression );

					// global $ methods for blocking/unblocking the entire page
					$.blockUI   = function(opts) { install(window, opts); };
					$.unblockUI = function(opts) { remove(window, opts); };

					// convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
					$.growlUI = function(title, message, timeout, onClose) {
						var $m = $('<div class="growlUI"></div>');
						if (title) $m.append('<h1>'+title+'</h1>');
						if (message) $m.append('<h2>'+message+'</h2>');
						if (timeout === undefined) timeout = 3000;
						$.blockUI({
							message: $m, fadeIn: 700, fadeOut: 1000, centerY: false,
							timeout: timeout, showOverlay: false,
							onUnblock: onClose,
							css: $.blockUI.defaults.growlCSS
						});
					};

					// plugin method for blocking element content
					$.fn.block = function(opts) {
						if ( this[0] === window ) {
							$.blockUI( opts );
							return this;
						}
						var fullOpts = $.extend({}, $.blockUI.defaults, opts || {});
						this.each(function() {
							var $el = $(this);
							if (fullOpts.ignoreIfBlocked && $el.data('blockUI.isBlocked'))
								return;
							$el.unblock({ fadeOut: 0 });
						});

						return this.each(function() {
							if ($.css(this,'position') == 'static') {
								this.style.position = 'relative';
								$(this).data('blockUI.static', true);
							}
							this.style.zoom = 1; // force 'hasLayout' in ie
							install(this, opts);
						});
					};

					// plugin method for unblocking element content
					$.fn.unblock = function(opts) {
						if ( this[0] === window ) {
							$.unblockUI( opts );
							return this;
						}
						return this.each(function() {
							remove(this, opts);
						});
					};

					$.blockUI.version = 2.59; // 2nd generation blocking at no extra cost!

					// override these in your code to change the default behavior and style
					$.blockUI.defaults = {
						// message displayed when blocking (use null for no message)
						message:  '<h1>Please wait...</h1>',

						title: null,		// title string; only used when theme == true
						draggable: true,	// only used when theme == true (requires jquery-ui.js to be loaded)

						theme: false, // set to true to use with jQuery UI themes

						// styles for the message when blocking; if you wish to disable
						// these and use an external stylesheet then do this in your code:
						// $.blockUI.defaults.css = {};
						css: {
							padding:	0,
							margin:		0,
							width:		'30%',
							top:		'40%',
							left:		'35%',
							textAlign:	'center',
							color:		'#000',
							border:		'3px solid #aaa',
							backgroundColor:'#fff',
							cursor:		'wait'
						},

						// minimal style set used when themes are used
						themedCSS: {
							width:	'30%',
							top:	'40%',
							left:	'35%'
						},

						// styles for the overlay
						overlayCSS:  {
							backgroundColor:	'#000',
							opacity:			0.6,
							cursor:				'wait'
						},

						// style to replace wait cursor before unblocking to correct issue
						// of lingering wait cursor
						cursorReset: 'default',

						// styles applied when using $.growlUI
						growlCSS: {
							width:		'350px',
							top:		'10px',
							left:		'',
							right:		'10px',
							border:		'none',
							padding:	'5px',
							opacity:	0.6,
							cursor:		'default',
							color:		'#fff',
							backgroundColor: '#000',
							'-webkit-border-radius':'10px',
							'-moz-border-radius':	'10px',
							'border-radius':		'10px'
						},

						// IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
						// (hat tip to Jorge H. N. de Vasconcelos)
						/*jshint scripturl:true */
						iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

						// force usage of iframe in non-IE browsers (handy for blocking applets)
						forceIframe: false,

						// z-index for the blocking overlay
						baseZ: 1000,

						// set these to true to have the message automatically centered
						centerX: true, // <-- only effects element blocking (page block controlled via css above)
						centerY: true,

						// allow body element to be stetched in ie6; this makes blocking look better
						// on "short" pages.  disable if you wish to prevent changes to the body height
						allowBodyStretch: true,

						// enable if you want key and mouse events to be disabled for content that is blocked
						bindEvents: true,

						// be default blockUI will supress tab navigation from leaving blocking content
						// (if bindEvents is true)
						constrainTabKey: true,

						// fadeIn time in millis; set to 0 to disable fadeIn on block
						fadeIn:  200,

						// fadeOut time in millis; set to 0 to disable fadeOut on unblock
						fadeOut:  400,

						// time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
						timeout: 0,

						// disable if you don't want to show the overlay
						showOverlay: true,

						// if true, focus will be placed in the first available input field when
						// page blocking
						focusInput: true,

						// suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
						// no longer needed in 2012
						// applyPlatformOpacityRules: true,

						// callback method invoked when fadeIn has completed and blocking message is visible
						onBlock: null,

						// callback method invoked when unblocking has completed; the callback is
						// passed the element that has been unblocked (which is the window object for page
						// blocks) and the options that were passed to the unblock call:
						//	onUnblock(element, options)
						onUnblock: null,

						// callback method invoked when the overlay area is clicked.
						// setting this will turn the cursor to a pointer, otherwise cursor defined in overlayCss will be used.
						onOverlayClick: null,

						// don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
						quirksmodeOffsetHack: 4,

						// class name of the message block
						blockMsgClass: 'blockMsg',

						// if it is already blocked, then ignore it (don't unblock and reblock)
						ignoreIfBlocked: false
					};

					// private data and functions follow...

					var pageBlock = null;
					var pageBlockEls = [];

					function install(el, opts) {
						var css, themedCSS;
						var full = (el == window);
						var msg = (opts && opts.message !== undefined ? opts.message : undefined);
						opts = $.extend({}, $.blockUI.defaults, opts || {});

						if (opts.ignoreIfBlocked && $(el).data('blockUI.isBlocked'))
							return;

						opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
						css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
						if (opts.onOverlayClick)
							opts.overlayCSS.cursor = 'pointer';

						themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
						msg = msg === undefined ? opts.message : msg;

						// remove the current block (if there is one)
						if (full && pageBlock)
							remove(window, {fadeOut:0});

						// if an existing element is being used as the blocking content then we capture
						// its current place in the DOM (and current display style) so we can restore
						// it when we unblock
						if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
							var node = msg.jquery ? msg[0] : msg;
							var data = {};
							$(el).data('blockUI.history', data);
							data.el = node;
							data.parent = node.parentNode;
							data.display = node.style.display;
							data.position = node.style.position;
							if (data.parent)
								data.parent.removeChild(node);
						}

						$(el).data('blockUI.onUnblock', opts.onUnblock);
						var z = opts.baseZ;

						// blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
						// layer1 is the iframe layer which is used to supress bleed through of underlying content
						// layer2 is the overlay layer which has opacity and a wait cursor (by default)
						// layer3 is the message content that is displayed while blocking
						var lyr1, lyr2, lyr3, s;
						if (msie || opts.forceIframe)
							lyr1 = $('<iframe class="blockUI" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+opts.iframeSrc+'"></iframe>');
						else
							lyr1 = $('<div class="blockUI" style="display:none"></div>');

						if (opts.theme)
							lyr2 = $('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+ (z++) +';display:none"></div>');
						else
							lyr2 = $('<div class="blockUI blockOverlay" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

						if (opts.theme && full) {
							s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:fixed">';
							if ( opts.title ) {
								s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
							}
							s += '<div class="ui-widget-content ui-dialog-content"></div>';
							s += '</div>';
						}
						else if (opts.theme) {
							s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:absolute">';
							if ( opts.title ) {
								s += '<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>';
							}  
							s += '<div class="ui-widget-content ui-dialog-content"></div>';
							s += '</div>';
						}
						else if (full) {
							s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:'+(z+10)+';display:none;position:fixed"></div>';
						}
						else {
							s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:'+(z+10)+';display:none;position:absolute"></div>';
						}
						lyr3 = $(s);

						// if we have a message, style it
						if (msg) {
							if (opts.theme) {
								lyr3.css(themedCSS);
								lyr3.addClass('ui-widget-content');
							}
							else
								lyr3.css(css);
						}

						// style the overlay
						if (!opts.theme /*&& (!opts.applyPlatformOpacityRules)*/)
							lyr2.css(opts.overlayCSS);
						lyr2.css('position', full ? 'fixed' : 'absolute');

						// make iframe layer transparent in IE
						if (msie || opts.forceIframe)
							lyr1.css('opacity',0.0);

						//$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);
						var layers = [lyr1,lyr2,lyr3], $par = full ? $('body') : $(el);
						$.each(layers, function() {
							this.appendTo($par);
						});

						if (opts.theme && opts.draggable && $.fn.draggable) {
							lyr3.draggable({
								handle: '.ui-dialog-titlebar',
								cancel: 'li'
							});
						}

						// ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
						var expr = setExpr && (!$.support.boxModel || $('object,embed', full ? null : el).length > 0);
						if (ie6 || expr) {
							// give body 100% height
							if (full && opts.allowBodyStretch && $.support.boxModel)
								$('html,body').css('height','100%');

							// fix ie6 issue when blocked element has a border width
							if ((ie6 || !$.support.boxModel) && !full) {
								var t = sz(el,'borderTopWidth'), l = sz(el,'borderLeftWidth');
								var fixT = t ? '(0 - '+t+')' : 0;
								var fixL = l ? '(0 - '+l+')' : 0;
							}

							// simulate fixed position
							$.each(layers, function(i,o) {
								var s = o[0].style;
								s.position = 'absolute';
								if (i < 2) {
									if (full)
										s.setExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.support.boxModel?0:'+opts.quirksmodeOffsetHack+') + "px"');
									else
										s.setExpression('height','this.parentNode.offsetHeight + "px"');
									if (full)
										s.setExpression('width','jQuery.support.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"');
									else
										s.setExpression('width','this.parentNode.offsetWidth + "px"');
									if (fixL) s.setExpression('left', fixL);
									if (fixT) s.setExpression('top', fixT);
								}
								else if (opts.centerY) {
									if (full) s.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
									s.marginTop = 0;
								}
								else if (!opts.centerY && full) {
									var top = (opts.css && opts.css.top) ? parseInt(opts.css.top, 10) : 0;
									var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+top+') + "px"';
									s.setExpression('top',expression);
								}
							});
						}

						// show the message
						if (msg) {
							if (opts.theme)
								lyr3.find('.ui-widget-content').append(msg);
							else
								lyr3.append(msg);
							if (msg.jquery || msg.nodeType)
								$(msg).show();
						}

						if ((msie || opts.forceIframe) && opts.showOverlay)
							lyr1.show(); // opacity is zero
						if (opts.fadeIn) {
							var cb = opts.onBlock ? opts.onBlock : noOp;
							var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
							var cb2 = msg ? cb : noOp;
							if (opts.showOverlay)
								lyr2._fadeIn(opts.fadeIn, cb1);
							if (msg)
								lyr3._fadeIn(opts.fadeIn, cb2);
						}
						else {
							if (opts.showOverlay)
								lyr2.show();
							if (msg)
								lyr3.show();
							if (opts.onBlock)
								opts.onBlock();
						}

						// bind key and mouse events
						bind(1, el, opts);

						if (full) {
							pageBlock = lyr3[0];
							pageBlockEls = $(':input:enabled:visible',pageBlock);
							if (opts.focusInput)
								setTimeout(focus, 20);
						}
						else
							center(lyr3[0], opts.centerX, opts.centerY);

						if (opts.timeout) {
							// auto-unblock
							var to = setTimeout(function() {
								if (full)
									$.unblockUI(opts);
								else
									$(el).unblock(opts);
							}, opts.timeout);
							$(el).data('blockUI.timeout', to);
						}
					}

					// remove the block
					function remove(el, opts) {
						var count;
						var full = (el == window);
						var $el = $(el);
						var data = $el.data('blockUI.history');
						var to = $el.data('blockUI.timeout');
						if (to) {
							clearTimeout(to);
							$el.removeData('blockUI.timeout');
						}
						opts = $.extend({}, $.blockUI.defaults, opts || {});
						bind(0, el, opts); // unbind events

						if (opts.onUnblock === null) {
							opts.onUnblock = $el.data('blockUI.onUnblock');
							$el.removeData('blockUI.onUnblock');
						}

						var els;
						if (full) // crazy selector to handle odd field errors in ie6/7
							els = $('body').children().filter('.blockUI').add('body > .blockUI');
						else
							els = $el.find('>.blockUI');

						// fix cursor issue
						if ( opts.cursorReset ) {
							if ( els.length > 1 )
								els[1].style.cursor = opts.cursorReset;
							if ( els.length > 2 )
								els[2].style.cursor = opts.cursorReset;
						}

						if (full)
							pageBlock = pageBlockEls = null;

						if (opts.fadeOut) {
							count = els.length;
							els.fadeOut(opts.fadeOut, function() { 
								if ( --count === 0)
									reset(els,data,opts,el);
							});
						}
						else
							reset(els, data, opts, el);
					}

					// move blocking element back into the DOM where it started
					function reset(els,data,opts,el) {
						var $el = $(el);
						els.each(function(i,o) {
							// remove via DOM calls so we don't lose event handlers
							if (this.parentNode)
								this.parentNode.removeChild(this);
						});

						if (data && data.el) {
							data.el.style.display = data.display;
							data.el.style.position = data.position;
							if (data.parent)
								data.parent.appendChild(data.el);
							$el.removeData('blockUI.history');
						}

						if ($el.data('blockUI.static')) {
							$el.css('position', 'static'); // #22
						}

						if (typeof opts.onUnblock == 'function')
							opts.onUnblock(el,opts);

						// fix issue in Safari 6 where block artifacts remain until reflow
						var body = $(document.body), w = body.width(), cssW = body[0].style.width;
						body.width(w-1).width(w);
						body[0].style.width = cssW;
					}

					// bind/unbind the handler
					function bind(b, el, opts) {
						var full = el == window, $el = $(el);

						// don't bother unbinding if there is nothing to unbind
						if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
							return;

						$el.data('blockUI.isBlocked', b);

						// don't bind events when overlay is not in use or if bindEvents is false
						if (!full || !opts.bindEvents || (b && !opts.showOverlay))
							return;

						// bind anchors and inputs for mouse and key events
						var events = 'mousedown mouseup keydown keypress keyup touchstart touchend touchmove';
						if (b)
							$(document).bind(events, opts, handler);
						else
							$(document).unbind(events, handler);

					// former impl...
					//		var $e = $('a,:input');
					//		b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
					}

					// event handler to suppress keyboard/mouse events when blocking
					function handler(e) {
						// allow tab navigation (conditionally)
						if (e.keyCode && e.keyCode == 9) {
							if (pageBlock && e.data.constrainTabKey) {
								var els = pageBlockEls;
								var fwd = !e.shiftKey && e.target === els[els.length-1];
								var back = e.shiftKey && e.target === els[0];
								if (fwd || back) {
									setTimeout(function(){focus(back);},10);
									return false;
								}
							}
						}
						var opts = e.data;
						var target = $(e.target);
						if (target.hasClass('blockOverlay') && opts.onOverlayClick)
							opts.onOverlayClick();

						// allow events within the message content
						if (target.parents('div.' + opts.blockMsgClass).length > 0)
							return true;

						// allow events for content that is not being blocked
						return target.parents().children().filter('div.blockUI').length === 0;
					}

					function focus(back) {
						if (!pageBlockEls)
							return;
						var e = pageBlockEls[back===true ? pageBlockEls.length-1 : 0];
						if (e)
							e.focus();
					}

					function center(el, x, y) {
						var p = el.parentNode, s = el.style;
						var l = ((p.offsetWidth - el.offsetWidth)/2) - sz(p,'borderLeftWidth');
						var t = ((p.offsetHeight - el.offsetHeight)/2) - sz(p,'borderTopWidth');
						if (x) s.left = l > 0 ? (l+'px') : '0';
						if (y) s.top  = t > 0 ? (t+'px') : '0';
					}

					function sz(el, p) {
						return parseInt($.css(el,p),10)||0;
					}

				}


				/*global define:true */
				setup(jQuery);


			})();

		} );
timely.define('external_libs/ai1ec_datepicker', 
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
			
			var DatePicker = function () {
				var	ids = {},
					views = {
						years: 'datepickerViewYears',
						moths: 'datepickerViewMonths',
						days: 'datepickerViewDays'
					},
					tpl = {
						wrapper: '<div class="datepicker"><div class="datepickerBorderT" /><div class="datepickerBorderB" /><div class="datepickerBorderL" /><div class="datepickerBorderR" /><div class="datepickerBorderTL" /><div class="datepickerBorderTR" /><div class="datepickerBorderBL" /><div class="datepickerBorderBR" /><div class="datepickerContainer"><table cellspacing="0" cellpadding="0"><tbody><tr></tr></tbody></table></div></div>',
						head: [
							'<td>',
							'<table cellspacing="0" cellpadding="0">',
								'<thead>',
									'<tr>',
										'<th class="datepickerGoPrev"><a href="#"><span><%=prev%></span></a></th>',
										'<th colspan="6" class="datepickerMonth"><a href="#"><span></span></a></th>',
										'<th class="datepickerGoNext"><a href="#"><span><%=next%></span></a></th>',
									'</tr>',
									'<tr class="datepickerDoW">',
										'<th><span><%=week%></span></th>',
										'<th><span><%=day1%></span></th>',
										'<th><span><%=day2%></span></th>',
										'<th><span><%=day3%></span></th>',
										'<th><span><%=day4%></span></th>',
										'<th><span><%=day5%></span></th>',
										'<th><span><%=day6%></span></th>',
										'<th><span><%=day7%></span></th>',
									'</tr>',
								'</thead>',
							'</table></td>'
						],
						space : '<td class="datepickerSpace"><div></div></td>',
						days: [
							'<tbody class="datepickerDays">',
								'<tr>',
									'<th class="datepickerWeek"><a href="#"><span><%=weeks[0].week%></span></a></th>',
									'<td class="<%=weeks[0].days[0].classname%>"><a href="#"><span><%=weeks[0].days[0].text%></span></a></td>',
									'<td class="<%=weeks[0].days[1].classname%>"><a href="#"><span><%=weeks[0].days[1].text%></span></a></td>',
									'<td class="<%=weeks[0].days[2].classname%>"><a href="#"><span><%=weeks[0].days[2].text%></span></a></td>',
									'<td class="<%=weeks[0].days[3].classname%>"><a href="#"><span><%=weeks[0].days[3].text%></span></a></td>',
									'<td class="<%=weeks[0].days[4].classname%>"><a href="#"><span><%=weeks[0].days[4].text%></span></a></td>',
									'<td class="<%=weeks[0].days[5].classname%>"><a href="#"><span><%=weeks[0].days[5].text%></span></a></td>',
									'<td class="<%=weeks[0].days[6].classname%>"><a href="#"><span><%=weeks[0].days[6].text%></span></a></td>',
								'</tr>',
								'<tr>',
									'<th class="datepickerWeek"><a href="#"><span><%=weeks[1].week%></span></a></th>',
									'<td class="<%=weeks[1].days[0].classname%>"><a href="#"><span><%=weeks[1].days[0].text%></span></a></td>',
									'<td class="<%=weeks[1].days[1].classname%>"><a href="#"><span><%=weeks[1].days[1].text%></span></a></td>',
									'<td class="<%=weeks[1].days[2].classname%>"><a href="#"><span><%=weeks[1].days[2].text%></span></a></td>',
									'<td class="<%=weeks[1].days[3].classname%>"><a href="#"><span><%=weeks[1].days[3].text%></span></a></td>',
									'<td class="<%=weeks[1].days[4].classname%>"><a href="#"><span><%=weeks[1].days[4].text%></span></a></td>',
									'<td class="<%=weeks[1].days[5].classname%>"><a href="#"><span><%=weeks[1].days[5].text%></span></a></td>',
									'<td class="<%=weeks[1].days[6].classname%>"><a href="#"><span><%=weeks[1].days[6].text%></span></a></td>',
								'</tr>',
								'<tr>',
									'<th class="datepickerWeek"><a href="#"><span><%=weeks[2].week%></span></a></th>',
									'<td class="<%=weeks[2].days[0].classname%>"><a href="#"><span><%=weeks[2].days[0].text%></span></a></td>',
									'<td class="<%=weeks[2].days[1].classname%>"><a href="#"><span><%=weeks[2].days[1].text%></span></a></td>',
									'<td class="<%=weeks[2].days[2].classname%>"><a href="#"><span><%=weeks[2].days[2].text%></span></a></td>',
									'<td class="<%=weeks[2].days[3].classname%>"><a href="#"><span><%=weeks[2].days[3].text%></span></a></td>',
									'<td class="<%=weeks[2].days[4].classname%>"><a href="#"><span><%=weeks[2].days[4].text%></span></a></td>',
									'<td class="<%=weeks[2].days[5].classname%>"><a href="#"><span><%=weeks[2].days[5].text%></span></a></td>',
									'<td class="<%=weeks[2].days[6].classname%>"><a href="#"><span><%=weeks[2].days[6].text%></span></a></td>',
								'</tr>',
								'<tr>',
									'<th class="datepickerWeek"><a href="#"><span><%=weeks[3].week%></span></a></th>',
									'<td class="<%=weeks[3].days[0].classname%>"><a href="#"><span><%=weeks[3].days[0].text%></span></a></td>',
									'<td class="<%=weeks[3].days[1].classname%>"><a href="#"><span><%=weeks[3].days[1].text%></span></a></td>',
									'<td class="<%=weeks[3].days[2].classname%>"><a href="#"><span><%=weeks[3].days[2].text%></span></a></td>',
									'<td class="<%=weeks[3].days[3].classname%>"><a href="#"><span><%=weeks[3].days[3].text%></span></a></td>',
									'<td class="<%=weeks[3].days[4].classname%>"><a href="#"><span><%=weeks[3].days[4].text%></span></a></td>',
									'<td class="<%=weeks[3].days[5].classname%>"><a href="#"><span><%=weeks[3].days[5].text%></span></a></td>',
									'<td class="<%=weeks[3].days[6].classname%>"><a href="#"><span><%=weeks[3].days[6].text%></span></a></td>',
								'</tr>',
								'<tr>',
									'<th class="datepickerWeek"><a href="#"><span><%=weeks[4].week%></span></a></th>',
									'<td class="<%=weeks[4].days[0].classname%>"><a href="#"><span><%=weeks[4].days[0].text%></span></a></td>',
									'<td class="<%=weeks[4].days[1].classname%>"><a href="#"><span><%=weeks[4].days[1].text%></span></a></td>',
									'<td class="<%=weeks[4].days[2].classname%>"><a href="#"><span><%=weeks[4].days[2].text%></span></a></td>',
									'<td class="<%=weeks[4].days[3].classname%>"><a href="#"><span><%=weeks[4].days[3].text%></span></a></td>',
									'<td class="<%=weeks[4].days[4].classname%>"><a href="#"><span><%=weeks[4].days[4].text%></span></a></td>',
									'<td class="<%=weeks[4].days[5].classname%>"><a href="#"><span><%=weeks[4].days[5].text%></span></a></td>',
									'<td class="<%=weeks[4].days[6].classname%>"><a href="#"><span><%=weeks[4].days[6].text%></span></a></td>',
								'</tr>',
								'<tr>',
									'<th class="datepickerWeek"><a href="#"><span><%=weeks[5].week%></span></a></th>',
									'<td class="<%=weeks[5].days[0].classname%>"><a href="#"><span><%=weeks[5].days[0].text%></span></a></td>',
									'<td class="<%=weeks[5].days[1].classname%>"><a href="#"><span><%=weeks[5].days[1].text%></span></a></td>',
									'<td class="<%=weeks[5].days[2].classname%>"><a href="#"><span><%=weeks[5].days[2].text%></span></a></td>',
									'<td class="<%=weeks[5].days[3].classname%>"><a href="#"><span><%=weeks[5].days[3].text%></span></a></td>',
									'<td class="<%=weeks[5].days[4].classname%>"><a href="#"><span><%=weeks[5].days[4].text%></span></a></td>',
									'<td class="<%=weeks[5].days[5].classname%>"><a href="#"><span><%=weeks[5].days[5].text%></span></a></td>',
									'<td class="<%=weeks[5].days[6].classname%>"><a href="#"><span><%=weeks[5].days[6].text%></span></a></td>',
								'</tr>',
							'</tbody>'
						],
						months: [
							'<tbody class="<%=className%>">',
								'<tr>',
									'<td colspan="2"><a href="#"><span><%=data[0]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[1]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[2]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[3]%></span></a></td>',
								'</tr>',
								'<tr>',
									'<td colspan="2"><a href="#"><span><%=data[4]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[5]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[6]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[7]%></span></a></td>',
								'</tr>',
								'<tr>',
									'<td colspan="2"><a href="#"><span><%=data[8]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[9]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[10]%></span></a></td>',
									'<td colspan="2"><a href="#"><span><%=data[11]%></span></a></td>',
								'</tr>',
							'</tbody>'
						]
					},
					defaults = {
						flat: false,
						starts: 1,
						prev: '&#9664;',
						next: '&#9654;',
						lastSel: false,
						mode: 'single',
						view: 'days',
						calendars: 1,
						format: 'Y-m-d',
						position: 'bottom',
						eventName: 'click',
						onRender: function(){return {};},
						onChange: function(){return true;},
						onShow: function(){return true;},
						onBeforeShow: function(){return true;},
						onHide: function(){return true;},
						locale: {
							days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
							daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
							daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
							months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
							monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
							weekMin: 'wk'
						}
					},
					fill = function(el) {
						var options = $(el).data('datepicker');
						var cal = $(el);
						var currentCal = Math.floor(options.calendars/2), date, data, dow, month, cnt = 0, week, days, indic, indic2, html, tblCal;
						cal.find('td>table tbody').remove();
						for (var i = 0; i < options.calendars; i++) {
							date = new Date(options.current);
							date.addMonths(-currentCal + i);
							tblCal = cal.find('table').eq(i+1);
							switch (tblCal[0].className) {
								case 'datepickerViewDays':
									dow = formatDate(date, 'B, Y');
									break;
								case 'datepickerViewMonths':
									dow = date.getFullYear();
									break;
								case 'datepickerViewYears':
									dow = (date.getFullYear()-6) + ' - ' + (date.getFullYear()+5);
									break;
							} 
							tblCal.find('thead tr:first th:eq(1) span').text(dow);
							dow = date.getFullYear()-6;
							data = {
								data: [],
								className: 'datepickerYears'
							}
							for ( var j = 0; j < 12; j++) {
								data.data.push(dow + j);
							}
							html = tmpl(tpl.months.join(''), data);
							date.setDate(1);
							data = {weeks:[], test: 10};
							month = date.getMonth();
							var dow = (date.getDay() - options.starts) % 7;
							date.addDays(-(dow + (dow < 0 ? 7 : 0)));
							week = -1;
							cnt = 0;
							while (cnt < 42) {
								indic = parseInt(cnt/7,10);
								indic2 = cnt%7;
								if (!data.weeks[indic]) {
									week = date.getWeekNumber();
									data.weeks[indic] = {
										week: week,
										days: []
									};
								}
								data.weeks[indic].days[indic2] = {
									text: date.getDate(),
									classname: []
								};
								if (month != date.getMonth()) {
									data.weeks[indic].days[indic2].classname.push('datepickerNotInMonth');
								}
								if (date.getDay() == 0) {
									data.weeks[indic].days[indic2].classname.push('datepickerSunday');
								}
								if (date.getDay() == 6) {
									data.weeks[indic].days[indic2].classname.push('datepickerSaturday');
								}
								var fromUser = options.onRender(date);
								var val = date.valueOf();
								if (fromUser.selected || options.date == val || $.inArray(val, options.date) > -1 || (options.mode == 'range' && val >= options.date[0] && val <= options.date[1])) {
									data.weeks[indic].days[indic2].classname.push('datepickerSelected');
								}
								if (fromUser.disabled) {
									data.weeks[indic].days[indic2].classname.push('datepickerDisabled');
								}
								if (fromUser.className) {
									data.weeks[indic].days[indic2].classname.push(fromUser.className);
								}
								data.weeks[indic].days[indic2].classname = data.weeks[indic].days[indic2].classname.join(' ');
								cnt++;
								date.addDays(1);
							}
							html = tmpl(tpl.days.join(''), data) + html;
							data = {
								data: options.locale.monthsShort,
								className: 'datepickerMonths'
							};
							html = tmpl(tpl.months.join(''), data) + html;
							tblCal.append(html);
						}
					},
					parseDate = function (date, format) {
						if (date.constructor == Date) {
							return new Date(date);
						}
						var parts = date.split(/\W+/);
						var against = format.split(/\W+/), d, m, y, h, min, now = new Date();
						for (var i = 0; i < parts.length; i++) {
							switch (against[i]) {
								case 'd':
								case 'e':
									d = parseInt(parts[i],10);
									break;
								case 'm':
									m = parseInt(parts[i], 10)-1;
									break;
								case 'Y':
								case 'y':
									y = parseInt(parts[i], 10);
									y += y > 100 ? 0 : (y < 29 ? 2000 : 1900);
									break;
								case 'H':
								case 'I':
								case 'k':
								case 'l':
									h = parseInt(parts[i], 10);
									break;
								case 'P':
								case 'p':
									if (/pm/i.test(parts[i]) && h < 12) {
										h += 12;
									} else if (/am/i.test(parts[i]) && h >= 12) {
										h -= 12;
									}
									break;
								case 'M':
									min = parseInt(parts[i], 10);
									break;
							}
						}
						return new Date(
							y === undefined ? now.getFullYear() : y,
							m === undefined ? now.getMonth() : m,
							d === undefined ? now.getDate() : d,
							h === undefined ? now.getHours() : h,
							min === undefined ? now.getMinutes() : min,
							0
						);
					},
					formatDate = function(date, format) {
						var m = date.getMonth();
						var d = date.getDate();
						var y = date.getFullYear();
						var wn = date.getWeekNumber();
						var w = date.getDay();
						var s = {};
						var hr = date.getHours();
						var pm = (hr >= 12);
						var ir = (pm) ? (hr - 12) : hr;
						var dy = date.getDayOfYear();
						if (ir == 0) {
							ir = 12;
						}
						var min = date.getMinutes();
						var sec = date.getSeconds();
						var parts = format.split(''), part;
						for ( var i = 0; i < parts.length; i++ ) {
							part = parts[i];
							switch (parts[i]) {
								case 'a':
									part = date.getDayName();
									break;
								case 'A':
									part = date.getDayName(true);
									break;
								case 'b':
									part = date.getMonthName();
									break;
								case 'B':
									part = date.getMonthName(true);
									break;
								case 'C':
									part = 1 + Math.floor(y / 100);
									break;
								case 'd':
									part = (d < 10) ? ("0" + d) : d;
									break;
								case 'e':
									part = d;
									break;
								case 'H':
									part = (hr < 10) ? ("0" + hr) : hr;
									break;
								case 'I':
									part = (ir < 10) ? ("0" + ir) : ir;
									break;
								case 'j':
									part = (dy < 100) ? ((dy < 10) ? ("00" + dy) : ("0" + dy)) : dy;
									break;
								case 'k':
									part = hr;
									break;
								case 'l':
									part = ir;
									break;
								case 'm':
									part = (m < 9) ? ("0" + (1+m)) : (1+m);
									break;
								case 'M':
									part = (min < 10) ? ("0" + min) : min;
									break;
								case 'p':
								case 'P':
									part = pm ? "PM" : "AM";
									break;
								case 's':
									part = Math.floor(date.getTime() / 1000);
									break;
								case 'S':
									part = (sec < 10) ? ("0" + sec) : sec;
									break;
								case 'u':
									part = w + 1;
									break;
								case 'w':
									part = w;
									break;
								case 'y':
									part = ('' + y).substr(2, 2);
									break;
								case 'Y':
									part = y;
									break;
							}
							parts[i] = part;
						}
						return parts.join('');
					},
					extendDate = function(options) {
						if (Date.prototype.tempDate) {
							return;
						}
						Date.prototype.tempDate = null;
						Date.prototype.months = options.months;
						Date.prototype.monthsShort = options.monthsShort;
						Date.prototype.days = options.days;
						Date.prototype.daysShort = options.daysShort;
						Date.prototype.getMonthName = function(fullName) {
							return this[fullName ? 'months' : 'monthsShort'][this.getMonth()];
						};
						Date.prototype.getDayName = function(fullName) {
							return this[fullName ? 'days' : 'daysShort'][this.getDay()];
						};
						Date.prototype.addDays = function (n) {
							this.setDate(this.getDate() + n);
							this.tempDate = this.getDate();
						};
						Date.prototype.addMonths = function (n) {
							if (this.tempDate == null) {
								this.tempDate = this.getDate();
							}
							this.setDate(1);
							this.setMonth(this.getMonth() + n);
							this.setDate(Math.min(this.tempDate, this.getMaxDays()));
						};
						Date.prototype.addYears = function (n) {
							if (this.tempDate == null) {
								this.tempDate = this.getDate();
							}
							this.setDate(1);
							this.setFullYear(this.getFullYear() + n);
							this.setDate(Math.min(this.tempDate, this.getMaxDays()));
						};
						Date.prototype.getMaxDays = function() {
							var tmpDate = new Date(Date.parse(this)),
								d = 28, m;
							m = tmpDate.getMonth();
							d = 28;
							while (tmpDate.getMonth() == m) {
								d ++;
								tmpDate.setDate(d);
							}
							return d - 1;
						};
						Date.prototype.getFirstDay = function() {
							var tmpDate = new Date(Date.parse(this));
							tmpDate.setDate(1);
							return tmpDate.getDay();
						};
						Date.prototype.getWeekNumber = function() {
							var tempDate = new Date(this);
							tempDate.setDate(tempDate.getDate() - (tempDate.getDay() + 6) % 7 + 3);
							var dms = tempDate.valueOf();
							tempDate.setMonth(0);
							tempDate.setDate(4);
							return Math.round((dms - tempDate.valueOf()) / (604800000)) + 1;
						};
						Date.prototype.getDayOfYear = function() {
							var now = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
							var then = new Date(this.getFullYear(), 0, 0, 0, 0, 0);
							var time = now - then;
							return Math.floor(time / 24*60*60*1000);
						};
					},
					layout = function (el) {
						var options = $(el).data('datepicker');
						var cal = $('#' + options.id);
						if (!options.extraHeight) {
							var divs = $(el).find('div');
							options.extraHeight = divs.get(0).offsetHeight + divs.get(1).offsetHeight;
							options.extraWidth = divs.get(2).offsetWidth + divs.get(3).offsetWidth;
						}
						var tbl = cal.find('table:first').get(0);
						var width = tbl.offsetWidth;
						var height = tbl.offsetHeight;
						cal.css({
							width: width + options.extraWidth + 'px',
							height: height + options.extraHeight + 'px'
						}).find('div.datepickerContainer').css({
							width: width + 'px',
							height: height + 'px'
						});
					},
					click = function(ev) {
						if ($(ev.target).is('span')) {
							ev.target = ev.target.parentNode;
						}
						var el = $(ev.target);
						if (el.is('a')) {
							ev.target.blur();
							if (el.hasClass('datepickerDisabled')) {
								return false;
							}
							var options = $(this).data('datepicker');
							var parentEl = el.parent();
							var tblEl = parentEl.parent().parent().parent();
							var tblIndex = $('table', this).index(tblEl.get(0)) - 1;
							var tmp = new Date(options.current);
							var changed = false;
							var fillIt = false;
							if (parentEl.is('th')) {
								if (parentEl.hasClass('datepickerWeek') && options.mode == 'range' && !parentEl.next().hasClass('datepickerDisabled')) {
									var val = parseInt(parentEl.next().text(), 10);
									tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
									if (parentEl.next().hasClass('datepickerNotInMonth')) {
										tmp.addMonths(val > 15 ? -1 : 1);
									}
									tmp.setDate(val);
									options.date[0] = (tmp.setHours(0,0,0,0)).valueOf();
									tmp.setHours(23,59,59,0);
									tmp.addDays(6);
									options.date[1] = tmp.valueOf();
									fillIt = true;
									changed = true;
									options.lastSel = false;
								} else if (parentEl.hasClass('datepickerMonth')) {
									tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
									switch (tblEl.get(0).className) {
										case 'datepickerViewDays':
											tblEl.get(0).className = 'datepickerViewMonths';
											el.find('span').text(tmp.getFullYear());
											break;
										case 'datepickerViewMonths':
											tblEl.get(0).className = 'datepickerViewYears';
											el.find('span').text((tmp.getFullYear()-6) + ' - ' + (tmp.getFullYear()+5));
											break;
										case 'datepickerViewYears':
											tblEl.get(0).className = 'datepickerViewDays';
											el.find('span').text(formatDate(tmp, 'B, Y'));
											break;
									}
								} else if (parentEl.parent().parent().is('thead')) {
									switch (tblEl.get(0).className) {
										case 'datepickerViewDays':
											options.current.addMonths(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
											break;
										case 'datepickerViewMonths':
											options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -1 : 1);
											break;
										case 'datepickerViewYears':
											options.current.addYears(parentEl.hasClass('datepickerGoPrev') ? -12 : 12);
											break;
									}
									fillIt = true;
								}
							} else if (parentEl.is('td') && !parentEl.hasClass('datepickerDisabled')) {
								switch (tblEl.get(0).className) {
									case 'datepickerViewMonths':
										options.current.setMonth(tblEl.find('tbody.datepickerMonths td').index(parentEl));
										options.current.setFullYear(parseInt(tblEl.find('thead th.datepickerMonth span').text(), 10));
										options.current.addMonths(Math.floor(options.calendars/2) - tblIndex);
										tblEl.get(0).className = 'datepickerViewDays';
										break;
									case 'datepickerViewYears':
										options.current.setFullYear(parseInt(el.text(), 10));
										tblEl.get(0).className = 'datepickerViewMonths';
										break;
									default:
										var val = parseInt(el.text(), 10);
										tmp.addMonths(tblIndex - Math.floor(options.calendars/2));
										if (parentEl.hasClass('datepickerNotInMonth')) {
											tmp.addMonths(val > 15 ? -1 : 1);
										}
										tmp.setDate(val);
										switch (options.mode) {
											case 'multiple':
												val = (tmp.setHours(0,0,0,0)).valueOf();
												if ($.inArray(val, options.date) > -1) {
													$.each(options.date, function(nr, dat){
														if (dat == val) {
															options.date.splice(nr,1);
															return false;
														}
													});
												} else {
													options.date.push(val);
												}
												break;
											case 'range':
												if (!options.lastSel) {
													options.date[0] = (tmp.setHours(0,0,0,0)).valueOf();
												}
												val = (tmp.setHours(23,59,59,0)).valueOf();
												if (val < options.date[0]) {
													options.date[1] = options.date[0] + 86399000;
													options.date[0] = val - 86399000;
												} else {
													options.date[1] = val;
												}
												options.lastSel = !options.lastSel;
												break;
											default:
												options.date = tmp.valueOf();
												break;
										}
										break;
								}
								fillIt = true;
								changed = true;
							}
							if (fillIt) {
								fill(this);
							}
							if (changed) {
								options.onChange.apply(this, prepareDate(options));
							}
						}
						return false;
					},
					prepareDate = function (options) {
						var tmp;
						if (options.mode == 'single') {
							tmp = new Date(options.date);
							return [formatDate(tmp, options.format), tmp, options.el];
						} else {
							tmp = [[],[], options.el];
							$.each(options.date, function(nr, val){
								var date = new Date(val);
								tmp[0].push(formatDate(date, options.format));
								tmp[1].push(date);
							});
							return tmp;
						}
					},
					getViewport = function () {
						var m = document.compatMode == 'CSS1Compat';
						return {
							l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
							t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
							w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
							h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
						};
					},
					isChildOf = function(parentEl, el, container) {
						if (parentEl == el) {
							return true;
						}
						if (parentEl.contains) {
							return parentEl.contains(el);
						}
						if ( parentEl.compareDocumentPosition ) {
							return !!(parentEl.compareDocumentPosition(el) & 16);
						}
						var prEl = el.parentNode;
						while(prEl && prEl != container) {
							if (prEl == parentEl)
								return true;
							prEl = prEl.parentNode;
						}
						return false;
					},
					show = function (ev) {
						var cal = $('#' + $(this).data('datepickerId'));
						if (!cal.is(':visible')) {
							var calEl = cal.get(0);
							fill(calEl);
							var options = cal.data('datepicker');
							options.onBeforeShow.apply(this, [cal.get(0)]);
							var pos = $(this).offset();
							var viewPort = getViewport();
							var top = pos.top;
							var left = pos.left;
							var oldDisplay = $.curCSS(calEl, 'display');
							cal.css({
								visibility: 'hidden',
								display: 'block'
							});
							layout(calEl);
							switch (options.position){
								case 'top':
									top -= calEl.offsetHeight;
									break;
								case 'left':
									left -= calEl.offsetWidth;
									break;
								case 'right':
									left += this.offsetWidth;
									break;
								case 'bottom':
									top += this.offsetHeight;
									break;
							}
							if (top + calEl.offsetHeight > viewPort.t + viewPort.h) {
								top = pos.top  - calEl.offsetHeight;
							}
							if (top < viewPort.t) {
								top = pos.top + this.offsetHeight + calEl.offsetHeight;
							}
							if (left + calEl.offsetWidth > viewPort.l + viewPort.w) {
								left = pos.left - calEl.offsetWidth;
							}
							if (left < viewPort.l) {
								left = pos.left + this.offsetWidth
							}
							cal.css({
								visibility: 'visible',
								display: 'block',
								top: top + 'px',
								left: left + 'px'
							});
							if (options.onShow.apply(this, [cal.get(0)]) != false) {
								cal.show();
							}
							$(document).bind('mousedown', {cal: cal, trigger: this}, hide);
						}
						return false;
					},
					hide = function (ev) {
						if (ev.target != ev.data.trigger && !isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
							if (ev.data.cal.data('datepicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
								ev.data.cal.hide();
							}
							$(document).unbind('mousedown', hide);
						}
					};
				return {
					init: function(options){
						options = $.extend({}, defaults, options||{});
						extendDate(options.locale);
						options.calendars = Math.max(1, parseInt(options.calendars,10)||1);
						options.mode = /single|multiple|range/.test(options.mode) ? options.mode : 'single';
						return this.each(function(){
							if (!$(this).data('datepicker')) {
								options.el = this;
								if (options.date.constructor == String) {
									options.date = parseDate(options.date, options.format);
									options.date.setHours(0,0,0,0);
								}
								if (options.mode != 'single') {
									if (options.date.constructor != Array) {
										options.date = [options.date.valueOf()];
										if (options.mode == 'range') {
											options.date.push(((new Date(options.date[0])).setHours(23,59,59,0)).valueOf());
										}
									} else {
										for (var i = 0; i < options.date.length; i++) {
											options.date[i] = (parseDate(options.date[i], options.format).setHours(0,0,0,0)).valueOf();
										}
										if (options.mode == 'range') {
											options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
										}
									}
								} else {
									options.date = options.date.valueOf();
								}
								if (!options.current) {
									options.current = new Date();
								} else {
									options.current = parseDate(options.current, options.format);
								} 
								options.current.setDate(1);
								options.current.setHours(0,0,0,0);
								var id = 'datepicker_' + parseInt(Math.random() * 1000), cnt;
								options.id = id;
								$(this).data('datepickerId', options.id);
								var cal = $(tpl.wrapper).attr('id', id).bind('click', click).data('datepicker', options);
								if (options.className) {
									cal.addClass(options.className);
								}
								var html = '';
								for (var i = 0; i < options.calendars; i++) {
									cnt = options.starts;
									if (i > 0) {
										html += tpl.space;
									}
									html += tmpl(tpl.head.join(''), {
											week: options.locale.weekMin,
											prev: options.prev,
											next: options.next,
											day1: options.locale.daysMin[(cnt++)%7],
											day2: options.locale.daysMin[(cnt++)%7],
											day3: options.locale.daysMin[(cnt++)%7],
											day4: options.locale.daysMin[(cnt++)%7],
											day5: options.locale.daysMin[(cnt++)%7],
											day6: options.locale.daysMin[(cnt++)%7],
											day7: options.locale.daysMin[(cnt++)%7]
										});
								}
								cal
									.find('tr:first').append(html)
										.find('table').addClass(views[options.view]);
								fill(cal.get(0));
								if (options.flat) {
									cal.appendTo(this).show().css('position', 'relative');
									layout(cal.get(0));
								} else {
									cal.appendTo(document.body);
									$(this).bind(options.eventName, show);
								}
							}
						});
					},
					showPicker: function() {
						return this.each( function () {
							if ($(this).data('datepickerId')) {
								show.apply(this);
							}
						});
					},
					hidePicker: function() {
						return this.each( function () {
							if ($(this).data('datepickerId')) {
								$('#' + $(this).data('datepickerId')).hide();
							}
						});
					},
					setDate: function(date, shiftTo){
						return this.each(function(){
							if ($(this).data('datepickerId')) {
								var cal = $('#' + $(this).data('datepickerId'));
								var options = cal.data('datepicker');
								options.date = date;
								if (options.date.constructor == String) {
									options.date = parseDate(options.date, options.format);
									options.date.setHours(0,0,0,0);
								}
								if (options.mode != 'single') {
									if (options.date.constructor != Array) {
										options.date = [options.date.valueOf()];
										if (options.mode == 'range') {
											options.date.push(((new Date(options.date[0])).setHours(23,59,59,0)).valueOf());
										}
									} else {
										for (var i = 0; i < options.date.length; i++) {
											options.date[i] = (parseDate(options.date[i], options.format).setHours(0,0,0,0)).valueOf();
										}
										if (options.mode == 'range') {
											options.date[1] = ((new Date(options.date[1])).setHours(23,59,59,0)).valueOf();
										}
									}
								} else {
									options.date = options.date.valueOf();
								}
								if (shiftTo) {
									options.current = new Date (options.mode != 'single' ? options.date[0] : options.date);
								}
								fill(cal.get(0));
							}
						});
					},
					getDate: function(formated) {
						if (this.size() > 0) {
							return prepareDate($('#' + $(this).data('datepickerId')).data('datepicker'))[formated ? 0 : 1];
						}
					},
					clear: function(){
						return this.each(function(){
							if ($(this).data('datepickerId')) {
								var cal = $('#' + $(this).data('datepickerId'));
								var options = cal.data('datepicker');
								if (options.mode != 'single') {
									options.date = [];
									fill(cal.get(0));
								}
							}
						});
					},
					fixLayout: function(){
						return this.each(function(){
							if ($(this).data('datepickerId')) {
								var cal = $('#' + $(this).data('datepickerId'));
								var options = cal.data('datepicker');
								if (options.flat) {
									layout(cal.get(0));
								}
							}
						});
					}
				};
			}();
			$.fn.extend({
				DatePicker: DatePicker.init,
				DatePickerHide: DatePicker.hidePicker,
				DatePickerShow: DatePicker.showPicker,
				DatePickerSetDate: DatePicker.setDate,
				DatePickerGetDate: DatePicker.getDate,
				DatePickerClear: DatePicker.clear,
				DatePickerLayout: DatePicker.fixLayout
			});
			  var cache = {};

			   var tmpl = function(str, data){
			     // Figure out if we're getting a template, or if we need to
			     // load the template - and be sure to cache the result.
			     var fn = !/\W/.test(str) ?
			       cache[str] = cache[str] ||
			         tmpl(document.getElementById(str).innerHTML) :
			      
			       // Generate a reusable function that will serve as a template
			       // generator (and which will be cached).
			       new Function("obj",
			         "var p=[],print=function(){p.push.apply(p,arguments);};" +
			        
			         // Introduce the data as local variables using with(){}
			         "with(obj){p.push('" +
			        
			         // Convert the template into pure JavaScript
			         str
			           .replace(/[\r\t\n]/g, " ")
			           .split("<%").join("\t")
			           .replace(/((^|%>)[^\t]*)'/g, "$1\r")
			           .replace(/\t=(.*?)%>/g, "',$1,'")
			           .split("\t").join("');")
			           .split("%>").join("p.push('")
			           .split("\r").join("\\'")
			       + "');}return p.join('');");
			    
			     // Provide some basic currying to the user
			     return data ? fn( data ) : fn;
			   };
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

timely.define('scripts/add_new_event',
	[
		"jquery_timely",
		'domReady',
		'ai1ec_config',
		'scripts/add_new_event/event_location/gmaps_helper',
		'scripts/add_new_event/event_location/input_coordinates_event_handlers',
		'scripts/add_new_event/event_location/input_coordinates_utility_functions',
		'scripts/add_new_event/event_date_time/date_time_event_handlers',
		'scripts/add_new_event/facebook_export',
		'scripts/add_new_event/event_cost_helper',
		'external_libs/jquery.calendrical_timespan',
		'external_libs/jquery.inputdate',
		'external_libs/jquery.tools',
		'external_libs/jquery.blockui',
		'external_libs/ai1ec_datepicker',
		'external_libs/bootstrap_collapse'
	],
	function (
		$,
		domReady,
		ai1ec_config,
		gmaps_helper,
		input_coordinates_event_handlers,
		input_utility_functions,
		date_time_event_handlers,
		facebook_export,
		event_cost,
		calendrical_functions
	) {
	 // jshint ;_;


	var init_date_time = function() {

		var now = new Date( ai1ec_config.now * 1000 );

		/**
		* Timespan plugin setup
		*/
		// Initialize timespan plugin on our date/time inputs.
		var data = {
			allday           : '#ai1ec_all_day_event',
			start_date_input : '#ai1ec_start-date-input',
			start_time_input : '#ai1ec_start-time-input',
			start_time       : '#ai1ec_start-time',
			end_date_input   : '#ai1ec_end-date-input',
			end_time_input   : '#ai1ec_end-time-input',
			end_time         : '#ai1ec_end-time',
			date_format      : ai1ec_config.date_format,
			month_names      : ai1ec_config.month_names,
			day_names        : ai1ec_config.day_names,
			week_start_day   : ai1ec_config.week_start_day,
			twentyfour_hour  : ai1ec_config.twentyfour_hour,
			now              : now
		};
		$.timespan( data );
		// Retrieve the dates saved in the hidden field
		var exdate  = $( "#ai1ec_exdate" ).val();

		// This variable holds the dates that must be selected in the datepicker.
		var dp_date = null;
		var _clear_dp = false;
		var _day;
		if( exdate.length >= 8 ) {
			dp_date = [];
			var _span_html = [];
			$.each( exdate.split( ',' ), function( i, v ) {
				var _date = v.slice( 0, 8 );
				var _year = _date.substr( 0, 4 );
				var _month = _date.substr( 4, 2 );
				_day = _date.substr( 6, 2 );

				_month = _month.charAt(0) === '0' ? ( '0' + ( parseInt( _month.charAt( 1 ), 10 ) - 1 ) ) : ( parseInt( _month, 10 ) - 1 );

				dp_date.push( new Date( _year, _month, _day ) );
				_span_html.push( 
					calendrical_functions.formatDate( 
						new Date( _year, _month, _day ),
						ai1ec_config.date_format,
						true
					)
				);
			});

			$( '#widgetField span:first' ).html( _span_html.join( ', ' ) );
		} else {
			// Set as default date shown today
			dp_date = new Date( ai1ec_config.now * 1000 );
			_clear_dp = true;
		}

		$( '#widgetCalendar' ).DatePicker({
			flat: true,
			calendars: 3,
			mode: 'multiple',
			start: 1,
			date: dp_date,
			onChange: function( formated ) {
				formated = formated.toString();
				if( formated.length >= 8 ) {
					// save the date in your hidden field
					var exdate = '';
					var formatted_date = [];
					$.each( formated.split( ',' ), function( i, v ) {
						formatted_date.push( calendrical_functions.formatDate( new Date( v ), ai1ec_config.date_format ) );
						exdate += v.replace( /-/g, '' ) + 'T000000Z,';
					});
					$( '#widgetField span' ).html( formatted_date.join( ', ' ) );
					exdate = exdate.slice( 0, exdate.length - 1 );
					$( "#ai1ec_exdate" ).val( exdate );
				} else {
					$( "#ai1ec_exdate" ).val( '' );
				}
			}
		});
		if( _clear_dp ) {
			$( '#widgetCalendar' ).DatePickerClear();
		}
		$( '#widgetCalendar div.datepicker' ).css( 'position', 'absolute' );
	};

	/**
	 * Add a hook into Bootstrap collapse for accordions for proper overflow
	 * behaviour when open.
	 */
	var init_collapsibles = function() {
		$( '.accordion-body' ).on( 'hide', function() {
			$( this ).removeClass( 'ai1ec-overflow-visible' );
		} );
		$( '.accordion-body' ).on( 'shown', function() {
			var $el = $( this );
			window.setTimeout(
				function() { $el.addClass( 'ai1ec-overflow-visible' ); },
				350
			);
		} );
	};

	/**
	 * Perform all initialization functions required on the page.
	 */
	var init = function() {
		init_date_time();

		// We load gMaps here so that we can start acting on the DOM as soon as possibe.
		// All initialization is done in the callback.
		timely.require( ['libs/gmaps' ], function( gMapsLoader ) {
			gMapsLoader( gmaps_helper.init_gmaps );
		} );
	};

	/**
	 * Present user with error notice and prevent form submission
	 */
	var prevent_form_submission = function( submit_event, notice ) {
		window.alert( notice );
		submit_event.preventDefault();
		// Just in case, hide the ajax spinner and remove the disabled status
		$( '#publish, #ai1ec_bottom_publish' ).removeClass(
			'button-primary-disabled'
		);
		$( '#publish, #ai1ec_bottom_publish' ).siblings(
			'#ajax-loading, .spinner'
		).css( 'visibility', 'hidden' );
	};

	/**
	 * Validate the form when clicking Publish/Update.
	 *
	 * @param  object e jQuery event object
	 */
	var validate_form = function( e ) {
		// Validate geolocation coordinates.
		if ( input_utility_functions.ai1ec_check_lat_long_fields_filled_when_publishing_event( e ) === true ) {
			// Convert commas to dots
			input_utility_functions.ai1ec_convert_commas_to_dots_for_coordinates();
			// Check that fields are ok and there are no errors
			input_utility_functions.ai1ec_check_lat_long_ok_for_search( e );
		}

		// Validate URL fields.
		$( '#ai1ec_ticket_url, #ai1ec_contact_url' ).each( function () {
			var url = this.value;
			if ( '' !== url ) {
				var urlPattern = /(http|https):\/\//;
				if ( ! urlPattern.test( url ) ) {
					prevent_form_submission( e, ai1ec_config.url_not_valid );
				}
			}
		} );
	};

	/**
	 * Attach event handlers to page.
	 */
	var attach_event_handlers = function() {
		// Toggle the visibility of google map on checkbox click
		$( '#ai1ec_google_map' ).click( input_coordinates_event_handlers.toggle_visibility_of_google_map_on_click );
		// Hide / Show the coordinates table when clicking the checkbox
		$( '#ai1ec_input_coordinates' ).change( input_coordinates_event_handlers.toggle_visibility_of_coordinate_fields_on_click );
		// Validate fields when clicking Publish
		$( '#post' ).submit( validate_form );
		// on blur, update the map if both coordinates are set
		$( 'input.coordinates' ).blur ( input_coordinates_event_handlers.update_map_from_coordinates_on_blur );
		// ==============================================
		// = EVENT HANDLERS FOR EVENT DATE AND TIME BOX =
		// ==============================================
		// Show different fields for the "ends" clause in the modal
		$( document ).on( 'change', '#ai1ec_end', date_time_event_handlers.show_end_fields );
		// If the extra publish button is present handle it's click
		$( '#ai1ec_bottom_publish' ).on( 'click', date_time_event_handlers.trigger_publish );
		// Handle clicking on tabs when the modal is open
		$( document ).on( 'click', '.ai1ec_tab', date_time_event_handlers.handle_click_on_tab_modal );
		// Handle click on the Apply button of the modal
		$( document ).on( 'click', '.ai1ec_repeat_apply', date_time_event_handlers.handle_click_on_apply_button );
		// Handle click on the cancel button of the modal
		$( document ).on( 'click', 'a.ai1ec_repeat_cancel', date_time_event_handlers.handle_click_on_cancel_modal );
		// Handle click on the cancel button of the modal
		$( document ).on( 'click', '#ai1ec_monthly_type_bymonthday, #ai1ec_monthly_type_byday', date_time_event_handlers.handle_checkbox_monthly_tab_modal );
		// initialize showing / hiding the calendars
		$( '#widgetField > a, #widgetField > span, #ai1ec_exclude_date_label' ).on( 'click', date_time_event_handlers.handle_animation_of_calendar_widget );
		$( document ).on( 'click', '#ai1ec_weekly_date_select > li,#ai1ec_montly_date_select > li,#ai1ec_yearly_date_select > li', date_time_event_handlers.handle_click_on_day_month_in_modal );
		// Attach event on the facebook export checkbox
		$( '#ai1ec_facebook_export' ).click( facebook_export.open_modal_when_user_chooses_to_unpublish_event );
		$( '#ai1ec_facebook_export' ).click( facebook_export.show_multi_choices_when_present );
		$( document ).on( 'click', '#ai1ec_refresh_tokens',  facebook_export.refresh_page_tokens );
		$( 'body' ).on( 'click', '.remove, .keep', facebook_export.add_hidden_field_when_user_click_remove_in_modal );
		$( document ).on(
			'change',
			'#ai1ec_is_free',
			event_cost.handle_change_is_free
		);
		// Attach pseudo handler function. These functions are kind of wrappers around other functions
		// i left them as i found them.
		date_time_event_handlers.execute_pseudo_handlers();
	};

	/**
	 * Place Event Details meta box below title, rather than below description.
	 */
	var reposition_meta_box = function() {
		$( '#ai1ec_event' )
			.insertAfter( '#titlediv' );
		$( '#post' ).addClass( 'ai1ec-visible' );
	};

	var start = function() {
		// Initialize the page. We do this before domReady so we start loading other
		// dependencies as soon as possible.
		init();
		domReady( function() {
			init_collapsibles();
			// Reposition event details meta box.
			reposition_meta_box();
			// Attach the event handlers
			attach_event_handlers();
		} );
	};

	return {
		start: start
	};
} );

timely.require(
	[ "scripts/add_new_event" ],
	function( page ) {
		 // jshint ;_;
		page.start();
	}
);

timely.define("pages/add_new_event", function(){});
