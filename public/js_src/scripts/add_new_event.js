define(
	[
		"jquery_timely",
		'domReady',
		"libs/utils",
		'ai1ec_config',
		'scripts/add_new_event/event_location/gmaps_helper',
		'scripts/add_new_event/event_location/input_coordinates_event_handlers',
		'scripts/add_new_event/event_location/input_coordinates_utility_functions',
		'scripts/add_new_event/event_date_time/date_time_event_handlers',
		'scripts/add_new_event/event_cost_helper',
		'external_libs/jquery.calendrical_timespan',
		'external_libs/jquery.inputdate',
		'external_libs/jquery.tools',
		'external_libs/bootstrap_datepicker',
		'external_libs/bootstrap/transition',
		'external_libs/bootstrap/collapse',
		'external_libs/bootstrap/modal',
		'external_libs/bootstrap/alert',
		'external_libs/bootstrap/tab',
		'external_libs/select2'
	],
	function (
		$,
		domReady,
		utils,
		ai1ec_config,
		gmaps_helper,
		input_coordinates_event_handlers,
		input_utility_functions,
		date_time_event_handlers,
		event_cost,
		calendrical_functions
	) {
	"use strict"; // jshint ;_;

	var init_date_time = function() {

		var now = new Date( ai1ec_config.now * 1000 );

		/**
		* Timespan plugin setup
		*/
		// Initialize timespan plugin on our date/time inputs.
		var data = {
			allday           : '#ai1ec_all_day_event',
			start_date_input : '#ai1ec_start-date-input',
			start_time_input : '#ai1ec_start-time-input',
			start_time       : '#ai1ec_start-time',
			end_date_input   : '#ai1ec_end-date-input',
			end_time_input   : '#ai1ec_end-time-input',
			end_time         : '#ai1ec_end-time',
			date_format      : ai1ec_config.date_format,
			month_names      : ai1ec_config.month_names,
			day_names        : ai1ec_config.day_names,
			week_start_day   : ai1ec_config.week_start_day,
			twentyfour_hour  : ai1ec_config.twentyfour_hour,
			now              : now
		};

		$.timespan( data );
	};

	/**
	 * Add a hook into Bootstrap collapse for panels for proper overflow
	 * behaviour when open.
	 */
	var init_collapsibles = function() {
		$( '.ai1ec-panel-collapse' ).on( 'hide', function() {
			$( this ).parent().removeClass( 'ai1ec-overflow-visible' );
		} );
		$( '.ai1ec-panel-collapse' ).on( 'shown', function() {
			var $el = $( this );
			window.setTimeout(
				function() { $el.parent().addClass( 'ai1ec-overflow-visible' ); },
				350
			);
		} );
	};

	/**
	 * Perform all initialization functions required on the page.
	 */
	var init = function() {
		init_date_time();

		// We load gMaps here so that we can start acting on the DOM as soon as possibe.
		// All initialization is done in the callback.
		require( ['libs/gmaps' ], function( gMapsLoader ) {
			gMapsLoader( gmaps_helper.init_gmaps );
		} );
	};

	/**
	 * Present user with error notice and prevent form submission
	 */
	var prevent_form_submission = function( submit_event, notices ) {
		var info_text = null;
		if ( '[object Array]' === Object.prototype.toString.call( notices ) ) {
			info_text = notices.join( '<br>' );
		} else {
			info_text = notices;
		}
		$( '#ai1ec_event_inline_alert' ).html( info_text );
		$( '#ai1ec_event_inline_alert' ).removeClass( 'ai1ec-hidden' );
		submit_event.preventDefault();
		// Just in case, hide the ajax spinner and remove the disabled status
		$( '#publish, #ai1ec_bottom_publish' ).removeClass(
			'button-primary-disabled'
		);
		$( '#publish, #ai1ec_bottom_publish' ).removeClass(
			'disabled'
		);
		$( '#publish, #ai1ec_bottom_publish' ).siblings(
			'#ajax-loading, .spinner'
		).css( 'visibility', 'hidden' );
	};

	/**
	 * Validate the form when clicking Publish/Update.
	 *
	 * @param  object e jQuery event object
	 */
	var validate_form = function( e ) {
		// Validate geolocation coordinates.
		if ( input_utility_functions.ai1ec_check_lat_long_fields_filled_when_publishing_event( e ) === true ) {
			// Convert commas to dots
			input_utility_functions.ai1ec_convert_commas_to_dots_for_coordinates();
			// Check that fields are ok and there are no errors
			input_utility_functions.ai1ec_check_lat_long_ok_for_search( e );
		}

		// Validate URL fields.
		var show_warning = false;
		var warnings     = [];
		$( '#ai1ec_ticket_ext_url, #ai1ec_contact_url' ).each( function () {
			var url = this.value;
			$( this ).removeClass( 'ai1ec-input-warn' );
			var $parent_url = $( this ).closest( '.ai1ec-panel-collapse' ).parent()
				.find( '.ai1ec-panel-heading .ai1ec-fa-warning' );
			if ( ! show_warning ) {
				$parent_url.addClass( 'ai1ec-hidden' ).parent().removeClass( 'ai1ec-tab-title-error' );
			}
			var id                = $( this ).attr( 'id' );
			var requires_protocol = ( 'ai1ec_ticket_ext_url' === id );
			if ( '' !== url && false === utils.isValidUrl( url, requires_protocol ) ) {
				$parent_url.removeClass( 'ai1ec-hidden' ).parent()
					.addClass( 'ai1ec-tab-title-error' );
				if ( ! show_warning ) {
					$( this ).closest( '.ai1ec-panel-collapse' )
						.collapse( 'show' );
				}
				show_warning = true;
				var text = id + '_not_valid';
				warnings.push( ai1ec_config[text] );
				$( this ).addClass( 'ai1ec-input-warn' );
			}
		} );

		var $email_field  = $( '#ai1ec_contact_email' );		
		var $parent_email = $email_field.closest( '.ai1ec-panel-collapse' ).parent()
		 		.find( '.ai1ec-panel-heading .ai1ec-fa-warning' );		
		$email_field.removeClass( 'ai1ec-input-warn' );
		if ( ! show_warning ) {
			$parent_email.addClass( 'ai1ec-hidden' ).parent().removeClass( 'ai1ec-tab-title-error' );
		}
		var email_value  = $.trim( $email_field.val() );		
		if ( '' !== email_value && false === utils.isValidEmail( email_value ) ) {
			$parent_email.removeClass( 'ai1ec-hidden' ).parent()
				.addClass( 'ai1ec-tab-title-error' );
			if ( ! show_warning ) {
				$email_field.closest( '.ai1ec-panel-collapse' )
					.collapse( 'show' );
			}
			show_warning = true;
			var text = $email_field.attr( 'id' ) + '_not_valid';
			warnings.push( ai1ec_config[text] );
			$email_field.addClass( 'ai1ec-input-warn' );
		}

		var $additional_required_fields = $(
			'#title, #ai1ec_contact_name, #ai1ec_contact_email, #ai1ec_contact_phone, #content'
		);
		if ( $( '#ai1ec_has_tickets' ).prop( 'checked' ) ) {
			$additional_required_fields.addClass( 'ai1ec-required' );
			check_form();
			if ( $( '#content' ).hasClass( 'ai1ec-error' ) ) {
				show_hide_description_error( true );
			} else {
				show_hide_description_error( false );	
			}			
			if ( $( '.ai1ec-error' ).not( '.ai1ec-hidden .ai1ec-error' ).length ) {
				show_warning = true;
				$( '#ai1ec-add-new-event-accordion > .ai1ec-panel-default > .ai1ec-panel-collapse' )
					.removeClass( 'ai1ec-collapse' ).css( 'height', 'auto' );

				warnings.push( ai1ec_config.ticketing_required_fields );
			} 
			if ( $( '#ai1ec_repeat' ).prop( 'checked' ) === true ) {
				show_warning = true;
				warnings.push( ai1ec_config.ticketing_repeat_not_supported );
			}						
			if ( false === show_warning ) {
				var i             = 0;
				var tickets_count = 0;
				$( '.ai1ec-tickets-edit-form' )
					.not( '.ai1ec-tickets-form-template' )
					.each( function() {
						var $ticket = $( this );
						var removed = false;
						$ticket.find( '.ai1ec-tickets-fields' ).remove();
						$ticket.find( 'select, input' ).each( function() {
							if ( ! this.name ) {
								return;
							} else if ( 'remove' === this.name ) {
								removed = true;
							}
							var curr_value = this.value;
							if ( 'checkbox' == this.type ) {
					 			if ( true == this.checked ) {
					 				curr_value = 'on';
					 			} else {
					 				curr_value = 'off';
								}
							}					
							$( '<input />', {
								type  : 'hidden',
								name  : 'ai1ec_tickets[' + i + '][' + this.name + ']',
								class : 'ai1ec-tickets-fields',
								value : curr_value
							} ).appendTo( $ticket );
						} );
						if ( ! removed ) {
							tickets_count++;
						}
						i ++;
					} 
				);
				if ( 0 === tickets_count ) {
					show_warning = true;
					warnings.push( ai1ec_config.ticketing_no_tickets_included );
				}
			}
		} else {
			$additional_required_fields.removeClass( 'ai1ec-required' );
		}
		if ( show_warning ) {
			prevent_form_submission( e, warnings );
		} else {
			// Remove the template form.
			$( '.ai1ec-tickets-form-template' ).remove();
			$( '.ai1ec-tickets-edit-form' )
				.find( 'input, select' )
				.not( '.ai1ec-tickets-fields' )
					.prop( 'disabled', true );
		}
	};

	/**
	 * Attach event handlers to add/edit event page.
	 */
	var attach_event_handlers = function() {
		// Toggle the visibility of Google map on checkbox click.
		$( '#ai1ec_google_map' ).click( input_coordinates_event_handlers.toggle_visibility_of_google_map_on_click );
		// Hide / Show the coordinates table when clicking the checkbox.
		$( '#ai1ec_input_coordinates' ).change( input_coordinates_event_handlers.toggle_visibility_of_coordinate_fields_on_click );
		// Validate fields when clicking Publish.
		$( '#post' ).submit( validate_form );
		// On blur, update the map if both coordinates are set.
		$( 'input.ai1ec-coordinates' ).blur( input_coordinates_event_handlers.update_map_from_coordinates_on_blur );

		// If the extra publish button is present, handle its click.
		$( '#ai1ec_bottom_publish' ).on( 'click', date_time_event_handlers.trigger_publish );

		// Recurrence modal event handlers.
		$( document )
			// Show different fields for the "ends" clause in the repeat modal.
			.on( 'change', '#ai1ec_end', date_time_event_handlers.show_end_fields )
			// Handle click on the Apply button of the repeat modal.
			.on( 'click', '#ai1ec_repeat_apply', date_time_event_handlers.handle_click_on_apply_button )
			// Handle click on the cancel button of the repeat modal.
			.on( 'click', '#ai1ec_repeat_cancel', date_time_event_handlers.handle_click_on_cancel_modal )
			// Handle click on monthly repeat radios.
			.on( 'click', '#ai1ec_monthly_type_bymonthday, #ai1ec_monthly_type_byday', date_time_event_handlers.handle_checkbox_monthly_tab_modal )
			// Handle weekday/day/month toggle buttons.
			.on( 'click', '.ai1ec-btn-group-grid a', date_time_event_handlers.handle_click_on_toggle_buttons );
		$( '#ai1ec_repeat_box' ).on( 'hidden.bs.modal', date_time_event_handlers.handle_modal_hide );
		// Attach pseudo handler function. These functions are kind of wrappers
		// around other functions, and may need refactoring someday.
		date_time_event_handlers.execute_pseudo_handlers();

		// Initialize showing/hiding of the exclude dates widget.
		$( '#widgetField > a' ).on( 'click', date_time_event_handlers.handle_animation_of_calendar_widget );

		// Banner image.
		$( document ).on( 'click', '.ai1ec-set-banner-image', set_banner_image );
		$( document ).on( 'click', '.ai1ec-remove-banner', remove_banner_image );

		// Taxes
		$( document).on( 'click', '#ai1ec_tax_options, #ai1ec_update_tax_options', init_tax_options );
	};

	/**
	 * Hijack the Featured Image dialog to adapt it for Banner Image.
	 */
	var set_banner_image = function() {
		var fi = {};
		fi._frame = wp.media({
			state: 'featured-image',
			states: [
				new wp.media.controller.FeaturedImage(),
				new wp.media.controller.EditImage()
			]
		});
		fi._frame.open();
		$( '.media-frame:last ').addClass( 'ai1ec-banner-image-frame' );
		$( '.media-frame-title:last h1' ).text(
			$( '.ai1ec-set-banner-block .ai1ec-set-banner-image' ).text()
		);
		$( '.media-frame-toolbar:last' ).append(
			$( '.ai1ec-media-toolbar' )
				.clone()
				.removeClass( 'ai1ec-media-toolbar ai1ec-hidden' )
		);
		$( '.ai1ec-save-banner-image' ).off().on( 'click', function() {
			var
				src = $( '.attachments:visible li.selected img' ).attr( 'src' ),
				url = $( '.attachment-details:visible input[type=text]' ).val();

			if ( src && url ) {
				$( '#ai1ec_event_banner .inside' )
					.find( '.ai1ec-banner-image-block' )
						.removeClass( 'ai1ec-hidden' )
							.find( 'img' )
								.attr( 'src', src )
								.end()
							.find( 'input' )
								.val( url )
								.end()
							.end()
					.find( '.ai1ec-set-banner-block' )
						.addClass( 'ai1ec-hidden' )
						.end()
					.find( '.ai1ec-remove-banner-block' )
						.removeClass( 'ai1ec-hidden' );
			}
			fi._frame.close();
			return false;
		} );
		return false;
	}

	/**
	 * Remove banner image.
	 */
	var remove_banner_image = function() {
		$( '#ai1ec_event_banner .inside' )
			.find( '.ai1ec-remove-banner-block' )
				.addClass( 'ai1ec-hidden' )
				.end()
			.find( '.ai1ec-banner-image-block' )
				.addClass( 'ai1ec-hidden' )
				.find( 'input' )
					.val( '' )
					.end()
				.find( 'img' )
					.attr( 'src' ,'' )
					.end()
				.end()
			.find( '.ai1ec-set-banner-block' )
				.removeClass( 'ai1ec-hidden' )

		return false;
	}

	/**
	 * Place Event Details meta box below title, rather than below description.
	 */
	var reposition_meta_box = function() {
		$( '#ai1ec_event' )
			.insertAfter( '#ai1ec_event_inline_alert' );
		$( '#post' ).addClass( 'ai1ec-visible' );
	};

	/**
	 * Initialize Select2 for timezones.
	 */
	var init_timezones_select = function() {
		$( '#timezone-select' ).select2();
	}

	/**
	 * Ticketing datepickers.
	 */
	var init_tickets_date_time = function() {
		
		$( '.ai1ec-tickets-datepicker' )
			.not( '.ai1ec-tickets-datepicker-inited' )
			.not( '.ai1ec-tickets-form-template .ai1ec-tickets-datepicker' )
			.each( function() {
				var
					$this      = $( this ),
					$block     = $this.closest( '.ai1ec-tickets-dates-block' ),
					$time      = $( '.ai1ec-tickets-time', $block ),
					$full_date = $( 'input.ai1ec-tickets-full-date', $block ),
					full_time  = $full_date.val();
				
				$this.val( full_time.substr( 0, 10 ) );
				$time.val( full_time.substr( 11, 5 ) );
				$time.on( 'change', function() {
					full_time = $full_date.val();
					$full_date.val( full_time.substr( 0, 10 ) + ' ' + this.value + ':00' );
				} );

				$this
					.addClass( 'ai1ec-tickets-datepicker-inited' )
					.datepicker( { autoclose: true } )
						.on( 'changeDate', function(e) {
							$full_date.val( this.value + ' ' + $time.val() + ':00' );
						} );
					;
			} );

	};

	// Add/edit tickect form validation.
	var check_form = function() {
		$( '.ai1ec-tickets-edit-form' )
			.not( '.ai1ec-tickets-form-template' )
			.not( '.ai1ec-hidden' )					
			.find( 'input[id="ai1ec_ticket_unlimited"]' ).each( function () {
				var $this        = $( this );
				var $parent_form = $this.closest( '.ai1ec-tickets-edit-form' );
				var $sub_fields  = $( 'input[id="ai1ec_ticket_quantity"]', $parent_form );				
				if ( false === $this.prop( 'checked' ) ) {
					if ( $sub_fields.val() == 0 ) {
						$sub_fields.val( '' );
					}
					$sub_fields.addClass( 'ai1ec-required' );
				} else {
					$sub_fields.removeClass( 'ai1ec-required' );
				}
			} );
		$( '.ai1ec-tickets-edit-form' )
					.not( '.ai1ec-tickets-form-template' )
					.not( '.ai1ec-hidden' )		
					.find( 'input[id="ai1ec_ticket_avail"]' ).each( function () {
			var $checkbox = $( this );
			$checkbox
				.closest( '.ai1ec-tickets-edit-form' )
				.find( 'input[id="ai1ec_ticket_sale_start_date"],input[id="ai1ec_ticket_sale_end_date"]' )
				.each( function () {	
					if ( false === $checkbox.prop( 'checked' ) ) {
						$( this ).addClass( 'ai1ec-required' );
					} else {
						$( this ).removeClass( 'ai1ec-required' );
					}
				});
		} );		
		$( '.ai1ec-ticket-field-error' ).hide();		
		$( '.ai1ec-required' ).not( '.ai1ec-tickets-form-template .ai1ec-required' )
			.each( function() {
				var $this = $( this );
				$this.removeClass( 'ai1ec-error' );
				if (
					! $.trim( $this.val() ) ||
					( 'checkbox' === $this.attr( 'type' ) && ! $this.prop('checked') )
				) {
					$this.addClass( 'ai1ec-error' );
					$this.parent().find( '.ai1ec-ticket-field-error' ).show();
				}
			} );
		$( '[name="ticket_sale_start_date"], [name="ticket_sale_end_date"]')
			.not( '.ai1ec-tickets-form-template input' )
			.each( 
				function() {
					var
						$this = $( this ),
						$visible_fields = $this.closest( '.ai1ec-tickets-dates-block' )
							.find( 'input[type="text"]' );
							
					$visible_fields.removeClass( 'ai1ec-error' );
					if (
						! $this.closest( '.ai1ec-avail-block' )
							.find( 'input[name="availibility"]:checked' ).length 
						&& null === this.value.match( /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/ )
					) {
						$visible_fields.addClass( 'ai1ec-error' );
					}
				}
			);
		if ( ! $( '#ai1ec_tax_inputs input' ).length ) {
			$( '.ai1ec-tax-options-button' ).show();
		} else {
			$( '.ai1ec-tax-options-button' ).hide();
		}
		if ( $( '.ai1ec-ticket-field-error:visible' ).length ) {
			return false;
		}
		return true;
	};

	var on_change_unlimited = function ( $checkbox ) {
		var $ticket = $checkbox.closest( '.ai1ec-tickets-edit-form' ),
		$tickets_quantity_fields = $(
			'#ai1ec_ticket_quantity', $ticket
		);
		if ( true == $checkbox.prop( 'checked' ) ) {
			$tickets_quantity_fields.hide();
		} else {
			$tickets_quantity_fields.show();
		
		}
	}

	var on_change_availability = function ( $checkbox ) {
		var
			$ticket                  = $checkbox.closest( '.ai1ec-tickets-edit-form' ),
			$tickets_avail_fields    = $(
				'.ai1ec-tickets-dates', $ticket
			);

		if ( true == $checkbox.prop( 'checked' ) ) {
			$tickets_avail_fields.hide();
		} else {
			$tickets_avail_fields.show();
		}
	}

	var show_hide_description_error = function( show ) {
		$( '#ai1ec-event-description-field-error' ).remove();
		if ( show ) {			
			$( '#postdivrich' ).before('<div id="ai1ec-event-description-field-error"><strong style="color: red;">* The Event description is required.</strong></div>');
		}
	}
	
	/**
	 * Initialize Tickets.
	 */
	var init_tickets = function() {
		$( document ).on( 'click change', '[id="ai1ec_ticket_unlimited"]', function () {
			on_change_unlimited( $( this ) );
		} );		
		$( document ).on( 'click change', '[id="ai1ec_ticket_avail"]', function () {
			on_change_availability( $( this ) );
		} );
		$( document ).on( 'click change', '[id="ai1ec_new_ticket_status"]', function () {
			var $this         = $( this );
			var $parent_panel = $this.closest( '.ai1ec-tickets-panel' );
			var $status       = $this.find( ':selected' );
			if ( 'canceled' === $status.val() ) {
				var $taken = $( '#ai1ec-ticket-taken', $parent_panel );
				if ( 0 < $taken.val() ) {
					$( '#ai1ec-ticket-status-message', $parent_panel ).text( ai1ec_config.ticketing.cancel_message );
					return;
				} 
			}
			$parent_panel.find( '#ai1ec-ticket-status-message' ).text( '' );
		} );
		$( document ).on( 'click', '.ai1ec-remove-ticket', function() {
			var $parent_panel = $( this ).closest( '.ai1ec-tickets-panel' );
			var $taken        = $( '#ai1ec-ticket-taken', $parent_panel );
			if ( 0 < $taken.val() ) {
				utils.alert( ai1ec_config.ticketing.information, ai1ec_config.ticketing.no_delete_text );
			} else {
				$parent_panel
					.addClass( 'ai1ec-hidden' )
					.append(
						'<input type="hidden" name="remove" value="1">'
					);				
			}
			return false;
		} );

		// Create a ticket.
		var create_ticket = function() {
			var $form = $( '.ai1ec-tickets-form-template' ).clone();
			$form
				.removeClass( 'ai1ec-tickets-form-template' )
				.appendTo( '#ai1ec-ticket-forms' );

			$checkbox = $( '#ai1ec_ticket_unlimited', $form);
			$checkbox.prop( 'checked', true );
			on_change_unlimited( $checkbox );

			$checkbox = $( '#ai1ec_ticket_avail', $form);
			$checkbox.prop( 'checked', true );
			on_change_availability( $checkbox );
			init_tickets_date_time();

			return false;
		};

		$( '#ai1ec_add_new_ticket' ).on( 'click', create_ticket );

		if( ! $( '.ai1ec-tickets-edit-form' ).not( '.ai1ec-tickets-form-template' ).length ) {
			create_ticket();
		}
	};

    var init_customer_review_box = function() {

   		//Close positive review question modal
	    var close_all_review_modals = function() {
	    	//hide the modal
    	    $('.ai1ec_review_modal').modal('hide');    
    	    //hide the alerts
    	    $('.ai1ec_review_modal').hide();    
    	}; 

    	var send_feedback_message = function() {
    		var $required_fields = $(
				'.ai1ec_review_negative_feedback, .ai1ec_review_contact_name, .ai1ec_review_contact_email, .ai1ec_review_site_url'
			);
    		$required_fields.each( function() {
				var $this = $( this );
				$this.removeClass( 'ai1ec-error' );
				$this.closest( 'td' ).find( '.ai1ec-required-message' ).hide();
				$this.closest( 'td' ).find( '.ai1ec-invalid-email-message' ).hide();
				$this.closest( 'td' ).find( '.ai1ec-invalid-site-message' ).hide();
				if ( ! $.trim( $this.val() ) ) {
					$this.addClass( 'ai1ec-error' );
					$this.closest( 'td' ).find('.ai1ec-required-message' ).show();
				} else if ( $this.hasClass( 'ai1ec_review_contact_email' ) ) {
					var email_regex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
					if ( false === email_regex.test( $this.val() ) ) {
						$this.addClass( 'ai1ec-error' );
						$this.closest( 'td' ).find('.ai1ec-invalid-email-message' ).show();
					}
				} else if ( $this.hasClass( 'ai1ec_review_site_url' ) ) {
					var site_regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
					if ( false === site_regex.test( $this.val() ) ) {
						$this.addClass( 'ai1ec-error' );
						$this.closest( 'td' ).find('.ai1ec-invalid-site-message' ).show();
					}
				}
			});
			if ( false === $required_fields.hasClass( 'ai1ec-error' ) ) {
				$( '.ai1ec_review_send_feedback' ).button( 'loading' );
				$required_fields.prop( 'disabled', true );
	    		$.ajax( {
					url     : ai1ec_config.ajax_url,
					type    : 'POST',
					data    : {
						action  : 'ai1ec_send_feedback_message',
						message : $( '.ai1ec_review_negative_feedback' ).val(),
						name    : $( '.ai1ec_review_contact_name' ).val(),
						email   : $( '.ai1ec_review_contact_email' ).val(),
						site    : $( '.ai1ec_review_site_url' ).val()
					},
					success : function( response ) {
						$( '.ai1ec_review_messages' ).remove();
						$( '.ai1ec-review-form' ).prepend(
							'<div class="timely ai1ec-alert ai1ec-alert-success ai1ec_review_messages"><strong>'
								+ ai1ec_config.review.message_sent
								+ '</strong></div>'
							);
						//just giving time to the user read the success message
						setTimeout( function() { 
							$( '.ai1ec_review_send_feedback' ).button( 'reset' );
							$( '.ai1ec_not_enjoying_popup' ).prop( 'disabled', true );	
							close_all_review_modals();						
						}, 3000);
					},
					error : function( response ) {
						$required_fields.prop( 'disabled', false );
						$( '.ai1ec_review_messages' ).remove();
						$( '.ai1ec-review-form' ).prepend(
							'<div class="timely ai1ec-alert ai1ec-alert-danger ai1ec_review_messages"><strong>Error!</strong> '
							+ ai1ec_config.review.message_error
							+ '</div>'
						);
					}
				} );
	    	}
    	}

    	var save_feedback_review_yes = function() {
    		save_and_close( 'y' );
    	}

    	var save_feedback_review_no = function() {
    		save_and_close( 'n' );
    	}
		
		var save_and_close = function( feedback ) {
			close_all_review_modals();
			$.ajax( {
				url     : ai1ec_config.ajax_url,
				type    : 'POST',
				data    : {
					action   : 'ai1ec_save_feedback_review',
					feedback : feedback
				}
			} );    		
		}

		$( '.ai1ec_review_enjoying_no_rating, .ai1ec_review_enjoying_go_wordpress' ).on( 'click', save_feedback_review_yes );				
		$( '.ai1ec_review_send_feedback' ).on( 'click', send_feedback_message );	
		$( '.ai1ec_review_not_enjoying_no_rating' ).on( 'click', save_feedback_review_no );		
    }

	/**
	 * Shows tax options.
	 */
	var init_tax_options = function() {
		var
			$modal   = $( '#ai1ec_tax_box' ),
			$content = $( '.ai1ec-modal-content', $modal ),
			$loading = $( '.ai1ec-loading', $modal );

		// Show the modal.
		$modal.modal( { backdrop: 'static' } );

		$.post(
			ajaxurl,
			{
				action : 'ai1ec_get_tax_box',
				ai1ec_event_id : $( '#post_ID' ).val()
			},
			function( response ) {
				var iframeDoc = myIframe.contentWindow.document;
				$loading.remove();
				$( myIframe ).removeClass( 'ai1ec-hidden' );
				iframeDoc.open();
				iframeDoc.write( response.message.body );
				iframeDoc.close();
			},
			'json'
		);
	};
	
	
	window.addEventListener( 'message', function( e ) {
		var
			message           = e.data,
			token             = 'timely_tax_options_',
			cancel_token      = 'timely_tax_cancel',
			$inputs_container = $( '#ai1ec_tax_inputs' );

		if ( message === cancel_token ) {
			$( '#ai1ec_tax_box' ).modal( 'hide' );
			$( '#ai1ec_tax_options' ).addClass( 'ai1ec-hidden' );
			$( '#ai1ec_update_tax_options' ).removeClass( 'ai1ec-hidden' );
			myIframe.setAttribute( 'src', '' );
			return;
		}

		if ( 0 !== message.indexOf( token ) ) return;
		myIframe.setAttribute( 'src', '' );
		message = JSON.parse( message.substr( token.length ) );
		
		$( '#ai1ec_tax_box' ).modal( 'hide' );
		$( '#ai1ec_tax_options' ).addClass( 'ai1ec-hidden' );
		$( '#ai1ec_update_tax_options' ).removeClass( 'ai1ec-hidden' );
		
		$inputs_container.html( '' );
		for ( var key in message ) {
			$inputs_container.append(
				$( '<input />',{
					type : 'hidden',
					name : 'tax_options[' + key + ']',
					value : message[key]
				} )
			);
		}
	}, false);
	


	var start = function() {
		// Initialize the page. We do this before domReady so we start loading other
		// dependencies as soon as possible.
		init();
		domReady( function() {
			init_collapsibles();
			// Reposition event details meta box.
			reposition_meta_box();
			// Attach the event handlers.
			attach_event_handlers();
			// Initialize Select2 for timezones.
			init_timezones_select();
			// Initialize Tickets.
			init_tickets();
			// Tickets datepickers.
			init_tickets_date_time();
			// Customer Review Box
			init_customer_review_box();
		} );
	};

	return {
		start: start
	};
} );
