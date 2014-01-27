<?php

/**
 * The abstract class for a view.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View
 */
abstract class Ai1ec_Calendar_View_Abstract extends Ai1ec_Base {
	
	/**
	 * @var Ai1ec_Request_Parser The request object
	 */
	protected $_request;
	
	/**
	 * Public constructor
	 * 
	 * @param Ai1ec_Registry_Object $registry
	 * @param Ai1ec_Request_Parser $request
	 */
	public function __construct( Ai1ec_Registry_Object $registry, Ai1ec_Request_Parser $request ) {
		parent::__construct( $registry );
		$this->_request = $request;
	}

	/**
	 * Get the machine name for the view
	 * 
	 * @return string The machine name of the view.
	 */
	abstract public function get_name();
	
	/**
	 * Get extra arguments specific for the view
	 * 
	 * @param array $view_args
	 * @param int|bool $exact_date the exact date used to display the view.
	 * 
	 * @return array The view arguments with the extra parameters added.\
	 */
	abstract public function get_extra_arguments( array $view_args, $exact_date );

	
	/**
	 * Render the view and return the content
	 * 
	 * @param array $view_args
	 * 
	 * @return string the html of the view
	 */
	abstract public function get_content( array $view_args );
}