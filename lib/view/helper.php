<?php

/**
 * View Helper Class
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.view
 */

class Ai1ec_View_Helper {

	/**
	 * get_admin_view function
	 *
	 * Return the output of a view as a string rather than output to response.
	 *
	 * @param string $file
	 * @param array $args
	 *
	 * @return string
	 */
	function get_admin_view( $file = false, $args = array() ) {
		ob_start();
		$this->display_admin( $file, $args );
		return ob_get_clean();
	}

	/**
	 * display_admin function
	 *
	 * Display the view specified by file $file and passed arguments $args.
	 *
	 * @param string $file
	 * @param array $args
	 *
	 **/
	function display_admin( $file = false, $args = array() ) {
		if( ! $file || empty( $file ) ) {
			throw new Ai1ec_File_Not_Provided( "You need to specify a view file." );
		}

		$file = AI1EC_ADMIN_PATH . '/' . $file;

		if( ! file_exists( $file ) ) {
			throw new Ai1ec_File_Not_Found( "The specified view file doesn't exist." );
		} else {
			extract( $args );
			require( $file );
		}
	}


}