<?php
/**
 * Loads files for admin and frontend.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Theme
 */
class Ai1ec_Theme_Loader {

	/**
	 * @var array contains the admin and theme paths.
	 */
	protected $_paths = array(
		'admin' => array( AI1EC_ADMIN_PATH ),
		'theme' => array(
			'default' => AI1EC_DEFAULT_THEME_PATH,
		),
	);

	/**
	 * @var Ai1ec_Registry_Object The registry Object.
	 */
	protected $_registry;

	/**
	 * @var Twig_Environment Twig environment.
	 */
	protected $_twig;

	/**
	 * @param Ai1ec_Registry_Object $registry The registry Object.
	 * @param string $active_theme the currently active theme.
	 */
	public function __construct( Ai1ec_Registry_Object $registry, $active_theme = 'vortex' ) {
		$this->_registry = $registry;
		$this->_paths['theme']['active'] = $active_theme;
	}

	/**
	 * Get the requested file from the filesystem.
	 *
	 * Get the requested file from the filesystem. The file is already parsed.
	 *
	 * @param string $filename
	 * @param array  $args
	 * @param boolean $is_admin
	 *
	 * @throws Ai1ec_File_Not_Found If File is not found or not possible to handle
	 *
	 * @return Ai1ec_File An instance of a file object with content parsed.
	 */
	public function get_file( $filename, $args = array(), $is_admin = null ) {
		if ( null === $is_admin ) {
			$is_admin = is_admin();
		}
		$dot_position = strrpos( $filename, '.' ) + 1;
		$ext = substr( $filename, $dot_position );
		$file = false;
		switch ( $ext ) {
			case 'less':
			case 'css':
				$filename = substr( $filename, 0, $dot_position - 1);
				$file = $this->_registry->get(
					'theme.file.less',
					$filename,
					$this->_paths['theme']
				 );
				break;
			case 'php':
				$paths = $is_admin ? $this->_paths['admin'] : $this->_paths['theme'];
				$file = $this->_registry->get(
					'theme.file.php',
					$filename,
					$paths,
					$args
				);
				break;
			case 'twig':
				$paths = $is_admin ? $this->_paths['admin'] : $this->_paths['theme'];
				$file = $this->_registry->get(
					'theme.file.twig',
					$filename,
					$args,
					$this->get_twig_instance( $paths )
				);
				break;
			default:
				throw new Ai1ec_Exception(
					'We couldn\t find a suitable class for extension ' . $ext
				);
				break;
		}
		// here file is a concrete class otherwise the exception is thrown
		if ( ! $file->process_file() ) {
			throw new Ai1ec_Exception(
				'The specified file "' . $filename . '" doesn\'t exist.'
			);
		}
		return $file;
	}

	/**
	 * This method whould be in a factory called by the object registry.
	 * I leave it here for reference.
	 *
	 * @param array $paths
	 *
	 * @return Twig_Environment
	 */
	private function get_twig_instance( array $paths ) {

		if ( ! isset( $this->_twig ) ) {
			foreach ( $paths as &$path ) {
				$path .= 'twig' . DIRECTORY_SEPARATOR;
			}

			// Set up Twig environment.
			$loader = new Twig_Loader_Filesystem( $paths );
			// TODO: Add cache support.
			$this->_twig = new Twig_Environment( $loader );

			// Add translation filter.
			$filter = new Twig_SimpleFilter( '__', 'Ai1ec_I18n::__' );
			$this->_twig->addFilter( $filter );
		}
		return $this->_twig;
	}
}