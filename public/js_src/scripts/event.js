define(
		[
		 "jquery_timely",
		 'domReady',
		 'ai1ec_config',
		 'scripts/event/gmaps_helper',
		 'libs/utils',
		 'external_libs/jquery_cookie',
		 'external_libs/bootstrap_modal',
		 'external_libs/bootstrap_transition',
		 'external_libs/bootstrap_alert',
		 'libs/modal_helper'
		 ],
		 function( $, domReady, ai1ec_config, gmaps_helper, utils ) {
	"use strict"; // jshint ;_;
	var cookie_name = 'ai1ec_event_subscribed';
	$.cookie.json = true;
	// Perform all initialization functions required on the page.
	var init = function() {
		if( $( '#ai1ec-gmap-canvas' ).length > 0 ) {
			require( ['libs/gmaps' ], function( gMapsLoader ) {
				gMapsLoader( gmaps_helper.init_gmaps );
			} );
		}
	};
	var subscribe_to_event = function( e ) {
		e.preventDefault();
		var mail = $( '#ai1ec_email_subscribe' ).val();
		if( ! utils.isValidEmail( mail ) ) {
			window.alert( ai1ec_config.invalid_email_message );
			$( '#ai1ec_email_subscribe' ).focus();
			return;
		}
		var event = $( '.ai1ec_email_container' ).data( 'event_id' );
		var event_instance = $( '.ai1ec_email_container' ).data( 'event_instance' );
		var data = {
			action : 'ai1ec_subscribe_to_event',
			mail : mail,
			event : event,
			event_instance : event_instance
		};
		$.post(
			ai1ec_config.ajax_url,
			data,
			function( data ) {
				var alert = utils.make_alert( data.message, data.type );
				$modal = $( '#ai1ec_subscribe_email_modal' );
				$( '.alerts', $modal ).append( alert );
				if( data.type === 'success' ) {
					var saved_cookie = $.cookie( cookie_name );
					if( undefined === saved_cookie ) {
						saved_cookie = [];
					}
					saved_cookie.push( event_instance );
					// if the user has subscribed, set a cookie to avoid showing the button again
					$.cookie( cookie_name, saved_cookie, { expires : 365 } );
					// remove the button
					$( '.ai1ec-subscribe-mail' ).remove();
				}
				$( '.btn-danger', $modal ).show();
				$( '.btn-primary', $modal ).hide();
				$( '.ai1ec_email_container', $modal ).hide();
			},
			'json'
		);
	};
	var attach_event_handlers = function() {
		$modal = $( '#ai1ec_subscribe_email_modal' );
		// handle showing the maps when clicking on the placeholder
		$( '.ai1ec-gmap-placeholder:first' ).click( gmaps_helper.handle_show_map_when_clicking_on_placeholder );
		$modal
			.modal( { show: false } )
			.on( 'hidden', function() {
				// remove the backdrop since firefox has problems with transitionend
				$( '.ai1ec-modal-backdrop' ).remove();
			} );
		$modal.on( 'click', '.btn-primary', subscribe_to_event );
		$modal.on( 'click', '.btn-danger', function() {
			$modal.modal( 'hide' );
		} );
	};
	var start = function() {
		domReady( function() {
			// Initialize the page.
			// We wait for the DOM to be loaded so we load gMaps only when needed
			init();
			attach_event_handlers();
		} );
	};
	return {
		start: start
	};
} );
