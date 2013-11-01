<?php
/**
 * Helper for rendering templates using Twig.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Template
 */
class Ai1ec_Template_Helper {

	const ADMIN_VIEW_PATH = AI1EC_PATH . DIRECTORY_SEPARATOR . 'app' .
		DIRECTORY_SEPARATOR . 'view';

	/**
	 * @var array Ordered list of paths searched by loader to find template files.
	 */
	private $_paths = array();

	/**
	 * Creates a new template file helper. By default, searches admin views
	 * directory for template files.
	 *
	 * @param array $paths Ordered array of paths to search for matching templates
	 */
	public function __construct( $paths = array( ADMIN_VIEW_PATH ) ) {
		$this->_paths = $paths;
	}

	/**
	 * Adds the given search path to the end of the list (low priority).
	 *
	 * @param string $search_path Path to add to end of list
	 */
	public function appendPath( $search_path ) {
		$_paths[] = $search_path;
	}

	/**
	 * Adds the given search path to the front of the list (high priority).
	 *
	 * @param string $search_path Path to add to front of list
	 */
	public function prependPath( $search_path ) {
		array_push( $_paths, $search_path );
	}

	/**
	 * Renders the given template with the given data array.
	 *
	 * @param string $template Filename of template, relative to a search path
	 * @param array $variables Associative array of variable data to employ
	 * @return string Rendered template
	 */
	public function render( $template, $variables = array() ) {
		require_once AI1EC_PATH . DIRECTORY_SEPARATOR . 'vendor' .
			DIRECTORY_SEPARATOR . 'twig' . DIRECTORY_SEPARATOR . 'twig' .
			DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'Twig' .
			DIRECTORY_SEPARATOR . 'Autoloader.php';

		Twig_Autoloader::register();

		$loader = new Twig_Loader_Filesystem( $_paths );
		// TODO: Add cache support
		$twig = new Twig_Environment( $loader );

		return $twig->render( $template, $variables );
	}
}
