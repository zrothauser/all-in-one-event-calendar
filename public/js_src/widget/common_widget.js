require(
		[
		 'scripts/calendar',
		 'scripts/event',
		 'scripts/common_scripts/frontend/common_frontend',
		 'domReady',
		 'jquery_timely',
		 'ai1ec_calendar',
		 'ai1ec_config'
		 ],
		 function( page, evt, common, domReady, $,calendar, config ) {
			'use strict'; // jshint ;_;
			var create_url = function( data ) {
				var configurable = config.javascript_widgets[data.widget];
				if ( !configurable ) {
					return;
				}
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
					var
						href        = $( this ).attr( 'href' );
						type        = 'jsonp',
						$timely_div = $( this ).closest( '.timely' ),
						query       = {
							request_type     : type,
							ai1ec_doing_ajax : true,
							ai1ec            : create_ai1ec_to_send( $timely_div )
						};

					// Show modal with event title
					$( '#ai1ec-event-modal' )
						.modal( 'show' )
						.find( '.ai1ec-modal-body' )
							.html(
								'<h1 class="ai1ec-text-center"><small>\
									<i class="ai1ec-fa ai1ec-fa-lg ai1ec-fa-fw ai1ec-fa-spin\
										ai1ec-fa-spinner"></i> ' +
									config.calendar_loading_event +
								'</small></h1>'
							);

					// Hide popovers
					$( '.ai1ec-popup' ).hide();

					// Fetch AJAX result
					$.ajax( {
						url         : href,
						dataType    : type,
						data        : query,
						method      : 'get',
						crossDomain : true,
						success     : function( data ) {
							// Place event details into modal.
							var $modal = $( '#ai1ec-event-modal' );
							$modal
								.modal( 'show' )
								.find( '.ai1ec-modal-body' )
									.html( data.html );

							// Hide the subscribe buttons.
							$( '.ai1ec-subscribe-container', $modal ).hide();

							// Neutralize links for categories and tags.
							$( 'a.ai1ec-category, a.ai1ec-tag',$modal )
								.each( function() {
									$( this ).removeAttr( 'href' );
								} );
							// Hide actions
							$( '.ai1ec-actions', $modal ).hide();

							// Make calendar links close the modal.
							$( '.ai1ec-calendar-link', $modal )
								.attr( 'data-dismiss', 'ai1ec-modal' );

							// More button.
							$( '.timely-saas-more-button' )
								.off()
								.on( 'click', function() {
									var $desc = $( this ).closest( '.timely-saas-single-description' );
									$desc.html( $desc.find( '.timely-saas-full-description' ).html() );
									return false;
								} );

							// Start event details page.
							timely.require( ['scripts/event'], function( event ) {
								event.start();
							} );
						}
					} );
				};
				var add_value_to_array_if_present_on_el = function( key, params, $el, skip_key ) {
					var camel_key = dashToCamel( key );
					var value = $el.data( camel_key );
					if ( value === undefined ) {
						return params;
					} else {
						if( skip_key ) {
							params.push( value );
						} else {
							params.push( key + '~' + value );
						}
						return params;
					}
				};
				/**
				 * Convert a string to camelcase
				 *
				 */
				var dashToCamel = function( str ) {
					return str.replace(/\W+(.)/g, function (x, chr) {
						return chr.toUpperCase();
					});
				};
				/**
				 * Creates the ai1ec variable to send to the server to filter the calendar
				 *
				 */
				var create_ai1ec_to_send = function( el ) {
					var $el = $( el );
					var params = [];
					params = add_value_to_array_if_present_on_el( 'action', params, $el );
					params = add_value_to_array_if_present_on_el( 'cat_ids', params, $el );
					params = add_value_to_array_if_present_on_el( 'auth_ids', params, $el );
					params = add_value_to_array_if_present_on_el( 'tag_ids', params, $el );
					params = add_value_to_array_if_present_on_el( 'exact_date', params, $el );
					params = add_value_to_array_if_present_on_el( 'display_filters', params, $el );
					params = add_value_to_array_if_present_on_el( 'no_navigation', params, $el );
					params = add_value_to_array_if_present_on_el( 'events_limit', params, $el );
					return params.join( '|' );
				};

				// Create only one shared event details modal for all loaded calendars.
				if ( ! $( '#ai1ec-event-modal' ).length ) {
					$( 'body' ).append(
						'<div id="ai1ec-event-modal" class="timely ai1ec-modal ai1ec-fade"\
							role="dialog" aria-hidden="true" tabindex="-1">\
							<div class="ai1ec-modal-dialog">\
								<div class="ai1ec-modal-content">\
									<button data-dismiss="ai1ec-modal" class="ai1ec-close ai1ec-pull-right">&times;</button>\
									<div class="ai1ec-modal-body ai1ec-clearfix single-ai1ec_event">\
									</div>\
								</div>\
							</div>\
						</div>'
					);
				}
				// If there are multiple divs load multiple widgets.
				// Don't handle SuperWidget containers here.
				$( '[data-widget^="ai1ec"]' ).not( '[data-widget="ai1ec-superwidget"]' )
					.each( function( i, el ) {
						var
							$timely = $( '<div />', {
								'class': 'timely'
							} )
							.html( '<i class="ai1ec-fa ai1ec-fa-spin ai1ec-fa-spinner"></i>' )
							.insertAfter( $( this ) ),
							el_data = $( this ).data(),
							url = create_url( el_data ),
								data = {
								ai1ec_doing_ajax : true,
								request_type: 'jsonp'
							};

						$timely
							.on( 'click', '.ai1ec-cog-item-name a',
								load_event_through_jsonp
							)
						$.ajax( {
							url: url,
							dataType: 'jsonp',
							data: data,
							success: function( data ) {
								$timely.html( data.html );
								top.postMessage( 'ai1ec-widget-loaded', top.document.URL );
								$.each( calendar.extension_urls, function( index, el ) {
									timely.require( [ el.url ] );
								} );
							},
							error: function( jqXHR, textStatus, errorThrown ) {
								window.alert( 'An error occurred while retrieving the data.' );
							}
						} );
					} );

				$( document ).on( 'click', 'a.ai1ec-load-event',
					load_event_through_jsonp
				);
			 } );
		} );
