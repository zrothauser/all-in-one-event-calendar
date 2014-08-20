<?php

/**
 * Checks configurations and notifies admin.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Lib
 */
class Ai1ec_Environment_Checks extends Ai1ec_Base {

	const EV_VERSION = '1.1.0';
	const EV_NAME    = 'all-in-one-event-calendar-extended-views/all-in-one-event-calendar-extended-views.php';
	const CORE_NAME  = 'all-in-one-event-calendar/all-in-one-event-calendar.php';

	/**
	 * Runs checks for necessary config options.
	 *
	 * @return void Method does not return.
	 */
	public function run_checks() {
		$role         = get_role( 'administrator' );
		$current_user = get_userdata( get_current_user_id() );
		if (
			! is_object( $role ) ||
			! is_object( $current_user ) ||
			! $role->has_cap( 'manage_ai1ec_options' ) ||
			(
				defined( 'DOING_AJAX' ) &&
				DOING_AJAX
			)
		) {
			return;
		}
		global $plugin_page;
		$settings      = $this->_registry->get( 'model.settings' );
		$notification  = $this->_registry->get( 'notification.admin' );
		$notifications = array();

		// check if is set calendar page
		if ( ! $settings->get( 'calendar_page_id' ) ) {
			$msg = Ai1ec_I18n::__(
				'Select an option in the <strong>Calendar page</strong> dropdown list.'
			);
			$notifications[] = $msg;
		}
		if (
			$plugin_page !== AI1EC_PLUGIN_NAME . '-settings' &&
			! empty( $notifications )
		) {
			if (
				$current_user->has_cap( 'manage_ai1ec_options' )
			) {
				$msg = sprintf(
					Ai1ec_I18n::__( 'The plugin is installed, but has not been configured. <a href="%s">Click here to set it up now &raquo;</a>' ),
					admin_url( AI1EC_SETTINGS_BASE_URL )
				);
				$notification->store(
					$msg,
					'updated',
					2,
					array( Ai1ec_Notification_Admin::RCPT_ADMIN )
				);
			} else {
				$msg = Ai1ec_I18n::__(
					'The plugin is installed, but has not been configured. Please log in as an Administrator to set it up.'
				);
				$notification->store(
					$msg,
					'updated',
					2,
					array( Ai1ec_Notification_Admin::RCPT_ALL )
				);
			}
			return;
		}
		foreach ( $notifications as $msg ) {
			$notification->store(
				$msg,
				'updated',
				2,
				array( Ai1ec_Notification_Admin::RCPT_ADMIN )
			);
		}
		global $wp_rewrite;
		$option  = $this->_registry->get( 'model.option' );
		$rewrite = $option->get( 'ai1ec_force_flush_rewrite_rules' );
		if (
			! $rewrite ||
			! is_object( $wp_rewrite ) ||
			! isset( $wp_rewrite->rules ) ||
			0 === count( $wp_rewrite->rules )
		) {
			return;
		}
		$this->_registry->get( 'rewrite.helper' )->flush_rewrite_rules();
		$option->set( 'ai1ec_force_flush_rewrite_rules', false );
	}

	/**
	 * Checks for add-on versions.
	 *
	 * @param string $plugin Plugin name.
	 *
	 * @return void Method does not return.
	 */
	public function check_addons_activation( $plugin ) {
		switch ( $plugin ) {
			case self::EV_NAME:
				$this->_extended_views_activation();
				break;
			case self::CORE_NAME:
				$this->_check_active_addons();
				break;
		}
	}

	/**
	 * Checks all Time.ly addons.
	 *
	 * @return void Method does not return.
	 */
	protected function _check_active_addons() {
		if ( is_plugin_active( self::EV_NAME ) ) {
			$this->_extended_views_activation( true );
		}
	}

	/**
	 * Performs Extended Views version check.
	 *
	 * @return void Method does not return.
	 */
	protected function _extended_views_activation( $core = false ) {
		$ev_data = get_plugin_data(
			WP_PLUGIN_DIR . DIRECTORY_SEPARATOR .
			'all-in-one-event-calendar-extended-views' . DIRECTORY_SEPARATOR .
			'all-in-one-event-calendar-extended-views.php'
		);
		if ( ! isset( $ev_data['Version'] ) ) {
			return;
		}
		$version = $ev_data['Version'];
		if ( -1 === version_compare( $version, self::EV_VERSION ) ) {
			$message = sprintf(
				Ai1ec_I18n::__( 'Addon %s needs to be at least in version %s' ),
				$ev_data['Name'],
				self::EV_VERSION
			);
			if ( ! $core ) {
				throw new Ai1ec_Outdated_Addon_Exception( $message, self::EV_NAME );
			} else {
				deactivate_plugins( self::EV_NAME );
				$this->_registry->get( 'notification.admin' )->store(
					$message,
					'error',
					0,
					array( Ai1ec_Notification_Admin::RCPT_ADMIN ),
					true
				);
			}
		}
	}
}