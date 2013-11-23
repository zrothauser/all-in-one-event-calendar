
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

timely.define('scripts/common_scripts/backend/common_ajax_handlers',
	[
		"jquery_timely"
	],
	function( $ ) {
	 // jshint ;_;

	var handle_dismiss_plugins = function( response ) {
		if ( response ) {
			if( typeof response.message !== 'undefined' ) {
				window.alert( response.message );
			} else {
				$( '.ai1ec-facebook-cron-dismiss-notification' ).closest( '.message' ).fadeOut();
			}
		}
	};

	var handle_dismiss_notification = function( response ) {
		if( response.error ) {
			// tell the user that there is an error
			window.alert( response.message );
		} else {
			// hide notification message
			$( '.ai1ec-dismiss-notification' ).closest( '.message' ).fadeOut();
		}
	};

	var handle_dismiss_intro_video = function( response ) {
		if( response.error ) {
			// Tell the user that there is an error.
			window.alert( response.message );
		} else {
			// Hide notification message.
			$( '.ai1ec-dismiss-intro-video' ).closest( '.message' ).fadeOut();
		}
	};

	/**
	 * AJAX result after clicking Dismiss in license warning.
	 * @param  {object} response Data returned by HTTP response
	 */
	var handle_dismiss_license_warning = function( response ) {
		if( response.error ) {
			// Tell the user that there is an error.
			window.alert( response.message );
		} else {
			// Hide notification message.
			$( '.ai1ec-dismiss-license-warning' ).closest( '.message' ).fadeOut();
		}
	};

	return {
		handle_dismiss_plugins        : handle_dismiss_plugins,
		handle_dismiss_notification   : handle_dismiss_notification,
		handle_dismiss_intro_video    : handle_dismiss_intro_video,
		handle_dismiss_license_warning: handle_dismiss_license_warning
	};
} );

timely.define('scripts/common_scripts/backend/common_event_handlers',
	[
		"jquery_timely",
		"scripts/common_scripts/backend/common_ajax_handlers"
	],
	function( $, ajax_handlers ) {
	 // jshint ;_;

	var dismiss_plugins_messages_handler = function( e ) {
		var data = {
			"action" : 'ai1ec_facebook_cron_dismiss'
		};
		$.post(
				ajaxurl,
				data,
				ajax_handlers.handle_dismiss_plugins,
				'json'
			);
	};

	var dismiss_notification_handler = function( e ) {
		var $button = $( this );
		// disable the update button
		$button.attr( 'disabled', true );

		// create the data to send
		var data = {
			action: 'ai1ec_disable_notification',
			note  : false
		};

		$.post( ajaxurl, data, ajax_handlers.handle_dismiss_notification ) ;
	};

	var dismiss_intro_video_handler = function( e ) {
		var $button = $( this );
		// Disable the update button.
		$button.attr( 'disabled', true );

		// Create the data to send.
		var data = {
			action: 'ai1ec_disable_intro_video',
			note  : false
		};

		$.post( ajaxurl, data, ajax_handlers.handle_dismiss_intro_video ) ;
	};

	/**
	 * Dismiss button clicked in invalid license warning.
	 *
	 * @param  {Event} e jQuery event object
	 */
	var dismiss_license_warning_handler = function( e ) {
		var $button = $( this );
		// Disable the update button.
		$button.attr( 'disabled', true );

		// Create the data to send.
		var data = {
			action: 'ai1ec_set_license_warning',
			value: 'dismissed'
		};

		$.post( ajaxurl, data, ajax_handlers.handle_dismiss_license_warning ) ;
	};

	// Show/hide the multiselect containers when user clicks on "limit by" widget options
	var handle_multiselect_containers_widget_page = function( e ) {
		$( this ).parent().next( '.ai1ec-limit-by-options-container' ).toggle();
	};

	return {
		dismiss_plugins_messages_handler          : dismiss_plugins_messages_handler,
		dismiss_notification_handler              : dismiss_notification_handler,
		dismiss_intro_video_handler               : dismiss_intro_video_handler,
		dismiss_license_warning_handler           : dismiss_license_warning_handler,
		handle_multiselect_containers_widget_page : handle_multiselect_containers_widget_page
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

timely.define('external_libs/bootstrap_tooltip',
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
  /* ===========================================================
   * bootstrap-tooltip.js v2.0.4
   * http://twitter.github.com/bootstrap/javascript.html#tooltips
   * Inspired by the original jQuery.tipsy by Jason Frame
   * ===========================================================
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
   * ========================================================== */

if ( ! $.fn.tooltip ) {

     // jshint ;_;

 /* TOOLTIP PUBLIC CLASS DEFINITION
  * =============================== */

  var Tooltip = function (element, options) {
    this.init('tooltip', element, options)
  }

  Tooltip.prototype = {

    constructor: Tooltip

  , init: function (type, element, options) {
      var eventIn
        , eventOut

      this.type = type
      this.$element = $(element)
      this.options = this.getOptions(options)
      this.enabled = true

      if (this.options.trigger != 'manual') {
        eventIn  = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
        eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
        this.$element.on(eventIn, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut, this.options.selector, $.proxy(this.leave, this))
      }

      this.options.selector ?
        (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
        this.fixTitle()
    }

  , getOptions: function (options) {
      options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data())

      if (options.delay && typeof options.delay == 'number') {
        options.delay = {
          show: options.delay
        , hide: options.delay
        }
      }

      return options
    }

  , enter: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (!self.options.delay || !self.options.delay.show) return self.show()

      clearTimeout(this.timeout)
      self.hoverState = 'in'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'in') self.show()
      }, self.options.delay.show)
    }

  , leave: function (e) {
      var self = $(e.currentTarget)[this.type](this._options).data(this.type)

      if (this.timeout) clearTimeout(this.timeout)
      if (!self.options.delay || !self.options.delay.hide) return self.hide()

      self.hoverState = 'out'
      this.timeout = setTimeout(function() {
        if (self.hoverState == 'out') self.hide()
      }, self.options.delay.hide)
    }

  , show: function () {
      var $tip
        , inside
        , pos
        , actualWidth
        , actualHeight
        , placement
        , tp

      if (this.hasContent() && this.enabled) {
        $tip = this.tip()
        this.setContent()

        if (this.options.animation) {
          $tip.addClass('fade')
        }

        placement = typeof this.options.placement == 'function' ?
          this.options.placement.call(this, $tip[0], this.$element[0]) :
          this.options.placement

        inside = /in/.test(placement)

        $tip
          .remove()
          .css({ top: 0, left: 0, display: 'block' })
          .appendTo(inside ? this.$element : document.body)

        pos = this.getPosition(inside)

        actualWidth = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight

        switch (inside ? placement.split(' ')[1] : placement) {
          case 'bottom':
            tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'top':
            tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
            break
          case 'left':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
            break
          case 'right':
            tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
            break
        }

        $tip
          .css(tp)
          .addClass(placement)
          .addClass('in')
      }
    }

  , isHTML: function(text) {
      // html string detection logic adapted from jQuery
      return typeof text != 'string'
        || ( text.charAt(0) === "<"
          && text.charAt( text.length - 1 ) === ">"
          && text.length >= 3
        ) || /^(?:[^<]*<[\w\W]+>[^>]*$)/.exec(text)
    }

  , setContent: function () {
      var $tip = this.tip()
        , title = this.getTitle()

      $tip.find('.tooltip-inner')[this.isHTML(title) ? 'html' : 'text'](title)
      $tip.removeClass('fade in top bottom left right')
    }

  , hide: function () {
      var that = this
        , $tip = this.tip()

      $tip.removeClass('in')

      function removeWithAnimation() {
        var timeout = setTimeout(function () {
          $tip.off($.support.transition.end).remove()
        }, 500)

        $tip.one($.support.transition.end, function () {
          clearTimeout(timeout)
          $tip.remove()
        })
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        removeWithAnimation() :
        $tip.remove()
    }

  , fixTitle: function () {
      var $e = this.$element
      if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
        $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title')
      }
    }

  , hasContent: function () {
      return this.getTitle()
    }

  , getPosition: function (inside) {
      return $.extend({}, (inside ? {top: 0, left: 0} : this.$element.offset()), {
        width: this.$element[0].offsetWidth
      , height: this.$element[0].offsetHeight
      })
    }

  , getTitle: function () {
      var title
        , $e = this.$element
        , o = this.options

      title = $e.attr('data-original-title')
        || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

      return title
    }

  , tip: function () {
      return this.$tip = this.$tip || $(this.options.template)
    }

  , validate: function () {
      if (!this.$element[0].parentNode) {
        this.hide()
        this.$element = null
        this.options = null
      }
    }

  , enable: function () {
      this.enabled = true
    }

  , disable: function () {
      this.enabled = false
    }

  , toggleEnabled: function () {
      this.enabled = !this.enabled
    }

  , toggle: function () {
      this[this.tip().hasClass('in') ? 'hide' : 'show']()
    }

  }


 /* TOOLTIP PLUGIN DEFINITION
  * ========================= */

  $.fn.tooltip = function ( option ) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tooltip')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip

  $.fn.tooltip.defaults = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
  , trigger: 'hover'
  , title: ''
  , delay: 0
  }

}

} );

timely.define('external_libs/bootstrap_popover',
		[
		 "jquery_timely",
		 "external_libs/bootstrap_tooltip"
		 ],
		 function( $, domReady ) {
	/* ===========================================================
	 * bootstrap-popover.js v2.0.4
	 * http://twitter.github.com/bootstrap/javascript.html#popovers
	 * ===========================================================
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
	 * =========================================================== */

if ( ! $.fn.popover ) {

		 // jshint ;_;

 /* POPOVER PUBLIC CLASS DEFINITION
	* =============================== */

	var Popover = function ( element, options ) {
		this.init('popover', element, options)
	}


	/* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
		 ========================================== */

	Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {

		constructor: Popover

	, setContent: function () {
			var $tip = this.tip()
				, title = this.getTitle()
				, content = this.getContent()

			$tip.find('.popover-title')[this.isHTML(title) ? 'html' : 'text'](title)
			$tip.find('.popover-content > *')[this.isHTML(content) ? 'html' : 'text'](content)

			$tip.removeClass('fade top bottom left right in')
		}

	, hasContent: function () {
			return this.getTitle() || this.getContent()
		}

	, getContent: function () {
			var content
				, $e = this.$element
				, o = this.options

			content = $e.attr('data-content')
				|| (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)

			return content
		}

	, tip: function () {
			if (!this.$tip) {
				this.$tip = $(this.options.template)
			}
			return this.$tip
		}

	})


 /* POPOVER PLUGIN DEFINITION
	* ======================= */

	$.fn.popover = function (option) {
		return this.each(function () {
			var $this = $(this)
				, data = $this.data('popover')
				, options = typeof option == 'object' && option
			if (!data) $this.data('popover', (data = new Popover(this, options)))
			if (typeof option == 'string') data[option]()
		})
	}

	$.fn.popover.Constructor = Popover

	$.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
		placement: 'right'
	, content: ''
	, template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
	})

}

if ( ! $.fn.constrained_popover ) {

	/* CONSTRAINED_POPOVER PUBLIC CLASS DEFINITION
	 * =========================================== */

	var ConstrainedPopover = function ( element, options ) {
		this.init('constrained_popover', element, options )
	};

	/* NOTE: CONSTRAINED_POPOVER EXTENDS BOOTSTRAP-POPOVER.js
	 ========================================== */

	ConstrainedPopover.prototype = $.extend( {}, $.fn.popover.Constructor.prototype, {

		constructor: ConstrainedPopover

	, show: function () {
		var $tip
			, inside
			, pos
			, newPos
			, actualWidth
			, actualHeight
			, placement
			, tp
			, finalPos = {}

		if (this.hasContent() && this.enabled) {
			$tip = this.tip()
			this.setContent()

			if (this.options.animation) {
				$tip.addClass('fade')
			}

			placement = typeof this.options.placement == 'function' ?
				this.options.placement.call(this, $tip[0], this.$element[0]) :
				this.options.placement

			inside = /in/.test(placement)

			$tip
				.remove()
				.css({ top: 0, left: 0, display: 'block' })
				.appendTo(inside ? this.$element : document.body)

			pos = this.getPosition( inside )

			actualWidth = $tip[0].offsetWidth
			actualHeight = $tip[0].offsetHeight

			switch (inside ? placement.split(' ')[1] : placement) {
				case 'left':
					newPos = this.defineBounds( pos )
					if ( typeof newPos.top === "undefined" ) {
						finalPos["top"] = pos.top + pos.height / 2 - actualHeight / 2
					} else {
						finalPos["top"] = newPos.top - actualHeight / 2
					}
					if ( typeof newPos.left === "undefined" ) {
						finalPos["left"] = pos.left - actualWidth
					} else {
						finalPos["left"] = newPos.left - actualWidth
					}
					tp = { top: finalPos.top , left: finalPos.left }
					break
				case 'right':
					newPos = this.defineBounds( pos )
					if ( typeof newPos.top === "undefined" ) {
						finalPos["top"] = pos.top + pos.height / 2 - actualHeight / 2
					} else {
						finalPos["top"] = newPos.top - actualHeight / 2
					}
					if ( typeof newPos.left === "undefined" ) {
						finalPos["left"] = pos.left + pos.width
					} else {
						finalPos["left"] = newPos.left + pos.width
					}
					tp = { top: finalPos.top , left: finalPos.left }
					break
			}

			$tip
				.css(tp)
				.addClass(placement)
				.addClass('in')
		}
	}

	, defineBounds: function ( pos ) {
		var container
		, containerOffset
			, boundTop
			, boundLeft
			, boundBottom
			, boundRight
			, newPos = {}
			, $container = $( this.options.container )

		if ( $container.length ) {
			containerOffset = $container.offset()

			boundTop = containerOffset.top
			boundLeft = containerOffset.left
			boundBottom = boundTop + $container.height()
			boundRight = boundLeft + $container.width()

			// Constrain y-axis overflow
			if ( pos.top + ( pos.height / 2 ) < boundTop ) {
				newPos["top"] = boundTop
			}
			if ( pos.top + ( pos.height / 2 ) > boundBottom ) {
				newPos["top"] = boundBottom
			}

			// Constrain x-axis overflow
			if ( pos.left - ( pos.width / 2 ) < boundLeft ) {
				newPos["left"] = boundLeft
			}
			if ( pos.left - ( pos.width / 2 ) > boundRight ) {
				newPos["left"] = boundRight
			}
			return newPos
		}
		return false
	}

	})

	 /* CONSTRAINED_POPOVER PLUGIN DEFINITION
		* ===================================== */

	$.fn.constrained_popover = function ( option ) {
		return this.each( function () {
			var $this = $(this)
						, data = $this.data('constrained_popover')
						, options = typeof option == 'object' && option
					if (!data) $this.data('constrained_popover', (data = new ConstrainedPopover(this, options)))
					if (typeof option == 'string') data[option]()
		})
	}

	$.fn.constrained_popover.Constructor = ConstrainedPopover

	$.fn.constrained_popover.defaults = $.extend({} , $.fn.popover.defaults, {
		container: ''
		, content: this.options
	})
} // END: CONSTRAINED_POPOVER

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

/*global YT:true*/
timely.define('scripts/common_scripts/backend/common_backend',
	[
		"jquery_timely",
		"domReady",
		"ai1ec_config",
		"scripts/common_scripts/backend/common_event_handlers",
		"external_libs/Placeholders",
		"external_libs/bootstrap_tooltip",
		"external_libs/bootstrap_popover",
		"libs/modal_helper"
	],
	function( $, domReady, ai1ec_config, event_handlers ) {
	 // jshint ;_;

	var add_export_to_facebook = function() {
		// When we have select the "Show only events that can be exported to facebook" filter and when there are rows in the table
		if( $( '#ai1ec-facebook-filter option[value=exportable]:selected' ).length > 0 && $( 'table.wp-list-table tr.no-items' ).length === 0 && ai1ec_config.facebook_logged_in === "1" ) {
			// Add the bulk action to the selects
			$( '<option>' ).val( 'export-facebook' ).text( "Export to facebook" ).appendTo( "select[name='action']" );
			$( '<option>' ).val( 'export-facebook' ).text( "Export to facebook" ).appendTo( "select[name='action2']" );
		}
	};

	var handle_platform_mode = function() {
		if( ai1ec_config.platform_active === "1" ) {
			// Hide certain menu links from Events menu (Settings, Themes,
			// Theme Options). If any of them are active, activate their duplicate
			// ones in the other locations.
			$( '#menu-posts-ai1ec_event li' ).each( function() {
				var $li = $( this );
				if ( $li.has( 'a[href$="all-in-one-event-calendar-themes"], ' +
				              'a[href$="all-in-one-event-calendar-edit-css"], ' +
				              'a[href$="all-in-one-event-calendar-settings"]' ).length ) {
					if ( $li.is( '.current' ) ) {
						var url = $( 'a', $li ).attr( 'href' );
						// Find this menu item's duplicate menu item and activate it.
						$( '#adminmenu a:not(.current)[href="' + url + '"]' ) // <a>
							.parent()                                           // <li>
								.andSelf()                                        // <li> + <a>
									.addClass( 'current' )
								.end()                                            // <li>
								.closest( 'li.menu-top' )             // parent menu <li>
								  .find( '> a.menu-top' )             // parent menu <li>'s <a>
								    .andSelf()                        // parent menu <li> + its <a>
								  .addClass( 'wp-has-current-submenu wp-menu-open' )
								  .removeClass( 'wp-not-current-submenu' );
						// Deactivate this menu item's parent menu.
						$li.closest( 'li.menu-top' )
							.find( '> a.menu-top' )
							.andSelf()
							.removeClass( 'wp-has-current-submenu wp-menu-open' )
							.addClass( 'wp-not-current-submenu' );
					}
					// Finally, hide this menu item altogether.
					$li.hide();
				}
			});
			// Make changes to the WordPress Settings > Reading page.
			if( $( 'body.options-reading-php' ).length ) {
				var disable_front_page_option = function() {
					$( '#page_on_front' ).attr( 'disabled', 'disabled' );
				};
				disable_front_page_option();
				$( '#front-static-pages input:radio' ).change( disable_front_page_option );
				$( '#page_on_front' ).after( '<span class="description">' + ai1ec_config.page_on_front_description + '</span>' );
			}
			// In strict mode, aggressively remove elements from the admin interface.
			if( ai1ec_config.strict_mode === "1" ) {
				$( '#dashboard-widgets .postbox' )
					.not( '#ai1ec-calendar-tasks, #dashboard_right_now' )
					.remove();
				$( '#adminmenu > li' )
					.not( '.wp-menu-separator, #menu-dashboard, #menu-posts-ai1ec_event, #menu-media, #menu-appearance, #menu-users, #menu-settings' )
					.remove();
				$( '#menu-appearance > .wp-submenu li, #menu-settings > .wp-submenu li' )
					.not( ':has(a[href*="all-in-one-event-calendar"])' )
					.remove();
			}
		}
	};

	var initialize_modal_video = function() {

		if ( $( '#ai1ec-video' ).length ) {
			// TODO: Load YouTube IFrame Player API async using requirejs (right?)
			// TODO: Separate event handlers into common_event_handlers.js. Tried this
			// already and had difficulties; maybe the Bootstrap modal code wasn't
			// initialized yet? Weird error messages.

			// Load the YouTube IFrame Player API code asynchronously.
			$.ajax({
				cache : true,
				async : true,
				dataType : 'script',
				url : '//www.youtube.com/iframe_api'
			});


			// Create an <iframe> (and YouTube player) after the API code downloads.
			window.onYouTubeIframeAPIReady = function() {

				var player = new YT.Player( 'ai1ec-video', {
					height: '368',
					width: '600',
					videoId: window.ai1ecVideo.youtubeId
				});
				$( '#ai1ec-video' ).css( 'display', 'block' );

				$( '#ai1ec-video-modal' ).on( 'hide', function() {
					player.stopVideo();
				} );
			};
		}
	};

	var attach_event_handlers_backend = function() {
		$( document )
			.on( 'click', '.ai1ec-facebook-cron-dismiss-notification',  event_handlers.dismiss_plugins_messages_handler )
			.on( 'click', '.ai1ec-dismiss-notification', event_handlers.dismiss_notification_handler )
			.on( 'click', '.ai1ec-dismiss-intro-video', event_handlers.dismiss_intro_video_handler )
			.on( 'click', '.ai1ec-dismiss-license-warning', event_handlers.dismiss_license_warning_handler )
			.on( 'click', '.ai1ec-limit-by-cat, .ai1ec-limit-by-tag, .ai1ec-limit-by-event', event_handlers.handle_multiselect_containers_widget_page );
	};

	/**
	 * Initialize any popovers & tooltips required on the page.
	 */
	var initialize_popovers = function() {
		// Popovers in Support box (if present) need to be initialized specially.
		$( '#ai1ec-support .ai1ec-download a[title]' ).popover( {
			placement: 'left'
		} );
		// Initialize any tooltips.
		$( '.ai1ec-tooltip-toggle' ).tooltip();
	};

	// If it was set in the backend, run the script
	if( ai1ec_config.page !== '' ) {
		$( '.if-js-closed' ).removeClass( 'if-js-closed' ).addClass( 'closed' );
		postboxes.add_postbox_toggles( ai1ec_config.page  );
	}

	var start = function() {
		domReady( function() {
			// Attach the export to Facebook functionality.
			add_export_to_facebook();
			// Initialize modal video if present.
			initialize_modal_video();
			// Attach the event handlers.
			attach_event_handlers_backend();
			// Handle event platform mode.
			handle_platform_mode();
			// Initialize any popovers.
			initialize_popovers();
		} );
	};

	return {
		start : start
	};
} );

timely.require(
		[ "scripts/common_scripts/backend/common_backend" ],
		function( page ) {
		 // jshint ;_;
			page.start();
		}
);

timely.define("pages/common_backend", function(){});
