require( [
         "jquery",
         'domReady',
         'scripts/admin_settings'
         ],
         function ( $, domReady, page ) {
	"use strict"; // jshint ;_;
	// Globalize jQuery
	window.jQuery = $;
	window.$ = $;
	// Set the ajaxurl variable for testing purpose
	var ajaxurl = "http://localhost/wordpress/wp-admin/admin-ajax.php";
	describe( "Add new event page", function() {
		afterEach(  function() {
			// Unset any handlers that are delegated to the window object. This is important otherwise every time page.start() is called all the handlers are bound one more time
			$( '*' ).off();
			var dp = $( '#exact_date' ).data( 'datepicker' );
			if( undefined !== dp ) {
				dp.hide();
				dp.picker.remove();
				$( '#exact_date' ).removeData( 'datepicker' );
			}
		});
		// This is the setup method
		beforeEach( function() {
			$( 'div.datepicker' ).remove();
			// Load the HTML
			loadFixtures( 'settings.html' );
		} );
		describe( "Test suite for the available views checkboxexs/ radios", function() {
			it( "shouldn't allow the user to uncheck all checkboxes", function() {
				page.start();
				// we start with only one checked
				expect( $( 'input.toggle-view:checked' ).length ).toEqual( 1 );
				expect( $( 'input[name=view_posterboard_enabled]' ) ).toBe( ':checked' );
				// We uncheck the last one
				$( 'input[name=view_posterboard_enabled]' ).click();
				// But it's still checked
				expect( $( 'input[name=view_posterboard_enabled]' ) ).toBe( ':checked' );
				// we check another one
				$( 'input[name=view_stream_enabled]' ).click();
				// we have two checked
				expect( $( 'input.toggle-view:checked' ).length ).toEqual( 2 );
				// we uncheck the second one
				$( 'input[name=view_stream_enabled]' ).click();
				// not chceked anymore
				expect( $( 'input[name=view_stream_enabled]' ) ).not.toBe( ':checked' );
			} );
			it( "Should check the relative checkbox if it was unchecked if the view is selected as default", function() {
				page.start();
				expect( $( 'input[name=view_stream_enabled]' ) ).not.toBe( ':checked' );
				$( 'input[value=stream]' ).click();
				expect( $( 'input[name=view_stream_enabled]' ) ).toBe( ':checked' );
			} );
		} );
		describe( "Test suite for the connection settings postbox", function() {
			it( "Should not be present if the input fields are empty", function() {
				expect( $( '#ai1ec-plugins-settings' ) ).toExist();
				$( '#ai1ec-plugins-settings input' ).val( '' );
				page.start();
				expect( $( '#ai1ec-plugins-settings' ) ).not.toExist();
			} );
		} );
	} );
} );