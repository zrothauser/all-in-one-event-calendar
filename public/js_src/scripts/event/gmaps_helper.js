define(
		[
		 'jquery_timely'
		 ],
		 function( $ ) {
	'use strict'; // jshint ;_;
	var init_gmaps = function() {
		var
			lat_lng       = $( '#ai1ec-gmap-address' )[0].value.split( ',' ),
			lat           = parseFloat( lat_lng[0] ),
			lng           = parseFloat( lat_lng[1] ),
			gmaps_lat_lng = new google.maps.LatLng( lat, lng ),
			options = {
				zoom        : 14,
				mapTypeId   : google.maps.MapTypeId.ROADMAP,
				scrollwheel : false
			},
			map           = new google.maps.Map( $( '#ai1ec-gmap-canvas' )[0], options ),
			marker        = new google.maps.Marker( { map: map } ),
			geocoder      = new google.maps.Geocoder();

		if ( lat && lng && gmaps_lat_lng ) {
			map.setCenter( gmaps_lat_lng );
			marker.setPosition( gmaps_lat_lng );
		} else {
			// If lat and lng were not sucessfully parsed, try searching.
			geocoder.geocode(
				{
					'address': $( '#ai1ec-gmap-address' )[0].value
				},
				function( results, status ) {
					if( status === google.maps.GeocoderStatus.OK ) {
						map.setCenter( results[0].geometry.location );
						marker.setPosition( results[0].geometry.location );
					}
				}
			);
		}
	};
	var handle_show_map_when_clicking_on_placeholder = function() {
		var map_el = $( '.ai1ec-gmap-container-hidden:first' );
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