<?php
/**
 * Handle finding CSS/(LEss files.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Theme.File
 */
class Ai1ec_File_Less extends Ai1ec_File_Abstract {

	/**
	 * @var string The default CSS folder.
	 */
	const THEME_CSS_FOLDER = 'css';

	/**
	 * @var strinf The default less folder.
	 */
	const THEME_LESS_FOLDER = 'less';

	/* (non-PHPdoc)
	 * @see Ai1ec_File_Abstract::locate_file()
	 */
	public function process_file() {
		/**
		 * First it looks if there is a css file in the directory of the current theme.
		 * Then it looks for a less version in the directory of the current theme
		 * Then it looks for a less file into the default theme folder
		 */
		$active_css_folder    = $this->_paths['active'] . self::THEME_CSS_FOLDER;
		$active_less_folder   = $this->_paths['active'] . self::THEME_LESS_FOLDER;
		$standard_less_folder = $this->_paths['default'] . self::THEME_LESS_FOLDER;
		$name = $this->_name;
		$css_file  = $name . '.css';
		$less_file = $name . '.less';

		// Look up file. Start with CSS & LESS files in selected theme, then resort
		// to default theme's LESS file.
		$files_to_check = array(
			$active_css_folder  . DIRECTORY_SEPARATOR . $css_file,
			$active_less_folder . DIRECTORY_SEPARATOR . $less_file,
			$active_less_folder . DIRECTORY_SEPARATOR . $less_file,
		);

		foreach ( $files_to_check as $file_to_check ) {
			if ( file_exists( $file_to_check ) ) {
				$this->_content = file_get_contents($file_to_check );
				return true;
			}
		}
		return false;
	}
}
