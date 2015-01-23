require(
		[
		 'scripts/calendar',
		 'scripts/event',
		 'scripts/common_scripts/frontend/common_frontend',
		 'domReady',
		 'jquery_timely',
		 'ai1ec_calendar',
		 'ai1ec_config',
		 'libs/utils',
		 'libs/gmaps'
		 ],
function( page, evt, common, domReady, $,calendar, config, utils ) {
	'use strict'; // jshint ;_;

	// Prevent double initialisation for legacy code snippets.
	if ( window.timely.js_widgets_inited ) {
		return;
	}
	window.timely['js_widgets_inited'] = 1;

	var
		loading_html = '<h2 class="ai1ec-widget-loading ai1ec-text-center"><small>\
			<i class="ai1ec-fa ai1ec-fa-lg ai1ec-fa-fw ai1ec-fa-spin\
				ai1ec-fa-spinner"></i> ' + config.calendar_loading + '</small></h2>',
		fade_out_loading = function( $parent ) {
			$parent.find( '.ai1ec-widget-loading' ).fadeOut(
				'slow',
				function() { $( this ).remove(); }
			);
		},
		create_url = function( data ) {
			var configurable = config.javascript_widgets[data.widget];
			if ( ! configurable ) {
				return false;
			}
			var url = (
					// We serve Calendar widgets from the Calendar page.
					data.widget.match( /superwidget/ )
					? calendar.calendar_url
					: config.site_url
				)
				+ '?ai1ec_js_widget='
				+ data.widget + '&render=true';

			$.each( configurable, function( el, i ) {
				if ( undefined !== data[el] ) {
					url += '&' + el + '=' + data[el];
				}
			} );
			return url;
		},
		load_event_through_jsonp = function( e ) {
			e.preventDefault();
			e.stopImmediatePropagation();
			var
				href        = $( this ).attr( 'href' );
				type        = 'jsonp',
				$timely_div = $( this ).closest( '.timely' ),
				query       = {
					request_type     : type,
					ai1ec_doing_ajax : true,
					ai1ec            : utils.create_ai1ec_to_send( $timely_div )
				},
				$modal      = $( '#ai1ec-event-modal' );

			// Show modal with event title
			$modal
				.modal( 'show' )
				.find( '.ai1ec-modal-body' )
					.html( loading_html );

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
					$modal
						.modal( 'show' )
						.find( '.ai1ec-modal-body' )
							.append( data.html );

					// Hide the subscribe buttons.
					$( '.ai1ec-subscribe-container', $modal ).hide();

					// Neutralize links for categories and tags.
					$( 'a.ai1ec-category, a.ai1ec-tag', $modal )
						.each( function() {
							$( this ).removeAttr( 'href' );
						} );
					// Hide actions
					$( '.ai1ec-actions', $modal ).hide();

					// Make calendar links close the modal.
					$( '.ai1ec-calendar-link', $modal )
						.attr( 'data-dismiss', 'ai1ec-modal' );

					// Start event details page.
					timely.require( ['scripts/event'], function( event ) {
						event.start();
					} );
				},
				complete    : function() { fade_out_loading( $modal ); }
			} );
		},
		prevent_injection = function() {
			$( '.ai1ec-load-view, .ai1ec-clear-filter' )
				.each( function() {
					var
						$this       = $( this ),
						widget_type = $this
							.closest( '.timely-widget' )
								.attr( 'data-widget-type' ),
						href        = $this.attr( 'href' ) || $this.attr( 'data-href' ),
						new_href    = utils.add_query_arg(
							href, ['ai1ec_source', widget_type]
						);

					$this.attr( {
						'href'      : new_href,
						'data-href' : new_href
					} );
				} );
		};

	domReady( function() {
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

		// Load each widget.
		// Create an array of promises ( notice the return ).
		var promises = $( '[data-widget^="ai1ec"]' ).not( '[data-added]' )
			.map( function( i, el ) {
				var
					$el         = $( el ),
					widget_type = $el.data( 'widget' ),
					$timely     = $( '<div />', {
						'class': 'timely timely-widget'
						+ ( 'ai1ec-superwidget' === widget_type ? ' timely-calendar' : '' )
					} )
						.attr( 'data-widget-type', widget_type )
						.html( loading_html )
						.insertAfter( $el ),
					url         = create_url( $el.data() ),
					data        = {
						ai1ec_doing_ajax : true,
						request_type     : 'jsonp',
						ai1ec            : utils.create_ai1ec_to_send( el ),
						ai1ec_source     : widget_type
					};

				// Do not render widget if it's not defined in config.
				if ( false === url ) {
					// Remove block with spinner.
					$el.remove();
					$timely.remove();
					return false;
				}
				$timely
					.on( 'click', '.ai1ec-cog-item-name a', load_event_through_jsonp );

				return $.ajax( {
					url      : url,
					dataType : 'jsonp',
					data     : data,
					success  : function( data ) {
						$timely.append( data.html );
						$el.attr( 'data-added', 1 );
						page.initialize_view( $timely.find( '.ai1ec-calendar' ) );
					},
					error    : function() {
						$timely.append( '<p>An error occurred while retrieving the data.</p>' );
					},
					complete    : function() { fade_out_loading( $timely ); }
				} );
			} ).get();

		// When all the promises have fired their success callbacks, act.
		$.when.apply( $, promises ).done( function() {
			// The common library might be already loaded
			// if we are embedding the calendar
			// in a wordpress page with our plugin installed.

			if ( ! common.are_event_listeners_attached() ) {
				common.start();
			}

			$.each( calendar.extension_urls, function( index, el ) {
				timely.require( [ el.url ] );
			} );

			prevent_injection();
			top.postMessage( 'ai1ec-widget-loaded', top.document.URL );
			$( document )
				.trigger( 'page_ready.ai1ec' )
				// If event hadlers are not inited yet, this flag can be used.
				.data( 'ai1ec-widget-loaded', 1 );
	 	} );

		$( document )
			.on( 'click', 'a.ai1ec-load-event', load_event_through_jsonp )
			.on( 'initialize_view.ai1ec', prevent_injection );
	} );
} );
