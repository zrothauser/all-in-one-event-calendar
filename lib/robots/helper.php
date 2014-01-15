<?php

/**
 * File robots.txt helper.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.query
 */
class Ai1ec_Robots_Helper extends Ai1ec_Base {

	public function install() {
		$robots_txt    = ABSPATH . 'robots.txt';
		$is_updated    = false;
		$current_rules = null;
		$custom_rules  = null;

		$url = wp_nonce_url(
			'edit.php?post_type=ai1ec_event&page=all-in-one-event-calendar-settings',
			'ai1ec-nonce'
		);

		$creds = request_filesystem_credentials( $url, '', false, false, null );
		if ( ! WP_Filesystem( $creds ) ) {
			request_filesystem_credentials( $url, '', true, false, null );
		}

		global $wp_filesystem;
		if ( $wp_filesystem->exists( $robots_txt )
				&& $wp_filesystem->is_readable( $robots_txt )
					&& $wp_filesystem->is_writable( $robots_txt ) ) {
			// Get current robots txt content
			$current_rules = $wp_filesystem->get_contents( $robots_txt );

			// Update robots.txt
			$custom_rules = $this->rules( $current_rules, null );
			$is_updated = $wp_filesystem->put_contents(
				$robots_txt,
				$custom_rules,
				FS_CHMOD_FILE
			);
		}

		// Update settings textarea
		$this->_registry->get( 'model.settings' )
						->set( 'edit_robots_txt', $custom_rules );
	}

	public function rules( $output, $public ) {
		// Current rules
		$current_rules = array_map(
			'trim',
			explode( PHP_EOL, $output )
		);

		// Custom rules
		$custom_rules = array(
			"User-agent: *",
			"Disallow: /wp-admin/",
			"Disallow: /wp-includes/",
			"Disallow: /calendar/action~posterboard/",
			"Disallow: /calendar/action~agenda/",
			"Disallow: /calendar/action~oneday/",
			"Disallow: /calendar/action~month/",
			"Disallow: /calendar/action~week/",
			"Disallow: /calendar/action~stream/",
		);

		return implode(
			PHP_EOL,
			array_unique( array_merge( $current_rules, $custom_rules ) )
		);
	}
}
