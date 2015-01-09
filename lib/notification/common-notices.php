<?php
/**
 * Class for common notifications.
 *
 * @author     Time.ly Network Inc.
 * @since      2.2
 *
 * @package    AI1EC
 * @subpackage AI1EC.Lib.Notification
 */
class Ai1ec_Common_Notices extends Ai1ec_Notification_Admin {

	/**
	 * Cache unavailable notification.
	 *
	 * @param string $cache_dir Cache directory.
	 *
	 * @return $this
	 */
	public function cache_unavailable( $cache_dir ) {
		$message = Ai1ec_I18n::__(
			'We detected that your cache directory (%s) is not writable. This will make your calendar slow. Please contact your web host or server administrator to make it writable by the web server.'
		);
		$message = sprintf( $message, $cache_dir );
		$this->store( $message, 'error', 1 );
		return $this;
	}
}
