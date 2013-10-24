<?php
/**
 * The command resolver class that handles command.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Command
 */
class Ai1ec_Command_Resolver {

	/**
	 * @var array
	 */
	private $_commands = array();

	/**
	 * @var Ai1ec_Object_Registry
	 */
	private $_registry;

	/**
	 * @var Ai1ec_Request_Parser
	 */
	private $_request;

	/**
	 * Public constructor
	 * 
	 * @param Ai1ec_Object_Registry $registry
	 * @param Ai1ec_Request_Parser $request
	 */
	public function __construct( 
		Ai1ec_Object_Registry $registry, 
		Ai1ec_Request_Parser $request
	) {
		$this->add_command( 
			$registry->get( 
				'command.event', $registry, $request
			)
		);
		$this->add_command(
			$registry->get(
				'command.calendar', $registry, $request
			)
		);
		$this->_registry = $registry;
		$this->_request  = $request;
	}
	
	/**
	 * Add a command.
	 * 
	 * @param Ai1ec_Command $command
	 */
	public function add_command( Ai1ec_Command $command ) {
		$this->_commands[] = $command;
	}
	
	/**
	 * Return the command to execute or false.
	 * 
	 * @return Ai1ec_Command|null
	 */
	public function get_command() {
		foreach ( $this->_commands as $command ) {
			if( true === $command->is_this_to_execute() ) {
				return $command;
			}
		}
		return null;
	}
}