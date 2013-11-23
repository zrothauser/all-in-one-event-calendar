define(
	[
		"jquery_timely",
		"domReady",
		"ai1ec_config",
		"libs/utils",
		"external_libs/bootstrap_colorpicker",
		"external_libs/bootstrap_tab",
		"external_libs/jquery_cookie"
	],
	function( $, domReady, ai1ec_config, utils ) {
	"use strict"; // jshint ;_;

	var handle_set_tab_cookie = function( e ) {
		var active = $( this ).attr( 'href' );
		$.cookie( 'less_variables_active_tab', active );
	};

	var activate_saved_tab_on_page_load = function( active_tab ) {
		if ( active_tab === null ){
			// Activate the first tab
			$( 'ul.nav-tabs a:first' ).tab( 'show' );
		} else {
			// Activate the correct tab
			$( 'ul.nav-tabs a[href=' + active_tab + ']' ).tab( 'show' );
		}
	};

	var handle_custom_fonts = function() {
		if( $( this ).val() === 'custom' ) {
			$( this )
				.closest( '.controls' )
				.find( '.ai1ec-custom-font' )
				.removeClass( 'hide' );
		} else {
			$( this )
				.closest( '.controls' )
				.find( '.ai1ec-custom-font' )
				.addClass( 'hide' );
		}
	};

	/**
	 * Ask user to confirm resetting their theme options.
	 *
	 * @return {boolean} True if should proceed with click, false otherwise
	 */
	var confirm_on_reset = function() {
		return window.confirm( ai1ec_config.confirm_reset_theme );
	};

	/**
	 * Validate any fields that require it, such as CSS length values.
	 */
	var validate = function() {
		var valid = true;

		$( '.ai1ec-less-variable-size' ).each( function() {
			var $field = $( this )
			  , $control = $field.closest( '.control-group' )
			  , val = $.trim( $field.val() )

			$control.removeClass( 'warning' );
			if ( '' === val ) {
				return;
			}

			// Regexp found here:
			// http://www.shamasis.net/2009/07/regular-expression-to-validate-css-length-and-position-values/
			var regexp = /^auto$|^[+-]?[0-9]+\.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)?$/ig;
			if ( ! regexp.test( val ) ) {
				valid = false;

				// Activate tab that this control is on and toggle its error status.
				var id = $control.closest( '.tab-pane' ).attr( 'id' );
				$control.closest( '.tabbable' )
					.find( 'a[data-toggle="tab"][href="#' + id + '"]' )
					.trigger( 'click' );
				$control.addClass( 'warning' );

				// Notify the user.
				window.alert( ai1ec_config.size_less_variable_not_ok );

				// Bring focus to the offending field.
				$field.trigger( 'focus' );
				return false;
			}
		} );

		return valid;
	};

	domReady( function() {
		$( '.colorpickers' ).colorpicker();
		
		utils.activate_saved_tab_on_page_load( $.cookie( 'less_variables_active_tab' ) );

		// Register event handlers.
		$( document )
			.on( 'click',  'ul.nav-tabs a',             handle_set_tab_cookie )
			.on( 'click',  '#ai1ec-reset-variables',    confirm_on_reset )
			.on( 'change', '.ai1ec_font',               handle_custom_fonts );
		$( '#ai1ec-reset-variables' ).closest( 'form' ).on( 'submit', validate );
	} );
});
