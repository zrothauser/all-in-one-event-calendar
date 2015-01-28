
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
 * Bootstrap: affix.js v3.1.1
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


timely.define('external_libs/bootstrap/affix', ["jquery_timely"], function( $ ) {  // jshint ;_;

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    this.$window = $(window)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      =
    this.unpin        =
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.RESET = 'ai1ec-affix ai1ec-affix-top ai1ec-affix-bottom'

  Affix.DEFAULTS = {
    offset: 0
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('ai1ec-affix')
    var scrollTop = this.$window.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var scrollHeight = $(document).height()
    var scrollTop    = this.$window.scrollTop()
    var position     = this.$element.offset()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom

    if (this.affixed == 'top') position.top += scrollTop

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.unpin   != null && (scrollTop + this.unpin <= position.top) ? false :
                offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
                offsetTop    != null && (scrollTop <= offsetTop) ? 'top' : false

    if (this.affixed === affix) return
    if (this.unpin) this.$element.css('top', '')

    var affixType = 'ai1ec-affix' + (affix ? '-' + affix : '')
    var e         = $.Event(affixType + '.bs.affix')

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))

    if (affix == 'bottom') {
      this.$element.offset({ top: scrollHeight - offsetBottom - this.$element.height() })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  var old = $.fn.affix

  $.fn.affix = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="ai1ec-affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop)    data.offset.top    = data.offsetTop

      $spy.affix(data)
    })
  })

} )
;
timely.define('scripts/common_scripts/frontend/common_event_handlers',
	[
		"jquery_timely",
		"external_libs/bootstrap/affix",
	],
	function( $ ) {
	 // jshint ;_;

	/**
	 * Handler for popover trigger: mouseenter.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_popover_over = function( e ) {
		var $this = $( this ),
				$pop_content = $this.next( '.ai1ec-popup' ),
				el_content_data, el_classes_data, popover_placement;

		// If no popover found, quit.
		if ( $pop_content.length === 0 ) {
			return;
		}

		el_content_data = $pop_content.html();
		el_classes_data = $pop_content.attr( 'class' );

		// Position popover to the left only if there's room for it within the
		// bounds of the view (popovers are 182 pixels wide, a product of padding
		// and inner width as defined in style.less).
		var $bounds = $this.closest( '#ai1ec-calendar-view' );
		if ( $bounds.length === 0 ) {
			$bounds = $( 'body' );
		}
		if ( $this.offset().left - $bounds.offset().left > 182 ) {
			popover_placement = 'left';
		} else {
			popover_placement = 'right';
		}

		$this.constrained_popover( {
			content: el_content_data,
			title: '',
			placement: popover_placement,
			trigger: 'manual',
			html: true,
			template:
				'<div class="timely ai1ec-popover ' + el_classes_data + '">' +
					'<div class="ai1ec-arrow"></div>' +
					'<div class="ai1ec-popover-inner">' +
						'<div class="ai1ec-popover-content"><div></div></div>' +
					'</div>' +
				'</div>',
			container: 'body'
		}).constrained_popover( 'show' );
	};

	/**
	 * Handler for popover trigger: mouseleave. Remove popup if entering an
	 * element that is not the popup.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_popover_out = function( e ) {
		var $el = $( e.toElement || e.relatedTarget );
		// If an ancestor of element being entered is not a popup, hide popover.
		if ( $el.closest( '.ai1ec-popup' ).length === 0 ) {
			$( this ).constrained_popover( 'hide' );
		}
	};

	/**
	 * Handler for popover; remove the popover on mouseleave of itself. Hide popup
	 * if entering an element that is not a tooltip.
	 * Also remove any visible tooltip if removing popup.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_popover_self_out = function( e ) {
		var $el = $( e.toElement || e.relatedTarget );
		// If an ancestor of element being entered is not a tooltip, hide popover.
		if ( $el.closest( '.ai1ec-tooltip' ).length === 0 ) {
			$( this ).remove();
			$( 'body > .ai1ec-tooltip' ).remove();
		}
	};

	/**
	 * Manually handle tooltip mouseenter. Need to apply .timely namespace.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_tooltip_over = function( e ) {
		// Disable tooltips on mobile devices.
		if ( 'ontouchstart' in document.documentElement ) {
			e.preventDefault();
			return;
		}

		var $this = $( this ),
		    params = {
					template:
						'<div class="timely ai1ec-tooltip">' +
							'<div class="ai1ec-tooltip-arrow"></div>' +
							'<div class="ai1ec-tooltip-inner"></div>' +
						'</div>',
					trigger: 'manual',
					container: 'body'
				};

		// Don't add tooltips to category colour squares already contained in
		// descriptive category labels.
		if (
			$this.is( '.ai1ec-category .ai1ec-color-swatch' ) ||
			$this.is( '.ai1ec-custom-filter .ai1ec-color-swatch' )
		) {
			return;
		}
		if ( $this.is( '.ai1ec-tooltip-auto' ) ) {
			params.placement = get_placement_function( 250 );
		}
		$this.tooltip( params );
		$this.tooltip( 'show' );
	};

	/**
	 * Manually handle tooltip mouseleave.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_tooltip_out = function( e ) {
		$( this ).tooltip( 'hide' );
	};

	/**
	 * Handler for tooltip; remove the tooltip on mouseleave of itself, unless
	 * moving onto the tooltip trigger action. If moving onto an element that is
	 * not in a popup, hide any visible popup.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_tooltip_self_out = function( e ) {
		var $el = $( e.toElement || e.relatedTarget );
		// If an ancestor of element being entered is not a tooltip trigger action,
		// hide tooltip.
		if ( $el.closest( '.ai1ec-tooltip-trigger' ).length === 0 ) {
			$( this ).remove();
		}
		// If an ancestor of element being entered is not a popup, hide any popup.
		if ( $el.closest( '.ai1ec-popup' ).length === 0 ) {
			$( 'body > .ai1ec-popup' ).remove();
		}
	};

	var get_placement_function = function( width ) {
		return function( tip, element ) {
				var left, right;

				var $element        = $( element );
				var defaultPosition = $element.attr( 'data-placement' );
				var pos             = $.extend( {}, $element.offset(), {
					width:  element.offsetWidth,
					height: element.offsetHeight
				} );

				var testLeft = function() {
					if ( false === left ) {
						return false;
					}
					left = ( ( pos.left - width ) >= 0 );
					return left ? 'left' : false;
				};

				var testRight = function() {
					if ( false === right ) {
						return false;
					}
					right = ( ( pos.left + width ) <= $( window ).width() );
					return right ? 'right' : false;
				};

				switch ( defaultPosition ) {
					case 'top'    : return 'top'; break;
					case 'bottom' : return 'bottom'; break;
					case 'left'   : if ( testLeft() )  { return 'left'  };
					case 'right'  : if ( testRight() ) { return 'right' };
					default:
						if ( testLeft() )  { return 'left'  };
						if ( testRight() ) { return 'right' };
						return defaultPosition;
				}
		}
	};

	return {
		handle_popover_over        : handle_popover_over,
		handle_popover_out         : handle_popover_out,
		handle_popover_self_out    : handle_popover_self_out,
		handle_tooltip_over        : handle_tooltip_over,
		handle_tooltip_out         : handle_tooltip_out,
		handle_tooltip_self_out    : handle_tooltip_self_out
	};
} );

timely.define('external_libs/modernizr',[], function() {
	/* Modernizr 2.5.3 (Custom Build) | MIT & BSD
	 * Build: http://modernizr.com/download/#-touch-cssclasses-teststyles-prefixes-load
	 */

	var Modernizr = (function( window, document, undefined ) {

	    var version = '2.5.3',

	    Modernizr = {},

	    enableClasses = true,

	    docElement = document.documentElement,

	    mod = 'modernizr',
	    modElem = document.createElement(mod),
	    mStyle = modElem.style,

	    inputElem  ,


	    toString = {}.toString,

	    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),



	    tests = {},
	    inputs = {},
	    attrs = {},

	    classes = [],

	    slice = classes.slice,

	    featureName, 


	    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

	      var style, ret, node,
	          div = document.createElement('div'),
	                body = document.body, 
	                fakeBody = body ? body : document.createElement('body');

	      if ( parseInt(nodes, 10) ) {
	                      while ( nodes-- ) {
	              node = document.createElement('div');
	              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
	              div.appendChild(node);
	          }
	      }

	                style = ['&#173;','<style>', rule, '</style>'].join('');
	      div.id = mod;
	          (body ? div : fakeBody).innerHTML += style;
	      fakeBody.appendChild(div);
	      if(!body){
	                fakeBody.style.background = "";
	          docElement.appendChild(fakeBody);
	      }

	      ret = callback(div, rule);
	        !body ? fakeBody.parentNode.removeChild(fakeBody) : div.parentNode.removeChild(div);

	      return !!ret;

	    },
	    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProperty;

	    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
	      hasOwnProperty = function (object, property) {
	        return _hasOwnProperty.call(object, property);
	      };
	    }
	    else {
	      hasOwnProperty = function (object, property) { 
	        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
	      };
	    }


	    if (!Function.prototype.bind) {
	      Function.prototype.bind = function bind(that) {

	        var target = this;

	        if (typeof target != "function") {
	            throw new TypeError();
	        }

	        var args = slice.call(arguments, 1),
	            bound = function () {

	            if (this instanceof bound) {

	              var F = function(){};
	              F.prototype = target.prototype;
	              var self = new F;

	              var result = target.apply(
	                  self,
	                  args.concat(slice.call(arguments))
	              );
	              if (Object(result) === result) {
	                  return result;
	              }
	              return self;

	            } else {

	              return target.apply(
	                  that,
	                  args.concat(slice.call(arguments))
	              );

	            }

	        };

	        return bound;
	      };
	    }

	    function setCss( str ) {
	        mStyle.cssText = str;
	    }

	    function setCssAll( str1, str2 ) {
	        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
	    }

	    function is( obj, type ) {
	        return typeof obj === type;
	    }

	    function contains( str, substr ) {
	        return !!~('' + str).indexOf(substr);
	    }


	    function testDOMProps( props, obj, elem ) {
	        for ( var i in props ) {
	            var item = obj[props[i]];
	            if ( item !== undefined) {

	                            if (elem === false) return props[i];

	                            if (is(item, 'function')){
	                                return item.bind(elem || obj);
	                }

	                            return item;
	            }
	        }
	        return false;
	    }


	    var testBundle = (function( styles, tests ) {
	        var style = styles.join(''),
	            len = tests.length;

	        injectElementWithStyles(style, function( node, rule ) {
	            var style = document.styleSheets[document.styleSheets.length - 1],
	                                                    cssText = style ? (style.cssRules && style.cssRules[0] ? style.cssRules[0].cssText : style.cssText || '') : '',
	                children = node.childNodes, hash = {};

	            while ( len-- ) {
	                hash[children[len].id] = children[len];
	            }

	                       Modernizr['touch'] = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch || (hash['touch'] && hash['touch'].offsetTop) === 9; 
	                                }, len, tests);

	    })([
	                       ,['@media (',prefixes.join('touch-enabled),('),mod,')',
	                                '{#touch{top:9px;position:absolute}}'].join('')           ],
	      [
	                       ,'touch'                ]);



	    tests['touch'] = function() {
	        return Modernizr['touch'];
	    };



	    for ( var feature in tests ) {
	        if ( hasOwnProperty(tests, feature) ) {
	                                    featureName  = feature.toLowerCase();
	            Modernizr[featureName] = tests[feature]();

	            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
	        }
	    }
	    setCss('');
	    modElem = inputElem = null;


	    Modernizr._version      = version;

	    Modernizr._prefixes     = prefixes;

	    Modernizr.testStyles    = injectElementWithStyles;    docElement.className = docElement.className.replace(/(^|\s)no-js(\s|$)/, '$1$2') +

	                                                    (enableClasses ? ' js ' + classes.join(' ') : '');

	    return Modernizr;

	})(window, window.document);
	
	return Modernizr;
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

timely.define('external_libs/constrained_popover',
	[
		"jquery_timely",
		"external_libs/bootstrap/popover"
	],
	function( $ ) {

	 // jshint ;_;

	/* CONSTRAINED_POPOVER PUBLIC CLASS DEFINITION
	 * =========================================== */

	var ConstrainedPopover = function( element, options ) {
		this.init( 'constrained_popover', element, options );
	};

	ConstrainedPopover.DEFAULTS = $.extend(
		{},
		$.fn.popover.Constructor.DEFAULTS,
		{
			container: '',
			content: this.options
		}
	);

	// Note: ConstrainedPopover extends Bootstrap's Popover.

	ConstrainedPopover.prototype =
		$.extend( {}, $.fn.popover.Constructor.prototype );

	ConstrainedPopover.prototype.constructor = ConstrainedPopover;

	ConstrainedPopover.prototype.getDefaults = function () {
		return ConstrainedPopover.DEFAULTS
	};

	/**
	 * Extends Popover.prototype.applyPlacement by repositioning popover within
	 * constrained bounds, after it has been otherwise positioned naturally.
	 */
	ConstrainedPopover.prototype.applyPlacement =
		function( offset, placement ) {
			$.fn.popover.Constructor.prototype.applyPlacement.call( this, offset, placement );

			var $tip     = this.tip(),
			    actualWidth = $tip[0].offsetWidth,
			    actualHeight = $tip[0].offsetHeight,
			    pos      = this.getPosition(),
			    finalPos = {};

			switch ( placement ) {
				case 'left':
					newPos = this.defineBounds( pos );
					if ( typeof newPos.top === "undefined" ) {
						finalPos["top"] = pos.top + pos.height / 2 - actualHeight / 2;
					} else {
						finalPos["top"] = newPos.top - actualHeight / 2;
					}
					if ( typeof newPos.left === "undefined" ) {
						finalPos["left"] = pos.left - actualWidth;
					} else {
						finalPos["left"] = newPos.left - actualWidth;
					}
					$tip.offset( finalPos );
					break;

				case 'right':
					newPos = this.defineBounds( pos );
					if ( typeof newPos.top === "undefined" ) {
						finalPos["top"] = pos.top + pos.height / 2 - actualHeight / 2;
					} else {
						finalPos["top"] = newPos.top - actualHeight / 2;
					}
					if ( typeof newPos.left === "undefined" ) {
						finalPos["left"] = pos.left + pos.width;
					} else {
						finalPos["left"] = newPos.left + pos.width;
					}
					$tip.offset( finalPos );
					break;
			}
		};

	ConstrainedPopover.prototype.defineBounds = function( pos ) {
		var containerOffset,
		    boundTop,
		    boundLeft,
		    boundBottom,
		    boundRight,
		    newPos = {},
		    $container = $( 'body' === this.options.container  ? document : this.options.container );

		if ( $container.length ) {
			containerOffset = $container.offset() || { top: 0, left: 0 };

			boundTop = containerOffset.top;
			boundLeft = containerOffset.left;
			boundBottom = boundTop + $container.height();
			boundRight = boundLeft + $container.width();

			// Constrain y-axis overflow
			if ( pos.top + ( pos.height / 2 ) < boundTop ) {
				newPos['top'] = boundTop;
			}
			if ( pos.top + ( pos.height / 2 ) > boundBottom ) {
				newPos['top'] = boundBottom;
			}

			// Constrain x-axis overflow
			if ( pos.left - ( pos.width / 2 ) < boundLeft ) {
				newPos['left'] = boundLeft;
			}
			if ( pos.left - ( pos.width / 2 ) > boundRight ) {
				newPos['left'] = boundRight;
			}
			return newPos;
		}
		return false;
	};

	// CONSTRAINED_POPOVER PLUGIN DEFINITION
	// =====================================

	var old = $.fn.popover

	$.fn.constrained_popover = function( option ) {
		return this.each( function () {
			var $this = $(this),
			    data = $this.data('ai1ec.constrained_popover'),
			    options = typeof option == 'object' && option;

			if ( !data ) {
				$this.data(
					'ai1ec.constrained_popover',
					( data = new ConstrainedPopover( this, options ) )
				);
			}
			if ( typeof option == 'string' ) {
				data[option]();
			}
		})
	}

	$.fn.constrained_popover.Constructor = ConstrainedPopover;

	// CONSTRAINED_POPOVER NO CONFLICT
	// ===============================

	$.fn.constrained_popover.noConflict = function () {
		$.fn.constrained_popover = old;
		return this;
	}

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

timely.define('scripts/common_scripts/frontend/common_frontend',
	[
		"jquery_timely",
		"domReady",
		"scripts/common_scripts/frontend/common_event_handlers",
		"ai1ec_calendar",
		"external_libs/modernizr",
		"external_libs/bootstrap/tooltip",
		"external_libs/constrained_popover",
		"external_libs/bootstrap/dropdown"
	],
	function( $, domReady, event_handlers, ai1ec_calendar, Modernizr ) {

	 // jshint ;_;

	var event_listeners_attached = false;

	var attach_event_handlers_frontend = function() {
		event_listeners_attached = true;
		$( document ).on( 'mouseenter', '.ai1ec-popup-trigger',
			event_handlers.handle_popover_over );
		$( document ).on( 'mouseleave', '.ai1ec-popup-trigger',
			event_handlers.handle_popover_out );
		$( document ).on( 'mouseleave', '.ai1ec-popup',
			event_handlers.handle_popover_self_out );
		$( document ).on( 'mouseenter', '.ai1ec-tooltip-trigger',
			event_handlers.handle_tooltip_over );
		$( document ).on( 'mouseleave', '.ai1ec-tooltip-trigger',
			event_handlers.handle_tooltip_out );
		$( document ).on( 'mouseleave', '.ai1ec-tooltip',
			event_handlers.handle_tooltip_self_out );
	};

	/**
	 * Initialize page.
	 */
	var start = function() {
		domReady( function() {
			attach_event_handlers_frontend();
		} );
	};

	/**
	 * Returns whether event listeners have been attached.
	 *
	 * @return {boolean}
	 */
	var are_event_listeners_attached = function() {
		return event_listeners_attached;
	};

	return {
		start                        : start,
		are_event_listeners_attached : are_event_listeners_attached
	};
} );
