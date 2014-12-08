define(
		[
			"jquery_timely",
			"domReady",
			"ai1ec_config",
			"libs/utils",
			"external_libs/bootstrap/tab",
			"external_libs/jquery_cookie"
		],
		function( $, domReady, ai1ec_config, utils ) {

			var handle_set_tab_cookie = function( e ) {
				var active = $( this ).attr( 'href' );
				$.cookie( 'widget_creator_active_tab', active );
			};

			var activate_saved_tab_on_page_load = function( active_tab ) {
				if ( active_tab === null ){
					// Activate the first tab
					$( 'ul.ai1ec-nav a:first' ).tab( 'show' );
				} else {
					// Activate the correct tab
					$( 'ul.ai1ec-nav a[href=' + active_tab + ']' ).tab( 'show' );
				}
			};

			var handle_loaded_widget_event = function( event ) {
				if ( 'ai1ec-widget-loaded' === event.data ) {
					$( '#widget-preview-title' ).html(
						ai1ec_config.widget_creator.preview
					);
				}
			};

			var initial_setup = function() {
				// Handle embedding code for Super Widget.
				var
					$code    = $( '#ai1ec-superwidget-code' ),
					$preview = $( '<iframe />' )
						// Move Preview to the end of the form.
						.appendTo(
							$( '#ai1ec-superwidget-preview' )
								.removeClass( 'ai1ec-hidden' )
						),
					initialized = false,
					generate_code = function() {
						// get the message that requires calendar_page to be set up.
						// we need this for embedding calendar
						var em_code = ai1ec_config.set_calendar_page;
						if( ai1ec_config.calendar_page_id ) {
							// get the active tab
							var $active_tab = $( '.ai1ec-tab-content .ai1ec-active' );
							var widget_id = $active_tab.attr( 'id' );
							// superwidgets still has it's rules
							var superwidget = false;
							if ( 'ai1ec-superwidget' === widget_id ) {
								superwidget = true;
							}
							var url = superwidget ? $code.data( 'url' ) : $code.data( 'widget-url' );
							// get the defaults
							var defaults = ai1ec_config.javascript_widgets;
							// data-widget is unused in the superwidget but does no harm
							em_code = '&lt;script data-widget="' + widget_id +'"';
							// process the selects
							$( 'select', $active_tab ).each( function() {
								var $select = $( this );
								var selected = $select.val();
								if ( selected ) {
									var id = $select.attr( 'id' );
									if ( $select.attr( 'multiple' ) ) {
										selected = selected.join( ',' );
										id = $select.data( 'id' )
									}
									em_code += ' data-' + id + '="' + selected + '"';
								}
							} );
							// process inputs
							$( 'input', $active_tab ).each( function() {
								var $input = $( this );

								var val = $input.val();
								if ( 'checkbox' === $input.attr( 'type' ) ) {
									val = this.checked;
								}
								if ( '' !== val ) {
									var id = $input.attr( 'id' );
									var widget_default = defaults[widget_id];
									// type juggling is bad, but here it works as i don't know types.
									// add the code only if it's not the default
									if ( widget_default[id] != val ) {
										em_code += ' data-' + id + '="' + val + '"';
									}
								}
							} );
							em_code += '&gt;<br>&nbsp;&nbsp;(function(){var d=document,s=d.createElement(\'script\'),<br>'
								+ '&nbsp;&nbsp;i=\'ai1ec-script' + ( superwidget ? '-sw' : '' )
								+ '\';if(d.getElementById(i))return;s.async=1;<br>'
								+ '&nbsp;&nbsp;s.id=i;s.src=\'' + url + '\';<br>'
								+ '&nbsp;&nbsp;d.getElementsByTagName(\'head\')[0].appendChild(s);})();<br>'
								+ '&lt;/script&gt;'
							;
						}

						$code.html( em_code );
						return em_code;
					},
					preview = function() {
						if ( ! initialized ) {
							return;
						}
						$( '#widget-preview-title' ).html(
							ai1ec_config.widget_creator.preview_loading
						);
						var
							iframe = $preview[0],
							txt_code = generate_code();
						// a calendar page is needed for this to work. User must have saved it.
						if( ! ai1ec_config.calendar_page_id ) {
							return;
						}
						// Fetch iframe content window (browser-dependent).
						iframe =
							iframe.contentWindow ?
								iframe.contentWindow :
								iframe.contentDocument.document ?
									iframe.contentDocument.document :
									iframe.contentDocument;

						iframe.document.open();
						iframe.document.write(
							'<!DOCTYPE html><html>' +
								'<head><style type="text/css">' +
									'body { padding: 20px 0; }' + // Padding to prevent tooltip cutoff
								'</style></head>' +
								'<body>' +
									$code.text() +
								'</body>' +
							'</html>'
						);
						iframe.document.close();
					};
				// get the change event when it bubbles up.
				$( '.timely' ).on( 'change', '.ai1ec-form-group', preview );
				$( '.timely' ).on( 'shown.bs.tab', 'a[data-toggle="ai1ec-tab"]', preview );

				// Generate code and preview on page load.
				initialized = true;
				preview();
			};

			domReady( function() {

				utils.activate_saved_tab_on_page_load( $.cookie( 'widget_creator_active_tab' ) );
				utils.init_autoselect();
				window.addEventListener( 'message', handle_loaded_widget_event, false );

				initial_setup();

				// Register event handlers.
				$( document )
					.on( 'click',  'ul.ai1ec-nav a',             handle_set_tab_cookie )
			} );

} )
