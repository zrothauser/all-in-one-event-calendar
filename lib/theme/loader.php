<?php
class Ai1ec_Theme_Loader {

	protected $_paths = array();

	public function __construct() {
		
	}
	
	public function add_path( $path ) {
		$this->_paths[] = $path;
	}
	
	public function discover_themes() {
		
	}
	
	public function get_file( $filename, $args = array(), $is_admin = false ) {
		
	}
}