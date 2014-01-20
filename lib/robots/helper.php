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
		global $wp_filesystem;

		$option = $this->_registry->get( 'model.option' );
		$settings = $this->_registry->get( 'model.settings' );
		
		if ( $option->get( 'robots_txt' ) !== null &&
				$option->get( 'robots_page_id' ) == $settings->get( 'calendar_page_id' ) ) {
			return;
		}

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

			if ( $is_updated ) {
				$option->set( 'robots_txt', true );
			}
		} else {
			$option->set( 'robots_txt', false );
		}

		// Update Robots Page ID
		$option->set( 'robots_page_id', $settings->get( 'calendar_page_id' ) );

		// Update settings textarea
		$settings->set( 'edit_robots_txt', $custom_rules );
	}

	public function rules( $output, $public ) {
		// Current rules
		$current_rules = array_map(
			'trim',
			explode( PHP_EOL, $output )
		);

		// Get calendar page URI
		$calendar_page_id = $this->_registry->get( 'model.settings' )
											->get( 'calendar_page_id' );
		$page_base = get_page_uri( $calendar_page_id );

		// Custom rules
		$custom_rules = array();
		if ( $page_base ) {
			$custom_rules += array(
				"User-agent: *",
				"Disallow: /$page_base/action~posterboard/",
				"Disallow: /$page_base/action~agenda/",
				"Disallow: /$page_base/action~oneday/",
				"Disallow: /$page_base/action~month/",
				"Disallow: /$page_base/action~week/",
				"Disallow: /$page_base/action~stream/",
			);
		}

		return implode(
			PHP_EOL,
			array_unique( array_merge( $current_rules, $custom_rules ) )
		);
	}
}
