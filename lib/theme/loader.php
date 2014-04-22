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
		'admin' => array( AI1EC_ADMIN_PATH => AI1EC_ADMIN_URL ),
		'theme' => array(),
	);

	/**
	 * @var Ai1ec_Registry_Object The registry Object.
	 */
	protected $_registry;

	/**
	 * @var array Array of Twig environments.
	 */
	protected $_twig = array();

	/**
	 * @var bool Whether this theme uses .php templates instead of .twig
	 */
	protected $_legacy_theme = false;

	/**
	 * @var bool Whether this theme is a child of the default theme
	 */
	protected $_child_theme = false;

	/**
	 * @var bool Whether this theme is a core theme
	 */
	protected $_core_theme = false;

	/**
	 * @return boolean
	 */
	public function is_legacy_theme() {
		return $this->_legacy_theme;
	}

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
		$this->_legacy_theme     = (bool)$theme['legacy'];

		// Find out if this is a core theme.
		$core_themes             = explode( ',', AI1EC_CORE_THEMES );
		$this->_core_theme       = in_array( $theme['stylesheet'], $core_themes );

		// Default theme's path is always the last in the list of paths to check,
		// so add it first (path list is a stack).
		$this->add_path_theme(
			AI1EC_DEFAULT_THEME_PATH . DIRECTORY_SEPARATOR,
			AI1EC_THEMES_URL . '/' . AI1EC_DEFAULT_THEME_NAME . '/'
		);

		// If using a child theme, set flag and push its path to top of stack.
		if ( AI1EC_DEFAULT_THEME_NAME !== $theme['stylesheet'] ) {
			$this->_child_theme = true;
			$this->add_path_theme(
				$theme['theme_dir'] . DIRECTORY_SEPARATOR,
				$theme['theme_url'] . '/'
			);
		}
	}

	/**
	 * Adds file search path to list. If an extension is adding this path, and
	 * this is a custom child theme, inserts its path at the second index of the
	 * list. Else pushes it onto the top of the stack.
	 *
	 * @param string $target       Name of path purpose, i.e. 'admin' or 'theme'.
	 * @param string $path         Absolute path to the directory to search.
	 * @param string $url          URL to the directory represented by $path.
	 * @param string $is_extension Whether an extension is adding this page.
	 *
	 * @return bool Success.
	 */
	public function add_path( $target, $path, $url, $is_extension = false ) {
		if ( ! isset( $this->_paths[$target] ) ) {
			// Invalid target.
			return false;
		}

		// New element to insert into associative array.
		$new = array( $path => $url );

		if (
			true  === $is_extension &&
			true  === $this->_child_theme &&
			false === $this->_core_theme
		) {
			// Special case: extract first element into $head and insert $new after.
			$head = array_splice( $this->_paths[$target], 0, 1 );
		} else {
			// Normal case: $new gets pushed to the top of the array.
			$head = array();
		}

		$this->_paths[$target] = $head + $new + $this->_paths[$target];
		return true;
	}

	/**
	 * Add admin files search path.
	 *
	 * @param string $path Path to admin template files.
	 * @param string $url  URL to the directory represented by $path.
	 *
	 * @return bool Success.
	 */
	public function add_path_admin( $path, $url ) {
		return $this->add_path( 'admin', $path, $url );
	}

	/**
	 * Add theme files search path.
	 *
	 * @param string $path         Path to theme template files.
	 * @param string $url          URL to the directory represented by $path.
	 * @param string $is_extension Whether an extension is adding this path.
	 *
	 * @return bool Success.
	 */
	public function add_path_theme( $path, $url, $is_extension = false ) {
		return $this->add_path( 'theme', $path, $url, $is_extension );
	}

	/**
	 * Extension registration hook to automatically add file paths.
	 *
	 * NOTICE: extensions are expected to exactly replicate Core directories
	 * structure. If different extension is to be developed at some point in
	 * time - this will have to be changed.
	 *
	 * @param string $path Absolute path to extension's directory.
	 * @param string $url  URL to directory represented by $path.
	 *
	 * @return Ai1ec_Theme_Loader Instance of self for chaining.
	 */
	public function register_extension( $path, $url ) {
		$D = DIRECTORY_SEPARATOR; // For readability.

		// Add extension's admin path.
		$this->add_path_admin(
			$path . $D .'public' . $D . 'admin' . $D,
			$url . '/public/admin/'
		);

		// Add extension's theme path(s).
		$option = $this->_registry->get( 'model.option' );
		$theme  = $option->get( 'ai1ec_current_theme' );

		// Default theme's path is always later in the list of paths to check,
		// so add it first (path list is a stack).
		$this->add_path_theme(
			$path . $D . 'public' . $D . AI1EC_THEME_FOLDER . $D .
				AI1EC_DEFAULT_THEME_NAME . $D,
			$url . '/public/' . AI1EC_THEME_FOLDER . '/' . AI1EC_DEFAULT_THEME_NAME .
				'/',
			true
		);

		// If using a core child theme, set flag and push its path to top of stack.
		if ( true === $this->_child_theme && true === $this->_core_theme ) {
			$this->add_path_theme(
				$path . $D . 'public' . $D . AI1EC_THEME_FOLDER . $D .
					$theme['stylesheet'] . $D,
				$url . '/public/' . AI1EC_THEME_FOLDER . '/' . $theme['stylesheet'] .
					'/',
				true
			);
		}
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
	 * @param array  $paths           For PHP & Twig files only: list of paths to use instead of default.
	 *
	 * @throws Ai1ec_Exception If File is not found or not possible to handle.
	 *
	 * @return Ai1ec_File_Abstract An instance of a file object with content parsed.
	 */
	public function get_file(
		$filename,
		$args            = array(),
		$is_admin        = false,
		$throw_exception = true,
		array $paths     = null
	) {
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
					array_keys( $this->_paths['theme'] ) // Values (URLs) not used for CSS
				);
				break;

			case 'png':
			case 'gif':
			case 'jpg':
				$paths = $is_admin ? $this->_paths['admin'] : $this->_paths['theme'];
				$file  = $this->_registry->get(
					'theme.file.image',
					$filename,
					$paths // Paths => URLs needed for images
				);
				break;

			case 'php':
				if ( null === $paths ) {
					$paths = $is_admin ? $this->_paths['admin'] : $this->_paths['theme'];
					$paths = array_keys( $paths ); // Values (URLs) not used for PHP
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
				if ( null === $paths ) {
					$paths = $is_admin ? $this->_paths['admin'] : $this->_paths['theme'];
					$paths = array_keys( $paths ); // Values (URLs) not used for Twig
				}
				if ( true === $this->_legacy_theme && ! $is_admin ) {
					$filename = substr( $filename, 0, $dot_position - 1);
					$file     = $this->_get_legacy_file(
						$filename,
						$args,
						$paths
					);
				} else {
					$file = $this->_registry->get(
						'theme.file.twig',
						$filename,
						$args,
						$this->_get_twig_instance( $paths, $is_admin )
					);
				}
				break;

			default:
				throw new Ai1ec_Exception(
					sprintf(
						Ai1ec_I18n::__( "We couldn't find a suitable loader for filename with extension '%s'" ),
						$ext
					)
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
	 * Tries to load a PHP file from the theme. If not present, it falls back to
	 * Twig.
	 *
	 * @param string $filename Filename to locate
	 * @param array  $args     Args to pass to template
	 * @param array  $paths    Array of paths to search
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
				$this->_get_twig_instance( $paths, false )
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
	 * Get Twig instance.
	 *
	 * @param bool $is_admin Set to true for admin views.
	 * @param bool $refresh  Set to true to get fresh instance.
	 *
	 * @return Twig_Environment Configured Twig instance.
	 */
	public function get_twig_instance( $is_admin = false, $refresh = false ) {
		if ( $refresh ) {
			unset( $this->_twig );
		}
		$paths = $is_admin ? $this->_paths['admin'] : $this->_paths['theme'];
		$paths = array_keys( $paths ); // Values (URLs) not used for Twig
		return $this->_get_twig_instance( $paths, $is_admin );
	}

	/**
	 * This method whould be in a factory called by the object registry.
	 * I leave it here for reference.
	 *
	 * @param array $paths Array of paths to search
	 * @param bool  $is_admin whether to use the admin or not admin Twig instance
	 *
	 * @return Twig_Environment
	 */
	protected function _get_twig_instance( array $paths, $is_admin ) {
		$instance = $is_admin ? 'admin' : 'front';
		if ( ! isset( $this->_twig[$instance] ) ) {

			// Set up Twig environment.
			$loader_path = array();

			foreach ( $paths as $path ) {
				if ( is_dir( $path . 'twig' . DIRECTORY_SEPARATOR ) ) {
					$loader_path[] = $path . 'twig' . DIRECTORY_SEPARATOR;
				}
			}

			$loader = new Twig_Loader_Filesystem( $loader_path );
			unset( $loader_path );
			$option                        = $this->_registry->get( 'model.option' );
			$option_cache_dir_is_writeable = (bool)$option->get( 'ai1ec_cache_writeable' ); // read cached option

			// check in admin dashboard if cache path is writeable and save it as an option
			if ( 'admin' === $instance ) {
				$cache_dir_is_writeable = is_writable( AI1EC_TWIG_CACHE_PATH );
				$cache_path             = ( $cache_dir_is_writeable ) ? AI1EC_TWIG_CACHE_PATH : false;
				if ( $cache_dir_is_writeable !== $option_cache_dir_is_writeable ) {
					$option->set( 'ai1ec_cache_writeable', $cache_dir_is_writeable );					
				}
                        } else {
				// for frontend requests always use value from option
				$cache_path = ( true === $option_cache_dir_is_writeable ) ? AI1EC_TWIG_CACHE_PATH : false; 
                        }

			// TODO: Add cache support.
			$environment = array(
				'cache'            => $cache_path,
				'optimizations'    => -1,   // all
				'auto_reload'      => false,
			);
			if ( AI1EC_DEBUG ) {
				$environment += array(
					'debug' => true, // produce node structure
				);
				// auto_reload never worked well
				$environment['cache'] = false;
			}
			$environment = apply_filters(
				'ai1ec_twig_environment',
				$environment
			);

			$this->_twig[$instance] = new Twig_Environment( $loader, $environment );
			if ( apply_filters( 'ai1ec_twig_add_debug', AI1EC_DEBUG ) ) {
				$this->_twig[$instance]->addExtension( new Twig_Extension_Debug() );
			}

			$extension = $this->_registry->get( 'twig.ai1ec-extension' );
			$extension->set_registry( $this->_registry );
			$this->_twig[$instance]->addExtension( $extension );
		}
		return $this->_twig[$instance];
	}

	/**
	 * Called during 'after_setup_theme' action. Runs theme's special
	 * functions.php file, if present.
	 */
	public function execute_theme_functions() {
		$option    = $this->_registry->get( 'model.option' );
		$theme     = $option->get( 'ai1ec_current_theme' );
		$functions = $theme['theme_dir'] . DIRECTORY_SEPARATOR . 'functions.php';

		if ( file_exists( $functions ) ) {
			include( $functions );
		}
	}
}
