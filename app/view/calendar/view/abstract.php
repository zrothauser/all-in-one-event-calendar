<?php 

abstract class Ai1ec_Calendar_View_Abstract extends Ai1ec_Base {
	
	protected $_request;
	
	public function __construct( Ai1ec_Registry_Object $registry, Ai1ec_Request_Parser $request ) {
		parent::__construct( $registry );
		$this->_request = $request;
	}
}