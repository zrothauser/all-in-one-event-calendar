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
	 * @var array The available commands.
	 */
	private $_commands = array();

	/**
	 * @var Ai1ec_Object_Registry The Object registry.
	 */
	private $_registry;

	/**
	 * @var Ai1ec_Request_Parser The Request parser.
	 */
	private $_request;

	/**
	 * Public constructor
	 *
	 * @param Ai1ec_Registry_Object $registry
	 * @param Ai1ec_Request_Parser $request
	 *
	 * @return void
	 */
	public function __construct(
		Ai1ec_Registry_Object $registry,
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
	 *
	 * @return Ai1ec_Comment_Resolver Self for calls chaining
	 */
	public function add_command( Ai1ec_Command $command ) {
		$this->_commands[] = $command;
		return $this;
	}

	/**
	 * Return the command to execute or false.
	 *
	 * @return Ai1ec_Command|null
	 */
	public function get_command() {
		foreach ( $this->_commands as $command ) {
			if ( $command->is_this_to_execute() ) {
				return $command;
			}
		}
		return null;
	}
}