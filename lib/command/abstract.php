<?php

/**
 *
 * @author nicola
 *        
 */
abstract class Ai1ec_Command {
	
	protected $_registry;
	
	protected $_request;

	/**
	 * @var Ai1ec_Http_Response_Render_Strategy
	 */
	protected $_render_strategy;
	/**
	 */
	public function __construct( $registry, $request ) {
		$this->_registry = $registry;
		$this->_request = $request;
		$type = $request->get( 'type' );
		$this->_render_strategy = $registry->get( 'http.response.render.strategy.' . $type );
	}
	

	public function execute() {
		// get the data from the concrete implementation
		$data = $this->do_execute();
		// render it.
		$this->_render_strategy->render( $data );
	}

	abstract public function do_execute();
	
	/**
	 * Returns whether this is the command to be executed.
	 * 
	 * I handle the logi of execution at this levele, which is not usual for
	 * The front controller pattern, because othe extensions need to inject
	 * logic into the resolver ( oAuth or ics export for instance )
	 * and this seems to me to be the most logical way to do this.
	 * 
	 * @param Ai1ec_Request_Parser $request
	 * @param unknown $registry
	 */
	abstract public function is_this_to_execute();
}

?>