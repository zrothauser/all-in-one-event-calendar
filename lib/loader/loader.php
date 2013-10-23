<?php

/**
* Autoloader Class
* 
* This class is responsible for loading all the requested class of the 
* system
*
* @author     Time.ly Network, Inc.
* @since      2.0
* @package    Ai1EC
* @subpackage Ai1EC.Loader
*/

class Ai1ec_Loader {

	/**
	 * @var array Map of files to be included
	 */
	protected $_paths           = NULL;

	/**
	 * @var array Reverse classes map
	 */
	protected $_reverse_map     = NULL;

	/**
	 * @var array Map of files already included
	 */
	protected $_included_files  = array();

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
			$this->include_file( $this->_paths[$class] );
		}
		return $this;
	}

	/**
	 * include_file method
	 *
	 * Method which actually includes required file.
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
	public function include_file( $file, $nest = true ) {
		$file = $this->match_file( $file );
		if ( ! isset( $this->_included_files[$file] ) ) {
			$this->_included_files[$file] = true;
			require $file;
		}
		return $this->_included_files[$file];
	}

	/**
	 * match_file method
	 *
	 * Attempt to match file from given files list.
	 * Entry from {@see self::$_paths} array contains either scalar file name
	 * to use with any PHP version, or array of arrays, where internal arrays
	 * contain required PHP version number as 0-indexed element, and the name
	 * of file to include, if version matches, as 1st element.
	 *
	 * @param string|array File or list of files to match
	 *
	 * @return string Name of file to include
	 *
	 * @throws Ai1ec_File_Not_Found Exception when fails to match a file
	 */
	public function match_file( $file_list ) {
		if ( is_scalar( $file_list ) ) {
			return $file_list;
		}
		$use_file = NULL;
		foreach ( $file_list as $file ) {
			if ( version_compare( PHP_VERSION, $file[0] ) >= 0 ) {
				$use_file = $file[1];
				break;
			}
		}
		if ( NULL === $use_file ) {
			throw new Ai1ec_File_Not_Found(
				'Failed to match any file: ' . var_export( $file_list, true ),
				E_USER_WARNING
			);
		}
		return $use_file;
	}

	/**
	 * __clone method
	 *
	 * Magic method to handle class cloning.
	 * *NOTE* this class (Ai1ec_Loader) is a singleton and cloning is proibited.
	 *
	 * @return void Method does not return
	 *
	 * @throws Exception Cloning is prohibited
	 */
	public function __clone() {
		throw new Ai1ec_Exception( 'Cloning is not supported' );
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
		$names = $this->_locate_all_files( AI1EC_PATH );
		$this->_cache( $names );
		return $names;
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
		$directory  = opendir( $path );
		while ( false !== ( $entry = readdir( $directory ) ) ) {
			if ( '.' === $entry{0} ) {
				continue; // ignore hidden files
			}
			$local_path = $path . DIRECTORY_SEPARATOR . $entry;
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
		$ignore_class = '#^Logger[A-Z]#';
		$class_list   = array();
		$regexp       = '#
			(
				(?:^|\s)
				(?:class|interface)[\s+]
				(
					(?:
						lessc|
						iCal|
						calendarComponent|
						valarm|
						vcalendar|
						vevent|
						vfreebusy|
						vjournal|
						vtimezone|
						vtodo|
						[A-Z]
					)
					[a-zA-Z0-9_]*
				)
				[\s{]
			)
		#x';
		if ( '.php' === strrchr( $file, '.' ) ) {
			preg_match_all(
				$regexp,
				file_get_contents( $file ),
				$matches
			);
			if ( $matches ) {
				foreach ( $matches[2] as $class ) {
					if ( preg_match( $ignore_class, $class ) ) {
						continue;
					}
					$class_list[$class] = $file;
				}
			}
		}
		return $class_list;
	}

	/**
	 * _cache method
	 *
	 * Read/write cached classes map.
	 * If no entries are provided - acts as cache reader.
	 *
	 * @param array $entries Entries to write [optional=NULL]
	 *
	 * @return bool|array False on failure, true on success in writer
	 *     mode, cached entry in reader mode on success
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
			$content = var_export( $entries, true );
			$content = $this->_sanitize_paths( $content );
			$content = '<?php return ' . $content . ';';
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
		return ( require $cache_file );
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
		$ai1ec_path = AI1EC_PATH;
		if ( '\\' === DIRECTORY_SEPARATOR ) {
			$local_ds   = '\\\\';
			$ai1ec_path = str_replace( '\\', '\\\\', $ai1ec_path );
		}
		$content = str_replace(
			'\'' . $ai1ec_path . $local_ds,
			'AI1EC_PATH . DIRECTORY_SEPARATOR . \'',
			$content );
		$content = str_replace(
			$local_ds,
			'\' . DIRECTORY_SEPARATOR . \'',
			$content
		);
		return $content;
	}

	/**
	 * _optimise_includes method
	 *
	 * Prepare reverse includes map, to speed up matches retrieval.
	 * Reverse includes map is made of classes map, with file names
	 * on top level, consisting of class names with regular include
	 * structures inside.
	 * Some paths are manually excluded, to avoid over-inclusion.
	 *
	 * @param array $paths Classes map to remap
	 *
	 * @return array Optimised reverse lookups map
	 */
	protected function _optimise_includes( array $paths ) {
		$exclude_app = array(
			AI1EC_APP_PATH . DIRECTORY_SEPARATOR .'controller' => true,
			AI1EC_APP_PATH . DIRECTORY_SEPARATOR .'exception'  => true,
			AI1EC_APP_PATH . DIRECTORY_SEPARATOR .'helper'     => true,
			AI1EC_APP_PATH . DIRECTORY_SEPARATOR .'model'      => true,
			AI1EC_LIB_PATH                                     => true,
		);
	    $reverse_map = array();
		$offset      = strlen( AI1EC_PATH );
	    foreach ( $paths as $class => $file_list ) {
			if ( ! is_array( $file_list ) ) {
				$file_list = array( array( 0, $file_list ) );
			}
			foreach ( $file_list as $file_entry ) {
				$directory = dirname( $file_entry[1] );
				$depth     = substr_count(
					$file_entry[1],
					DIRECTORY_SEPARATOR,
					$offset
				);
				if ( $depth > 3 ) {
					$directory = dirname( $directory );
				}
				if ( isset( $exclude_app[$directory] ) ) {
					continue;
				}
				if ( ! isset( $reverse_map[$directory] ) ) {
					$reverse_map[$directory] = array();
				}
				$reverse_map[$directory][$class] = $file_list;
			}
	    }
		foreach ( $reverse_map as $directory => $entries ) {
			if ( count( $entries ) < 2 ) {
				unset( $reverse_map[$directory] );
			}
		}
	    return $reverse_map;
	}

	/**
	 * Constructor
	 *
	 * Constructor is protected to guard classes singleton nature.
	 *
	 * @return void Constructor does not return
	 */
	protected function __construct() {
		$class_map = $this->_cache();
		if (
			! is_array( $class_map ) ||
			defined( 'AI1EC_DEBUG' ) && AI1EC_DEBUG
		) {
			if ( ! defined( 'AI1EC_DEBUG' ) || ! AI1EC_DEBUG ) {

				throw new Ai1ec_Exception( 
					'Generated class map is invalid: ' .
					var_export( $class_map, true ) );
				
			}
			$class_map = $this->collect_classes();
		}
		$this->_paths = $class_map;
		$this->_reverse_map = $this->_optimise_includes( $class_map );
	}
