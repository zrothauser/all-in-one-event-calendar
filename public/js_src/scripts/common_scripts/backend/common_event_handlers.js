define(
	[
		"jquery_timely",
		"scripts/common_scripts/backend/common_ajax_handlers"
	],
	function( $, ajax_handlers ) {
	"use strict"; // jshint ;_;

	var dismiss_plugins_messages_handler = function( e ) {
		var data = {
			"action" : 'ai1ec_facebook_cron_dismiss'
		};
		$.post(
				ajaxurl,
				data,
				ajax_handlers.handle_dismiss_plugins,
				'json'
			);
	};

	var dismiss_notification_handler = function( e ) {
		var $button = $( this );
		// disable the update button
		$button.attr( 'disabled', true );

		// create the data to send
		var data = {
			action: 'ai1ec_disable_notification',
			note  : false
		};

		$.post( ajaxurl, data, ajax_handlers.handle_dismiss_notification ) ;
	};

	var dismiss_intro_video_handler = function( e ) {
		var $button = $( this );
		// Disable the update button.
		$button.attr( 'disabled', true );

		// Create the data to send.
		var data = {
			action: 'ai1ec_disable_intro_video',
			note  : false
		};

		$.post( ajaxurl, data, ajax_handlers.handle_dismiss_intro_video ) ;
	};

	/**
	 * Dismiss button clicked in invalid license warning.
	 *
	 * @param  {Event} e jQuery event object
	 */
	var dismiss_license_warning_handler = function( e ) {
		var $button = $( this );
		// Disable the update button.
		$button.attr( 'disabled', true );

		// Create the data to send.
		var data = {
			action: 'ai1ec_set_license_warning',
			value: 'dismissed'
		};

		$.post( ajaxurl, data, ajax_handlers.handle_dismiss_license_warning ) ;
	};

	// Show/hide the multiselect containers when user clicks on "limit by" widget options
	var handle_multiselect_containers_widget_page = function( e ) {
		$( this ).parent().next( '.ai1ec-limit-by-options-container' )
                                  .toggle()
                                  .find( 'option' )
                                  .removeAttr( 'selected' );
	};

	/**
	 * Handler for alert trigger: click.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_alert_click = function( e ) {		
		$document       = $( document.body );
		$one_shot_popup = $( '#ai1ec-one-shot-popup', $document );
		if ( 0 === $one_shot_popup.length ) {
			$div = $( '<div class="timely"/>' );
			$div.html(
				'<div id="ai1ec-one-shot-popup" class="timely ai1ec-modal ai1ec-fade"' +
					'role="dialog" aria-hidden="true" style="display: none;">' +
					'<div class="ai1ec-modal-dialog">' +
						'<div class="ai1ec-modal-content">' +
							'<div class="ai1ec-modal-header">' +
								'<button type="button" class="ai1ec-close"' +
									'data-dismiss="ai1ec-modal" aria-hidden="true">×</button>' +
								'<strong><div id="ai1ec-one-shot-popup-title"/></strong>' +
							'</div>' +
							'<div class="ai1ec-modal-body ai1ec-clearfix">' +
								'<textarea class="ai1ec-form-control code" rows="8" cols="40" id="ai1ec-one-shot-popup-text">'
								+ '</textarea>' +
							'</div>' +
						'</div>' +
					'</div>' +
				'</div>'
			 ).appendTo( $document );
			$one_shot_popup = $( '#ai1ec-one-shot-popup', $document );
		}					
		var $link = $( this ).closest( 'a' );
		$( '#ai1ec-one-shot-popup-title', $one_shot_popup ).text( $link.data( 'alert-title' ) );
		$( '#ai1ec-one-shot-popup-text', $one_shot_popup ).text( $link.data( 'alert-text' ) );
		$one_shot_popup.modal( 'show' );
	};

	return {
		dismiss_plugins_messages_handler          : dismiss_plugins_messages_handler,
		dismiss_notification_handler              : dismiss_notification_handler,
		dismiss_intro_video_handler               : dismiss_intro_video_handler,
		dismiss_license_warning_handler           : dismiss_license_warning_handler,
		handle_multiselect_containers_widget_page : handle_multiselect_containers_widget_page,
		handle_alert_click                        : handle_alert_click
	};
} );
