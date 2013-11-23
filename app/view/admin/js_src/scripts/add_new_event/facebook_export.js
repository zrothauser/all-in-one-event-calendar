define(
	[
		"jquery_timely",
		"libs/modal_helper"
	],
	function( $ ) {
	"use strict";

	var open_modal_when_user_chooses_to_unpublish_event = function( e ) {
		if( ! $( this ).is( ':checked' ) && $( '#ai1ec-facebook-export-modal' ).length ) {
			$( '#ai1ec-facebook-export-modal' ).modal( {
				"show": true,
				"backdrop" : 'static'
			} );
		} else {
			// Remove th hidden input if present
			$( '#ai1ec-remove-event-hidden' ).remove();
		}
	};
	var add_hidden_field_when_user_click_remove_in_modal = function() {
		$( '#ai1ec-facebook-export-modal' ).modal( 'hide' );
		if( $( this ).hasClass( 'remove' ) ) {
			var $input = $( '<input />', {
				type  : "hidden",
				name  : "ai1ec-remove-event",
				value : 1,
				id    : "ai1ec-remove-event-hidden"
			} );
			$( '#ai1ec-facebook-publish' ).append( $input );
		}
	};
	var refresh_page_tokens = function( e ) {
		e.preventDefault();
		var data = {
				"action"     : 'ai1ec_refresh_tokens'
			};
		$.post(
			ajaxurl,
			data,
			function( data ) {
				var $facebook = $( e.target ).closest( '#ai1ec-facebook-publish' );
				var $radios = $facebook.find( '.ai1ec_export_radios' );
				var $multi = $radios.find( '.ai1ec_multi_choiches' );
				// are the radios hidden or not?
				var hidden = true;
				if( $multi.length > 0 ) {
					hidden = $multi.hasClass( 'hide' );
				}
				
				// if the radio buttons exist, replace them
				if( $radios.length > 0 ) {
					$radios.replaceWith( data );
				} else {
					$facebook.find( '.ai1ec_refresh_tokens' ).before( data );
				}
				if( false === hidden ) {
					$( '#ai1ec-facebook-publish' ).find( '.ai1ec_multi_choiches' ).removeClass( 'hide' );
				}
			},
			'json'
		);
	};
	var show_multi_choices_when_present = function( e ) {
		var $multi = $( '.ai1ec_multi_choiches' ), $this = $( this );

		if( 0 !== $multi.length ) {
			if( this.checked ) {
				$multi.removeClass( 'hide' );
			} else {
				$multi.addClass( 'hide' );
			}
		}
	};
	return {
		open_modal_when_user_chooses_to_unpublish_event  : open_modal_when_user_chooses_to_unpublish_event,
		add_hidden_field_when_user_click_remove_in_modal : add_hidden_field_when_user_click_remove_in_modal,
		show_multi_choices_when_present                  : show_multi_choices_when_present,
		refresh_page_tokens                              : refresh_page_tokens
	};
} );
