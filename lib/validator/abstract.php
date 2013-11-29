<?php
abstract class Ai1ec_Validator extends Ai1ec_Base {
	
	protected $_value;

	protected $_context;
	
	public function __construct( Ai1ec_Registry_Object $registry, $value, $context = array() ) {
		parent::__construct( $registry );
		$this->_value = $value;
		$this->_context = $context;
	}
	
	/**
	 * @throws Ai1ec_Value_Not_Valid_Exception if the velue is not valid.
	 * 
	 * @return mixed the validated value (allows to set it to default)
	 */
	abstract public function validate();
}