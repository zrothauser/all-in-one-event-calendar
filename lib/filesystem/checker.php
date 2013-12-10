<?php

/**
 * @author Timely Network Inc
 *
 *
 */

class Ai1ec_Filesystem_Checker {

	/**
	 * check if the path is writable. To make the check .
	 *
	 * @param string $path
	 * @return boolean
	 */
	public function is_writable( $path ) {
		global $wp_filesystem;
		include_once ABSPATH . 'wp-admin/includes/file.php';
		// If for some reason the include doesn't work as expected just return false.
		if( ! function_exists( 'WP_Filesystem' ) ) {
			return false;
		}
		$writable = WP_Filesystem( false, $path );
		// We consider the directory as writable if it uses the direct transport,
		// otherwise credentials would be needed
		return $writable && $wp_filesystem->method === 'direct';
	}
	
	public function put_content( $file, $content ) {
		global $wp_filesystem;
		return $wp_filesystem->put_contents(
			$file,
			$content
		);
	}
}