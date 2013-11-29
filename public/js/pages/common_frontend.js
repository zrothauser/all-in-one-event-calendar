
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

timely.define('external_libs/jquery.masonry',
		[
		 "jquery_timely"
		],
		function( jQuery ) {
	
/**
 * jQuery Masonry v2.1.05
 * A dynamic layout plugin for jQuery
 * The flip-side of CSS Floats
 * http://masonry.desandro.com
 *
 * Licensed under the MIT license.
 * Copyright 2012 David DeSandro
 */

/*jshint browser: true, curly: true, eqeqeq: true, forin: false, immed: false, newcap: true, noempty: true, strict: true, undef: true */
/*global jQuery: false */

(function( window, $, undefined ){



  /*
   * smartresize: debounced resize event for jQuery
   *
   * latest version and complete README available on Github:
   * https://github.com/louisremi/jquery.smartresize.js
   *
   * Copyright 2011 @louis_remi
   * Licensed under the MIT license.
   */

  var $event = $.event,
      resizeTimeout;

  $event.special.smartresize = {
    setup: function() {
      $(this).bind( "resize", $event.special.smartresize.handler );
    },
    teardown: function() {
      $(this).unbind( "resize", $event.special.smartresize.handler );
    },
    handler: function( event, execAsap ) {
      // Save the context
      var context = this,
          args = arguments;

      // set correct event type
      event.type = "smartresize";

      if ( resizeTimeout ) { clearTimeout( resizeTimeout ); }
      resizeTimeout = setTimeout(function() {
        $.event.handle.apply( context, args );
      }, execAsap === "execAsap"? 0 : 100 );
    }
  };

  $.fn.smartresize = function( fn ) {
    return fn ? this.bind( "smartresize", fn ) : this.trigger( "smartresize", ["execAsap"] );
  };



// ========================= Masonry ===============================


  // our "Widget" object constructor
  $.Mason = function( options, element ){
    this.element = $( element );

    this._create( options );
    this._init();
  };

  $.Mason.settings = {
    isResizable: true,
    isAnimated: false,
    animationOptions: {
      queue: false,
      duration: 500
    },
    gutterWidth: 0,
    isRTL: false,
    isFitWidth: false,
    containerStyle: {
      position: 'relative'
    }
  };

  $.Mason.prototype = {

    _filterFindBricks: function( $elems ) {
      var selector = this.options.itemSelector;
      // if there is a selector
      // filter/find appropriate item elements
      return !selector ? $elems : $elems.filter( selector ).add( $elems.find( selector ) );
    },

    _getBricks: function( $elems ) {
      var $bricks = this._filterFindBricks( $elems )
        .css({ position: 'absolute' })
        .addClass('masonry-brick');
      return $bricks;
    },

    // sets up widget
    _create : function( options ) {

      this.options = $.extend( true, {}, $.Mason.settings, options );
      this.styleQueue = [];

      // get original styles in case we re-apply them in .destroy()
      var elemStyle = this.element[0].style;
      this.originalStyle = {
        // get height
        height: elemStyle.height || ''
      };
      // get other styles that will be overwritten
      var containerStyle = this.options.containerStyle;
      for ( var prop in containerStyle ) {
        this.originalStyle[ prop ] = elemStyle[ prop ] || '';
      }

      this.element.css( containerStyle );

      this.horizontalDirection = this.options.isRTL ? 'right' : 'left';

      this.offset = {
        x: parseInt( this.element.css( 'padding-' + this.horizontalDirection ), 10 ),
        y: parseInt( this.element.css( 'padding-top' ), 10 )
      };

      this.isFluid = this.options.columnWidth && typeof this.options.columnWidth === 'function';

      // add masonry class first time around
      var instance = this;
      setTimeout( function() {
        instance.element.addClass('masonry');
      }, 0 );

      // bind resize method
      if ( this.options.isResizable ) {
        $(window).bind( 'smartresize.masonry', function() {
          instance.resize();
        });
      }


      // need to get bricks
      this.reloadItems();

    },

    // _init fires when instance is first created
    // and when instance is triggered again -> $el.masonry();
    _init : function( callback ) {
      this._getColumns();
      this._reLayout( callback );
    },

    option: function( key, value ){
      // set options AFTER initialization:
      // signature: $('#foo').bar({ cool:false });
      if ( $.isPlainObject( key ) ){
        this.options = $.extend(true, this.options, key);
      }
    },

    // ====================== General Layout ======================

    // used on collection of atoms (should be filtered, and sorted before )
    // accepts atoms-to-be-laid-out to start with
    layout : function( $bricks, callback ) {

      // place each brick
      for (var i=0, len = $bricks.length; i < len; i++) {
        this._placeBrick( $bricks[i] );
      }

      // set the size of the container
      var containerSize = {};
      containerSize.height = Math.max.apply( Math, this.colYs );
      if ( this.options.isFitWidth ) {
        var unusedCols = 0;
        i = this.cols;
        // count unused columns
        while ( --i ) {
          if ( this.colYs[i] !== 0 ) {
            break;
          }
          unusedCols++;
        }
        // fit container to columns that have been used;
        containerSize.width = (this.cols - unusedCols) * this.columnWidth - this.options.gutterWidth;
      }
      this.styleQueue.push({ $el: this.element, style: containerSize });

      // are we animating the layout arrangement?
      // use plugin-ish syntax for css or animate
      var styleFn = !this.isLaidOut ? 'css' : (
            this.options.isAnimated ? 'animate' : 'css'
          ),
          animOpts = this.options.animationOptions;

      // process styleQueue
      var obj;
      for (i=0, len = this.styleQueue.length; i < len; i++) {
        obj = this.styleQueue[i];
        obj.$el[ styleFn ]( obj.style, animOpts );
      }

      // clear out queue for next time
      this.styleQueue = [];

      // provide $elems as context for the callback
      if ( callback ) {
        callback.call( $bricks );
      }

      this.isLaidOut = true;
    },

    // calculates number of columns
    // i.e. this.columnWidth = 200
    _getColumns : function() {
      var container = this.options.isFitWidth ? this.element.parent() : this.element,
          containerWidth = container.width();

                         // use fluid columnWidth function if there
      this.columnWidth = this.isFluid ? this.options.columnWidth( containerWidth ) :
                    // if not, how about the explicitly set option?
                    this.options.columnWidth ||
                    // or use the size of the first item
                    this.$bricks.outerWidth(true) ||
                    // if there's no items, use size of container
                    containerWidth;

      this.columnWidth += this.options.gutterWidth;

      this.cols = Math.floor( ( containerWidth + this.options.gutterWidth ) / this.columnWidth );
      this.cols = Math.max( this.cols, 1 );

    },

    // layout logic
    _placeBrick: function( brick ) {
      var $brick = $(brick),
          colSpan, groupCount, groupY, groupColY, j;

      //how many columns does this brick span
      colSpan = Math.ceil( $brick.outerWidth(true) / this.columnWidth );
      colSpan = Math.min( colSpan, this.cols );

      if ( colSpan === 1 ) {
        // if brick spans only one column, just like singleMode
        groupY = this.colYs;
      } else {
        // brick spans more than one column
        // how many different places could this brick fit horizontally
        groupCount = this.cols + 1 - colSpan;
        groupY = [];

        // for each group potential horizontal position
        for ( j=0; j < groupCount; j++ ) {
          // make an array of colY values for that one group
          groupColY = this.colYs.slice( j, j+colSpan );
          // and get the max value of the array
          groupY[j] = Math.max.apply( Math, groupColY );
        }

      }

      // get the minimum Y value from the columns
      var minimumY = Math.min.apply( Math, groupY ),
          shortCol = 0;

      // Find index of short column, the first from the left
      for (var i=0, len = groupY.length; i < len; i++) {
        if ( groupY[i] === minimumY ) {
          shortCol = i;
          break;
        }
      }

      // position the brick
      var position = {
        top: minimumY + this.offset.y
      };
      // position.left or position.right
      position[ this.horizontalDirection ] = this.columnWidth * shortCol + this.offset.x;
      this.styleQueue.push({ $el: $brick, style: position });

      // apply setHeight to necessary columns
      var setHeight = minimumY + $brick.outerHeight(true),
          setSpan = this.cols + 1 - len;
      for ( i=0; i < setSpan; i++ ) {
        this.colYs[ shortCol + i ] = setHeight;
      }

    },


    resize: function() {
      var prevColCount = this.cols;
      // get updated colCount
      this._getColumns();
      if ( this.isFluid || this.cols !== prevColCount ) {
        // if column count has changed, trigger new layout
        this._reLayout();
      }
    },


    _reLayout : function( callback ) {
      // reset columns
      var i = this.cols;
      this.colYs = [];
      while (i--) {
        this.colYs.push( 0 );
      }
      // apply layout logic to all bricks
      this.layout( this.$bricks, callback );
    },

    // ====================== Convenience methods ======================

    // goes through all children again and gets bricks in proper order
    reloadItems : function() {
      this.$bricks = this._getBricks( this.element.children() );
    },


    reload : function( callback ) {
      this.reloadItems();
      this._init( callback );
    },


    // convienence method for working with Infinite Scroll
    appended : function( $content, isAnimatedFromBottom, callback ) {
      if ( isAnimatedFromBottom ) {
        // set new stuff to the bottom
        this._filterFindBricks( $content ).css({ top: this.element.height() });
        var instance = this;
        setTimeout( function(){
          instance._appended( $content, callback );
        }, 1 );
      } else {
        this._appended( $content, callback );
      }
    },

    _appended : function( $content, callback ) {
      var $newBricks = this._getBricks( $content );
      // add new bricks to brick pool
      this.$bricks = this.$bricks.add( $newBricks );
      this.layout( $newBricks, callback );
    },

    // removes elements from Masonry widget
    remove : function( $content ) {
      this.$bricks = this.$bricks.not( $content );
      $content.remove();
    },

    // destroys widget, returns elements and container back (close) to original style
    destroy : function() {

      this.$bricks
        .removeClass('masonry-brick')
        .each(function(){
          this.style.position = '';
          this.style.top = '';
          this.style.left = '';
        });

      // re-apply saved container styles
      var elemStyle = this.element[0].style;
      for ( var prop in this.originalStyle ) {
        elemStyle[ prop ] = this.originalStyle[ prop ];
      }

      this.element
        .unbind('.masonry')
        .removeClass('masonry')
        .removeData('masonry');

      $(window).unbind('.masonry');

    }

  };


  // ======================= imagesLoaded Plugin ===============================
  /*!
   * jQuery imagesLoaded plugin v1.1.0
   * http://github.com/desandro/imagesloaded
   *
   * MIT License. by Paul Irish et al.
   */


  // $('#my-container').imagesLoaded(myFunction)
  // or
  // $('img').imagesLoaded(myFunction)

  // execute a callback when all images have loaded.
  // needed because .load() doesn't work on cached images

  // callback function gets image collection as argument
  //  `this` is the container

  $.fn.imagesLoaded = function( callback ) {
    var $this = this,
        $images = $this.find('img').add( $this.filter('img') ),
        len = $images.length,
        blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
        loaded = [];

    function triggerCallback() {
      callback.call( $this, $images );
    }

    function imgLoaded( event ) {
      var img = event.target;
      if ( img.src !== blank && $.inArray( img, loaded ) === -1 ){
        loaded.push( img );
        if ( --len <= 0 ){
          setTimeout( triggerCallback );
          $images.unbind( '.imagesLoaded', imgLoaded );
        }
      }
    }

    // if no images, trigger immediately
    if ( !len ) {
      triggerCallback();
    }

    $images.bind( 'load.imagesLoaded error.imagesLoaded',  imgLoaded ).each( function() {
      // cached images don't fire load sometimes, so we reset src.
      var src = this.src;
      // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
      // data uri bypasses webkit log warning (thx doug jones)
      this.src = blank;
      this.src = src;
    });

    return $this;
  };


  // helper function for logging errors
  // $.error breaks jQuery chaining
  var logError = function( message ) {
    if ( window.console ) {
      window.console.error( message );
    }
  };

  // =======================  Plugin bridge  ===============================
  // leverages data method to either create or return $.Mason constructor
  // A bit from jQuery UI
  //   https://github.com/jquery/jquery-ui/blob/master/ui/jquery.ui.widget.js
  // A bit from jcarousel
  //   https://github.com/jsor/jcarousel/blob/master/lib/jquery.jcarousel.js

  $.fn.masonry = function( options ) {
    if ( typeof options === 'string' ) {
      // call method
      var args = Array.prototype.slice.call( arguments, 1 );

      this.each(function(){
        var instance = $.data( this, 'masonry' );
        if ( !instance ) {
          logError( "cannot call methods on masonry prior to initialization; " +
            "attempted to call method '" + options + "'" );
          return;
        }
        if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
          logError( "no such method '" + options + "' for masonry instance" );
          return;
        }
        // apply method
        instance[ options ].apply( instance, args );
      });
    } else {
      this.each(function() {
        var instance = $.data( this, 'masonry' );
        if ( instance ) {
          // apply options & init
          instance.option( options || {} );
          instance._init();
        } else {
          // initialize new instance
          $.data( this, 'masonry', new $.Mason( options, this ) );
        }
      });
    }
    return this;
  };

})( window, jQuery );

} );

timely.define('scripts/calendar/posterboard_view',
	[
	 "jquery_timely",
	 "external_libs/jquery.masonry",
	],
	function( $, masonry ) {
	

	// *** Posterboard view layout ***

	/**
	 * Initializes and/or reflows masonry on the active posterboard view (usually
	 * when the window has been resized, or after web fonts have been loaded).
	 */
	var resize_masonry = function() {
		var $container = $( '.ai1ec-posterboard-view' ),
		    $tiles = $( '> .ai1ec-event', $container ),
		    container_width,
		    col_width,
		    num_columns;

		// Don't reflow masonry if no posterboard view is available.
		if ( $container.length === 0 ) {
			return;
		}

		// Get new width of container & columns.
		container_width = $container.parent().width();
		// Min column width locally is col_width (a variable set in the ai1ec
		// settings by the global var $ai1ec_settings->posterboard_tile_min_width).
		col_width = $container.data( 'ai1ecTileMinWidth' );
		// We then stretch until the container width is filled.
		num_columns = Math.floor( container_width / col_width );
		// Don't create more columns than there are tiles.
		num_columns = Math.min( num_columns, $tiles.length );
		col_width = Math.floor( container_width / num_columns );

		// Reset width to auto to bypass masonry inline CSS.
		$container.css( 'width', 'auto' );

		// Size event tiles to desired column width.
		$tiles.width( col_width );

		// Configure masonry on the view.
		$container.imagesLoaded( function() {
			var $loading = $( '#ai1ec-calendar-view-loading' );
			$container
				.masonry({
					itemSelector: '.ai1ec-event',
					isFitWidth: true,
					isResizable: false, // We are handling resize events ourselves
					isAnimated: true,
					columnWidth: col_width,
					animationOptions: { easing: 'swing' }
				});
		});

		// Reload masonry; needed if it has already been initialized (most cases).
		$container.imagesLoaded( function() {
			$container.masonry( 'reload' );
		});
	};

	/**
	 * Reloads masonry on the active posterboard view, in case its contents have
	 * changed.
	 */
	var reload_masonry = function() {
		$( '.ai1ec-posterboard-view' ).masonry( 'reload' );
	};

	return {
		resize_masonry: resize_masonry,
		reload_masonry: reload_masonry
	};
} );

timely.define('scripts/common_scripts/frontend/common_event_handlers',
	[
		"jquery_timely",
		"scripts/calendar/posterboard_view"
	],
	function( $, posterboard_view ) {
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
			template: '<div class="timely popover ' + el_classes_data +
				'"><div class="arrow"></div><div class="popover-inner">' +
				'<div class="popover-content"><div></div></div></div></div></div>',
			container: $this.closest( '.ai1ec-popover-boundary' )
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
		if ( $el.closest( '.tooltip' ).length === 0 ) {
			$( this ).remove();
			$( 'body > .tooltip' ).remove();
		}
	};

	/**
	 * Manually handle tooltip mouseenter. Need to apply .timely namespace.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_tooltip_over = function( e ) {
		var $this = $( this ),
		    params = {
					template: '<div class="timely tooltip">' +
						'<div class="tooltip-arrow"></div><div class="tooltip-inner">' +
						'</div></div>',
					trigger: 'manual'
				};

		// Don't add tooltips to category colour squares already contained in
		// descriptive category labels.
		if ( $this.is( '.ai1ec-category .ai1ec-color-swatch' ) ) {
			return;
		}

		$this.tooltip( params );
		$this.tooltip( 'show' );
	};

	/**
	 * Manually handle tooltip mouseleave. Do not hide if entering tooltip or
	 * tooltip triggering action.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_tooltip_out = function( e ) {
		var $el = $( e.toElement || e.relatedTarget );
		if ( $el.closest( '.tooltip' ).length === 0 ) {
			$( this ).tooltip( 'hide' );
		}
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

	/**
	 * Handler for web font loader. Do any required actions when web fonts are
	 * loaded.
	 */
	var handle_fonts_loaded = function( e ) {
		posterboard_view.resize_masonry();
		if ( $( 'html' ).is( '#ie8' ) ) {
			//$( '[class^="icon-"]' ).css( 'zoom', '1' );
		}
	};

	return {
		handle_popover_over        : handle_popover_over,
		handle_popover_out         : handle_popover_out,
		handle_popover_self_out    : handle_popover_self_out,
		handle_tooltip_over        : handle_tooltip_over,
		handle_tooltip_out         : handle_tooltip_out,
		handle_tooltip_self_out    : handle_tooltip_self_out,
		handle_fonts_loaded        : handle_fonts_loaded
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

timely.define('external_libs/bootstrap_dropdown',
		[
		 "jquery_timely",
		 "domReady"
		 ],
		 function( $, domReady ) {
			/* ============================================================
			 * bootstrap-dropdown.js v2.0.3
			 * http://twitter.github.com/bootstrap/javascript.html#dropdowns
			 * ============================================================
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
if ( ! $.fn.dropdown ) {

	   // jshint ;_;


	  /* DROPDOWN CLASS DEFINITION
	   * ========================= */

	   var toggle = '[data-toggle="dropdown"]'
	     , Dropdown = function (element) {
	         var $el = $(element).on('click.dropdown.data-api', this.toggle)
	         $('html').on('click.dropdown.data-api', function () {
	           $el.parent().removeClass('open')
	         })
	       }

	   Dropdown.prototype = {

	     constructor: Dropdown

	   , toggle: function (e) {
	       var $this = $(this)
	         , $parent
	         , selector
	         , isActive

	       if ($this.is('.disabled, :disabled')) return

	       selector = $this.attr('data-target')

	       if (!selector) {
	         selector = $this.attr('href')
	         selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
	       }

	       $parent = $(selector)
	       $parent.length || ($parent = $this.parent())

	       isActive = $parent.hasClass('open')

	       clearMenus()

	       if (!isActive) $parent.toggleClass('open')

	       return false
	     }

	   }

	   function clearMenus() {
	     $(toggle).parent().removeClass('open')
	   }


	   /* DROPDOWN PLUGIN DEFINITION
	    * ========================== */

	   $.fn.dropdown = function (option) {
	     return this.each(function () {
	       var $this = $(this)
	         , data = $this.data('dropdown')
	       if (!data) $this.data('dropdown', (data = new Dropdown(this)))
	       if (typeof option == 'string') data[option].call($this)
	     })
	   }

	   $.fn.dropdown.Constructor = Dropdown


	   /* APPLY TO STANDARD DROPDOWN ELEMENTS
	    * =================================== */

	   domReady(function () {
	     $(document).on('click.dropdown.data-api', clearMenus)
	     $(document)
	       .on('click.dropdown', '.dropdown form', function (e) { e.stopPropagation() })
	       .on('click.dropdown.data-api', toggle, Dropdown.prototype.toggle)
	   })

	}
} );

timely.define('scripts/common_scripts/frontend/common_frontend',
	[
		"jquery_timely",
		"domReady",
		"scripts/common_scripts/frontend/common_event_handlers",
		"ai1ec_calendar",
		"external_libs/modernizr",
		"external_libs/bootstrap_tooltip",
		"external_libs/bootstrap_popover",
		"external_libs/bootstrap_dropdown"
	],
	function( $, domReady, event_handlers, ai1ec_calendar, Modernizr ) {
	 // jshint ;_;

	var event_listeners_attached = false;

	var attach_event_handlers_frontend = function() {
		event_listeners_attached = true;
		$( document ).on( 'mouseenter', '.ai1ec-popup-trigger', event_handlers.handle_popover_over );
		$( document ).on( 'mouseleave', '.ai1ec-popup-trigger', event_handlers.handle_popover_out );
		$( document ).on( 'mouseleave', '.ai1ec-popup', event_handlers.handle_popover_self_out );
		$( document ).on( 'mouseenter', '.ai1ec-tooltip-trigger', event_handlers.handle_tooltip_over );
		$( document ).on( 'mouseleave', '.ai1ec-tooltip-trigger', event_handlers.handle_tooltip_out );
		$( document ).on( 'mouseleave', '.tooltip', event_handlers.handle_tooltip_self_out );
	};

	/**
	 * Load the fonts and trigger actions to happen when fonts have loaded.
	 */
	var load_fonts = function() {
		var families = [];
		var url = [];
		$.each( ai1ec_calendar.fonts, function() {
			families.push( this.name );
			url.push( this.url );
		} );
		var data = {
			active: event_handlers.handle_fonts_loaded,
			custom : {
				families : families,
				urls : url
			}
		};
		timely.require(
			[ 'external_libs/webfont' ],
			function() {
				WebFont.load(data);
			} );
	};

	/**
	 * Initialize page.
	 */
	var start = function() {
		load_fonts();
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

timely.require(
		[ "scripts/common_scripts/frontend/common_frontend" ],
		function( page ) {
			 // jshint ;_;
			page.start();
		}
);

timely.define("pages/common_frontend", function(){});
