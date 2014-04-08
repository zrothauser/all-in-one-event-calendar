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

		// Add default theme's directory/URL if it is not the active one.
		if ( AI1EC_DEFAULT_THEME_NAME !== $theme['stylesheet'] ) {
			$this->add_path_theme(
				AI1EC_DEFAULT_THEME_PATH . DIRECTORY_SEPARATOR,
				AI1EC_THEMES_URL . '/' . AI1EC_DEFAULT_THEME_NAME
			);
		}
		// Add active theme's directory/URL (later additions take priority).
		$this->add_path_theme(
			$theme['theme_dir'] . DIRECTORY_SEPARATOR,
			$theme['theme_url'] . '/'
		);
	}

	/**
	 * Add file search path to front of list.
	 *
	 * @param string $target Name of path purpose, i.e. 'admin' or 'theme'.
	 * @param string $path   Absolute path to the directory to search.
	 * @param string $url    URL to the directory represented by $path.
	 *
	 * @return bool Success.
	 */
	public function add_path( $target, $path, $url ) {
		if ( ! isset( $this->_paths[$target] ) ) {
			return false;
		}
		$this->_paths[$target] = array( $path => $url ) + $this->_paths[$target];
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
	 * @param string $path Path to theme template files.
	 * @param string $url  URL to the directory represented by $path.
	 *
	 * @return bool Success.
	 */
	public function add_path_theme( $path, $url ) {
		return $this->add_path( 'theme', $path, $url );
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

		// Add default theme to search paths unless it is the active theme.
		$option = $this->_registry->get( 'model.option' );
		$theme  = $option->get( 'ai1ec_current_theme' );
		if ( AI1EC_DEFAULT_THEME_NAME !== $theme['stylesheet'] ) {
			$this->add_path_theme(
				$path . $D . 'public' . $D . AI1EC_THEME_FOLDER . $D .
					AI1EC_DEFAULT_THEME_NAME . $D,
				$url . '/public/' . AI1EC_THEME_FOLDER . '/' . AI1EC_DEFAULT_THEME_NAME
			);
		}
		// Add extension's theme path(s) (takes priority over the above).
		$this->add_path_theme(
			$path . $D . 'public' . $D . AI1EC_THEME_FOLDER . $D .
				$theme['stylesheet'] . $D,
			$url . '/public/' . AI1EC_THEME_FOLDER . '/' . $theme['stylesheet'] . '/'
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
	 * @param array  $paths           For PHP & Twig files only: list of paths to use instead of default.
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
						$this->_get_twig_instance( $paths )
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
		return $this->_get_twig_instance( $paths );
	}

	/**
	 * This method whould be in a factory called by the object registry.
	 * I leave it here for reference.
	 *
	 * @param array $paths Array of paths to search
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

			$this->_twig = new Twig_Environment( $loader, $environment );
			if ( apply_filters( 'ai1ec_twig_add_debug', AI1EC_DEBUG ) ) {
				$this->_twig->addExtension( new Twig_Extension_Debug() );
			}

			$extension = $this->_registry->get( 'twig.ai1ec-extension' );
			$extension->set_registry( $this->_registry );
			$this->_twig->addExtension( $extension );
		}
		return $this->_twig;
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
