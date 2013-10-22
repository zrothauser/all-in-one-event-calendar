<?php

class Ai1ec_Command_Resolver {

	private $_commands = array();
	
	public function __construct( $registry, $request ) {
		$this->_commands[] = $registry->get( 'command.calendar', $registry, $request );
		$this->_commands[] = $registry->get( 'command.event', $registry, $request );
	}
	
	public function add_command( Ai1ec_Command $command ) {
		$this->_commands[] = $command;
	}
	
	/**
	 * Return the command to execute or false.
	 * 
	 * @return unknown|boolean
	 */
	public function get_command() {
		foreach ( $this->_commands as $command ) {
			if( true === $command->is_this_to_execute() ) {
				return $command;
			}
		}
		return false;
	}
}

?>