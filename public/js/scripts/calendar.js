
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

/**
 * This module handles the print button behaviour.
 */
timely.define('scripts/calendar/print',
	[
		"jquery_timely"
	],
	function( $ ) {
	 // jshint ;_;

	/**
	 * Handle clicks on the print button.
	 *
	 * @param {object} e jQuery Event object
	 */
	var handle_click_on_print_button = function( e ) {
		e.preventDefault();
		// get the calendar html
		var $body = $( 'body' )
		  , $html = $( 'html' )
		  , view = $( this ).closest( '.ai1ec-calendar' ).html()
		  , body = $body.html();
		// Remove all scripts tag otherwise they are reapplied when the
		// html is used.
		body = body.replace( /<script.*?>([\s\S]*?)<\/script>/gmi, '' );
		// Empty the page
		$body.empty();
		// Add the namespace to the body
		$body.addClass( 'timely' );
		// add the print class to the document
		$html.addClass( 'ai1ec-print' );
		// Attacch our calendar
		$body.html( view );
		// Disable clicking on title
		$( 'span' ).click( function() {
			return false;
		} );
		$( '.ai1ec-agenda-view a' ).each( function() {
			$( this ).data( 'href', $( this ).attr( 'href' ) );
			$( this ).attr( 'href', '#' );
		});
		// Open the print screen
		window.print();
		$( '.ai1ec-agenda-view a' ).each( function() {
			$( this ).attr( 'href', $( this ).data( 'href' ) );
			$( this ).data( 'href', '' );
		});
		// remove classes we added
		$body.removeClass( 'timely' );
		$html.removeClass( 'ai1ec-print' );
		// Attach back the body
		$body.html( body );
	};

	return {
		handle_click_on_print_button     : handle_click_on_print_button
	};
} );

timely.define('scripts/calendar/agenda_view',
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
	 // jshint ;_;
	// *** Agenda view ***

	/**
	 * Callbacks for event expansion, collapse.
	 */
	var toggle_event = function() {
		$( this )
			// Find the parent li.ai1ec-event, toggle its class.
			.closest( '.ai1ec-event' )
				.toggleClass( 'ai1ec-expanded' )
				// Find the event summary and slideToggle it
				.find( '.ai1ec-event-summary' )
					.slideToggle( 300 );
	};
	var collapse_all = function() {
		var $calendar = $( this ).closest( '.ai1ec-calendar' );
		$calendar.find( '.ai1ec-expanded .ai1ec-event-toggle')
			.click();
	};

	var expand_all = function() {
		var $calendar = $( this ).closest( '.ai1ec-calendar' );
		$calendar.find( '.ai1ec-event:not(.ai1ec-expanded) .ai1ec-event-toggle')
			.click();
	};
	return {
		toggle_event   : toggle_event,
		collapse_all   : collapse_all,
		expand_all     : expand_all
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
timely.define('scripts/calendar/month_view',
		[
		 "jquery_timely",
		 "external_libs/modernizr"
		 ],
		function( $, Modernizr ) {
	 // jshint ;_;
	// *** Month view ***

	var isOpera = navigator.userAgent.match(/opera/i);
	var isWebkit = navigator.userAgent.match(/webkit/i);
	/**
	 * Extends day bars for multiday events.
	 */
	var extend_multiday_events = function( $calendar ) {
		var
			$days = $calendar.find( '.ai1ec-day' ),
			daysFirstWeek = $calendar.find( '.ai1ec-week:first .ai1ec-day' ).length;

		$calendar.find( '.ai1ec-month-view .ai1ec-multiday' ).each( function() {
			var container = this.parentNode,
				elHeight = $( this ).outerHeight( true ),
				$startEl = $( '.ai1ec-date', container ),
				startDay = parseInt( $startEl.text(), 10 ),
				nextMonthBar = $( this ).data( 'endTruncated' ),
				endDay = parseInt( nextMonthBar
					? $( $days[$days.length - 1] ).text()
					: $( this ).data( 'endDay' ), 10
				),
				$evtContainer = $( this ),
				bgColor = $( '.ai1ec-event', $evtContainer )[0].style.backgroundColor,
				curLine = 0,
				deltaDays = endDay - startDay + 1,
				daysLeft = deltaDays,
				marginSize,
				// this is the variable used to count the number of days for the event
				days = 0;

			$days.each( function( i ) {
				var $dayEl = $( '.ai1ec-date', this ),
					$td = $( this.parentNode ),
					cellNum = $td.index(),
					day = parseInt( $dayEl.text(), 10 );

				if ( day >= startDay && day <= endDay ) {
					if ( day === startDay ) {
						marginSize = parseInt( $dayEl.css( 'marginBottom' ), 10 ) + 16;
					}

					if ( curLine === 0 ) {
						// Extend initial event bar to the end of first (!) week.
						days++;
					}

					if ( cellNum === 0 && day > startDay && daysLeft !== 0 ) {
						// Clone the event as well as its associated popup
						var $clone = $evtContainer
							.next( '.ai1ec-popup' )
							.andSelf()
							.clone( false );
						$dayEl.parent().append( $clone );

						var $block = $clone.first();

						// Create a new spanning multiday bar. "ai1ec-multiday-bar" is used
						// for proper styling, while "ai1ec-multiday-clone" identifies the
						// clones so they can be removed when required.
						$block.addClass( 'ai1ec-multiday-bar ai1ec-multiday-clone' );

						$block
							.css({
								position: "absolute",
								left: '1px',
								// line height is 16px - 3px of initial margin
								top: parseInt( $dayEl.css( 'marginBottom' ), 10 ) + 13,
								backgroundColor: bgColor
							});

						// Check the days left, if they are more than 7 a new block is needed
						// and we draw 7 days only
						var daysForThisBlock = ( daysLeft > 7 ) ? 7 : daysLeft;

						$block.css( 'width',
							create_percentual_width_from_days( daysForThisBlock )
						);

						if ( daysLeft > 7 ) {
							$block.append( create_multiday_arrow( 1, bgColor ) );
						}

						$block.append( create_multiday_arrow( 2, bgColor ) );
					}

					// Keep constant margin (number of bars) during the first row.
					if ( curLine === 0 ) {
						$dayEl.css( { 'marginBottom': marginSize + 'px' } );
					}
					// But need to reset it and append margins from the begining for
					// subsequent weeks.
					else {
						$dayEl.css( { 'marginBottom': '+=16px' } );
					}

					daysLeft--;

					// If in the last column of the table and there are more days left,
					// increment curLine.
					if ( daysLeft > 0 && cellNum === 6 ) {
						curLine++;
					}
				}
			});
			// Adding "start arrow" to the end of multi-month bars.
			if ( nextMonthBar ) {
				var $lastBarPiece = $evtContainer.find(
					'.' + $evtContainer[0].className.replace( /\s+/igm, '.' )
				).last();
				$lastBarPiece.append( create_multiday_arrow( 1, bgColor ) );
			}

			$(this).css( {
				position: 'absolute',
				top: $startEl.outerHeight( true ) - elHeight - 1 + 'px',
				left: '1px',
				width: create_percentual_width_from_days( days )
			} );

			// Add an ending arrow to the initial event bar for multi-week events.
			if ( curLine > 0 ) {
				$( this ).append( create_multiday_arrow( 1, bgColor ) );
			}
			// Add a starting arrow to the initial event bar for events starting in
			// previous month.
			if ( $( this ).data( 'startTruncated' ) ) {
				$( this )
					.append( create_multiday_arrow( 2, bgColor ) )
					.addClass( 'ai1ec-multiday-bar' );
			}
		});
	};

	/**
	 * returns a string with the percentage to use as width for the specified
	 * number of days
	 *
	 * @param int days the number of days
	 *
	 */
	var create_percentual_width_from_days = function( days ) {
		var percent;
		switch ( days ) {
			case 1:
				percent = 97.5;
				break;
			case 2:
				percent = 198.7;
				break;
			case 3:
				percent = 300;
				break;
			case 4:
				percent = 401;
				break;
			case 5:
				if( isWebkit || isOpera ) {
					percent = 507;
				} else {
					percent = 503.4;
				}
				break;
			case 6:
				if( isWebkit || isOpera ) {
					percent = 608;
				} else {
					percent = 603.5;
				}
				break;
			case 7:
				if( isWebkit || isOpera ) {
					percent = 709;
				} else {
					percent = 705;
				}
				break;
		}
		return percent + '%';
	};

	/**
	 * Creates arrow for multiday bars.
	 *
	 * @param {int}    type  1 for ending arrow, 2 for starting arrow
	 * @param {string} color Color of the multiday event
	 */
	var create_multiday_arrow = function( type, color ) {
		var $arrow = $( '<div class="ai1ec-multiday-arrow' + type + '"></div>' );
		if ( type === 1 ) {
			$arrow.css( { borderLeftColor: color } );
		} else {
			$arrow.css( {
				borderTopColor: color,
				borderRightColor: color,
				borderBottomColor: color
			} );
		}
		return $arrow;
	};

	return {
		extend_multiday_events: extend_multiday_events
	};

} );

/**
* This modules defines some common functions that are used by some other frontend modules
*/
timely.define('libs/frontend_utils',[], function() {
	 // jshint ;_;
	/**
	 * Used to ensure that entities used in L10N strings are correct.
	 */
	var ai1ec_convert_entities = function( o ) {
		var c, v;

		c = function( s ) {
			if( /&[^;]+;/.test( s ) ) {
				var e = document.createElement( 'div' );
				e.innerHTML = s;
				return ! e.firstChild ? s : e.firstChild.nodeValue;
			}
			return s;
		};

		if( typeof o === 'string' ) {
			return c( o );
		} else if( typeof o === 'object' ) {
			for( v in o ) {
				if( typeof o[v] === 'string' ) {
					o[v] = c( o[v] );
				}
			}
		}
		return o;
	};

	/**
	 * Convert URI to map object
	 *
	 * @param {string} uri       URI to parse
	 * @param {char}   separator Character that separates arguments
	 * @param {char}   assigner  Character that denotes key from value
	 *
	 * @return {Object} Map of URI properties (non recursive!)
	 */
	var ai1ec_tokenize_uri = function( uri, separator, assigner ) {
		var argv, argc, key, value, spos;
		if ( '#' === uri.charAt( 0 ) || '?' === uri.charAt( 0 ) ) {
			uri = uri.substring( 1 );
		}
		argv = {};
		uri  = uri.split( separator );
		for ( argc = 0; argc < uri.length; argc++ ) {
			value = uri[argc].trim();
			if ( -1 !== ( spos = value.indexOf( assigner ) ) ) {
				key   = value.substring( 0, spos ).trim();
				value = value.substring( spos + 1 ).trim();
			} else {
				key   = value;
				value = true;
			}
			argv[key] = value;
		}
		return argv;
	};

	/**
	 * Parse internal query to more appropriate format.
	 *
	 * @param {string} hash Query hash to process
	 *
	 * @return {string} Converted query to use in admin-ajax request
	 */
	var ai1ec_map_internal_query = function( hash ) {
		var query, argc, keys, use_key, result;
		hash  = ai1ec_tokenize_uri( hash, '&', '=' );
		keys  = Object.keys( hash );
		query = {
			ai1ec  : {},
			action : 'month'
		};
		for ( argc = 0; argc < keys.length; argc++ ) {
			if ( 'ai1ec' === keys[argc] ) {
				var new_map = ai1ec_tokenize_uri( hash[keys[argc]], '|', ':' );
				for ( use_key in new_map ) {
					if ( '' !== new_map[use_key] ) {
						if ( 'action' === use_key || 'view' === use_key ) {
							query.action = new_map[use_key];
						}
						query.ai1ec[use_key] = new_map[use_key];
					}
				}
			} else if ( 'ai1ec_' === keys[argc].substring( 0, 6 ) ) {
				query.ai1ec[keys[argc].substring( 6 )] = hash[keys[argc]];
			} else {
				query[keys[argc]] = hash[keys[argc]];
			}
		}
		if ( 'ai1ec_' !== query.action.substring( 0, 6 ) ) {
			query.action = 'ai1ec_' + query.action;
		}
		result = 'action=' + query.action + '&ai1ec=';
		for ( use_key in query.ai1ec ) {
			if( query.ai1ec.hasOwnProperty( use_key ) ) {
				result += escape( use_key ) + ':' + escape( query.ai1ec[use_key] ) + '|';
			}
		}
		result = result.substring( 0, result.length - 1 );
		for ( use_key in query ) {
			if ( 'ai1ec' !== use_key && 'action' !== use_key ) {
				result += '&' + use_key + '=' + escape( query[use_key] );
			}
		}
		return result;
	};

	return {
		ai1ec_convert_entities   : ai1ec_convert_entities,
		ai1ec_map_internal_query : ai1ec_map_internal_query,
		ai1ec_tokenize_uri       : ai1ec_tokenize_uri
	};
} );

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

/**
 * Twig.js 0.7.2
 *
 * @copyright 2011-2013 John Roepke
 * @license   Available under the BSD 2-Clause License
 * @link      https://github.com/justjohn/twig.js
 */

var Twig = (function (Twig) {

    Twig.VERSION = "0.7.2";

    return Twig;
})(Twig || {});
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

var Twig = (function (Twig) {
    
    // ## twig.core.js
    //
    // This file handles template level tokenizing, compiling and parsing.

    Twig.trace = false;
    Twig.debug = false;

    // Default caching to true for the improved performance it offers
    Twig.cache = true;

    Twig.placeholders = {
        parent: "{{|PARENT|}}"
    };

    /**
     * Fallback for Array.indexOf for IE8 et al
     */
    Twig.indexOf = function (arr, searchElement /*, fromIndex */ ) {
        if (Array.prototype.hasOwnProperty("indexOf")) {
            return arr.indexOf(searchElement);
        }
        if (arr === void 0 || arr === null) {
            throw new TypeError();
        }
        var t = Object(arr);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n !== n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            // console.log("indexOf not found1 ", JSON.stringify(searchElement), JSON.stringify(arr));
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        if (arr == searchElement) {
            return 0;
        }
        // console.log("indexOf not found2 ", JSON.stringify(searchElement), JSON.stringify(arr));

        return -1;
    }

    Twig.forEach = function (arr, callback, thisArg) {
        if (Array.prototype.forEach ) {
            return arr.forEach(callback, thisArg);
        }

        var T, k;

        if ( arr == null ) {
          throw new TypeError( " this is null or not defined" );
        }

        // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
        var O = Object(arr);

        // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
        // 3. Let len be ToUint32(lenValue).
        var len = O.length >>> 0; // Hack to convert O.length to a UInt32

        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if ( {}.toString.call(callback) != "[object Function]" ) {
          throw new TypeError( callback + " is not a function" );
        }

        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if ( thisArg ) {
          T = thisArg;
        }

        // 6. Let k be 0
        k = 0;

        // 7. Repeat, while k < len
        while( k < len ) {

          var kValue;

          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          if ( k in O ) {

            // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
            kValue = O[ k ];

            // ii. Call the Call internal method of callback with T as the this value and
            // argument list containing kValue, k, and O.
            callback.call( T, kValue, k, O );
          }
          // d. Increase k by 1.
          k++;
        }
        // 8. return undefined
    };

    /**
     * Exception thrown by twig.js.
     */
    Twig.Error = function(message) {
       this.message = message;
       this.name = "TwigException";
       this.type = "TwigException";
    };

    /**
     * Get the string representation of a Twig error.
     */
    Twig.Error.prototype.toString = function() {
        var output = this.name + ": " + this.message;

        return output;
    };

    /**
     * Wrapper for logging to the console.
     */
    Twig.log = {
        trace: function() {if (Twig.trace && console) {console.log(Array.prototype.slice.call(arguments));}},
        debug: function() {if (Twig.debug && console) {console.log(Array.prototype.slice.call(arguments));}},
    };

    if (typeof console !== "undefined" && 
        typeof console.log !== "undefined") {
        Twig.log.error = function() {
            console.log.apply(console, arguments);
        }
    } else {
        Twig.log.error = function(){};
    }

    /**
     * Container for methods related to handling high level template tokens
     *      (for example: {{ expression }}, {% logic %}, {# comment #}, raw data)
     */
    Twig.token = {};

    /**
     * Token types.
     */
    Twig.token.type = {
        output:  'output',
        logic:   'logic',
        comment: 'comment',
        raw:     'raw'
    };

    /**
     * Token syntax definitions.
     */
    Twig.token.definitions = [
        {
            type: Twig.token.type.raw,
            open: '{% raw %}',
            close: '{% endraw %}'
        },
        // *Output type tokens*
        //
        // These typically take the form `{{ expression }}`.
        {
            type: Twig.token.type.output,
            open: '{{',
            close: '}}'
        },
        // *Logic type tokens*
        //
        // These typically take a form like `{% if expression %}` or `{% endif %}`
        {
            type: Twig.token.type.logic,
            open: '{%',
            close: '%}'
        },
        // *Comment type tokens*
        //
        // These take the form `{# anything #}`
        {
            type: Twig.token.type.comment,
            open: '{#',
            close: '#}'
        }
    ];


    /**
     * What characters start "strings" in token definitions. We need this to ignore token close
     * strings inside an expression.
     */
    Twig.token.strings = ['"', "'"];

    Twig.token.findStart = function (template) {
        var output = {
                position: null,
                def: null
            },
            i,
            token_template,
            first_key_position;

        for (i=0;i<Twig.token.definitions.length;i++) {
            token_template = Twig.token.definitions[i];
            first_key_position = template.indexOf(token_template.open);

            Twig.log.trace("Twig.token.findStart: ", "Searching for ", token_template.open, " found at ", first_key_position);

            // Does this token occur before any other types?
            if (first_key_position >= 0 && (output.position === null || first_key_position < output.position)) {
                output.position = first_key_position;
                output.def = token_template;
            }
        }

        return output;
    };

    Twig.token.findEnd = function (template, token_def, start) {
        var end = null,
            found = false,
            offset = 0,

            // String position variables
            str_pos = null,
            str_found = null,
            pos = null,
            end_offset = null,
            this_str_pos = null,
            end_str_pos = null,

            // For loop variables
            i,
            l;

        while (!found) {
            str_pos = null;
            str_found = null;
            pos = template.indexOf(token_def.close, offset);

            if (pos >= 0) {
                end = pos;
                found = true;
            } else {
                // throw an exception
                throw new Twig.Error("Unable to find closing bracket '" + token_def.close +
                                "'" + " opened near template position " + start);
            }

            // Ignore quotes within comments; just look for the next comment close sequence,
            // regardless of what comes before it. https://github.com/justjohn/twig.js/issues/95
            if (token_def.type === Twig.token.type.comment) {
              break;
            }

            l = Twig.token.strings.length;
            for (i = 0; i < l; i += 1) {
                this_str_pos = template.indexOf(Twig.token.strings[i], offset);

                if (this_str_pos > 0 && this_str_pos < pos &&
                        (str_pos === null || this_str_pos < str_pos)) {
                    str_pos = this_str_pos;
                    str_found = Twig.token.strings[i];
                }
            }

            // We found a string before the end of the token, now find the string's end and set the search offset to it
            if (str_pos !== null) {
                end_offset = str_pos + 1;
                end = null;
                found = false;
                while (true) {
                    end_str_pos = template.indexOf(str_found, end_offset);
                    if (end_str_pos < 0) {
                        throw "Unclosed string in template";
                    }
                    // Ignore escaped quotes
                    if (template.substr(end_str_pos - 1, 1) !== "\\") {
                        offset = end_str_pos + 1;
                        break;
                    } else {
                        end_offset = end_str_pos + 1;
                    }
                }
            }
        }
        return end;
    };

    /**
     * Convert a template into high-level tokens.
     */
    Twig.tokenize = function (template) {
        var tokens = [],
            // An offset for reporting errors locations in the template.
            error_offset = 0,

            // The start and type of the first token found in the template.
            found_token = null,
            // The end position of the matched token.
            end = null;

        while (template.length > 0) {
            // Find the first occurance of any token type in the template
            found_token = Twig.token.findStart(template);

            Twig.log.trace("Twig.tokenize: ", "Found token: ", found_token);

            if (found_token.position !== null) {
                // Add a raw type token for anything before the start of the token
                if (found_token.position > 0) {
                    tokens.push({
                        type: Twig.token.type.raw,
                        value: template.substring(0, found_token.position)
                    });
                }
                template = template.substr(found_token.position + found_token.def.open.length);
                error_offset += found_token.position + found_token.def.open.length;

                // Find the end of the token
                end = Twig.token.findEnd(template, found_token.def, error_offset);

                Twig.log.trace("Twig.tokenize: ", "Token ends at ", end);

                tokens.push({
                    type:  found_token.def.type,
                    value: template.substring(0, end).trim()
                });

                if ( found_token.def.type === "logic" && template.substr( end + found_token.def.close.length, 1 ) === "\n" ) {
                    // Newlines directly after logic tokens are ignored
                    end += 1;
                }

                template = template.substr(end + found_token.def.close.length);

                // Increment the position in the template
                error_offset += end + found_token.def.close.length;

            } else {
                // No more tokens -> add the rest of the template as a raw-type token
                tokens.push({
                    type: Twig.token.type.raw,
                    value: template
                });
                template = '';
            }
        }

        return tokens;
    };


    Twig.compile = function (tokens) {
        try {

            // Output and intermediate stacks
            var output = [],
                stack = [],
                // The tokens between open and close tags
                intermediate_output = [],

                token = null,
                logic_token = null,
                unclosed_token = null,
                // Temporary previous token.
                prev_token = null,
                // The previous token's template
                prev_template = null,
                // The output token
                tok_output = null,

                // Logic Token values
                type = null,
                open = null,
                next = null;

            while (tokens.length > 0) {
                token = tokens.shift();
                Twig.log.trace("Compiling token ", token);
                switch (token.type) {
                    case Twig.token.type.raw:
                        if (stack.length > 0) {
                            intermediate_output.push(token);
                        } else {
                            output.push(token);
                        }
                        break;

                    case Twig.token.type.logic:
                        // Compile the logic token
                        logic_token = Twig.logic.compile.apply(this, [token]);

                        type = logic_token.type;
                        open = Twig.logic.handler[type].open;
                        next = Twig.logic.handler[type].next;

                        Twig.log.trace("Twig.compile: ", "Compiled logic token to ", logic_token,
                                                         " next is: ", next, " open is : ", open);

                        // Not a standalone token, check logic stack to see if this is expected
                        if (open !== undefined && !open) {
                            prev_token = stack.pop();
                            prev_template = Twig.logic.handler[prev_token.type];

                            if (Twig.indexOf(prev_template.next, type) < 0) {
                                throw new Error(type + " not expected after a " + prev_token.type);
                            }

                            prev_token.output = prev_token.output || [];

                            prev_token.output = prev_token.output.concat(intermediate_output);
                            intermediate_output = [];

                            tok_output = {
                                type: Twig.token.type.logic,
                                token: prev_token
                            };
                            if (stack.length > 0) {
                                intermediate_output.push(tok_output);
                            } else {
                                output.push(tok_output);
                            }
                        }

                        // This token requires additional tokens to complete the logic structure.
                        if (next !== undefined && next.length > 0) {
                            Twig.log.trace("Twig.compile: ", "Pushing ", logic_token, " to logic stack.");

                            if (stack.length > 0) {
                                // Put any currently held output into the output list of the logic operator
                                // currently at the head of the stack before we push a new one on.
                                prev_token = stack.pop();
                                prev_token.output = prev_token.output || [];
                                prev_token.output = prev_token.output.concat(intermediate_output);
                                stack.push(prev_token);
                                intermediate_output = [];
                            }

                            // Push the new logic token onto the logic stack
                            stack.push(logic_token);

                        } else if (open !== undefined && open) {
                            tok_output = {
                                type: Twig.token.type.logic,
                                token: logic_token
                            };
                            // Standalone token (like {% set ... %}
                            if (stack.length > 0) {
                                intermediate_output.push(tok_output);
                            } else {
                                output.push(tok_output);
                            }
                        }
                        break;

                    // Do nothing, comments should be ignored
                    case Twig.token.type.comment:
                        break;

                    case Twig.token.type.output:
                        Twig.expression.compile.apply(this, [token]);
                        if (stack.length > 0) {
                            intermediate_output.push(token);
                        } else {
                            output.push(token);
                        }
                        break;
                }

                Twig.log.trace("Twig.compile: ", " Output: ", output,
                                                 " Logic Stack: ", stack,
                                                 " Pending Output: ", intermediate_output );
            }

            // Verify that there are no logic tokens left in the stack.
            if (stack.length > 0) {
                unclosed_token = stack.pop();
                throw new Error("Unable to find an end tag for " + unclosed_token.type +
                                ", expecting one of " + unclosed_token.next);
            }
            return output;
        } catch (ex) {
            Twig.log.error("Error compiling twig template " + this.id + ": ");
            if (ex.stack) {
                Twig.log.error(ex.stack);
            } else {
                Twig.log.error(ex.toString());
            }

            if (this.options.rethrow) throw ex;
        }
    };

    /**
     * Parse a compiled template.
     *
     * @param {Array} tokens The compiled tokens.
     * @param {Object} context The render context.
     *
     * @return {string} The parsed template.
     */
    Twig.parse = function (tokens, context) {
        try {
            var output = [],
                // Track logic chains
                chain = true,
                that = this;

            // Default to an empty object if none provided
            context = context || { };


            Twig.forEach(tokens, function parseToken(token) {
                Twig.log.debug("Twig.parse: ", "Parsing token: ", token);

                switch (token.type) {
                    case Twig.token.type.raw:
                        output.push(token.value);
                        break;

                    case Twig.token.type.logic:
                        var logic_token = token.token,
                            logic = Twig.logic.parse.apply(that, [logic_token, context, chain]);

                        if (logic.chain !== undefined) {
                            chain = logic.chain;
                        }
                        if (logic.context !== undefined) {
                            context = logic.context;
                        }
                        if (logic.output !== undefined) {
                            output.push(logic.output);
                        }
                        break;

                    case Twig.token.type.comment:
                        // Do nothing, comments should be ignored
                        break;

                    case Twig.token.type.output:
                        Twig.log.debug("Twig.parse: ", "Output token: ", token.stack);
                        // Parse the given expression in the given context
                        output.push(Twig.expression.parse.apply(that, [token.stack, context]));
                        break;
                }
            });
            return output.join("");
        } catch (ex) {
            Twig.log.error("Error parsing twig template " + this.id + ": ");
            if (ex.stack) {
                Twig.log.error(ex.stack);
            } else {
                Twig.log.error(ex.toString());
            }

            if (this.options.rethrow) throw ex;

            if (Twig.debug) {
                return ex.toString();
            }
        }
    };

    /**
     * Tokenize and compile a string template.
     *
     * @param {string} data The template.
     *
     * @return {Array} The compiled tokens.
     */
    Twig.prepare = function(data) {
        var tokens, raw_tokens;

        // Tokenize
        Twig.log.debug("Twig.prepare: ", "Tokenizing ", data);
        raw_tokens = Twig.tokenize.apply(this, [data]);

        // Compile
        Twig.log.debug("Twig.prepare: ", "Compiling ", raw_tokens);
        tokens = Twig.compile.apply(this, [raw_tokens]);

        Twig.log.debug("Twig.prepare: ", "Compiled ", tokens);

        return tokens;
    };

    // Namespace for template storage and retrieval
    Twig.Templates = {
        registry: {}
    };

    /**
     * Is this id valid for a twig template?
     *
     * @param {string} id The ID to check.
     *
     * @throws {Twig.Error} If the ID is invalid or used.
     * @return {boolean} True if the ID is valid.
     */
    Twig.validateId = function(id) {
        if (id === "prototype") {
            throw new Twig.Error(id + " is not a valid twig identifier");
        } else if (Twig.Templates.registry.hasOwnProperty(id)) {
            throw new Twig.Error("There is already a template with the ID " + id);
        }
        return true;
    }

    /**
     * Save a template object to the store.
     *
     * @param {Twig.Template} template   The twig.js template to store.
     */
    Twig.Templates.save = function(template) {
        if (template.id === undefined) {
            throw new Twig.Error("Unable to save template with no id");
        }
        Twig.Templates.registry[template.id] = template;
    };

    /**
     * Load a previously saved template from the store.
     *
     * @param {string} id   The ID of the template to load.
     *
     * @return {Twig.Template} A twig.js template stored with the provided ID.
     */
    Twig.Templates.load = function(id) {
        if (!Twig.Templates.registry.hasOwnProperty(id)) {
            return null;
        }
        return Twig.Templates.registry[id];
    };

    /**
     * Load a template from a remote location using AJAX and saves in with the given ID.
     *
     * Available parameters:
     *
     *      async:       Should the HTTP request be performed asynchronously.
     *                      Defaults to true.
     *      method:      What method should be used to load the template
     *                      (fs or ajax)
     *      precompiled: Has the template already been compiled.
     *
     * @param {string} location  The remote URL to load as a template.
     * @param {Object} params The template parameters.
     * @param {function} callback  A callback triggered when the template finishes loading.
     * @param {function} error_callback  A callback triggered if an error occurs loading the template.
     *
     *
     */
    Twig.Templates.loadRemote = function(location, params, callback, error_callback) {
        var id          = params.id,
            method      = params.method,
            async       = params.async,
            precompiled = params.precompiled,
            template    = null;

        // Default to async
        if (async === undefined) async = true;

        // Default to the URL so the template is cached.
        if (id === undefined) {
            id = location;
        }
        params.id = id;

        // Check for existing template
        if (Twig.cache && Twig.Templates.registry.hasOwnProperty(id)) {
            // A template is already saved with the given id.
            if (callback) {
                callback(Twig.Templates.registry[id]);
            }
            return Twig.Templates.registry[id];
        }

        if (method == 'ajax') {
            if (typeof XMLHttpRequest == "undefined") {
                throw new Twig.Error("Unsupported platform: Unable to do remote requests " +
                                     "because there is no XMLHTTPRequest implementation");
            }

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = function() {
                var data = null;

                if(xmlhttp.readyState == 4) {
                    if (xmlhttp.status == 200) {
                        Twig.log.debug("Got template ", xmlhttp.responseText);

                        if (precompiled === true) {
                            data = JSON.parse(xmlhttp.responseText);
                        } else {
                            data = xmlhttp.responseText;
                        }

                        params.url = location;
                        params.data = data;

                        template = new Twig.Template(params);

                        if (callback) {
                            callback(template);
                        }
                    } else {
                        if (error_callback) {
                            error_callback(xmlhttp);
                        }
                    }
                }
            };
            xmlhttp.open("GET", location, async);
            xmlhttp.send();

        } else { // if method = 'fs'
            // Create local scope
            (function() {
                var fs = require('fs'),
                    path = require('path'),
                    data = null,
                    loadTemplateFn = function(err, data) {
                        if (err) {
                            if (error_callback) {
                                error_callback(err);
                            }
                            return;
                        }

                        if (precompiled === true) {
                            data = JSON.parse(data);
                        }

                        params.data = data;
                        params.path = location;

                        // template is in data
                        template = new Twig.Template(params);

                        if (callback) {
                            callback(template);
                        }
                    };

                if (async === true) {
                    fs.stat(location, function (err, stats) {
                        if (err || !stats.isFile())
                            throw new Twig.Error("Unable to find template file " + location);

                        fs.readFile(location, 'utf8', loadTemplateFn);
                    });
                } else {
                    if (!fs.statSync(location).isFile())
                        throw new Twig.Error("Unable to find template file " + location);

                    data = fs.readFileSync(location, 'utf8');
                    loadTemplateFn(undefined, data);
                }
            })();
        }
        if (async === false) {
            return template;
        } else {
            // placeholder for now, should eventually return a deferred object.
            return true;
        }
    };

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    /**
     * Create a new twig.js template.
     *
     * Parameters: {
     *      data:   The template, either pre-compiled tokens or a string template
     *      id:     The name of this template
     *      blocks: Any pre-existing block from a child template
     * }
     *
     * @param {Object} params The template parameters.
     */
    Twig.Template = function ( params ) {
        var data = params.data,
            id = params.id,
            blocks = params.blocks,
            macros = params.macros || {},
            base = params.base,
            path = params.path,
            url = params.url,
            // parser options
            options = params.options;

        // # What is stored in a Twig.Template
        //
        // The Twig Template hold several chucks of data.
        //
        //     {
        //          id:     The token ID (if any)
        //          tokens: The list of tokens that makes up this template.
        //          blocks: The list of block this template contains.
        //          base:   The base template (if any)
        //            options:  {
        //                Compiler/parser options
        //
        //                strict_variables: true/false
        //                    Should missing variable/keys emit an error message. If false, they default to null.
        //            }
        //     }
        //

        this.id     = id;
        this.base   = base;
        this.path   = path;
        this.url    = url;
        this.macros = macros;
        this.options = options;

        this.reset(blocks);

        if (is('String', data)) {
            this.tokens = Twig.prepare.apply(this, [data]);
        } else {
            this.tokens = data;
        }

        if (id !== undefined) {
            Twig.Templates.save(this);
        }
    };

    Twig.Template.prototype.reset = function(blocks) {
        Twig.log.debug("Twig.Template.reset", "Reseting template " + this.id);
        this.blocks = {};
        this.child = {
            blocks: blocks || {}
        };
        this.extend = null;
    };

    Twig.Template.prototype.render = function (context, params) {
        params = params || {};

        var output,
            url;

        this.context = context || {};

        // Clear any previous state
        this.reset();
        if (params.blocks) {
            this.blocks = params.blocks;
        }
        if (params.macros) {
            this.macros = params.macros;
        }

        output = Twig.parse.apply(this, [this.tokens, this.context]);

        // Does this template extend another
        if (this.extend) {
            var ext_template;

            // check if the template is provided inline
            if ( this.options.allowInlineIncludes ) {
                ext_template = Twig.Templates.load(this.extend);
                if ( ext_template ) {
                    ext_template.options = this.options;
                }
            }

            // check for the template file via include
            if (!ext_template) {
                url = relativePath(this, this.extend);

                ext_template = Twig.Templates.loadRemote(url, {
                    method: this.url?'ajax':'fs',
                    base: this.base,
                    async:  false,
                    id:     url,
                    options: this.options
                });
            }

            this.parent = ext_template;

            return this.parent.render(this.context, {
                blocks: this.blocks
            });
        }

        if (params.output == 'blocks') {
            return this.blocks;
        } else if (params.output == 'macros') {
            return this.macros;
        } else {
            return output;
        }
    };

    Twig.Template.prototype.importFile = function(file) {
        var url, sub_template;
        if ( !this.url && !this.path && this.options.allowInlineIncludes ) {
            sub_template = Twig.Templates.load(file);
            sub_template.options = this.options;
            if ( sub_template ) {
                return sub_template;
            }

            throw new Twig.Error("Didn't find the inline template by id");
        }

        url = relativePath(this, file);

        // Load blocks from an external file
        sub_template = Twig.Templates.loadRemote(url, {
            method: this.url?'ajax':'fs',
            base: this.base,
            async: false,
            options: this.options,
            id: url
        });

        return sub_template;
    };

    Twig.Template.prototype.importBlocks = function(file, override) {
        var sub_template = this.importFile(file),
            context = this.context,
            that = this,
            key;

        override = override || false;

        sub_template.render(context);

        // Mixin blocks
        Twig.forEach(Object.keys(sub_template.blocks), function(key) {
            if (override || that.blocks[key] === undefined) {
                that.blocks[key] = sub_template.blocks[key];
            }
        });
    };

    Twig.Template.prototype.importMacros = function(file) {
        var url = relativePath(this, file);

        // load remote template
        var remoteTemplate = Twig.Templates.loadRemote(url, {
            method: this.url?'ajax':'fs',
            async: false,
            id: url
        });

        return remoteTemplate;
    };

    Twig.Template.prototype.compile = function(options) {
        // compile the template into raw JS
        return Twig.compiler.compile(this, options);
    };

    /**
     * Generate the relative canonical version of a url based on the given base path and file path.
     *
     * @param {string} template The Twig.Template.
     * @param {string} file The file path, relative to the base path.
     *
     * @return {string} The canonical version of the path.
     */
    function relativePath(template, file) {
        var base,
            base_path,
            sep_chr = "/",
            new_path = [],
            val;

        if (template.url) {
            if (typeof template.base !== 'undefined') {
                base = template.base + ((template.base.charAt(template.base.length-1) === '/') ? '' : '/');
            } else {
                base = template.url;
            }
        } else if (template.path) {
            // Get the system-specific path separator
            var path = require("path"),
                sep = path.sep || sep_chr,
                relative = new RegExp("^\\.{1,2}" + sep.replace("\\", "\\\\"));
            file = file.replace(/\//g, sep);

            if (template.base !== undefined && file.match(relative) == null) {
                file = file.replace(template.base, '');
                base = template.base + sep;
            } else {
                base = template.path;
            }

            base = base.replace(sep+sep, sep);
            sep_chr = sep;
        } else {
            throw new Twig.Error("Cannot extend an inline template.");
        }

        base_path = base.split(sep_chr);

        // Remove file from url
        base_path.pop();
        base_path = base_path.concat(file.split(sep_chr));

        while (base_path.length > 0) {
            val = base_path.shift();
            if (val == ".") {
                // Ignore
            } else if (val == ".." && new_path.length > 0 && new_path[new_path.length-1] != "..") {
                new_path.pop();
            } else {
                new_path.push(val);
            }
        }

        return new_path.join(sep_chr);
    }

    return Twig;

}) (Twig || { });

// The following methods are from MDN and are available under a
// [MIT License](http://www.opensource.org/licenses/mit-license.php) or are
// [Public Domain](https://developer.mozilla.org/Project:Copyrights).
//
// See:
// * [Object.keys - MDN](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys)

// ## twig.fills.js
//
// This file contains fills for backwards compatability.
(function() {
    
    // Handle methods that don't yet exist in every browser

    if (!String.prototype.trim) {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g,'');
        }
    };

    if(!Object.keys) Object.keys = function(o){
        if (o !== Object(o)) {
            throw new TypeError('Object.keys called on non-object');
        }
        var ret = [], p;
        for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) ret.push(p);
        return ret;
    }

})();
// ## twig.lib.js
//
// This file contains 3rd party libraries used within twig.
//
// Copies of the licenses for the code included here can be found in the
// LICENSES.md file.
//

var Twig = (function(Twig) {

    // Namespace for libraries
    Twig.lib = { };

    /**
    sprintf() for JavaScript 0.7-beta1
    http://www.diveintojavascript.com/projects/javascript-sprintf
    **/
    var sprintf = (function() {
            function get_type(variable) {
                    return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
            }
            function str_repeat(input, multiplier) {
                    for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
                    return output.join('');
            }

            var str_format = function() {
                    if (!str_format.cache.hasOwnProperty(arguments[0])) {
                            str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
                    }
                    return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
            };

            str_format.format = function(parse_tree, argv) {
                    var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
                    for (i = 0; i < tree_length; i++) {
                            node_type = get_type(parse_tree[i]);
                            if (node_type === 'string') {
                                    output.push(parse_tree[i]);
                            }
                            else if (node_type === 'array') {
                                    match = parse_tree[i]; // convenience purposes only
                                    if (match[2]) { // keyword argument
                                            arg = argv[cursor];
                                            for (k = 0; k < match[2].length; k++) {
                                                    if (!arg.hasOwnProperty(match[2][k])) {
                                                            throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                                                    }
                                                    arg = arg[match[2][k]];
                                            }
                                    }
                                    else if (match[1]) { // positional argument (explicit)
                                            arg = argv[match[1]];
                                    }
                                    else { // positional argument (implicit)
                                            arg = argv[cursor++];
                                    }

                                    if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                                            throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
                                    }
                                    switch (match[8]) {
                                            case 'b': arg = arg.toString(2); break;
                                            case 'c': arg = String.fromCharCode(arg); break;
                                            case 'd': arg = parseInt(arg, 10); break;
                                            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
                                            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
                                            case 'o': arg = arg.toString(8); break;
                                            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
                                            case 'u': arg = Math.abs(arg); break;
                                            case 'x': arg = arg.toString(16); break;
                                            case 'X': arg = arg.toString(16).toUpperCase(); break;
                                    }
                                    arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
                                    pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
                                    pad_length = match[6] - String(arg).length;
                                    pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                                    output.push(match[5] ? arg + pad : pad + arg);
                            }
                    }
                    return output.join('');
            };

            str_format.cache = {};

            str_format.parse = function(fmt) {
                    var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
                    while (_fmt) {
                            if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
                                    parse_tree.push(match[0]);
                            }
                            else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
                                    parse_tree.push('%');
                            }
                            else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                                    if (match[2]) {
                                            arg_names |= 1;
                                            var field_list = [], replacement_field = match[2], field_match = [];
                                            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                                    field_list.push(field_match[1]);
                                                    while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                                                            if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                                                    field_list.push(field_match[1]);
                                                            }
                                                            else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                                                    field_list.push(field_match[1]);
                                                            }
                                                            else {
                                                                    throw('[sprintf] huh?');
                                                            }
                                                    }
                                            }
                                            else {
                                                    throw('[sprintf] huh?');
                                            }
                                            match[2] = field_list;
                                    }
                                    else {
                                            arg_names |= 2;
                                    }
                                    if (arg_names === 3) {
                                            throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
                                    }
                                    parse_tree.push(match);
                            }
                            else {
                                    throw('[sprintf] huh?');
                            }
                            _fmt = _fmt.substring(match[0].length);
                    }
                    return parse_tree;
            };

            return str_format;
    })();

    var vsprintf = function(fmt, argv) {
        argv.unshift(fmt);
        return sprintf.apply(null, argv);
    };

    // Expose to Twig
    Twig.lib.sprintf = sprintf;
    Twig.lib.vsprintf = vsprintf;


    /**
     * jPaq - A fully customizable JavaScript/JScript library
     * http://jpaq.org/
     *
     * Copyright (c) 2011 Christopher West
     * Licensed under the MIT license.
     * http://jpaq.org/license/
     *
     * Version: 1.0.6.0000W
     * Revised: April 6, 2011
     */
    ; (function() {
        var shortDays = "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",");
        var fullDays = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(",");
        var shortMonths = "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(",");
        var fullMonths = "January,February,March,April,May,June,July,August,September,October,November,December".split(",");
        function getOrdinalFor(intNum) {
                return (((intNum = Math.abs(intNum) % 100) % 10 == 1 && intNum != 11) ? "st"
                        : (intNum % 10 == 2 && intNum != 12) ? "nd" : (intNum % 10 == 3
                        && intNum != 13) ? "rd" : "th");
        }
        function getISO8601Year(aDate) {
                var d = new Date(aDate.getFullYear() + 1, 0, 4);
                if((d - aDate) / 86400000 < 7 && (aDate.getDay() + 6) % 7 < (d.getDay() + 6) % 7)
                        return d.getFullYear();
                if(aDate.getMonth() > 0 || aDate.getDate() >= 4)
                        return aDate.getFullYear();
                return aDate.getFullYear() - (((aDate.getDay() + 6) % 7 - aDate.getDate() > 2) ? 1 : 0);
        }
        function getISO8601Week(aDate) {
                // Get a day during the first week of the year.
                var d = new Date(getISO8601Year(aDate), 0, 4);
                // Get the first monday of the year.
                d.setDate(d.getDate() - (d.getDay() + 6) % 7);
                return parseInt((aDate - d) / 604800000) + 1;
        }
        Twig.lib.formatDate = function(date, format) {
            /// <summary>
            ///   Gets a string for this date, formatted according to the given format
            ///   string.
            /// </summary>
            /// <param name="format" type="String">
            ///   The format of the output date string.  The format string works in a
            ///   nearly identical way to the PHP date function which is highlighted here:
            ///   http://php.net/manual/en/function.date.php.
            ///   The only difference is the fact that "u" signifies milliseconds
            ///   instead of microseconds.  The following characters are recognized in
            ///   the format parameter string:
            ///     d - Day of the month, 2 digits with leading zeros
            ///     D - A textual representation of a day, three letters
            ///     j - Day of the month without leading zeros
            ///     l (lowercase 'L') - A full textual representation of the day of the week
            ///     N - ISO-8601 numeric representation of the day of the week (starting from 1)
            ///     S - English ordinal suffix for the day of the month, 2 characters st,
            ///         nd, rd or th. Works well with j.
            ///     w - Numeric representation of the day of the week (starting from 0)
            ///     z - The day of the year (starting from 0)
            ///     W - ISO-8601 week number of year, weeks starting on Monday
            ///     F - A full textual representation of a month, such as January or March
            ///     m - Numeric representation of a month, with leading zeros
            ///     M - A short textual representation of a month, three letters
            ///     n - Numeric representation of a month, without leading zeros
            ///     t - Number of days in the given month
            ///     L - Whether it's a leap year
            ///     o - ISO-8601 year number. This has the same value as Y, except that if
            ///         the ISO week number (W) belongs to the previous or next year, that
            ///         year is used instead.
            ///     Y - A full numeric representation of a year, 4 digits
            ///     y - A two digit representation of a year
            ///     a - Lowercase Ante meridiem and Post meridiem
            ///     A - Uppercase Ante meridiem and Post meridiem
            ///     B - Swatch Internet time
            ///     g - 12-hour format of an hour without leading zeros
            ///     G - 24-hour format of an hour without leading zeros
            ///     h - 12-hour format of an hour with leading zeros
            ///     H - 24-hour format of an hour with leading zeros
            ///     i - Minutes with leading zeros
            ///     s - Seconds, with leading zeros
            ///     u - Milliseconds
            ///     U - Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
            /// </param>
            /// <returns type="String">
            ///   Returns the string for this date, formatted according to the given
            ///   format string.
            /// </returns>
            // If the format was not passed, use the default toString method.
            if(typeof format !== "string" || /^\s*$/.test(format))
                    return date + "";
            var jan1st = new Date(date.getFullYear(), 0, 1);
            var me = date;
            return format.replace(/[dDjlNSwzWFmMntLoYyaABgGhHisuU]/g, function(option) {
                switch(option) {
                    // Day of the month, 2 digits with leading zeros
                    case "d": return ("0" + me.getDate()).replace(/^.+(..)$/, "$1");
                    // A textual representation of a day, three letters
                    case "D": return shortDays[me.getDay()];
                    // Day of the month without leading zeros
                    case "j": return me.getDate();
                    // A full textual representation of the day of the week
                    case "l": return fullDays[me.getDay()];
                    // ISO-8601 numeric representation of the day of the week
                    case "N": return (me.getDay() + 6) % 7 + 1;
                    // English ordinal suffix for the day of the month, 2 characters
                    case "S": return getOrdinalFor(me.getDate());
                    // Numeric representation of the day of the week
                    case "w": return me.getDay();
                    // The day of the year (starting from 0)
                    case "z": return Math.ceil((jan1st - me) / 86400000);
                    // ISO-8601 week number of year, weeks starting on Monday
                    case "W": return ("0" + getISO8601Week(me)).replace(/^.(..)$/, "$1");
                    // A full textual representation of a month, such as January or March
                    case "F": return fullMonths[me.getMonth()];
                    // Numeric representation of a month, with leading zeros
                    case "m": return ("0" + (me.getMonth() + 1)).replace(/^.+(..)$/, "$1");
                    // A short textual representation of a month, three letters
                    case "M": return shortMonths[me.getMonth()];
                    // Numeric representation of a month, without leading zeros
                    case "n": return me.getMonth() + 1;
                    // Number of days in the given month
                    case "t": return new Date(me.getFullYear(), me.getMonth() + 1, -1).getDate();
                    // Whether it's a leap year
                    case "L": return new Date(me.getFullYear(), 1, 29).getDate() == 29 ? 1 : 0;
                    // ISO-8601 year number. This has the same value as Y, except that if the
                    // ISO week number (W) belongs to the previous or next year, that year is
                    // used instead.
                    case "o": return getISO8601Year(me);
                    // A full numeric representation of a year, 4 digits
                    case "Y": return me.getFullYear();
                    // A two digit representation of a year
                    case "y": return (me.getFullYear() + "").replace(/^.+(..)$/, "$1");
                    // Lowercase Ante meridiem and Post meridiem
                    case "a": return me.getHours() < 12 ? "am" : "pm";
                    // Uppercase Ante meridiem and Post meridiem
                    case "A": return me.getHours() < 12 ? "AM" : "PM";
                    // Swatch Internet time
                    case "B": return Math.floor((((me.getUTCHours() + 1) % 24) + me.getUTCMinutes() / 60 + me.getUTCSeconds() / 3600) * 1000 / 24);
                    // 12-hour format of an hour without leading zeros
                    case "g": return me.getHours() % 12 != 0 ? me.getHours() % 12 : 12;
                    // 24-hour format of an hour without leading zeros
                    case "G": return me.getHours();
                    // 12-hour format of an hour with leading zeros
                    case "h": return ("0" + (me.getHours() % 12 != 0 ? me.getHours() % 12 : 12)).replace(/^.+(..)$/, "$1");
                    // 24-hour format of an hour with leading zeros
                    case "H": return ("0" + me.getHours()).replace(/^.+(..)$/, "$1");
                    // Minutes with leading zeros
                    case "i": return ("0" + me.getMinutes()).replace(/^.+(..)$/, "$1");
                    // Seconds, with leading zeros
                    case "s": return ("0" + me.getSeconds()).replace(/^.+(..)$/, "$1");
                    // Milliseconds
                    case "u": return me.getMilliseconds();
                    // Seconds since the Unix Epoch (January 1 1970 00:00:00 GMT)
                    case "U": return me.getTime() / 1000;
                }
            });
        };
    })();

    Twig.lib.strip_tags = function(input, allowed) {
        // Strips HTML and PHP tags from a string
        //
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/strip_tags
        // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   improved by: Luke Godfrey
        // +      input by: Pul
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Onno Marsman
        // +      input by: Alex
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Marc Palau
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Eric Nagel
        // +      input by: Bobby Drake
        // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +   bugfixed by: Tomasz Wesolowski
        // +      input by: Evertjan Garretsen
        // +    revised by: Rafał Kukawski (http://blog.kukawski.pl/)
        // *     example 1: strip_tags('<p>Kevin</p> <b>van</b> <i>Zonneveld</i>', '<i><b>');
        // *     returns 1: 'Kevin <b>van</b> <i>Zonneveld</i>'
        // *     example 2: strip_tags('<p>Kevin <img src="someimage.png" onmouseover="someFunction()">van <i>Zonneveld</i></p>', '<p>');
        // *     returns 2: '<p>Kevin van Zonneveld</p>'
        // *     example 3: strip_tags("<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>", "<a>");
        // *     returns 3: '<a href='http://kevin.vanzonneveld.net'>Kevin van Zonneveld</a>'
        // *     example 4: strip_tags('1 < 5 5 > 1');
        // *     returns 4: '1 < 5 5 > 1'
        // *     example 5: strip_tags('1 <br/> 1');
        // *     returns 5: '1  1'
        // *     example 6: strip_tags('1 <br/> 1', '<br>');
        // *     returns 6: '1  1'
        // *     example 7: strip_tags('1 <br/> 1', '<br><br/>');
        // *     returns 7: '1 <br/> 1'
        allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
        return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    }

    Twig.lib.parseISO8601Date = function (s){
        // Taken from http://n8v.enteuxis.org/2010/12/parsing-iso-8601-dates-in-javascript/
        // parenthese matches:
        // year month day    hours minutes seconds  
        // dotmilliseconds 
        // tzstring plusminus hours minutes
        var re = /(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)(\.\d+)?(Z|([+-])(\d\d):(\d\d))/;

        var d = [];
        d = s.match(re);

        // "2010-12-07T11:00:00.000-09:00" parses to:
        //  ["2010-12-07T11:00:00.000-09:00", "2010", "12", "07", "11",
        //     "00", "00", ".000", "-09:00", "-", "09", "00"]
        // "2010-12-07T11:00:00.000Z" parses to:
        //  ["2010-12-07T11:00:00.000Z",      "2010", "12", "07", "11", 
        //     "00", "00", ".000", "Z", undefined, undefined, undefined]

        if (! d) {
            throw "Couldn't parse ISO 8601 date string '" + s + "'";
        }

        // parse strings, leading zeros into proper ints
        var a = [1,2,3,4,5,6,10,11];
        for (var i in a) {
            d[a[i]] = parseInt(d[a[i]], 10);
        }
        d[7] = parseFloat(d[7]);

        // Date.UTC(year, month[, date[, hrs[, min[, sec[, ms]]]]])
        // note that month is 0-11, not 1-12
        // see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Date/UTC
        var ms = Date.UTC(d[1], d[2] - 1, d[3], d[4], d[5], d[6]);

        // if there are milliseconds, add them
        if (d[7] > 0) {  
            ms += Math.round(d[7] * 1000);
        }

        // if there's a timezone, calculate it
        if (d[8] != "Z" && d[10]) {
            var offset = d[10] * 60 * 60 * 1000;
            if (d[11]) {
                offset += d[11] * 60 * 1000;
            }
            if (d[9] == "-") {
                ms -= offset;
            }
            else {
                ms += offset;
            }
        }

        return new Date(ms);
    };

    Twig.lib.strtotime = function (str, now) {
        // http://kevin.vanzonneveld.net
        // +   original by: Caio Ariede (http://caioariede.com)
        // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        // +      input by: David
        // +   improved by: Caio Ariede (http://caioariede.com)
        // +   improved by: Brett Zamir (http://brett-zamir.me)
        // +   bugfixed by: Wagner B. Soares
        // +   bugfixed by: Artur Tchernychev
        // %        note 1: Examples all have a fixed timestamp to prevent tests to fail because of variable time(zones)
        // *     example 1: strtotime('+1 day', 1129633200);
        // *     returns 1: 1129719600
        // *     example 2: strtotime('+1 week 2 days 4 hours 2 seconds', 1129633200);
        // *     returns 2: 1130425202
        // *     example 3: strtotime('last month', 1129633200);
        // *     returns 3: 1127041200
        // *     example 4: strtotime('2009-05-04 08:30:00');
        // *     returns 4: 1241418600
        var i, l, match, s, parse = '';

        str = str.replace(/\s{2,}|^\s|\s$/g, ' '); // unecessary spaces
        str = str.replace(/[\t\r\n]/g, ''); // unecessary chars
        if (str === 'now') {
            return now === null || isNaN(now) ? new Date().getTime() / 1000 | 0 : now | 0;
        } else if (!isNaN(parse = Date.parse(str))) {
            return parse / 1000 | 0;
        } else if (now) {
            now = new Date(now * 1000); // Accept PHP-style seconds
        } else {
            now = new Date();
        }

        var upperCaseStr = str;

        str = str.toLowerCase();

        var __is = {
            day: {
                'sun': 0,
                'mon': 1,
                'tue': 2,
                'wed': 3,
                'thu': 4,
                'fri': 5,
                'sat': 6
            },
            mon: [
                'jan',
                'feb',
                'mar',
                'apr',
                'may',
                'jun',
                'jul',
                'aug',
                'sep',
                'oct',
                'nov',
                'dec'
            ]
        };

        var process = function (m) {
            var ago = (m[2] && m[2] === 'ago');
            var num = (num = m[0] === 'last' ? -1 : 1) * (ago ? -1 : 1);

            switch (m[0]) {
            case 'last':
            case 'next':
                switch (m[1].substring(0, 3)) {
                case 'yea':
                    now.setFullYear(now.getFullYear() + num);
                    break;
                case 'wee':
                    now.setDate(now.getDate() + (num * 7));
                    break;
                case 'day':
                    now.setDate(now.getDate() + num);
                    break;
                case 'hou':
                    now.setHours(now.getHours() + num);
                    break;
                case 'min':
                    now.setMinutes(now.getMinutes() + num);
                    break;
                case 'sec':
                    now.setSeconds(now.getSeconds() + num);
                    break;
                case 'mon':
                    if (m[1] === "month") {
                        now.setMonth(now.getMonth() + num);
                        break;
                    }
                    // fall through
                default:
                    var day = __is.day[m[1].substring(0, 3)];
                    if (typeof day !== 'undefined') {
                        var diff = day - now.getDay();
                        if (diff === 0) {
                            diff = 7 * num;
                        } else if (diff > 0) {
                            if (m[0] === 'last') {
                                diff -= 7;
                            }
                        } else {
                            if (m[0] === 'next') {
                                diff += 7;
                            }
                        }
                        now.setDate(now.getDate() + diff);
                        now.setHours(0, 0, 0, 0); // when jumping to a specific last/previous day of week, PHP sets the time to 00:00:00
                    }
                }
                break;

            default:
                if (/\d+/.test(m[0])) {
                    num *= parseInt(m[0], 10);

                    switch (m[1].substring(0, 3)) {
                    case 'yea':
                        now.setFullYear(now.getFullYear() + num);
                        break;
                    case 'mon':
                        now.setMonth(now.getMonth() + num);
                        break;
                    case 'wee':
                        now.setDate(now.getDate() + (num * 7));
                        break;
                    case 'day':
                        now.setDate(now.getDate() + num);
                        break;
                    case 'hou':
                        now.setHours(now.getHours() + num);
                        break;
                    case 'min':
                        now.setMinutes(now.getMinutes() + num);
                        break;
                    case 'sec':
                        now.setSeconds(now.getSeconds() + num);
                        break;
                    }
                } else {
                    return false;
                }
                break;
            }
            return true;
        };

        match = str.match(/^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/);
        if (match !== null) {
            if (!match[2]) {
                match[2] = '00:00:00';
            } else if (!match[3]) {
                match[2] += ':00';
            }

            s = match[1].split(/-/g);

            s[1] = __is.mon[s[1] - 1] || s[1];
            s[0] = +s[0];

            s[0] = (s[0] >= 0 && s[0] <= 69) ? '20' + (s[0] < 10 ? '0' + s[0] : s[0] + '') : (s[0] >= 70 && s[0] <= 99) ? '19' + s[0] : s[0] + '';
            return parseInt(this.strtotime(s[2] + ' ' + s[1] + ' ' + s[0] + ' ' + match[2]) + (match[4] ? match[4] / 1000 : ''), 10);
        }

        var regex = '([+-]?\\d+\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)' + '|(last|next)\\s' + '(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?' + '|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday' + '|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))' + '(\\sago)?';

        match = str.match(new RegExp(regex, 'gi')); // Brett: seems should be case insensitive per docs, so added 'i'
        if (match === null) {
            // Try to parse ISO8601 in IE8
            try {
                num = Twig.lib.parseISO8601Date(upperCaseStr);
                if (num) {
                    return num / 1000 | 0;
               }
            } catch (err) {
                return false;
            }
            return false;
        }

        for (i = 0, l = match.length; i < l; i++) {
            if (!process(match[i].split(' '))) {
                return false;
            }
        }

        return now.getTime() / 1000 | 0;
    };

    Twig.lib.is = function(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    };

    // shallow-copy an object
    Twig.lib.copy = function(src) {
        var target = {},
            key;
        for (key in src)
            target[key] = src[key];

        return target;
    };

    Twig.lib.replaceAll = function(string, search, replace) {
        return string.split(search).join(replace);
    };

    // chunk an array (arr) into arrays of (size) items, returns an array of arrays, or an empty array on invalid input
    Twig.lib.chunkArray = function (arr, size) {
        var returnVal = [],
            x = 0,
            len = arr.length;

        if (size < 1 || !Twig.lib.is("Array", arr)) {
            return [];
        }

        while (x < len) {
            returnVal.push(arr.slice(x, x += size));
        }

        return returnVal;
    };

    Twig.lib.round = function round(value, precision, mode) {
        //  discuss at: http://phpjs.org/functions/round/
        // original by: Philip Peterson
        //  revised by: Onno Marsman
        //  revised by: T.Wild
        //  revised by: Rafał Kukawski (http://blog.kukawski.pl/)
        //    input by: Greenseed
        //    input by: meo
        //    input by: William
        //    input by: Josep Sanz (http://www.ws3.es/)
        // bugfixed by: Brett Zamir (http://brett-zamir.me)
        //        note: Great work. Ideas for improvement:
        //        note: - code more compliant with developer guidelines
        //        note: - for implementing PHP constant arguments look at
        //        note: the pathinfo() function, it offers the greatest
        //        note: flexibility & compatibility possible
        //   example 1: round(1241757, -3);
        //   returns 1: 1242000
        //   example 2: round(3.6);
        //   returns 2: 4
        //   example 3: round(2.835, 2);
        //   returns 3: 2.84
        //   example 4: round(1.1749999999999, 2);
        //   returns 4: 1.17
        //   example 5: round(58551.799999999996, 2);
        //   returns 5: 58551.8

        var m, f, isHalf, sgn; // helper variables
        precision |= 0; // making sure precision is integer
        m = Math.pow(10, precision);
        value *= m;
        sgn = (value > 0) | -(value < 0); // sign of the number
        isHalf = value % 1 === 0.5 * sgn;
        f = Math.floor(value);

        if (isHalf) {
            switch (mode) {
                case 'PHP_ROUND_HALF_DOWN':
                    value = f + (sgn < 0); // rounds .5 toward zero
                    break;
                case 'PHP_ROUND_HALF_EVEN':
                    value = f + (f % 2 * sgn); // rouds .5 towards the next even integer
                    break;
                case 'PHP_ROUND_HALF_ODD':
                    value = f + !(f % 2); // rounds .5 towards the next odd integer
                    break;
                default:
                    value = f + (sgn > 0); // rounds .5 away from zero
            }
        }

        return (isHalf ? value : Math.round(value)) / m;
    }

    return Twig;

})(Twig || { });
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.logic.js
//
// This file handles tokenizing, compiling and parsing logic tokens. {% ... %}
var Twig = (function (Twig) {
    

    /**
     * Namespace for logic handling.
     */
    Twig.logic = {};

    /**
     * Logic token types.
     */
    Twig.logic.type = {
        if_:       'Twig.logic.type.if',
        endif:     'Twig.logic.type.endif',
        for_:      'Twig.logic.type.for',
        endfor:    'Twig.logic.type.endfor',
        else_:     'Twig.logic.type.else',
        elseif:    'Twig.logic.type.elseif',
        set:       'Twig.logic.type.set',
        setcapture:'Twig.logic.type.setcapture',
        endset:    'Twig.logic.type.endset',
        filter:    'Twig.logic.type.filter',
        endfilter: 'Twig.logic.type.endfilter',
        block:     'Twig.logic.type.block',
        endblock:  'Twig.logic.type.endblock',
        extends_:  'Twig.logic.type.extends',
        use:       'Twig.logic.type.use',
        include:   'Twig.logic.type.include',
        spaceless: 'Twig.logic.type.spaceless',
        endspaceless: 'Twig.logic.type.endspaceless',
        macro:     'Twig.logic.type.macro',
        endmacro:  'Twig.logic.type.endmacro',
        import_:   'Twig.logic.type.import',
        from:      'Twig.logic.type.from'
    };


    // Regular expressions for handling logic tokens.
    //
    // Properties:
    //
    //      type:  The type of expression this matches
    //
    //      regex: A regular expression that matches the format of the token
    //
    //      next:  What logic tokens (if any) pop this token off the logic stack. If empty, the
    //             logic token is assumed to not require an end tag and isn't push onto the stack.
    //
    //      open:  Does this tag open a logic expression or is it standalone. For example,
    //             {% endif %} cannot exist without an opening {% if ... %} tag, so open = false.
    //
    //  Functions:
    //
    //      compile: A function that handles compiling the token into an output token ready for
    //               parsing with the parse function.
    //
    //      parse:   A function that parses the compiled token into output (HTML / whatever the
    //               template represents).
    Twig.logic.definitions = [
        {
            /**
             * If type logic tokens.
             *
             *  Format: {% if expression %}
             */
            type: Twig.logic.type.if_,
            regex: /^if\s+([^\s].+)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: true,
            compile: function (token) {
                var expression = token.match[1];
                // Compile the expression.
                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var output = '',
                    // Parse the expression
                    result = Twig.expression.parse.apply(this, [token.stack, context]);

                // Start a new logic chain
                chain = true;

                if (result) {
                    chain = false;
                    // parse if output
                    output = Twig.parse.apply(this, [token.output, context]);
                }
                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * Else if type logic tokens.
             *
             *  Format: {% elseif expression %}
             */
            type: Twig.logic.type.elseif,
            regex: /^elseif\s+([^\s].*)$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.elseif,
                Twig.logic.type.endif
            ],
            open: false,
            compile: function (token) {
                var expression = token.match[1];
                // Compile the expression.
                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var output = '';

                if (chain && Twig.expression.parse.apply(this, [token.stack, context]) === true) {
                    chain = false;
                    // parse if output
                    output = Twig.parse.apply(this, [token.output, context]);
                }

                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * Else if type logic tokens.
             *
             *  Format: {% elseif expression %}
             */
            type: Twig.logic.type.else_,
            regex: /^else$/,
            next: [
                Twig.logic.type.endif,
                Twig.logic.type.endfor
            ],
            open: false,
            parse: function (token, context, chain) {
                var output = '';
                if (chain) {
                    output = Twig.parse.apply(this, [token.output, context]);
                }
                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * End if type logic tokens.
             *
             *  Format: {% endif %}
             */
            type: Twig.logic.type.endif,
            regex: /^endif$/,
            next: [ ],
            open: false
        },
        {
            /**
             * For type logic tokens.
             *
             *  Format: {% for expression %}
             */
            type: Twig.logic.type.for_,
            regex: /^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+([^\s].*?)(?:\s+if\s+([^\s].*))?$/,
            next: [
                Twig.logic.type.else_,
                Twig.logic.type.endfor
            ],
            open: true,
            compile: function (token) {
                var key_value = token.match[1],
                    expression = token.match[2],
                    conditional = token.match[3],
                    kv_split = null;

                token.key_var = null;
                token.value_var = null;

                if (key_value.indexOf(",") >= 0) {
                    kv_split = key_value.split(',');
                    if (kv_split.length === 2) {
                        token.key_var = kv_split[0].trim();
                        token.value_var = kv_split[1].trim();
                    } else {
                        throw new Twig.Error("Invalid expression in for loop: " + key_value);
                    }
                } else {
                    token.value_var = key_value;
                }

                // Valid expressions for a for loop
                //   for item     in expression
                //   for key,item in expression

                // Compile the expression.
                token.expression = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;

                // Compile the conditional (if available)
                if (conditional) {
                    token.conditional = Twig.expression.compile.apply(this, [{
                        type:  Twig.expression.type.expression,
                        value: conditional
                    }]).stack;
                }

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {
                // Parse expression
                var result = Twig.expression.parse.apply(this, [token.expression, context]),
                    output = [],
					len,
					index = 0,
                    keyset,
                    that = this,
                    conditional = token.conditional,
                    buildLoop = function(index, len) {
                        var isConditional = conditional !== undefined;
                        return {
                            index: index+1,
                            index0: index,
                            revindex: isConditional?undefined:len-index,
                            revindex0: isConditional?undefined:len-index-1,
                            first: (index === 0),
                            last: isConditional?undefined:(index === len-1),
                            length: isConditional?undefined:len,
                            parent: context
                        };
                    },
                    loop = function(key, value) {
                        var inner_context = Twig.lib.copy(context);

                        inner_context[token.value_var] = value;
                        if (token.key_var) {
                            inner_context[token.key_var] = key;
                        }

                        // Loop object
                        inner_context.loop = buildLoop(index, len);

                        if (conditional === undefined ||
                            Twig.expression.parse.apply(that, [conditional, inner_context]))
                        {
                            output.push(Twig.parse.apply(that, [token.output, inner_context]));
                            index += 1;
                        }
                    };

                if (result instanceof Array) {
                    len = result.length;
                    Twig.forEach(result, function (value) {
                        var key = index;

                        loop(key, value);
                    });
                } else if (result instanceof Object) {
                    if (result._keys !== undefined) {
                        keyset = result._keys;
                    } else {
                        keyset = Object.keys(result);
                    }
					len = keyset.length;
                    Twig.forEach(keyset, function(key) {
                        // Ignore the _keys property, it's internal to twig.js
                        if (key === "_keys") return;

                        loop(key,  result[key]);
                    });
                }

                // Only allow else statements if no output was generated
                continue_chain = (output.length === 0);

                return {
                    chain: continue_chain,
                    output: output.join("")
                };
            }
        },
        {
            /**
             * End if type logic tokens.
             *
             *  Format: {% endif %}
             */
            type: Twig.logic.type.endfor,
            regex: /^endfor$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Set type logic tokens.
             *
             *  Format: {% set key = expression %}
             */
            type: Twig.logic.type.set,
            regex: /^set\s+([a-zA-Z0-9_,\s]+)\s*=\s*(.+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var key = token.match[1].trim(),
                    expression = token.match[2],
                    // Compile the expression.
                    expression_stack  = Twig.expression.compile.apply(this, [{
                        type:  Twig.expression.type.expression,
                        value: expression
                    }]).stack;

                token.key = key;
                token.expression = expression_stack;

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {
                var value = Twig.expression.parse.apply(this, [token.expression, context]),
                    key = token.key;

                // set on both the global and local context
                this.context[key] = value;
                context[key] = value;

                return {
                    chain: continue_chain,
                    context: context
                };
            }
        },
        {
            /**
             * Set capture type logic tokens.
             *
             *  Format: {% set key %}
             */
            type: Twig.logic.type.setcapture,
            regex: /^set\s+([a-zA-Z0-9_,\s]+)$/,
            next: [
                Twig.logic.type.endset
            ],
            open: true,
            compile: function (token) {
                var key = token.match[1].trim();

                token.key = key;

                delete token.match;
                return token;
            },
            parse: function (token, context, continue_chain) {

                var value = Twig.parse.apply(this, [token.output, context]),
                    key = token.key;

                // set on both the global and local context
                this.context[key] = value;
                context[key] = value;

                return {
                    chain: continue_chain,
                    context: context
                };
            }
        },
        {
            /**
             * End set type block logic tokens.
             *
             *  Format: {% endset %}
             */
            type: Twig.logic.type.endset,
            regex: /^endset$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Filter logic tokens.
             *
             *  Format: {% filter upper %} or {% filter lower|escape %}
             */
            type: Twig.logic.type.filter,
            regex: /^filter\s+(.+)$/,
            next: [
                Twig.logic.type.endfilter
            ],
            open: true,
            compile: function (token) {
                var expression = "|" + token.match[1].trim();
                // Compile the expression.
                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var unfiltered = Twig.parse.apply(this, [token.output, context]),
                    stack = [{
                        type: Twig.expression.type.string,
                        value: unfiltered
                    }].concat(token.stack);

                var output = Twig.expression.parse.apply(this, [stack, context]);

                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * End filter logic tokens.
             *
             *  Format: {% endfilter %}
             */
            type: Twig.logic.type.endfilter,
            regex: /^endfilter$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% block title %}
             */
            type: Twig.logic.type.block,
            regex: /^block\s+([a-zA-Z0-9_]+)$/,
            next: [
                Twig.logic.type.endblock
            ],
            open: true,
            compile: function (token) {
                token.block = token.match[1].trim();
                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var block_output = "",
                    output = "",
                    hasParent = this.blocks[token.block] && this.blocks[token.block].indexOf(Twig.placeholders.parent) > -1;

                // Don't override previous blocks
                // Loops should be exempted as well.
                if (this.blocks[token.block] === undefined || hasParent || context.loop) {
                    block_output = Twig.expression.parse.apply(this, [{
                        type: Twig.expression.type.string,
                        value: Twig.parse.apply(this, [token.output, context])
                    }, context]);

                    if (hasParent) {
                        this.blocks[token.block] =  this.blocks[token.block].replace(Twig.placeholders.parent, block_output);
                    } else {
                        this.blocks[token.block] = block_output;
                    }
                }

                // Check if a child block has been set from a template extending this one.
                if (this.child.blocks[token.block]) {
                    output = this.child.blocks[token.block];
                } else {
                    output = this.blocks[token.block];
                }

                return {
                    chain: chain,
                    output: output
                };
            }
        },
        {
            /**
             * End block logic tokens.
             *
             *  Format: {% endblock %}
             */
            type: Twig.logic.type.endblock,
            regex: /^endblock(?:\s+([a-zA-Z0-9_]+))?$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% extends "template.twig" %}
             */
            type: Twig.logic.type.extends_,
            regex: /^extends\s+(.+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim();
                delete token.match;

                token.stack   = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;

                return token;
            },
            parse: function (token, context, chain) {
                // Resolve filename
                var file = Twig.expression.parse.apply(this, [token.stack, context]);

                // Set parent template
                this.extend = file;

                return {
                    chain: chain,
                    output: ''
                };
            }
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% extends "template.twig" %}
             */
            type: Twig.logic.type.use,
            regex: /^use\s+(.+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim();
                delete token.match;

                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;

                return token;
            },
            parse: function (token, context, chain) {
                // Resolve filename
                var file = Twig.expression.parse.apply(this, [token.stack, context]);

                // Import blocks
                this.importBlocks(file);

                return {
                    chain: chain,
                    output: ''
                };
            }
        },
        {
            /**
             * Block logic tokens.
             *
             *  Format: {% includes "template.twig" [with {some: 'values'} only] %}
             */
            type: Twig.logic.type.include,
            regex: /^include\s+(ignore missing\s+)?(.+?)\s*(?:with\s+(.+?))?\s*(only)?$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var match = token.match,
                    includeMissing = match[1] !== undefined,
                    expression = match[2].trim(),
                    withContext = match[3],
                    only = ((match[4] !== undefined) && match[4].length);

                delete token.match;

                token.only = only;
                token.includeMissing = includeMissing;

                token.stack = Twig.expression.compile.apply(this, [{
                    type:  Twig.expression.type.expression,
                    value: expression
                }]).stack;

                if (withContext !== undefined) {
                    token.withStack = Twig.expression.compile.apply(this, [{
                        type:  Twig.expression.type.expression,
                        value: withContext.trim()
                    }]).stack;
                }

                return token;
            },
            parse: function (token, context, chain) {
                // Resolve filename
                var innerContext = {},
                    withContext,
                    i,
                    template;

                if (!token.only) {
                    for (i in context) {
                        if (context.hasOwnProperty(i))
                            innerContext[i] = context[i];
                    }
                }

                if (token.withStack !== undefined) {
                    withContext = Twig.expression.parse.apply(this, [token.withStack, context]);

                    for (i in withContext) {
                        if (withContext.hasOwnProperty(i))
                            innerContext[i] = withContext[i];
                    }
                }

                var file = Twig.expression.parse.apply(this, [token.stack, innerContext]);

                // Import file
                template = this.importFile(file);

                return {
                    chain: chain,
                    output: template.render(innerContext)
                };
            }
        },
        {
            type: Twig.logic.type.spaceless,
            regex: /^spaceless$/,
            next: [
                Twig.logic.type.endspaceless
            ],
            open: true,

            // Parse the html and return it without any spaces between tags
            parse: function (token, context, chain) {
                var // Parse the output without any filter
                    unfiltered = Twig.parse.apply(this, [token.output, context]),
                    // A regular expression to find closing and opening tags with spaces between them
                    rBetweenTagSpaces = />\s+</g,
                    // Replace all space between closing and opening html tags
                    output = unfiltered.replace(rBetweenTagSpaces,'><').trim();

                return {
                    chain: chain,
                    output: output
                };
            }
        },

        // Add the {% endspaceless %} token
        {
            type: Twig.logic.type.endspaceless,
            regex: /^endspaceless$/,
            next: [ ],
            open: false
        },
        {
            /**
             * Macro logic tokens.
             *
             * Format: {% maro input(name, value, type, size) %}
             *
             */
            type: Twig.logic.type.macro,
            regex: /^macro\s+([a-zA-Z0-9_]+)\s?\((([a-zA-Z0-9_]+(,\s?)?)*)\)$/,
            next: [
                Twig.logic.type.endmacro
            ],
            open: true,
            compile: function (token) {
                var macroName = token.match[1],
                    parameters = token.match[2].split(/[ ,]+/);

                //TODO: Clean up duplicate check
                for (var i=0; i<parameters.length; i++) {
                    for (var j=0; j<parameters.length; j++){
                        if (parameters[i] === parameters[j] && i !== j) {
                            throw new Twig.Error("Duplicate arguments for parameter: "+ parameters[i]);
                        }
                    }
                }

                token.macroName = macroName;
                token.parameters = parameters;

                delete token.match;
                return token;
            },
            parse: function (token, context, chain) {
                var template = this;
                this.macros[token.macroName] = function() {
                    // Pass global context and other macros
                    var macroContext = {
                        _self: template.macros
                    }
                    // Add parameters from context to macroContext
                    for (var i=0; i<token.parameters.length; i++) {
                        var prop = token.parameters[i];
                        if(typeof arguments[i] !== 'undefined') {
                            macroContext[prop] = arguments[i];
                        } else {
                            macroContext[prop] = undefined;
                        }
                    }
                    // Render
                    return Twig.parse.apply(template, [token.output, macroContext])
                };

                return {
                    chain: chain,
                    output: ''
                };

            }
        },
        {
            /**
             * End macro logic tokens.
             *
             * Format: {% endmacro %}
             */
             type: Twig.logic.type.endmacro,
             regex: /^endmacro$/,
             next: [ ],
             open: false
        },
        {
            /*
            * import logic tokens.
            *
            * Format: {% import "template.twig" as form %}
            */
            type: Twig.logic.type.import_,
            regex: /^import\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim(),
                    contextName = token.match[2].trim();
                delete token.match;

                token.expression = expression;
                token.contextName = contextName;

                token.stack = Twig.expression.compile.apply(this, [{
                    type: Twig.expression.type.expression,
                    value: expression
                }]).stack;

                return token;
            },
            parse: function (token, context, chain) {
                if (token.expression !== "_self") {
                    var file = Twig.expression.parse.apply(this, [token.stack, context]);
                    var template = this.importMacros(file || token.expression);
                    context[token.contextName] = template.render({}, {output: 'macros'});
                }
                else {
                    context[token.contextName] = this.macros;
                }

                return {
                    chain: chain,
                    output: ''
                }

            }
        },
        {
            /*
            * from logic tokens.
            *
            * Format: {% from "template.twig" import func as form %}
            */
            type: Twig.logic.type.from,
            regex: /^from\s+(.+)\s+import\s+([a-zA-Z0-9_, ]+)$/,
            next: [ ],
            open: true,
            compile: function (token) {
                var expression = token.match[1].trim(),
                    macroExpressions = token.match[2].trim().split(/[ ,]+/),
                    macroNames = {};

                for (var i=0; i<macroExpressions.length; i++) {
                    var res = macroExpressions[i];

                    // match function as variable
                    var macroMatch = res.match(/^([a-zA-Z0-9_]+)\s+(.+)\s+as\s+([a-zA-Z0-9_]+)$/);
                    if (macroMatch) {
                        macroNames[macroMatch[1].trim()] = macroMatch[2].trim();
                    }
                    else if (res.match(/^([a-zA-Z0-9_]+)$/)) {
                        macroNames[res] = res;
                    }
                    else {
                        // ignore import
                    }

                }

                delete token.match;

                token.expression = expression;
                token.macroNames = macroNames;

                token.stack = Twig.expression.compile.apply(this, [{
                    type: Twig.expression.type.expression,
                    value: expression
                }]).stack;

                return token;
            },
            parse: function (token, context, chain) {
                var macros;

                if (token.expression !== "_self") {
                    var file = Twig.expression.parse.apply(this, [token.stack, context]);
                    var template = this.importMacros(file || token.expression);
                    macros = template.render({}, {output: 'macros'});
                }
                else {
                    macros = this.macros;
                }

                for (var macroName in token.macroNames) {
                    if (macros.hasOwnProperty(macroName)) {
                        context[token.macroNames[macroName]] = macros[macroName];
                    }
                }

                return {
                    chain: chain,
                    output: ''
                }

            }
        }

    ];


    /**
     * Registry for logic handlers.
     */
    Twig.logic.handler = {};

    /**
     * Define a new token type, available at Twig.logic.type.{type}
     */
    Twig.logic.extendType = function (type, value) {
        value = value || ("Twig.logic.type" + type);
        Twig.logic.type[type] = value;
    };

    /**
     * Extend the logic parsing functionality with a new token definition.
     *
     * // Define a new tag
     * Twig.logic.extend({
     *     type: Twig.logic.type.{type},
     *     // The pattern to match for this token
     *     regex: ...,
     *     // What token types can follow this token, leave blank if any.
     *     next: [ ... ]
     *     // Create and return compiled version of the token
     *     compile: function(token) { ... }
     *     // Parse the compiled token with the context provided by the render call
     *     //   and whether this token chain is complete.
     *     parse: function(token, context, chain) { ... }
     * });
     *
     * @param {Object} definition The new logic expression.
     */
    Twig.logic.extend = function (definition) {

        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        }
        if (Twig.logic.type[definition.type]) {
            throw new Twig.Error("Unable to extend logic definitions. Type " +
                                 definition.type + " is already defined.");
        } else {
            Twig.logic.extendType(definition.type);
        }
        Twig.logic.handler[definition.type] = definition;
    };

    // Extend with built-in expressions
    while (Twig.logic.definitions.length > 0) {
        Twig.logic.extend(Twig.logic.definitions.shift());
    }

    /**
     * Compile a logic token into an object ready for parsing.
     *
     * @param {Object} raw_token An uncompiled logic token.
     *
     * @return {Object} A compiled logic token, ready for parsing.
     */
    Twig.logic.compile = function (raw_token) {
        var expression = raw_token.value.trim(),
            token = Twig.logic.tokenize.apply(this, [expression]),
            token_template = Twig.logic.handler[token.type];

        // Check if the token needs compiling
        if (token_template.compile) {
            token = token_template.compile.apply(this, [token]);
            Twig.log.trace("Twig.logic.compile: ", "Compiled logic token to ", token);
        }

        return token;
    };

    /**
     * Tokenize logic expressions. This function matches token expressions against regular
     * expressions provided in token definitions provided with Twig.logic.extend.
     *
     * @param {string} expression the logic token expression to tokenize
     *                (i.e. what's between {% and %})
     *
     * @return {Object} The matched token with type set to the token type and match to the regex match.
     */
    Twig.logic.tokenize = function (expression) {
        var token = {},
            token_template_type = null,
            token_type = null,
            token_regex = null,
            regex_array = null,
            regex = null,
            match = null;

        // Ignore whitespace around expressions.
        expression = expression.trim();

        for (token_template_type in Twig.logic.handler) {
            if (Twig.logic.handler.hasOwnProperty(token_template_type)) {
                // Get the type and regex for this template type
                token_type = Twig.logic.handler[token_template_type].type;
                token_regex = Twig.logic.handler[token_template_type].regex;

                // Handle multiple regular expressions per type.
                regex_array = [];
                if (token_regex instanceof Array) {
                    regex_array = token_regex;
                } else {
                    regex_array.push(token_regex);
                }

                // Check regular expressions in the order they were specified in the definition.
                while (regex_array.length > 0) {
                    regex = regex_array.shift();
                    match = regex.exec(expression.trim());
                    if (match !== null) {
                        token.type  = token_type;
                        token.match = match;
                        Twig.log.trace("Twig.logic.tokenize: ", "Matched a ", token_type, " regular expression of ", match);
                        return token;
                    }
                }
            }
        }

        // No regex matches
        throw new Twig.Error("Unable to parse '" + expression.trim() + "'");
    };

    /**
     * Parse a logic token within a given context.
     *
     * What are logic chains?
     *      Logic chains represent a series of tokens that are connected,
     *          for example:
     *          {% if ... %} {% else %} {% endif %}
     *
     *      The chain parameter is used to signify if a chain is open of closed.
     *      open:
     *          More tokens in this chain should be parsed.
     *      closed:
     *          This token chain has completed parsing and any additional
     *          tokens (else, elseif, etc...) should be ignored.
     *
     * @param {Object} token The compiled token.
     * @param {Object} context The render context.
     * @param {boolean} chain Is this an open logic chain. If false, that means a
     *                        chain is closed and no further cases should be parsed.
     */
    Twig.logic.parse = function (token, context, chain) {
        var output = '',
            token_template;

        context = context || { };

        Twig.log.debug("Twig.logic.parse: ", "Parsing logic token ", token);

        token_template = Twig.logic.handler[token.type];

        if (token_template.parse) {
            output = token_template.parse.apply(this, [token, context, chain]);
        }
        return output;
    };

    return Twig;

})(Twig || { });
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.expression.js
//
// This file handles tokenizing, compiling and parsing expressions.
var Twig = (function (Twig) {
    

    /**
     * Namespace for expression handling.
     */
    Twig.expression = { };

    /**
     * Reserved word that can't be used as variable names.
     */
    Twig.expression.reservedWords = [
        "true", "false", "null", "_context"
    ];

    /**
     * The type of tokens used in expressions.
     */
    Twig.expression.type = {
        comma:      'Twig.expression.type.comma',
        operator: {
            unary:  'Twig.expression.type.operator.unary',
            binary: 'Twig.expression.type.operator.binary'
        },
        string:     'Twig.expression.type.string',
        bool:       'Twig.expression.type.bool',
        array: {
            start:  'Twig.expression.type.array.start',
            end:    'Twig.expression.type.array.end'
        },
        object: {
            start:  'Twig.expression.type.object.start',
            end:    'Twig.expression.type.object.end'
        },
        parameter: {
            start:  'Twig.expression.type.parameter.start',
            end:    'Twig.expression.type.parameter.end'
        },
        key: {
            period:   'Twig.expression.type.key.period',
            brackets: 'Twig.expression.type.key.brackets'
        },
        filter:     'Twig.expression.type.filter',
        _function:  'Twig.expression.type._function',
        variable:   'Twig.expression.type.variable',
        number:     'Twig.expression.type.number',
        _null:     'Twig.expression.type.null',
        context:    'Twig.expression.type.context',
        test:       'Twig.expression.type.test'
    };

    Twig.expression.set = {
        // What can follow an expression (in general)
        operations: [
            Twig.expression.type.filter,
            Twig.expression.type.operator.unary,
            Twig.expression.type.operator.binary,
            Twig.expression.type.array.end,
            Twig.expression.type.object.end,
            Twig.expression.type.parameter.end,
            Twig.expression.type.comma,
            Twig.expression.type.test
        ],
        expressions: [
            Twig.expression.type._function,
            Twig.expression.type.bool,
            Twig.expression.type.string,
            Twig.expression.type.variable,
            Twig.expression.type.number,
            Twig.expression.type._null,
            Twig.expression.type.context,
            Twig.expression.type.parameter.start,
            Twig.expression.type.array.start,
            Twig.expression.type.object.start
        ]
    };

    // Most expressions allow a '.' or '[' after them, so we provide a convenience set
    Twig.expression.set.operations_extended = Twig.expression.set.operations.concat([
                    Twig.expression.type.key.period,
                    Twig.expression.type.key.brackets]);

    // Some commonly used compile and parse functions.
    Twig.expression.fn = {
        compile: {
            push: function(token, stack, output) {
                output.push(token);
            },
            push_both: function(token, stack, output) {
                output.push(token);
                stack.push(token);
            }
        },
        parse: {
            push: function(token, stack, context) {
                stack.push(token);
            },
            push_value: function(token, stack, context) {
                stack.push(token.value);
            }
        }
    };

    // The regular expressions and compile/parse logic used to match tokens in expressions.
    //
    // Properties:
    //
    //      type:  The type of expression this matches
    //
    //      regex: One or more regular expressions that matche the format of the token.
    //
    //      next:  Valid tokens that can occur next in the expression.
    //
    // Functions:
    //
    //      compile: A function that compiles the raw regular expression match into a token.
    //
    //      parse:   A function that parses the compiled token into output.
    //
    Twig.expression.definitions = [
        {
            type: Twig.expression.type.test,
            regex: /^is\s+(not)?\s*([a-zA-Z_][a-zA-Z0-9_]*)/,
            next: Twig.expression.set.operations.concat([Twig.expression.type.parameter.start]),
            compile: function(token, stack, output) {
                token.filter   = token.match[2];
                token.modifier = token.match[1];
                delete token.match;
                delete token.value;
                output.push(token);
            },
            parse: function(token, stack, context) {
                var value = stack.pop(),
                    params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
                    result = Twig.test(token.filter, value, params);

                if (token.modifier == 'not') {
                    stack.push(!result);
                } else {
                    stack.push(result);
                }
            }
        },
        {
            type: Twig.expression.type.comma,
            // Match a comma
            regex: /^,/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.array.end, Twig.expression.type.object.end]),
            compile: function(token, stack, output) {
                var i = stack.length - 1,
                    stack_token;

                delete token.match;
                delete token.value;

                // pop tokens off the stack until the start of the object
                for(;i >= 0; i--) {
                    stack_token = stack.pop();
                    if (stack_token.type === Twig.expression.type.object.start
                            || stack_token.type === Twig.expression.type.parameter.start
                            || stack_token.type === Twig.expression.type.array.start) {
                        stack.push(stack_token);
                        break;
                    }
                    output.push(stack_token);
                }
                output.push(token);
            }
        },
        {
            type: Twig.expression.type.operator.binary,
            // Match any of +, *, /, -, %, ~, <, <=, >, >=, !=, ==, **, ?, :, and, or, not
            regex: /(^[\+\-~%\?\:]|^[!=]==?|^[!<>]=?|^\*\*?|^\/\/?|^and\s+|^or\s+|^in\s+|^not in\s+|^\.\.)/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.operator.unary]),
            compile: function(token, stack, output) {
                delete token.match;

                token.value = token.value.trim();
                var value = token.value,
                    operator = Twig.expression.operator.lookup(value, token);

                Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator, " from ", value);

                while (stack.length > 0 &&
                       (stack[stack.length-1].type == Twig.expression.type.operator.unary || stack[stack.length-1].type == Twig.expression.type.operator.binary) &&
                            (
                                (operator.associativity === Twig.expression.operator.leftToRight &&
                                 operator.precidence    >= stack[stack.length-1].precidence) ||

                                (operator.associativity === Twig.expression.operator.rightToLeft &&
                                 operator.precidence    >  stack[stack.length-1].precidence)
                            )
                       ) {
                     var temp = stack.pop();
                     output.push(temp);
                }

                if (value === ":") {
                    // Check if this is a ternary or object key being set
                    if (stack[stack.length - 1] && stack[stack.length-1].value === "?") {
                        // Continue as normal for a ternary
                    } else {
                        // This is not a ternary so we push the token to the output where it can be handled
                        //   when the assocated object is closed.
                        var key_token = output.pop();

                        if (key_token.type === Twig.expression.type.string ||
                                key_token.type === Twig.expression.type.variable ||
                                key_token.type === Twig.expression.type.number) {
                            token.key = key_token.value;

                        } else {
                            throw new Twig.Error("Unexpected value before ':' of " + key_token.type + " = " + key_token.value);
                        }

                        output.push(token);
                        return;
                    }
                } else {
                    stack.push(operator);
                }
            },
            parse: function(token, stack, context) {
                if (token.key) {
                    // handle ternary ':' operator
                    stack.push(token);
                } else {
                    Twig.expression.operator.parse(token.value, stack);
                }
            }
        },
        {
            type: Twig.expression.type.operator.unary,
            // Match any of not
            regex: /(^not\s+)/,
            next: Twig.expression.set.expressions,
            compile: function(token, stack, output) {
                delete token.match;

                token.value = token.value.trim();
                var value = token.value,
                    operator = Twig.expression.operator.lookup(value, token);

                Twig.log.trace("Twig.expression.compile: ", "Operator: ", operator, " from ", value);

                while (stack.length > 0 &&
                       (stack[stack.length-1].type == Twig.expression.type.operator.unary || stack[stack.length-1].type == Twig.expression.type.operator.binary) &&
                            (
                                (operator.associativity === Twig.expression.operator.leftToRight &&
                                 operator.precidence    >= stack[stack.length-1].precidence) ||

                                (operator.associativity === Twig.expression.operator.rightToLeft &&
                                 operator.precidence    >  stack[stack.length-1].precidence)
                            )
                       ) {
                     var temp = stack.pop();
                     output.push(temp);
                }

                stack.push(operator);
            },
            parse: function(token, stack, context) {
                Twig.expression.operator.parse(token.value, stack);
            }
        },
        {
            /**
             * Match a string. This is anything between a pair of single or double quotes.
             */
            type: Twig.expression.type.string,
            // See: http://blog.stevenlevithan.com/archives/match-quoted-string
            regex: /^(["'])(?:(?=(\\?))\2.)*?\1/,
            next: Twig.expression.set.operations,
            compile: function(token, stack, output) {
                var value = token.value;
                delete token.match

                // Remove the quotes from the string
                if (value.substring(0, 1) === '"') {
                    value = value.replace('\\"', '"');
                } else {
                    value = value.replace("\\'", "'");
                }
                token.value = value.substring(1, value.length-1).replace( /\\n/g, "\n" ).replace( /\\r/g, "\r" );
                Twig.log.trace("Twig.expression.compile: ", "String value: ", token.value);
                output.push(token);
            },
            parse: Twig.expression.fn.parse.push_value
        },
        {
            /**
             * Match a parameter set start.
             */
            type: Twig.expression.type.parameter.start,
            regex: /^\(/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.parameter.end]),
            compile: Twig.expression.fn.compile.push_both,
            parse: Twig.expression.fn.parse.push
        },
        {
            /**
             * Match a parameter set end.
             */
            type: Twig.expression.type.parameter.end,
            regex: /^\)/,
            next: Twig.expression.set.operations_extended,
            compile: function(token, stack, output) {
                var stack_token,
                    end_token = token;

                stack_token = stack.pop();
                while(stack.length > 0 && stack_token.type != Twig.expression.type.parameter.start) {
                    output.push(stack_token);
                    stack_token = stack.pop();
                }

                // Move contents of parens into preceding filter
                var param_stack = [];
                while(token.type !== Twig.expression.type.parameter.start) {
                    // Add token to arguments stack
                    param_stack.unshift(token);
                    token = output.pop();
                }
                param_stack.unshift(token);

                var is_expression = false;

                // Get the token preceding the parameters
                token = output[output.length-1];

                if (token === undefined ||
                    (token.type !== Twig.expression.type._function &&
                    token.type !== Twig.expression.type.filter &&
                    token.type !== Twig.expression.type.test &&
                    token.type !== Twig.expression.type.key.brackets &&
                    token.type !== Twig.expression.type.key.period)) {

                    end_token.expression = true;

                    // remove start and end token from stack
                    param_stack.pop();
                    param_stack.shift();

                    end_token.params = param_stack;

                    output.push(end_token);

                } else {
                    end_token.expression = false;
                    token.params = param_stack;
                }
            },
            parse: function(token, stack, context) {
                var new_array = [],
                    array_ended = false,
                    value = null;

                if (token.expression) {
                    value = Twig.expression.parse.apply(this, [token.params, context])
                    stack.push(value);

                } else {

                    while (stack.length > 0) {
                        value = stack.pop();
                        // Push values into the array until the start of the array
                        if (value && value.type && value.type == Twig.expression.type.parameter.start) {
                            array_ended = true;
                            break;
                        }
                        new_array.unshift(value);
                    }

                    if (!array_ended) {
                        throw new Twig.Error("Expected end of parameter set.");
                    }

                    stack.push(new_array);
                }
            }
        },
        {
            /**
             * Match an array start.
             */
            type: Twig.expression.type.array.start,
            regex: /^\[/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.array.end]),
            compile: Twig.expression.fn.compile.push_both,
            parse: Twig.expression.fn.parse.push
        },
        {
            /**
             * Match an array end.
             */
            type: Twig.expression.type.array.end,
            regex: /^\]/,
            next: Twig.expression.set.operations_extended,
            compile: function(token, stack, output) {
                var i = stack.length - 1,
                    stack_token;
                // pop tokens off the stack until the start of the object
                for(;i >= 0; i--) {
                    stack_token = stack.pop();
                    if (stack_token.type === Twig.expression.type.array.start) {
                        break;
                    }
                    output.push(stack_token);
                }
                output.push(token);
            },
            parse: function(token, stack, context) {
                var new_array = [],
                    array_ended = false,
                    value = null;

                while (stack.length > 0) {
                    value = stack.pop();
                    // Push values into the array until the start of the array
                    if (value.type && value.type == Twig.expression.type.array.start) {
                        array_ended = true;
                        break;
                    }
                    new_array.unshift(value);
                }
                if (!array_ended) {
                    throw new Twig.Error("Expected end of array.");
                }

                stack.push(new_array);
            }
        },
        // Token that represents the start of a hash map '}'
        //
        // Hash maps take the form:
        //    { "key": 'value', "another_key": item }
        //
        // Keys must be quoted (either single or double) and values can be any expression.
        {
            type: Twig.expression.type.object.start,
            regex: /^\{/,
            next: Twig.expression.set.expressions.concat([Twig.expression.type.object.end]),
            compile: Twig.expression.fn.compile.push_both,
            parse: Twig.expression.fn.parse.push
        },

        // Token that represents the end of a Hash Map '}'
        //
        // This is where the logic for building the internal
        // representation of a hash map is defined.
        {
            type: Twig.expression.type.object.end,
            regex: /^\}/,
            next: Twig.expression.set.operations_extended,
            compile: function(token, stack, output) {
                var i = stack.length-1,
                    stack_token;

                // pop tokens off the stack until the start of the object
                for(;i >= 0; i--) {
                    stack_token = stack.pop();
                    if (stack_token && stack_token.type === Twig.expression.type.object.start) {
                        break;
                    }
                    output.push(stack_token);
                }
                output.push(token);
            },
            parse: function(end_token, stack, context) {
                var new_object = {},
                    object_ended = false,
                    token = null,
                    token_key = null,
                    has_value = false,
                    value = null;

                while (stack.length > 0) {
                    token = stack.pop();
                    // Push values into the array until the start of the object
                    if (token && token.type && token.type === Twig.expression.type.object.start) {
                        object_ended = true;
                        break;
                    }
                    if (token && token.type && (token.type === Twig.expression.type.operator.binary || token.type === Twig.expression.type.operator.unary) && token.key) {
                        if (!has_value) {
                            throw new Twig.Error("Missing value for key '" + token.key + "' in object definition.");
                        }
                        new_object[token.key] = value;

                        // Preserve the order that elements are added to the map
                        // This is necessary since JavaScript objects don't
                        // guarantee the order of keys
                        if (new_object._keys === undefined) new_object._keys = [];
                        new_object._keys.unshift(token.key);

                        // reset value check
                        value = null;
                        has_value = false;

                    } else {
                        has_value = true;
                        value = token;
                    }
                }
                if (!object_ended) {
                    throw new Twig.Error("Unexpected end of object.");
                }

                stack.push(new_object);
            }
        },

        // Token representing a filter
        //
        // Filters can follow any expression and take the form:
        //    expression|filter(optional, args)
        //
        // Filter parsing is done in the Twig.filters namespace.
        {
            type: Twig.expression.type.filter,
            // match a | then a letter or _, then any number of letters, numbers, _ or -
            regex: /^\|\s?([a-zA-Z_][a-zA-Z0-9_\-]*)/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: function(token, stack, output) {
                token.value = token.match[1];
                output.push(token);
            },
            parse: function(token, stack, context) {
                var input = stack.pop(),
                    params = token.params && Twig.expression.parse.apply(this, [token.params, context]);

                stack.push(Twig.filter.apply(this, [token.value, input, params]));
            }
        },
        {
            type: Twig.expression.type._function,
            // match any letter or _, then any number of letters, numbers, _ or - followed by (
            regex: /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/,
            next: Twig.expression.type.parameter.start,
            transform: function(match, tokens) {
                return '(';
            },
            compile: function(token, stack, output) {
                var fn = token.match[1];
                token.fn = fn;
                // cleanup token
                delete token.match;
                delete token.value;

                output.push(token);
            },
            parse: function(token, stack, context) {
                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
                    fn     = token.fn,
                    value;

                if (Twig.functions[fn]) {
                    // Get the function from the built-in functions
                    value = Twig.functions[fn].apply(this, params);

                } else if (typeof context[fn] == 'function') {
                    // Get the function from the user/context defined functions
                    value = context[fn].apply(context, params);

                } else {
                    throw new Twig.Error(fn + ' function does not exist and is not defined in the context');
                }

                stack.push(value);
            }
        },

        // Token representing a variable.
        //
        // Variables can contain letters, numbers, underscores and
        // dashes, but must start with a letter or underscore.
        //
        // Variables are retrieved from the render context and take
        // the value of 'undefined' if the given variable doesn't
        // exist in the context.
        {
            type: Twig.expression.type.variable,
            // match any letter or _, then any number of letters, numbers, _ or -
            regex: /^[a-zA-Z_][a-zA-Z0-9_]*/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: Twig.expression.fn.compile.push,
            validate: function(match, tokens) {
                return (Twig.indexOf(Twig.expression.reservedWords, match[0]) < 0);
            },
            parse: function(token, stack, context) {
                // Get the variable from the context
                var value = Twig.expression.resolve(context[token.value], context);
                stack.push(value);
            }
        },
        {
            type: Twig.expression.type.key.period,
            regex: /^\.([a-zA-Z0-9_]+)/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: function(token, stack, output) {
                token.key = token.match[1];
                delete token.match;
                delete token.value;

                output.push(token);
            },
            parse: function(token, stack, context) {
                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
                    key = token.key,
                    object = stack.pop(),
                    value;

                if (object === null || object === undefined) {
                    if (this.options.strict_variables) {
                        throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
                    } else {
                        return null;
                    }
                }

                var capitalize = function(value) {return value.substr(0, 1).toUpperCase() + value.substr(1);};

                // Get the variable from the context
                if (typeof object === 'object' && key in object) {
                    value = object[key];
                } else if (object["get"+capitalize(key)] !== undefined) {
                    value = object["get"+capitalize(key)];
                } else if (object["is"+capitalize(key)] !== undefined) {
                    value = object["is"+capitalize(key)];
                } else {
                    value = null;
                }
                stack.push(Twig.expression.resolve(value, object, params));
            }
        },
        {
            type: Twig.expression.type.key.brackets,
            regex: /^\[([^\]]*)\]/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: function(token, stack, output) {
                var match = token.match[1];
                delete token.value;
                delete token.match;

                // The expression stack for the key
                token.stack = Twig.expression.compile({
                    value: match
                }).stack;

                output.push(token);
            },
            parse: function(token, stack, context) {
                // Evaluate key
                var params = token.params && Twig.expression.parse.apply(this, [token.params, context]),
                    key = Twig.expression.parse.apply(this, [token.stack, context]),
                    object = stack.pop(),
                    value;

                if (object === null || object === undefined) {
                    if (this.options.strict_variables) {
                        throw new Twig.Error("Can't access a key " + key + " on an null or undefined object.");
                    } else {
                        return null;
                    }
                }

                // Get the variable from the context
                if (typeof object === 'object' && key in object) {
                    value = object[key];
                } else {
                    value = null;
                }
                stack.push(Twig.expression.resolve(value, object, params));
            }
        },
        {
            /**
             * Match a null value.
             */
            type: Twig.expression.type._null,
            // match a number
            regex: /^null/,
            next: Twig.expression.set.operations,
            compile: function(token, stack, output) {
                delete token.match;
                token.value = null;
                output.push(token);
            },
            parse: Twig.expression.fn.parse.push_value
        },
        {
            /**
             * Match the context
             */
            type: Twig.expression.type.context,
            regex: /^_context/,
            next: Twig.expression.set.operations_extended.concat([
                    Twig.expression.type.parameter.start]),
            compile: Twig.expression.fn.compile.push,
            parse: function(token, stack, context) {
                stack.push(context);
            }
        },
        {
            /**
             * Match a number (integer or decimal)
             */
            type: Twig.expression.type.number,
            // match a number
            regex: /^\-?\d+(\.\d+)?/,
            next: Twig.expression.set.operations,
            compile: function(token, stack, output) {
                token.value = Number(token.value);
                output.push(token);
            },
            parse: Twig.expression.fn.parse.push_value
        },
        {
            /**
             * Match a boolean
             */
            type: Twig.expression.type.bool,
            regex: /^(true|false)/,
            next: Twig.expression.set.operations,
            compile: function(token, stack, output) {
                token.value = (token.match[0] == "true");
                delete token.match;
                output.push(token);
            },
            parse: Twig.expression.fn.parse.push_value
        }
    ];

    /**
     * Resolve a context value.
     *
     * If the value is a function, it is executed with a context parameter.
     *
     * @param {string} key The context object key.
     * @param {Object} context The render context.
     */
    Twig.expression.resolve = function(value, context, params) {
        if (typeof value == 'function') {
            return value.apply(context, params || []);
        } else {
            return value;
        }
    };

    /**
     * Registry for logic handlers.
     */
    Twig.expression.handler = {};

    /**
     * Define a new expression type, available at Twig.logic.type.{type}
     *
     * @param {string} type The name of the new type.
     */
    Twig.expression.extendType = function (type) {
        Twig.expression.type[type] = "Twig.expression.type." + type;
    };

    /**
     * Extend the expression parsing functionality with a new definition.
     *
     * Token definitions follow this format:
     *  {
     *      type:     One of Twig.expression.type.[type], either pre-defined or added using
     *                    Twig.expression.extendType
     *
     *      next:     Array of types from Twig.expression.type that can follow this token,
     *
     *      regex:    A regex or array of regex's that should match the token.
     *
     *      compile: function(token, stack, output) called when this token is being compiled.
     *                   Should return an object with stack and output set.
     *
     *      parse:   function(token, stack, context) called when this token is being parsed.
     *                   Should return an object with stack and context set.
     *  }
     *
     * @param {Object} definition A token definition.
     */
    Twig.expression.extend = function (definition) {
        if (!definition.type) {
            throw new Twig.Error("Unable to extend logic definition. No type provided for " + definition);
        }
        Twig.expression.handler[definition.type] = definition;
    };

    // Extend with built-in expressions
    while (Twig.expression.definitions.length > 0) {
        Twig.expression.extend(Twig.expression.definitions.shift());
    }

    /**
     * Break an expression into tokens defined in Twig.expression.definitions.
     *
     * @param {string} expression The string to tokenize.
     *
     * @return {Array} An array of tokens.
     */
    Twig.expression.tokenize = function (expression) {
        var tokens = [],
            // Keep an offset of the location in the expression for error messages.
            exp_offset = 0,
            // The valid next tokens of the previous token
            next = null,
            // Match information
            type, regex, regex_array,
            // The possible next token for the match
            token_next,
            // Has a match been found from the definitions
            match_found, invalid_matches = [], match_function;

        match_function = function () {
            var match = Array.prototype.slice.apply(arguments),
                string = match.pop(),
                offset = match.pop();

            Twig.log.trace("Twig.expression.tokenize",
                           "Matched a ", type, " regular expression of ", match);

            if (next && Twig.indexOf(next, type) < 0) {
                invalid_matches.push(
                    type + " cannot follow a " + tokens[tokens.length - 1].type +
                           " at template:" + exp_offset + " near '" + match[0].substring(0, 20) +
                           "...'"
                );
                // Not a match, don't change the expression
                return match[0];
            }

            // Validate the token if a validation function is provided
            if (Twig.expression.handler[type].validate &&
                    !Twig.expression.handler[type].validate(match, tokens)) {
                return match[0];
            }

            invalid_matches = [];

            tokens.push({
                type:  type,
                value: match[0],
                match: match
            });

            match_found = true;
            next = token_next;
            exp_offset += match[0].length;

            // Does the token need to return output back to the expression string
            // e.g. a function match of cycle( might return the '(' back to the expression
            // This allows look-ahead to differentiate between token types (e.g. functions and variable names)
            if (Twig.expression.handler[type].transform) {
                return Twig.expression.handler[type].transform(match, tokens);
            }
            return '';
        };

        Twig.log.debug("Twig.expression.tokenize", "Tokenizing expression ", expression);

        while (expression.length > 0) {
            expression = expression.trim();
            for (type in Twig.expression.handler) {
                if (Twig.expression.handler.hasOwnProperty(type)) {
                    token_next = Twig.expression.handler[type].next;
                    regex = Twig.expression.handler[type].regex;
                    // Twig.log.trace("Checking type ", type, " on ", expression);
                    if (regex instanceof Array) {
                        regex_array = regex;
                    } else {
                        regex_array = [regex];
                    }

                    match_found = false;
                    while (regex_array.length > 0) {
                        regex = regex_array.pop();
                        expression = expression.replace(regex, match_function);
                    }
                    // An expression token has been matched. Break the for loop and start trying to
                    //  match the next template (if expression isn't empty.)
                    if (match_found) {
                        break;
                    }
                }
            }
            if (!match_found) {
                if (invalid_matches.length > 0) {
                    throw new Twig.Error(invalid_matches.join(" OR "));
                } else {
                    throw new Twig.Error("Unable to parse '" + expression + "' at template position" + exp_offset);
                }
            }
        }

        Twig.log.trace("Twig.expression.tokenize", "Tokenized to ", tokens);
        return tokens;
    };

    /**
     * Compile an expression token.
     *
     * @param {Object} raw_token The uncompiled token.
     *
     * @return {Object} The compiled token.
     */
    Twig.expression.compile = function (raw_token) {
        var expression = raw_token.value,
            // Tokenize expression
            tokens = Twig.expression.tokenize(expression),
            token = null,
            output = [],
            stack = [],
            token_template = null;

        Twig.log.trace("Twig.expression.compile: ", "Compiling ", expression);

        // Push tokens into RPN stack using the Sunting-yard algorithm
        // See http://en.wikipedia.org/wiki/Shunting_yard_algorithm

        while (tokens.length > 0) {
            token = tokens.shift();
            token_template = Twig.expression.handler[token.type];

            Twig.log.trace("Twig.expression.compile: ", "Compiling ", token);

            // Compile the template
            token_template.compile && token_template.compile(token, stack, output);

            Twig.log.trace("Twig.expression.compile: ", "Stack is", stack);
            Twig.log.trace("Twig.expression.compile: ", "Output is", output);
        }

        while(stack.length > 0) {
            output.push(stack.pop());
        }

        Twig.log.trace("Twig.expression.compile: ", "Final output is", output);

        raw_token.stack = output;
        delete raw_token.value;

        return raw_token;
    };


    /**
     * Parse an RPN expression stack within a context.
     *
     * @param {Array} tokens An array of compiled expression tokens.
     * @param {Object} context The render context to parse the tokens with.
     *
     * @return {Object} The result of parsing all the tokens. The result
     *                  can be anything, String, Array, Object, etc... based on
     *                  the given expression.
     */
    Twig.expression.parse = function (tokens, context) {
        var that = this;

        // If the token isn't an array, make it one.
        if (!(tokens instanceof Array)) {
            tokens = [tokens];
        }

        // The output stack
        var stack = [],
            token_template = null;

        Twig.forEach(tokens, function (token) {
            token_template = Twig.expression.handler[token.type];

            token_template.parse && token_template.parse.apply(that, [token, stack, context]);
        });

        // Pop the final value off the stack
        return stack.pop();
    };

    return Twig;

})( Twig || { } );
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.expression.operator.js
//
// This file handles operator lookups and parsing.
var Twig = (function (Twig) {
    

    /**
     * Operator associativity constants.
     */
    Twig.expression.operator = {
        leftToRight: 'leftToRight',
        rightToLeft: 'rightToLeft'
    };

    var containment = function(a, b) {
        if (b.indexOf !== undefined) {
            // String
            return a === b || a !== '' && b.indexOf(a) > -1;

        } else {
            var el;
            for (el in b) {
                if (b.hasOwnProperty(el) && b[el] === a) {
                    return true;
                }
            }
            return false;
        }
    };

    /**
     * Get the precidence and associativity of an operator. These follow the order that C/C++ use.
     * See http://en.wikipedia.org/wiki/Operators_in_C_and_C++ for the table of values.
     */
    Twig.expression.operator.lookup = function (operator, token) {
        switch (operator) {
            case "..":
            case 'not in':
            case 'in':
                token.precidence = 20;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case ',':
                token.precidence = 18;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            // Ternary
            case '?':
            case ':':
                token.precidence = 16;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            case 'or':
                token.precidence = 14;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'and':
                token.precidence = 13;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '==':
            case '!=':
                token.precidence = 9;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '<':
            case '<=':
            case '>':
            case '>=':
                token.precidence = 8;
                token.associativity = Twig.expression.operator.leftToRight;
                break;


            case '~': // String concatination
            case '+':
            case '-':
                token.precidence = 6;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case '//':
            case '**':
            case '*':
            case '/':
            case '%':
                token.precidence = 5;
                token.associativity = Twig.expression.operator.leftToRight;
                break;

            case 'not':
                token.precidence = 3;
                token.associativity = Twig.expression.operator.rightToLeft;
                break;

            default:
                throw new Twig.Error(operator + " is an unknown operator.");
        }
        token.operator = operator;
        return token;
    };

    /**
     * Handle operations on the RPN stack.
     *
     * Returns the updated stack.
     */
    Twig.expression.operator.parse = function (operator, stack) {
        Twig.log.trace("Twig.expression.operator.parse: ", "Handling ", operator);
        var a, b, c;
        switch (operator) {
            case ':':
                // Ignore
                break;

            case '?':
                c = stack.pop(); // false expr
                b = stack.pop(); // true expr
                a = stack.pop(); // conditional
                if (a) {
                    stack.push(b);
                } else {
                    stack.push(c);
                }
                break;

            case '+':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a + b);
                break;

            case '-':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a - b);
                break;

            case '*':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a * b);
                break;

            case '/':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a / b);
                break;

            case '//':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(parseInt(a / b));
                break;

            case '%':
                b = parseFloat(stack.pop());
                a = parseFloat(stack.pop());
                stack.push(a % b);
                break;

            case '~':
                b = stack.pop();
                a = stack.pop();
                stack.push( (a !== undefined ? a.toString() : "")
                          + (b !== undefined ? b.toString() : "") );
                break;

            case 'not':
            case '!':
                stack.push(!stack.pop());
                break;

            case '<':
                b = stack.pop();
                a = stack.pop();
                stack.push(a < b);
                break;

            case '<=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a <= b);
                break;

            case '>':
                b = stack.pop();
                a = stack.pop();
                stack.push(a > b);
                break;

            case '>=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a >= b);
                break;

            case '===':
                b = stack.pop();
                a = stack.pop();
                stack.push(a === b);
                break;

            case '==':
                b = stack.pop();
                a = stack.pop();
                stack.push(a == b);
                break;

            case '!==':
                b = stack.pop();
                a = stack.pop();
                stack.push(a !== b);
                break;

            case '!=':
                b = stack.pop();
                a = stack.pop();
                stack.push(a != b);
                break;

            case 'or':
                b = stack.pop();
                a = stack.pop();
                stack.push(a || b);
                break;

            case 'and':
                b = stack.pop();
                a = stack.pop();
                stack.push(a && b);
                break;

            case '**':
                b = stack.pop();
                a = stack.pop();
                stack.push(Math.pow(a, b));
                break;


            case 'not in':
                b = stack.pop();
                a = stack.pop();
                stack.push( !containment(a, b) );
                break;

            case 'in':
                b = stack.pop();
                a = stack.pop();
                stack.push( containment(a, b) );
                break;

            case '..':
                b = stack.pop();
                a = stack.pop();
                stack.push( Twig.functions.range(a, b) );
                break;

            default:
                throw new Twig.Error(operator + " is an unknown operator.");
        }
    };

    return Twig;

})( Twig || { } );
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.filters.js
//
// This file handles parsing filters.
var Twig = (function (Twig) {

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    Twig.filters = {
        // String Filters
        upper:  function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.toUpperCase();
        },
        lower: function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.toLowerCase();
        },
        capitalize: function(value) {
            if ( typeof value !== "string" ) {
                 return value;
            }

            return value.substr(0, 1).toUpperCase() + value.toLowerCase().substr(1);
        },
        title: function(value) {
            if ( typeof value !== "string" ) {
               return value;
            }

            return value.toLowerCase().replace( /(^|\s)([a-z])/g , function(m, p1, p2){
                return p1 + p2.toUpperCase();
            });
        },
        length: function(value) {
            if (Twig.lib.is("Array", value) || typeof value === "string") {
                return value.length;
            } else if (Twig.lib.is("Object", value)) {
                if (value._keys === undefined) {
                    return Object.keys(value).length;
                } else {
                    return value._keys.length;
                }
            } else {
                return 0;
            }
        },

        // Array/Object Filters
        reverse: function(value) {
            if (is("Array", value)) {
                return value.reverse();
            } else if (is("String", value)) {
                return value.split("").reverse().join("");
            } else if (value instanceof Object) {
                var keys = value._keys || Object.keys(value).reverse();
                value._keys = keys;
                return value;
            }
        },
        sort: function(value) {
            if (is("Array", value)) {
                return value.sort();
            } else if (value instanceof Object) {
                // Sorting objects isn't obvious since the order of
                // returned keys isn't guaranteedin JavaScript.
                // Because of this we use a "hidden" key called _keys to
                // store the keys in the order we want to return them.

                delete value._keys;
                var keys = Object.keys(value),
                    sorted_keys = keys.sort(function(a, b) {
                        return value[a] > value[b];
                    });
                value._keys = sorted_keys;
                return value;
            }
        },
        keys: function(value) {
            if (value === undefined || value === null){
                return;
           }

            var keyset = value._keys || Object.keys(value),
                output = [];

            Twig.forEach(keyset, function(key) {
                if (key === "_keys") return; // Ignore the _keys property
                if (value.hasOwnProperty(key)) {
                    output.push(key);
                }
            });
            return output;
        },
        url_encode: function(value) {
            if (value === undefined || value === null){
                return;
            }

            return encodeURIComponent(value);
        },
        join: function(value, params) {
            if (value === undefined || value === null){
                return;
            }

            var join_str = "",
                output = [],
                keyset = null;

            if (params && params[0]) {
                join_str = params[0];
            }
            if (value instanceof Array) {
                output = value;
            } else {
                keyset = value._keys || Object.keys(value);
                Twig.forEach(keyset, function(key) {
                    if (key === "_keys") return; // Ignore the _keys property
                    if (value.hasOwnProperty(key)) {
                        output.push(value[key]);
                    }
                });
            }
            return output.join(join_str);
        },
        "default": function(value, params) {
            if (params === undefined || params.length !== 1) {
                throw new Twig.Error("default filter expects one argument");
            }
            if (value === undefined || value === null || value === '' ) {
                return params[0];
            } else {
                return value;
            }
        },
        json_encode: function(value) {
            if (value && value.hasOwnProperty( "_keys" ) ) {
                delete value._keys;
            }
            if(value === undefined || value === null) {
                return "null";
            }
            return JSON.stringify(value);
        },
        merge: function(value, params) {
            var obj = [],
                arr_index = 0,
                keyset = [];

            // Check to see if all the objects being merged are arrays
            if (!(value instanceof Array)) {
                // Create obj as an Object
                obj = { };
            } else {
                Twig.forEach(params, function(param) {
                    if (!(param instanceof Array)) {
                        obj = { };
                    }
                });
            }
            if (!(obj instanceof Array)) {
                obj._keys = [];
            }

            if (value instanceof Array) {
                Twig.forEach(value, function(val) {
                    if (obj._keys) obj._keys.push(arr_index);
                    obj[arr_index] = val;
                    arr_index++;
                });
            } else {
                keyset = value._keys || Object.keys(value);
                Twig.forEach(keyset, function(key) {
                    obj[key] = value[key];
                    obj._keys.push(key);

                    // Handle edge case where a number index in an object is greater than
                    //   the array counter. In such a case, the array counter is increased
                    //   one past the index.
                    //
                    // Example {{ ["a", "b"]|merge({"4":"value"}, ["c", "d"])
                    // Without this, d would have an index of "4" and overwrite the value
                    //   of "value"
                    var int_key = parseInt(key, 10);
                    if (!isNaN(int_key) && int_key >= arr_index) {
                        arr_index = int_key + 1;
                    }
                });
            }

            // mixin the merge arrays
            Twig.forEach(params, function(param) {
                if (param instanceof Array) {
                    Twig.forEach(param, function(val) {
                        if (obj._keys) obj._keys.push(arr_index);
                        obj[arr_index] = val;
                        arr_index++;
                    });
                } else {
                    keyset = param._keys || Object.keys(param);
                    Twig.forEach(keyset, function(key) {
                        if (!obj[key]) obj._keys.push(key);
                        obj[key] = param[key];

                        var int_key = parseInt(key, 10);
                        if (!isNaN(int_key) && int_key >= arr_index) {
                            arr_index = int_key + 1;
                        }
                    });
                }
            });
            if (params.length === 0) {
                throw new Twig.Error("Filter merge expects at least one parameter");
            }

            return obj;
        },
        date: function(value, params) {
            if (value === undefined||value === null){
                return;
            }

            var date = Twig.functions.date(value);
            return Twig.lib.formatDate(date, params[0]);
        },

        date_modify: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length !== 1) {
                throw new Twig.Error("date_modify filter expects 1 argument");
            }

            var modifyText = params[0], time;

            if (Twig.lib.is("Date", value)) {
                time = Twig.lib.strtotime(modifyText, value.getTime() / 1000);
            }
            if (Twig.lib.is("String", value)) {
                time = Twig.lib.strtotime(modifyText, Twig.lib.strtotime(value));
            }
            if (Twig.lib.is("Number", value)) {
                time = Twig.lib.strtotime(modifyText, value);
            }

            return new Date(time * 1000);
        },

        replace: function(value, params) {
            if (value === undefined||value === null){
                return;
            }

            var pairs = params[0],
                tag;
            for (tag in pairs) {
                if (pairs.hasOwnProperty(tag) && tag !== "_keys") {
                    value = Twig.lib.replaceAll(value, tag, pairs[tag]);
                }
            }
            return value;
        },

        format: function(value, params) {
            if (value === undefined || value === null){
                return;
            }

            return Twig.lib.vsprintf(value, params);
        },

        striptags: function(value) {
            if (value === undefined || value === null){
                return;
            }

            return Twig.lib.strip_tags(value);
        },

        escape: function(value) {
            if (value === undefined|| value === null){
                return;
            }
            return value.toString().replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
        },

        /* Alias of escape */
        "e": function(value) {
            return Twig.filters.escape(value);
        },

        nl2br: function(value) {
            if (value === undefined || value === null){
                return;
            }
            var linebreak_tag = "BACKSLASH_n_replace",
                br = "<br />" + linebreak_tag;

            value = Twig.filters.escape(value)
                        .replace(/\r\n/g, br)
                        .replace(/\r/g, br)
                        .replace(/\n/g, br);

            return Twig.lib.replaceAll(value, linebreak_tag, "\n");
        },

        /**
         * Adapted from: http://phpjs.org/functions/number_format:481
         */
        number_format: function(value, params) {
            var number = value,
                decimals = (params && params[0]) ? params[0] : undefined,
                dec      = (params && params[1] !== undefined) ? params[1] : ".",
                sep      = (params && params[2] !== undefined) ? params[2] : ",";

            number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
            var n = !isFinite(+number) ? 0 : +number,
                prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
                s = '',
                toFixedFix = function (n, prec) {
                    var k = Math.pow(10, prec);
                    return '' + Math.round(n * k) / k;
                };
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
            if (s[0].length > 3) {
                s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
            }
            if ((s[1] || '').length < prec) {
                s[1] = s[1] || '';
                s[1] += new Array(prec - s[1].length + 1).join('0');
            }
            return s.join(dec);
        },

        trim: function(value, params) {
            if (value === undefined|| value === null){
                return;
            }

            var str = Twig.filters.escape( '' + value ),
                whitespace;
            if ( params && params[0] ) {
                whitespace = '' + params[0];
            } else {
                whitespace = ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
            }
            for (var i = 0; i < str.length; i++) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(i);
                    break;
                }
            }
            for (i = str.length - 1; i >= 0; i--) {
                if (whitespace.indexOf(str.charAt(i)) === -1) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
        },

        slice: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length < 1) {
                throw new Twig.Error("slice filter expects at least 1 argument");
            }

            // default to start of string
            var start = params[0] || 0;
            // default to length of string
            var length = params.length > 1 ? params[1] : value.length;
            // handle negative start values
            var startIndex = start >= 0 ? start : Math.max( value.length + start, 0 );

            if (Twig.lib.is("Array", value)) {
                var output = [];
                for (var i = startIndex; i < startIndex + length && i < value.length; i++) {
                    output.push(value[i]);
                }
                return output;
            } else if (Twig.lib.is("String", value)) {
                return value.substr(startIndex, length);
            } else {
                throw new Twig.Error("slice filter expects value to be an array or string");
            }
        },

        abs: function(value) {
            if (value === undefined || value === null) {
                return;
            }

            return Math.abs(value);
        },

        first: function(value) {
            if (value instanceof Array) {
                return value[0];
            } else if (value instanceof Object) {
                if ('_keys' in value) {
                    return value[value._keys[0]];
                }
            } else if ( typeof value === "string" ) {
                return value.substr(0, 1);
            }

            return;
        },

        split: function(value, params) {
            if (value === undefined || value === null) {
                return;
            }
            if (params === undefined || params.length < 1 || params.length > 2) {
                throw new Twig.Error("split filter expects 1 or 2 argument");
            }
            if (Twig.lib.is("String", value)) {
                var delimiter = params[0],
                    limit = params[1],
                    split = value.split(delimiter);

                if (limit === undefined) {

                    return split;

                } else if (limit < 0) {

                    return value.split(delimiter, split.length + limit);

                } else {

                    var limitedSplit = [];

                    if (delimiter == '') {
                        // empty delimiter
                        // "aabbcc"|split('', 2)
                        //     -> ['aa', 'bb', 'cc']

                        while(split.length > 0) {
                            var temp = "";
                            for (var i=0; i<limit && split.length > 0; i++) {
                                temp += split.shift();
                            }
                            limitedSplit.push(temp);
                        }

                    } else {
                        // non-empty delimiter
                        // "one,two,three,four,five"|split(',', 3)
                        //     -> ['one', 'two', 'three,four,five']

                        for (var i=0; i<limit-1 && split.length > 0; i++) {
                            limitedSplit.push(split.shift());
                        }

                        if (split.length > 0) {
                            limitedSplit.push(split.join(delimiter));
                        }
                    }

                    return limitedSplit;
                }

            } else {
                throw new Twig.Error("split filter expects value to be a string");
            }
        },
        last: function(value) {
            if (Twig.lib.is('Object', value)) {
                var keys;

                if (value._keys === undefined) {
                    keys = Object.keys(value);
                } else {
                    keys = value._keys;
                }

                return value[keys[keys.length - 1]];
            }

            // string|array
            return value[value.length - 1];
        },
        raw: function(value) {
            //Raw filter shim
            return value;
        },
        batch: function(items, params) {
            var size = params.shift(),
                fill = params.shift(),
                result,
                last,
                missing;

            if (!Twig.lib.is("Array", items)) {
                throw new Twig.Error("batch filter expects items to be an array");
            }

            if (!Twig.lib.is("Number", size)) {
                throw new Twig.Error("batch filter expects size to be a number");
            }

            size = Math.ceil(size);

            result = Twig.lib.chunkArray(items, size);

            if (fill && items.length % size != 0) {
                last = result.pop();
                missing = size - last.length;

                while (missing--) {
                    last.push(fill);
                }

                result.push(last);
            }

            return result;
        },
        round: function(value, params) {
            params = params || [];

            var precision = params.length > 0 ? params[0] : 0,
                method = params.length > 1 ? params[1] : "common";

            value = parseFloat(value);

            if(precision && !Twig.lib.is("Number", precision)) {
                throw new Twig.Error("round filter expects precision to be a number");
            }

            if (method === "common") {
                return Twig.lib.round(value, precision);
            }

            if(!Twig.lib.is("Function", Math[method])) {
                throw new Twig.Error("round filter expects method to be 'floor', 'ceil', or 'common'");
            }

            return Math[method](value * Math.pow(10, precision)) / Math.pow(10, precision);
        }
    };

    Twig.filter = function(filter, value, params) {
        if (!Twig.filters[filter]) {
            throw "Unable to find filter " + filter;
        }
        return Twig.filters[filter].apply(this, [value, params]);
    };

    Twig.filter.extend = function(filter, definition) {
        Twig.filters[filter] = definition;
    };

    return Twig;

})(Twig || { });
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//                   2012 Hadrien Lanneau
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.functions.js
//
// This file handles parsing filters.
var Twig = (function (Twig) {

    // Determine object type
    function is(type, obj) {
        var clas = Object.prototype.toString.call(obj).slice(8, -1);
        return obj !== undefined && obj !== null && clas === type;
    }

    Twig.functions = {
        //  attribute, block, constant, date, dump, parent, random,.

        // Range function from http://phpjs.org/functions/range:499
        // Used under an MIT License
        range: function (low, high, step) {
            // http://kevin.vanzonneveld.net
            // +   original by: Waldo Malqui Silva
            // *     example 1: range ( 0, 12 );
            // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
            // *     example 2: range( 0, 100, 10 );
            // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
            // *     example 3: range( 'a', 'i' );
            // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
            // *     example 4: range( 'c', 'a' );
            // *     returns 4: ['c', 'b', 'a']
            var matrix = [];
            var inival, endval, plus;
            var walker = step || 1;
            var chars = false;

            if (!isNaN(low) && !isNaN(high)) {
                inival = parseInt(low, 10);
                endval = parseInt(high, 10);
            } else if (isNaN(low) && isNaN(high)) {
                chars = true;
                inival = low.charCodeAt(0);
                endval = high.charCodeAt(0);
            } else {
                inival = (isNaN(low) ? 0 : low);
                endval = (isNaN(high) ? 0 : high);
            }

            plus = ((inival > endval) ? false : true);
            if (plus) {
                while (inival <= endval) {
                    matrix.push(((chars) ? String.fromCharCode(inival) : inival));
                    inival += walker;
                }
            } else {
                while (inival >= endval) {
                    matrix.push(((chars) ? String.fromCharCode(inival) : inival));
                    inival -= walker;
                }
            }

            return matrix;
        },
        cycle: function(arr, i) {
            var pos = i % arr.length;
            return arr[pos];
        },
        dump: function() {
            var EOL = '\n',
            	indentChar = '  ',
            	indentTimes = 0,
            	out = '',
				args = Array.prototype.slice.call(arguments),
				indent = function(times) {
                	var ind	 = '';
                    while (times > 0) {
                        times--;
                        ind += indentChar;
                    }
                    return ind;
                },
				displayVar = function(variable) {
                    out += indent(indentTimes);
                    if (typeof(variable) === 'object') {
                        dumpVar(variable);
                    } else if (typeof(variable) === 'function') {
                        out += 'function()' + EOL;
                    } else if (typeof(variable) === 'string') {
                        out += 'string(' + variable.length + ') "' + variable + '"' + EOL;
                    } else if (typeof(variable) === 'number') {
                        out += 'number(' + variable + ')' + EOL;
                    } else if (typeof(variable) === 'boolean') {
                        out += 'bool(' + variable + ')' + EOL;
                    }
                },
             	dumpVar = function(variable) {
					var	i;
	                if (variable === null) {
	                    out += 'NULL' + EOL;
	                } else if (variable === undefined) {
	                    out += 'undefined' + EOL;
	                } else if (typeof variable === 'object') {
	                    out += indent(indentTimes) + typeof(variable);
	                    indentTimes++;
	                    out += '(' + (function(obj) {
	                        var size = 0, key;
	                        for (key in obj) {
	                            if (obj.hasOwnProperty(key)) {
	                                size++;
	                            }
	                        }
	                        return size;
	                    })(variable) + ') {' + EOL;
	                    for (i in variable) {
	                        out += indent(indentTimes) + '[' + i + ']=> ' + EOL;
	                        displayVar(variable[i]);
	                    }
	                    indentTimes--;
	                    out += indent(indentTimes) + '}' + EOL;
	                } else {
	                    displayVar(variable);
	                }
	            };

			// handle no argument case by dumping the entire render context
			if (args.length == 0) args.push(this.context);

			Twig.forEach(args, function(variable) {
				dumpVar(variable);
			});

            return out;
        },
        date: function(date, time) {
            var dateObj;
            if (date === undefined) {
                dateObj = new Date();
            } else if (Twig.lib.is("Date", date)) {
                dateObj = date;
            } else if (Twig.lib.is("String", date)) {
                dateObj = new Date(Twig.lib.strtotime(date) * 1000);
            } else if (Twig.lib.is("Number", date)) {
                // timestamp
                dateObj = new Date(date * 1000);
            } else {
                throw new Twig.Error("Unable to parse date " + date);
            }
            return dateObj;
        },
        block: function(block) {
            return this.blocks[block];
        },
        parent: function() {
            // Add a placeholder
            return Twig.placeholders.parent;
        },
        attribute: function(object, method, params) {
            if (object instanceof Object) {
                if (object.hasOwnProperty(method)) {
                    if (typeof object[method] === "function") {
                        return object[method].apply(undefined, params);
                    }
                    else {
                        return object[method];
                    }
                }
            }
            // Array will return element 0-index
            return object[method] || undefined;
        }
    };

    Twig._function = function(_function, value, params) {
        if (!Twig.functions[_function]) {
            throw "Unable to find function " + _function;
        }
        return Twig.functions[_function](value, params);
    };

    Twig._function.extend = function(_function, definition) {
        Twig.functions[_function] = definition;
    };

    return Twig;

})(Twig || { });
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.tests.js
//
// This file handles expression tests. (is empty, is not defined, etc...)
var Twig = (function (Twig) {
    
    Twig.tests = {
        empty: function(value) {
            if (value === null || value === undefined) return true;
            // Handler numbers
            if (typeof value === "number") return false; // numbers are never "empty"
            // Handle strings and arrays
            if (value.length && value.length > 0) return false;
            // Handle objects
            for (var key in value) {
                if (value.hasOwnProperty(key)) return false;
            }
            return true;
        },
        odd: function(value) {
            return value % 2 === 1;
        },
        even: function(value) {
            return value % 2 === 0;
        },
        divisibleby: function(value, params) {
            return value % params[0] === 0;
        },
        defined: function(value) {
            return value !== undefined;
        },
        none: function(value) {
            return value === null;
        },
        'null': function(value) {
            return this.none(value); // Alias of none
        },
        sameas: function(value, params) {
            return value === params[0];
        }
        /*
        constant ?
         */
    };

    Twig.test = function(test, value, params) {
        if (!Twig.tests[test]) {
            throw "Test " + test + " is not defined.";
        }
        return Twig.tests[test](value, params);
    };

    Twig.test.extend = function(test, definition) {
        Twig.tests[test] = definition;
    };

    return Twig;
})( Twig || { } );
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.exports.js
//
// This file provides extension points and other hooks into the twig functionality.

var Twig = (function (Twig) {
    
    Twig.exports = {
        VERSION: Twig.VERSION
    };

    /**
     * Create and compile a twig.js template.
     *
     * @param {Object} param Paramteres for creating a Twig template.
     *
     * @return {Twig.Template} A Twig template ready for rendering.
     */
    Twig.exports.twig = function twig(params) {
        
        var id = params.id,
            options = {
                strict_variables: params.strict_variables || false,
                allowInlineIncludes: params.allowInlineIncludes || false,
                rethrow: params.rethrow || false
            };

        if (id) {
            Twig.validateId(id);
        }

        if (params.debug !== undefined) {
            Twig.debug = params.debug;
        }
        if (params.trace !== undefined) {
            Twig.trace = params.trace;
        }

        if (params.data !== undefined) {
            return new Twig.Template({
                data: params.data,
                module: params.module,
                id:   id,
                options: options
            });

        } else if (params.ref !== undefined) {
            if (params.id !== undefined) {
                throw new Twig.Error("Both ref and id cannot be set on a twig.js template.");
            }
            return Twig.Templates.load(params.ref);

        } else if (params.href !== undefined) {
            return Twig.Templates.loadRemote(params.href, {
                id: id,
                method: 'ajax',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options: options

            }, params.load, params.error);

        } else if (params.path !== undefined) {
            return Twig.Templates.loadRemote(params.path, {
                id: id,
                method: 'fs',
                base: params.base,
                module: params.module,
                precompiled: params.precompiled,
                async: params.async,
                options: options

            }, params.load, params.error);
        }
    };

    // Extend Twig with a new filter.
    Twig.exports.extendFilter = function(filter, definition) {
        Twig.filter.extend(filter, definition);
    };

    // Extend Twig with a new function.
    Twig.exports.extendFunction = function(fn, definition) {
        Twig._function.extend(fn, definition);
    };

    // Extend Twig with a new test.
    Twig.exports.extendTest = function(test, definition) {
        Twig.test.extend(test, definition);
    };

    // Extend Twig with a new definition.
    Twig.exports.extendTag = function(definition) {
        Twig.logic.extend(definition);
    };

    // Provide an environment for extending Twig core.
    // Calls fn with the internal Twig object.
    Twig.exports.extend = function(fn) {
        fn(Twig);
    };


    /**
     * Provide an extension for use with express 2.
     *
     * @param {string} markup The template markup.
     * @param {array} options The express options.
     *
     * @return {string} The rendered template.
     */
    Twig.exports.compile = function(markup, options) {
        var id = options.filename,
            path = options.filename,
            template;

        // Try to load the template from the cache
        template = new Twig.Template({
            data: markup,
            path: path,
            id: id,
            options: options.settings['twig options']
        }); // Twig.Templates.load(id) ||

        return function(context) {
            return template.render(context);
        };
    };

    /**
     * Provide an extension for use with express 3.
     *
     * @param {string} path The location of the template file on disk.
     * @param {Object|Function} The options or callback.
     * @param {Function} fn callback.
     */

    Twig.exports.renderFile = function(path, options, fn) {
        // handle callback in options
        if ('function' == typeof options) {
            fn = options;
            options = {};
        }

        options = options || {};

        var params = {
                path: path,
                base: options.settings['views'],
                load: function(template) {
                    // render and return template
                    fn(null, template.render(options));
                }
            };

        // mixin any options provided to the express app.
        var view_options = options.settings['twig options'];

        if (view_options) {
            for (var option in view_options) if (view_options.hasOwnProperty(option)) {
                params[option] = view_options[option];
            }
        }

        Twig.exports.twig(params);
    };

    // Express 3 handler
    Twig.exports.__express = Twig.exports.renderFile;

    /**
     * Shoud Twig.js cache templates.
     * Disable during development to see changes to templates without
     * reloading, and disable in production to improve performance.
     *
     * @param {boolean} cache
     */
    Twig.exports.cache = function(cache) {
        Twig.cache = cache;
    }

    return Twig;
}) (Twig || { });

//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.compiler.js
//
// This file handles compiling templates into JS
var Twig = (function (Twig) {
    /**
     * Namespace for compilation.
     */
    Twig.compiler = {
        module: {}
    };

    // Compile a Twig Template to output.
    Twig.compiler.compile = function(template, options) {
        // Get tokens
        var tokens = JSON.stringify(template.tokens)
            , id = template.id
            , output;

        if (options.module) {
            if (Twig.compiler.module[options.module] === undefined) {
                throw new Twig.Error("Unable to find module type " + options.module);
            }
            output = Twig.compiler.module[options.module](id, tokens, options.twig);
        } else {
            output = Twig.compiler.wrap(id, tokens);
        }
        return output;
    };

    Twig.compiler.module = {
        amd: function(id, tokens, pathToTwig) {
            return 'define(["' + pathToTwig + '"], function (Twig) {\n\tvar twig, templates;\ntwig = Twig.twig;\ntemplates = ' + Twig.compiler.wrap(id, tokens) + '\n\treturn templates;\n});';
        }
        , node: function(id, tokens) {
            return 'var twig = require("twig").twig;\n'
                + 'exports.template = ' + Twig.compiler.wrap(id, tokens)
        }
        , cjs2: function(id, tokens, pathToTwig) {
            return 'module.declare([{ twig: "' + pathToTwig + '" }], function (require, exports, module) {\n'
                        + '\tvar twig = require("twig").twig;\n'
                        + '\texports.template = ' + Twig.compiler.wrap(id, tokens)
                    + '\n});'
        }
    };

    Twig.compiler.wrap = function(id, tokens) {
        return 'twig({id:"'+id.replace('"', '\\"')+'", data:'+tokens+', precompiled: true});\n';
    };

    return Twig;
})(Twig || {});
//     Twig.js
//     Copyright (c) 2011-2013 John Roepke
//     Available under the BSD 2-Clause License
//     https://github.com/justjohn/twig.js

// ## twig.module.js
// Provide a CommonJS/AMD/Node module export.

if (typeof module !== 'undefined' && module.declare) {
    // Provide a CommonJS Modules/2.0 draft 8 module
    module.declare([], function(require, exports, module) {
        // Add exports from the Twig exports
        for (key in Twig.exports) {
            if (Twig.exports.hasOwnProperty(key)) {
                exports[key] = Twig.exports[key];
            }
        }
    });
} else if (typeof define == 'function' && define.amd || 1) {
    timely.define('external_libs/twig',[],function() {
        return Twig.exports;
    });
} else if (typeof module !== 'undefined' && module.exports) {
    // Provide a CommonJS Modules/1.1 module
    module.exports = Twig.exports;
} else {
    // Export for browser use
    window.twig = Twig.exports.twig;
    window.Twig = Twig.exports;
}

;
timely.define('agenda',["external_libs/twig", "agenda"], function (Twig) {
	var twig, templates;
twig = Twig.twig;
templates = twig({id:"../js_src/agenda.twig", data:[{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"navigation","match":["navigation"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\n<div class=\"ai1ec-agenda-view\">\n\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"dates","match":["dates"]},{"type":"Twig.expression.type.test","filter":"empty"}],"output":[{"type":"raw","value":"\t\t<p class=\"ai1ec-no-results\">\n\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_upcoming_events","match":["text_upcoming_events"]}]},{"type":"raw","value":"\n\t\t</p>\n\t"}]}},{"type":"logic","token":{"type":"Twig.logic.type.else","match":["else"],"output":[{"type":"raw","value":"\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":"date","value_var":"date_info","expression":[{"type":"Twig.expression.type.variable","value":"dates","match":["dates"]}],"output":[{"type":"raw","value":"\t\t\t<div class=\"ai1ec-date\n\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"date_info","match":["date_info"]},{"type":"Twig.expression.type.key.period","key":"today"},{"type":"Twig.expression.type.test","filter":"empty","modifier":"not"}],"output":[{"type":"raw","value":"ai1ec-today"}]}},{"type":"raw","value":"\">\n\t\t\t\t<a class=\"ai1ec-date-title ai1ec-load-view\"\n\t\t\t\t\thref=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"date_info","match":["date_info"]},{"type":"Twig.expression.type.key.period","key":"href"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"data_type","match":["data_type"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":">\n\t\t\t\t\t<div class=\"ai1ec-month\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"date_info","match":["date_info"]},{"type":"Twig.expression.type.key.period","key":"month"}]},{"type":"raw","value":"</div>\n\t\t\t\t\t<div class=\"ai1ec-day\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"date_info","match":["date_info"]},{"type":"Twig.expression.type.key.period","key":"day"}]},{"type":"raw","value":"</div>\n\t\t\t\t\t<div class=\"ai1ec-weekday\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"date_info","match":["date_info"]},{"type":"Twig.expression.type.key.period","key":"weekday"}]},{"type":"raw","value":"</div>\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"show_year_in_agenda_dates","match":["show_year_in_agenda_dates"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t<div class=\"ai1ec-year\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"date_info","match":["date_info"]},{"type":"Twig.expression.type.key.period","key":"year"}]},{"type":"raw","value":"</div>\n\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t</a>\n\t\t\t\t<div class=\"ai1ec-date-events\">\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"category","expression":[{"type":"Twig.expression.type.variable","value":"date_info","match":["date_info"]},{"type":"Twig.expression.type.key.period","key":"events"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"event","expression":[{"type":"Twig.expression.type.variable","value":"category","match":["category"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t<div class=\"ai1ec-event\n\t\t\t\t\t\t\t\tai1ec-event-id-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_id"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\tai1ec-event-instance-id-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_id"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"is_allday"}],"output":[{"type":"raw","value":"ai1ec-allday"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"expanded","match":["expanded"]}],"output":[{"type":"raw","value":"ai1ec-expanded"}]}},{"type":"raw","value":"\">\n\n\t\t\t\t\t\t\t\t<div class=\"ai1ec-event-header\">\n\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-event-toggle\">\n\t\t\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-minus-circle ai1ec-fa-lg\"></i>\n\t\t\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-plus-circle ai1ec-fa-lg\"></i>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-title\">\n\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"filtered_title"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"show_location_in_title","match":["show_location_in_title"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.test","filter":"empty","modifier":"not"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-location\"\n\t\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_venue_separator","match":["text_venue_separator"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"</span>\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t</span>\n\n\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"edit_post_link","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"edit_post_link"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"edit_post_link","match":["edit_post_link"]},{"type":"Twig.expression.type.test","filter":"empty","modifier":"not"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t<a class=\"post-edit-link\" href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"edit_post_link","match":["edit_post_link"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\">\n\t\t\t\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-pencil\"></i> "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_edit","match":["text_edit"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-event-time\">\n\t\t\t\t\t\t\t\t\t\t "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"timespan_short"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t"},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t<div class=\"ai1ec-event-summary "},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"expanded","match":["expanded"]}],"output":[{"type":"raw","value":"ai1ec-expanded"}]}},{"type":"raw","value":"\">\n\n\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-event-description\">\n\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"content_img_url"},{"type":"Twig.expression.type.test","filter":"empty"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"avatar"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"filtered_content"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-event-summary-footer\">\n\t\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-btn-group ai1ec-actions\">\n\t\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"is_ticket_button_enabled","match":["is_ticket_button_enabled"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url"},{"type":"Twig.expression.type.test","filter":"empty","modifier":"not"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t\t<a class=\"ai1ec-pull-right ai1ec-btn ai1ec-btn-primary\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tai1ec-btn-xs ai1ec-buy-tickets\"\n\t\t\t\t\t\t\t\t\t\t\t\t\ttarget=\"_blank\"\n\t\t\t\t\t\t\t\t\t\t\t\t\thref=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url_label"}]},{"type":"raw","value":"</a>\n\t\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t<a "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"data_type_events","match":["data_type_events"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t\tclass=\"ai1ec-read-more ai1ec-btn ai1ec-btn-default\n\t\t\t\t\t\t\t\t\t\t\t\t\tai1ec-load-event\"\n\t\t\t\t\t\t\t\t\t\t\t\thref=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_permalink"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\">\n\t\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_read_more","match":["text_read_more"]}]},{"type":"raw","value":" <i class=\"ai1ec-fa ai1ec-fa-arrow-right\"></i>\n\t\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"categories","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"categories_html"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"tags","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"tags_html"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"categories","match":["categories"]},{"type":"Twig.expression.type.test","filter":"empty","modifier":"not"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-categories\">\n\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-field-label\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-folder-open\"></i>\n\t\t\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_categories","match":["text_categories"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"categories","match":["categories"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"tags","match":["tags"]},{"type":"Twig.expression.type.test","filter":"empty","modifier":"not"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-tags\">\n\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-field-label\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-tags\"></i>\n\t\t\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_tags","match":["text_tags"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"tags","match":["tags"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\t\t\t\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n</div>\n\n<div class=\"ai1ec-pull-left\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"pagination_links","match":["pagination_links"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</div>\n"}], precompiled: true});

	return templates;
});
timely.define('oneday',["external_libs/twig", "oneday"], function (Twig) {
	var twig, templates;
twig = Twig.twig;
templates = twig({id:"../js_src/oneday.twig", data:[{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"navigation","match":["navigation"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\n<table class=\"ai1ec-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"type","match":["type"]}]},{"type":"raw","value":"-view-original\" xxx>\n\t<thead>\n\t\t<tr>\n\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":"date","value_var":"day","expression":[{"type":"Twig.expression.type.variable","value":"cell_array","match":["cell_array"]}],"output":[{"type":"raw","value":"\t\t\t\t<th class=\"ai1ec-weekday\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"today"},{"type":"Twig.expression.type.test","filter":"empty","modifier":"not"}],"output":[{"type":"raw","value":"ai1ec-today"}]}},{"type":"raw","value":"\">\n\t\t\t\t\t"},{"type":"raw","value":"\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"show_reveal_button","match":["show_reveal_button"]},{"type":"Twig.expression.type.variable","value":"loop","match":["loop"]},{"type":"Twig.expression.type.key.period","key":"last"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t<div class=\"ai1ec-reveal-full-day\">\n\t\t\t\t\t\t\t<button class=\"ai1ec-btn ai1ec-btn-info ai1ec-btn-xs\n\t\t\t\t\t\t\t\t\tai1ec-tooltip-trigger\"\n\t\t\t\t\t\t\t\tdata-placement=\"left\"\n\t\t\t\t\t\t\t\ttitle=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_full_day","match":["text_full_day"]},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\">\n\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-expand\"></i>\n\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t<a class=\"ai1ec-load-view\" href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"href"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"data_type","match":["data_type"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":">\n\t\t\t\t\t\t<span class=\"ai1ec-weekday-date\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"day"}]},{"type":"raw","value":"</span>\n\t\t\t\t\t\t<span class=\"ai1ec-weekday-day\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"weekday"}]},{"type":"raw","value":"</span>\n\t\t\t\t\t</a>\n\t\t\t\t</th>\n\t\t\t"}]}},{"type":"raw","value":"\t\t</tr>\n\t\t<tr>\n\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"day","expression":[{"type":"Twig.expression.type.variable","value":"cell_array","match":["cell_array"]}],"output":[{"type":"raw","value":"\t\t\t\t<td class=\"ai1ec-allday-events\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"today"},{"type":"Twig.expression.type.test","filter":"empty","modifier":"not"}],"output":[{"type":"raw","value":"ai1ec-today"}]}},{"type":"raw","value":"\">\n\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"loop","match":["loop"]},{"type":"Twig.expression.type.key.period","key":"first"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t<div class=\"ai1ec-allday-label\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_all_day","match":["text_all_day"]}]},{"type":"raw","value":"</div>\n\t\t\t\t\t"}]}},{"type":"raw","value":"\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"event","expression":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"allday"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t<a href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"permalink"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"data_type_events","match":["data_type_events"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\tdata-instance-id=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_id"}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\tclass=\"ai1ec-event-container ai1ec-load-event ai1ec-popup-trigger\n\t\t\t\t\t\t\t\tai1ec-event-id-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_id"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\tai1ec-event-instance-id-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_id"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\tai1ec-allday\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"is_multiday"}],"output":[{"type":"raw","value":"ai1ec-multiday"}]}},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t>\n\t\t\t\t\t\t\t<div class=\"ai1ec-event\"\n\t\t\t\t\t\t\t\t style=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"color_style"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\">\n\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-title\">\n\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"filtered_title"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"show_location_in_title","match":["show_location_in_title"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-location\"\n\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_venue_separator","match":["text_venue_separator"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"</span>\n\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</a>\n\n\t\t\t\t\t\t<div class=\"ai1ec-popover ai1ec-popup ai1ec-popup-in-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"type","match":["type"]}]},{"type":"raw","value":"-view\">\n\n\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"category_colors","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"category_colors"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"category_colors","match":["category_colors"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t<div class=\"ai1ec-color-swatches\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"category_colors","match":["category_colors"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</div>\n\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\n\t\t\t\t\t\t\t<span class=\"ai1ec-popup-title\">\n\t\t\t\t\t\t\t\t<a href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"permalink"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"filtered_title"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</a>\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"show_location_in_title","match":["show_location_in_title"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-location\"\n\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_venue_separator","match":["text_venue_separator"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"</span>\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"is_ticket_button_enabled","match":["is_ticket_button_enabled"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<a class=\"ai1ec-pull-right ai1ec-btn ai1ec-btn-primary ai1ec-btn-xs\n\t\t\t\t\t\t\t\t\t\tai1ec-buy-tickets\" target=\"_blank\"\n\t\t\t\t\t\t\t\t\t\thref=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url_label"}]},{"type":"raw","value":"</a>\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\n\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"edit_post_link","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"edit_post_link"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"edit_post_link","match":["edit_post_link"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t<a class=\"post-edit-link\" href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"edit_post_link","match":["edit_post_link"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\">\n\t\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-pencil\"></i> "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_edit","match":["text_edit"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\n\t\t\t\t\t\t\t<div class=\"ai1ec-event-time\">\n\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"popup_timespan"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\n\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"avatar"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_excerpt"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t<div class=\"ai1ec-popup-excerpt\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_excerpt"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</div>\n\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\n\t\t\t\t\t\t</div>\n\n\t\t\t\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\n\t\t\t\t</td>\n\t\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\t\t</tr>\n\n\t</thead>\n\t<tbody>\n\t\t<tr class=\"ai1ec-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"type","match":["type"]}]},{"type":"raw","value":"\">\n\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"day","expression":[{"type":"Twig.expression.type.variable","value":"cell_array","match":["cell_array"]}],"output":[{"type":"raw","value":"\t\t\t\t<td "},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"today"}],"output":[{"type":"raw","value":"class=\"ai1ec-today\""}]}},{"type":"raw","value":">today\n\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"loop","match":["loop"]},{"type":"Twig.expression.type.key.period","key":"first"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t<div class=\"ai1ec-grid-container\">\n\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":"h","value_var":"hour","expression":[{"type":"Twig.expression.type.variable","value":"hours","match":["hours"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t<div class=\"ai1ec-hour-marker\n\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"h","match":["h"]},{"type":"Twig.expression.type.number","value":8,"match":["8",null]},{"type":"Twig.expression.type.operator.binary","value":">=","precidence":8,"associativity":"leftToRight","operator":">="},{"type":"Twig.expression.type.variable","value":"h","match":["h"]},{"type":"Twig.expression.type.number","value":18,"match":["18",null]},{"type":"Twig.expression.type.operator.binary","value":"<","precidence":8,"associativity":"leftToRight","operator":"<"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"ai1ec-business-hour"}]}},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\tstyle=\"top: "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"h","match":["h"]},{"type":"Twig.expression.type.number","value":60,"match":["60",null]},{"type":"Twig.expression.type.operator.binary","value":"*","precidence":5,"associativity":"leftToRight","operator":"*"}]},{"type":"raw","value":"px;\">\n\t\t\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"hour","match":["hour"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"quarter","expression":[{"type":"Twig.expression.type.number","value":1,"match":["1",null]},{"type":"Twig.expression.type.number","value":3,"match":["3",null]},{"type":"Twig.expression.type.operator.binary","value":"..","precidence":20,"associativity":"leftToRight","operator":".."}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-quarter-marker\"\n\t\t\t\t\t\t\t\t\t\tstyle=\"top: "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"h","match":["h"]},{"type":"Twig.expression.type.number","value":60,"match":["60",null]},{"type":"Twig.expression.type.operator.binary","value":"*","precidence":5,"associativity":"leftToRight","operator":"*"},{"type":"Twig.expression.type.variable","value":"quarter","match":["quarter"]},{"type":"Twig.expression.type.number","value":15,"match":["15",null]},{"type":"Twig.expression.type.operator.binary","value":"*","precidence":5,"associativity":"leftToRight","operator":"*"},{"type":"Twig.expression.type.operator.binary","value":"+","precidence":6,"associativity":"leftToRight","operator":"+"}]},{"type":"raw","value":"px;\"></div>\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"today"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t<div class=\"ai1ec-now-marker\" style=\"top: "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"now_top","match":["now_top"]}]},{"type":"raw","value":"px;\">\n\t\t\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_now_label","match":["text_now_label"]}]},{"type":"raw","value":" "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"now_text","match":["now_text"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t</div>\n\t\t\t\t\t"}]}},{"type":"raw","value":"\n\t\t\t\t\t<div class=\"ai1ec-day\">\n\n\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"day_array","expression":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"notallday"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"event","expression":[{"type":"Twig.expression.type.variable","value":"day_array","match":["day_array"]},{"type":"Twig.expression.type.key.period","key":"event"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t<a href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"permalink"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"data_type_events","match":["data_type_events"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\tdata-instance-id=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_id"}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\tclass=\"ai1ec-event-container ai1ec-load-event ai1ec-popup-trigger\n\t\t\t\t\t\t\t\t\tai1ec-event-id-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_id"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\tai1ec-event-instance-id-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_id"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"start_truncated"}],"output":[{"type":"raw","value":"ai1ec-start-truncated"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"end_truncated"}],"output":[{"type":"raw","value":"ai1ec-end-truncated"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"is_multiday"}],"output":[{"type":"raw","value":"ai1ec-multiday"}]}},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\tstyle=\"top: "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"day_array","match":["day_array"]},{"type":"Twig.expression.type.key.period","key":"top"}]},{"type":"raw","value":"px;\n\t\t\t\t\t\t\t\t\theight: "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"day_array","match":["day_array"]},{"type":"Twig.expression.type.key.period","key":"height"}]},{"type":"raw","value":"px;\n\t\t\t\t\t\t\t\t\tleft: "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"day_array","match":["day_array"]},{"type":"Twig.expression.type.key.period","key":"indent"},{"type":"Twig.expression.type.variable","value":"indent_multiplier","match":["indent_multiplier"]},{"type":"Twig.expression.type.operator.binary","value":"*","precidence":5,"associativity":"leftToRight","operator":"*"},{"type":"Twig.expression.type.variable","value":"indent_offset","match":["indent_offset"]},{"type":"Twig.expression.type.operator.binary","value":"+","precidence":6,"associativity":"leftToRight","operator":"+"}]},{"type":"raw","value":"px;\n\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"color_style"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"faded_color","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"faded_color"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"rgba_color","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"rgba_color"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"faded_color","match":["faded_color"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"rgba1","expression":[{"type":"Twig.expression.type.variable","value":"rgba_color","match":["rgba_color"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"0.05"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"rgba3","expression":[{"type":"Twig.expression.type.variable","value":"rgba_color","match":["rgba_color"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"0.3"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\tborder: 1px solid "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"faded_color","match":["faded_color"]}]},{"type":"raw","value":";\n\t\t\t\t\t\t\t\t\t\tborder-color: "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba_color","match":["rgba_color"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"0.5"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":";\n\t\t\t\t\t\t\t\t\t\tbackground-image: -webkit-linear-gradient( top, "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba1","match":["rgba1"]}]},{"type":"raw","value":", "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba3","match":["rgba3"]}]},{"type":"raw","value":" 50px );\n\t\t\t\t\t\t\t\t\t\tbackground-image: -moz-linear-gradient( top, "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba1","match":["rgba1"]}]},{"type":"raw","value":", "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba3","match":["rgba3"]}]},{"type":"raw","value":" 50px );\n\t\t\t\t\t\t\t\t\t\tbackground-image: -ms-linear-gradient( top, "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba1","match":["rgba1"]}]},{"type":"raw","value":", "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba3","match":["rgba3"]}]},{"type":"raw","value":" 50px );\n\t\t\t\t\t\t\t\t\t\tbackground-image: -o-linear-gradient( top, "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba1","match":["rgba1"]}]},{"type":"raw","value":", "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba3","match":["rgba3"]}]},{"type":"raw","value":" 50px );\n\t\t\t\t\t\t\t\t\t\tbackground-image: linear-gradient( top, "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba1","match":["rgba1"]}]},{"type":"raw","value":", "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"rgba3","match":["rgba3"]}]},{"type":"raw","value":" 50px );\n\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\">\n\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"start_truncated"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-start-truncator\">◤</div>\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"end_truncated"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-end-truncator\">◢</div>\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t<div class=\"ai1ec-event\">\n\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-time\">\n\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"short_start_time"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-title\">\n\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"filtered_title"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"show_location_in_title","match":["show_location_in_title"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-location\"\n\t\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_venue_separator","match":["text_venue_separator"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"</span>\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t</a>\n\n\t\t\t\t\t\t\t<div class=\"ai1ec-popover ai1ec-popup ai1ec-popup-in-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"type","match":["type"]}]},{"type":"raw","value":"-view\">\n\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"category_colors","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"category_colors"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"category_colors","match":["category_colors"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-color-swatches\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"category_colors","match":["category_colors"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</div>\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t<span class=\"ai1ec-popup-title\">\n\t\t\t\t\t\t\t\t\t<a href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"permalink"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"filtered_title"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</a>\n\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"show_location_in_title","match":["show_location_in_title"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-location\"\n\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_venue_separator","match":["text_venue_separator"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"</span>\n\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"is_ticket_button_enabled","match":["is_ticket_button_enabled"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t<a class=\"ai1ec-pull-right ai1ec-btn ai1ec-btn-primary ai1ec-btn-xs\n\t\t\t\t\t\t\t\t\t\t\tai1ec-buy-tickets\" target=\"_blank\"\n\t\t\t\t\t\t\t\t\t\t\thref=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url_label"}]},{"type":"raw","value":"</a>\n\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"edit_post_link","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"edit_post_link"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"edit_post_link","match":["edit_post_link"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<a class=\"post-edit-link\" href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"edit_post_link","match":["edit_post_link"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\">\n\t\t\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-pencil\"></i> "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_edit","match":["text_edit"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t<div class=\"ai1ec-event-time\">\n\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"popup_timespan"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"avatar"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_excerpt"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-popup-excerpt\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_excerpt"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</div>\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t</div>\n\n\n\t\t\t\t\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\t\t\t\t\t</div>\n\t\t\t\t\t\n\t\t\t\t</td>\n\t\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\t\t</tr>\n\t</tbody>\n\n</table>\n\n<div class=\"ai1ec-pull-left\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"pagination_links","match":["pagination_links"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</div>\n"}], precompiled: true});

	return templates;
});
timely.define('month',["external_libs/twig", "month"], function (Twig) {
	var twig, templates;
twig = Twig.twig;
templates = twig({id:"../js_src/month.twig", data:[{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"navigation","match":["navigation"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\n<table class=\"ai1ec-month-view ai1ec-popover-boundary\n\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"month_word_wrap","match":["month_word_wrap"]}],"output":[{"type":"raw","value":"ai1ec-word-wrap"}]}},{"type":"raw","value":"\">\n\t<thead>\n\t\t<tr>\n\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"weekday","expression":[{"type":"Twig.expression.type.variable","value":"weekdays","match":["weekdays"]}],"output":[{"type":"raw","value":"\t\t\t\t<th scope=\"col\" class=\"ai1ec-weekday\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"weekday","match":["weekday"]}]},{"type":"raw","value":"</th>\n\t\t\t"}]}},{"type":"raw","value":"\t\t</tr>\n\t</thead>\n\t<tbody>\n\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"week","expression":[{"type":"Twig.expression.type.variable","value":"cell_array","match":["cell_array"]}],"output":[{"type":"raw","value":"\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"added_stretcher","expression":[{"type":"Twig.expression.type.bool","value":false}]}},{"type":"raw","value":"\t\t\t<tr class=\"ai1ec-week\">\n\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"day","expression":[{"type":"Twig.expression.type.variable","value":"week","match":["week"]}],"output":[{"type":"raw","value":"\n\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"date"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t<td "},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"today"}],"output":[{"type":"raw","value":"class=\"ai1ec-today\""}]}},{"type":"raw","value":">\n\t\t\t\t\t\t\t"},{"type":"raw","value":"\n\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"added_stretcher","match":["added_stretcher"]},{"type":"Twig.expression.type.operator.unary","value":"not","precidence":3,"associativity":"rightToLeft","operator":"not"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t<div class=\"ai1ec-day-stretcher\"></div>\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"added_stretcher","expression":[{"type":"Twig.expression.type.bool","value":true}]}},{"type":"raw","value":"\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\n\t\t\t\t\t\t\t<div class=\"ai1ec-day\">\n\t\t\t\t\t\t\t\t<div class=\"ai1ec-date\">\n\t\t\t\t\t\t\t\t\t<a class=\"ai1ec-load-view\"\n\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"data_type","match":["data_type"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\thref=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"date_link"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"date"}]},{"type":"raw","value":"</a>\n\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"event","expression":[{"type":"Twig.expression.type.variable","value":"day","match":["day"]},{"type":"Twig.expression.type.key.period","key":"events"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t<a href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_permalink"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"data_type_events","match":["data_type_events"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"is_multiday"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\tdata-end-day=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"multiday_end_day"}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t\tdata-start-truncated=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"start_truncated"},{"type":"Twig.expression.type.string","value":"true"},{"type":"Twig.expression.type.string","value":"false"},{"type":"Twig.expression.type.operator.binary","value":"?","precidence":16,"associativity":"rightToLeft","operator":"?"}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t\tdata-end-truncated=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"end_truncated"},{"type":"Twig.expression.type.string","value":"true"},{"type":"Twig.expression.type.string","value":"false"},{"type":"Twig.expression.type.operator.binary","value":"?","precidence":16,"associativity":"rightToLeft","operator":"?"}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\tdata-instance-id=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_id"}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\tclass=\"ai1ec-event-container ai1ec-load-event\n\t\t\t\t\t\t\t\t\t\t\tai1ec-popup-trigger\n\t\t\t\t\t\t\t\t\t\t\tai1ec-event-id-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_id"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\tai1ec-event-instance-id-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"instance_id"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"is_allday"}],"output":[{"type":"raw","value":"ai1ec-allday"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"is_multiday"}],"output":[{"type":"raw","value":"ai1ec-multiday"}]}},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t>\n\n\t\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-event\"\n\t\t\t\t\t\t\t\t\t\t\t style=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"color_style"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\">\n\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-title\">\n\t\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"filtered_title"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"is_allday"},{"type":"Twig.expression.type.operator.unary","value":"not","precidence":3,"associativity":"rightToLeft","operator":"not"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-time\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"short_start_time"}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-popover ai1ec-popup ai1ec-popup-in-"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"type","match":["type"]}]},{"type":"raw","value":"-view\">\n\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"category_colors","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"category_colors"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"category_colors","match":["category_colors"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-color-swatches\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"category_colors","match":["category_colors"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</div>\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-popup-title\">\n\t\t\t\t\t\t\t\t\t\t\t<a href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"permalink"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"filtered_title"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</a>\n\t\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"show_location_in_title","match":["show_location_in_title"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t\t<span class=\"ai1ec-event-location\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_venue_separator","match":["text_venue_separator"]},{"type":"Twig.expression.type.filter","value":"format","match":["| format","format"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"venue"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"</span>\n\t\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"is_ticket_button_enabled","match":["is_ticket_button_enabled"]},{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url"},{"type":"Twig.expression.type.operator.binary","value":"and","precidence":13,"associativity":"leftToRight","operator":"and"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t\t<a class=\"ai1ec-pull-right ai1ec-btn ai1ec-btn-primary ai1ec-btn-xs\n\t\t\t\t\t\t\t\t\t\t\t\t\tai1ec-buy-tickets\" target=\"_blank\"\n\t\t\t\t\t\t\t\t\t\t\t\t\thref=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url"},{"type":"Twig.expression.type.filter","value":"e","match":["| e","e"],"params":[{"type":"Twig.expression.type.parameter.start","value":"(","match":["("]},{"type":"Twig.expression.type.string","value":"html_attr"},{"type":"Twig.expression.type.parameter.end","value":")","match":[")"],"expression":false}]}]},{"type":"raw","value":"\"\n\t\t\t\t\t\t\t\t\t\t\t\t\t>"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"ticket_url_label"}]},{"type":"raw","value":"</a>\n\t\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t</span>\n\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.set","key":"edit_post_link","expression":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"edit_post_link"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"edit_post_link","match":["edit_post_link"]}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t<a class=\"post-edit-link\" href=\""},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"edit_post_link","match":["edit_post_link"]},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\">\n\t\t\t\t\t\t\t\t\t\t\t\t<i class=\"ai1ec-fa ai1ec-fa-pencil\"></i> "},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"text_edit","match":["text_edit"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t\t</a>\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-event-time\">\n\t\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"popup_timespan"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"avatar"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"\n\t\t\t\t\t\t\t\t\t\t"},{"type":"logic","token":{"type":"Twig.logic.type.if","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_excerpt"}],"output":[{"type":"raw","value":"\t\t\t\t\t\t\t\t\t\t\t<div class=\"ai1ec-popup-excerpt\">"},{"type":"output","stack":[{"type":"Twig.expression.type.variable","value":"event","match":["event"]},{"type":"Twig.expression.type.key.period","key":"post_excerpt"},{"type":"Twig.expression.type.filter","value":"raw","match":["| raw","raw"]}]},{"type":"raw","value":"</div>\n\t\t\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t\t\t</div>\n\n\t\t\t\t\t\t\t\t"}]}},{"type":"raw","value":"\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</td>\n\t\t\t\t\t"}]}},{"type":"logic","token":{"type":"Twig.logic.type.else","match":["else"],"output":[{"type":"raw","value":" "},{"type":"raw","value":"\n\t\t\t\t\t\t<td class=\"ai1ec-empty\"></td>\n\t\t\t\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\n\t\t\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\t\t\t</tr>\n\t\t"}]}},{"type":"raw","value":" "},{"type":"raw","value":"\n\t</tbody>\n</table>\n"}], precompiled: true});

	return templates;
});
timely.define('external_libs/jquery_history', 
		[
		 "jquery_timely"
		 ],
		 function( jQuery ) {
			try {
				/**
				 * History.js jQuery Adapter
				 * @author Benjamin Arthur Lupton <contact@balupton.com>
				 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
				 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
				 */

				// Closure
				(function(window,undefined){
					

					// Localise Globals
					var
						History = window.History = window.History||{};

					// Check Existence
					if ( typeof History.Adapter !== 'undefined' ) {
						throw new Error('History.js Adapter has already been loaded...');
					}

					// Add the Adapter
					History.Adapter = {
						/**
						 * History.Adapter.bind(el,event,callback)
						 * @param {Element|string} el
						 * @param {string} event - custom and standard events
						 * @param {function} callback
						 * @return {void}
						 */
						bind: function(el,event,callback){
							jQuery(el).bind(event,callback);
						},

						/**
						 * History.Adapter.trigger(el,event)
						 * @param {Element|string} el
						 * @param {string} event - custom and standard events
						 * @param {Object=} extra - a object of extra event data (optional)
						 * @return {void}
						 */
						trigger: function(el,event,extra){
							jQuery(el).trigger(event,extra);
						},

						/**
						 * History.Adapter.extractEventData(key,event,extra)
						 * @param {string} key - key for the event data to extract
						 * @param {string} event - custom and standard events
						 * @param {Object=} extra - a object of extra event data (optional)
						 * @return {mixed}
						 */
						extractEventData: function(key,event,extra){
							// jQuery Native then jQuery Custom
							var result = (event && event.originalEvent && event.originalEvent[key]) || (extra && extra[key]) || undefined;

							// Return
							return result;
						},

						/**
						 * History.Adapter.onDomLoad(callback)
						 * @param {function} callback
						 * @return {void}
						 */
						onDomLoad: function(callback) {
							jQuery(callback);
						}
					};

					// Try and Initialise History
					if ( typeof History.init !== 'undefined' ) {
						History.init();
					}

				})(window);
				
				/**
				 * History.js HTML4 Support
				 * Depends on the HTML5 Support
				 * @author Benjamin Arthur Lupton <contact@balupton.com>
				 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
				 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
				 */

				(function(window,undefined){
					

					// ========================================================================
					// Initialise

					// Localise Globals
					var
						document = window.document, // Make sure we are using the correct document
						setTimeout = window.setTimeout||setTimeout,
						clearTimeout = window.clearTimeout||clearTimeout,
						setInterval = window.setInterval||setInterval,
						History = window.History = window.History||{}; // Public History Object

					// Check Existence
					if ( typeof History.initHtml4 !== 'undefined' ) {
						throw new Error('History.js HTML4 Support has already been loaded...');
					}


					// ========================================================================
					// Initialise HTML4 Support

					// Initialise HTML4 Support
					History.initHtml4 = function(){
						// Initialise
						if ( typeof History.initHtml4.initialized !== 'undefined' ) {
							// Already Loaded
							return false;
						}
						else {
							History.initHtml4.initialized = true;
						}


						// ====================================================================
						// Properties

						/**
						 * History.enabled
						 * Is History enabled?
						 */
						History.enabled = true;


						// ====================================================================
						// Hash Storage

						/**
						 * History.savedHashes
						 * Store the hashes in an array
						 */
						History.savedHashes = [];

						/**
						 * History.isLastHash(newHash)
						 * Checks if the hash is the last hash
						 * @param {string} newHash
						 * @return {boolean} true
						 */
						History.isLastHash = function(newHash){
							// Prepare
							var oldHash = History.getHashByIndex(),
								isLast;

							// Check
							isLast = newHash === oldHash;

							// Return isLast
							return isLast;
						};

						/**
						 * History.saveHash(newHash)
						 * Push a Hash
						 * @param {string} newHash
						 * @return {boolean} true
						 */
						History.saveHash = function(newHash){
							// Check Hash
							if ( History.isLastHash(newHash) ) {
								return false;
							}

							// Push the Hash
							History.savedHashes.push(newHash);

							// Return true
							return true;
						};

						/**
						 * History.getHashByIndex()
						 * Gets a hash by the index
						 * @param {integer} index
						 * @return {string}
						 */
						History.getHashByIndex = function(index){
							// Prepare
							var hash = null;

							// Handle
							if ( typeof index === 'undefined' ) {
								// Get the last inserted
								hash = History.savedHashes[History.savedHashes.length-1];
							}
							else if ( index < 0 ) {
								// Get from the end
								hash = History.savedHashes[History.savedHashes.length+index];
							}
							else {
								// Get from the beginning
								hash = History.savedHashes[index];
							}

							// Return hash
							return hash;
						};


						// ====================================================================
						// Discarded States

						/**
						 * History.discardedHashes
						 * A hashed array of discarded hashes
						 */
						History.discardedHashes = {};

						/**
						 * History.discardedStates
						 * A hashed array of discarded states
						 */
						History.discardedStates = {};

						/**
						 * History.discardState(State)
						 * Discards the state by ignoring it through History
						 * @param {object} State
						 * @return {true}
						 */
						History.discardState = function(discardedState,forwardState,backState){
							//History.debug('History.discardState', arguments);
							// Prepare
							var discardedStateHash = History.getHashByState(discardedState),
								discardObject;

							// Create Discard Object
							discardObject = {
								'discardedState': discardedState,
								'backState': backState,
								'forwardState': forwardState
							};

							// Add to DiscardedStates
							History.discardedStates[discardedStateHash] = discardObject;

							// Return true
							return true;
						};

						/**
						 * History.discardHash(hash)
						 * Discards the hash by ignoring it through History
						 * @param {string} hash
						 * @return {true}
						 */
						History.discardHash = function(discardedHash,forwardState,backState){
							//History.debug('History.discardState', arguments);
							// Create Discard Object
							var discardObject = {
								'discardedHash': discardedHash,
								'backState': backState,
								'forwardState': forwardState
							};

							// Add to discardedHash
							History.discardedHashes[discardedHash] = discardObject;

							// Return true
							return true;
						};

						/**
						 * History.discardState(State)
						 * Checks to see if the state is discarded
						 * @param {object} State
						 * @return {bool}
						 */
						History.discardedState = function(State){
							// Prepare
							var StateHash = History.getHashByState(State),
								discarded;

							// Check
							discarded = History.discardedStates[StateHash]||false;

							// Return true
							return discarded;
						};

						/**
						 * History.discardedHash(hash)
						 * Checks to see if the state is discarded
						 * @param {string} State
						 * @return {bool}
						 */
						History.discardedHash = function(hash){
							// Check
							var discarded = History.discardedHashes[hash]||false;

							// Return true
							return discarded;
						};

						/**
						 * History.recycleState(State)
						 * Allows a discarded state to be used again
						 * @param {object} data
						 * @param {string} title
						 * @param {string} url
						 * @return {true}
						 */
						History.recycleState = function(State){
							//History.debug('History.recycleState', arguments);
							// Prepare
							var StateHash = History.getHashByState(State);

							// Remove from DiscardedStates
							if ( History.discardedState(State) ) {
								delete History.discardedStates[StateHash];
							}

							// Return true
							return true;
						};


						// ====================================================================
						// HTML4 HashChange Support

						if ( History.emulated.hashChange ) {
							/*
							 * We must emulate the HTML4 HashChange Support by manually checking for hash changes
							 */

							/**
							 * History.hashChangeInit()
							 * Init the HashChange Emulation
							 */
							History.hashChangeInit = function(){
								// Define our Checker Function
								History.checkerFunction = null;

								// Define some variables that will help in our checker function
								var lastDocumentHash = '',
									iframeId, iframe,
									lastIframeHash, checkerRunning;

								// Handle depending on the browser
								if ( History.isInternetExplorer() ) {
									// IE6 and IE7
									// We need to use an iframe to emulate the back and forward buttons

									// Create iFrame
									iframeId = 'historyjs-iframe';
									iframe = document.createElement('iframe');

									// Adjust iFarme
									iframe.setAttribute('id', iframeId);
									iframe.style.display = 'none';

									// Append iFrame
									document.body.appendChild(iframe);

									// Create initial history entry
									iframe.contentWindow.document.open();
									iframe.contentWindow.document.close();

									// Define some variables that will help in our checker function
									lastIframeHash = '';
									checkerRunning = false;

									// Define the checker function
									History.checkerFunction = function(){
										// Check Running
										if ( checkerRunning ) {
											return false;
										}

										// Update Running
										checkerRunning = true;

										// Fetch
										var documentHash = History.getHash()||'',
											iframeHash = History.unescapeHash(iframe.contentWindow.document.location.hash)||'';

										// The Document Hash has changed (application caused)
										if ( documentHash !== lastDocumentHash ) {
											// Equalise
											lastDocumentHash = documentHash;

											// Create a history entry in the iframe
											if ( iframeHash !== documentHash ) {
												//History.debug('hashchange.checker: iframe hash change', 'documentHash (new):', documentHash, 'iframeHash (old):', iframeHash);

												// Equalise
												lastIframeHash = iframeHash = documentHash;

												// Create History Entry
												iframe.contentWindow.document.open();
												iframe.contentWindow.document.close();

												// Update the iframe's hash
												iframe.contentWindow.document.location.hash = History.escapeHash(documentHash);
											}

											// Trigger Hashchange Event
											History.Adapter.trigger(window,'hashchange');
										}

										// The iFrame Hash has changed (back button caused)
										else if ( iframeHash !== lastIframeHash ) {
											//History.debug('hashchange.checker: iframe hash out of sync', 'iframeHash (new):', iframeHash, 'documentHash (old):', documentHash);

											// Equalise
											lastIframeHash = iframeHash;

											// Update the Hash
											History.setHash(iframeHash,false);
										}

										// Reset Running
										checkerRunning = false;

										// Return true
										return true;
									};
								}
								else {
									// We are not IE
									// Firefox 1 or 2, Opera

									// Define the checker function
									History.checkerFunction = function(){
										// Prepare
										var documentHash = History.getHash();

										// The Document Hash has changed (application caused)
										if ( documentHash !== lastDocumentHash ) {
											// Equalise
											lastDocumentHash = documentHash;

											// Trigger Hashchange Event
											History.Adapter.trigger(window,'hashchange');
										}

										// Return true
										return true;
									};
								}

								// Apply the checker function
								History.intervalList.push(setInterval(History.checkerFunction, History.options.hashChangeInterval));

								// Done
								return true;
							}; // History.hashChangeInit

							// Bind hashChangeInit
							History.Adapter.onDomLoad(History.hashChangeInit);

						} // History.emulated.hashChange


						// ====================================================================
						// HTML5 State Support

						// Non-Native pushState Implementation
						if ( History.emulated.pushState ) {
							/*
							 * We must emulate the HTML5 State Management by using HTML4 HashChange
							 */

							/**
							 * History.onHashChange(event)
							 * Trigger HTML5's window.onpopstate via HTML4 HashChange Support
							 */
							History.onHashChange = function(event){
								//History.debug('History.onHashChange', arguments);

								// Prepare
								var currentUrl = ((event && event.newURL) || document.location.href),
									currentHash = History.getHashByUrl(currentUrl),
									currentState = null,
									currentStateHash = null,
									currentStateHashExits = null,
									discardObject;

								// Check if we are the same state
								if ( History.isLastHash(currentHash) ) {
									// There has been no change (just the page's hash has finally propagated)
									//History.debug('History.onHashChange: no change');
									History.busy(false);
									return false;
								}

								// Reset the double check
								History.doubleCheckComplete();

								// Store our location for use in detecting back/forward direction
								History.saveHash(currentHash);

								// Expand Hash
								if ( currentHash && History.isTraditionalAnchor(currentHash) ) {
									//History.debug('History.onHashChange: traditional anchor', currentHash);
									// Traditional Anchor Hash
									History.Adapter.trigger(window,'anchorchange');
									History.busy(false);
									return false;
								}

								// Create State
								currentState = History.extractState(History.getFullUrl(currentHash||document.location.href,false),true);

								// Check if we are the same state
								if ( History.isLastSavedState(currentState) ) {
									//History.debug('History.onHashChange: no change');
									// There has been no change (just the page's hash has finally propagated)
									History.busy(false);
									return false;
								}

								// Create the state Hash
								currentStateHash = History.getHashByState(currentState);

								// Check if we are DiscardedState
								discardObject = History.discardedState(currentState);
								if ( discardObject ) {
									// Ignore this state as it has been discarded and go back to the state before it
									if ( History.getHashByIndex(-2) === History.getHashByState(discardObject.forwardState) ) {
										// We are going backwards
										//History.debug('History.onHashChange: go backwards');
										History.back(false);
									} else {
										// We are going forwards
										//History.debug('History.onHashChange: go forwards');
										History.forward(false);
									}
									return false;
								}

								// Push the new HTML5 State
								//History.debug('History.onHashChange: success hashchange');
								History.pushState(currentState.data,currentState.title,currentState.url,false);

								// End onHashChange closure
								return true;
							};
							History.Adapter.bind(window,'hashchange',History.onHashChange);

							/**
							 * History.pushState(data,title,url)
							 * Add a new State to the history object, become it, and trigger onpopstate
							 * We have to trigger for HTML4 compatibility
							 * @param {object} data
							 * @param {string} title
							 * @param {string} url
							 * @return {true}
							 */
							History.pushState = function(data,title,url,queue){
								//History.debug('History.pushState: called', arguments);

								// Check the State
								if ( History.getHashByUrl(url) ) {
									throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
								}

								// Handle Queueing
								if ( queue !== false && History.busy() ) {
									// Wait + Push to Queue
									//History.debug('History.pushState: we must wait', arguments);
									History.pushQueue({
										scope: History,
										callback: History.pushState,
										args: arguments,
										queue: queue
									});
									return false;
								}

								// Make Busy
								History.busy(true);

								// Fetch the State Object
								var newState = History.createStateObject(data,title,url),
									newStateHash = History.getHashByState(newState),
									oldState = History.getState(false),
									oldStateHash = History.getHashByState(oldState),
									html4Hash = History.getHash();

								// Store the newState
								History.storeState(newState);
								History.expectedStateId = newState.id;

								// Recycle the State
								History.recycleState(newState);

								// Force update of the title
								History.setTitle(newState);

								// Check if we are the same State
								if ( newStateHash === oldStateHash ) {
									//History.debug('History.pushState: no change', newStateHash);
									History.busy(false);
									return false;
								}

								// Update HTML4 Hash
								if ( newStateHash !== html4Hash && newStateHash !== History.getShortUrl(document.location.href) ) {
									//History.debug('History.pushState: update hash', newStateHash, html4Hash);
									History.setHash(newStateHash,false);
									return false;
								}

								// Update HTML5 State
								History.saveState(newState);

								// Fire HTML5 Event
								//History.debug('History.pushState: trigger popstate');
								History.Adapter.trigger(window,'statechange');
								History.busy(false);

								// End pushState closure
								return true;
							};

							/**
							 * History.replaceState(data,title,url)
							 * Replace the State and trigger onpopstate
							 * We have to trigger for HTML4 compatibility
							 * @param {object} data
							 * @param {string} title
							 * @param {string} url
							 * @return {true}
							 */
							History.replaceState = function(data,title,url,queue){
								//History.debug('History.replaceState: called', arguments);

								// Check the State
								if ( History.getHashByUrl(url) ) {
									throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
								}

								// Handle Queueing
								if ( queue !== false && History.busy() ) {
									// Wait + Push to Queue
									//History.debug('History.replaceState: we must wait', arguments);
									History.pushQueue({
										scope: History,
										callback: History.replaceState,
										args: arguments,
										queue: queue
									});
									return false;
								}

								// Make Busy
								History.busy(true);

								// Fetch the State Objects
								var newState        = History.createStateObject(data,title,url),
									oldState        = History.getState(false),
									previousState   = History.getStateByIndex(-2);

								// Discard Old State
								History.discardState(oldState,newState,previousState);

								// Alias to PushState
								History.pushState(newState.data,newState.title,newState.url,false);

								// End replaceState closure
								return true;
							};

						} // History.emulated.pushState



						// ====================================================================
						// Initialise

						// Non-Native pushState Implementation
						if ( History.emulated.pushState ) {
							/**
							 * Ensure initial state is handled correctly
							 */
							if ( History.getHash() && !History.emulated.hashChange ) {
								History.Adapter.onDomLoad(function(){
									History.Adapter.trigger(window,'hashchange');
								});
							}

						} // History.emulated.pushState

					}; // History.initHtml4

					// Try and Initialise History
					if ( typeof History.init !== 'undefined' ) {
						History.init();
					}

				})(window);
		/**
		 * History.js Core
		 * @author Benjamin Arthur Lupton <contact@balupton.com>
		 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>
		 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
		 */
		
		(function(window,undefined){
			
		
			// ========================================================================
			// Initialise
		
			// Localise Globals
			var
				console = window.console||undefined, // Prevent a JSLint complain
				document = window.document, // Make sure we are using the correct document
				navigator = window.navigator, // Make sure we are using the correct navigator
				sessionStorage = window.sessionStorage||false, // sessionStorage
				setTimeout = window.setTimeout,
				clearTimeout = window.clearTimeout,
				setInterval = window.setInterval,
				clearInterval = window.clearInterval,
				JSON = window.JSON,
				alert = window.alert,
				History = window.History = window.History||{}, // Public History Object
				history = window.history; // Old History Object
		
			// MooTools Compatibility
			JSON.stringify = JSON.stringify||JSON.encode;
			JSON.parse = JSON.parse||JSON.decode;
		
			// Check Existence
			if ( typeof History.init !== 'undefined' ) {
				throw new Error('History.js Core has already been loaded...');
			}
		
			// Initialise History
			History.init = function(){
				// Check Load Status of Adapter
				if ( typeof History.Adapter === 'undefined' ) {
					return false;
				}
		
				// Check Load Status of Core
				if ( typeof History.initCore !== 'undefined' ) {
					History.initCore();
				}
		
				// Check Load Status of HTML4 Support
				if ( typeof History.initHtml4 !== 'undefined' ) {
					History.initHtml4();
				}
		
				// Return true
				return true;
			};
		
		
			// ========================================================================
			// Initialise Core
		
			// Initialise Core
			History.initCore = function(){
				// Initialise
				if ( typeof History.initCore.initialized !== 'undefined' ) {
					// Already Loaded
					return false;
				}
				else {
					History.initCore.initialized = true;
				}
		
		
				// ====================================================================
				// Options
		
				/**
				 * History.options
				 * Configurable options
				 */
				History.options = History.options||{};
		
				/**
				 * History.options.hashChangeInterval
				 * How long should the interval be before hashchange checks
				 */
				History.options.hashChangeInterval = History.options.hashChangeInterval || 100;
		
				/**
				 * History.options.safariPollInterval
				 * How long should the interval be before safari poll checks
				 */
				History.options.safariPollInterval = History.options.safariPollInterval || 500;
		
				/**
				 * History.options.doubleCheckInterval
				 * How long should the interval be before we perform a double check
				 */
				History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;
		
				/**
				 * History.options.storeInterval
				 * How long should we wait between store calls
				 */
				History.options.storeInterval = History.options.storeInterval || 1000;
		
				/**
				 * History.options.busyDelay
				 * How long should we wait between busy events
				 */
				History.options.busyDelay = History.options.busyDelay || 250;
		
				/**
				 * History.options.debug
				 * If true will enable debug messages to be logged
				 */
				History.options.debug = History.options.debug || false;
		
				/**
				 * History.options.initialTitle
				 * What is the title of the initial state
				 */
				History.options.initialTitle = History.options.initialTitle || document.title;
		
		
				// ====================================================================
				// Interval record
		
				/**
				 * History.intervalList
				 * List of intervals set, to be cleared when document is unloaded.
				 */
				History.intervalList = [];
		
				/**
				 * History.clearAllIntervals
				 * Clears all setInterval instances.
				 */
				History.clearAllIntervals = function(){
					var i, il = History.intervalList;
					if (typeof il !== "undefined" && il !== null) {
						for (i = 0; i < il.length; i++) {
							clearInterval(il[i]);
						}
						History.intervalList = null;
					}
				};
		
		
				// ====================================================================
				// Debug
		
				/**
				 * History.debug(message,...)
				 * Logs the passed arguments if debug enabled
				 */
				History.debug = function(){
					if ( (History.options.debug||false) ) {
						History.log.apply(History,arguments);
					}
				};
		
				/**
				 * History.log(message,...)
				 * Logs the passed arguments
				 */
				History.log = function(){
					// Prepare
					var
						consoleExists = !(typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined'),
						textarea = document.getElementById('log'),
						message,
						i,n,
						args,arg
						;
		
					// Write to Console
					if ( consoleExists ) {
						args = Array.prototype.slice.call(arguments);
						message = args.shift();
						if ( typeof console.debug !== 'undefined' ) {
							console.debug.apply(console,[message,args]);
						}
						else {
							console.log.apply(console,[message,args]);
						}
					}
					else {
						message = ("\n"+arguments[0]+"\n");
					}
		
					// Write to log
					for ( i=1,n=arguments.length; i<n; ++i ) {
						arg = arguments[i];
						if ( typeof arg === 'object' && typeof JSON !== 'undefined' ) {
							try {
								arg = JSON.stringify(arg);
							}
							catch ( Exception ) {
								// Recursive Object
							}
						}
						message += "\n"+arg+"\n";
					}
		
					// Textarea
					if ( textarea ) {
						textarea.value += message+"\n-----\n";
						textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;
					}
					// No Textarea, No Console
					else if ( !consoleExists ) {
						alert(message);
					}
		
					// Return true
					return true;
				};
		
		
				// ====================================================================
				// Emulated Status
		
				/**
				 * History.getInternetExplorerMajorVersion()
				 * Get's the major version of Internet Explorer
				 * @return {integer}
				 * @license Public Domain
				 * @author Benjamin Arthur Lupton <contact@balupton.com>
				 * @author James Padolsey <https://gist.github.com/527683>
				 */
				History.getInternetExplorerMajorVersion = function(){
					var result = History.getInternetExplorerMajorVersion.cached =
							(typeof History.getInternetExplorerMajorVersion.cached !== 'undefined')
						?	History.getInternetExplorerMajorVersion.cached
						:	(function(){
								var v = 3,
										div = document.createElement('div'),
										all = div.getElementsByTagName('i');
								while ( (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->') && all[0] ) {}
								return (v > 4) ? v : false;
							})()
						;
					return result;
				};
		
				/**
				 * History.isInternetExplorer()
				 * Are we using Internet Explorer?
				 * @return {boolean}
				 * @license Public Domain
				 * @author Benjamin Arthur Lupton <contact@balupton.com>
				 */
				History.isInternetExplorer = function(){
					var result =
						History.isInternetExplorer.cached =
						(typeof History.isInternetExplorer.cached !== 'undefined')
							?	History.isInternetExplorer.cached
							:	Boolean(History.getInternetExplorerMajorVersion())
						;
					return result;
				};
		
				/**
				 * History.emulated
				 * Which features require emulating?
				 */
				History.emulated = {
					pushState: !Boolean(
						window.history && window.history.pushState && window.history.replaceState
						&& !(
							(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
							|| (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
						)
					),
					hashChange: Boolean(
						!(('onhashchange' in window) || ('onhashchange' in document))
						||
						(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8)
					)
				};
		
				/**
				 * History.enabled
				 * Is History enabled?
				 */
				History.enabled = !History.emulated.pushState;
		
				/**
				 * History.bugs
				 * Which bugs are present
				 */
				History.bugs = {
					/**
					 * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call
					 * https://bugs.webkit.org/show_bug.cgi?id=56249
					 */
					setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),
		
					/**
					 * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions
					 * https://bugs.webkit.org/show_bug.cgi?id=42940
					 */
					safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),
		
					/**
					 * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function)
					 */
					ieDoubleCheck: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8),
		
					/**
					 * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event
					 */
					hashEscape: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 7)
				};
		
				/**
				 * History.isEmptyObject(obj)
				 * Checks to see if the Object is Empty
				 * @param {Object} obj
				 * @return {boolean}
				 */
				History.isEmptyObject = function(obj) {
					for ( var name in obj ) {
						return false;
					}
					return true;
				};
		
				/**
				 * History.cloneObject(obj)
				 * Clones a object and eliminate all references to the original contexts
				 * @param {Object} obj
				 * @return {Object}
				 */
				History.cloneObject = function(obj) {
					var hash,newObj;
					if ( obj ) {
						hash = JSON.stringify(obj);
						newObj = JSON.parse(hash);
					}
					else {
						newObj = {};
					}
					return newObj;
				};
		
		
				// ====================================================================
				// URL Helpers
		
				/**
				 * History.getRootUrl()
				 * Turns "http://mysite.com/dir/page.html?asd" into "http://mysite.com"
				 * @return {String} rootUrl
				 */
				History.getRootUrl = function(){
					// Create
					var rootUrl = document.location.protocol+'//'+(document.location.hostname||document.location.host);
					if ( document.location.port||false ) {
						rootUrl += ':'+document.location.port;
					}
					rootUrl += '/';
		
					// Return
					return rootUrl;
				};
		
				/**
				 * History.getBaseHref()
				 * Fetches the `href` attribute of the `<base href="...">` element if it exists
				 * @return {String} baseHref
				 */
				History.getBaseHref = function(){
					// Create
					var
						baseElements = document.getElementsByTagName('base'),
						baseElement = null,
						baseHref = '';
		
					// Test for Base Element
					if ( baseElements.length === 1 ) {
						// Prepare for Base Element
						baseElement = baseElements[0];
						baseHref = baseElement.href.replace(/[^\/]+$/,'');
					}
		
					// Adjust trailing slash
					baseHref = baseHref.replace(/\/+$/,'');
					if ( baseHref ) baseHref += '/';
		
					// Return
					return baseHref;
				};
		
				/**
				 * History.getBaseUrl()
				 * Fetches the baseHref or basePageUrl or rootUrl (whichever one exists first)
				 * @return {String} baseUrl
				 */
				History.getBaseUrl = function(){
					// Create
					var baseUrl = History.getBaseHref()||History.getBasePageUrl()||History.getRootUrl();
		
					// Return
					return baseUrl;
				};
		
				/**
				 * History.getPageUrl()
				 * Fetches the URL of the current page
				 * @return {String} pageUrl
				 */
				History.getPageUrl = function(){
					// Fetch
					var
						State = History.getState(false,false),
						stateUrl = (State||{}).url||document.location.href,
						pageUrl;
		
					// Create
					pageUrl = stateUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(part,index,string){
						return (/\./).test(part) ? part : part+'/';
					});
		
					// Return
					return pageUrl;
				};
		
				/**
				 * History.getBasePageUrl()
				 * Fetches the Url of the directory of the current page
				 * @return {String} basePageUrl
				 */
				History.getBasePageUrl = function(){
					// Create
					var basePageUrl = document.location.href.replace(/[#\?].*/,'').replace(/[^\/]+$/,function(part,index,string){
						return (/[^\/]$/).test(part) ? '' : part;
					}).replace(/\/+$/,'')+'/';
		
					// Return
					return basePageUrl;
				};
		
				/**
				 * History.getFullUrl(url)
				 * Ensures that we have an absolute URL and not a relative URL
				 * @param {string} url
				 * @param {Boolean} allowBaseHref
				 * @return {string} fullUrl
				 */
				History.getFullUrl = function(url,allowBaseHref){
					// Prepare
					var fullUrl = url, firstChar = url.substring(0,1);
					allowBaseHref = (typeof allowBaseHref === 'undefined') ? true : allowBaseHref;
		
					// Check
					if ( /[a-z]+\:\/\//.test(url) ) {
						// Full URL
					}
					else if ( firstChar === '/' ) {
						// Root URL
						fullUrl = History.getRootUrl()+url.replace(/^\/+/,'');
					}
					else if ( firstChar === '#' ) {
						// Anchor URL
						fullUrl = History.getPageUrl().replace(/#.*/,'')+url;
					}
					else if ( firstChar === '?' ) {
						// Query URL
						fullUrl = History.getPageUrl().replace(/[\?#].*/,'')+url;
					}
					else {
						// Relative URL
						if ( allowBaseHref ) {
							fullUrl = History.getBaseUrl()+url.replace(/^(\.\/)+/,'');
						} else {
							fullUrl = History.getBasePageUrl()+url.replace(/^(\.\/)+/,'');
						}
						// We have an if condition above as we do not want hashes
						// which are relative to the baseHref in our URLs
						// as if the baseHref changes, then all our bookmarks
						// would now point to different locations
						// whereas the basePageUrl will always stay the same
					}
		
					// Return
					return fullUrl.replace(/\#$/,'');
				};
		
				/**
				 * History.getShortUrl(url)
				 * Ensures that we have a relative URL and not a absolute URL
				 * @param {string} url
				 * @return {string} url
				 */
				History.getShortUrl = function(url){
					// Prepare
					var shortUrl = url, baseUrl = History.getBaseUrl(), rootUrl = History.getRootUrl();
		
					// Trim baseUrl
					if ( History.emulated.pushState ) {
						// We are in a if statement as when pushState is not emulated
						// The actual url these short urls are relative to can change
						// So within the same session, we the url may end up somewhere different
						shortUrl = shortUrl.replace(baseUrl,'');
					}
		
					// Trim rootUrl
					shortUrl = shortUrl.replace(rootUrl,'/');
		
					// Ensure we can still detect it as a state
					if ( History.isTraditionalAnchor(shortUrl) ) {
						shortUrl = './'+shortUrl;
					}
		
					// Clean It
					shortUrl = shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');
		
					// Return
					return shortUrl;
				};
		
		
				// ====================================================================
				// State Storage
		
				/**
				 * History.store
				 * The store for all session specific data
				 */
				History.store = {};
		
				/**
				 * History.idToState
				 * 1-1: State ID to State Object
				 */
				History.idToState = History.idToState||{};
		
				/**
				 * History.stateToId
				 * 1-1: State String to State ID
				 */
				History.stateToId = History.stateToId||{};
		
				/**
				 * History.urlToId
				 * 1-1: State URL to State ID
				 */
				History.urlToId = History.urlToId||{};
		
				/**
				 * History.storedStates
				 * Store the states in an array
				 */
				History.storedStates = History.storedStates||[];
		
				/**
				 * History.savedStates
				 * Saved the states in an array
				 */
				History.savedStates = History.savedStates||[];
		
				/**
				 * History.noramlizeStore()
				 * Noramlize the store by adding necessary values
				 */
				History.normalizeStore = function(){
					History.store.idToState = History.store.idToState||{};
					History.store.urlToId = History.store.urlToId||{};
					History.store.stateToId = History.store.stateToId||{};
				};
		
				/**
				 * History.getState()
				 * Get an object containing the data, title and url of the current state
				 * @param {Boolean} friendly
				 * @param {Boolean} create
				 * @return {Object} State
				 */
				History.getState = function(friendly,create){
					// Prepare
					if ( typeof friendly === 'undefined' ) { friendly = true; }
					if ( typeof create === 'undefined' ) { create = true; }
		
					// Fetch
					var State = History.getLastSavedState();
		
					// Create
					if ( !State && create ) {
						State = History.createStateObject();
					}
		
					// Adjust
					if ( friendly ) {
						State = History.cloneObject(State);
						State.url = State.cleanUrl||State.url;
					}
		
					// Return
					return State;
				};
		
				/**
				 * History.getIdByState(State)
				 * Gets a ID for a State
				 * @param {State} newState
				 * @return {String} id
				 */
				History.getIdByState = function(newState){
		
					// Fetch ID
					var id = History.extractId(newState.url),
						str;
					
					if ( !id ) {
						// Find ID via State String
						str = History.getStateString(newState);
						if ( typeof History.stateToId[str] !== 'undefined' ) {
							id = History.stateToId[str];
						}
						else if ( typeof History.store.stateToId[str] !== 'undefined' ) {
							id = History.store.stateToId[str];
						}
						else {
							// Generate a new ID
							while ( true ) {
								id = (new Date()).getTime() + String(Math.random()).replace(/\D/g,'');
								if ( typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined' ) {
									break;
								}
							}
		
							// Apply the new State to the ID
							History.stateToId[str] = id;
							History.idToState[id] = newState;
						}
					}
		
					// Return ID
					return id;
				};
		
				/**
				 * History.normalizeState(State)
				 * Expands a State Object
				 * @param {object} State
				 * @return {object}
				 */
				History.normalizeState = function(oldState){
					// Variables
					var newState, dataNotEmpty;
		
					// Prepare
					if ( !oldState || (typeof oldState !== 'object') ) {
						oldState = {};
					}
		
					// Check
					if ( typeof oldState.normalized !== 'undefined' ) {
						return oldState;
					}
		
					// Adjust
					if ( !oldState.data || (typeof oldState.data !== 'object') ) {
						oldState.data = {};
					}
		
					// ----------------------------------------------------------------
		
					// Create
					newState = {};
					newState.normalized = true;
					newState.title = oldState.title||'';
					newState.url = History.getFullUrl(History.unescapeString(oldState.url||document.location.href));
					newState.hash = History.getShortUrl(newState.url);
					newState.data = History.cloneObject(oldState.data);
		
					// Fetch ID
					newState.id = History.getIdByState(newState);
		
					// ----------------------------------------------------------------
		
					// Clean the URL
					newState.cleanUrl = newState.url.replace(/\??\&_suid.*/,'');
					newState.url = newState.cleanUrl;
		
					// Check to see if we have more than just a url
					dataNotEmpty = !History.isEmptyObject(newState.data);
		
					// Apply
					if ( newState.title || dataNotEmpty ) {
						// Add ID to Hash
						newState.hash = History.getShortUrl(newState.url).replace(/\??\&_suid.*/,'');
						if ( !/\?/.test(newState.hash) ) {
							newState.hash += '?';
						}
						newState.hash += '&_suid='+newState.id;
					}
		
					// Create the Hashed URL
					newState.hashedUrl = History.getFullUrl(newState.hash);
		
					// ----------------------------------------------------------------
		
					// Update the URL if we have a duplicate
					if ( (History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState) ) {
						newState.url = newState.hashedUrl;
					}
		
					// ----------------------------------------------------------------
		
					// Return
					return newState;
				};
		
				/**
				 * History.createStateObject(data,title,url)
				 * Creates a object based on the data, title and url state params
				 * @param {object} data
				 * @param {string} title
				 * @param {string} url
				 * @return {object}
				 */
				History.createStateObject = function(data,title,url){
					// Hashify
					var State = {
						'data': data,
						'title': title,
						'url': url
					};
		
					// Expand the State
					State = History.normalizeState(State);
		
					// Return object
					return State;
				};
		
				/**
				 * History.getStateById(id)
				 * Get a state by it's UID
				 * @param {String} id
				 */
				History.getStateById = function(id){
					// Prepare
					id = String(id);
		
					// Retrieve
					var State = History.idToState[id] || History.store.idToState[id] || undefined;
		
					// Return State
					return State;
				};
		
				/**
				 * Get a State's String
				 * @param {State} passedState
				 */
				History.getStateString = function(passedState){
					// Prepare
					var State, cleanedState, str;
		
					// Fetch
					State = History.normalizeState(passedState);
		
					// Clean
					cleanedState = {
						data: State.data,
						title: passedState.title,
						url: passedState.url
					};
		
					// Fetch
					str = JSON.stringify(cleanedState);
		
					// Return
					return str;
				};
		
				/**
				 * Get a State's ID
				 * @param {State} passedState
				 * @return {String} id
				 */
				History.getStateId = function(passedState){
					// Prepare
					var State, id;
					
					// Fetch
					State = History.normalizeState(passedState);
		
					// Fetch
					id = State.id;
		
					// Return
					return id;
				};
		
				/**
				 * History.getHashByState(State)
				 * Creates a Hash for the State Object
				 * @param {State} passedState
				 * @return {String} hash
				 */
				History.getHashByState = function(passedState){
					// Prepare
					var State, hash;
					
					// Fetch
					State = History.normalizeState(passedState);
		
					// Hash
					hash = State.hash;
		
					// Return
					return hash;
				};
		
				/**
				 * History.extractId(url_or_hash)
				 * Get a State ID by it's URL or Hash
				 * @param {string} url_or_hash
				 * @return {string} id
				 */
				History.extractId = function ( url_or_hash ) {
					// Prepare
					var id,parts,url;
		
					// Extract
					parts = /(.*)\&_suid=([0-9]+)$/.exec(url_or_hash);
					url = parts ? (parts[1]||url_or_hash) : url_or_hash;
					id = parts ? String(parts[2]||'') : '';
		
					// Return
					return id||false;
				};
		
				/**
				 * History.isTraditionalAnchor
				 * Checks to see if the url is a traditional anchor or not
				 * @param {String} url_or_hash
				 * @return {Boolean}
				 */
				History.isTraditionalAnchor = function(url_or_hash){
					// Check
					var isTraditional = !(/[\/\?\.]/.test(url_or_hash));
		
					// Return
					return isTraditional;
				};
		
				/**
				 * History.extractState
				 * Get a State by it's URL or Hash
				 * @param {String} url_or_hash
				 * @return {State|null}
				 */
				History.extractState = function(url_or_hash,create){
					// Prepare
					var State = null, id, url;
					create = create||false;
		
					// Fetch SUID
					id = History.extractId(url_or_hash);
					if ( id ) {
						State = History.getStateById(id);
					}
		
					// Fetch SUID returned no State
					if ( !State ) {
						// Fetch URL
						url = History.getFullUrl(url_or_hash);
		
						// Check URL
						id = History.getIdByUrl(url)||false;
						if ( id ) {
							State = History.getStateById(id);
						}
		
						// Create State
						if ( !State && create && !History.isTraditionalAnchor(url_or_hash) ) {
							State = History.createStateObject(null,null,url);
						}
					}
		
					// Return
					return State;
				};
		
				/**
				 * History.getIdByUrl()
				 * Get a State ID by a State URL
				 */
				History.getIdByUrl = function(url){
					// Fetch
					var id = History.urlToId[url] || History.store.urlToId[url] || undefined;
		
					// Return
					return id;
				};
		
				/**
				 * History.getLastSavedState()
				 * Get an object containing the data, title and url of the current state
				 * @return {Object} State
				 */
				History.getLastSavedState = function(){
					return History.savedStates[History.savedStates.length-1]||undefined;
				};
		
				/**
				 * History.getLastStoredState()
				 * Get an object containing the data, title and url of the current state
				 * @return {Object} State
				 */
				History.getLastStoredState = function(){
					return History.storedStates[History.storedStates.length-1]||undefined;
				};
		
				/**
				 * History.hasUrlDuplicate
				 * Checks if a Url will have a url conflict
				 * @param {Object} newState
				 * @return {Boolean} hasDuplicate
				 */
				History.hasUrlDuplicate = function(newState) {
					// Prepare
					var hasDuplicate = false,
						oldState;
		
					// Fetch
					oldState = History.extractState(newState.url);
		
					// Check
					hasDuplicate = oldState && oldState.id !== newState.id;
		
					// Return
					return hasDuplicate;
				};
		
				/**
				 * History.storeState
				 * Store a State
				 * @param {Object} newState
				 * @return {Object} newState
				 */
				History.storeState = function(newState){
					// Store the State
					History.urlToId[newState.url] = newState.id;
		
					// Push the State
					History.storedStates.push(History.cloneObject(newState));
		
					// Return newState
					return newState;
				};
		
				/**
				 * History.isLastSavedState(newState)
				 * Tests to see if the state is the last state
				 * @param {Object} newState
				 * @return {boolean} isLast
				 */
				History.isLastSavedState = function(newState){
					// Prepare
					var isLast = false,
						newId, oldState, oldId;
		
					// Check
					if ( History.savedStates.length ) {
						newId = newState.id;
						oldState = History.getLastSavedState();
						oldId = oldState.id;
		
						// Check
						isLast = (newId === oldId);
					}
		
					// Return
					return isLast;
				};
		
				/**
				 * History.saveState
				 * Push a State
				 * @param {Object} newState
				 * @return {boolean} changed
				 */
				History.saveState = function(newState){
					// Check Hash
					if ( History.isLastSavedState(newState) ) {
						return false;
					}
		
					// Push the State
					History.savedStates.push(History.cloneObject(newState));
		
					// Return true
					return true;
				};
		
				/**
				 * History.getStateByIndex()
				 * Gets a state by the index
				 * @param {integer} index
				 * @return {Object}
				 */
				History.getStateByIndex = function(index){
					// Prepare
					var State = null;
		
					// Handle
					if ( typeof index === 'undefined' ) {
						// Get the last inserted
						State = History.savedStates[History.savedStates.length-1];
					}
					else if ( index < 0 ) {
						// Get from the end
						State = History.savedStates[History.savedStates.length+index];
					}
					else {
						// Get from the beginning
						State = History.savedStates[index];
					}
		
					// Return State
					return State;
				};
		
		
				// ====================================================================
				// Hash Helpers
		
				/**
				 * History.getHash()
				 * Gets the current document hash
				 * @return {string}
				 */
				History.getHash = function(){
					var hash = History.unescapeHash(document.location.hash);
					return hash;
				};
		
				/**
				 * History.unescapeString()
				 * Unescape a string
				 * @param {String} str
				 * @return {string}
				 */
				History.unescapeString = function(str){
					// Prepare
					var result = str,
						tmp;
		
					// Unescape hash
					while ( true ) {
						tmp = window.unescape(result);
						if ( tmp === result ) {
							break;
						}
						result = tmp;
					}
		
					// Return result
					return result;
				};
		
				/**
				 * History.unescapeHash()
				 * normalize and Unescape a Hash
				 * @param {String} hash
				 * @return {string}
				 */
				History.unescapeHash = function(hash){
					// Prepare
					var result = History.normalizeHash(hash);
		
					// Unescape hash
					result = History.unescapeString(result);
		
					// Return result
					return result;
				};
		
				/**
				 * History.normalizeHash()
				 * normalize a hash across browsers
				 * @return {string}
				 */
				History.normalizeHash = function(hash){
					// Prepare
					var result = hash.replace(/[^#]*#/,'').replace(/#.*/, '');
		
					// Return result
					return result;
				};
		
				/**
				 * History.setHash(hash)
				 * Sets the document hash
				 * @param {string} hash
				 * @return {History}
				 */
				History.setHash = function(hash,queue){
					// Prepare
					var adjustedHash, State, pageUrl;
		
					// Handle Queueing
					if ( queue !== false && History.busy() ) {
						// Wait + Push to Queue
						//History.debug('History.setHash: we must wait', arguments);
						History.pushQueue({
							scope: History,
							callback: History.setHash,
							args: arguments,
							queue: queue
						});
						return false;
					}
		
					// Log
					//History.debug('History.setHash: called',hash);
		
					// Prepare
					adjustedHash = History.escapeHash(hash);
		
					// Make Busy + Continue
					History.busy(true);
		
					// Check if hash is a state
					State = History.extractState(hash,true);
					if ( State && !History.emulated.pushState ) {
						// Hash is a state so skip the setHash
						//History.debug('History.setHash: Hash is a state so skipping the hash set with a direct pushState call',arguments);
		
						// PushState
						History.pushState(State.data,State.title,State.url,false);
					}
					else if ( document.location.hash !== adjustedHash ) {
						// Hash is a proper hash, so apply it
		
						// Handle browser bugs
						if ( History.bugs.setHash ) {
							// Fix Safari Bug https://bugs.webkit.org/show_bug.cgi?id=56249
		
							// Fetch the base page
							pageUrl = History.getPageUrl();
		
							// Safari hash apply
							History.pushState(null,null,pageUrl+'#'+adjustedHash,false);
						}
						else {
							// Normal hash apply
							document.location.hash = adjustedHash;
						}
					}
		
					// Chain
					return History;
				};
		
				/**
				 * History.escape()
				 * normalize and Escape a Hash
				 * @return {string}
				 */
				History.escapeHash = function(hash){
					// Prepare
					var result = History.normalizeHash(hash);
		
					// Escape hash
					result = window.escape(result);
		
					// IE6 Escape Bug
					if ( !History.bugs.hashEscape ) {
						// Restore common parts
						result = result
							.replace(/\%21/g,'!')
							.replace(/\%26/g,'&')
							.replace(/\%3D/g,'=')
							.replace(/\%3F/g,'?');
					}
		
					// Return result
					return result;
				};
		
				/**
				 * History.getHashByUrl(url)
				 * Extracts the Hash from a URL
				 * @param {string} url
				 * @return {string} url
				 */
				History.getHashByUrl = function(url){
					// Extract the hash
					var hash = String(url)
						.replace(/([^#]*)#?([^#]*)#?(.*)/, '$2')
						;
		
					// Unescape hash
					hash = History.unescapeHash(hash);
		
					// Return hash
					return hash;
				};
		
				/**
				 * History.setTitle(title)
				 * Applies the title to the document
				 * @param {State} newState
				 * @return {Boolean}
				 */
				History.setTitle = function(newState){
					// Prepare
					var title = newState.title,
						firstState;
		
					// Initial
					if ( !title ) {
						firstState = History.getStateByIndex(0);
						if ( firstState && firstState.url === newState.url ) {
							title = firstState.title||History.options.initialTitle;
						}
					}
		
					// Apply
					try {
						document.getElementsByTagName('title')[0].innerHTML = title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
					}
					catch ( Exception ) { }
					document.title = title;
		
					// Chain
					return History;
				};
		
		
				// ====================================================================
				// Queueing
		
				/**
				 * History.queues
				 * The list of queues to use
				 * First In, First Out
				 */
				History.queues = [];
		
				/**
				 * History.busy(value)
				 * @param {boolean} value [optional]
				 * @return {boolean} busy
				 */
				History.busy = function(value){
					// Apply
					if ( typeof value !== 'undefined' ) {
						//History.debug('History.busy: changing ['+(History.busy.flag||false)+'] to ['+(value||false)+']', History.queues.length);
						History.busy.flag = value;
					}
					// Default
					else if ( typeof History.busy.flag === 'undefined' ) {
						History.busy.flag = false;
					}
		
					// Queue
					if ( !History.busy.flag ) {
						// Execute the next item in the queue
						clearTimeout(History.busy.timeout);
						var fireNext = function(){
							var i, queue, item;
							if ( History.busy.flag ) return;
							for ( i=History.queues.length-1; i >= 0; --i ) {
								queue = History.queues[i];
								if ( queue.length === 0 ) continue;
								item = queue.shift();
								History.fireQueueItem(item);
								History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
							}
						};
						History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);
					}
		
					// Return
					return History.busy.flag;
				};
		
				/**
				 * History.busy.flag
				 */
				History.busy.flag = false;
		
				/**
				 * History.fireQueueItem(item)
				 * Fire a Queue Item
				 * @param {Object} item
				 * @return {Mixed} result
				 */
				History.fireQueueItem = function(item){
					return item.callback.apply(item.scope||History,item.args||[]);
				};
		
				/**
				 * History.pushQueue(callback,args)
				 * Add an item to the queue
				 * @param {Object} item [scope,callback,args,queue]
				 */
				History.pushQueue = function(item){
					// Prepare the queue
					History.queues[item.queue||0] = History.queues[item.queue||0]||[];
		
					// Add to the queue
					History.queues[item.queue||0].push(item);
		
					// Chain
					return History;
				};
		
				/**
				 * History.queue (item,queue), (func,queue), (func), (item)
				 * Either firs the item now if not busy, or adds it to the queue
				 */
				History.queue = function(item,queue){
					// Prepare
					if ( typeof item === 'function' ) {
						item = {
							callback: item
						};
					}
					if ( typeof queue !== 'undefined' ) {
						item.queue = queue;
					}
		
					// Handle
					if ( History.busy() ) {
						History.pushQueue(item);
					} else {
						History.fireQueueItem(item);
					}
		
					// Chain
					return History;
				};
		
				/**
				 * History.clearQueue()
				 * Clears the Queue
				 */
				History.clearQueue = function(){
					History.busy.flag = false;
					History.queues = [];
					return History;
				};
		
		
				// ====================================================================
				// IE Bug Fix
		
				/**
				 * History.stateChanged
				 * States whether or not the state has changed since the last double check was initialised
				 */
				History.stateChanged = false;
		
				/**
				 * History.doubleChecker
				 * Contains the timeout used for the double checks
				 */
				History.doubleChecker = false;
		
				/**
				 * History.doubleCheckComplete()
				 * Complete a double check
				 * @return {History}
				 */
				History.doubleCheckComplete = function(){
					// Update
					History.stateChanged = true;
		
					// Clear
					History.doubleCheckClear();
		
					// Chain
					return History;
				};
		
				/**
				 * History.doubleCheckClear()
				 * Clear a double check
				 * @return {History}
				 */
				History.doubleCheckClear = function(){
					// Clear
					if ( History.doubleChecker ) {
						clearTimeout(History.doubleChecker);
						History.doubleChecker = false;
					}
		
					// Chain
					return History;
				};
		
				/**
				 * History.doubleCheck()
				 * Create a double check
				 * @return {History}
				 */
				History.doubleCheck = function(tryAgain){
					// Reset
					History.stateChanged = false;
					History.doubleCheckClear();
		
					// Fix IE6,IE7 bug where calling history.back or history.forward does not actually change the hash (whereas doing it manually does)
					// Fix Safari 5 bug where sometimes the state does not change: https://bugs.webkit.org/show_bug.cgi?id=42940
					if ( History.bugs.ieDoubleCheck ) {
						// Apply Check
						History.doubleChecker = setTimeout(
							function(){
								History.doubleCheckClear();
								if ( !History.stateChanged ) {
									//History.debug('History.doubleCheck: State has not yet changed, trying again', arguments);
									// Re-Attempt
									tryAgain();
								}
								return true;
							},
							History.options.doubleCheckInterval
						);
					}
		
					// Chain
					return History;
				};
		
		
				// ====================================================================
				// Safari Bug Fix
		
				/**
				 * History.safariStatePoll()
				 * Poll the current state
				 * @return {History}
				 */
				History.safariStatePoll = function(){
					// Poll the URL
		
					// Get the Last State which has the new URL
					var
						urlState = History.extractState(document.location.href),
						newState;
		
					// Check for a difference
					if ( !History.isLastSavedState(urlState) ) {
						newState = urlState;
					}
					else {
						return;
					}
		
					// Check if we have a state with that url
					// If not create it
					if ( !newState ) {
						//History.debug('History.safariStatePoll: new');
						newState = History.createStateObject();
					}
		
					// Apply the New State
					//History.debug('History.safariStatePoll: trigger');
					History.Adapter.trigger(window,'popstate');
		
					// Chain
					return History;
				};
		
		
				// ====================================================================
				// State Aliases
		
				/**
				 * History.back(queue)
				 * Send the browser history back one item
				 * @param {Integer} queue [optional]
				 */
				History.back = function(queue){
					//History.debug('History.back: called', arguments);
		
					// Handle Queueing
					if ( queue !== false && History.busy() ) {
						// Wait + Push to Queue
						//History.debug('History.back: we must wait', arguments);
						History.pushQueue({
							scope: History,
							callback: History.back,
							args: arguments,
							queue: queue
						});
						return false;
					}
		
					// Make Busy + Continue
					History.busy(true);
		
					// Fix certain browser bugs that prevent the state from changing
					History.doubleCheck(function(){
						History.back(false);
					});
		
					// Go back
					history.go(-1);
		
					// End back closure
					return true;
				};
		
				/**
				 * History.forward(queue)
				 * Send the browser history forward one item
				 * @param {Integer} queue [optional]
				 */
				History.forward = function(queue){
					//History.debug('History.forward: called', arguments);
		
					// Handle Queueing
					if ( queue !== false && History.busy() ) {
						// Wait + Push to Queue
						//History.debug('History.forward: we must wait', arguments);
						History.pushQueue({
							scope: History,
							callback: History.forward,
							args: arguments,
							queue: queue
						});
						return false;
					}
		
					// Make Busy + Continue
					History.busy(true);
		
					// Fix certain browser bugs that prevent the state from changing
					History.doubleCheck(function(){
						History.forward(false);
					});
		
					// Go forward
					history.go(1);
		
					// End forward closure
					return true;
				};
		
				/**
				 * History.go(index,queue)
				 * Send the browser history back or forward index times
				 * @param {Integer} queue [optional]
				 */
				History.go = function(index,queue){
					//History.debug('History.go: called', arguments);
		
					// Prepare
					var i;
		
					// Handle
					if ( index > 0 ) {
						// Forward
						for ( i=1; i<=index; ++i ) {
							History.forward(queue);
						}
					}
					else if ( index < 0 ) {
						// Backward
						for ( i=-1; i>=index; --i ) {
							History.back(queue);
						}
					}
					else {
						throw new Error('History.go: History.go requires a positive or negative integer passed.');
					}
		
					// Chain
					return History;
				};
		
		
				// ====================================================================
				// HTML5 State Support
		
				// Non-Native pushState Implementation
				if ( History.emulated.pushState ) {
					/*
					 * Provide Skeleton for HTML4 Browsers
					 */
		
					// Prepare
					var emptyFunction = function(){};
					History.pushState = History.pushState||emptyFunction;
					History.replaceState = History.replaceState||emptyFunction;
				} // History.emulated.pushState
		
				// Native pushState Implementation
				else {
					/*
					 * Use native HTML5 History API Implementation
					 */
		
					/**
					 * History.onPopState(event,extra)
					 * Refresh the Current State
					 */
					History.onPopState = function(event,extra){
						// Prepare
						var stateId = false, newState = false, currentHash, currentState;
		
						// Reset the double check
						History.doubleCheckComplete();
		
						// Check for a Hash, and handle apporiatly
						currentHash	= History.getHash();
						if ( currentHash ) {
							// Expand Hash
							currentState = History.extractState(currentHash||document.location.href,true);
							if ( currentState ) {
								// We were able to parse it, it must be a State!
								// Let's forward to replaceState
								//History.debug('History.onPopState: state anchor', currentHash, currentState);
								History.replaceState(currentState.data, currentState.title, currentState.url, false);
							}
							else {
								// Traditional Anchor
								//History.debug('History.onPopState: traditional anchor', currentHash);
								History.Adapter.trigger(window,'anchorchange');
								History.busy(false);
							}
		
							// We don't care for hashes
							History.expectedStateId = false;
							return false;
						}
		
						// Ensure
						stateId = History.Adapter.extractEventData('state',event,extra) || false;
		
						// Fetch State
						if ( stateId ) {
							// Vanilla: Back/forward button was used
							newState = History.getStateById(stateId);
						}
						else if ( History.expectedStateId ) {
							// Vanilla: A new state was pushed, and popstate was called manually
							newState = History.getStateById(History.expectedStateId);
						}
						else {
							// Initial State
							newState = History.extractState(document.location.href);
						}
		
						// The State did not exist in our store
						if ( !newState ) {
							// Regenerate the State
							newState = History.createStateObject(null,null,document.location.href);
						}
		
						// Clean
						History.expectedStateId = false;
		
						// Check if we are the same state
						if ( History.isLastSavedState(newState) ) {
							// There has been no change (just the page's hash has finally propagated)
							//History.debug('History.onPopState: no change', newState, History.savedStates);
							History.busy(false);
							return false;
						}
		
						// Store the State
						History.storeState(newState);
						History.saveState(newState);
		
						// Force update of the title
						History.setTitle(newState);
		
						// Fire Our Event
						History.Adapter.trigger(window,'statechange');
						History.busy(false);
		
						// Return true
						return true;
					};
					History.Adapter.bind(window,'popstate',History.onPopState);
		
					/**
					 * History.pushState(data,title,url)
					 * Add a new State to the history object, become it, and trigger onpopstate
					 * We have to trigger for HTML4 compatibility
					 * @param {object} data
					 * @param {string} title
					 * @param {string} url
					 * @return {true}
					 */
					History.pushState = function(data,title,url,queue){
						//History.debug('History.pushState: called', arguments);
		
						// Check the State
						if ( History.getHashByUrl(url) && History.emulated.pushState ) {
							throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
						}
		
						// Handle Queueing
						if ( queue !== false && History.busy() ) {
							// Wait + Push to Queue
							//History.debug('History.pushState: we must wait', arguments);
							History.pushQueue({
								scope: History,
								callback: History.pushState,
								args: arguments,
								queue: queue
							});
							return false;
						}
		
						// Make Busy + Continue
						History.busy(true);
		
						// Create the newState
						var newState = History.createStateObject(data,title,url);
		
						// Check it
						if ( History.isLastSavedState(newState) ) {
							// Won't be a change
							History.busy(false);
						}
						else {
							// Store the newState
							History.storeState(newState);
							History.expectedStateId = newState.id;
		
							// Push the newState
							history.pushState(newState.id,newState.title,newState.url);
		
							// Fire HTML5 Event
							History.Adapter.trigger(window,'popstate');
						}
		
						// End pushState closure
						return true;
					};
		
					/**
					 * History.replaceState(data,title,url)
					 * Replace the State and trigger onpopstate
					 * We have to trigger for HTML4 compatibility
					 * @param {object} data
					 * @param {string} title
					 * @param {string} url
					 * @return {true}
					 */
					History.replaceState = function(data,title,url,queue){
						//History.debug('History.replaceState: called', arguments);
		
						// Check the State
						if ( History.getHashByUrl(url) && History.emulated.pushState ) {
							throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');
						}
		
						// Handle Queueing
						if ( queue !== false && History.busy() ) {
							// Wait + Push to Queue
							//History.debug('History.replaceState: we must wait', arguments);
							History.pushQueue({
								scope: History,
								callback: History.replaceState,
								args: arguments,
								queue: queue
							});
							return false;
						}
		
						// Make Busy + Continue
						History.busy(true);
		
						// Create the newState
						var newState = History.createStateObject(data,title,url);
		
						// Check it
						if ( History.isLastSavedState(newState) ) {
							// Won't be a change
							History.busy(false);
						}
						else {
							// Store the newState
							History.storeState(newState);
							History.expectedStateId = newState.id;
		
							// Push the newState
							history.replaceState(newState.id,newState.title,newState.url);
		
							// Fire HTML5 Event
							History.Adapter.trigger(window,'popstate');
						}
		
						// End replaceState closure
						return true;
					};
		
				} // !History.emulated.pushState
		
		
				// ====================================================================
				// Initialise
		
				/**
				 * Load the Store
				 */
				if ( sessionStorage ) {
					// Fetch
					try {
						History.store = JSON.parse(sessionStorage.getItem('History.store'))||{};
					}
					catch ( err ) {
						History.store = {};
					}
		
					// Normalize
					History.normalizeStore();
				}
				else {
					// Default Load
					History.store = {};
					History.normalizeStore();
				}
		
				/**
				 * Clear Intervals on exit to prevent memory leaks
				 */
				History.Adapter.bind(window,"beforeunload",History.clearAllIntervals);
				History.Adapter.bind(window,"unload",History.clearAllIntervals);
		
				/**
				 * Create the initial State
				 */
				History.saveState(History.storeState(History.extractState(document.location.href,true)));
		
				/**
				 * Bind for Saving Store
				 */
				if ( sessionStorage ) {
					// When the page is closed
					History.onUnload = function(){
						// Prepare
						var	currentStore, item;
		
						// Fetch
						try {
							currentStore = JSON.parse(sessionStorage.getItem('History.store'))||{};
						}
						catch ( err ) {
							currentStore = {};
						}
		
						// Ensure
						currentStore.idToState = currentStore.idToState || {};
						currentStore.urlToId = currentStore.urlToId || {};
						currentStore.stateToId = currentStore.stateToId || {};
		
						// Sync
						for ( item in History.idToState ) {
							if ( !History.idToState.hasOwnProperty(item) ) {
								continue;
							}
							currentStore.idToState[item] = History.idToState[item];
						}
						for ( item in History.urlToId ) {
							if ( !History.urlToId.hasOwnProperty(item) ) {
								continue;
							}
							currentStore.urlToId[item] = History.urlToId[item];
						}
						for ( item in History.stateToId ) {
							if ( !History.stateToId.hasOwnProperty(item) ) {
								continue;
							}
							currentStore.stateToId[item] = History.stateToId[item];
						}
		
						// Update
						History.store = currentStore;
						History.normalizeStore();
		
						// Store
						sessionStorage.setItem('History.store',JSON.stringify(currentStore));
					};
		
					// For Internet Explorer
					History.intervalList.push(setInterval(History.onUnload,History.options.storeInterval));
					
					// For Other Browsers
					History.Adapter.bind(window,'beforeunload',History.onUnload);
					History.Adapter.bind(window,'unload',History.onUnload);
					
					// Both are enabled for consistency
				}
		
				// Non-Native pushState Implementation
				if ( !History.emulated.pushState ) {
					// Be aware, the following is only for native pushState implementations
					// If you are wanting to include something for all browsers
					// Then include it above this if block
		
					/**
					 * Setup Safari Fix
					 */
					if ( History.bugs.safariPoll ) {
						History.intervalList.push(setInterval(History.safariStatePoll, History.options.safariPollInterval));
					}
		
					/**
					 * Ensure Cross Browser Compatibility
					 */
					if ( navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName||'') === 'Mozilla' ) {
						/**
						 * Fix Safari HashChange Issue
						 */
		
						// Setup Alias
						History.Adapter.bind(window,'hashchange',function(){
							History.Adapter.trigger(window,'popstate');
						});
		
						// Initialise Alias
						if ( History.getHash() ) {
							History.Adapter.onDomLoad(function(){
								History.Adapter.trigger(window,'hashchange');
							});
						}
					}
		
				} // !History.emulated.pushState
		
		
			}; // History.initCore
		
			// Try and Initialise History
						History.init();
		
					})(window);
			} catch (e) {
				// already installed.
				
			}
			
} );

timely.define('external_libs/jquery.tablescroller',
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
/*

Copyright (c) 2009 Dimas Begunoff, http://www.farinspace.com

Licensed under the MIT license
http://en.wikipedia.org/wiki/MIT_License

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/



var scrollbarWidth = 0;

// http://jdsharp.us/jQuery/minute/calculate-scrollbar-width.php
function getScrollbarWidth()
{
	if (scrollbarWidth) return scrollbarWidth;
	var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>');
	$('body').append(div);
	var w1 = $('div', div).innerWidth();
	div.css('overflow-y', 'auto');
	var w2 = $('div', div).innerWidth();
	$(div).remove();
	scrollbarWidth = (w1 - w2);
	return scrollbarWidth;
}

$.fn.tableScroll = function(options)
{
	if (options == 'undo')
	{
		var container = $(this).parent().parent();
		if (container.hasClass('tablescroll_wrapper'))
		{
			container.find('.tablescroll_head thead').prependTo(this);
			container.find('.tablescroll_foot tfoot').appendTo(this);
			container.before(this);
			container.empty();
		}
		return;
	}

	var settings = $.extend({},$.fn.tableScroll.defaults,options);

	// Bail out if there's no vertical overflow
	//if ($(this).height() <= settings.height)
	//{
	//  return this;
	//}

	settings.scrollbarWidth = getScrollbarWidth();

	this.each(function()
	{
		var flush = settings.flush;

		var tb = $(this).addClass('tablescroll_body');

		var wrapper = $('<div class="tablescroll_wrapper ai1ec-popover-boundary"></div>').insertBefore(tb).append(tb);

		// check for a predefined container
		if (!wrapper.parent('div').hasClass(settings.containerClass))
		{
			$('<div></div>').addClass(settings.containerClass).insertBefore(wrapper).append(wrapper);
		}

		var width = settings.width ? settings.width : tb.outerWidth();
		var overflow = settings.scroll ? 'auto' : 'hidden';

		wrapper.css
		({
			'width': width+'px',
			'height': settings.height+'px',
			'overflow': overflow
		});

		tb.css('width',width+'px');

		// with border difference
		var wrapper_width = wrapper.outerWidth();
		var diff = wrapper_width-width;

		// assume table will scroll
		wrapper.css({width:((width-diff-2))+'px'});
		tb.css('width',(width-diff-settings.scrollbarWidth)+'px');

		if (tb.outerHeight() <= settings.height)
		{
			wrapper.css({height:'auto',width:(width-diff)+'px'});
			flush = false;
		}

		// using wrap does not put wrapper in the DOM right
		// away making it unavailable for use during runtime
		// tb.wrap(wrapper);

		// possible speed enhancements
		var has_thead = $('thead',tb).length ? true : false ;
		var has_tfoot = $('tfoot',tb).length ? true : false ;
		var thead_tr_first = $('thead tr:first',tb);
		var tbody_tr_first = $('tbody tr:first',tb);
		var tfoot_tr_first = $('tfoot tr:first',tb);

		// remember width of last cell
		var w = 0;

		$('th, td',thead_tr_first).each(function(i)
		{
			w  = $(this).width();
			$('th:eq('+i+'), td:eq('+i+')',thead_tr_first).css('width',w+'px');
			$('th:eq('+i+'), td:eq('+i+')',tbody_tr_first).css('width',w+'px');
			if (has_tfoot) $('th:eq('+i+'), td:eq('+i+')',tfoot_tr_first).css('width',w+'px');
		});

		if (has_thead)
		{
			var tbh = $('<table class="tablescroll_head" cellspacing="0"></table>').insertBefore(wrapper).prepend($('thead',tb));
		}

		if (has_tfoot)
		{
			var tbf = $('<table class="tablescroll_foot" cellspacing="0"></table>').insertAfter(wrapper).prepend($('tfoot',tb));
		}

		if (tbh != undefined)
		{
			tbh.css('width',width+'px');

			if (flush)
			{
				$('tr:first th:last, tr:first td:last',tbh).css('width',(w+settings.scrollbarWidth)+'px');
				tbh.css('width',wrapper.outerWidth() + 'px');
			}
		}

		if (tbf != undefined)
		{
			tbf.css('width',width+'px');

			if (flush)
			{
				$('tr:first th:last, tr:first td:last',tbf).css('width',(w+settings.scrollbarWidth)+'px');
				tbf.css('width',wrapper.outerWidth() + 'px');
			}
		}
	});

	return this;
};

// public
$.fn.tableScroll.defaults =
{
	flush: true, // makes the last thead and tbody column flush with the scrollbar
	width: null, // width of the table (head, body and foot), null defaults to the tables natural width
	height: 100, // height of the scrollable area
	containerClass: 'tablescroll', // the plugin wraps the table in a div with this css class
	scroll: true // whether to allow scrolling or not
};

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

/**
 * Bulgarian translation for bootstrap-datepicker
 * Apostol Apostolov <apostol.s.apostolov@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.bg', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['bg'] = {
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
	return { localize: function() {
  $.fn.datepicker.dates['br'] = {
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
 * Fixes by Michal Remiš <michal.remis@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.cs', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['cs'] = {
		days: ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota", "Neděle"],
		daysShort: ["Ned", "Pon", "Úte", "Stř", "Čtv", "Pát", "Sob", "Ned"],
		daysMin: ["Ne", "Po", "Út", "St", "Čt", "Pá", "So", "Ne"],
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
	return { localize: function() {
	$.fn.datepicker.dates['da'] = {
		days: ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"],
		daysShort: ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
		daysMin: ["Sø", "Ma", "Ti", "On", "To", "Fr", "Lø", "Sø"],
		months: ["Januar", "Februar", "Marts", "April", "Maj", "Juni", "Juli", "August", "September", "Oktober", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
		today: "I Dag",
		clear: "Nulstil"
	} } };
} );

/**
 * German translation for bootstrap-datepicker
 * Sam Zurcher <sam@orelias.ch>
 */
timely.define('external_libs/locales/bootstrap-datepicker.de', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['de'] = {
		days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
		daysShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam", "Son"],
		daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
		months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		monthsShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
		today: "Heute",
		clear: "Löschen",
		weekStart: 1,
		format: "dd.mm.yyyy"
	} } };
} );

/**
 * Spanish translation for bootstrap-datepicker
 * Bruno Bonamin <bruno.bonamin@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.es', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['es'] = {
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
	return { localize: function() {
	$.fn.datepicker.dates['fi'] = {
		days: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai", "sunnuntai"],
		daysShort: ["sun", "maa", "tii", "kes", "tor", "per", "lau", "sun"],
		daysMin: ["su", "ma", "ti", "ke", "to", "pe", "la", "su"],
		months: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
		monthsShort: ["tam", "hel", "maa", "huh", "tou", "kes", "hei", "elo", "syy", "lok", "mar", "jou"],
		today: "tänään",
		weekStart: 1,
		format: "d.m.yyyy"
	} } };
} );

/**
 * French translation for bootstrap-datepicker
 * Nico Mollet <nico.mollet@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.fr', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['fr'] = {
		days: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
		daysShort: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
		daysMin: ["D", "L", "Ma", "Me", "J", "V", "S", "D"],
		months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
		monthsShort: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jui", "Jul", "Aou", "Sep", "Oct", "Nov", "Déc"],
		today: "Aujourd'hui",
		clear: "Effacer",
		weekStart: 1,
		format: "dd/mm/yyyy"
	} } };
} );

/**
 * Bahasa translation for bootstrap-datepicker
 * Azwar Akbar <azwar.akbar@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.id', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['id'] = {
		days: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"],
		daysShort: ["Mgu", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Mgu"],
		daysMin: ["Mg", "Sn", "Sl", "Ra", "Ka", "Ju", "Sa", "Mg"],
		months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"],
		today: "Hari Ini",
		clear: "Kosongkan"
	} } };
} );

/**
 * Icelandic translation for bootstrap-datepicker
 * Hinrik Örn Sigurðsson <hinrik.sig@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.is', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['is'] = {
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
	return { localize: function() {
	$.fn.datepicker.dates['it'] = {
		days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
		daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
		daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa", "Do"],
		months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
		monthsShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
		today: "Oggi",
		clear: "Cancella",
		weekStart: 1,
		format: "dd/mm/yyyy"
	} } };
} );

/**
 * Japanese translation for bootstrap-datepicker
 * Norio Suzuki <https://github.com/suzuki/>
 */
timely.define('external_libs/locales/bootstrap-datepicker.ja', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['ja'] = {
		days: ["日曜", "月曜", "火曜", "水曜", "木曜", "金曜", "土曜", "日曜"],
		daysShort: ["日", "月", "火", "水", "木", "金", "土", "日"],
		daysMin: ["日", "月", "火", "水", "木", "金", "土", "日"],
		months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		monthsShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
		today: "今日",
		format: "yyyy/mm/dd"
	} } };
} );

/**
 * Korean translation for bootstrap-datepicker
 * Gu Youn <http://github.com/guyoun>
 */
timely.define('external_libs/locales/bootstrap-datepicker.kr', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['kr'] = {
		days: ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"],
		daysShort: ["일", "월", "화", "수", "목", "금", "토", "일"],
		daysMin: ["일", "월", "화", "수", "목", "금", "토", "일"],
		months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
		monthsShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
	} } };
} );

/**
 * Lithuanian translation for bootstrap-datepicker
 * Šarūnas Gliebus <ssharunas@yahoo.co.uk>
 */

timely.define('external_libs/locales/bootstrap-datepicker.lt', ["jquery_timely"], function( $ ) {
	return { localize: function() {
    $.fn.datepicker.dates['lt'] = {
        days: ["Sekmadienis", "Pirmadienis", "Antradienis", "Trečiadienis", "Ketvirtadienis", "Penktadienis", "Šeštadienis", "Sekmadienis"],
        daysShort: ["S", "Pr", "A", "T", "K", "Pn", "Š", "S"],
        daysMin: ["Sk", "Pr", "An", "Tr", "Ke", "Pn", "Št", "Sk"],
        months: ["Sausis", "Vasaris", "Kovas", "Balandis", "Gegužė", "Birželis", "Liepa", "Rugpjūtis", "Rugsėjis", "Spalis", "Lapkritis", "Gruodis"],
        monthsShort: ["Sau", "Vas", "Kov", "Bal", "Geg", "Bir", "Lie", "Rugp", "Rugs", "Spa", "Lap", "Gru"],
        today: "Šiandien",
        weekStart: 1
    } } };
} );

/**
 * Latvian translation for bootstrap-datepicker
 * Artis Avotins <artis@apit.lv>
 */

timely.define('external_libs/locales/bootstrap-datepicker.lv', ["jquery_timely"], function( $ ) {
	return { localize: function() {
    $.fn.datepicker.dates['lv'] = {
        days: ["Svētdiena", "Pirmdiena", "Otrdiena", "Trešdiena", "Ceturtdiena", "Piektdiena", "Sestdiena", "Svētdiena"],
        daysShort: ["Sv", "P", "O", "T", "C", "Pk", "S", "Sv"],
        daysMin: ["Sv", "Pr", "Ot", "Tr", "Ce", "Pk", "Se", "Sv"],
        months: ["Janvāris", "Februāris", "Marts", "Aprīlis", "Maijs", "Jūnijs", "Jūlijs", "Augusts", "Septembris", "Oktobris", "Novembris", "Decembris"],
        monthsShort: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jūn", "Jūl", "Aug", "Sep", "Okt", "Nov", "Dec"],
        today: "Šodien",
        weekStart: 1
    } } };
} );

/**
 * Malay translation for bootstrap-datepicker
 * Ateman Faiz <noorulfaiz@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.ms', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['ms'] = {
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
	return { localize: function() {
	$.fn.datepicker.dates['nb'] = {
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
	return { localize: function() {
	$.fn.datepicker.dates['nl'] = {
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
	return { localize: function() {
        $.fn.datepicker.dates['pl'] = {
                days: ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"],
                daysShort: ["Nie", "Pn", "Wt", "Śr", "Czw", "Pt", "So", "Nie"],
                daysMin: ["N", "Pn", "Wt", "Śr", "Cz", "Pt", "So", "N"],
                months: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
                monthsShort: ["Sty", "Lu", "Mar", "Kw", "Maj", "Cze", "Lip", "Sie", "Wrz", "Pa", "Lis", "Gru"],
                today: "Dzisiaj",
                weekStart: 1
        } } };
} );

/**
 * Brazilian translation for bootstrap-datepicker
 * Cauan Cabral <cauan@radig.com.br>
 */
timely.define('external_libs/locales/bootstrap-datepicker.pt-BR', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['pt-BR'] = {
		days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
		daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
		daysMin: ["Do", "Se", "Te", "Qu", "Qu", "Se", "Sa", "Do"],
		months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
		today: "Hoje",
		clear: "Limpar"
	} } };
} );

/**
 * Portuguese translation for bootstrap-datepicker
 * Original code: Cauan Cabral <cauan@radig.com.br>
 * Tiago Melo <tiago.blackcode@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.pt', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['pt'] = {
		days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"],
		daysShort: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
		daysMin: ["Do", "Se", "Te", "Qu", "Qu", "Se", "Sa", "Do"],
		months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		monthsShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
		today: "Hoje",
		clear: "Limpar"
	} } };
} );

/**
 * Russian translation for bootstrap-datepicker
 * Victor Taranenko <darwin@snowdale.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.ru', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['ru'] = {
		days: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"],
		daysShort: ["Вск", "Пнд", "Втр", "Срд", "Чтв", "Птн", "Суб", "Вск"],
		daysMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
		months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
		monthsShort: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
		today: "Сегодня",
		weekStart: 1
	} } };
} );

/**
 * Slovene translation for bootstrap-datepicker
 * Gregor Rudolf <gregor.rudolf@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.sl', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['sl'] = {
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
	return { localize: function() {
	$.fn.datepicker.dates['sv'] = {
		days: ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"],
		daysShort: ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"],
		daysMin: ["Sö", "Må", "Ti", "On", "To", "Fr", "Lö", "Sö"],
		months: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"],
		today: "I Dag",
		format: "yyyy-mm-dd",
		weekStart: 1
	} } };
} );

/**
 * Thai translation for bootstrap-datepicker
 * Suchau Jiraprapot <seroz24@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.th', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['th'] = {
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
	return { localize: function() {
	$.fn.datepicker.dates['tr'] = {
		days: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"],
		daysShort: ["Pz", "Pzt", "Sal", "Çrş", "Prş", "Cu", "Cts", "Pz"],
		daysMin: ["Pz", "Pzt", "Sa", "Çr", "Pr", "Cu", "Ct", "Pz"],
		months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
		monthsShort: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
		today: "Bugün",
		format: "dd.mm.yyyy"
	} } };
} );


/**
 * Simplified Chinese translation for bootstrap-datepicker
 * Yuan Cheung <advanimal@gmail.com>
 */
timely.define('external_libs/locales/bootstrap-datepicker.zh-CN', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['zh-CN'] = {
		days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
		daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
		daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
		months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
		monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
		today: "今日",
		format: "yyyy年mm月dd日",
		weekStart: 1
	} } };
} );

/**
 * Traditional Chinese translation for bootstrap-datepicker
 * Rung-Sheng Jang <daniel@i-trend.co.cc>
 * FrankWu  <frankwu100@gmail.com> Fix more appropriate use of Traditional Chinese habit
 */
timely.define('external_libs/locales/bootstrap-datepicker.zh-TW', ["jquery_timely"], function( $ ) {
	return { localize: function() {
	$.fn.datepicker.dates['zh-TW'] = {
		days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
		daysShort: ["週日", "週一", "週二", "週三", "週四", "週五", "週六", "週日"],
		daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
		months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
		monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
		today: "今天",
		format: "yyyy年mm月dd日",
		weekStart: 1
	} } };
} );

/* =========================================================
 * bootstrap-datepicker.js
 * Repo: https://github.com/eternicode/bootstrap-datepicker/
 * Demo: http://eternicode.github.io/bootstrap-datepicker/
 * Docs: http://bootstrap-datepicker.readthedocs.org/
 * Forked from http://www.eyecon.ro/bootstrap-datepicker
 * =========================================================
 * Started by Stefan Petre; improvements by Andrew Rowls + contributors
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

	var $window = $(window);

	function UTCDate(){
		return new Date(Date.UTC.apply(Date, arguments));
	}
	function UTCToday(){
		var today = new Date();
		return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
	}
	function alias(method){
		return function(){
			return this[method].apply(this, arguments);
		}
	}

	var DateArray = (function(){
		var extras = {
			get: function(i){
				return this.slice(i)[0];
			},
			contains: function(d){
				// Array.indexOf is not cross-browser;
				// $.inArray doesn't work with Dates
				var val = d && d.valueOf();
				for (var i=0, l=this.length; i<l; i++)
					if (this[i].valueOf() === val)
						return i;
				return -1;
			},
			remove: function(i){
				this.splice(i,1);
			},
			replace: function(new_array){
				if (!new_array)
					return;
				if (!$.isArray(new_array))
					new_array = [new_array];
				this.clear();
				this.push.apply(this, new_array);
			},
			clear: function(){
				this.splice(0);
			},
			copy: function(){
				var a = new DateArray();
				a.replace(this);
				return a;
			}
		};

		return function(){
			var a = [];
			a.push.apply(a, arguments);
			$.extend(a, extras);
			return a;
		}
	})();


	// Picker object

	var Datepicker = function(element, options) {
		this.dates = new DateArray();
		this.viewDate = UTCToday();
		this.focusDate = null;

		this._process_options(options);

		this.element = $(element);
		this.isInline = false;
		this.isInput = this.element.is('input');
		this.component = this.element.is('.ai1ec-date') ? this.element.find('.ai1ec-input-group, .ai1ec-input-group-addon, .ai1ec-btn') : false;
		this.hasInput = this.component && this.element.find('input').length;
		if(this.component && this.component.length === 0)
			this.component = false;

		this.picker = $(DPGlobal.template);
		this._buildEvents();
		this._attachEvents();

		if(this.isInline) {
			this.picker.addClass('ai1ec-datepicker-inline').appendTo(this.element);
		} else {
			this.picker.addClass('ai1ec-datepicker-dropdown ai1ec-dropdown-menu');
		}

		if (this.o.rtl){
			this.picker.addClass('ai1ec-datepicker-rtl');
		}

		this.viewMode = this.o.startView;

		if (this.o.calendarWeeks)
			this.picker.find('tfoot th.ai1ec-today')
						.attr('colspan', function(i, val){
							return parseInt(val) + 1;
						});

		this._allow_update = false;

		this.setStartDate(this._o.startDate);
		this.setEndDate(this._o.endDate);
		this.setDaysOfWeekDisabled(this.o.daysOfWeekDisabled);

		this.fillDow();
		this.fillMonths();

		this._allow_update = true;

		this.update();
		this.showMode();

		if(this.isInline) {
			this.show();
		}
	};

	Datepicker.prototype = {
		constructor: Datepicker,

		_process_options: function(opts){
			// Store raw options for reference
			this._o = $.extend({}, this._o, opts);
			// Processed options
			var o = this.o = $.extend({}, this._o);

			// Check if "de-DE" style date is available, if not language should
			// fallback to 2 letter code eg "de"
			var lang = o.language;
			if (!dates[lang]) {
				lang = lang.split('-')[0];
				// ==========================
				// = Timely edit 10-01-2014 =
				// ==========================
				if (!dates[lang]) {
					lang = ai1ec_config.language;
					if (!dates[lang])
						lang = defaults.language;
				}
				// ===================
				// = Timely edit end =
				// ===================
			}
			o.language = lang;

			switch(o.startView){
				case 2:
				case 'decade':
					o.startView = 2;
					break;
				case 1:
				case 'year':
					o.startView = 1;
					break;
				default:
					o.startView = 0;
			}

			switch (o.minViewMode) {
				case 1:
				case 'months':
					o.minViewMode = 1;
					break;
				case 2:
				case 'years':
					o.minViewMode = 2;
					break;
				default:
					o.minViewMode = 0;
			}

			o.startView = Math.max(o.startView, o.minViewMode);

			// true, false, or Number > 0
			if (o.multidate !== true){
				o.multidate = Number(o.multidate) || false;
				if (o.multidate !== false)
					o.multidate = Math.max(0, o.multidate);
				else
					o.multidate = 1;
			}
			o.multidateSeparator = String(o.multidateSeparator);

			o.weekStart %= 7;
			o.weekEnd = ((o.weekStart + 6) % 7);

			var format = DPGlobal.parseFormat(o.format);
			if (o.startDate !== -Infinity) {
				if (!!o.startDate) {
					if (o.startDate instanceof Date)
						o.startDate = this._local_to_utc(this._zero_time(o.startDate));
					else
						o.startDate = DPGlobal.parseDate(o.startDate, format, o.language);
				} else {
					o.startDate = -Infinity;
				}
			}
			if (o.endDate !== Infinity) {
				if (!!o.endDate) {
					if (o.endDate instanceof Date)
						o.endDate = this._local_to_utc(this._zero_time(o.endDate));
					else
						o.endDate = DPGlobal.parseDate(o.endDate, format, o.language);
				} else {
					o.endDate = Infinity;
				}
			}

			o.daysOfWeekDisabled = o.daysOfWeekDisabled||[];
			if (!$.isArray(o.daysOfWeekDisabled))
				o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
			o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function (d) {
				return parseInt(d, 10);
			});

			var plc = String(o.orientation).toLowerCase().split(/\s+/g),
				_plc = o.orientation.toLowerCase();
			plc = $.grep(plc, function(word){
				return (/^auto|left|right|top|bottom$/).test(word);
			});
			o.orientation = {x: 'auto', y: 'auto'};
			if (!_plc || _plc === 'auto')
				; // no action
			else if (plc.length === 1){
				switch(plc[0]){
					case 'top':
					case 'bottom':
						o.orientation.y = plc[0];
						break;
					case 'left':
					case 'right':
						o.orientation.x = plc[0];
						break;
				}
			}
			else {
				_plc = $.grep(plc, function(word){
					return (/^left|right$/).test(word);
				});
				o.orientation.x = _plc[0] || 'auto';

				_plc = $.grep(plc, function(word){
					return (/^top|bottom$/).test(word);
				});
				o.orientation.y = _plc[0] || 'auto';
			}
		},
		_events: [],
		_secondaryEvents: [],
		_applyEvents: function(evs){
			for (var i=0, el, ch, ev; i<evs.length; i++){
				el = evs[i][0];
				if (evs[i].length == 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length == 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.on(ev, ch);
			}
		},
		_unapplyEvents: function(evs){
			for (var i=0, el, ev, ch; i<evs.length; i++){
				el = evs[i][0];
				if (evs[i].length == 2){
					ch = undefined;
					ev = evs[i][1];
				}
				else if (evs[i].length == 3){
					ch = evs[i][1];
					ev = evs[i][2];
				}
				el.off(ev, ch);
			}
		},
		_buildEvents: function(){
			if (this.isInput) { // single input
				this._events = [
					[this.element, {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e){
							if ($.inArray(e.keyCode, [27,37,39,38,40,32,13,9]) === -1)
								this.update();
						}, this),
						keydown: $.proxy(this.keydown, this)
					}]
				];
			}
			else if (this.component && this.hasInput){ // component: input + button
				this._events = [
					// For components that are not readonly, allow keyboard nav
					[this.element.find('input'), {
						focus: $.proxy(this.show, this),
						keyup: $.proxy(function(e){
							if ($.inArray(e.keyCode, [27,37,39,38,40,32,13,9]) === -1)
								this.update()
						}, this),
						keydown: $.proxy(this.keydown, this)
					}],
					[this.component, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			else if (this.element.is('div')) {  // inline datepicker
				this.isInline = true;
			}
			else {
				this._events = [
					[this.element, {
						click: $.proxy(this.show, this)
					}]
				];
			}
			this._events.push(
				// Component: listen for blur on element descendants
				[this.element, '*', {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}],
				// Input: listen for blur on element
				[this.element, {
					blur: $.proxy(function(e){
						this._focused_from = e.target;
					}, this)
				}]
			);

			this._secondaryEvents = [
				[this.picker, {
					click: $.proxy(this.click, this)
				}],
				[$(window), {
					resize: $.proxy(this.place, this)
				}],
				[$(document), {
					'mousedown touchstart': $.proxy(function (e) {
						// Clicked outside the datepicker, hide it
						if (!(
							this.element.is(e.target) ||
							this.element.find(e.target).length ||
							this.picker.is(e.target) ||
							this.picker.find(e.target).length
						)) {
							this.hide();
						}
					}, this)
				}]
			];
		},
		_attachEvents: function(){
			this._detachEvents();
			this._applyEvents(this._events);
		},
		_detachEvents: function(){
			this._unapplyEvents(this._events);
		},
		_attachSecondaryEvents: function(){
			this._detachSecondaryEvents();
			this._applyEvents(this._secondaryEvents);
		},
		_detachSecondaryEvents: function(){
			this._unapplyEvents(this._secondaryEvents);
		},
		_trigger: function(event, altdate){
			var date = altdate || this.dates.get(-1),
				local_date = this._utc_to_local(date);

			this.element.trigger({
				type: event,
				date: local_date,
				dates: $.map(this.dates, this._utc_to_local),
				format: $.proxy(function(ix, format){
					if (arguments.length === 0){
						ix = this.dates.length - 1;
						format = this.o.format;
					}
					else if (typeof ix == 'string'){
						format = ix;
						ix = this.dates.length - 1;
					}
					format = format || this.o.format;
					var date = this.dates.get(ix);
					return DPGlobal.formatDate(date, format, this.o.language);
				}, this)
			});
		},

		show: function(e) {
			if (!this.isInline)
				this.picker.appendTo('body');
			this.picker.show();
			this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
			this.place();
			this._attachSecondaryEvents();
			this._trigger('show');
		},

		hide: function(){
			if(this.isInline) return;
			if (!this.picker.is(':visible')) return;
			this.focusDate = null;
			this.picker.hide().detach();
			this._detachSecondaryEvents();
			this.viewMode = this.o.startView;
			this.showMode();

			if (
				this.o.forceParse &&
				(
					this.isInput && this.element.val() ||
					this.hasInput && this.element.find('input').val()
				)
			)
				this.setValue();
			this._trigger('hide');
		},

		remove: function() {
			this.hide();
			this._detachEvents();
			this._detachSecondaryEvents();
			this.picker.remove();
			delete this.element.data().datepicker;
			if (!this.isInput) {
				delete this.element.data().date;
			}
		},

		_utc_to_local: function(utc){
			return utc && new Date(utc.getTime() + (utc.getTimezoneOffset()*60000));
		},
		_local_to_utc: function(local){
			return local && new Date(local.getTime() - (local.getTimezoneOffset()*60000));
		},
		_zero_time: function(local){
			return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
		},
		_zero_utc_time: function(utc){
			return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
		},

		getDates: function(){
			return $.map(this.dates, this._utc_to_local);
		},

		getUTCDates: function(){
			return $.map(this.dates, function(d){ return new Date(d); });
		},

		getDate: function() {
			return this._utc_to_local(this.getUTCDate());
		},

		getUTCDate: function() {
			return new Date(this.dates.get(-1));
		},

		setDates: function() {
			this.update.apply(this, arguments);
			this._trigger('changeDate');
			this.setValue();
		},

		setUTCDates: function() {
			this.update.apply(this, $.map(arguments, this._utc_to_local));
			this._trigger('changeDate');
			this.setValue();
		},

		setDate: alias('setDates'),
		setUTCDate: alias('setUTCDates'),

		setValue: function() {
			var formatted = this.getFormattedDate();
			if (!this.isInput) {
				if (this.component){
					this.element.find('input').val(formatted).change();
				}
			} else {
				this.element.val(formatted).change();
			}
		},

		getFormattedDate: function(format) {
			if (format === undefined)
				format = this.o.format;

			var lang = this.o.language;
			return $.map(this.dates, function(d){
				return DPGlobal.formatDate(d, format, lang);
			}).join(this.o.multidateSeparator);
		},

		setStartDate: function(startDate){
			this._process_options({startDate: startDate});
			this.update();
			this.updateNavArrows();
		},

		setEndDate: function(endDate){
			this._process_options({endDate: endDate});
			this.update();
			this.updateNavArrows();
		},

		setDaysOfWeekDisabled: function(daysOfWeekDisabled){
			this._process_options({daysOfWeekDisabled: daysOfWeekDisabled});
			this.update();
			this.updateNavArrows();
		},

		place: function(){
						if(this.isInline) return;
			var calendarWidth = this.picker.outerWidth(),
				calendarHeight = this.picker.outerHeight(),
				visualPadding = 10,
				windowWidth = $window.width(),
				windowHeight = $window.height(),
				scrollTop = $window.scrollTop();

			var zIndex = parseInt(this.element.parents().filter(function() {
							return $(this).css('z-index') != 'auto';
						}).first().css('z-index'))+10;
			var offset = this.component ? this.component.parent().offset() : this.element.offset();
			var height = this.component ? this.component.outerHeight(true) : this.element.outerHeight(false);
			var width = this.component ? this.component.outerWidth(true) : this.element.outerWidth(false);
			var left = offset.left,
				top = offset.top;

			this.picker.removeClass(
				'ai1ec-datepicker-orient-top ai1ec-datepicker-orient-bottom '+
				'ai1ec-datepicker-orient-right ai1ec-datepicker-orient-left'
			);

			if (this.o.orientation.x !== 'auto') {
				this.picker.addClass('ai1ec-datepicker-orient-' + this.o.orientation.x);
				if (this.o.orientation.x === 'right')
					left -= calendarWidth - width;
			}
			// auto x orientation is best-placement: if it crosses a window
			// edge, fudge it sideways
			else {
				// Default to left
				this.picker.addClass('ai1ec-datepicker-orient-left');
				if (offset.left < 0)
					left -= offset.left - visualPadding;
				else if (offset.left + calendarWidth > windowWidth)
					left = windowWidth - calendarWidth - visualPadding;
			}

			// auto y orientation is best-situation: top or bottom, no fudging,
			// decision based on which shows more of the calendar
			var yorient = this.o.orientation.y,
				top_overflow, bottom_overflow;
			if (yorient === 'auto') {
				top_overflow = -scrollTop + offset.top - calendarHeight;
				bottom_overflow = scrollTop + windowHeight - (offset.top + height + calendarHeight);
				if (Math.max(top_overflow, bottom_overflow) === bottom_overflow)
					yorient = 'top';
				else
					yorient = 'bottom';
			}
			this.picker.addClass('ai1ec-datepicker-orient-' + yorient);
			if (yorient === 'top')
				top += height;
			else
				top -= calendarHeight + parseInt(this.picker.css('padding-top'));

			this.picker.css({
				top: top,
				left: left,
				zIndex: zIndex
			});
		},

		_allow_update: true,
		update: function(){
			if (!this._allow_update) return;

			var oldDates = this.dates.copy(),
				dates = [],
				fromArgs = false;
			if(arguments.length) {
				$.each(arguments, $.proxy(function(i, date){
					if (date instanceof Date)
						date = this._local_to_utc(date);
					dates.push(date);
				}, this));
				fromArgs = true;
			} else {
				dates = this.isInput
						? this.element.val()
						: this.element.data('date') || this.element.find('input').val();
				if (dates && this.o.multidate)
					dates = dates.split(this.o.multidateSeparator);
				else
					dates = [dates];
				delete this.element.data().date;
			}

			dates = $.map(dates, $.proxy(function(date){
				return DPGlobal.parseDate(date, this.o.format, this.o.language);
			}, this));
			dates = $.grep(dates, $.proxy(function(date){
				return (
					date < this.o.startDate ||
					date > this.o.endDate ||
					!date
				);
			}, this), true);
			this.dates.replace(dates);

			if (this.dates.length)
				this.viewDate = new Date(this.dates.get(-1));
			else if (this.viewDate < this.o.startDate)
				this.viewDate = new Date(this.o.startDate);
			else if (this.viewDate > this.o.endDate)
				this.viewDate = new Date(this.o.endDate);

			if (fromArgs) {
				// setting date by clicking
				this.setValue();
			} else if (dates.length) {
				// setting date by typing
				if (String(oldDates) !== String(this.dates))
					this._trigger('changeDate');
			}
			if (!this.dates.length && oldDates.length)
				this._trigger('clearDate');

			this.fill();
		},

		fillDow: function(){
			var dowCnt = this.o.weekStart,
			html = '<tr>';
			if(this.o.calendarWeeks){
				var cell = '<th class="ai1ec-cw">&nbsp;</th>';
				html += cell;
				this.picker.find('.ai1ec-datepicker-days thead tr:first-child').prepend(cell);
			}
			while (dowCnt < this.o.weekStart + 7) {
				html += '<th class="ai1ec-dow">'+dates[this.o.language].daysMin[(dowCnt++)%7]+'</th>';
			}
			html += '</tr>';
			this.picker.find('.ai1ec-datepicker-days thead').append(html);
		},

		fillMonths: function(){
			var html = '',
			i = 0;
			while (i < 12) {
				html += '<span class="ai1ec-month">'+dates[this.o.language].monthsShort[i++]+'</span>';
			}
			this.picker.find('.ai1ec-datepicker-months td').html(html);
		},

		setRange: function(range){
			if (!range || !range.length)
				delete this.range;
			else
				this.range = $.map(range, function(d){ return d.valueOf(); });
			this.fill();
		},

		getClassNames: function(date){
			var cls = [],
				year = this.viewDate.getUTCFullYear(),
				month = this.viewDate.getUTCMonth(),
				today = new Date();
			if (date.getUTCFullYear() < year || (date.getUTCFullYear() == year && date.getUTCMonth() < month)) {
				cls.push('ai1ec-old');
			} else if (date.getUTCFullYear() > year || (date.getUTCFullYear() == year && date.getUTCMonth() > month)) {
				cls.push('ai1ec-new');
			}
			if (this.focusDate && date.valueOf() === this.focusDate.valueOf())
				cls.push('ai1ec-focused');
			// Compare internal UTC date with local today, not UTC today
			if (this.o.todayHighlight &&
				date.getUTCFullYear() == today.getFullYear() &&
				date.getUTCMonth() == today.getMonth() &&
				date.getUTCDate() == today.getDate()) {
				cls.push('ai1ec-today');
			}
			if (this.dates.contains(date) !== -1)
				cls.push('ai1ec-active');
			if (date.valueOf() < this.o.startDate || date.valueOf() > this.o.endDate ||
				$.inArray(date.getUTCDay(), this.o.daysOfWeekDisabled) !== -1) {
				cls.push('ai1ec-disabled');
			}
			if (this.range){
				if (date > this.range[0] && date < this.range[this.range.length-1]){
					cls.push('ai1ec-range');
				}
				if ($.inArray(date.valueOf(), this.range) != -1){
					cls.push('ai1ec-selected');
				}
			}
			return cls;
		},

		fill: function() {
			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth(),
				startYear = this.o.startDate !== -Infinity ? this.o.startDate.getUTCFullYear() : -Infinity,
				startMonth = this.o.startDate !== -Infinity ? this.o.startDate.getUTCMonth() : -Infinity,
				endYear = this.o.endDate !== Infinity ? this.o.endDate.getUTCFullYear() : Infinity,
				endMonth = this.o.endDate !== Infinity ? this.o.endDate.getUTCMonth() : Infinity,
				tooltip, currentYear;
			this.picker.find('.ai1ec-datepicker-days thead th.ai1ec-datepicker-switch')
						.text(dates[this.o.language].months[month]+' '+year);
			this.picker.find('tfoot th.ai1ec-today')
						.text(dates[this.o.language].today)
						.toggle(this.o.todayBtn !== false);
			this.picker.find('tfoot th.ai1ec-clear')
						.text(dates[this.o.language].clear)
						.toggle(this.o.clearBtn !== false);
			this.updateNavArrows();
			this.fillMonths();
			var prevMonth = UTCDate(year, month-1, 28),
				day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
			prevMonth.setUTCDate(day);
			prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.o.weekStart + 7)%7);
			var nextMonth = new Date(prevMonth);
			nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
			nextMonth = nextMonth.valueOf();
			var html = [];
			var clsName;
			while(prevMonth.valueOf() < nextMonth) {
				if (prevMonth.getUTCDay() == this.o.weekStart) {
					html.push('<tr>');
					if(this.o.calendarWeeks){
						// ISO 8601: First week contains first thursday.
						// ISO also states week starts on Monday, but we can be more abstract here.
						var
							// Start of current week: based on weekstart/current date
							ws = new Date(+prevMonth + (this.o.weekStart - prevMonth.getUTCDay() - 7) % 7 * 864e5),
							// Thursday of this week
							th = new Date(+ws + (7 + 4 - ws.getUTCDay()) % 7 * 864e5),
							// First Thursday of year, year from thursday
							yth = new Date(+(yth = UTCDate(th.getUTCFullYear(), 0, 1)) + (7 + 4 - yth.getUTCDay())%7*864e5),
							// Calendar week: ms between thursdays, div ms per day, div 7 days
							calWeek =  (th - yth) / 864e5 / 7 + 1;
						html.push('<td class="ai1ec-cw">'+ calWeek +'</td>');

					}
				}
				clsName = this.getClassNames(prevMonth);
				clsName.push('ai1ec-day');

				if (this.o.beforeShowDay !== $.noop){
					var before = this.o.beforeShowDay(this._utc_to_local(prevMonth));
					if (before === undefined)
						before = {};
					else if (typeof(before) === 'boolean')
						before = {enabled: before};
					else if (typeof(before) === 'string')
						before = {classes: before};
					if (before.enabled === false)
						clsName.push('ai1ec-disabled');
					if (before.classes)
						clsName = clsName.concat(before.classes.split(/\s+/));
					if (before.tooltip)
						tooltip = before.tooltip;
				}

				clsName = $.unique(clsName);
				html.push('<td class="'+clsName.join(' ')+'"' + (tooltip ? ' title="'+tooltip+'"' : '') + '>'+prevMonth.getUTCDate() + '</td>');
				if (prevMonth.getUTCDay() == this.o.weekEnd) {
					html.push('</tr>');
				}
				prevMonth.setUTCDate(prevMonth.getUTCDate()+1);
			}
			this.picker.find('.ai1ec-datepicker-days tbody').empty().append(html.join(''));

			var months = this.picker.find('.ai1ec-datepicker-months')
						.find('th:eq(1)')
							.text(year)
							.end()
						.find('span').removeClass('ai1ec-active');

			$.each(this.dates, function(i, d){
				if (d.getUTCFullYear() == year)
					months.eq(d.getUTCMonth()).addClass('ai1ec-active');
			});

			if (year < startYear || year > endYear) {
				months.addClass('ai1ec-disabled');
			}
			if (year == startYear) {
				months.slice(0, startMonth).addClass('ai1ec-disabled');
			}
			if (year == endYear) {
				months.slice(endMonth+1).addClass('ai1ec-disabled');
			}

			html = '';
			year = parseInt(year/10, 10) * 10;
			var yearCont = this.picker.find('.ai1ec-datepicker-years')
								.find('th:eq(1)')
									.text(year + '-' + (year + 9))
									.end()
								.find('td');
			year -= 1;
			var years = $.map(this.dates, function(d){ return d.getUTCFullYear(); }),
				classes;
			for (var i = -1; i < 11; i++) {
				classes = ['ai1ec-year'];
				if (i === -1)
					classes.push('ai1ec-old');
				else if (i === 10)
					classes.push('ai1ec-new');
				if ($.inArray(year, years) !== -1)
					classes.push('ai1ec-active');
				if (year < startYear || year > endYear)
					classes.push('ai1ec-disabled');
				html += '<span class="' + classes.join(' ') + '">'+year+'</span>';
				year += 1;
			}
			yearCont.html(html);
		},

		updateNavArrows: function() {
			if (!this._allow_update) return;

			var d = new Date(this.viewDate),
				year = d.getUTCFullYear(),
				month = d.getUTCMonth();
			switch (this.viewMode) {
				case 0:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear() && month <= this.o.startDate.getUTCMonth()) {
						this.picker.find('.ai1ec-prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.ai1ec-prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear() && month >= this.o.endDate.getUTCMonth()) {
						this.picker.find('.ai1ec-next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.ai1ec-next').css({visibility: 'visible'});
					}
					break;
				case 1:
				case 2:
					if (this.o.startDate !== -Infinity && year <= this.o.startDate.getUTCFullYear()) {
						this.picker.find('.ai1ec-prev').css({visibility: 'hidden'});
					} else {
						this.picker.find('.ai1ec-prev').css({visibility: 'visible'});
					}
					if (this.o.endDate !== Infinity && year >= this.o.endDate.getUTCFullYear()) {
						this.picker.find('.ai1ec-next').css({visibility: 'hidden'});
					} else {
						this.picker.find('.ai1ec-next').css({visibility: 'visible'});
					}
					break;
			}
		},

		click: function(e) {
			e.preventDefault();
			var target = $(e.target).closest('span, td, th'),
				year, month, day;
			if (target.length == 1) {
				switch(target[0].nodeName.toLowerCase()) {
					case 'th':
						switch(target[0].className) {
							case 'ai1ec-datepicker-switch':
								this.showMode(1);
								break;
							case 'ai1ec-prev':
							case 'ai1ec-next':
								var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'ai1ec-prev' ? -1 : 1);
								switch(this.viewMode){
									case 0:
										this.viewDate = this.moveMonth(this.viewDate, dir);
										this._trigger('changeMonth', this.viewDate);
										break;
									case 1:
									case 2:
										this.viewDate = this.moveYear(this.viewDate, dir);
										if (this.viewMode === 1)
											this._trigger('changeYear', this.viewDate);
										break;
								}
								this.fill();
								break;
							case 'ai1ec-today':
								var date = new Date();
								date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);

								this.showMode(-2);
								var which = this.o.todayBtn == 'linked' ? null : 'view';
								this._setDate(date, which);
								break;
							case 'ai1ec-clear':
								var element;
								if (this.isInput)
									element = this.element;
								else if (this.component)
									element = this.element.find('input');
								if (element)
									element.val("").change();
								this.update();
								this._trigger('changeDate');
								if (this.o.autoclose)
									this.hide();
								break;
						}
						break;
					case 'span':
						if (!target.is('.ai1ec-disabled')) {
							this.viewDate.setUTCDate(1);
							if (target.is('.ai1ec-month')) {
								day = 1;
								month = target.parent().find('span').index(target);
								year = this.viewDate.getUTCFullYear();
								this.viewDate.setUTCMonth(month);
								this._trigger('changeMonth', this.viewDate);
								if (this.o.minViewMode === 1) {
									this._setDate(UTCDate(year, month, day));
								}
							} else {
								day = 1;
								month = 0;
								year = parseInt(target.text(), 10)||0;
								this.viewDate.setUTCFullYear(year);
								this._trigger('changeYear', this.viewDate);
								if (this.o.minViewMode === 2) {
									this._setDate(UTCDate(year, month, day));
								}
							}
							this.showMode(-1);
							this.fill();
						}
						break;
					case 'td':
						if (target.is('.ai1ec-day') && !target.is('.ai1ec-disabled')){
							day = parseInt(target.text(), 10)||1;
							year = this.viewDate.getUTCFullYear();
							month = this.viewDate.getUTCMonth();
							if (target.is('.ai1ec-old')) {
								if (month === 0) {
									month = 11;
									year -= 1;
								} else {
									month -= 1;
								}
							} else if (target.is('.ai1ec-new')) {
								if (month == 11) {
									month = 0;
									year += 1;
								} else {
									month += 1;
								}
							}
							this._setDate(UTCDate(year, month, day));
						}
						break;
				}
			}
			if (this.picker.is(':visible') && this._focused_from){
				$(this._focused_from).focus();
			}
			delete this._focused_from;
		},

		_toggle_multidate: function( date ) {
			var ix = this.dates.contains(date);
			if (!date){
				this.dates.clear();
			}
			else if (ix !== -1){
				this.dates.remove(ix);
			}
			else{
				this.dates.push(date);
			}
			if (typeof this.o.multidate == 'number')
				while (this.dates.length > this.o.multidate)
					this.dates.remove(0);
		},

		_setDate: function(date, which){
			if (!which || which == 'date')
				this._toggle_multidate(date && new Date(date));
			if (!which || which  == 'view')
				this.viewDate = date && new Date(date);

			this.fill();
			this.setValue();
			this._trigger('changeDate');
			var element;
			if (this.isInput) {
				element = this.element;
			} else if (this.component){
				element = this.element.find('input');
			}
			if (element) {
				element.change();
			}
			if (this.o.autoclose && (!which || which == 'date')) {
				this.hide();
			}
		},

		moveMonth: function(date, dir){
			if (!date) return undefined;
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
			return date >= this.o.startDate && date <= this.o.endDate;
		},

		keydown: function(e){
			if (this.picker.is(':not(:visible)')){
				if (e.keyCode == 27) // allow escape to hide and re-show picker
					this.show();
				return;
			}
			var dateChanged = false,
				dir, newDate, newViewDate,
				focusDate = this.focusDate || this.viewDate;
			switch(e.keyCode){
				case 27: // escape
					if (this.focusDate){
						this.focusDate = null;
						this.viewDate = this.dates.get(-1) || this.viewDate;
						this.fill();
					}
					else
						this.hide();
					e.preventDefault();
					break;
				case 37: // left
				case 39: // right
					if (!this.o.keyboardNavigation) break;
					dir = e.keyCode == 37 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					} else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					} else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir);
					}
					if (this.dateWithinRange(newDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 38: // up
				case 40: // down
					if (!this.o.keyboardNavigation) break;
					dir = e.keyCode == 38 ? -1 : 1;
					if (e.ctrlKey){
						newDate = this.moveYear(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveYear(focusDate, dir);
						this._trigger('changeYear', this.viewDate);
					} else if (e.shiftKey){
						newDate = this.moveMonth(this.dates.get(-1) || UTCToday(), dir);
						newViewDate = this.moveMonth(focusDate, dir);
						this._trigger('changeMonth', this.viewDate);
					} else {
						newDate = new Date(this.dates.get(-1) || UTCToday());
						newDate.setUTCDate(newDate.getUTCDate() + dir * 7);
						newViewDate = new Date(focusDate);
						newViewDate.setUTCDate(focusDate.getUTCDate() + dir * 7);
					}
					if (this.dateWithinRange(newDate)){
						this.focusDate = this.viewDate = newViewDate;
						this.setValue();
						this.fill();
						e.preventDefault();
					}
					break;
				case 32: // spacebar
					// Spacebar is used in manually typing dates in some formats.
					// As such, its behavior should not be hijacked.
					break;
				case 13: // enter
					focusDate = this.focusDate || this.dates.get(-1) || this.viewDate;
					this._toggle_multidate(focusDate);
					dateChanged = true;
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.setValue();
					this.fill();
					if (this.picker.is(':visible')){
						e.preventDefault();
						if (this.o.autoclose)
							this.hide();
					}
					break;
				case 9: // tab
					this.focusDate = null;
					this.viewDate = this.dates.get(-1) || this.viewDate;
					this.fill();
					this.hide();
					break;
			}
			if (dateChanged){
				if (this.dates.length)
					this._trigger('changeDate');
				else
					this._trigger('clearDate');
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
				this.viewMode = Math.max(this.o.minViewMode, Math.min(2, this.viewMode + dir));
			}
			/*
				vitalets: fixing bug of very special conditions:
				jquery 1.7.1 + webkit + show inline datepicker in bootstrap popover.
				Method show() does not set display css correctly and datepicker is not shown.
				Changed to .css('display', 'block') solve the problem.
				See https://github.com/vitalets/x-editable/issues/37

				In jquery 1.7.2+ everything works fine.
			*/
			//this.picker.find('>div').hide().filter('.datepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
			this.picker.find('>div').hide().filter('.ai1ec-datepicker-'+DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
			this.updateNavArrows();
		}
	};

	var DateRangePicker = function(element, options){
		this.element = $(element);
		this.inputs = $.map(options.inputs, function(i){ return i.jquery ? i[0] : i; });
		delete options.inputs;

		$(this.inputs)
			.datepicker(options)
			.bind('changeDate', $.proxy(this.dateUpdated, this));

		this.pickers = $.map(this.inputs, function(i){ return $(i).data('datepicker'); });
		this.updateDates();
	};
	DateRangePicker.prototype = {
		updateDates: function(){
			this.dates = $.map(this.pickers, function(i){ return i.getUTCDate(); });
			this.updateRanges();
		},
		updateRanges: function(){
			var range = $.map(this.dates, function(d){ return d.valueOf(); });
			$.each(this.pickers, function(i, p){
				p.setRange(range);
			});
		},
		dateUpdated: function(e){
			// `this.updating` is a workaround for preventing infinite recursion
			// between `changeDate` triggering and `setUTCDate` calling.  Until
			// there is a better mechanism.
			if (this.updating)
				return;
			this.updating = true;

			var dp = $(e.target).data('datepicker'),
				new_date = dp.getUTCDate(),
				i = $.inArray(e.target, this.inputs),
				l = this.inputs.length;
			if (i == -1) return;

			$.each(this.pickers, function(i, p){
				if (!p.getUTCDate())
					p.setUTCDate(new_date);
			});

			if (new_date < this.dates[i]){
				// Date being moved earlier/left
				while (i>=0 && new_date < this.dates[i]){
					this.pickers[i--].setUTCDate(new_date);
				}
			}
			else if (new_date > this.dates[i]){
				// Date being moved later/right
				while (i<l && new_date > this.dates[i]){
					this.pickers[i++].setUTCDate(new_date);
				}
			}
			this.updateDates();

			delete this.updating;
		},
		remove: function(){
			$.map(this.pickers, function(p){ p.remove(); });
			delete this.element.data().datepicker;
		}
	};

	function opts_from_el(el, prefix){
		// Derive options from element data-attrs
		var data = $(el).data(),
			out = {}, inkey,
			replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])'),
			prefix = new RegExp('^' + prefix.toLowerCase());
		for (var key in data)
			if (prefix.test(key)){
				inkey = key.replace(replace, function(_,a){ return a.toLowerCase(); });
				out[inkey] = data[key];
			}
		return out;
	}

	function opts_from_locale(lang){
		// Derive options from locale plugins
		var out = {};
		// Check if "de-DE" style date is available, if not language should
		// fallback to 2 letter code eg "de"
		if (!dates[lang]) {
			lang = lang.split('-')[0];
			if (!dates[lang])
				return;
		}
		var d = dates[lang];
		$.each(locale_opts, function(i,k){
			if (k in d)
				out[k] = d[k];
		});
		return out;
	}

	var old = $.fn.datepicker;
	$.fn.datepicker = function ( option ) {
		var args = Array.apply(null, arguments);
		args.shift();
		var internal_return;
		this.each(function () {
			var $this = $(this),
				data = $this.data('datepicker'),
				options = typeof option == 'object' && option;
			if (!data) {
				var elopts = opts_from_el(this, 'date'),
					// Preliminary otions
					xopts = $.extend({}, defaults, elopts, options),
					locopts = opts_from_locale(xopts.language),
					// Options priority: js args, data-attrs, locales, defaults
					opts = $.extend({}, defaults, locopts, elopts, options);
				if ($this.is('.ai1ec-input-daterange') || opts.inputs){
					var ropts = {
						inputs: opts.inputs || $this.find('input').toArray()
					};
					$this.data('datepicker', (data = new DateRangePicker(this, $.extend(opts, ropts))));
				}
				else{
					$this.data('datepicker', (data = new Datepicker(this, opts)));
				}
			}
			if (typeof option == 'string' && typeof data[option] == 'function') {
				internal_return = data[option].apply(data, args);
				if (internal_return !== undefined)
					return false;
			}
		});
		if (internal_return !== undefined)
			return internal_return;
		else
			return this;
	};

	var defaults = $.fn.datepicker.defaults = {
		autoclose: false,
		beforeShowDay: $.noop,
		calendarWeeks: false,
		clearBtn: false,
		daysOfWeekDisabled: [],
		endDate: Infinity,
		forceParse: true,
		format: 'mm/dd/yyyy',
		keyboardNavigation: true,
		language: 'en',
		minViewMode: 0,
		multidate: false,
		multidateSeparator: ',',
		orientation: "auto",
		rtl: false,
		startDate: -Infinity,
		startView: 0,
		todayBtn: false,
		todayHighlight: false,
		weekStart: 0
	};
	var locale_opts = $.fn.datepicker.locale_opts = [
		'format',
		'rtl',
		'weekStart'
	];
	$.fn.datepicker.Constructor = Datepicker;
	var dates = $.fn.datepicker.dates = {
		en: {
			days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
			months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			today: "Today",
			clear: "Clear"
		}
	};

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
			return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
		},
		getDaysInMonth: function (year, month) {
			return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
		},
		validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
		nonpunctuation: /[^ -\/:-@\[\u3400-\u9fff-`{-~\t\n\r]+/g,
		parseFormat: function(format){
			// IE treats \0 as a string end in inputs (truncating the value),
			// so it's a bad format delimiter, anyway
			var separators = format.replace(this.validParts, '\0').split('\0'),
				parts = format.match(this.validParts);
			if (!separators || !separators.length || !parts || parts.length === 0){
				throw new Error("Invalid date format.");
			}
			return {separators: separators, parts: parts};
		},
		parseDate: function(date, format, language) {
			if (!date)
				return undefined;
			if (date instanceof Date) return date;
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)) {
				var part_re = /([\-+]\d+)([dmwy])/,
					parts = date.match(/([\-+]\d+)([dmwy])/g),
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
						if (isNaN(d))
							return d;
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
			date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
			var fparts = format.parts.slice();
			// Remove noop parts
			if (parts.length != fparts.length) {
				fparts = $(fparts).filter(function(i,p){
					return $.inArray(p, setters_order) !== -1;
				}).toArray();
			}
			// Process remainder
			if (parts.length == fparts.length) {
				for (var i=0, cnt = fparts.length; i < cnt; i++) {
					val = parseInt(parts[i], 10);
					part = fparts[i];
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
				for (var i=0, _date, s; i<setters_order.length; i++){
					s = setters_order[i];
					if (s in parsed && !isNaN(parsed[s])){
						_date = new Date(date);
						setters_map[s](_date, parsed[s]);
						if (!isNaN(_date))
							date = _date;
					}
				}
			}
			return date;
		},
		formatDate: function(date, format, language){
			if (!date)
				return '';
			if (typeof format === 'string')
				format = DPGlobal.parseFormat(format);
			var val = {
				d: date.getUTCDate(),
				D: dates[language].daysShort[date.getUTCDay()],
				DD: dates[language].days[date.getUTCDay()],
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
			for (var i=0, cnt = format.parts.length; i <= cnt; i++) {
				if (seps.length)
					date.push(seps.shift());
				date.push(val[format.parts[i]]);
			}
			return date.join('');
		},
		headTemplate: '<thead>'+
							'<tr>'+
// ==========================
// = Timely edit 17-03-2014 =
// ==========================
								'<th class="ai1ec-prev"><i class="ai1ec-fa ai1ec-fa-arrow-left"></i></th>'+
								'<th colspan="5" class="ai1ec-datepicker-switch"></th>'+
								'<th class="ai1ec-next"><i class="ai1ec-fa ai1ec-fa-arrow-right"></i></th>'+
// ===================
// = Timely edit end =
// ===================
							'</tr>'+
						'</thead>',
		contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
		footTemplate: '<tfoot><tr><th colspan="7" class="ai1ec-today"></th></tr><tr><th colspan="7" class="ai1ec-clear"></th></tr></tfoot>'
	};
	DPGlobal.template = '<div class="timely ai1ec-datepicker">'+
							'<div class="ai1ec-datepicker-days">'+
								'<table class=" ai1ec-table-condensed">'+
									DPGlobal.headTemplate+
									'<tbody></tbody>'+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="ai1ec-datepicker-months">'+
								'<table class="ai1ec-table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
							'<div class="ai1ec-datepicker-years">'+
								'<table class="ai1ec-table-condensed">'+
									DPGlobal.headTemplate+
									DPGlobal.contTemplate+
									DPGlobal.footTemplate+
								'</table>'+
							'</div>'+
						'</div>';

	$.fn.datepicker.DPGlobal = DPGlobal;


	/* DATEPICKER NO CONFLICT
	* =================== */

	$.fn.datepicker.noConflict = function(){
		$.fn.datepicker = old;
		return this;
	};


	/* DATEPICKER DATA-API
	* ================== */

	$(document).on(
		'focus.datepicker.data-api click.datepicker.data-api',
		'[data-provide="datepicker"]',
		function(e){
			var $this = $(this);
			if ($this.data('datepicker')) return;
			e.preventDefault();
			// component click requires us to explicitly show it
			$this.datepicker('show');
		}
	);
	$(function(){
		$('[data-provide="datepicker-inline"]').datepicker();
	});

// ==========================
// = Timely edit 10-01-2014 =
// ==========================
	// Load language files.
	for ( var i = 2, len = arguments.length; i < len; i++ ) {
		arguments[i].localize();
	}
// ===================
// = Timely edit end =
// ===================

} );

/* ========================================================================
 * Bootstrap: alert.js v3.0.3
 * http://getbootstrap.com/javascript/#alerts
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


timely.define('external_libs/bootstrap/alert', ["jquery_timely"], function( $ ) {  // jshint ;_;

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="ai1ec-alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.hasClass('ai1ec-alert') ? $this : $this.parent()
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('ai1ec-in')

    function removeElement() {
      $parent.trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('ai1ec-fade') ?
      $parent
        .one($.support.transition.end, removeElement)
        .emulateTransitionEnd(150) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  var old = $.fn.alert

  $.fn.alert = function (option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

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

/*global History: true */
timely.define('scripts/calendar/load_views',
	[
		"jquery_timely",
		"scripts/calendar/print",
		"scripts/calendar/agenda_view",
		"scripts/calendar/month_view",
		"libs/frontend_utils",
		"libs/utils",
		"ai1ec_calendar",
		"ai1ec_config",
		"scripts/common_scripts/frontend/common_frontend",
		"libs/select2_multiselect_helper",
		"external_libs/twig",
		"agenda",
		"oneday", // Also used for Week view.
		"month",
		"external_libs/jquery_history",
		"external_libs/jquery.tablescroller",
		"external_libs/jquery.scrollTo",
		"external_libs/bootstrap_datepicker",
		"external_libs/bootstrap/alert",
		"external_libs/jquery_cookie"
	],
	function(
		$,
		print_functions,
		agenda_view,
		month_view,
		frontend_utils,
		utils,
		ai1ec_calendar,
		ai1ec_config,
		common_frontend,
		select2_multiselect_helper,
		twig,
		agenda,
		oneday,
		month
	) {

	 // jshint ;_;
	$.cookie.json = true;
	var save_filter_view_cookie = 'ai1ec_saved_filter';
	// the initial value is determined by the visibility of the save view button
	var are_filters_set = ! $( '#save_filtered_views' ).hasClass( 'ai1ec-hide' );

	// Register twigjs templates.
	if ( ! timely['renderer_map'] ) {
		timely['renderer_map'] = {};
	}
	$.extend( timely['renderer_map'],  {
		agenda : agenda,
		oneday : oneday,
		week   : oneday,
		month  : month
	} );

	/**
	 * function initialize_view
	 *
	 * General initialization function to execute whenever any view is loaded
	 * (this is also called at the end of load_view()).
	 */
	var initialize_view = function( $calendar ) {

		// Get the dropdown menu link of the active view.
		var $selected_view = $calendar
			.find( '#ai1ec-view-dropdown .ai1ec-dropdown-menu .ai1ec-active a' );

		var hours =
			ai1ec_config.week_view_ends_at - ai1ec_config.week_view_starts_at;
		var height = hours * 60;
		// Make week view table limitable.
		$calendar.find( 'table.ai1ec-week-view-original' ).tableScroll( {
			height: height,
			containerClass: 'ai1ec-week-view ai1ec-popover-boundary',
			scroll : false
		} );
		$calendar.find( 'table.ai1ec-oneday-view-original' ).tableScroll( {
			height: height,
			containerClass: 'ai1ec-oneday-view ai1ec-popover-boundary',
			scroll : false
		} );

		if( $calendar.find( '.ai1ec-week-view' ).length
			|| $calendar.find( '.ai1ec-oneday-view' ).length
		) {
			// If no active event, then in week view, scroll down to 6am.
			$calendar.find(
				'.ai1ec-oneday-view .tablescroll_wrapper, ' +
				'.ai1ec-week-view .tablescroll_wrapper'
			).scrollTo(
				$calendar.find( '.ai1ec-hour-marker:eq('
					+ ai1ec_config.week_view_starts_at + ')'
				)
			);
			$calendar.find( '.ai1ec-hour-marker:eq('
				+ ai1ec_config.week_view_starts_at + ')'
			).addClass( 'ai1ec-first-visible' );
		}

		// If in month view, extend multiday events.
		if ( $calendar.find( '.ai1ec-month-view .ai1ec-multiday' ).length ) {
			month_view.extend_multiday_events( $calendar );
		}

		// Execute any registered hooks from extensions.
		$calendar
			.find( '.ai1ec-calendar-view-container' )
				.data( 'ai1ec-inited', true )
				.trigger( 'initialize_view.ai1ec' );

		// Trigger Affix event.
		$calendar
			.find( '.ai1ec-calendar-toolbar' )
				.trigger( 'ai1ec-affix.reinit' );
	};

	/**
	 * Do any cleanup required before currently displayed view is replaced with
	 * a newly retrieved view.
	 */
	var destroy_view = function( $calendar ) {
		// Execute any registered hooks from extensions.
		$calendar
			.find( '.ai1ec-calendar-view-container' )
				.trigger( 'destroy_view.ai1ec' );

		// Destroy any datepicker before loading new view.
		var dp = $calendar.find( '.ai1ec-minical-trigger' ).data( 'datepicker' );
		if ( typeof dp !== 'undefined' ) {
			dp.picker.remove();
			// Detach event handler.
			$( document ).off( 'changeDate', '.ai1ec-minical-trigger' );
		}
		// Destroy any visible tooltips or popovers.
		$calendar
			.find( '.ai1ec-tooltip.ai1ec-in, .ai1ec-popup' )
				.remove();

		// Destroy toolbar if affixed.
		$calendar
			.find( '.ai1ec-calendar-toolbar .ai1ec-btn-toolbar' )
				.remove();
	};

	var get_cal_state = function() {
		// Otherwise we need to get the state from the dropdowns.
		var cat_ids = [], tag_ids = [], auth_ids = [], action;
		$( '.ai1ec-category-filter .ai1ec-dropdown-menu .ai1ec-active' )
			.each( function() {
				cat_ids.push( $( this ).data( 'term' ) );
			} );
		$( '.ai1ec-tag-filter .ai1ec-dropdown-menu .ai1ec-active' )
			.each( function() {
				tag_ids.push( $( this ).data( 'term' ) );
			} );
		$( '.ai1ec-author-filter .ai1ec-dropdown-menu .ai1ec-active' )
			.each( function() {
				auth_ids.push( $( this ).data( 'term' ) );
			} );
		var cal_state = {};
		cal_state.cat_ids  = cat_ids;
		cal_state.tag_ids  = tag_ids;
		cal_state.auth_ids = auth_ids;
		action = $( '.ai1ec-views-dropdown .ai1ec-dropdown-menu .ai1ec-active' )
			.data( 'action' );
		cal_state.action = action;
		return cal_state;
	};

	/**
	 * Save the current url in a cookie so that the user is redirected here
	 * When he visit the calendar home page
	 *
	 */
	var save_current_filter = function() {
		var state = History.getState();
		var cookie = $.cookie( save_filter_view_cookie );
		// If the cookie is not present, create it.
		if ( null === cookie || undefined === cookie ) {
			cookie = {};
		}
		var cal_state = get_cal_state();
		// If we are on the calendar page, we just save the URL.
		if ( ai1ec_config.is_calendar_page ) {
			cookie['calendar_page'] = cal_state;
		} else {

			cookie[state.url] = cal_state;
		}
		$.cookie( save_filter_view_cookie, cookie, { path: '/', expires: 365 } );
		$( '#save_filtered_views' )
			.addClass( 'ai1ec-active' )
			.attr( 'data-original-title', ai1ec_config.clear_saved_filter_text );
		var $alert =
			utils.make_alert( ai1ec_config.save_filter_text_ok, 'success' );
		$( '#ai1ec-calendar' ).prepend( $alert );
	};

	/**
	 * Remove the cookie with the saved url.
	 *
	 * @param {object} e jQuery event object
	 */
	var remove_current_filter = function( e ) {
		e.stopImmediatePropagation();
		var cookie = $.cookie( save_filter_view_cookie );
		if( ai1ec_config.is_calendar_page ) {
			delete cookie['calendar_page'];
		} else {
			var state = History.getState();
			delete cookie[state.url];
		}
		$.cookie( save_filter_view_cookie, cookie, { path : '/', expires : 365 } );
		$( '#save_filtered_views' )
			.removeClass( 'ai1ec-active' )
			.attr( 'data-original-title', ai1ec_config.reset_saved_filter_text );
		// We keep the variable that tells us if some filters are set updated on
		// every call. So if no filters are applied, just hide the button.
		if( ! are_filters_set ) {
			$( '#save_filtered_views' ).addClass( 'ai1ec-hide' );
		}
		var $alert =
			utils.make_alert( ai1ec_config.remove_filter_text_ok, 'success' );
		$( '#ai1ec-calendar' ).prepend( $alert );
	};

	/**
	 * Load a calendar view represented by the given hash value.
	 *
	 * @param {string} hash The hash string requesting a calendar view
	 */
	var load_view = function( $calendar, hash, type ) {
		// Reveal loader behind view
		$calendar
			.find( '.ai1ec-calendar-view-loading' )
				.fadeIn( 'fast' )
				.end()
			.find( '.ai1ec-calendar-view' ).fadeTo( 'fast', 0.3,
				// After loader is visible, fetch new content
				function() {
					var query = {
							request_type: type,
							ai1ec_doing_ajax : true
					};
					// remove alerts if present
					$( '#ai1ec-container > .ai1ec-alert' ).remove();
					// Fetch AJAX result
					var request = $.ajax( {
						url : hash,
						dataType: type,
						data: query,
						method : 'get'
					} )
					request.done( function( data ) {// console.log($.parseJSON( data.html ))
						// trigger the event so that other addons can respond
						$( document ).trigger( 'calendar_view_loaded.ai1ec', $calendar );

						// Do required cleanup of existing view.
						destroy_view( $calendar );

						// Views Dropdown
						if( typeof data.views_dropdown === 'string' ) {
							$calendar
								.find( '.ai1ec-views-dropdown' )
									.replaceWith( data.views_dropdown );
						}
						// Update categories
						if( typeof data.categories === 'string' ) {
							$calendar
								.find( '.ai1ec-category-filter' )
									.replaceWith( data.categories );
						}
						// Update authors
						if( typeof data.authors === 'string' ) {
							$calendar
								.find( '.ai1ec-author-filter' )
									.replaceWith( data.authors );
						}
						// Tags
						if( typeof data.tags === 'string' ) {
							$calendar
								.find( '.ai1ec-tag-filter' )
									.replaceWith( data.tags );
						}
						// Custom filters
						if( typeof data.custom_filters === 'string' ) {
							$parent = $calendar
								.find( 'li.ai1ec-custom-filter' ).parent();
							$calendar
								.find( 'li.ai1ec-custom-filter' )
								.remove();
							$parent.append( data.custom_filters );
						}
						// And the "Subscribe buttons"
						if( typeof data.subscribe_buttons === 'string' ) {
							$calendar
								.find( '.ai1ec-subscribe-container' )
								  .empty()
									.append( data.subscribe_buttons );
						}
						// And the "Save filtered view"
						if( typeof data.save_view_btngroup === 'string' ) {
							$calendar
								.find( '#save_filtered_views' )
									.closest( '.ai1ec-btn-group' )
										.replaceWith( data.save_view_btngroup );
						}
						are_filters_set = data.are_filters_set;

						// Render template or just replace if already rendered.
						var renderer;

						if ( data.is_json ) {
							var view_type =  data.html.type;
							if ( timely['renderer_map'][view_type] ) {
								renderer = timely['renderer_map'][view_type];
							} else {
								// No view found.
								// Try to reload in HTML.
								load_view( $calendar, hash.replace( /\~json/, '~html' ), type );
								return;
							}
						}
						$calendar.find( '.ai1ec-calendar-view' )
							.html(
								renderer
								? renderer.render( data.html )
								: $( data.html )
									.find( '.ai1ec-calendar-view' ).length
										? $( data.html ).find( '.ai1ec-calendar-view' ).html()
										: data.html
							);
						// Do any general view initialization after loading
						initialize_view( $calendar );
					} );
					request.fail( function( jqXHR, textStatus, errorThrown ) {
						var message = ai1ec_config.load_views_error;
						message = message.replace( '%STATUS%', jqXHR.status );
						message = message.replace( '%ERROR%', errorThrown );
						var alert = utils.make_alert( message, 'error', true );
						$( '#ai1ec-container' ).prepend( alert );
						destroy_view( $calendar );
						initialize_view( $calendar );
					} );
					request.always( function() {
						// Hide loader
						$calendar.find( '.ai1ec-calendar-view-loading' ).fadeOut( 'fast' );
						$calendar.find( '.ai1ec-calendar-view' ).fadeTo( 'fast', 1.0 );
					} );
				}
			);
	};

	var previously_pushed_state = false;
	// When the state changes, load the corresponding view
	var handle_state_change = function( e ) {
		var
			state = History.getState(),
			$calendar = $( '.ai1ec-calendar:first' );

		if( state.data.ai1ec !== undefined && true === state.data.ai1ec ||
				true === previously_pushed_state ) {
			// set this to true to detect back/forward navigation.
			// this should not interfere with other plugins.
			previously_pushed_state = true;
			load_view( $calendar, state.url, 'json' );
		}
	};

	/**
	 * Load the correct view according to the datatypet
	 *
	 */
	var load_view_according_to_datatype = function( $calendar, type, url ) {
		if( type === 'json' ) {
			var data = {
				ai1ec : true
			};
			History.pushState( data, document.title, decodeURI( url ) );
		} else {
			load_view( $calendar, url, 'jsonp' );
		}
	};

	// Handle loading the correct view when clicking on a link
	var handle_click_on_link_to_load_view = function( e ) {
		var
			$el = $( this )
			$calendar = $el.closest( '.ai1ec-calendar' );

		e.preventDefault();

		load_view_according_to_datatype(
			$calendar,
			$el.data( 'type' ), $el.attr( 'href' )
		);
	};

	/**
	 * Click of minical trigger button. If not initialized, initialize datepicker.
	 * Then show datepicker.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_minical_trigger = function( e ) {
		var
			$el = $( this );

		e.preventDefault();

		if ( typeof $el.data( 'datepicker' ) === 'undefined' ) {
			// Initialize this view's minical datepicker.
			$el.datepicker( {
				todayBtn: 'linked',
				todayHighlight: true,
				language: $el.data('lang')
			} );

			// Extend Datepicker behaviour without modifying the plugin.
			var dp = $el.data( 'datepicker' );
			// Flag datepicker as right-aligned if in a right-aligned component.
			if ( $el.closest( '.ai1ec-pull-right' ).length > 0 ) {
				dp.picker.addClass( 'ai1ec-right-aligned' );
				// Replace the place() method so that it is right-aligned to trigger.
				var place_orig = dp.place;
				dp.place = function() {
					place_orig.call( this );
					var $el = this.component ? this.component : this.element;
					var offset = $el.offset();
					this.picker.css( {
						left: 'auto',
						right: $( document ).width() - offset.left - $el.outerWidth()
					} );
				};
			}

			// Attach event handlers.
			$( document ).one( 'changeDate', '.ai1ec-minical-trigger',
				handle_minical_change_date
			);
		}

		$el.datepicker( 'show' );
	};

	/**
	 * Handle loading the correct view when selecting date from the datepicker.
	 * Destroy datepicker first.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_minical_change_date = function( e ) {
		var url,
		    $el = $( this ),
		    $calendar = $el.closest( '.ai1ec-calendar' ),
		    date;

		$el.datepicker( 'hide' );

		// Get URL template.
		url = $el.data( 'href' );
		// Fetch date provided by datepicker event object's format() function.
		date = e.format();
		// Replace '/' in date with '-' to be URL-friendly.
		date = date.replace( /\//g, '-' );
		// Insert date into URL template.
		url = url.replace( '__DATE__', date );
		// Load the new URL using method specified by type data-attribute.
		load_view_according_to_datatype( $calendar, $el.data( 'type' ), url );
	};

	/**
	 * Load the correct view from a select2 filter.
	 *
	 */
	var load_view_from_select2_filter = function( e ) {
		var new_state;
		if( typeof e.added !== 'undefined' ) {
			new_state = $( e.added.element ).data( 'href' );
		} else {
			new_state = $(
				'option[value=' + e.removed.id + ']',
				e.target
			).data( 'href' );
		}
		data = {
			ai1ec : true
		};
		History.pushState( data, null, new_state );
	};

	// Handle clearing filter
	var clear_filters = function() {
		var $calendar = $( this ).closest( '.ai1ec-calendar' );
		load_view_according_to_datatype(
				$calendar,
				$( this ).data( 'type' ),
				$( this ).data( 'href' )
		);
	};

	return {
		initialize_view                    : initialize_view,
		handle_click_on_link_to_load_view  : handle_click_on_link_to_load_view,
		handle_minical_trigger             : handle_minical_trigger,
		handle_minical_change_date         : handle_minical_change_date,
		clear_filters                      : clear_filters,
		handle_state_change                : handle_state_change,
		load_view                          : load_view,
		save_current_filter                : save_current_filter,
		remove_current_filter              : remove_current_filter,
		load_view_from_select2_filter      : load_view_from_select2_filter,
		load_view_according_to_datatype    : load_view_according_to_datatype
	};
});

timely.define('scripts/calendar/calendar-affix',
	[
		'jquery_timely',
		'ai1ec_config'
	],
	function( $, ai1ec_config ) {
	 // jshint ;_;

	/**
	 * Affixed toolbar.
	 * Uses Bootstrap Affix plugin.
	 * @param  {object} $calendar jQuery object
	 */
	var initialize_affixed_toolbar = function( $calendar ) {
		var
			$toolbar = $calendar.find( '.ai1ec-calendar-toolbar' );

		// No use without a toolbar.
		if ( ! $toolbar.length ) {
			return false;
		}
		var 
			// Calendar navigation buttons
			$buttons = $calendar.find( '.ai1ec-views-dropdown' )
				.closest( 'div.ai1ec-clearfix' )
					.css( 'clear', 'both' ),
			$toggle = $toolbar.find( '.ai1ec-dropdown-toggle' ),
			$view = $calendar.find( '#ai1ec-calendar-view' ),
			$wpadminbar = $( '#wpadminbar' ),
			initial_toolbar_offset = $toolbar.offset().top,
			offset = 0,
			resize_timer = null,
			// Returns current Bootsrap window mode
			get_window_mode = function() {
				return $( '#ai1ec-bs-modes div:visible:first' ).text();
			},
			// Create elements to monitor Bootstrap's responsive breakouts.
			create_bs_modes = function() {
				var
					modes = [ 'xs', 'sm', 'md', 'lg' ],
					$modes = $( '<div id="ai1ec-bs-modes"></div>' );

				for ( var i in modes ) {
					$( '<div class="ai1ec-device-'
						+ modes[ i ] +' ai1ec-visible-' + modes[ i ] + '">'
						+ modes[ i ] +'</div>' )
						.appendTo( $modes );
				}
				$modes.appendTo( 'body' );
			},
			// Returns offset value from user setting depending on the window width.
			settings_offset = function() {
				return parseInt(
					ai1ec_config[ 'affix_vertical_offset_' +  get_window_mode() ] || 0
				);
			},
			// Hide dropdown captions to save some space.
			hide_toggle_text = function() {
				$toggle.each( function() {
					$( this )
						.contents()
							.eq( -3 )
								.wrap( '<div class="ai1ec-hidden" />' );
				});
			},
			// Remove hidden Div and show the caption.
			show_hidden_toggle_text = function() {
				$toggle
					.find( '.ai1ec-hidden' )
						.contents()
							.unwrap();
			},
			// That is only important when admin bar is not fixed.
			set_toolbar_offset = function() {
				var offset = 0;
				if ( 'fixed' === $wpadminbar.css( 'position' ) ) {
					offset = $wpadminbar.height();
				}
				$toolbar.css( 'top', offset + settings_offset() + 'px' );
			},
			// Returns offset for the BS affix plugin.
			get_offset = function() {
				return offset;
			},
			// Recalculate offset for the BS affix plugin.
			update_offset = function() {
				offset = initial_toolbar_offset
					- ( 'fixed' === $wpadminbar.css( 'position' ) ? $wpadminbar.height() : 0 )
					- settings_offset();
			},
			// If we get more height then it was before - try to minimize the dropdowns.
			// If it doesn't help - keep them as before.
			resize_dropdowns = function() {
				// If Toolbar can't fit all the elements, hide the dropdown's captions.
				if ( $toolbar.height()  > $toolbar.data( 'original_height' ) ) {
					hide_toggle_text();
					// If it doesn't help show them.
					if ( $toolbar.height() > $toolbar.data( 'original_height' ) ) {
						show_hidden_toggle_text();
					}
				} else {
					show_hidden_toggle_text();
				}
			},
			// This method is needed when content is updated.
			reinitialize = function() {
				// We probably have new buttons here, so find them again.
				$calendar
					.find( '.ai1ec-affix .ai1ec-views-dropdown' )
						.closest( 'div.ai1ec-clearfix' )
							.remove();
				$buttons = $calendar.find( '.ai1ec-views-dropdown' )
					.closest( 'div.ai1ec-clearfix' );
				$toggle = $toolbar.find( '.ai1ec-dropdown-toggle' );
				$toolbar
					.trigger( 'ai1ec-affix-top.bs.affix' )
					.find( '.ai1ec-views-dropdown' )
						.closest( 'div.ai1ec-clearfix' )
							.hide()
							.end()
						.end()
					.data( {
						// Toolbar's original height might have changed.
						'original_height': $toolbar.height()
					} )
					.find( '.ai1ec-views-dropdown' )
						.closest( 'div.ai1ec-clearfix' )
							.show()
							.end()
						.end()
					.filter( '.ai1ec-affix' )
						.trigger( 'ai1ec-affix.bs.affix' );
			},
			// Process toolbar on resize.
			on_resize = function() {
				if ( $toolbar.hasClass( 'ai1ec-affix' ) ) {
					$toolbar.addClass( 'ai1ec-was-affixed' );
				}
				update_offset();
				$toolbar
					.removeClass( 'ai1ec-affix' )
					.css( 'width', $calendar.width() )
					.find( '.ai1ec-btn-toolbar' )
						.hide()
						.end()
					.data( {
						// Let's remember the original height.
						'original_height': $toolbar.height()
					} );

				set_toolbar_offset();
				initial_toolbar_offset = $toolbar.offset().top;
				$toolbar
					.filter( '.ai1ec-was-affixed' )
						.addClass( 'ai1ec-affix' )
						.removeClass( 'ai1ec-was-affixed' )
						.find( '.ai1ec-btn-toolbar' )
							.show();

				resize_timer = null;
			};

		// Detect Bootstrap modes.
		create_bs_modes();
		update_offset();

		$toolbar
			.data( {
				// Let's remember the original height.
				'original_height': $toolbar.height()
			} )
			.css( 'width', $calendar.width() )
			.affix( {
				offset: {
					top: get_offset,
					bottom: 0
				}
			} )
			// Toolbar is affixed. Event is thrown by Bootstrap.
			.on( 'ai1ec-affix.bs.affix', function() {
				// Offset before moving the buttons.
				var offset = $view.offset().top;
				$buttons
					.hide()
					.appendTo( $toolbar )
					.show() // A trick to get real height while fade-in is still in process.
					.css( 'opacity', 0 )
					.animate( {
						opacity: 1
					}, 400 );
				resize_dropdowns();
				set_toolbar_offset();
				// Set the offset to compensate the space occupied by toolbar.
				$view
					.css( 'margin-top' , $toolbar.outerHeight( true )
						+ parseInt( $toolbar.css( 'margin-bottom' ) ) + 'px'
					);
			} )
			// Toolbar is not affixed. Event is thrown by Bootstrap.
			.on( 'ai1ec-affix-top.bs.affix', function() {
				$buttons.hide();
				$view.prepend( $buttons );
				$buttons
					.show()
					.css( 'opacity', 0 )
					.animate( {
						opacity: 1
					}, 400 );

				show_hidden_toggle_text();
				set_toolbar_offset();
				$view.css( 'margin-top' , 0 );
				$toolbar.data( 'original_height',  $toolbar.height() );
			} )
			// This event fires when a new content was loaded.
			.on( 'ai1ec-affix.reinit', reinitialize )
			.filter( '.ai1ec-affix' )
				.trigger( 'ai1ec-affix.bs.affix' );

		// Recalc. width and offset on resize.
		// Timer is used to reduce calculations.
		$( window ).on( 'resize.affix', function() {
			clearTimeout( resize_timer )
			resize_timer = setTimeout( on_resize , 100 );
		} );

		return $calendar;
	};

	return {
		initialize_affixed_toolbar: initialize_affixed_toolbar
	};
} );

/* ========================================================================
 * Bootstrap: transition.js v3.0.3
 * http://getbootstrap.com/javascript/#transitions
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


timely.define('external_libs/bootstrap/transition', ["jquery_timely"], function( $ ) {  // jshint ;_;

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd'
    , 'MozTransition'    : 'transitionend'
    , 'OTransition'      : 'oTransitionEnd otransitionend'
    , 'transition'       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false, $el = this
    $(this).one($.support.transition.end, function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()
  })

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

timely.define('scripts/calendar',
	[
		"jquery_timely",
		"domReady",
		"scripts/calendar/load_views",
		"scripts/calendar/print",
		"scripts/calendar/agenda_view",
		"scripts/calendar/month_view",
		"scripts/calendar/calendar-affix",
		"ai1ec_calendar",
		"ai1ec_config",
		"scripts/common_scripts/frontend/common_frontend",
		"libs/utils",
		"libs/select2_multiselect_helper",
		"external_libs/bootstrap/transition",
		"external_libs/bootstrap/modal",
		"external_libs/jquery.scrollTo",
		'external_libs/jquery_cookie',
	],
	function( $, domReady, load_views, print, agenda_view,
		month_view, affix, ai1ec_calendar, ai1ec_config, common_frontend,
		AI1EC_UTILS, select2_multiselect_helper ) {
	 // jshint ;_;

	/**
	 * Moves calendar into CSS selector defined by advanced settings.
	 */
	var css_selector_replacement = function() {
		if( ai1ec_calendar.selector !== undefined && ai1ec_calendar.selector !== '' &&
			$( ai1ec_calendar.selector ).length === 1 ) {
			// Try to find an <h#> element containing the title
			var $title = $( ":header:contains(" + ai1ec_calendar.title + "):first" );
			// If none found, create one
			if( ! $title.length ) {
				$title = $( '<h1 class="page-title"></h1>' );
				// Do it this way to automatically generate HTML entities
				$title.text( ai1ec_calendar.title );
			}
			var $calendar = $( '.ai1ec-main-container:first' )
				.detach()
				.before( $title );

			$( ai1ec_calendar.selector )
				.empty()
				.append( $calendar )
				.hide()
				.css( 'visibility', 'visible' )
				.fadeIn( 'fast' );
		}
	};

	/**
	 * Event handler for multiday events. When being hovered, add hover class
	 * to its clones.
	 */
	var handle_multiday_enter = function() {
		var
			id = $( this ).data( 'instanceId' ),
			$calendar = $( this ).closest( '.ai1ec-calendar' );

		$calendar.find( '.ai1ec-event-instance-id-' + id ).addClass( 'ai1ec-hover' );
	};

	/**
	 * Event handler for multiday events. When leaving hover, remove hover class
	 * from its clones.
	 */
	var handle_multiday_leave = function() {
		var
			id = $( this ).data( 'instanceId' ),
			$calendar = $( this ).closest( '.ai1ec-calendar' );

		$calendar
			.find( '.ai1ec-event-instance-id-' + id )
				.removeClass( 'ai1ec-hover' );
	};

	/**
	 * Event handler for events in week/day view. Issue a delayed raising effect
	 * on this event and all its multiday clones.
	 */
	var handle_raise_enter = function() {
		var
			$this = $( this ),
			$calendar = $this.closest( '.ai1ec-calendar' ),
			id = $this.data( 'instanceId' );

		$this.delay( 500 ).queue( function() {
			$calendar
				.find( '.ai1ec-event-instance-id-' + id )
					.addClass( 'ai1ec-raised' );
		} );
	};

	/**
	 * Event handler for events in week/day view. Cancel raising effect on this
	 * event and all its multiday clones.
	 */
	var handle_raise_leave = function( e ) {
		var
			$this = $( this ),
			$calendar = $this.closest( '.ai1ec-calendar' ),
			id = $this.data( 'instanceId' ),
			$target = $( e.toElement || e.relatedTarget ),
			$instance_el = $calendar.find( '.ai1ec-event-instance-id-' + id );

		// Don't cancel the effect if moving onto a clone of the same instance.
		if (
			$target.is( $instance_el ) ||
			$target.parent().is( $instance_el )
		) {
			return;
		}
		$calendar.find( '.ai1ec-event-instance-id-' + id )
			.clearQueue()
			.removeClass( 'ai1ec-raised' );
	};

	/**
	 * General calendar page initialization.
	 */
	var init = function() {
		// Do the replacement of the calendar and create title if not present
		css_selector_replacement();
	};


	/**
	 * Attach event handlers for calendar page.
	 */
	var attach_event_handlers = function() {
		// ======================================
		// = Month/week/day view multiday hover =
		// ======================================
		$( document ).on(
			{
				mouseenter: handle_multiday_enter,
				mouseleave: handle_multiday_leave
			},
			'.ai1ec-event-container.ai1ec-multiday'
		);

		// ====================================
		// = Week/day view hover-raise effect =
		// ====================================
		$( document ).on(
			{
				mouseenter: handle_raise_enter,
				mouseleave: handle_raise_leave
			},
			'.ai1ec-oneday-view .ai1ec-oneday .ai1ec-event-container, ' +
				'.ai1ec-week-view .ai1ec-week .ai1ec-event-container'
		 );

		// ===============
		// = Agenda view =
		// ===============
		// Register click handlers for Agenda View event title
		$( document ).on( 'click',
			'.ai1ec-agenda-view .ai1ec-event-header',
			 agenda_view.toggle_event
		);

		// Register click handlers for expand/collapse all buttons
		$( document ).on( 'click',
			'#ai1ec-agenda-expand-all',
			agenda_view.expand_all
		);
		$( document ).on( 'click',
			'#ai1ec-agenda-collapse-all',
			agenda_view.collapse_all
		);

		// =============
		// = All views =
		// =============

		// Register navigation click handlers
		$( document ).on( 'click',      'a.ai1ec-load-view',
			load_views.handle_click_on_link_to_load_view
		);

		// Register minical datepicker events.
		$( document ).on( 'click',      '.ai1ec-minical-trigger',
			load_views.handle_minical_trigger );

		// Handle clearing filters.
		$( document ).on( 'click',      '.ai1ec-clear-filter',
			load_views.clear_filters
		);

		// Handle click on print button.
		$( document ).on( 'click',      '#ai1ec-print-button',
			print.handle_click_on_print_button
		);

		// Handle click on reveal full day button.
		$( document ).on( 'click',      '.ai1ec-reveal-full-day button',
			function() {
				var $calendar = $( this ).closest( '.ai1ec-calendar' );
				// Hide the button (no longer serves a purpose).
				$( this ).fadeOut();
				var $actual_table = $calendar.find(
					'.ai1ec-oneday-view-original, .ai1ec-week-view-original'
				);
				// Scroll window down the same amount that the upper portion of the
				// table is being revealed.
				var vertical_offset =
					$calendar.find( '.tablescroll_wrapper' ).offset().top -
					$actual_table.offset().top;
				$( window ).scrollTo( '+=' + vertical_offset + 'px', 400 );
				// At the same time, expand height to reveal 1 full day (24 hours).
				var height = 24 * 60 + 2;
				$calendar.find( '.tablescroll_wrapper' )
					.scrollTo( '-=' + vertical_offset + 'px', 400 )
					.animate( { height: height + 'px' } );
			}
		);

		// Bind to statechange event.
		History.Adapter.bind( window,   'statechange',
			load_views.handle_state_change
		);

		$( document ).on( 'click',      '#ai1ec-calendar-view .ai1ec-load-event',
			function( e ) {
				$.cookie.raw = false;
				$.cookie(
					'ai1ec_calendar_url',
					document.URL,
					{
						path: ai1ec_config.cookie_path
					}
				);
			}
		);
	};

	var initialize_select2 = function() {
		select2_multiselect_helper.init( $( '.ai1ec-select2-filters' ) );
		$( document ).on(
			'change',
			'.ai1ec-select2-multiselect-selector',
			load_views.load_view_from_select2_filter
		);
	};

	domReady( function() {
		var $calendars      = $( '.ai1ec-calendar' ),
		    $first_calendar = $( '.ai1ec-calendar:visible' ).first();

		// General initialization.
		init();
		if ( ai1ec_config.use_select2 ) {
			initialize_select2();
		}
		attach_event_handlers();

		// For each calendar on the page, initialize its view for the first time.
		$calendars.each( function() {
			load_views.initialize_view( $( this ) );
		} );

		// Initialize affixed toolbar if requested, and page has only one calendar.
		if (
			ai1ec_config.affix_filter_menu &&
			1 === $first_calendar.length
		) {
			affix.initialize_affixed_toolbar( $first_calendar );
		}
	} );

	var start = function() {
		// NOOP – function deprecated.
	};

	return {
		start           : start,
		initialize_view : load_views.initialize_view
	};
} );
