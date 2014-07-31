<?php
/**
 * The concrete command that compiles CSS.
*
* @author     Time.ly Network Inc.
* @since      2.1
*
* @package    AI1EC
* @subpackage AI1EC.Command
*/
class Ai1ec_Command_Disable_Gzip extends Ai1ec_Command {
	
	/*
	 * (non-PHPdoc) @see Ai1ec_Command::is_this_to_execute()
	 */
	public function is_this_to_execute() {
		if ( isset( $_GET['ai1ec_compile_css'] ) &&
			$_SERVER['SERVER_ADDR'] === $_SERVER['REMOTE_ADDR'] &&
			AI1EC_DEBUG
		) {
			return true;
		}
		return false;
	}
}