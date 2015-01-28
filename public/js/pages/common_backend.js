
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
		$( this ).parent().next( '.ai1ec-limit-by-options-container' )
                                  .toggle()
                                  .find( 'option' )
                                  .removeAttr( 'selected' );
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

/* ========================================================================
 * Bootstrap: tooltip.js v3.0.3
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
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


timely.define('external_libs/bootstrap/tooltip', ["jquery_timely"], function( $ ) {  // jshint ;_;

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       =
    this.options    =
    this.enabled    =
    this.timeout    =
    this.hoverState =
    this.$element   = null

    this.init('tooltip', element, options)
  }

  Tooltip.DEFAULTS = {
    animation: true
  , placement: 'top'
  , selector: false
  , template: '<div class="ai1ec-tooltip"><div class="ai1ec-tooltip-arrow"></div><div class="ai1ec-tooltip-inner"></div></div>'
  , trigger: 'hover focus'
  , title: ''
  , delay: 0
  , html: false
  , container: false
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled  = true
    this.type     = type
    this.$element = $(element)
    this.options  = this.getOptions(options)

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focus'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'blur'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay
      , hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type)

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.'+ this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('ai1ec-fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass("ai1ec-" + placement)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var $parent = this.$element.parent()

        var orgPlacement = placement
        var docScroll    = document.documentElement.scrollTop || document.body.scrollTop
        var parentWidth  = this.options.container == 'body' ? window.innerWidth  : $parent.outerWidth()
        var parentHeight = this.options.container == 'body' ? window.innerHeight : $parent.outerHeight()
        var parentLeft   = this.options.container == 'body' ? 0 : $parent.offset().left

        placement = placement == 'bottom' && pos.top   + pos.height  + actualHeight - docScroll > parentHeight  ? 'top'    :
                    placement == 'top'    && pos.top   - docScroll   - actualHeight < 0                         ? 'bottom' :
                    placement == 'right'  && pos.right + actualWidth > parentWidth                              ? 'left'   :
                    placement == 'left'   && pos.left  - actualWidth < parentLeft                               ? 'right'  :
                    placement

        $tip
          .removeClass("ai1ec-" + orgPlacement)
          .addClass("ai1ec-" + placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.$element.trigger('shown.bs.' + this.type)
    }
  }

  Tooltip.prototype.applyPlacement = function(offset, placement) {
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    $tip
      .offset(offset)
      .addClass('ai1ec-in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
  }

  Tooltip.prototype.replaceArrow = function(delta, dimension, position) {
    this.arrow().css(position, delta ? (50 * (1 - delta / dimension) + "%") : '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.ai1ec-tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('ai1ec-fade ai1ec-in ai1ec-top ai1ec-bottom ai1ec-left ai1ec-right')
  }

  Tooltip.prototype.hide = function () {
    var that = this
    var $tip = this.tip()
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('ai1ec-in')

    $.support.transition && this.$tip.hasClass('ai1ec-fade') ?
      $tip
        .one($.support.transition.end, complete)
        .emulateTransitionEnd(150) :
      complete()

    this.$element.trigger('hidden.bs.' + this.type)

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function () {
    var el = this.$element[0]
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : {
      width: el.offsetWidth
    , height: el.offsetHeight
    }, this.$element.offset())
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2  } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width   }
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.tip = function () {
    return this.$tip = this.$tip || $(this.options.template)
  }

  Tooltip.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.ai1ec-tooltip-arrow')
  }

  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options  = null
    }
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = e ? $(e.currentTarget)[this.type](this.getDelegateOptions()).data('bs.' + this.type) : this
    self.tip().hasClass('ai1ec-in') ? self.leave(self) : self.enter(self)
  }

  Tooltip.prototype.destroy = function () {
    this.hide().$element.off('.' + this.type).removeData('bs.' + this.type)
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  var old = $.fn.tooltip

  $.fn.tooltip = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

} );

/* ========================================================================
 * Bootstrap: popover.js v3.0.3
 * http://getbootstrap.com/javascript/#popovers
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


timely.define('external_libs/bootstrap/popover', ["jquery_timely", "external_libs/bootstrap/tooltip"], function( $ ) {  // jshint ;_;

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.DEFAULTS = $.extend({} , $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right'
  , trigger: 'click'
  , content: ''
  , template: '<div class="ai1ec-popover"><div class="ai1ec-arrow"></div><h3 class="ai1ec-popover-title"></h3><div class="ai1ec-popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.ai1ec-popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.ai1ec-popover-content')[this.options.html ? 'html' : 'text'](content)

    $tip.removeClass('ai1ec-fade ai1ec-top ai1ec-bottom ai1ec-left ai1ec-right ai1ec-in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.ai1ec-popover-title').html()) $tip.find('.ai1ec-popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return this.$arrow = this.$arrow || this.tip().find('.ai1ec-arrow')
  }

  Popover.prototype.tip = function () {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  var old = $.fn.popover

  $.fn.popover = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

} );

/* ========================================================================
 * Bootstrap: modal.js v3.0.3
 * http://getbootstrap.com/javascript/#modals
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


timely.define('external_libs/bootstrap/modal', ["jquery_timely"], function( $ ) {  // jshint ;_;

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options   = options
    this.$element  = $(element)
    this.$backdrop =
    this.isShown   = null

    if (this.options.remote) this.$element.load(this.options.remote)
  }

  Modal.DEFAULTS = {
      backdrop: true
    , keyboard: true
    , show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this[!this.isShown ? 'show' : 'hide'](_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.escape()

    this.$element.on('click.dismiss.modal', '[data-dismiss="ai1ec-modal"]', $.proxy(this.hide, this))

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('ai1ec-fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(document.body) // don't move modals dom position
      }

      that.$element.show()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element
        .addClass('ai1ec-in')
        .attr('aria-hidden', false)

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$element.find('.ai1ec-modal-dialog') // wait for modal to slide in
          .one($.support.transition.end, function () {
            that.$element.focus().trigger(e)
          })
          .emulateTransitionEnd(300) :
        that.$element.focus().trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('ai1ec-in')
      .attr('aria-hidden', true)
      .off('click.dismiss.modal')

    $.support.transition && this.$element.hasClass('ai1ec-fade') ?
      this.$element
        .one($.support.transition.end, $.proxy(this.hideModal, this))
        .emulateTransitionEnd(300) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.focus()
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.removeBackdrop()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that    = this
    var animate = this.$element.hasClass('ai1ec-fade') ? 'ai1ec-fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $('<div class="ai1ec-modal-backdrop ' + animate + '" />')
        .appendTo(document.body)

      this.$element.on('click.dismiss.modal', $.proxy(function (e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus.call(this.$element[0])
          : this.hide.call(this)
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('ai1ec-in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('ai1ec-in')

      $.support.transition && this.$element.hasClass('ai1ec-fade')?
        this.$backdrop
          .one($.support.transition.end, callback)
          .emulateTransitionEnd(150) :
        callback()

    } else if (callback) {
      callback()
    }
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  var old = $.fn.modal

  $.fn.modal = function (option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="ai1ec-modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) //strip for ie7
    var option  = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    e.preventDefault()

    $target
      .modal(option, this)
      .one('hide', function () {
        $this.is(':visible') && $this.focus()
      })
  })

  $(document)
    .on('show.bs.modal',  '.ai1ec-modal', function () { $(document.body).addClass('ai1ec-modal-open') })
    .on('hidden.bs.modal', '.ai1ec-modal', function () { $(document.body).removeClass('ai1ec-modal-open') })

} );

/* ========================================================================
 * Bootstrap: dropdown.js v3.0.3
 * http://getbootstrap.com/javascript/#dropdowns
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


timely.define('external_libs/bootstrap/dropdown', ["jquery_timely"], function( $ ) {  // jshint ;_;

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.ai1ec-dropdown-backdrop'
  var toggle   = '[data-toggle=ai1ec-dropdown]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.ai1ec-disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('ai1ec-open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.ai1ec-navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $('<div class="ai1ec-dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }

      $parent.trigger(e = $.Event('show.bs.dropdown'))

      if (e.isDefaultPrevented()) return

      $parent
        .toggleClass('ai1ec-open')
        .trigger('shown.bs.dropdown')

      $this.focus()
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27)/.test(e.keyCode)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.ai1ec-disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('ai1ec-open')

    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).focus()
      return $this.click()
    }

    var $items = $('[role=menu] li:not(.ai1ec-divider):visible a', $parent)

    if (!$items.length) return

    var index = $items.index($items.filter(':focus'))

    if (e.keyCode == 38 && index > 0)                 index--                        // up
    if (e.keyCode == 40 && index < $items.length - 1) index++                        // down
    if (!~index)                                      index=0

    $items.eq(index).focus()
  }

  function clearMenus() {
    $(backdrop).remove()
    $(toggle).each(function (e) {
      var $parent = getParent($(this))
      if (!$parent.hasClass('ai1ec-open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown'))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('ai1ec-open').trigger('hidden.bs.dropdown')
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  var old = $.fn.dropdown

  $.fn.dropdown = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.ai1ec-dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api'  , toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role=menu]' , Dropdown.prototype.keydown)

} );

/*global YT:true*/
timely.define('scripts/common_scripts/backend/common_backend',
	[
		"jquery_timely",
		"domReady",
		"ai1ec_config",
		"scripts/common_scripts/backend/common_event_handlers",
		"external_libs/Placeholders",
		"external_libs/bootstrap/tooltip",
		"external_libs/bootstrap/popover",
		"external_libs/bootstrap/modal",
		"external_libs/bootstrap/dropdown"
	],

	function( $, domReady, ai1ec_config, event_handlers ) {

	 // jshint ;_;

	var add_export_to_facebook = function() {
		// When we have select the "Show only events that can be exported to
		// facebook" filter and when there are rows in the table
		if (
			$( '#ai1ec-facebook-filter option[value=exportable]:selected' ).length > 0 &&
			$( 'table.wp-list-table tr.no-items' ).length === 0 &&
			ai1ec_config.facebook_logged_in === "1"
		) {
			// Add the bulk action to the selects
			$( '<option>' ).val( 'export-facebook' ).text( "Export to facebook" )
				.appendTo( "select[name='action']" );
			$( '<option>' ).val( 'export-facebook' ).text( "Export to facebook" )
				.appendTo( "select[name='action2']" );
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
				$( '#front-static-pages input:radio' )
					.change( disable_front_page_option );
				$( '#page_on_front' ).after(
					'<span class="description">' +
					ai1ec_config.page_on_front_description +
					'</span>'
				);
			}
			// In strict mode, aggressively remove elements from the admin interface.
			if( ai1ec_config.strict_mode === "1" ) {
				$( '#dashboard-widgets .postbox' )
					.not( '#ai1ec-calendar-tasks, #dashboard_right_now' )
					.remove();
				$( '#adminmenu > li' )
					.not(
						'.wp-menu-separator, #menu-dashboard, #menu-posts-ai1ec_event, ' +
						'#menu-media, #menu-appearance, #menu-users, #menu-settings'
					).remove();
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
			.on( 'click', '.ai1ec-facebook-cron-dismiss-notification',
				event_handlers.dismiss_plugins_messages_handler )
			.on( 'click', '.ai1ec-dismiss-notification',
				event_handlers.dismiss_notification_handler )
			.on( 'click', '.ai1ec-dismiss-intro-video',
				event_handlers.dismiss_intro_video_handler )
			.on( 'click', '.ai1ec-dismiss-license-warning',
				event_handlers.dismiss_license_warning_handler )
			.on( 'click', '.ai1ec-limit-by-cat, .ai1ec-limit-by-tag, .ai1ec-limit-by-event',
				event_handlers.handle_multiselect_containers_widget_page )
			.on( 'click', '.ai1ec-dismissable', function() {
				var data = {
					action : 'ai1ec_dismiss_notice',
					key    : $( this ).data( 'key' )
				};
				var button = this;
				$.post( ajaxurl, data, function( response ) {
					$( button ).closest( '.ai1ec-message' ).remove();
				} );
			} );
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
		$( '.ai1ec-tooltip-toggle' ).tooltip( { container: 'body' } );
	};

	// Send result after user clicked
	var send_tracking = function( result ) {
		var options = {
			tracking : result,
			action   : 'ai1ec_tracking',
		};
		$.post( ajaxurl, options );
	};

	// show the op in popup. Here i use jQuery and not $ as i must use Wordpress jQuery
	var show_tracking_popup = function() {
		var pointer_options = {
			content:
				"<h3>Help improve All In One Event Calendar<\/h3>" + "<p>Help us by sending some data<\/p>",
			position:{
				edge : "top",
				align : "center"
			},
			buttons: function ( event, t ) {
				var button =
					$( '<a id="pointer-close" style="margin-left:5px;" class="button-secondary">' + 'Do not allow tracking' + '</a>' );
				button.bind( 'click.pointer', function () {
					t.element.pointer( 'close' );
					}
				);
				return button;
			},
			close: function() {
			}
		};

		jQuery( '#wpadminbar' ).pointer( pointer_options ).pointer( 'open' );
		jQuery( '#pointer-close' ).after( '<a id="pointer-primary" class="button-primary">' + 'Allow tracking' + '</a>' );
		jQuery( '#pointer-primary' ).click( function () {
			send_tracking( true );
			$( this ).closest( '.wp-pointer' ).remove();
		} );
		jQuery( '#pointer-close' ).click( function () {
			send_tracking( false );
		} );
	};

	var category_header = function() {
		var $header = $( '.ai1ec-taxonomy-header' ),
		    active_tab;

		if ( $header.length ) {
			// Move edit button.
			$( '.ai1ec-taxonomy-edit-link' )
				.removeClass( 'ai1ec-hide' )
				.appendTo( '.wrap > h2:first' );
			// Move tabs to correct location and display them.
			$(  '.wrap > h2:first' ).after( $header.removeClass( 'ai1ec-hide' ) );
			// Activate tab if none is active.
			if ( ! $header.find( 'li.ai1ec-active' ).length ) {
				active_tab = $( '[data-ai1ec_active_tab]' ).data( 'ai1ec_active_tab' );
				if ( active_tab ) {
					$( active_tab ).addClass( 'ai1ec-active' );
				}
			}
			// Highlight the Organize menu item.
			$( '#menu-posts-ai1ec_event a[href="edit-tags.php?taxonomy=events_categories&post_type=ai1ec_event"]' )
				.closest( 'li' )
				.addClass( 'current' );
		}
	};
	var start = function() {
		domReady( function() {
			// Attach the export to Facebook functionality.
			add_export_to_facebook();
			// place cateogry header
			category_header();
			// Initialize modal video if present.
			initialize_modal_video();
			// Attach the event handlers.
			attach_event_handlers_backend();
			// Handle event platform mode.
			handle_platform_mode();
			// Initialize any popovers.
			initialize_popovers();
			if ( ai1ec_config.show_tracking_popup ) {
				show_tracking_popup();
			}
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
