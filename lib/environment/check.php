<?php

/**
 * Checks configurations and notifies admin.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Css
 */
class Ai1ec_Environment_Checks extends Ai1ec_Base {

	/**
	 * Runs checks for necessary config options.
	 *
	 * @return void Method does not return.
	 */
	public function run_checks() {
		global $plugin_page;

		$settings      = $this->_registry->get( 'model.settings' );
		$notification  = $this->_registry->get( 'notification.admin' );
		$notifications = array();

		// check if is set calendar page
		if ( ! $settings->get( 'calendar_page_id' ) ) {
			$msg = Ai1ec_I18n::__( 'Select an option in the <strong>Calendar page</strong> dropdown list.' );
			$notifications[] = $msg;
		}

		if (
			$plugin_page !== AI1EC_PLUGIN_NAME . '-settings' &&
			! empty( $notifications )
		) {
			$msg = sprintf(
				Ai1ec_I18n::__( 'The plugin is installed, but has not been configured. <a href="%s">Click here to set it up now &raquo;</a>' ),
				admin_url( AI1EC_SETTINGS_BASE_URL )
			);
			$notification->store( $msg, 'updated', 2 );
			return;
		}
		foreach ( $notifications as $msg ) {
			$notification->store( $msg );
		}
	}
}
