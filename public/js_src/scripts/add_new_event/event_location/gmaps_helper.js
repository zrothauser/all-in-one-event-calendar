define(
	[
		'jquery_timely',
		'domReady',
		'ai1ec_config',
		'scripts/add_new_event/event_location/input_coordinates_utility_functions',
		'external_libs/jquery.autocomplete_geomod',
		'external_libs/geo_autocomplete'
	],
	function( $, domReady, ai1ec_config, input_utility_functions ) {
	"use strict"; // jshint ;_;

	var
		ai1ec_geocoder,
		ai1ec_default_location,
		ai1ec_myOptions,
		ai1ec_map,
		ai1ec_marker,
		ai1ec_position;

	var
		gmap_event_listener = function( e ) {
			$( '#ai1ec_latitude' ).val( e.latLng.lat() );
			$( '#ai1ec_longitude' ).val( e.latLng.lng() );
			// If the checkbox to input coordinates is not checked, trigger click.
			if( $( '#ai1ec_input_coordinates:checked' ).length === 0 ) {
				$( '#ai1ec_input_coordinates' ).trigger( 'click' );
			}
		},
		set_autocomplete_if_needed = function() {
			if ( ! ai1ec_config.disable_autocompletion ) {
				$( '#ai1ec_address' )
					// Initialize geo_autocomplete plugin
					.geo_autocomplete(
						new google.maps.Geocoder(),
						{
							selectFirst: false,
							minChars: 3,
							cacheLength: 50,
							width: 300,
							scroll: true,
							scrollHeight: 330,
							region: ai1ec_config.region
						}
					)
					.result(
						function( _event, _data ) {
							if( _data ) {
								ai1ec_update_address( _data );
							}
						}
					)
					// Each time user changes address field, reformat field & update map.
					.change(
						function() {
							// Position map based on provided address value
							if( $( this ).val().length > 0 ) {
								var address = $( this ).val();

								ai1ec_geocoder.geocode(
									{
										'address': address,
										'region': ai1ec_config.region
									},
									function( results, status ) {
										if( status === google.maps.GeocoderStatus.OK ) {
											ai1ec_update_address( results[0] );
										}
									}
								);
							}
						}
					);
			}
		},
		/**
		 * Google map setup
		 */
		init_gmaps = function() {
			// If the user is updating an event, initialize the map to the event
			// location, otherwise if the user is creating a new event initialize
			// the map to the whole world
			ai1ec_geocoder = new google.maps.Geocoder();
			//world = map.setCenter(new GLatLng(9.965, -83.327), 1);
			//africa = map.setCenter(new GLatLng(-3, 27), 3);
			//europe = map.setCenter(new GLatLng(47, 19), 3);
			//asia = map.setCenter(new GLatLng(32, 130), 3);
			//south pacific = map.setCenter(new GLatLng(-24, 134), 3);
			//north america = map.setCenter(new GLatLng(50, -114), 3);
			//latin america = map.setCenter(new GLatLng(-20, -70), 3);
			ai1ec_default_location = new google.maps.LatLng( 9.965, -83.327 );
			ai1ec_myOptions = {
				zoom: 0,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				center: ai1ec_default_location
			};
			domReady( function() {
				// This is mainly for testing purpose but it makes sense in any case,
				// start the work only if there is a container
				if ( $( '#ai1ec_map_canvas' ).length > 0 ) {
					// initialize map
					ai1ec_map = new google.maps.Map(
						$( '#ai1ec_map_canvas' ).get(0), ai1ec_myOptions
					);
					// Initialize Marker
					ai1ec_marker = new google.maps.Marker({
						map: ai1ec_map,
						draggable: true
					});
					// When the marker is dropped, update the latitude and longitude
					// fields.
					google.maps.event.addListener(
						ai1ec_marker, 'dragend', gmap_event_listener
					);
					ai1ec_marker.setPosition( ai1ec_default_location );
					// Start the autocompleter if the user decided to use it
					set_autocomplete_if_needed();
					// Set the map location and show / hide the coordinates
					init_coordinates_visibility();
					// Fix bug with Google maps not rendering properly on initial load.
					// http://stackoverflow.com/questions/10006618
					$( 'a[href="#ai1ec-event-location-box"]' ).on( 'click', function() {
						window.setTimeout(
							function() {
								google.maps.event.trigger( ai1ec_map, 'resize' );
								ai1ec_map.setCenter( ai1ec_marker.getPosition() );
							},
							150
						);
					} );
				}
			} );
		},
		/**
		 * Given a location, update the address field with a reformatted version,
		 * update hidden location fields with address data, and center map on
		 * new location.
		 *
		 * @param object result  single result of a Google geocode() call
		 */
		ai1ec_update_address = function( result ) {
			ai1ec_map.setCenter( result.geometry.location );
			ai1ec_map.setZoom( 15 );
			ai1ec_marker.setPosition( result.geometry.location );
			$( '#ai1ec_address' ).val( result.formatted_address );
			$( '#ai1ec_latitude' ).val( result.geometry.location.lat() );
			$( '#ai1ec_longitude' ).val( result.geometry.location.lng() );
			// check the checkbox if not checked, we want to store the lat/lng data
			if ( ! $( '#ai1ec_input_coordinates' ).is( ':checked' ) ) {
				$( '#ai1ec_input_coordinates' ).click();
			}

			var
				street_number = '',
				street_name = '',
				city = '',
				postal_code = 0,
				country = 0,
				province = '',
				country_short;

			for ( var i = 0; i < result.address_components.length; i++ ) {
				switch ( result.address_components[i].types[0] ) {
					case 'street_number':
						street_number = result.address_components[i].long_name;
						break;
					case 'route':
						street_name = result.address_components[i].long_name;
						break;
					case 'locality':
						city = result.address_components[i].long_name;
						break;
					case 'administrative_area_level_1':
						province = result.address_components[i].long_name;
						break;
					case 'postal_code':
						postal_code = result.address_components[i].long_name;
						break;
					case 'country':
						country_short = result.address_components[i].short_name;
						country = result.address_components[i].long_name;
						break;
				}
			}
			// Combine street number with street address
			var address = street_number.length > 0 ? street_number + ' ' : '';
			address += street_name.length > 0 ? street_name : '';
			// Clean up postal code if necessary
			postal_code = postal_code !== 0 ? postal_code : '';

			$( '#ai1ec_city' ).val( city );
			$( '#ai1ec_province' ).val( province );
			$( '#ai1ec_postal_code' ).val( postal_code );
			$( '#ai1ec_country' ).val( country );
			$( '#ai1ec_country_short' ).val( country_short );
		},
		/**
		 * Updates the map taking the coordinates from the input fields
		 */
		ai1ec_update_map_from_coordinates = function() {
			var lat = parseFloat( $( '#ai1ec_latitude' ).val() );
			var lng = parseFloat( $( '#ai1ec_longitude' ).val() );
			var latlng = new google.maps.LatLng( lat, lng );

			ai1ec_map.setCenter( latlng );
			ai1ec_map.setZoom( 15 );
			ai1ec_marker.setPosition( latlng );
		},
		init_coordinates_visibility = function() {
			// If the coordinates checkbox is not checked
			if( $( '#ai1ec_input_coordinates:checked' ).length === 0 ) {
				// Hide the table.
				$( '#ai1ec_table_coordinates' ).hide();
				// Trigger the change event on the address to show the map.
				$( '#ai1ec_address' ).change();
			} else {
				// If the checkbox is checked, show the map using the coordinates.
				ai1ec_update_map_from_coordinates();
			}
		},
		// This allows another function to access the marker (if the marker is set).
		get_marker = function() {
			return ai1ec_marker;
		},
		// This allows another function to access the position (if position is set).
		get_position = function() {
			return ai1ec_position;
		};

	return {
		init_gmaps                        : init_gmaps,
		ai1ec_update_map_from_coordinates : ai1ec_update_map_from_coordinates,
		get_marker                        : get_marker,
		get_position                      : get_position
	};
} );
