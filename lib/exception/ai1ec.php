<?php
/**
 * Abstract base class for all our excpetion.
 *
 * @author     Time.ly Network Inc
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Exception
 **/
abstract class Ai1ec_Exception extends Exception {

	/**
	 * returns a standard message to be printed to the view.
	 * Specific Exceptions should override this.
	 * 
	 */
	public function get_html_message() {
		// standard html help message here;
	}
}