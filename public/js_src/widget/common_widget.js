require(
		[
		 'scripts/common_scripts/frontend/common_frontend',
		 'domReady',
		 'jquery_timely',
		 'ai1ec_calendar',
		 'ai1ec_config'
		 ],
		 function( common, domReady, $,calendar, config ) {
			'use strict'; // jshint ;_;
			
			var create_url = function( data ) {
				var configurable = config.javascript_widgets[data.widget];
				var url = config.site_url + '?ai1ec_js_widget=' + data.widget + '&render=true';
				$.each( configurable, function( el, i ) {
					if ( undefined !== data[el] ) {
						url += '&' + el + '=' + data[el];
					}
				} );
				return url;
			};
			domReady( function() {
				common.start();
				var load_event_through_jsonp = function( e ) {
					
					e.preventDefault();
					e.stopImmediatePropagation();
					// Remove popovers
					$( 'div.ai1ec-popover' ).remove();
					var type = 'jsonp';
					var timely_div = $( this ).closest( '.timely' );
					var query = {
							request_type: type,
							ai1ec_doing_ajax : true
					};

					$( '.ai1ec-loading' ).show();
					// Fetch AJAX result
					$.ajax( {
						url : $( this ).attr( 'href' ) ,
						dataType: type,
						data: query,
						method : 'get',
						crossDomain : true,
						success: function( data ) {
							timely_div.html( data.html );
							// neutralize links for categories and tags.
							$( 'a', timely_div ).each( function() {
								$( this ).removeAttr( 'href' );
							} );
							// hide actions
							$( '.ai1ec-actions' ).hide();
							require( ['pages/event'] );

						}
					} );
				};


				
				// If there are multiple divs load multiple widgets.
				$( '.ai1ec-widget-placeholder' ).each( function( i, el ) {
					var $timely = $( '<div />', {
						'class': 'timely'
					} )
						.insertAfter( $( this ) );
					$timely.on( 'click',
						'.ai1ec-load-event',
						load_event_through_jsonp
					);
					var el_data = $( this ).data();
					var url = create_url( el_data );
					var data = {
						ai1ec_doing_ajax : true,
						request_type: 'jsonp'
					};
					$.ajax( {
						url: url,
						dataType: 'jsonp',
						data: data,
						success: function( data ) {
							$timely.html( data.html );
		
						},
						error: function( jqXHR, textStatus, errorThrown ) {
							window.alert( 'An error occurred while retrieving the data.' );
						}
					} );
				} );
	
			} );
		

} );