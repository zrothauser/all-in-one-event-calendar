<?php
/**
 * The abstract command class.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Command
 */
abstract class Ai1ec_Command {
	
	/**
	 * @var Ai1ec_Object_Registry
	 */
	protected $_registry;
	
	/**
	 * @var Ai1ec_Request_Parser
	 */
	protected $_request;

	/**
	 * @var Ai1ec_Http_Response_Render_Strategy
	 */
	protected $_render_strategy;

	/**
	 * Public constructor, set the strategy according to the type.
	 * 
	 * @param Ai1ec_Object_Registry $registry
	 * @param Ai1ec_Request_Parser $request
	 */
	public function __construct( 
			Ai1ec_Object_Registry $registry, 
			Ai1ec_Request_Parser $request
	) {
		$this->_registry = $registry;
		$this->_request = $request;
		$type = $request->get( 'type' );
		$this->_render_strategy = $registry->get( 'http.response.render.strategy.' . $type );
	}

	/**
	 * Execute the command.
	 * 
	 * @return void
	 */
	public function execute() {
		// get the data from the concrete implementation
		$data = $this->do_execute();
		// render it.
		$this->_render_strategy->render( $data );
	}

	/**
	 * The abstract method concrete command must implement.
	 * 
	 * Retrieve whats needed and returns it
	 * 
	 * @return array
	 */
	abstract public function do_execute();
	
	/**
	 * Returns whether this is the command to be executed.
	 * 
	 * I handle the logi of execution at this levele, which is not usual for
	 * The front controller pattern, because othe extensions need to inject
	 * logic into the resolver ( oAuth or ics export for instance )
	 * and this seems to me to be the most logical way to do this.
	 * 
	 * @return boolean
	 */
	abstract public function is_this_to_execute();
}