<?php

/**
 * Platform interactions class.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
class Ai1ec_Platform_Controller extends Ai1ec_Base {

	/**
	 * Makes sure several calendar settings are set properly for Event Platform
	 * mode.
	 */
	public function check_settings() {
		$ai1ec_settings = $this->_registry->get( 'model.settings' );

		// Make sure a calendar page has been defined.
		if ( ! $ai1ec_settings->get( 'calendar_page_id' ) ) {
			// Auto-create the page.
			$ai1ec_settings->set(
				'calendar_page_id',
				$this->_registry->get( 'model.settings.calendar-page' )
					->create_calendar_page( Ai1ec_I18n::__( 'Calendar' ) )
			);
		}

		// Make sure the defined calendar page is the default WordPress front page.
		update_option(
			'page_on_front',
			$ai1ec_settings->get( 'calendar_page_id' )
		);
	}

	/**
	 * Saves the "Site Title" option.
	 *
	 * @param string $settings_page Either 'settings' or 'feeds'; refers to the
	 *                              corresponding saved page.
	 * @param array  $params        Settings that were submitted, provided using
	 *                              a map (key => value) structure.
	 *
	 * @return void
	 */
	public function ai1ec_save_settings( $settings_page, $params ) {
		// When you activate the platfrom mode for the first time, the field is
		// not present so do not save.
		if ( 'settings' === $settings_page  && isset( $_POST['blogname'] ) ) {
			// Do essentially the same thing WP does when it saves the blog name.
			update_option(
				'blogname',
				stripslashes_deep( trim( $params['blogname'] ) )
			);
		}
	}

}