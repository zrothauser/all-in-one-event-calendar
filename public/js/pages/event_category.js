
timely.define('external_libs/colorpicker', 
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
	var ColorPicker = function () {
		var
			ids = {},
			inAction,
			charMin = 65,
			visible,
			tpl = '<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>',
			defaults = {
				eventName: 'click',
				onShow: function () {},
				onBeforeShow: function(){},
				onHide: function () {},
				onChange: function () {},
				onSubmit: function () {},
				color: 'ff0000',
				livePreview: true,
				flat: false
			},
			fillRGBFields = function  (hsb, cal) {
				var rgb = HSBToRGB(hsb);
				$(cal).data('colorpicker').fields
					.eq(1).val(rgb.r).end()
					.eq(2).val(rgb.g).end()
					.eq(3).val(rgb.b).end();
			},
			fillHSBFields = function  (hsb, cal) {
				$(cal).data('colorpicker').fields
					.eq(4).val(hsb.h).end()
					.eq(5).val(hsb.s).end()
					.eq(6).val(hsb.b).end();
			},
			fillHexFields = function (hsb, cal) {
				$(cal).data('colorpicker').fields
					.eq(0).val(HSBToHex(hsb)).end();
			},
			setSelector = function (hsb, cal) {
				$(cal).data('colorpicker').selector.css('backgroundColor', '#' + HSBToHex({h: hsb.h, s: 100, b: 100}));
				$(cal).data('colorpicker').selectorIndic.css({
					left: parseInt(150 * hsb.s/100, 10),
					top: parseInt(150 * (100-hsb.b)/100, 10)
				});
			},
			setHue = function (hsb, cal) {
				$(cal).data('colorpicker').hue.css('top', parseInt(150 - 150 * hsb.h/360, 10));
			},
			setCurrentColor = function (hsb, cal) {
				$(cal).data('colorpicker').currentColor.css('backgroundColor', '#' + HSBToHex(hsb));
			},
			setNewColor = function (hsb, cal) {
				$(cal).data('colorpicker').newColor.css('backgroundColor', '#' + HSBToHex(hsb));
			},
			keyDown = function (ev) {
				var pressedKey = ev.charCode || ev.keyCode || -1;
				if ((pressedKey > charMin && pressedKey <= 90) || pressedKey == 32) {
					return false;
				}
				var cal = $(this).parent().parent();
				if (cal.data('colorpicker').livePreview === true) {
					change.apply(this);
				}
			},
			change = function (ev) {
				var cal = $(this).parent().parent(), col;
				if (this.parentNode.className.indexOf('_hex') > 0) {
					cal.data('colorpicker').color = col = HexToHSB(fixHex(this.value));
				} else if (this.parentNode.className.indexOf('_hsb') > 0) {
					cal.data('colorpicker').color = col = fixHSB({
						h: parseInt(cal.data('colorpicker').fields.eq(4).val(), 10),
						s: parseInt(cal.data('colorpicker').fields.eq(5).val(), 10),
						b: parseInt(cal.data('colorpicker').fields.eq(6).val(), 10)
					});
				} else {
					cal.data('colorpicker').color = col = RGBToHSB(fixRGB({
						r: parseInt(cal.data('colorpicker').fields.eq(1).val(), 10),
						g: parseInt(cal.data('colorpicker').fields.eq(2).val(), 10),
						b: parseInt(cal.data('colorpicker').fields.eq(3).val(), 10)
					}));
				}
				if (ev) {
					fillRGBFields(col, cal.get(0));
					fillHexFields(col, cal.get(0));
					fillHSBFields(col, cal.get(0));
				}
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColor(col, cal.get(0));
				cal.data('colorpicker').onChange.apply(cal, [col, HSBToHex(col), HSBToRGB(col)]);
			},
			blur = function (ev) {
				var cal = $(this).parent().parent();
				cal.data('colorpicker').fields.parent().removeClass('colorpicker_focus');
			},
			focus = function () {
				charMin = this.parentNode.className.indexOf('_hex') > 0 ? 70 : 65;
				$(this).parent().parent().data('colorpicker').fields.parent().removeClass('colorpicker_focus');
				$(this).parent().addClass('colorpicker_focus');
			},
			downIncrement = function (ev) {
				var field = $(this).parent().find('input').focus();
				var current = {
					el: $(this).parent().addClass('colorpicker_slider'),
					max: this.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (this.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
					y: ev.pageY,
					field: field,
					val: parseInt(field.val(), 10),
					preview: $(this).parent().parent().data('colorpicker').livePreview
				};
				$(document).bind('mouseup', current, upIncrement);
				$(document).bind('mousemove', current, moveIncrement);
			},
			moveIncrement = function (ev) {
				ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
				if (ev.data.preview) {
					change.apply(ev.data.field.get(0), [true]);
				}
				return false;
			},
			upIncrement = function (ev) {
				change.apply(ev.data.field.get(0), [true]);
				ev.data.el.removeClass('colorpicker_slider').find('input').focus();
				$(document).unbind('mouseup', upIncrement);
				$(document).unbind('mousemove', moveIncrement);
				return false;
			},
			downHue = function (ev) {
				var current = {
					cal: $(this).parent(),
					y: $(this).offset().top
				};
				current.preview = current.cal.data('colorpicker').livePreview;
				$(document).bind('mouseup', current, upHue);
				$(document).bind('mousemove', current, moveHue);
			},
			moveHue = function (ev) {
				change.apply(
					ev.data.cal.data('colorpicker')
						.fields
						.eq(4)
						.val(parseInt(360*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.y))))/150, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upHue = function (ev) {
				fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				$(document).unbind('mouseup', upHue);
				$(document).unbind('mousemove', moveHue);
				return false;
			},
			downSelector = function (ev) {
				var current = {
					cal: $(this).parent(),
					pos: $(this).offset()
				};
				current.preview = current.cal.data('colorpicker').livePreview;
				$(document).bind('mouseup', current, upSelector);
				$(document).bind('mousemove', current, moveSelector);
			},
			moveSelector = function (ev) {
				change.apply(
					ev.data.cal.data('colorpicker')
						.fields
						.eq(6)
						.val(parseInt(100*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.pos.top))))/150, 10))
						.end()
						.eq(5)
						.val(parseInt(100*(Math.max(0,Math.min(150,(ev.pageX - ev.data.pos.left))))/150, 10))
						.get(0),
					[ev.data.preview]
				);
				return false;
			},
			upSelector = function (ev) {
				fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
				$(document).unbind('mouseup', upSelector);
				$(document).unbind('mousemove', moveSelector);
				return false;
			},
			enterSubmit = function (ev) {
				$(this).addClass('colorpicker_focus');
			},
			leaveSubmit = function (ev) {
				$(this).removeClass('colorpicker_focus');
			},
			clickSubmit = function (ev) {
				var cal = $(this).parent();
				var col = cal.data('colorpicker').color;
				cal.data('colorpicker').origColor = col;
				setCurrentColor(col, cal.get(0));
				cal.data('colorpicker').onSubmit(col, HSBToHex(col), HSBToRGB(col), cal.data('colorpicker').el);
			},
			show = function (ev) {
				var cal = $('#' + $(this).data('colorpickerId'));
				cal.data('colorpicker').onBeforeShow.apply(this, [cal.get(0)]);
				var pos = $(this).offset();
				var viewPort = getViewport();
				var fs_offset = $( '#tag-color' ).offset();
				var top = (fs_offset.top) + $( '#tag-color' ).height() ;
				var left = (fs_offset.left + 1);
				cal.css({left: left + 'px', top: top + 'px'});
				if (cal.data('colorpicker').onShow.apply(this, [cal.get(0)]) != false) {
					cal.show();
				}
				$(document).bind('mousedown', {cal: cal}, hide);
				return false;
			},
			hide = function (ev) {
				if (!isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
					if (ev.data.cal.data('colorpicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
						ev.data.cal.hide();
					}
					$(document).unbind('mousedown', hide);
				}
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
			getViewport = function () {
				var m = document.compatMode == 'CSS1Compat';
				return {
					l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
					t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
					w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
					h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
				};
			},
			fixHSB = function (hsb) {
				return {
					h: Math.min(360, Math.max(0, hsb.h)),
					s: Math.min(100, Math.max(0, hsb.s)),
					b: Math.min(100, Math.max(0, hsb.b))
				};
			},
			fixRGB = function (rgb) {
				return {
					r: Math.min(255, Math.max(0, rgb.r)),
					g: Math.min(255, Math.max(0, rgb.g)),
					b: Math.min(255, Math.max(0, rgb.b))
				};
			},
			fixHex = function (hex) {
				var len = 6 - hex.length;
				if (len > 0) {
					var o = [];
					for (var i=0; i<len; i++) {
						o.push('0');
					}
					o.push(hex);
					hex = o.join('');
				}
				return hex;
			},
			HexToRGB = function (hex) {
				var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
				return {r: hex >> 16, g: (hex & 0x00FF00) >> 8, b: (hex & 0x0000FF)};
			},
			HexToHSB = function (hex) {
				return RGBToHSB(HexToRGB(hex));
			},
			RGBToHSB = function (rgb) {
				var hsb = {
					h: 0,
					s: 0,
					b: 0
				};
				var min = Math.min(rgb.r, rgb.g, rgb.b);
				var max = Math.max(rgb.r, rgb.g, rgb.b);
				var delta = max - min;
				hsb.b = max;
				if (max != 0) {
	
				}
				hsb.s = max != 0 ? 255 * delta / max : 0;
				if (hsb.s != 0) {
					if (rgb.r == max) {
						hsb.h = (rgb.g - rgb.b) / delta;
					} else if (rgb.g == max) {
						hsb.h = 2 + (rgb.b - rgb.r) / delta;
					} else {
						hsb.h = 4 + (rgb.r - rgb.g) / delta;
					}
				} else {
					hsb.h = -1;
				}
				hsb.h *= 60;
				if (hsb.h < 0) {
					hsb.h += 360;
				}
				hsb.s *= 100/255;
				hsb.b *= 100/255;
				return hsb;
			},
			HSBToRGB = function (hsb) {
				var rgb = {};
				var h = Math.round(hsb.h);
				var s = Math.round(hsb.s*255/100);
				var v = Math.round(hsb.b*255/100);
				if(s == 0) {
					rgb.r = rgb.g = rgb.b = v;
				} else {
					var t1 = v;
					var t2 = (255-s)*v/255;
					var t3 = (t1-t2)*(h%60)/60;
					if(h==360) h = 0;
					if(h<60) {rgb.r=t1;	rgb.b=t2; rgb.g=t2+t3}
					else if(h<120) {rgb.g=t1; rgb.b=t2;	rgb.r=t1-t3}
					else if(h<180) {rgb.g=t1; rgb.r=t2;	rgb.b=t2+t3}
					else if(h<240) {rgb.b=t1; rgb.r=t2;	rgb.g=t1-t3}
					else if(h<300) {rgb.b=t1; rgb.g=t2;	rgb.r=t2+t3}
					else if(h<360) {rgb.r=t1; rgb.g=t2;	rgb.b=t1-t3}
					else {rgb.r=0; rgb.g=0;	rgb.b=0}
				}
				return {r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b)};
			},
			RGBToHex = function (rgb) {
				var hex = [
					rgb.r.toString(16),
					rgb.g.toString(16),
					rgb.b.toString(16)
				];
				$.each(hex, function (nr, val) {
					if (val.length == 1) {
						hex[nr] = '0' + val;
					}
				});
				return hex.join('');
			},
			HSBToHex = function (hsb) {
				return RGBToHex(HSBToRGB(hsb));
			},
			restoreOriginal = function () {
				var cal = $(this).parent();
				var col = cal.data('colorpicker').origColor;
				cal.data('colorpicker').color = col;
				fillRGBFields(col, cal.get(0));
				fillHexFields(col, cal.get(0));
				fillHSBFields(col, cal.get(0));
				setSelector(col, cal.get(0));
				setHue(col, cal.get(0));
				setNewColor(col, cal.get(0));
			};
		return {
			init: function (opt) {
				opt = $.extend({}, defaults, opt||{});
				if (typeof opt.color == 'string') {
					opt.color = HexToHSB(opt.color);
				} else if (opt.color.r != undefined && opt.color.g != undefined && opt.color.b != undefined) {
					opt.color = RGBToHSB(opt.color);
				} else if (opt.color.h != undefined && opt.color.s != undefined && opt.color.b != undefined) {
					opt.color = fixHSB(opt.color);
				} else {
					return this;
				}
				return this.each(function () {
					if (!$(this).data('colorpickerId')) {
						var options = $.extend({}, opt);
						options.origColor = opt.color;
						var id = 'collorpicker_' + parseInt(Math.random() * 1000);
						$(this).data('colorpickerId', id);
						var cal = $(tpl).attr('id', id);
						if (options.flat) {
							cal.appendTo(this).show();
						} else {
							cal.appendTo(document.body);
						}
						options.fields = cal
											.find('input')
												.bind('keyup', keyDown)
												.bind('change', change)
												.bind('blur', blur)
												.bind('focus', focus);
						cal
							.find('span').bind('mousedown', downIncrement).end()
							.find('>div.colorpicker_current_color').bind('click', restoreOriginal);
						options.selector = cal.find('div.colorpicker_color').bind('mousedown', downSelector);
						options.selectorIndic = options.selector.find('div div');
						options.el = this;
						options.hue = cal.find('div.colorpicker_hue div');
						cal.find('div.colorpicker_hue').bind('mousedown', downHue);
						options.newColor = cal.find('div.colorpicker_new_color');
						options.currentColor = cal.find('div.colorpicker_current_color');
						cal.data('colorpicker', options);
						cal.find('div.colorpicker_submit')
							.bind('mouseenter', enterSubmit)
							.bind('mouseleave', leaveSubmit)
							.bind('click', clickSubmit);
						fillRGBFields(options.color, cal.get(0));
						fillHSBFields(options.color, cal.get(0));
						fillHexFields(options.color, cal.get(0));
						setHue(options.color, cal.get(0));
						setSelector(options.color, cal.get(0));
						setCurrentColor(options.color, cal.get(0));
						setNewColor(options.color, cal.get(0));
						if (options.flat) {
							cal.css({
								position: 'relative',
								display: 'block'
							});
						} else {
							$(this).bind(options.eventName, show);
						}
					}
				});
			},
			showPicker: function() {
				return this.each( function () {
					if ($(this).data('colorpickerId')) {
						show.apply(this);
					}
				});
			},
			hidePicker: function() {
				return this.each( function () {
					if ($(this).data('colorpickerId')) {
						$('#' + $(this).data('colorpickerId')).hide();
					}
				});
			},
			setColor: function(col) {
				if (typeof col == 'string') {
					col = HexToHSB(col);
				} else if (col.r != undefined && col.g != undefined && col.b != undefined) {
					col = RGBToHSB(col);
				} else if (col.h != undefined && col.s != undefined && col.b != undefined) {
					col = fixHSB(col);
				} else {
					return this;
				}
				return this.each(function(){
					if ($(this).data('colorpickerId')) {
						var cal = $('#' + $(this).data('colorpickerId'));
						cal.data('colorpicker').color = col;
						cal.data('colorpicker').origColor = col;
						fillRGBFields(col, cal.get(0));
						fillHSBFields(col, cal.get(0));
						fillHexFields(col, cal.get(0));
						setHue(col, cal.get(0));
						setSelector(col, cal.get(0));
						setCurrentColor(col, cal.get(0));
						setNewColor(col, cal.get(0));
					}
				});
			}
		};
	}();
	$.fn.extend({
		ColorPicker: ColorPicker.init,
		ColorPickerHide: ColorPicker.hidePicker,
		ColorPickerShow: ColorPicker.showPicker,
		ColorPickerSetColor: ColorPicker.setColor
	});
} );
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
    'use strict';

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

timely.define('external_libs/tax_meta_class',
		[
		 "jquery_timely",
		 "domReady"
		 ],
		 function( $, domReady ) {
	function update_repeater_fields(){


		/**
		 * Datepicker Field.
		 *
		 * @since 1.0
		 */
		$('.at-date').each( function() {

			var $this  = $(this),
			format = $this.attr('rel');

			$this.datepicker( { showButtonPanel: true, dateFormat: format } );

		});

		/**
		 * Timepicker Field.
		 *
		 * @since 1.0
		 */
		$('.at-time').each( function() {

			var $this   = $(this),
			format   = $this.attr('rel');

			$this.timepicker( { showSecond: true, timeFormat: format } );

		});

		/**
		 * Colorpicker Field.
		 *
		 * @since 1.0
		 */
		/*



/**
		 * Select Color Field.
		 *
		 * @since 1.0
		 */
		$('.at-color-select').click( function(){
			var $this = $(this);
			var id = $this.attr('rel');
			$(this).siblings('.at-color-picker').farbtastic("#" + id).toggle();
			return false;
		});

		/**
		 * Delete File.
		 *
		 * @since 1.0
		 */
		$('.at-upload').delegate( '.at-delete-file', 'click' , function() {

			var $this   = $(this),
			$parent = $this.parent(),
			data = $this.attr('rel');

			$.post( ajaxurl, { action: 'at_delete_file', data: data }, function(response) {
				response == '0' ? ( alert( 'File has been successfully deleted.' ), $parent.remove() ) : alert( 'You do NOT have permission to delete this file.' );
			});

			return false;

		});

		/**
		 * Reorder Images.
		 *
		 * @since 1.0
		 */
		$('.at-images').each( function() {

			var $this = $(this), order, data;

			$this.sortable( {
				placeholder: 'ui-state-highlight',
				update: function (){
					order = $this.sortable('serialize');
					data   = order + '|' + $this.siblings('.at-images-data').val();

					$.post(ajaxurl, {action: 'at_reorder_images', data: data}, function(response){
						response == '0' ? alert( 'Order saved!' ) : alert( "You don't have permission to reorder images." );
					});
				}
			});

		});

	}
	domReady( function() {

		/**
		 * repater Field
		 * @since 1.1
		 */
		/*$( ".at-repeater-item" ).live('click', function() {
		    var $this  = $(this);
		    $this.siblings().toggle();
		  });
		  jQuery(".at-repater-block").click(function(){
		    jQuery(this).find('table').toggle();
		  });

		 */
		//edit
		$( document ).on('click', ".at-re-toggle", function() {
			$(this).prev().toggle('slow');
		});


		/**
		 * Datepicker Field.
		 *
		 * @since 1.0
		 */
		$('.at-date').each( function() {

			var $this  = $(this),
			format = $this.attr('rel');

			$this.datepicker( { showButtonPanel: true, dateFormat: format } );

		});

		/**
		 * Timepicker Field.
		 *
		 * @since 1.0
		 */
		$('.at-time').each( function() {

			var $this   = $(this),
			format   = $this.attr('rel');

			$this.timepicker( { showSecond: true, timeFormat: format } );

		});

		/**
		 * Colorpicker Field.
		 *
		 * @since 1.0
		 * better handler for color picker with repeater fields support
		 * which now works both when button is clicked and when field gains focus.
		 */
		$(document).on('focus', '.at-color', function() {
			var $this = $(this);
			$(this).siblings('.at-color-picker').farbtastic($this).toggle();
		});

		$(document).on('focusout', '.at-color', function() {
			var $this = $(this);
			$(this).siblings('.at-color-picker').farbtastic($this).toggle();
		});

		/**
		 * Add Files.
		 *
		 * @since 1.0
		 */
		$('.at-add-file').click( function() {
			var $first = $(this).parent().find('.file-input:first');
			$first.clone().insertAfter($first).show();
			return false;
		});

		/**
		 * Delete File.
		 *
		 * @since 1.0
		 */
		$('.at-upload').delegate( '.at-delete-file', 'click' , function() {

			var $this   = $(this),
			$parent = $this.parent(),
			data = $this.attr('rel');

			var ind = $(this).index()
			$.post( ajaxurl, { action: 'at_delete_file', data: data, tag_id: get_query_var('tag_ID') }, function(response) {
				response == '0' ? ( alert( 'File has been successfully deleted.' ), $parent.remove() ) : alert( 'You do NOT have permission to delete this file.' );
			});

			return false;

		});


		/**
		 * Helper Function
		 *
		 * Get Query string value by name.
		 *
		 * @since 1.0
		 */
		function get_query_var( name ) {

			var match = RegExp('[?&]' + name + '=([^&#]*)').exec(location.href);
			return match && decodeURIComponent(match[1].replace(/\+/g, ' '));

		}

		//new image upload field
		function load_images_muploader(){
			jQuery(".mupload_img_holder").each(function(i,v){
				if (jQuery(this).next().next().val() != ''){
					if (!jQuery(this).children().size() > 0){
						jQuery(this).append('<img src="' + jQuery(this).next().next().val() + '" style="height: 150px;width: 150px;" />');
						jQuery(this).next().next().next().val("Delete");
						jQuery(this).next().next().next().removeClass('at-upload_image_button').addClass('at-delete_image_button');
					}
				}
			});
		}

		load_images_muploader();
		//delete img button
		jQuery( document ).on('click', '.at-delete_image_button', function(e){
			var field_id = jQuery(this).attr("rel");
			var at_id = jQuery(this).prev().prev();
			var at_src = jQuery(this).prev();
			var t_button = jQuery(this);
			data = {
					action: 'at_delete_mupload',
					_wpnonce: $('#nonce-delete-mupload_' + field_id).val(),
					post_id: get_query_var('tag_ID'),
					field_id: field_id,
					attachment_id: jQuery(at_id).val()
			};

			$.getJSON(ajaxurl, data, function(response) {
				if ('success' == response.status){
					jQuery(t_button).val("Add Image");
					jQuery(t_button).removeClass('at-delete_image_button').addClass('at-upload_image_button');
					//clear html values
					jQuery(at_id).val('');
					jQuery(at_src).val('');
					jQuery(at_id).prev().html('');
					load_images_muploader();
				}else{
					alert(response.message);
				}
			});

			return false;
		});


		//upload button
		var formfield1;
		var formfield2;
		jQuery(document).on('click', '.at-upload_image_button', function(e){
			formfield1 = jQuery(this).prev();
			formfield2 = jQuery(this).prev().prev();      
			tb_show('', 'media-upload.php?post_id=0&type=image&amp;TB_iframe=true&tax_meta_c=instopo');

			//cleanup the meadi uploader
			tbframe_interval = setInterval(function() {

				//remove url, alignment and size fields- auto set to null, none and full respectively                        
				$('#TB_iframeContent').contents().find('.url').hide();
				$('#TB_iframeContent').contents().find('.align').hide();
				$('#TB_iframeContent').contents().find('.image_alt').hide();
				$('#TB_iframeContent').contents().find('.post_excerpt').hide();
				$('#TB_iframeContent').contents().find('.post_content').hide();
				$('#TB_iframeContent').contents().find('.image-size').hide();
				$('#TB_iframeContent').contents().find('[value="Insert into Post"]').val('Use this image');

			}, 2000);

			//store old send to editor function
			window.restore_send_to_editor = window.send_to_editor;
			//overwrite send to editor function
			window.send_to_editor = function(html) {
				imgurl = jQuery('img',html).attr('src');
				img_calsses = jQuery('img',html).attr('class').split(" ");
				att_id = '';
				jQuery.each(img_calsses,function(i,val){
					if (val.indexOf("wp-image") != -1){
						att_id = val.replace('wp-image-', "");
					}
				});

				jQuery(formfield2).val(att_id);
				jQuery(formfield1).val(imgurl);
				load_images_muploader();
				tb_remove();
				//restore old send to editor function
				window.send_to_editor = window.restore_send_to_editor;
			}
			return false;
		});

	} );
});
timely.define('scripts/event_category',
		[
		 "jquery_timely",
		 "external_libs/colorpicker",
		 "external_libs/tax_meta_class"
		 ],
		 function( $ ) {
	"use strict"; // jshint ;_;
$( '#tag-color' ).click( function() {
	var fs_offset = $( '#tag-color' ).offset();
	var top = fs_offset.top + $( '#tag-color' ).height() ;
	var left = fs_offset.left + 1;
	var ul_el = $( '<ul></ul>');
	var li_els = $(
		'<li style="color: #60a;" class="color-1"></li>' + // 1
		'<li style="color: #807;" class="color-2"></li>' + // 2
		'<li style="color: #920;" class="color-3"></li>' + // 3
		'<li style="color: #a60;" class="color-4"></li>' + // 4
		'<li style="color: #990;" class="color-5"></li>' + // 5
		'<li style="color: #080;" class="color-6"></li>' + // 6
		'<li style="color: #077;" class="color-7"></li>' + // 7
		'<li style="color: #00a;" class="color-8"></li>' + // 8
		'<li style="color: #000;" class="color-9"></li>' + // 9
		'<li style="color: #444;" class="color-10"></li>' + // 10
		'<li style="color: #85e;" class="color-11"></li>' + // 11
		'<li style="color: #d5d;" class="color-12"></li>' + // 12
		'<li style="color: #d43;" class="color-13"></li>' + // 13
		'<li style="color: #d90;" class="color-14"></li>' + // 14
		'<li style="color: #bb0;" class="color-15"></li>' + // 15
		'<li style="color: #2b0;" class="color-16"></li>' + // 16
		'<li style="color: #0ba;" class="color-17"></li>' + // 17
		'<li style="color: #26d;" class="color-18"></li>' + // 18
		'<li style="color: #777;" class="color-19"></li>' + // 19
		'<li style="color: #aaa;" class="color-20"></li>' + // 20
		'<li style="color: #aab;" class="color-21"></li>'   // 21
	);
	var more_color = $( '<li class="select-more-colors">More colors</li>' );
	$( more_color ).ColorPicker({
		onSubmit: function( hsb, hex, rgb, el ) {
			$( '#tag-color-background' ).css( 'background-color', '#' + hex );
			$( '#tag-color-value' ).val( '#' + hex );
			$(el).ColorPickerHide();
			ul_el.remove();
		},
		onBeforeShow: function () {
			ul_el.hide();
			$( document ).unbind( 'mousedown', hide_color_selector );
			var color = $( '#tag-color-value' ).val();
			color = color.length > 0 ? color : '#ffffff';
			$( this ).ColorPickerSetColor( color );
		}
	});
	// Add click event for each font style
	li_els.click( function() {
		if( rgb2hex( $(this).css( 'color' ) ) !== "#aaaabb" ){
			$( '#tag-color-background' ).css( 'background-color', $(this).css( 'color' ) );
			$( '#tag-color-value' ).val( rgb2hex( $(this).css( 'color' ) )  );
			ul_el.remove();
		}
		else{
			$( '#tag-color-background' ).css( 'background-color', "" );
			$( '#tag-color-value' ).val( "" );
			ul_el.remove();
		}
	});

	// append li elements to the ul holder
	ul_el.append( li_els ).append( more_color );

	// append ul holder to the body
	ul_el
	.appendTo( 'body' )
	.css( {
		position: 'absolute',
		top: top + 'px',
		left: left + 'px',
		width: '105px',
		height: '70px',
		'z-index': 1,
		background: '#fff',
		border: '1px solid #ccc'
	})
	.addClass( 'colorpicker-list' );
	$( document ).bind( 'mousedown', {ls: ul_el}, hide_color_selector );
});

// remove category color click
$( "#tag-color-value-remove" ).click(function(){
	$( "#tag-color-background" ).css( "background-color","" );
	$( "#tag-color-value" ).val("");
});

var rgb2hex = function( rgb ) {
	rgb = rgb.match( /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/ );
	return "#" + hex( rgb[1] ) + hex( rgb[2] ) + hex( rgb[3] );
};

var hex = function( x ) {
	return ( "0" + parseInt( x, 10 ).toString( 16 ) ).slice( -2 );
};

var hide_color_selector = function( ev ) {
	if( ! is_child_of( ev.data.ls.get( 0 ), ev.target, ev.data.ls.get( 0 ) ) ) {
		$( ev.data.ls.get(0) ).remove();
		$( document ).unbind( 'mousedown', hide_color_selector );
	}
};
var is_child_of = function( parentEl, el, container ) {
	/*jshint bitwise: false */
	if( parentEl === el ){
		return true;
	}

	if( parentEl.contains ) {
		return parentEl.contains( el );
	}

	if( parentEl.compareDocumentPosition ) {
		return !!(parentEl.compareDocumentPosition(el) & 16);
	}

	var prEl = el.parentNode;
	while( prEl && prEl !== container ) {
		if( prEl === parentEl ) {
			return true;
		}
		prEl = prEl.parentNode;
	}
	return false;
};
} );

timely.require(
		[ "scripts/event_category" ]
);
timely.define("pages/event_category", function(){});
