timely.define(
	[
		"jquery_timely",
		"external_libs/bootstrap/collapse",
		"external_libs/bootstrap/modal"
	],
	function( $ ) {
	

	var open_modal_on_unpublish = function( e ) {
		if (
			! $( this ).is( ':checked' ) &&
			$( '#ai1ec-facebook-export-modal' ).length
		) {
			$( '#ai1ec-facebook-export-modal' ).modal( {
				"show": true,
				"backdrop" : 'static'
			} );
		} else {
			// Remove the hidden input if present
			$( '#ai1ec-remove-fb-event-hidden' ).remove();
		}
	};

	var add_hidden_field_when_user_click_remove_in_modal = function() {
		$( '#ai1ec-facebook-export-modal' ).modal( 'hide' );
		if ( $( this ).hasClass( 'remove' ) ) {
			var $input = $( '<input />', {
				type  : "hidden",
				name  : "ai1ec-remove-event",
				value : 1,
				id    : "ai1ec-remove-fb-event-hidden"
			} );
			$( '#ai1ec-facebook-publish' ).append( $input );
		} else {
			$( '#ai1ec-remove-fb-event-hidden' ).remove();
		}
	};

	var refresh_list_of_pages = function( e ) {
		e.preventDefault();

		var $facebook = $( e.target ).closest( '#ai1ec-facebook-publish' ),
		    $spinner  = $facebook.find( '.ai1ec-fa-refresh' ),
		    data      = {
		    	"action": 'ai1ec_refresh_tokens'
		    };

		$spinner.addClass( 'ai1ec-fa-spin' );

		$.post(
			ajaxurl,
			data,
			function( data ) {
				var $choices = $facebook.find( '.ai1ec-page-choices' );

				$spinner.removeClass( 'ai1ec-fa-spin' );

				// If the radio buttons exist, replace them with new ones; else just
				// prepend new markup.
				if ( $choices.length ) {
					$choices.replaceWith( data );
				} else {
					$facebook.find( '.ai1ec-refresh-fb-pages' ).before( data );
				}
			},
			'json'
		);
	};

	var show_page_choices_when_present = function( e ) {
		var $collapse = $( '#ai1ec-fb-collapse' );

		if ( $collapse.length ) {
			$collapse.collapse( this.checked ? 'show' : 'hide' );
		}
	};

	return {
		open_modal_on_unpublish                          : open_modal_on_unpublish,
		add_hidden_field_when_user_click_remove_in_modal : add_hidden_field_when_user_click_remove_in_modal,
		show_page_choices_when_present                   : show_page_choices_when_present,
		refresh_list_of_pages                            : refresh_list_of_pages
	};
} );
