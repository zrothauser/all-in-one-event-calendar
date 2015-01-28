
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

timely.define('scripts/event/gmaps_helper',
		[
		 "jquery_timely"
		 ],
		 function( $ ) {
	 // jshint ;_;
	var init_gmaps = function() {
		var options = {
				zoom      : 14,
				mapTypeId : google.maps.MapTypeId.ROADMAP
			};
			var map = new google.maps.Map( document.getElementById( 'ai1ec-gmap-canvas' ), options );
			var marker = new google.maps.Marker( { map: map } );
			var geocoder = new google.maps.Geocoder();

			geocoder.geocode(
				{
					'address': document.getElementById( 'ai1ec-gmap-address' ).value
				},
				function( results, status ) {
					if( status === google.maps.GeocoderStatus.OK ) {
						map.setCenter( results[0].geometry.location );
						marker.setPosition( results[0].geometry.location );
					}
				}
			);
	};
	var handle_show_map_when_clicking_on_placeholder = function() {
		var map_el = $( '.ai1ec-gmap-container-hidden:first');
		// delete placeholder
		$( this ).remove();
		// hide map
		map_el.hide();
		map_el.removeClass( 'ai1ec-gmap-container-hidden' );
		map_el.fadeIn();
	};
	return {
		handle_show_map_when_clicking_on_placeholder : handle_show_map_when_clicking_on_placeholder,
		init_gmaps                                   : init_gmaps
	};
} );
timely.define('scripts/event',
	[
		'jquery_timely',
		'domReady',
		'ai1ec_config',
		'scripts/event/gmaps_helper'
	],
	function( $, domReady, ai1ec_config, gmaps_helper ) {

	 // jshint ;_;

	// Perform all initialization functions required on the page.
	var init = function() {
		if( $( '#ai1ec-gmap-canvas' ).length > 0 ) {
			timely.require( ['libs/gmaps' ], function( gMapsLoader ) {
				gMapsLoader( gmaps_helper.init_gmaps );
			} );
		}
	};

	var attach_event_handlers = function() {
		// handle showing the maps when clicking on the placeholder
		$( '.ai1ec-gmap-placeholder:first' ).click(
			gmaps_helper.handle_show_map_when_clicking_on_placeholder
		);
	};

	var start = function() {
		domReady( function() {
			// Initialize the page.
			// We wait for the DOM to be loaded so we load the map only when able.
			init();
			attach_event_handlers();
			// Trigger execution of any other actions to initialize event details.
			$( document ).trigger( 'event_page_ready.ai1ec' );
		} );
	};

	return {
		start: start
	};
} );

timely.require(
	[ "scripts/event" ],
	function( page ) {
	 // jshint ;_;
		page.start();
	}
);

timely.define("pages/event", function(){});
