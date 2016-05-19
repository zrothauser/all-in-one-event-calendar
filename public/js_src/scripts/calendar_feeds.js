define(
	[
		'jquery_timely',
		'domReady',
		'scripts/calendar_feeds/ics/ics_event_handlers',
		'libs/select2_multiselect_helper',
		'libs/tags_select',
		'libs/utils',
		'ai1ec_config',
		'libs/gmaps',
		'external_libs/jquery_cookie',
		'external_libs/bootstrap/tab',
		'external_libs/bootstrap/alert',
		'external_libs/bootstrap/modal',
		'external_libs/bootstrap/button',
		'external_libs/bootstrap/collapse',
		'scripts/add_new_event/event_location/input_coordinates_utility_functions',
		'external_libs/jquery.autocomplete_geomod',
		'external_libs/geo_autocomplete',

	],
	function(
		$,
		domReady,
		ics_event_handlers,
		select2_multiselect_helper,
		tags_select,
		utils,
		ai1ec_config,
		gMapsLoader
	) {

	"use strict"; // jshint ;_;

	/**
	 * Refresh Select2 widgets.
	 */
	var refresh_select2 = function() {
		var $ics_container = $( this.hash );
		select2_multiselect_helper.refresh( $ics_container );
		tags_select.refresh( $ics_container );
	};

	// Function that handles setting the cookie when the tab is clicked
	var handle_set_tab_cookie = function( e ) {
		var active = $( this ).attr( 'href' );
		$.cookie( 'feeds_active_tab', active );
		if ( '#suggested' === active ) {
			maps_init_wrapper();
		}
	};

	var attach_event_handlers = function() {
		var $ics_container = $( '#ai1ec-feeds-after' ),
		    $facebook_container = $( '.ai1ec_submit_wrapper' ),
		    $file_upload_container = $( '.ai1ec_file_upload_tags_categories' );
		select2_multiselect_helper.init( $ics_container );
		tags_select.init( $ics_container );
		select2_multiselect_helper.init( $facebook_container );
		tags_select.init( $facebook_container );
		select2_multiselect_helper.init( $file_upload_container );
		tags_select.init( $file_upload_container );
		// Save the active tab in a cookie on click.
		$( 'ul.ai1ec-nav a' ).on( 'click', handle_set_tab_cookie );
		// Reinitialize Select2 widgets when displayed (required for placement of
		// placeholders).
		$( 'ul.ai1ec-nav a' ).on( 'shown', refresh_select2 );

		// ===========================
		// = ICS feed event handlers =
		// ===========================
		$( 'select[name="cron_freq"]' ).on( 'change', function() {
			$.ajax( {
				url      : ajaxurl,
				type     : 'POST',
				data: {
					action    : 'ai1ec_feeds_page_post',
					cron_freq : this.value
				}
			} );
		} );
		// Handles clicking the buttons in the ICS delete modal.
		$( '#ai1ec-ics-modal' ).on(
			'click', '.remove, .keep', ics_event_handlers.submit_delete_modal
		);
		$( document )
			// Handles submitting a new feed.
			.on( 'click', '#ai1ec_add_new_ics', ics_event_handlers.add_new_feed )
			// Handles opening the modal window for deleting the feeds.
			.on( 'click', '.ai1ec_delete_ics', ics_event_handlers.open_delete_modal )
			// Handles refreshing the feed's events.
			.on( 'click', '.ai1ec_update_ics', ics_event_handlers.update_feed )
			// Edit feed.
			.on( 'click', '.ai1ec_edit_ics' , ics_event_handlers.edit_feed )
			// Cancel editing feed.
			.on( 'click', '#ai1ec_cancel_ics' , ics_event_handlers.edit_cancel )
			.on( 'click', '.ai1ec-panel-heading > a' , ics_event_handlers.edit_cancel )
			// Checks import timezone option
			.on( 'blur', '#ai1ec_feed_url', ics_event_handlers.feed_url_change );
			
		$( document ).on( 'click', '.ai1ec-suggested-import-event', function() {
			var
				$this      = $( this ),
				$container = $this.closest( '.ai1ec-suggested-event-import' ),
				event      = $.parseJSON(
					$this.closest( '.ai1ec-infowindow, tr' ).attr( 'data-event' )
				);
				
			$( 'a.ai1ec-suggested-processing', $container ).removeClass( 'ai1ec-hidden' );
			$this.addClass( 'ai1ec-hidden' );
			$.ajax( {
				url      : ai1ec_config.ajax_url,
				type     : 'POST',
				data     : {
					action         : 'ai1ec_import_suggested_event',
					ai1ec_feed_url : event.url,
					ai1ec_feed_id  : event.feed_id,
					ai1ec_event_id : event.id
				},
				success  : function( response ) {
					$( 'a.ai1ec-suggested-processing', $container ).addClass( 'ai1ec-hidden' );
					$( 'a.ai1ec-suggested-remove-event', $container ).removeClass( 'ai1ec-hidden' );
				}
			} );

			return false;
		} );
		
		$( document ).on( 'click', '.ai1ec-suggested-remove-event', function() {
			var
				$this      = $( this ),
				$container = $this.closest( '.ai1ec-suggested-event-import, .ai1ec-myfeeds-event' ),
				$event     = $this.closest( '.ai1ec-infowindow, tr' ),
				$my_feeds  = $this.closest( '.ai1ec-myfeeds-event' ),
				event      = $event.length ? $.parseJSON( $event.attr( 'data-event' ) ) : null,
				event_id   = event ? event.id : $my_feeds.attr( 'data-event-id' ),
				feed_id    = event ? event.feed_id : $my_feeds.attr( 'data-feed-id' );

			$( 'a.ai1ec-suggested-removing', $container ).removeClass( 'ai1ec-hidden' );
			$this.addClass( 'ai1ec-hidden' );
			$my_feeds.addClass( 'ai1ec-myfeeds-removing' );
			$.ajax( {
				url      : ai1ec_config.ajax_url,
				type     : 'POST',
				data     : {
					action         : 'ai1ec_remove_suggested_event',
					ai1ec_event_id : event_id,
					ai1ec_feed_id  : feed_id,
					ai1ec_delete   : true
				},
				success  : function( response ) {
					$( 'a.ai1ec-suggested-removing', $container ).addClass( 'ai1ec-hidden' );
					$( 'a.ai1ec-suggested-import-event', $container ).removeClass( 'ai1ec-hidden' );
					if ( $my_feeds.length && ! $my_feeds.closest( '.ai1ec-feed-category' ).find( '.ai1ec-myfeeds-event' ).not( '.ai1ec-myfeeds-removing' ).length ) {
						$my_feeds.closest( '.ai1ec-feed-container' ).remove();
					}
					$my_feeds.remove();
				}
			} );

			return false;
		} );

		$( document ).on( 'click',  '.ai1ec-suggested-view-selector > a', function() {
			var
				$this      = $( this ),
				$selectors = $this.parent(),
				view       = $this.attr( 'data-ai1ec-view' );

			$( '#suggested' ).removeClass( function ( i, v ) {
				return ( v.match ( /(^|\s)ai1ec-feeds-\S+/g ) || [] ).join( ' ' );
			} ).addClass( 'ai1ec-feeds-' + view );

			$selectors.find( 'a.ai1ec-active' ).removeClass( 'ai1ec-active' );
			$this.addClass( 'ai1ec-active' ).blur();
			
			$( '[data-ai1ec-show]' ).hide()
				.filter( '[data-ai1ec-show~="' + view + '"]' ).show();	
			
			if ( 'list' !== view ) {
				gMapsLoader( init_gmaps );
			}
			return false;
		} );

		$( document ).on( 'click', 'a.ai1ec-suggested-title', function() {
			var
				$this = $( this ),
				$tr   = $this.closest( 'tr' ),
				event = $.parseJSON( $tr.attr( 'data-event' ) );

			if ( $tr.hasClass( 'ai1ec-suggested-hover' ) ) {
				$( '#ai1ec_events_map_canvas' ).removeClass( 'goes-left' );
				$tr.removeClass( 'ai1ec-suggested-hover' );
			} else {
				$( '.ai1ec-suggested-hover' ).removeClass( 'ai1ec-suggested-hover' );
				$tr.addClass( 'ai1ec-suggested-hover' );
				$( '#ai1ec_events_map_canvas' ).addClass( 'goes-left' );
				
				var $details = $( '#ai1ec_events_extra_details' ).html( '' );
				if ( event.image_url ) {
					$details.append(
						$( '<img />', {
							src : event.image_url,
							alt : ''
						} )
					)
				}

				$details
					.append( $(
						'<a href="#" class="ai1ec-btn ai1ec-btn-primary ai1ec-btn-sm \
						ai1ec-open-event" target="_blank">\
						<i class="ai1ec-fa ai1ec-fa-external-link ai1ec-fa-xs ai1ec-fa-fw"></i>\
						Open</a>'
					) )
					.append( $( '<div class="ai1ec-extra-title"></div>' )
						.text( event.title ) )
					.append( $( '<div class="ai1ec-extra-date"></div>' )
						.text( event.dtstart ) )
					.append( $( '<div class="ai1ec-extra-venue"></div>' )
						.text( event.venue_name ) )
					.append( $( '<div class="ai1ec-extra-location"></div>' )
						.text( event.location ) )
					.append( $( '<div class="ai1ec-extra-description"></div>' )
						.text( $( '<div />' ).html( event.description ).text() ) );
			}
			$this.blur();
			return false;	
		} );
		
		$( document ).on( 'click', '.ai1ec-feeds-list-container a.page-numbers',  function() {
			var page = this.href.match( /pagenum=(\d+)/ );
			if ( page && 1 < page.length ) {
				page = page[1];
				$( '.ai1ec-suggested-events' ).addClass( 'ai1ec-feeds-loading' );
				perform_search( { page : page } );
			}

			return false;
		} );
		
		$( '#ai1ec_suggested_search' ).on( 'click', function() {
			$( '#ai1ec_events_map_canvas' ).removeClass( 'goes-left' );
			$( 'tr.ai1ec-suggested-hover a.ai1ec-suggested-title' ).click();
			perform_search();
			return false;
		} );
		$( '#ai1ec_suggested_term' ).on( 'keydown change', function() {
			$( this ).removeClass( 'ai1ec-error' );
		} );


	};
	
	// Init Events map
	var events_map, markers = [], update_events;
	var init_gmaps = function( search_query ) {
		var
			map_options   = {
				mapTypeId      : google.maps.MapTypeId.ROADMAP,
				mapTypeControl : true,
				zoomControl    : true,
				scaleControl   : true
			},
			timeout       = null,
			update_xhr    = null,
			buttons       = $( '.ai1ec-suggested-events-actions-template' ).html(),
			infowindow    = new google.maps.InfoWindow({
				maxWidth: 260
			} ),
			create_info   = function( event ) {
				var s = '<div class="ai1ec-infowindow" data-event-id="'
					+ event.id +  '"><div class="ai1ec-infowindow-title"><b>'
					+ event.title + '</b></div>'
					+ event.dtstart.substr( 0, 10 )
					+ ' @ ' + event.venue_name
					+ '<br>' + buttons + '</div>';

				infowindow.setContent( s );
			},
			zoom          = ! search_query;
			
		update_events = function() {
			var old_markers_ids = [];
			for ( var i = 0; i < markers.length; i++ ) {
				if ( ! $( 'tr[data-event-id="' + markers[i].event_id + '"]' ).length ) {
					markers[i].setMap( null );
					markers[i] = null;
				} else {
					old_markers_ids.push( markers[i].event_id );
				}
			}
			$( 'tr.ai1ec-suggested-event' ).each( function() {
				var
					$this = $( this ),
					event = $.parseJSON( $this.attr( 'data-event' ) );
				
				if ( ! event || ! event.latitude || ! event.longitude ) return;
				if ( -1 != $.inArray( old_markers_ids, event.id) ) return;
				
				var marker = new google.maps.Marker( {
					map      : events_map,
					title    : event.title,
					position : new google.maps.LatLng( event.latitude , event.longitude )
				} );
	
				marker.event_id = event.id;
				marker.addListener( 'click', function() {
					create_info( event );
					infowindow.open( events_map, this );
			 	} );
			 	marker.addListener( 'mouseover', function() {
					$( 'tr[data-event-id="' + this.event_id + '"]' )
						.addClass( 'ai1ec-suggested-hover' )
			 	} );
			 	marker.addListener( 'mouseout', function() {
					$( 'tr[data-event-id="' + this.event_id + '"]' )
						.removeClass( 'ai1ec-suggested-hover' )
			 	} );
				
				markers.push( marker );
			} );
			markers = markers.filter( function( v ) { return v !== null } );
		};
		
		if ( search_query ) {
			events_map = new google.maps.Map(
				$( '#ai1ec_events_map_canvas' ).get( 0 ), map_options
			);
		}
		
		update_events();
		update_maps( search_query );

		var load_events = function( e, z ) {
			if ( 'zoom_changed' === e && ! z ) {
				zoom = true;
				return false;
			}
			clearTimeout( timeout );
			if( update_xhr && 4 != update_xhr.readystate ){
				update_xhr.abort();
				update_xhr = null;
				$( '.ai1ec-suggested-events' ).removeClass( 'ai1ec-feeds-loading' );
			}
			timeout = setTimeout( function() {
				var
					center = events_map.getCenter(),
					lat    = center.lat(),
					lng    = center.lng(),
					bounds = events_map.getBounds();

				$( '.ai1ec-suggested-events' ).addClass( 'ai1ec-feeds-loading' );
				update_xhr = perform_search(
					{
						lat    : lat,
						lng    : lng,
						radius : get_radius(
							lat,
							lng,
							bounds.getNorthEast().lat(),
							bounds.getNorthEast().lng(),
							bounds.getSouthWest().lat(),
							bounds.getSouthWest().lng()
						)
					},  
					update_events,
					e
				);

			}, 1000 );
		};

		if ( search_query ) {
			events_map.addListener(
				'dragend',
				function(){
					load_events( 'dragend', true );
				}, false
			);
			events_map.addListener(
				'zoom_changed',
				function(){
					load_events( 'zoom_changed', zoom );
				}, false
			);
		}
		
	};

	// Redraw the map and fit markers in the visible area.
	var update_maps = function( search_query ) {
		if ( ! markers.length || ! search_query ) {
			return;
		} 
		var
			bounds = new google.maps.LatLngBounds(),
			lat    = parseFloat( $( '#ai1ec_suggested_lat' ).val() ),
			lng    = parseFloat( $( '#ai1ec_suggested_lng' ).val() ),
			radius = parseFloat( $( '#ai1ec_suggested_radius' ).val() );

		for ( var i = 0; i < markers.length; i++ ) {
			bounds.extend( markers[i].getPosition() );
		}
		events_map.fitBounds( bounds );		
		new google.maps.Circle( {
			center: new google.maps.LatLng( lat, lng ),
			fillOpacity   : 0.05,
			strokeOpacity : 0.3,
			strokeWeight  : 1,
			map           : events_map,
			radius        : radius * 1000
		} );
	}
	
	var perform_search = function( options, callback ) {
		$( '#ai1ec_suggested_term' ).removeClass( 'ai1ec-error' );
		options = $.extend(
			{
				action   : 'ai1ec_search_events',
				term     : $.trim( $( '#ai1ec_suggested_term' ).val() ),
				location : $.trim( $( '#ai1ec_suggested_location' ).val() ),
				lat      : $( '#ai1ec_suggested_lat' ).val(),
				lng      : $( '#ai1ec_suggested_lng' ).val(),
				radius   : $( '#ai1ec_suggested_radius' ).val()
			},
			options
		);
		
		return $.ajax( {
			url      : ai1ec_config.ajax_url,
			type     : 'POST',
			data     : options,
			success  : function( response ) {
				response = $.parseJSON( response );
				if ( ! response ) return;
				
				if ( response.total ) {
					$( '#suggested' ).addClass( 'ai1ec-has-map' );
					$( '.ai1ec-suggested-results' ).show();
					$( '.ai1ec-suggested-no-results' ).hide();
					$( '.ai1ec-feeds-list-container' ).html( response.list );
					$( '.ai1ec-suggested-results-found').text( response.total );
					gMapsLoader( function(){ init_gmaps( ! ( options && callback ) );} );
					$( '.ai1ec-feeds-list-container tr.ai1ec-suggested-event' ).each( function() {
						var
							$this = $( this ),
							event = $.parseJSON( $this.attr( 'data-event' ) );
						
						for ( var i = 0; i < response.imported.length; i++ ) {
							if (
								response.imported[i].feed_id == event.feed_id &&
								-1 !== $.inArray(
									event.id,
									response.imported[i].feed_events_uids.split( ',' )
								)
							) {
								$( '.ai1ec-suggested-remove-event', $this ).removeClass( 'ai1ec-hidden' );
								$( '.ai1ec-suggested-import-event', $this ).addClass( 'ai1ec-hidden' );
								break;
							}
						}
					} );
				} else {
					$( '#suggested' ).removeClass( 'ai1ec-has-map' );
					$( '.ai1ec-suggested-results' ).hide();
					$( '.ai1ec-suggested-no-results' ).show();
					$( '.ai1ec-feeds-list-container' ).html( '' );
				}
				if ( callback ) {
					callback.apply();
				}
			}
		} );
	};
	
	var maps_init_wrapper = function() {
		setTimeout( function() {
			gMapsLoader( init_gmaps );
		}, 0 );
	};
	
	var init_geocoder = function() {
		var
			$location = $( '#ai1ec_suggested_location' ),
			$radius   = $( '#ai1ec_suggested_radius' ),
			$lat      = $( '#ai1ec_suggested_lat' ),
			$lng      = $( '#ai1ec_suggested_lng' ),
			empty_location = function() {
				$radius.val( '' );
				$lat.val( '' );
				$lng.val( '' );
			};

		$( '#ai1ec_suggested_location' )
		.on( 'change', function(){
			empty_location();
		} )
		.geo_autocomplete(
			new google.maps.Geocoder(),
			{
				selectFirst  : true,
				minChars     : 2,
				cacheLength  : 100,
				width        : 400,
				scroll       : true,
				scrollHeight : 500,
				autoFill     : true
			}
		)
		.result(
			function( _event, _data ) {
				if( _data && _data.geometry && _data.formatted_address ) {
					var
						address     = _data.formatted_address,	
						lat         = _data.geometry.location.lat(),
						lng         = _data.geometry.location.lng(),
						viewport    = _data.geometry.viewport;

					$location.val( address );
					$radius.val(
						get_radius(
							lat,
							lng,
							viewport.getNorthEast().lat(),
							viewport.getNorthEast().lng(),
							viewport.getSouthWest().lat(),
							viewport.getSouthWest().lng()
						)
					);
					$lat.val( lat );
					$lng.val( lng );
				} else {
					empty_location();
				}
			}
		);
	};

	var get_radius = function( lat, lng, lat1, lng1, lat2, lng2 ) {
		var
			lat_dist    = lat1 - lat2,
			lng_dist    = lng1 - lng2,
			// 0.009deg lat = 1km
			lat_dist_km = lat_dist / 0.009,
			// 0.009deg lng / cos(lat) = 1km
			lng_dist_km = lng_dist / 0.009 / Math.cos( lat * Math.PI /180 ),
			max_km      = Math.max( lat_dist_km, lng_dist_km ),
			radius      = max_km / 2;

		return radius;
	};

	var start = function() {
		domReady( function(){
			// Set the active tab
			utils.activate_saved_tab_on_page_load( $.cookie( 'feeds_active_tab' ) );
			// Attach the event handlers
			attach_event_handlers();
			gMapsLoader( init_geocoder );
		} );
	};

	return {
		start: start
	};
} );
