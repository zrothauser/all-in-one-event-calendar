define(
		[
		 "ai1ec_config"
		 ],
		 function( ai1ec_config ) {
	"use strict"; // jshint ;_;

	// Get the language
	var lang = ai1ec_config.language;

	// Get Google Maps API Key
	var api_key = ai1ec_config.google_maps_api_key;

	// Create the url
	var url = 'async!https://maps.googleapis.com/maps/api/js?language=' + lang;
	if ( '' != api_key ) {
		url = url  + '&key=' + api_key;
	}
	// Return a wrapper function so that we have a callback.
	// This is important because we load gMaps async and we don't want to wait for it to load and block other functions
	return function( callback ) {
		// if the map object is already loaded use it, otherwise require it
		if( typeof google === 'object' && typeof google.maps === 'object' ) {
			callback();
		} else {
			timely.require( [ url ], callback );
		}
	};
} );
