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

	/**
	 * @var object Twig environment for this helper.
	 */
	protected $_twig;

	/**
	 * Creates a new template file helper. By default, searches admin views
	 * directory for template files.
	 *
	 * @param array $paths Ordered array of paths to search for matching templates
	 */
	public function __construct( $paths = array( ADMIN_VIEW_PATH ) ) {
		// TODO: Maybe class registration should be done statically (once)? Where?
		require_once AI1EC_PATH . DIRECTORY_SEPARATOR . 'vendor' .
			DIRECTORY_SEPARATOR . 'twig' . DIRECTORY_SEPARATOR . 'twig' .
			DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'Twig' .
			DIRECTORY_SEPARATOR . 'Autoloader.php';

		Twig_Autoloader::register();

		// Set up Twig environment.
		$loader = new Twig_Loader_Filesystem( $paths );
		// TODO: Add cache support.
		$this->_twig = new Twig_Environment( $loader );

		// Add translation filter.
		$filter = new Twig_SimpleFilter( '__', 'Ai1ec_I18n::__' );
		$this->_twig->addFilter( $filter );
	}

	/**
	 * Adds the given search path to the end of the list (low priority).
	 *
	 * @param string $search_path Path to add to end of list
	 */
	public function appendPath( $search_path ) {
		$loader = $this->_twig->getLoader();
		$loader->addPath( $search_path );
	}

	/**
	 * Adds the given search path to the front of the list (high priority).
	 *
	 * @param string $search_path Path to add to front of list
	 */
	public function prependPath( $search_path ) {
		$loader = $this->_twig->getLoader();
		$loader->prependPath( $search_path );
	}

	/**
	 * Renders the given template with the given data array.
	 *
	 * @param string $template Filename of template, relative to a search path
	 * @param array $variables Associative array of variable data to employ
	 * @return string Rendered template
	 */
	public function render( $template, $variables = array() ) {
		return $this->_twig->render( $template, $variables );
	}
}
