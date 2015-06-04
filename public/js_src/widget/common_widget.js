require(
		[
		 'scripts/calendar',
		 'scripts/calendar/load_views',
		 'scripts/event',
		 'scripts/common_scripts/frontend/common_frontend',
		 'domReady',
		 'jquery_timely',
		 'ai1ec_calendar',
		 'ai1ec_config',
		 'libs/utils',
		 'libs/gmaps'
		 ],
function( page, load_views, evt, common, domReady, $, calendar, config, utils ) {
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
					? calendar.full_calendar_url
					: config.site_url
				)
				+ '?ai1ec_js_widget='
				+ data.widget + '&render=true';

			$.each( configurable, function( el, i ) {
				if ( undefined !== data[el] ) {
					url += '&' + el + '=' + data[el];
				}
			} );
			// Load the view specified in hash.
			var view_hash  = location.hash.match( /^#view\|(.+)/ );
			if ( view_hash && data.widget.match( /superwidget/ ) ) {
				url = calendar.full_calendar_url + view_hash[1].replace( /\|/g, '/' );
				history.pushState( null, document.title, location.pathname );
			}
			return url;
		},
		// It can be triggered from a `popstate` event
		// (then additional arguments are specified)
		// or by clicking an event link.
		load_event_through_jsonp = function( e, href, instance_id, event_name ) {
			var
				$this       = $( this ),
				href        = href || $this.attr( 'href' ),
				type        = 'jsonp',
				$timely_div = $this.closest( '.timely' ),
				query       = {
					request_type     : type,
					ai1ec_doing_ajax : true,
					ai1ec            : utils.create_ai1ec_to_send( $timely_div )
				},
				$modal      = $( '#ai1ec-event-modal' ),
				$event      = $this.closest( '.ai1ec-event, .ai1ec-popover' ).length
					? $this.closest( '.ai1ec-event, .ai1ec-popover' ) : $this,
				instance_id = instance_id || $event.attr( 'class' )
					.match( /ai1ec-event-instance-id-(\d+)/ )[1],
				event_name  = event_name || function() {
					var name = href.match( /\/event\/([\w-]+)/ );
					if ( ! name ) {
						name = href.match( /\?ai1ec_event=([\w-]+)&/ );
					}
					return name ? name[1] : undefined;
				},
				eventURL    = '#event|' + event_name() + '|' + instance_id;

			// Show modal with event title
			$modal
				.modal( 'show' )
				.find( '.ai1ec-modal-body' )
					.html( loading_html );

			// Hide popovers
			$( '.ai1ec-popup' ).hide();

			// Change URL.
			if ( location.hash != eventURL ) {
				History.pushState( instance_id, event_name, eventURL );
			}

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
			return false;
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
						+ (
							widget_type.match( /ai1ec(_|-)superwidget/ )
							? ' timely-calendar'
							: ''
						)
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
					}

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

	 	var initial_title = document.title;
		$( document )
			.on( 'click', 'a.ai1ec-load-event', load_event_through_jsonp )
			.on( 'initialize_view.ai1ec', prevent_injection )
			.on( 'hide.bs.modal', '#ai1ec-event-modal', function() {
				if ( location.hash ) {
					history.pushState( null, initial_title, location.pathname );
				}
			} );

		// If hash matches the defined pattern - show the event.
		var load_event_from_hash = function() {
			var
				event_hash = decodeURIComponent( location.hash ),
				view_hash  = event_hash;

			event_hash = event_hash.match( /^#event\|([\w-]+)\|(\d+)/ );
			view_hash  = view_hash.match( /^#view\|(.+)/ );
			if ( event_hash ) {
				var
					event_name  = function() { return event_hash[1]},
					instance_id = event_hash[2];

				if ( calendar.permalinks_structure ) {
					href = config.site_url
						+ 'event/' + event_name()
						+ '/?instance_id=' + instance_id;
				} else {
					href = config.site_url
						+ '?ai1ec_event=' + event_name()
						+ '&instance_id=' +  instance_id;
				}
				load_event_through_jsonp( null, href, instance_id, event_name );
			} else if ( view_hash ) {
			} else {
				$( '#ai1ec-event-modal' ).modal( 'hide' );
			}
		}
		load_event_from_hash();
		History.Adapter.bind( window, 'popstate', function( e ) {
			if ( e.originalEvent ) {
				load_event_from_hash();
			}
		} );
	} );
} );
