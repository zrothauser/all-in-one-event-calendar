define(
	[
		'jquery_timely',
		'domReady',
		'scripts/setting/cache/cache_event_handlers'
	],
	function(
		$,
		domReady,
		cache_event_handlers
	) {

	"use strict"; // jshint ;_;

	var attach_event_handlers = function() {
		$( document )
				.on( 'click', '#ai1ec_cache_rescan', cache_event_handlers.perform_rescan );
	}

	var start = function() {
		domReady( function(){
			// Attach the event handlers
			attach_event_handlers();
		} );
	};

	return {
		start : start
	};
} );
