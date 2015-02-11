define(
	[
		"jquery_timely",
		"scripts/add_new_event/event_location/input_coordinates_utility_functions",
		"scripts/add_new_event/event_location/gmaps_helper",
		"ai1ec_config"
	],
	function( $, input_utility_functions, gmaps_helper, ai1ec_config ) {
	"use strict"; // jshint ;_;

	// Toggle the visibility of google map on checkbox click
	var toggle_visibility_of_google_map_on_click = function( e ) {
		if ( this.checked ) {
			$( '.ai1ec-map-preview' ).addClass( 'ai1ec-map-visible');
		} else {
			$( '.ai1ec-map-preview' ).removeClass( 'ai1ec-map-visible' );
		}
	};

	// Hide / Show the coordinates table when clicking the checkbox
	var toggle_visibility_of_coordinate_fields_on_click = function( e ) {
		// If the checkbox is checked
		if ( this.checked ) {
			$( '#ai1ec_table_coordinates' ).fadeIn( 'fast' );
		} else {
			$( '#ai1ec_table_coordinates' ).fadeOut( 'fast' );
		}
	};

	var update_map_from_coordinates_on_blur = function( e ) {
		// Convert commas to dots
		input_utility_functions.ai1ec_convert_commas_to_dots_for_coordinates();
		// Check if the coordinates are valid.
		var valid = input_utility_functions.ai1ec_check_lat_long_ok_for_search( e );
		// If they are valid, update the map.
		if ( valid === true ) {
			gmaps_helper.ai1ec_update_map_from_coordinates();
		}
	};

	return {
		"toggle_visibility_of_google_map_on_click"        : toggle_visibility_of_google_map_on_click,
		"toggle_visibility_of_coordinate_fields_on_click" : toggle_visibility_of_coordinate_fields_on_click,
		"update_map_from_coordinates_on_blur"             : update_map_from_coordinates_on_blur
	};
} );
