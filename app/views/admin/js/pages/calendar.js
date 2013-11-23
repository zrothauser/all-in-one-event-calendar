
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
		  , view = $( '#ai1ec-container' ).html()
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
		// Open the print screen
		window.print();
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
		$( '.ai1ec-expanded .ai1ec-event-toggle')
			.click();
	};

	var expand_all = function() {
		$( '.ai1ec-event:not(.ai1ec-expanded) .ai1ec-event-toggle')
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
	var extend_multiday_events = function() {
		var $days = $('.ai1ec-day');
		var daysFirstWeek = $( '.ai1ec-week:first .ai1ec-day' ).length;

		$('.ai1ec-month-view .ai1ec-multiday').each( function() {
			var container = this.parentNode;
			var elHeight = $(this).outerHeight( true );
			var endDay = parseInt( $(this).data( 'endDay' ), 10 );
			var $startEl = $( '.ai1ec-date', container );
			var startDay = parseInt( $startEl.text(), 10 );

			var nextMonthBar = $( this ).data( 'endTruncated' );
			if ( nextMonthBar ) {
				endDay = parseInt( $($days[$days.length - 1]).text(), 10 ) ;
			}

			var $evtContainer = $(this);
			var bgColor = $( '.ai1ec-event', $evtContainer )[0].style.backgroundColor;
			var curLine = 0;
			var deltaDays = endDay - startDay + 1;
			var daysLeft = deltaDays;
			var marginSize;

			// this is the variable used to count the number of days for the event
			var days = 0;

			$days.each( function( i ) {
				var $dayEl = $( '.ai1ec-date', this );
				var $td = $( this.parentNode );
				var cellNum = $td.index();
				var day = parseInt( $dayEl.text(), 10 );
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
								top: parseInt( $dayEl.css( 'marginBottom' ), 10 ) + 13, // line height is 16px - 3px of initial margin
								backgroundColor: bgColor
							});

						// Check the days left, if they are more than 7 a new block is needed and we draw 7 days only
						var daysForThisBlock = ( daysLeft > 7 ) ? 7 : daysLeft;

						$block.css( 'width', create_percentual_width_from_days( daysForThisBlock ) );

						if ( daysLeft > 7 ) {
							$block.append( create_multiday_arrow( 1, bgColor ));
						}

						$block.append( create_multiday_arrow( 2, bgColor ));
					}

					// Keep constant margin (number of bars) during the first row.
					if ( curLine === 0 ) {
						$dayEl.css({ 'marginBottom': marginSize + 'px' });
					}
					// But need to reset it and append margins from the begining for
					// subsequent weeks.
					else {
						$dayEl.css({ 'marginBottom': '+=16px' });
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
				var $lastBarPiece = $( '.' + $evtContainer[0].className.replace( /\s+/igm, '.' ) ).last();
				$lastBarPiece.append( create_multiday_arrow( 1, bgColor ));
			}

			$(this).css({
				position: 'absolute',
				top: $startEl.outerHeight( true ) - elHeight - 1 + 'px',
				left: '1px',
				width: create_percentual_width_from_days( days )
			});

			// Add an ending arrow to the initial event bar for multi-week events.
			if ( curLine > 0 ) {
				$(this).append( create_multiday_arrow( 1, bgColor ) );
			}
			// Add a starting arrow to the initial event bar for events starting in
			// previous month.
			if ( $(this).data( 'startTruncated' ) ) {
				$(this)
					.append( create_multiday_arrow( 2, bgColor ) )
					.addClass( 'ai1ec-multiday-bar' );
			}
		});
	};

	/**
	 * returns a string with the percentage to use as width for the specified number of days
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
			$arrow.css({ borderLeftColor: color });
		} else {
			$arrow.css({ borderTopColor: color, borderRightColor: color, borderBottomColor: color });
		}
		return $arrow;
	};

	/**
	 * Trims date boxes for which there are too many listed events.
	 */
	/* NOT USED
	var truncate_month_view = function()
	{
		if( $( '.ai1ec-month-view' ).length )
		{
			// First undo any previous truncation
			revert_dropdowns();

			// Now set up truncation on any days with max visible events.
			$( '.ai1ec-month-view .ai1ec-day' ).each( function()
			{
				var max_visible = 5;
				var maxVisibleHeight = 5 * 16;
				var addDropdownContainer = -1;
				var $events = $( '.ai1ec-event-container', this );

				$events.each( function( i ) {
					if ( this.offsetTop >= maxVisibleHeight && addDropdownContainer === -1 ) {
						addDropdownContainer = ( i > 1 ? i - 1 : 0 );
					 }

				});

				if ( addDropdownContainer !== -1 ) {
					var container = document.createElement("div");
					container.className = "ai1ec-event-dropdown";

					$( container ).css({
						top: $events[addDropdownContainer].offsetTop,
						display: "none"
					});
					for ( var i = addDropdownContainer; i < $events.length; i++ ) {
						// Need to reset styles for events in dropdown.
						revert_multiday_bar( $events[i] );

						// Add an arrow for multiday events.
						if ( $( $events[i] ).hasClass( "ai1ec-multiday" ) ) {
							$( $events[i] ).append( create_multiday_arrow( 1, $events[i].style.backgroundColor ) );
						}
						$( container ).append( $events[i] );
					}

					// Scroll down button, and register mousedown.
					var $scroll_down = $( '<a href="#" class="ai1ec-scroll-down"></a>' );
					$scroll_down.bind( 'hover click', function () {
						$( container ).fadeIn( 100 );
						return false;
					});

					var $date = $( this ).find( ".ai1ec-date" );
					if ( parseInt( $date.css( "marginBottom" ), 10 ) > maxVisibleHeight ) {
						$date.css({ marginBottom: maxVisibleHeight - 15 + "px" });
						$( container ).css({
							top: maxVisibleHeight + "px"
						});
					}
					$( this ).append(container);
					$( this ).append($scroll_down);

					// Need additional button to close dropdown on touch devices
					if ( Modernizr.touch ) {
						// Scroll down button, and register mousedown
						var $scroll_up = $( '<a href="#" class="ai1ec-scroll-up"></a>' );
						$scroll_up.bind("click", function () {
							$( container ).fadeOut( 100 );
							return false;
						});
						$( container ).append($scroll_up);
					} else {
						$( container ).bind( 'mouseleave' ,function() {
							$( this ).fadeOut( 100 );
						});
					}
				}
			});
		}
	};*/

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
			action : 'posterboard'
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
timely.define('external_libs/jquery_cookie', ["jquery_timely"],
		function( $ ) {
	var pluses = /\+/g;

	function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	function converted(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
		try {
			return config.json ? JSON.parse(s) : s;
		} catch(er) {}
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				config.raw ? key : encodeURIComponent(key),
				'=',
				config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		var result = key ? undefined : {};
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = decode(parts.join('='));

			if (key && key === name) {
				result = converted(cookie);
				break;
			}

			if (!key) {
				result[name] = converted(cookie);
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== undefined) {
			// Must not alter options, thus extending a fresh object...
			$.cookie(key, '', $.extend({}, options, { expires: -1 }));
			return true;
		}
		return false;
	};

} );

/*global History: true */
timely.define('scripts/calendar/load_views',
	[
		"jquery_timely",
		"scripts/calendar/print",
		"scripts/calendar/posterboard_view",
		"scripts/calendar/agenda_view",
		"scripts/calendar/month_view",
		"libs/frontend_utils",
		"libs/utils",
		"ai1ec_calendar",
		"ai1ec_config",
		"scripts/common_scripts/frontend/common_frontend",
		"libs/select2_multiselect_helper",
		"external_libs/jquery_history",
		"external_libs/jquery.tablescroller",
		"external_libs/jquery.scrollTo",
		"external_libs/bootstrap_datepicker",
		"external_libs/bootstrap_alert",
		"external_libs/jquery_cookie"
	],
	function(
		$,
		print_functions,
		posterboard_view,
		agenda_view,
		month_view,
		frontend_utils,
		utils,
		ai1ec_calendar,
		ai1ec_config,
		common_frontend,
		select2_multiselect_helper
	) {
	 // jshint ;_;
	$.cookie.json = true;
	var save_filter_view_cookie = 'ai1ec_saved_filter';
	// the initial value is determined by the visibility of the save view button
	var are_filters_set = ! $( '#save_filtered_views' ).hasClass( 'hide' );

	/**
	 * function initialize_view
	 *
	 * General initialization function to execute whenever any view is loaded
	 * (this is also called at the end of load_view()).
	 */
	var initialize_view = function() {

		// Get the dropdown menu link of the active view.
		var $selected_view = $('#ai1ec-view-dropdown .dropdown-menu .active a');

		var hours =
			ai1ec_config.week_view_ends_at - ai1ec_config.week_view_starts_at;
		var height = hours * 60;
		// Make week view table limitable.
		$( 'table.ai1ec-week-view-original' ).tableScroll( {
			height: height,
			containerClass: 'ai1ec-week-view ai1ec-popover-boundary',
			scroll : false
		} );
		$( 'table.ai1ec-oneday-view-original' ).tableScroll( {
			height: height,
			containerClass: 'ai1ec-oneday-view ai1ec-popover-boundary',
			scroll : false
		} );

		if( $( '.ai1ec-week-view' ).length || $( '.ai1ec-oneday-view' ).length ) {
			// If no active event, then in week view, scroll down to 6am.
			$( '.ai1ec-oneday-view .tablescroll_wrapper, .ai1ec-week-view .tablescroll_wrapper' )
				.scrollTo( '.ai1ec-hour-marker:eq(' + ai1ec_config.week_view_starts_at + ')' );
			$( '.ai1ec-hour-marker:eq(' + ai1ec_config.week_view_starts_at + ')' ).addClass( 'ai1ec-first-visible' );
		}

		// If in month view, extend multiday events.
		if ( $( '.ai1ec-month-view .ai1ec-multiday' ).length ) {
			month_view.extend_multiday_events();
		}

		// If in posterboard view, initialize masonry.
		if ( $( '.ai1ec-posterboard-view' ).length ) {
			posterboard_view.resize_masonry();
		}
	};

	/**
	 * Do any cleanup required before currently displayed view is replaced with
	 * a newly retrieved view.
	 */
	var destroy_view = function() {
		// Destroy any datepicker before loading new view.
		var dp = $( '.ai1ec-minical-trigger' ).data( 'datepicker' );
		if ( typeof dp !== 'undefined' ) {
			dp.picker.parent( '.timely' ).remove();
		}
		// Destroy any visible tooltips or popovers.
		$( '.tooltip.in, .ai1ec-popup' ).remove();
	};

	var get_cal_state = function() {
		// Otherwise we need to get the state from the dropdowns.
		var cat_ids = [], tag_ids = [], auth_ids = [], action;
		$( '.ai1ec-category-filter .dropdown-menu .active' ).each( function() {
			cat_ids.push( $( this ).data( 'term' ) );
		} );
		$( '.ai1ec-tag-filter .dropdown-menu .active' ).each( function() {
			tag_ids.push( $( this ).data( 'term' ) );
		} );
		$( '.ai1ec-author-filter .dropdown-menu .active' ).each( function() {
			auth_ids.push( $( this ).data( 'term' ) );
		} );
		var cal_state = {};
		cal_state.cat_ids  = cat_ids;
		cal_state.tag_ids  = tag_ids;
		cal_state.auth_ids = auth_ids;
		action =
			$( '.ai1ec-views-dropdown .dropdown-menu .active' ).data( 'action' );
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
			.addClass( 'active' )
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
			.removeClass( 'active' )
			.attr( 'data-original-title', ai1ec_config.reset_saved_filter_text );
		// we keep the variable that tells us if some filters are set updated on every call.
		// so if no filters are applied, just hide the button
		if( ! are_filters_set ) {
			$( '#save_filtered_views' ).addClass( 'hide' );
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
	var load_view = function( hash, type ) {
		// Reveal loader behind view
		$('#ai1ec-calendar-view-loading').fadeIn( 'fast' );
		$('#ai1ec-calendar-view').fadeTo( 'fast', 0.3,
			// After loader is visible, fetch new content
			function() {
				var query = {
						request_type: type,
						ai1ec_doing_ajax : true
				};
				// Fetch AJAX result
				$.ajax( {
					url : hash,
					dataType: type,
					data: query,
					method : 'get',
					success: function( data ) {
						// Do required cleanup of existing view.
						destroy_view();

						// Views Dropdown
						if( typeof data.views_dropdown === 'string' ) {
							$( '.ai1ec-views-dropdown' ).replaceWith( data.views_dropdown );
						}
						// Update categories
						if( typeof data.categories === 'string' ) {
							$( '.ai1ec-category-filter' ).replaceWith( data.categories );
							if( ai1ec_config.use_select2 ) {
								select2_multiselect_helper.init( $( '.ai1ec-category-filter' ) );
							}
						}
						// Update authors
						if( typeof data.authors === 'string' ) {
							$( '.ai1ec-author-filter' ).replaceWith( data.authors );
							if( ai1ec_config.use_select2 ) {
								select2_multiselect_helper.init( $( '.ai1ec-author-filter' ) );
							}
						}
						// Tags
						if( typeof data.tags === 'string' ) {
							$( '.ai1ec-tag-filter' ).replaceWith( data.tags );
							if( ai1ec_config.use_select2 ) {
								select2_multiselect_helper.init( $( '.ai1ec-tag-filter' ) );
							}
						}
						// And the "Subscribe buttons"
						if( typeof data.subscribe_buttons === 'string' ) {
							$( '.ai1ec-subscribe-container' ).replaceWith( data.subscribe_buttons );
						}
						// And the "Save filtered view"
						if( typeof data.save_view_btngroup === 'string' ) {
							$( '#save_filtered_views' ).closest( '.btn-group' ).replaceWith( data.save_view_btngroup );
						}
						are_filters_set = data.are_filters_set;


						// Animate vertical height of container between HTML replacement
						var $container = $('#ai1ec-calendar-view-container');
						$container.height( $container.height() );
						var new_height =
							$('#ai1ec-calendar-view')
								.html( data.html )
								.height();
						$container.animate( { height: new_height }, { complete: function() {
							// Restore height to automatic upon animation completion for
							// proper page layout.
							$container.height( 'auto' );
						} } );

						// Hide loader
						$('#ai1ec-calendar-view-loading').fadeOut( 'fast' );
						$('#ai1ec-calendar-view').fadeTo( 'fast', 1.0 );
						// Do any general view initialization after loading
						initialize_view();
					}
				}
				);
			}
		);
	};

	// When the state changes, load the corresponding view
	var handle_state_change = function( e ) {
		var state = History.getState();
		if( state.data.ai1ec !== undefined && true === state.data.ai1ec ) {
			load_view( state.url, 'json' );
		}
	};

	/**
	 * Load the correct view according to the datatypet
	 *
	 */
	var load_view_according_to_datatype = function( type, url ) {
		if( type === 'json' ) {
			var data = {
				ai1ec : true
			};
			History.pushState( data, null, url );
		} else {
			load_view( url, 'jsonp' );
		}
	};
	// Handle loading the correct view when clicking on a link
	var handle_click_on_link_to_load_view = function( e ) {

		var $el = $( this );
		e.preventDefault();

		load_view_according_to_datatype( $el.data( 'type' ), $el.attr( 'href' ) );
	};

	/**
	 * Click of minical trigger button. If not initialized, initialize datepicker.
	 * Then show datepicker.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_minical_trigger = function( e ) {
		var $el = $( this );

		e.preventDefault();

		if ( typeof $el.data( 'datepicker' ) === 'undefined' ) {
			// Initialize this view's minical datepicker.
			$el.datepicker( {
					todayBtn: 'linked',
					todayHighlight: true,
					templateOverrides: 'headTemplate contTemplate',
					headTemplate:
						'<thead><tr class="datepicker-btn-group">' +
							'<th class="prev"><div class="dp-btn"><i class="icon-arrow-left"/></div></th>' +
							'<th colspan="5" class="switch"><div class="dp-btn"></div></th>' +
							'<th class="next"><div class="dp-btn"><i class="icon-arrow-right"/></div></th>' +
						'</tr></thead>',
					contTemplate: '<tbody><tr><td colspan="7" class="grid-picker"></td></tr></tbody>'
				} );

			// Extend Datepicker behaviour without modifying the plugin.
			var dp = $el.data( 'datepicker' );
			// Wrap datepicker in div.timely to avoid polluting global namespace, and
			// flag as right-aligned.
			dp.picker
				.wrapAll( '<div class="timely" />' )
				.addClass( 'ai1ec-right-aligned' );
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
		    date;

		$el.datepicker( 'hide' );

		// Get URL template, and date, replacing '/' with '-' to be URL-friendly.
		url = $el.data( 'href' );
		date = $el.data( 'date' ).replace( /\//g, '-' );
		url = url.replace( '__DATE__', date );
		load_view_according_to_datatype( $el.data( 'type' ), url );
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
			new_state = $( 'option[value=' + e.removed.id + ']', e.target ).data( 'href' );
		}
		data = {
			ai1ec : true
		};
		History.pushState( data, null, new_state );
	};

	// Handle clearing filter
	var clear_filters = function() {
		load_view_according_to_datatype(
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
		load_view_from_select2_filter      : load_view_from_select2_filter
	};
});

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

timely.define('libs/collapse_helper',
	[
		"jquery_timely",
		"domReady",
		"external_libs/bootstrap_collapse"
	],
	function( $, domReady ) {
	

	domReady( function() {
		// Toggle visibility of .icon-caret-down/.icon-caret-up in collapse triggers
		// when they are clicked.
		$( document ).on( 'click', '[data-toggle="ai1ec_collapse"]', function() {
			$( this ).toggleClass( 'active' );
			$( '.icon-caret-down, .icon-caret-up, .icon-chevron-down, .icon-chevron-up, .icon-arrow-down, .icon-arrow-up', this )
				.toggleClass( 'hide' );
		} );
	} );
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

timely.define('scripts/calendar/submit_ics_modal',
	[
		"jquery_timely",
		"ai1ec_config",
		"libs/utils",
		"libs/recaptcha",
		"libs/select2_multiselect_helper",
		"libs/collapse_helper",
		"external_libs/Placeholders"
	],
	function( $, ai1ec_config, utils, recaptcha, select2_multiselect_helper ) {
	 // jshint ;_;

	var $form = $( '.ai1ec-submit-ics-form' )
	 ,  $spinner = $( '#ai1ec-submit-ics-modal .ai1ec-loading' );

	/**
	 * Initialize the iCalendar feed submission form.
	 */
	var init_form = function() {
		recaptcha.init_recaptcha( $form );
		select2_multiselect_helper.init( $form );
	};

	var init_recaptcha = function() {
		recaptcha.init_recaptcha( $form );
	};

	var handle_form_submission = function( e ) {
		e.preventDefault();
		$( '.ai1ec-alerts', $form ).html( '' );
		var ics = $( '#ai1ec_calendar_url', $form ).val();
		var email = $( '#ai1ec_submitter_email', $form ).val();
		if( ics === '' || email === '' ) {
			var $alert = utils.make_alert( ai1ec_config.mail_url_required, 'error', true );
			$( '.ai1ec-alerts', $form ).append( $alert );
		}
		else {
			if( ! utils.isUrl( ics ) ) {
				var $alert = utils.make_alert( ai1ec_config.invalid_url_message, 'error', true );
				$( '.ai1ec-alerts', $form ).append( $alert );
				$( '#ai1ec_calendar_url', $form ).focus();
				return;
			}
			if( ! utils.isValidEmail( email ) ) {
				var $alert = utils.make_alert( ai1ec_config.invalid_email_message, 'error', true );
				$( '.ai1ec-alerts', $form ).append( $alert );
				$( '#ai1ec_submitter_email', $form ).focus();
				return;
			}

			var form_data = $form.serialize();
			$spinner.addClass( 'show' );
			$.ajax( {
				data: form_data + "&action=ai1ec_add_ics_frontend",
				type: 'POST',
				dataType: 'json',
				url: ai1ec_config.ajax_url,
				success: function( data ) {
					$spinner.removeClass( 'show' );
					if ( $( '#recaptcha_response_field', $form ).length &&
					     typeof Recaptcha !== 'undefined' ) {
						// Fetch new CAPTCHA challenge.
						Recaptcha.reload();
					}
					var outcome = data.success ? 'success' : 'error';
					var $alert = utils.make_alert( data.message, outcome, true );
					$( '.ai1ec-alerts', $form ).append( $alert );
					$( '.ai1ec-nonce-fields', $form ).html( data.nonce );
					if ( 'success' === outcome ) {
						$( '#ai1ec_calendar_url, #ai1ec_submitter_email', $form ).val( '' );
						$( '#ai1ec_categories', $form ).select2( "val", "" );
					}
				}
			} );
		}
	};

	return {
		handle_form_submission : handle_form_submission,
		init_form              : init_form,
		init_recaptcha         : init_recaptcha
	};

} );

timely.define('external_libs/jquery.debouncedresize',
	[
		"jquery_timely"
	],
	function( $ ) {
	/*
	 * debouncedresize: special jQuery event that happens once after a window resize
	 *
	 * latest version and complete README available on Github:
	 * https://github.com/louisremi/jquery-smartresize
	 *
	 * Copyright 2012 @louis_remi
	 * Licensed under the MIT license.
	 *
	 * This saved you an hour of work?
	 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
	 */
	var $event = $.event,
	    $special,
	    resizeTimeout;

	$special = $event.special.debouncedresize = {
		setup: function() {
			$( this ).on( "resize", $special.handler );
		},
		teardown: function() {
			$( this ).off( "resize", $special.handler );
		},
		handler: function( event, execAsap ) {
			// Save the context
			var context = this,
				args = arguments,
				dispatch = function() {
					// set correct event type
					event.type = "debouncedresize";
					$event.dispatch.apply( context, args );
				};

			if ( resizeTimeout ) {
				clearTimeout( resizeTimeout );
			}

			execAsap ?
				dispatch() :
				resizeTimeout = setTimeout( dispatch, $special.threshold );
		},
		threshold: 150
	};

} );

timely.define('external_libs/bootstrap_transition', ["jquery_timely"],
		function( $ ) {

	   // jshint ;_;

	  /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
	   * ======================================================= */

	  $(function () {

	    $.support.transition = (function () {

	      var transitionEnd = (function () {

	        var el = document.createElement('bootstrap')
	          , transEndEventNames = {
	               'WebkitTransition' : 'webkitTransitionEnd'
	            ,  'MozTransition'    : 'transitionend'
	            ,  'OTransition'      : 'oTransitionEnd otransitionend'
	            ,  'transition'       : 'transitionend'
	            }
	          , name

	        for (name in transEndEventNames){
	          if (el.style[name] !== undefined) {
	            return transEndEventNames[name]
	          }
	        }

	      }())

	      return transitionEnd && {
	        end: transitionEnd
	      }

	    })()

	  })

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

timely.define('scripts/calendar',
	[
		"jquery_timely",
		"domReady",
		"scripts/calendar/load_views",
		"scripts/calendar/print",
		"scripts/calendar/agenda_view",
		"scripts/calendar/posterboard_view",
		"scripts/calendar/month_view",
		"scripts/calendar/submit_ics_modal",
		"ai1ec_calendar",
		"ai1ec_config",
		"scripts/common_scripts/frontend/common_frontend",
		"libs/utils",
		"libs/select2_multiselect_helper",
		"external_libs/jquery.debouncedresize",
		"external_libs/bootstrap_transition",
		"libs/modal_helper",
		"external_libs/jquery.scrollTo"
	],
	function( $, domReady, load_views, print, agenda_view, posterboard_view,
		month_view, submit_ics_modal, ai1ec_calendar, ai1ec_config, common_frontend,
		AI1EC_UTILS, select2_multiselect_helper ) {
	 // jshint ;_;

	var create_event_form;
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
				$title.text( ai1ec_calendar.title ); // Do it this way to automatically generate HTML entities
			}
			var $calendar = $( '#ai1ec-container' )
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
	 * Initialize Create Your Event modal dialog.
	 */
	var init_create_event_modal = function() {
		var $modal = $( '#ai1ec-create-event-modal' );
		// move the modal to be a child of the body
		$timely = $( '<div class="timely" />' );
		$modal.appendTo( $timely );
		$timely.appendTo( 'body' );
		$modal
			.modal( { show: false } )
			// Execute initialization only once.
			.one( 'show', function() {
				// Load the form body via AJAX.
				$( '.ai1ec-ajax-placeholder', this ).load(
					ai1ec_config.ajax_url + '?action=ai1ec_front_end_create_event_form',
					function() {
						// Hide spinner.
						$( '> .ai1ec-loading', $modal ).removeClass( 'show' );
						// Start up requirejs when form body is loaded.
						timely.require( [ 'scripts/front_end_create_event_form' ],
							function( page ) {
								create_event_form = page;
								page.start();
						} );
				} );
			} )
			.on( 'show', function() {
				// the first time the object is not present.
				if( typeof create_event_form !== 'undefined' ) {
					create_event_form.init_recaptcha();
				}
			} )
			.on( 'hidden', function( e ) {
				// Take off classes so that it reinitializes correctly.
				$( '.ai1ec-recaptcha', this ).removeClass(
					'ai1ec-initializing ai1ec-initialized'
				);
				// remove the backdrop since firefox has problems with transitionend
				$( '.ai1ec-modal-backdrop' ).remove();
				Recaptcha.destroy();
			} );

		// Stop bubbling of collapsibles within modal, else they interfere with
		// above events.
		$modal.on( 'show hidden', '.collapse', function( e ) {
			e.stopPropagation();
		} );
	};

	/**
	 * Initialize Add Your Calendar modal.
	 */
	var init_submit_ics_modal = function() {
		var $modal = $( '#ai1ec-submit-ics-modal' );
		// move the modal to be a child of the body
		$timely = $( '<div class="timely" />' );
		$modal.appendTo( $timely );
		$timely.appendTo( 'body' );
		$modal
			.modal( { show: false } )
			.one( 'show', function() {
				submit_ics_modal.init_form();
			} )
			.on( 'show', function() {
				submit_ics_modal.init_recaptcha();
			} )
			.on( 'hidden', function() {
				// Take off classes so that it reinitializes correctly.
				$( '.ai1ec-recaptcha', this ).removeClass(
					'ai1ec-initializing ai1ec-initialized'
				);
				// remove the backdrop since firefox has problems with transitionend
				$( '.ai1ec-modal-backdrop' ).remove();
				Recaptcha.destroy();
			} );

		// Stop bubbling of collapsibles within modal, else they interfere with
		// above events.
		$modal.on( 'show hidden', '.collapse', function( e ) {
			e.stopPropagation();
		} );
	};

	/**
	 * Event handler for multiday events. When being hovered, add hover class
	 * to its clones.
	 */
	var handle_multiday_enter = function() {
		var id = $( this ).data( 'instanceId' );
		$( '.ai1ec-event-instance-id-' + id ).addClass( 'ai1ec-hover' );
	};

	/**
	 * Event handler for multiday events. When leaving hover, remove hover class
	 * from its clones.
	 */
	var handle_multiday_leave = function() {
		var id = $( this ).data( 'instanceId' );
		$( '.ai1ec-event-instance-id-' + id ).removeClass( 'ai1ec-hover' );
	};

	/**
	 * Event handler for events in week/day view. Issue a delayed raising effect
	 * on this event and all its multiday clones.
	 */
	var handle_raise_enter = function() {
		var $this = $( this ),
				id = $this.data( 'instanceId' );
		$this.delay( 500 ).queue( function() {
			$( '.ai1ec-event-instance-id-' + id ).addClass( 'ai1ec-raised' );
		} );
	};

	/**
	 * Event handler for events in week/day view. Cancel raising effect on this
	 * event and all its multiday clones.
	 */
	var handle_raise_leave = function( e ) {
		var $this = $( this ),
				id = $this.data( 'instanceId' ),
				$target = $( e.toElement || e.relatedTarget );
		// Don't cancel the effect if moving onto a clone of the same instance.
		if ( $target.is( '.ai1ec-event-instance-id-' + id ) ||
				 $target.parent().is( '.ai1ec-event-instance-id-' + id ) ) {
			return;
		}
		$( '.ai1ec-event-instance-id-' + id )
			.clearQueue()
			.removeClass( 'ai1ec-raised' );
	};

	/**
	 * General calendar page initialization.
	 */
	var init = function() {
		// Do the replacement of the calendar and create title if not present
		css_selector_replacement();

		// Initialize Post Your Event modal.
		init_create_event_modal();
		// Initialize Add Your Calendar modal.
		init_submit_ics_modal();
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
		$( document ).on( 'click', '.ai1ec-agenda-view .ai1ec-event-header', agenda_view.toggle_event );

		// Register click handlers for expand/collapse all buttons
		$( document ).on( 'click', '#ai1ec-agenda-expand-all', agenda_view.expand_all );
		$( document ).on( 'click', '#ai1ec-agenda-collapse-all', agenda_view.collapse_all );

		// =======================================
		// = Posterboard view masonry.js events  =
		// =======================================
		// Trigger resize events no faster than 250 ms.
		$.event.special.debouncedresize.threshold = 400;
		// Trigger masonry update on window resize
		$( window ).on( 'debouncedresize', posterboard_view.resize_masonry );

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
		$( document ).on( 'changeDate', '.ai1ec-minical-trigger',
			load_views.handle_minical_change_date
		);

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
				// Hide the button (no longer serves a purpose).
				$( this ).fadeOut();
				// check if it's oneday or week view
				var $oneday_original = $( '.ai1ec-oneday-view-original' );
				var $actual_table   = $( '.ai1ec-week-view-original' );
				if ( $actual_table.length === 0 ) {
					$actual_table = $oneday_original;
				}
				// Scroll window down the same amount that the upper portion of the
				// table is being revealed.
				var vertical_offset =
					$( '.tablescroll_wrapper' ).offset().top -
					$actual_table.offset().top;
				$( window ).scrollTo( '+=' + vertical_offset + 'px', 400 );
				// At the same time, expand height to reveal 1 full day (24 hours).
				var height = 24 * 60;
				$( '.tablescroll_wrapper' ).animate( { height: height + 'px' } );
			}

		);

		$( document ).on( 'submit',     '.ai1ec-submit-ics-form',
			submit_ics_modal.handle_form_submission
		);


		// Handle click on save view
		$( document ).on( 'click', '#save_filtered_views:not(.active)',
			load_views.save_current_filter
		);

		// Handle click on remove saved view
		$( document ).on( 'click', '#save_filtered_views.active',
			load_views.remove_current_filter
		);

		// Bind to statechange event.
		History.Adapter.bind( window, 'statechange', load_views.handle_state_change );

	};

	var initialize_select2 = function() {
		select2_multiselect_helper.init( $( '.ai1ec-select2-filters' ) );
		$( document ).on( 
			'change', 
			'.ai1ec-select2-multiselect-selector',
			load_views.load_view_from_select2_filter
		);
	};

	/**
	 * Start calendar page.
	 */
	var start = function() {
		domReady( function() {
			init();
			if( ai1ec_config.use_select2 ) {
				initialize_select2();
			}

			attach_event_handlers();
			// Initialize the calendar view for the first time.
			load_views.initialize_view();
		} );
	};
	return {
		start : start
	};
} );

timely.require(
		[ "scripts/calendar" ],
		function( page ) {
		 // jshint ;_;
			page.start();
		}
);
timely.define("pages/calendar", function(){});
