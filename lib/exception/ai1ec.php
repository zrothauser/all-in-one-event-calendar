<?php

/**
 * Abstract base class for all our excpetion.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Exception
 */
abstract class Ai1ec_Exception extends Exception {

	/**
	 * A message to be displayed for admin
	 *
	 * Specific Exceptions should override this.
	 *
	 * @return string Message to be displayed for admin
	 */
	public function get_html_message() {
		// standard html help message here;
	}

}