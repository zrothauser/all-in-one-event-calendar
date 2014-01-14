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
class Ai1ec_Robots_Helper {
	protected $_robots = null;

	public function __construct() {
		$this->_robots = ABSPATH . 'robots.txt';
		
//		$url = wp_nonce_url(
//			'edit.php?post_type=ai1ec_event&page=all-in-one-event-calendar-settings',
//			'ai1ec-nonce'
//		);
//
//		$creds = request_filesystem_credentials( $url, '', false, false, null );
//		if ( ! WP_Filesystem( $creds ) ) {
//			request_filesystem_credentials( $url, '', true, false, null );
//		}
	}

	public function read() {
		if ( file_exists( $this->_robots ) ) {
			return file_get_contents( $this->_robots );
		}

//		global $wp_filesystem;
//
//		// Read robots.txt file content
//		return $wp_filesystem->get_contents(
//			ABSPATH . 'robots.txt'
//		);
	}

	public function write($content = null) {
		return file_put_contents( $this->_robots, $content );

//		global $wp_filesystem;
//
//		// Write new robots.txt file content
//		return $wp_filesystem->put_contents(
//			ABSPATH . 'robots.txt',
//			$content,
//			FS_CHMOD_FILE
//		);
	}
}
