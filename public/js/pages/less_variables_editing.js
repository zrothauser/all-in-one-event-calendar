
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

timely.define('external_libs/bootstrap_colorpicker',
		[
		 "jquery_timely"
		 ],
		 function( $ ) {

	// Color object

	var Color = function(val) {
		this.value = {
			h: 1,
			s: 1,
			b: 1,
			a: 1
		};
		this.setColor(val);
	};

	Color.prototype = {
		constructor: Color,

		//parse a string to HSB
		setColor: function(val){
			val = val.toLowerCase();
			var that = this;
			$.each( CPGlobal.stringParsers, function( i, parser ) {
				var match = parser.re.exec( val ),
					values = match && parser.parse( match ),
					space = parser.space||'rgba';
				if ( values ) {
					if (space == 'hsla') {
						that.value = CPGlobal.RGBtoHSB.apply(null, CPGlobal.HSLtoRGB.apply(null, values));
					} else {
						that.value = CPGlobal.RGBtoHSB.apply(null, values);
					}
					return false;
				}
			});
		},

		setHue: function(h) {
			this.value.h = 1- h;
		},

		setSaturation: function(s) {
			this.value.s = s;
		},

		setLightness: function(b) {
			this.value.b = 1- b;
		},

		setAlpha: function(a) {
			this.value.a = parseInt((1 - a)*100, 10)/100;
		},

		// HSBtoRGB from RaphaelJS
		// https://github.com/DmitryBaranovskiy/raphael/
		toRGB: function(h, s, b, a) {
			if (!h) {
				h = this.value.h;
				s = this.value.s;
				b = this.value.b;
			}
			h *= 360;
			var R, G, B, X, C;
			h = (h % 360) / 60;
			C = b * s;
			X = C * (1 - Math.abs(h % 2 - 1));
			R = G = B = b - C;

			h = ~~h;
			R += [C, X, 0, 0, X, C][h];
			G += [X, C, C, X, 0, 0][h];
			B += [0, 0, X, C, C, X][h];
			return {
				r: Math.round(R*255),
				g: Math.round(G*255),
				b: Math.round(B*255),
				a: a||this.value.a
			};
		},

		toHex: function(h, s, b, a){
			var rgb = this.toRGB(h, s, b, a);
			return '#'+((1 << 24) | (parseInt(rgb.r) << 16) | (parseInt(rgb.g) << 8) | parseInt(rgb.b)).toString(16).substr(1);
		},

		toHSL: function(h, s, b, a){
			if (!h) {
				h = this.value.h;
				s = this.value.s;
				b = this.value.b;
			}
			var H = h,
				L = (2 - s) * b,
				S = s * b;
			if (L > 0 && L <= 1) {
				S /= L;
			} else {
				S /= 2 - L;
			}
			L /= 2;
			if (S > 1) {
				S = 1;
			}
			return {
				h: H,
				s: S,
				l: L,
				a: a||this.value.a
			};
		}
	};

	// Picker object

	var Colorpicker = function(element, options){
		this.element = $(element);
		var format = options.format||this.element.data('color-format')||'hex';
		this.format = CPGlobal.translateFormats[format];
		this.isInput = this.element.is('input');
		this.component = this.element.is('.color') ? this.element.find('.ai1ec-input-group-addon') : false;

		this.picker = $(CPGlobal.template)
							.appendTo('body')
							.on('mousedown', $.proxy(this.mousedown, this));

		if (this.isInput) {
			this.element.on({
				'focus': $.proxy(this.show, this),
				'keyup': $.proxy(this.update, this)
			});
		} else if (this.component){
			this.component.on({
				'click': $.proxy(this.show, this)
			});
		} else {
			this.element.on({
				'click': $.proxy(this.show, this)
			});
		}
		if (format == 'rgba' || format == 'hsla') {
			this.picker.addClass('alpha');
			this.alpha = this.picker.find('.colorpicker-alpha')[0].style;
		}

		if (this.component){
			this.picker.find('.colorpicker-color').hide();
			this.preview = this.element.find('i')[0].style;
		} else {
			this.preview = this.picker.find('div:last')[0].style;
		}

		this.base = this.picker.find('div:first')[0].style;
		this.update();
	};

	Colorpicker.prototype = {
		constructor: Colorpicker,

		show: function(e) {
			this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.place();
			$(window).on('resize', $.proxy(this.place, this));
			if (!this.isInput) {
				if (e) {
					e.stopPropagation();
					e.preventDefault();
				}
			}
			$(document).on({
				'mousedown': $.proxy(this.hide, this)
			});
			this.element.trigger({
				type: 'show',
				color: this.color
			});
		},

		update: function(){
			this.color = new Color(this.isInput ? this.element.prop('value') : this.element.data('color'));
			this.picker.find('i')
				.eq(0).css({left: this.color.value.s*100, top: 100 - this.color.value.b*100}).end()
				.eq(1).css('top', 100 * (1 - this.color.value.h)).end()
				.eq(2).css('top', 100 * (1 - this.color.value.a));
			this.previewColor();
		},

		hide: function(){
			this.picker.hide();
			$(window).off('resize', this.place);
			if (!this.isInput) {
				$(document).off({
					'mousedown': this.hide
				});
				if (this.component){
					this.element.find('input').prop('value', this.format.call(this));
				}
				this.element.data('color', this.format.call(this));
			} else {
				this.element.prop('value', this.format.call(this));
			}
			this.element.trigger({
				type: 'hide',
				color: this.color
			});
		},

		place: function(){
			var offset = this.component ? this.component.offset() : this.element.offset();
			this.picker.css({
				top: offset.top + this.height,
				left: offset.left
			});
		},

		//preview color change
		previewColor: function(){
			this.preview.backgroundColor = this.format.call(this);
			//set the color for brightness/saturation slider
			this.base.backgroundColor = this.color.toHex(this.color.value.h, 1, 1, 1);
			//set te color for alpha slider
			if (this.alpha) {
				this.alpha.backgroundColor = this.color.toHex();
			}
		},

		pointer: null,

		slider: null,

		mousedown: function(e){
			e.stopPropagation();
			e.preventDefault();

			var target = $(e.target);

			//detect the slider and set the limits and callbacks
			var zone = target.closest('div');
			if (!zone.is('.colorpicker')) {
				if (zone.is('.colorpicker-saturation')) {
					this.slider = $.extend({}, CPGlobal.sliders['saturation']);
				}
				else if (zone.is('.colorpicker-hue')) {
					this.slider = $.extend({}, CPGlobal.sliders['hue']);
				}
				else if (zone.is('.colorpicker-alpha')) {
					this.slider = $.extend({}, CPGlobal.sliders['alpha']);
				}
				var offset = zone.offset();
				//reference to knob's style
				this.slider.knob = zone.find('i')[0].style;
				this.slider.left = e.pageX - offset.left;
				this.slider.top = e.pageY - offset.top;
				this.pointer = {
					left: e.pageX,
					top: e.pageY
				};
				//trigger mousemove to move the knob to the current position
				$(document).on({
					mousemove: $.proxy(this.mousemove, this),
					mouseup: $.proxy(this.mouseup, this)
				}).trigger('mousemove');
			}
			return false;
		},

		mousemove: function(e){
			e.stopPropagation();
			e.preventDefault();
			var left = Math.max(
				0,
				Math.min(
					this.slider.maxLeft,
					this.slider.left + ((e.pageX||this.pointer.left) - this.pointer.left)
				)
			);
			var top = Math.max(
				0,
				Math.min(
					this.slider.maxTop,
					this.slider.top + ((e.pageY||this.pointer.top) - this.pointer.top)
				)
			);
			this.slider.knob.left = left + 'px';
			this.slider.knob.top = top + 'px';
			if (this.slider.callLeft) {
				this.color[this.slider.callLeft].call(this.color, left/100);
			}
			if (this.slider.callTop) {
				this.color[this.slider.callTop].call(this.color, top/100);
			}
			this.previewColor();
			this.element.trigger({
				type: 'changeColor',
				color: this.color
			});
			return false;
		},

		mouseup: function(e){
			e.stopPropagation();
			e.preventDefault();
			$(document).off({
				mousemove: this.mousemove,
				mouseup: this.mouseup
			});
			return false;
		}
	}

	$.fn.colorpicker = function ( option ) {
		return this.each(function () {
			var $this = $(this),
				data = $this.data('colorpicker'),
				options = typeof option == 'object' && option;
			if (!data) {
				$this.data('colorpicker', (data = new Colorpicker(this, $.extend({}, $.fn.colorpicker.defaults,options))));
			}
			if (typeof option == 'string') data[option]();
		});
	};

	$.fn.colorpicker.defaults = {
	};

	$.fn.colorpicker.Constructor = Colorpicker;

	var CPGlobal = {

		// translate a format from Color object to a string
		translateFormats: {
			'rgb': function(){
				var rgb = this.color.toRGB();
				return 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
			},

			'rgba': function(){
				var rgb = this.color.toRGB();
				return 'rgba('+rgb.r+','+rgb.g+','+rgb.b+','+rgb.a+')';
			},

			'hsl': function(){
				var hsl = this.color.toHSL();
				return 'hsl('+Math.round(hsl.h*360)+','+Math.round(hsl.s*100)+'%,'+Math.round(hsl.l*100)+'%)';
			},

			'hsla': function(){
				var hsl = this.color.toHSL();
				return 'hsla('+Math.round(hsl.h*360)+','+Math.round(hsl.s*100)+'%,'+Math.round(hsl.l*100)+'%,'+hsl.a+')';
			},

			'hex': function(){
				return  this.color.toHex();
			}
		},

		sliders: {
			saturation: {
				maxLeft: 100,
				maxTop: 100,
				callLeft: 'setSaturation',
				callTop: 'setLightness'
			},

			hue: {
				maxLeft: 0,
				maxTop: 100,
				callLeft: false,
				callTop: 'setHue'
			},

			alpha: {
				maxLeft: 0,
				maxTop: 100,
				callLeft: false,
				callTop: 'setAlpha'
			}
		},

		// HSBtoRGB from RaphaelJS
		// https://github.com/DmitryBaranovskiy/raphael/
		RGBtoHSB: function (r, g, b, a){
			r /= 255;
			g /= 255;
			b /= 255;

			var H, S, V, C;
			V = Math.max(r, g, b);
			C = V - Math.min(r, g, b);
			H = (C == 0 ? null :
				 V == r ? (g - b) / C :
				 V == g ? (b - r) / C + 2 :
						  (r - g) / C + 4
				);
			H = ((H + 360) % 6) * 60 / 360;
			S = C == 0 ? 0 : C / V;
			return {h: H||1, s: S, b: V, a: a||1};
		},

		HueToRGB: function (p, q, h) {
			if (h < 0)
				h += 1;
			else if (h > 1)
				h -= 1;

			if ((h * 6) < 1)
				return p + (q - p) * h * 6;
			else if ((h * 2) < 1)
				return q;
			else if ((h * 3) < 2)
				return p + (q - p) * ((2 / 3) - h) * 6;
			else
				return p;
		},

		HSLtoRGB: function (h, s, l, a)
		{

			if (s < 0)
				s = 0;

			if (l <= 0.5)
				var q = l * (1 + s);
			else
				var q = l + s - (l * s);

			var p = 2 * l - q;

			var tr = h + (1 / 3);
			var tg = h;
			var tb = h - (1 / 3);

			var r = Math.round(CPGlobal.HueToRGB(p, q, tr) * 255);
			var g = Math.round(CPGlobal.HueToRGB(p, q, tg) * 255);
			var b = Math.round(CPGlobal.HueToRGB(p, q, tb) * 255);
			return [r, g, b, a||1];
		},

		// a set of RE's that can match strings and generate color tuples.
		// from John Resig color plugin
		// https://github.com/jquery/jquery-color/
		stringParsers: [
			{
				re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						execResult[ 1 ],
						execResult[ 2 ],
						execResult[ 3 ],
						execResult[ 4 ]
					];
				}
			}, {
				re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				parse: function( execResult ) {
					return [
						2.55 * execResult[1],
						2.55 * execResult[2],
						2.55 * execResult[3],
						execResult[ 4 ]
					];
				}
			}, {
				re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
				parse: function( execResult ) {
					return [
						parseInt( execResult[ 1 ], 16 ),
						parseInt( execResult[ 2 ], 16 ),
						parseInt( execResult[ 3 ], 16 )
					];
				}
			}, {
				re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
				parse: function( execResult ) {
					return [
						parseInt( execResult[ 1 ] + execResult[ 1 ], 16 ),
						parseInt( execResult[ 2 ] + execResult[ 2 ], 16 ),
						parseInt( execResult[ 3 ] + execResult[ 3 ], 16 )
					];
				}
			}, {
				re: /hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
				space: 'hsla',
				parse: function( execResult ) {
					return [
						execResult[1]/360,
						execResult[2] / 100,
						execResult[3] / 100,
						execResult[4]
					];
				}
			}
		],
		template: '<div class="colorpicker ai1ec-dropdown-menu">'+
							'<div class="colorpicker-saturation"><i><b></b></i></div>'+
							'<div class="colorpicker-hue"><i></i></div>'+
							'<div class="colorpicker-alpha"><i></i></div>'+
							'<div class="colorpicker-color"><div /></div>'+
						'</div>'
	};
});

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

timely.define('scripts/less_variables_editing',
	[
		"jquery_timely",
		"domReady",
		"ai1ec_config",
		"libs/utils",
		"external_libs/bootstrap_colorpicker",
		"external_libs/bootstrap/tab",
		"external_libs/jquery_cookie"
	],
	function( $, domReady, ai1ec_config, utils ) {
	 // jshint ;_;

	var handle_set_tab_cookie = function( e ) {
		var active = $( this ).attr( 'href' );
		$.cookie( 'less_variables_active_tab', active );
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

	var handle_custom_fonts = function() {
		if( $( this ).val() === 'custom' ) {
			$( this )
				.closest( '.ai1ec-form-group' )
				.find( '.ai1ec-custom-font' )
				.removeClass( 'ai1ec-hide' );
		} else {
			$( this )
				.closest( '.ai1ec-form-group' )
				.find( '.ai1ec-custom-font' )
				.addClass( 'ai1ec-hide' );
		}
	};

	/**
	 * Ask user to confirm resetting their theme options.
	 *
	 * @return {boolean} True if should proceed with click, false otherwise
	 */
	var confirm_on_reset = function() {
		return window.confirm( ai1ec_config.confirm_reset_theme );
	};

	/**
	 * Validate any fields that require it, such as CSS length values.
	 */
	var validate = function() {
		var valid = true;

		$( '.ai1ec-less-variable-size' ).each( function() {
			var $field = $( this )
			  , $control = $field.closest( '.ai1ec-form-group' )
			  , val = $.trim( $field.val() )

			$control.removeClass( 'ai1ec-has-warning' );
			if ( '' === val ) {
				return;
			}

			// Regexp found here:
			// http://www.shamasis.net/2009/07/regular-expression-to-validate-css-length-and-position-values/
			var regexp = /^auto$|^[+-]?[0-9]+\.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)?$/ig;
			if ( ! regexp.test( val ) ) {
				valid = false;

				// Activate tab that this control is on and toggle its error status.
				var id = $control.closest( '.ai1ec-tab-pane' ).attr( 'id' );
				$control.closest( '.ai1ec-tabbable' )
					.find( 'a[data-toggle="ai1ec-tab"][href="#' + id + '"]' )
					.trigger( 'click' );
				$control.addClass( 'ai1ec-has-warning' );

				// Notify the user.
				window.alert( ai1ec_config.size_less_variable_not_ok );

				// Bring focus to the offending field.
				$field.trigger( 'focus' );
				return false;
			}
		} );

		return valid;
	};

	domReady( function() {
		$( '.colorpickers' ).colorpicker();

		utils.activate_saved_tab_on_page_load( $.cookie( 'less_variables_active_tab' ) );

		// Register event handlers.
		$( document )
			.on( 'click',  'ul.ai1ec-nav a',             handle_set_tab_cookie )
			.on( 'click',  '#ai1ec_reset_themes_options',    confirm_on_reset )
			.on( 'change', '.ai1ec_font',               handle_custom_fonts );
		$( '#ai1ec_save_themes_options' ).closest( 'form' ).on( 'submit', validate );
	} );
});

timely.require(
		[ "scripts/less_variables_editing" ]
);
timely.define("pages/less_variables_editing", function(){});
