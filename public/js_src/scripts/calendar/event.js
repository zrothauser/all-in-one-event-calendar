define(
		[
		 'jquery_timely',
		 'libs/utils',
		 'external_libs/jquery.scrollTo'
		],
		function( $, utils ) {
	'use strict'; // jshint ;_;

	var load_event_through_jsonp = function( e ) {
		e.preventDefault();
		// Remove popovers
		$( 'div.ai1ec-popover' ).remove();
		var type = 'jsonp';
		var timely_div = $( this ).closest( '.timely-calendar' );
		var query = {
				request_type: type,
				ai1ec_doing_ajax : true,
				ai1ec : utils.create_ai1ec_to_send( timely_div )
		};

		// Fetch AJAX result
		$.ajax( {
			url : $( this ).attr( 'href' ) ,
			dataType: type,
			data: query,
			method : 'get',
			success: function( data ) {
				// Use the closest container relative to the target
				$( e.target ).closest( '#ai1ec-calendar-view' ).html( data.html );
				// Update the back to calendar button with the
				var href = $( '.ai1ec-calendar-link' ).attr( 'href' );
				var timely_action = $( e.target ).closest( '.timely-calendar' ).data( 'action' );
				if( timely_action ) {
					href = href + 'action~' + timely_action + '/';
				}
				// Scroll to the relative div top to bring the event details into focus.
				$.scrollTo( timely_div, 1000,
					{
						offset: {
							left: 0,
							top: -100
						}
					}
				);

				// Start up requirejs
				require(
						[
						 'pages/event'
						 ] );
			}
		} );
	};

	return {
		load_event_through_jsonp : load_event_through_jsonp
	};
} );
