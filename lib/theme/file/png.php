<?php

/**
 * Handle finding and parsing a PHP file.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 * @instantiator new
 * @package    AI1EC
 * @subpackage AI1EC.Theme.File
 */
class Ai1ec_File_Png extends Ai1ec_File_Abstract {

	/**
	 * @var string The url of the png file
	 */
	protected $_url;

	/**
	 * Get the url
	 * 
	 * @return string
	 */
	public function get_url() {
		return $this->_url;
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_File_Abstract::locate_file()
	*/
	public function process_file() {
		$files_to_check = array();
		foreach ( array_values( $this->_paths ) as $path ) {
			$files_to_check[$path] = $path . '/img/' . $this->_name;
		}
		foreach ( $files_to_check as $path => $file ) {
			if ( file_exists( $file ) ) {
				$exploded = explode( DIRECTORY_SEPARATOR, $path );
				$this->_url = AI1EC_DEFAULT_THEME_URL . end( $exploded ) . '/' . $this->_name;
				$this->_content = $file;
				return true;
			}
		}
		return false;
	}
}