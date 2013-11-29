<?php
/**
 * Abstract class for a file.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Theme.File
 */
abstract class Ai1ec_File_Abstract extends Ai1ec_Base {

	/**
	 * @var array the paths where to look for the file.
	 */
	protected  $_paths;

	/**
	 * @var string the name of the file.
	 */
	protected $_name;

	/**
	 * @var mixed The content of the file.
	 * Usually it's a string but for some edge cases it might be a PHP type like an array
	 * The only case now is user_variables.php for Less
	 */
	protected $_content;

	/**
	 * Locate the files and parses it's content. Populates $this->_content.
	 *
	 * @return boolean Returns true if the file is found, false otheriwse.
	 */
	abstract public function process_file();

	/**
	 * Standard constructor for basic files.
	 *
	 * @param string $name
	 * @param array $paths
	 */
	public function __construct(
		Ai1ec_Registry_Object $registry,
		$name,
		array $paths
		) {
		$this->_paths = $paths;
		$this->_name  = $name;
	}

	/**
	 * Renders the content of the file to the screen.
	 */
	public function render() {
		echo $this->_content;
	}


	/**
	 * @return mixed the parsed content of the file.
	 */
	public function get_content() {
		return $this->_content;
	}

	/**
	 * Just in case you want to echo the object.
	 */
	public function __toString() {
		$this->get_content();
	}
}