
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

/* ========================================================================
 * Bootstrap: tab.js v3.0.3
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2013 Twitter, Inc.
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
 * ======================================================================== */


timely.define('external_libs/bootstrap/tab', ["jquery_timely"], function( $ ) {  // jshint ;_;

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.ai1ec-dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('ai1ec-active')) return

    var previous = $ul.find('.ai1ec-active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab'
      , relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .ai1ec-active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('ai1ec-fade')

    function next() {
      $active
        .removeClass('ai1ec-active')
        .find('> .ai1ec-dropdown-menu > .ai1ec-active')
        .removeClass('ai1ec-active')

      element.addClass('ai1ec-active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('ai1ec-in')
      } else {
        element.removeClass('ai1ec-fade')
      }

      if (element.parent('.ai1ec-dropdown-menu')) {
        element.closest('li.ai1ec-dropdown').addClass('ai1ec-active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('ai1ec-in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="ai1ec-tab"], [data-toggle="ai1ec-pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

} );

timely.define('libs/utils',
	[
		"jquery_timely",
		"external_libs/bootstrap/tab"
	],
	function( $ ) {

	 // jshint ;_;

	var AI1EC_UTILS = function() {
			// We just return an object. This is useful if we ever need to define some
			// private variables.
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
					// Longitude is valid between +180 and -180 while Latitude is valid
					// between +90 an -90
					var max_value = is_latitude ? 90 : 180;
					return this.is_float( n ) && Math.abs( n ) < max_value;
				},

				/**
				 * Converts all the commas to dots so that the value can be used as a
				 * float
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
					// Check if the field was found. If it's not found we treat it as
					// having no value.
					if( $field.length === 1 ) {
						has_value = $.trim( $field.val() ) !== '';
					}
					return has_value;
				},

				/**
				 * Create a twitter bootstrap alert
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
						case 'error'  : alert_class = 'ai1ec-alert ai1ec-alert-danger';
							break;
						case 'success': alert_class = 'ai1ec-alert ai1ec-alert-success';
							break;
						default: alert_class = 'ai1ec-alert';
							break;
					}
					// Create the alert
					var $alert = $( '<div />', {
						"class" : alert_class,
						"html"  : text
					} );
					if ( ! hide_close_button ) {
						// Create the close button
						var $close = $( '<button>', {
							"type"         : "button",
							"class"        : "ai1ec-close",
							"data-dismiss" : "ai1ec-alert",
							"text"         : "×"
						} );
						// Prepend the close button to the alert.
						$alert.prepend( $close );
					}
					return $alert;
				},

				/**
				 * Define the ajax url. If undefined we hardcode a value. This is needed
				 * for testing purpose only because in the testing environment the
				 * variable ajaxurl is undefined.
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
						$( 'ul.ai1ec-nav a:first' ).tab( 'show' );
					} else {
						// Activate the correct tab
						$( 'ul.ai1ec-nav a[href=' + active_tab + ']' ).tab( 'show' );
					}
				},
				/**
				 * Adds the argument to the url. Just one argument for now
				 *
				 * @param url  string the url to add arguments to
				 * @param args array
				 *
				 */
				add_query_arg :  function( url, args ) {
					if ( 'string' !== typeof url ) return false;
					var char = url.indexOf( '?' ) === -1 ? '?' : '&';
					if ( -1 !== url.indexOf( char + args[0] + '=' ) ) {
						return url;
					}
					return url + char + args[0] + '=' + args[1];
				},
				/**
				 * Makes a string from element's attributes.
				 *
				 * @param el object DOM object.
				 *
				 * @return string Concatenated attributes.
				 */
				create_ai1ec_to_send : function( el ) {
					var
						$el         = $( el ),
						params      = [],
						attrs       = [
							'action',
							'cat_ids',
							'auth_ids',
							'tag_ids',
							'exact_date',
							'display_filters',
							'no_navigation',
							'events_limit'
						],
						dashToCamel = function( str ) {
							return str.replace( /\W+(.)/g, function ( x, chr ) {
								return chr.toUpperCase();
							} );
						};

					$( attrs ).each( function( i, item ) {
						var value = $el.data( dashToCamel( item ) );
						value && params.push( item + '~' + value );
					} );
					return params.join( '|' );
				},
				/**
				 * Enables autoselection of text for .ai1ec-autoselect
				 */
				init_autoselect : function() {
					// Select the text when element is clicked (only once).
					$( document ).on( 'click', '.ai1ec-autoselect', function( e ) {
						// Lets do it only once. Perhaps, user wants to select just a part.
						if ( $( this ).data( 'clicked' ) && e.originalEvent.detail < 2 ) {
							return;
						} else {
							$( this ).data( 'clicked' , true );
						}
						// Working with the text selection depending on the browser abilities.
						var range;
						if ( document.body.createTextRange ) {
							range = document.body.createTextRange();
							range.moveToElementText( this );
							range.select();
						} else if ( window.getSelection ) {
							selection = window.getSelection();
							range = document.createRange();
							range.selectNodeContents( this );
							selection.removeAllRanges();
							selection.addRange( range );
						}
					});
				}
			};
	}();

	return AI1EC_UTILS;
} );

timely.define('external_libs/jquery_cookie', ["jquery_timely"],
		function( $ ) {
	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};


} );

timely.define('scripts/widget-creator',
		[
			"jquery_timely",
			"domReady",
			"ai1ec_config",
			"libs/utils",
			"external_libs/bootstrap/tab",
			"external_libs/jquery_cookie"
		],
		function( $, domReady, ai1ec_config, utils ) {

			var handle_set_tab_cookie = function( e ) {
				var active = $( this ).attr( 'href' );
				$.cookie( 'widget_creator_active_tab', active );
			};

			var activate_saved_tab_on_page_load = function( active_tab ) {
				if ( active_tab === null ){
					// Activate the first tab
					$( 'ul.ai1ec-nav a:first' ).tab( 'show' );
				} else {
					// Activate the correct tab
					$( 'ul.ai1ec-nav a[href=' + active_tab + ']' ).tab( 'show' );
				}
			};

			var handle_loaded_widget_event = function( event ) {
				if ( 'ai1ec-widget-loaded' === event.data ) {
					$( '#widget-preview-title' ).html(
						ai1ec_config.widget_creator.preview
					);
				}
			};

			var initial_setup = function() {
				// Handle embedding code for Super Widget.
				var
					$code    = $( '#ai1ec-superwidget-code' ),
					$preview = $( '<iframe />' )
						// Move Preview to the end of the form.
						.appendTo(
							$( '#ai1ec-superwidget-preview' )
								.removeClass( 'ai1ec-hidden' )
						),
					initialized = false,
					generate_code = function() {
						// get the message that requires calendar_page to be set up.
						// we need this for embedding calendar
						var em_code = ai1ec_config.set_calendar_page;
						if( ai1ec_config.calendar_page_id ) {
							var
								// Get the active tab.
								$active_tab = $( '.ai1ec-tab-content .ai1ec-active' ),
								widget_id   = $active_tab.attr( 'id' ),
								url         = $code.data( 'widget-url' ),
								// Get the defaults.
								defaults    = ai1ec_config.javascript_widgets;;

							em_code = '&lt;script class="ai1ec-widget-placeholder" data-widget="' + widget_id +'"';
							// Process the selects.
							$( 'select', $active_tab ).each( function() {
								var
									$select = $( this ),
									selected = $select.val();

								if ( selected ) {
									var id = $select.attr( 'id' );
									if ( $select.attr( 'multiple' ) ) {
										selected = selected.join( ',' );
										id       = $select.data( 'id' )
									}
									em_code += ' data-' + id + '="' + selected + '"';
								}
							} );
							// Process inputs.
							$( 'input', $active_tab ).each( function() {
								var $input = $( this );

								var val = $input.val();
								if ( 'checkbox' === $input.attr( 'type' ) ) {
									val = this.checked;
								}
								if ( '' !== val ) {
									var id = $input.attr( 'id' );
									var widget_default = defaults[widget_id];
									// type juggling is bad, but here it works as i don't know types.
									// add the code only if it's not the default
									if ( widget_default[id] != val ) {
										em_code += ' data-' + id + '="' + val + '"';
									}
								}
							} );
							em_code += '&gt;<br>&nbsp;&nbsp;(function(){var d=document,s=d.createElement(\'script\'),<br>'
								+ '&nbsp;&nbsp;i=\'ai1ec-script'
								+ '\';if(d.getElementById(i))return;s.async=1;<br>'
								+ '&nbsp;&nbsp;s.id=i;s.src=\'' + url + '\';<br>'
								+ '&nbsp;&nbsp;d.getElementsByTagName(\'head\')[0].appendChild(s);})();<br>'
								+ '&lt;/script&gt;'
							;
						}

						$code.html( em_code );
						return em_code;
					},
					preview = function() {
						if ( ! initialized ) {
							return;
						}
						$( '#widget-preview-title' ).html(
							ai1ec_config.widget_creator.preview_loading
						);
						var
							iframe = $preview[0],
							txt_code = generate_code();

						// A calendar page is needed for this to work. User must have saved it.
						if( ! ai1ec_config.calendar_page_id ) {
							return;
						}
						// Fetch iframe content window (browser-dependent).
						iframe =
							iframe.contentWindow ?
								iframe.contentWindow :
								iframe.contentDocument.document ?
									iframe.contentDocument.document :
									iframe.contentDocument;

						iframe.document.open();
						iframe.document.write(
							'<!DOCTYPE html><html>' +
								'<head><style type="text/css">' +
									'body { padding: 20px 0; }' + // Padding to prevent tooltip cutoff
								'</style></head>' +
								'<body>' +
									$code.text() +
								'</body>' +
							'</html>'
						);
						iframe.document.close();
					};
				// Get the change event when it bubbles up.
				$( '.timely' ).on( 'change', '.ai1ec-form-group', preview );
				$( '.timely' ).on( 'shown.bs.tab', 'a[data-toggle="ai1ec-tab"]', preview );

				// Generate code and preview on page load.
				initialized = true;
				preview();
			};

			domReady( function() {

				utils.activate_saved_tab_on_page_load( $.cookie( 'widget_creator_active_tab' ) );
				utils.init_autoselect();
				window.addEventListener( 'message', handle_loaded_widget_event, false );

				initial_setup();

				// Register event handlers.
				$( document )
					.on( 'click',  'ul.ai1ec-nav a',             handle_set_tab_cookie )
			} );

} )
;