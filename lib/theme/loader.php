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
		'theme' => array(),
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
	 * @var bool
	 */
	protected $_legacy_theme = false;

	/**
	 * @return boolean
	 */
	public function is_legacy_theme() {
		return $this->_legacy_theme;
	}

	/**
	 * @var array the core calendar themes
	 */
	static protected $_core_themes = array(
		'vortex' => true,
		'umbra' => true,
		'gamma' => true,
		'plana' => true,
	);

	/**
	 *
	 * @param $registry Ai1ec_Registry_Object
	 *       	 The registry Object.
	 */
	public function __construct( 
			Ai1ec_Registry_Object $registry
		) {
		$this->_registry         = $registry;
		$option                  = $this->_registry->get( 'model.option' );
		$theme                   = $option->get( 'ai1ec_current_theme' );
		$active_theme            = $theme['stylesheet'];
		$this->_legacy_theme     = (bool)$theme['legacy'];
		$this->add_path_theme( $theme['theme_dir'] . DIRECTORY_SEPARATOR );
		if ( AI1EC_DEFAULT_THEME_NAME !== $active_theme ) {
			$this->add_path_theme(
				AI1EC_DEFAULT_THEME_PATH . DIRECTORY_SEPARATOR
			);
		}
	}

	/**
	 * Add theme loading path.
	 *
	 * @param string $path   Absolute path to the template files directory.
	 * @param string $target Name of path purpose, i.e. 'admin' or 'theme'.
	 *
	 * @return bool Success.
	 */
	public function add_path( $path, $target ) {
		if ( ! isset( $this->_paths[$target] ) ) {
			return false;
		}
		array_unshift( $this->_paths[$target], $path );
		return true;
	}

	/**
	 * Add admin templates files path.
	 *
	 * @param string $path Path to admin template files.
	 *
	 * @return bool Success.
	 */
	public function add_path_admin( $path ) {
		return $this->add_path( $path, 'admin' );
	}

	/**
	 * Add theme templates files path.
	 *
	 * @param string $path Path to theme template files.
	 *
	 * @return bool Success.
	 */
	public function add_path_theme( $path ) {
		return $this->add_path( $path, 'theme' );
	}

	/**
	 * Extension registration hook to automatically add file paths.
	 *
	 * NOTICE: extensions are expected to exactly replicate Core directories
	 * structure. If different extension is to be developed at some point in
	 * time - this will have to be changed.
	 *
	 * @param string $path Absolute path to extensions directory.
	 *
	 * @return Ai1ec_Theme_Loader Instance of self for chaining.
	 */
	public function register_extension( $path ) {
		$this->add_path_admin(
			$path . 'public' . DIRECTORY_SEPARATOR . 'admin' .
			DIRECTORY_SEPARATOR
		);
		$this->add_path_theme(
			$path . 'public' . DIRECTORY_SEPARATOR . 'themes' .
			DIRECTORY_SEPARATOR . AI1EC_DEFAULT_THEME_NAME . DIRECTORY_SEPARATOR
		);
		return $this;
	}

	/**
	 * Get the requested file from the filesystem.
	 *
	 * Get the requested file from the filesystem. The file is already parsed.
	 *
	 * @param string $filename        Name of file to load.
	 * @param array  $args            Map of variables to use in file.
	 * @param bool   $is_admin        Set to true for admin-side views.
	 * @param bool   $throw_exception Set to true to throw exceptions on error.
	 * @param array  $paths           List of paths to use instead of  default.
	 *
	 * @throws Ai1ec_Exception If File is not found or not possible to handle.
	 *
	 * @return Ai1ec_File_Abstract An instance of a file object with content parsed.
	 */
	public function get_file( 
		$filename,
		$args            = array(),
		$is_admin        = null,
		$throw_exception = true,
		array $paths     = null
	) {
		if ( null === $is_admin ) {
			$is_admin = is_admin();
		}
		$dot_position = strrpos( $filename, '.' ) + 1;
		$ext          = substr( $filename, $dot_position );
		$file         = false;
		switch ( $ext ) {
			case 'less':
			case 'css':
				$filename = substr( $filename, 0, $dot_position - 1);
				$file     = $this->_registry->get(
					'theme.file.less',
					$filename,
					$this->_paths['theme']
				 );
				break;
			case 'png':
				$paths = $is_admin ? $this->_paths['admin'] : $this->_paths['theme'];
				$file  = $this->_registry->get(
					'theme.file.png',
					$filename,
					$paths
				);
				break;
			case 'php':
				if ( null === $paths) {
					$paths = $is_admin
						? $this->_paths['admin']
						: $this->_paths['theme'];
				}
				$args['is_legacy_theme'] = $this->_legacy_theme;
				$file                    = $this->_registry->get(
					'theme.file.php',
					$filename,
					$paths,
					$args
				);
				break;
			case 'twig':
				if ( null === $paths) {
					$paths = $is_admin
						? $this->_paths['admin']
						: $this->_paths['theme'];
				}

				if ( true === $this->_legacy_theme && ! $is_admin ) {
					$filename = substr( $filename, 0, $dot_position - 1);
					$file     = $this->_get_legacy_file(
						$filename,
						$args,
						$this->_paths['theme']
					);
				} else {
					$file = $this->_registry->get(
						'theme.file.twig',
						$filename,
						$args,
						$this->_get_twig_instance( $paths )
					);
				}
				break;
			default:
				throw new Ai1ec_Exception(
					'We couldn\t find a suitable class for extension ' . $ext
				);
				break;
		}

		// here file is a concrete class otherwise the exception is thrown
		if ( ! $file->process_file() && true === $throw_exception ) {
			throw new Ai1ec_Exception(
				'The specified file "' . $filename . '" doesn\'t exist.'
			);
		}
		return $file;
	}

	/**
	 * Tries to load a php file from the theme. if not present, it falls back to twig
	 * 
	 * @param string $filename
	 * @param array $args
	 * @param array $paths
	 * 
	 * @return Ai1ec_File_Abstract
	 */
	protected function _get_legacy_file( $filename, array $args, array $paths ) {
		$php_file = $filename . '.php';
		$php_file = $this->get_file( $php_file, $args, false, false, $paths );
		
		if ( false === $php_file->process_file() ) {
			$twig_file = $this->_registry->get(
				'theme.file.twig',
				$filename . '.twig',
				$args,
				$this->_get_twig_instance( $paths )
			);
			
			// here file is a concrete class otherwise the exception is thrown
			if ( ! $twig_file->process_file() ) {
				throw new Ai1ec_Exception(
					'The specified file "' . $filename . '" doesn\'t exist.'
				);
			}
			return $twig_file;
		}
		return $php_file;
	}

	/**
	 * This method whould be in a factory called by the object registry.
	 * I leave it here for reference.
	 *
	 * @param array $paths
	 *
	 * @return Twig_Environment
	 */
	protected function _get_twig_instance( array $paths ) {

		if ( ! isset( $this->_twig ) ) {

			// Set up Twig environment.
			$loader_path = array();

			foreach ( $paths as $path ) {
				if ( is_dir( $path . 'twig' . DIRECTORY_SEPARATOR ) ) {
					$loader_path[] = $path . 'twig' . DIRECTORY_SEPARATOR;
				}
			}

			$loader = new Twig_Loader_Filesystem( $loader_path );
			unset( $loader_path );

			// TODO: Add cache support.
			$environment = array(
				'cache'            => AI1EC_TWIG_CACHE_PATH,
				'optimizations'    => -1,   // all
			);
			if ( AI1EC_DEBUG ) {
				$environment += array( 
					'debug' => true, // produce node structure
				);
				// auto_reload never worked well
				$environment['cache'] = false;
			}

			$this->_twig = new Twig_Environment( $loader, $environment );
			if ( AI1EC_DEBUG ) {
				$this->_twig->addExtension( new Twig_Extension_Debug() );
			}

			$extension = $this->_registry->get( 'twig.ai1ec-extension' );
			$extension->set_registry( $this->_registry );
			$this->_twig->addExtension( $extension );
		}
		return $this->_twig;
	}

}