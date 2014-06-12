<?php
/**
 * Abstract base class for all our excpetion in extensions.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Exception
 */
abstract class Ai1ec_Exception_Extension extends Ai1ec_Exception {

	/**
	 * Prints the message to be displayed when the extension is disabled.
	 */
	abstract public function get_disable_message();
}