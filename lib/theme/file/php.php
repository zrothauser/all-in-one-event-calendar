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
class Ai1ec_File_Php extends Ai1ec_File_Abstract {

	/**
	 * @var array the arguments used by the PHP template.
	 */
	private $_args;

	/**
	 * Initialize class specific variables.
	 *
	 * @param string $name
	 * @param array $paths
	 * @param array $args
	 */
	public function __construct(
			$name,
			array $paths,
			array $args
	) {
		parent::__construct( $name, $paths );
		$this->_args  = $args;
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_File_Abstract::locate_file()
	 */
	public function process_file() {
		$files_to_check = array();
		foreach ( array_values( $this->_paths ) as $path ) {
			$files_to_check[] = $path . DIRECTORY_SEPARATOR . $this->_name;
		}
		foreach ( $files_to_check as $file ) {
			if ( file_exists( $file ) ) {
				if ( 'user_variabels.php' === $this->_name ) {
					// it's the user variables file for now.
					require( $file );
					$this->_content = $less_user_variables;
				} else {
					ob_start();
					extract( $this->_args );
					require( $file );
					$this->_content = ob_get_contents();
					ob_end_clean();
				}
				return true;
			}
		}
		return false;
	}
}