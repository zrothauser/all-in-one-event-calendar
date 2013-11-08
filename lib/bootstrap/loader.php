<?php

/**
 * Autoloader Class
 *
 * This class is responsible for loading all the requested class of the
 * system
 *
 * @author		 Time.ly Network, Inc.
 * @since			 2.0
 * @package		 Ai1EC
 * @subpackage Ai1EC.Loader
 */
class Ai1ec_Loader {

	CONST NEWINST    = 'n';
	CONST GLOBALINST = 'g';
	/**
	 * @var array Map of files to be included
	 */
	protected $_paths          = null;

	/**
	 * @var array Map of paths to ignore
	 */
	protected $_ignore_paths   = array(
		'/vendor' => true,
	);

	/**
	 * @var bool Set to true when internal state is changed
	 */
	protected $_modified       = false;

	/**
	 * @var array Map of files already included
	 */
	protected $_included_files = array();

	/**
	 * @var string The prefix used for the classes
	 */
	protected $_prefix         = null;

	/**
	 * @var string Base path to plugins core directory
	 */
	protected $_base_path      = null;

	/**
	 * load method
	 *
	 * Load given class, via `require`, into memory
	 *
	 * @param string $class Name of class, which needs to be loaded
	 *
	 * @return Ai1ec_Loader Instance of self for chaining
	 */
	public function load( $class ) {
		if ( isset( $this->_paths[$class] ) ) {
				$this->include_file( $this->_paths[$class]['f'] );
		}
		return $this;
	}

	/**
	 * Method which actually includes required file.
	 *
	 * The PHP language construct used is `require` and not a `require_once`,
	 * as this is internal method, which shall guard itself against incidents
	 * that may occur during loading classes more than once.
	 * During include additional callbacks may be fired to include related
	 * files, i.e. speed-up further requires.
	 *
	 * @param string $file Name of file to include
	 *
	 * @return Ai1ec_Loader Instance of self for chaining
	 */
	public function include_file( $file ) {
		if ( ! isset( $this->_included_files[$file] ) ) {
			$this->_included_files[$file] = true;
			require $file;
		}
		return $this->_included_files[$file];
	}

	/**
	 * collect_classes method
	 *
	 * Method to extract classes list from filesystem.
	 * Returned array contains names of class, as keys, and file entites as
	 * value, where *entities* means either a file name
	 * - {@see self::match_file()} for more.
	 *
	 * @return array Map of classes and corresponding file entites
	 */
	public function collect_classes() {
		$names = $this->_locate_all_files( $this->_base_path );
		$names = $this->_retrieve_instantiators( $names );
		$this->_cache( $names );
		return $names;
	}

	/**
	 * Gets the way classes must be instanciated.
	 * 
	 * Retrieves from annotations the way classes must be retrieved.
	 * Possible values are
	 *  - new: a new instance is instantiated every time
	 *  - global: treat as singleton
	 *  - classname.method: a factory is used, specify it in that order
	 * The default if nothing is specified is global.
	 * 
	 * @param array $names The class map.
	 * 
	 * @return array The classmap with instantiator.
	 */
	protected function _retrieve_instantiators( array $names ) {
		$this->_paths = $names;
		spl_autoload_register( array( $this, 'load' ) );
		foreach ( $names as $classname => &$data ) {
			// $this->include_file( $data['f'] );
			$r = new ReflectionClass( $data['c'] );
			$doc = $r->getDocComment();
			preg_match_all(
				'#^\s\*\s@instantiator\s+(.*)$#im',
				$doc,
				$annotations
			);
			$instantiator = '';
			if ( isset( $annotations[1][0] ) ) {
				$instantiator = rtrim( $annotations[1][0] );
			}
			$data['i'] = $this->_convert_instantiator_for_map( $instantiator );
		}
		return $names;
	}

	protected function _convert_instantiator_for_map( $instantiator ) {
		if ( empty( $instantiator ) || 'global' === $instantiator ) {
			return self::GLOBALINST;
		}
		if ( 'new' === $instantiator ) {
			return self::NEWINST;
		}
		return $instantiator;
	}
	/**
	 * _locate_all_files method
	 *
	 * Scan file system, given path, recursively, to search for files and
	 * extract `class` names from them.
	 *
	 * @param string $path File system path to scan
	 *
	 * @return array Map of classes and corresponding files
	 */
	protected function _locate_all_files( $path ) {
		$class_list = array();
		$directory	= opendir( $path );
		while ( false !== ( $entry = readdir( $directory ) ) ) {
			if ( '.' === $entry{0} ) {
					continue; // ignore hidden files
			}
			$local_path = $path . DIRECTORY_SEPARATOR . $entry;
			$base_path  = substr( $local_path, strlen( $this->_base_path ) );
			if ( isset( $this->_ignore_paths[$base_path] ) ) {
				continue;
			}
			if ( is_dir( $local_path ) ) {
				$class_list += $this->_locate_all_files( $local_path );
			} else {
				$class_list += $this->_extract_classes( $local_path );
			}
		}
		closedir( $directory );
		return $class_list;
	}

	/**
	 * _extract_classes method
	 *
	 * Extract names of classes from given file.
	 * So far only files ending in `.php` are processed and regular expression
	 * is used instead of `token_get_all` to increase parsing speed.
	 *
	 * @param string $file Name of file to scan
	 *
	 * @return array List of classes in file
	 */
	protected function _extract_classes( $file ) {
			$class_list = array();
			if ( '.php' === strrchr( $file, '.' ) ) {
				$tokens = token_get_all( file_get_contents( $file ) );
				for ( $i = 2, $count = count( $tokens ); $i < $count; $i++ ) {
					if (
						T_CLASS      === $tokens[$i - 2][0] ||
						T_INTERFACE  === $tokens[$i - 2][0] &&
						T_WHITESPACE === $tokens[$i - 1][0] &&
						T_STRING     === $tokens[$i][0]
					) {
						$names = $this->_generate_loader_names(
							$tokens[$i][1],
							$file
						);
						foreach ( $names as $name ) {
							$class_list[$name] = array(
								'f' => $file,
								'c' => $tokens[$i][1],
							);
						}
					}

				}
			}
			return $class_list;
	}

	/**
	 * Read/write cached classes map.
	 *
	 * If no entries are provided - acts as cache reader.
	 *
	 * @param array $entries Entries to write [optional=NULL]
	 *
	 * @return bool|array False on failure, true on success in writer
	 *		 mode, cached entry in reader mode on success
	 */
	protected function _cache( array $entries = NULL ) {
		$cache_file = dirname( __FILE__ ) . DIRECTORY_SEPARATOR .
			basename( __FILE__, '.php' ) . '-map.php';
		if ( $entries ) {
			if (
				is_file( $cache_file ) &&
				! is_writable( $cache_file ) ||
				! is_writable( dirname( $cache_file ) )
			) {
				return false;
			}
			ksort( $entries, SORT_STRING );
			$content = array(
				'0registered' => $this->_registered,
				'1class_map'  => $entries,
			);
			$content = var_export( $content, true );
			$content = $this->_sanitize_paths( $content );
			$content = '<?php return ' . $content . ';';
			$this->_modified = false;
			if (
				false === file_put_contents( $cache_file, $content, LOCK_EX )
			) { // LOCK_EX is not supported on all hosts (streams)
				return (bool)file_put_contents( $cache_file, $content );
			}
			return true;
		}
		if ( ! is_file( $cache_file ) ) {
			return false;
		}
		$cached = ( require $cache_file );
		$this->_registered = $cached['0registered'];
		return $cached['1class_map'];
	}

	/**
	 * _sanitize_paths method
	 *
	 * Sanitize paths before writing to cache file.
	 * Make sure, that constants and absolute paths are used independently
	 * of system used, thus making file cross-platform generatable.
	 *
	 * @param string $content Output to be written to cache file
	 *
	 * @return string Modified content, with paths replaced
	 */
	protected function _sanitize_paths( $content ) {
		$local_ds   = '/';
		$ai1ec_path = $this->_base_path;
		if ( '\\' === DIRECTORY_SEPARATOR ) {
			$local_ds   = '\\\\';
			$ai1ec_path = str_replace( '\\', '\\\\', $ai1ec_path );
		}
		$content = str_replace(
			'\'' . $ai1ec_path . $local_ds,
			'AI1EC_PATH . DIRECTORY_SEPARATOR . \'',
			$content
		);
		$content = str_replace(
			$local_ds,
			'\' . DIRECTORY_SEPARATOR . \'',
			$content
		);
		return $content;
	}

	/**
	 * Generate all the alternatives name that the loaded recognize.
	 *
	 * For example:
	 * The class Ai1ec_Html_Helper can be loaded as
	 * - html.helper ( the path to the file )
	 * - Ai1ec_Html_Helper ( needed by Autoload )
	 *
	 * @params string $class_name the original name of the class.
	 *
	 * @return array An array of strings with the availables names.
	 */
	protected function _generate_loader_names( $class, $file ) {
		$names = array( $class );
		// Remove the extension.
		$file = substr( $file, 0, strrpos( $file , '.') );
		// Get just the meaningful data.
		$file = substr( $file, strrpos( 
				$file, 
				DIRECTORY_SEPARATOR . AI1EC_PLUGIN_NAME . DIRECTORY_SEPARATOR
			) + 31
		);
		$names[] = str_replace( DIRECTORY_SEPARATOR, '.', $file );
		return $names;
	}

	/**
	 * Translate the key to the actual class name if any
	 *
	 * @param $key string Key requested to initialize
	 *
	 * @return array|null Array of the class, or null if none is found
	 */
	public function resolve_class_name( $key ) {
		if ( ! isset( $this->_paths[$key] ) ) {
			return null;
		}
		return $this->_paths[$key];
	}

	/**
	 * Update cache if object was modified
	 *
	 * @return void Destructor does not return
	 */
	public function __destruct() {
		if ( $this->_modified ) {
			$this->_cache( $this->_paths );
		}
	}

	/**
	 * Register external class map to use in loading sequence
	 *
	 * @param string $file Path to class map
	 *
	 * @return bool Success loading it
	 */
	public function register_map( $file ) {
		if (
			isset( $this->_registered[$file] ) && (
				! defined( 'AI1EC_DEBUG' ) ||
				! AI1EC_DEBUG
			)
		) {
			return true;
		}
		if ( ! is_file( $file ) ) {
			return false;
		}
		$entries = ( require $file );
		foreach ( $entries as $class_name => $file_path ) {
			$this->_paths[$class_name] = array(
				'c' => $class_name,
				'f' => $file_path,
			);
		}
		$this->_registered[$file] = true;
		$this->_modified          = true;
		return true;
	}

	/**
	 * Constructor
	 *
	 * Initialize the loader creating the map of available classes, if the
	 * AI1EC_DEBUG constants is true the list is regenerated
	 *
	 * @throws Exception if the map is invalid
	 *
	 * @return void Constructor does not return
	 */
	public function __construct( $base_path ) {
		$this->_base_path = $base_path;
		$this->_prefix = explode( '_', __CLASS__ );
		$this->_prefix = $this->_prefix[0];
		$class_map = $this->_cache();
		if (
			! is_array( $class_map ) ||
			defined( 'AI1EC_DEBUG' ) && AI1EC_DEBUG
		) {
			if ( ! defined( 'AI1EC_DEBUG' ) || ! AI1EC_DEBUG ) {
				// using generic `Ai1ec_Exception` as others are, potentially,
				// not resolved at this time.
				throw new Ai1ec_Exception(
					'Generated class map is invalid: ' .
					var_export( $class_map, true )
				);
			}
			$class_map = $this->collect_classes();
		}
		$this->_paths = $class_map;
	}

}