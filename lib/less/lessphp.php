<?php

/**
 * Class that handles less related functions.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Less
 */
class Ai1ec_Less_Lessphp extends Ai1ec_Base {

	/**
	 *
	 * @var string
	 */
	const DB_KEY_FOR_LESS_VARIABLES = "ai1ec_less_variables";

	/**
	 *
	 * @var lessc
	 */
	private $lessc;

	/**
	 *
	 * @var array
	 */
	private $files = array();

	/**
	 *
	 * @var string
	 */
	private $unparsed_variable_file;

	/**
	 *
	 * @var string
	 */
	private $parsed_css;

	/**
	 *
	 * @var string
	 */
	private $default_theme_url;

	/**
	 *
	 * @var Ai1ec_File_Less
	 */
	private $variable_file;

	public function __construct(
		Ai1ec_Registry_Object $registry,
		$default_theme_url = AI1EC_DEFAULT_THEME_URL

	) {
		parent::__construct( $registry );
		$this->lessc = $this->_registry->get( 'lessc' );;
		$this->default_theme_url = $this->sanitize_default_theme_url( $default_theme_url );
		$this->parsed_css = '';
		$this->files = array(
			'style.less',
			'event.less',
			'calendar.less',
			'override.less',
			'../style.less',
		);
	}

	/**
	 *
	 * @param Ai1ec_File_Less $file
	 */
	public function set_variable_file( Ai1ec_File_Less $file ) {
		$this->variable_file = $file;
	}

	/**
	 *
	 * @param Ai1ec_File_Less $file
	 */
	public function add_file( $file ) {
		$this->files[] = $file;
	}

	/**
	 * Parse all the less files resolving the dependencies.
	 *
	 * @param array $variables
	 * @throws Ai1ec_File_Not_Found_Exception|Exception
	 * @throws Exception
	 * @return string
	 */
	public function parse_less_files( array $variables = null ) {
		// If no variables are passed i get them from the db
		if ( null === $variables ) {
			$variables = $this->_registry->get( 'model.option' )->get(
				self::DB_KEY_FOR_LESS_VARIABLES
			);
			// If they are not set in the db, get them from file.
			// this happen when the user switched the theme and triggered a new parse.
			if ( ! $variables ) {
				$variables = $this->get_less_variable_data_from_config_file();
			} else {
				// inject extension variables
				$variables = apply_filters( 'ai1ec_less_variables', $variables );
			}
		}
		// convert the variables to key / value
		$variables   = $this->convert_less_variables_for_parsing( $variables );
		// Inject additional constants from extensions.
		$variables   = apply_filters( 'ai1ec_less_constants', $variables );

		// Load the variable.less file to use
		$this->load_less_variables_from_file();
		$loader      = $this->_registry->get( 'theme.loader' );

		// Allow extensions to add their own LESS files.
		$this->files = apply_filters( 'ai1ec_less_files', $this->files );

		// Find out the active theme URL.
		$option      = $this->_registry->get( 'model.option' );
		$theme       = $option->get( 'ai1ec_current_theme' );

		$this->lessc->addImportDir(
			$theme['theme_dir'] . DIRECTORY_SEPARATOR . 'less'
		);
		$import_dirs = array();
		foreach ( $this->files as $file ) {
			$file_to_parse = null;
			try {
				// Get the filename following our fallback convention
				$file_to_parse = $loader->get_file( $file );
			} catch ( Ai1ec_Exception $e ) {
				// We let child themes override styles of Vortex.
				// So there is no fallback for override and we can continue.
				if ( $file !== 'override.less' ) {
					throw $e;
				} else {
					// It's an override, skip it.
					continue;
				}
			}
			// If the file is a CSS file, no need to parse it, just serve it as usual.
			$ext = pathinfo( $file_to_parse->get_name(), PATHINFO_EXTENSION );
			if ( 'css' === $ext ) {
				$this->parsed_css .= $file_to_parse->get_content();
				continue;
			}

			// We prepend the unparsed variables.less file we got earlier.
			// We do this as we do not import that anymore in the less files.
			$this->unparsed_variable_file .= $file_to_parse->get_content();

			// Set the import directories for the file. Includes current directory of
			// file as well as theme directory in core. This is important for
			// dependencies to be resolved correctly.
			$dir = dirname( $file_to_parse->get_name() );
			if ( ! isset( $import_dirs[$dir] ) ) {
				$import_dirs[$dir] = true;
				$this->lessc->addImportDir( $dir );
			}
		}
		$variables['fontdir'] = '~"' . $theme['theme_url'] . '/font"';
		$variables['fontdir_default'] = '~"' . $this->default_theme_url . '/font"';
		$variables['imgdir'] = '~"' . $theme['theme_url'] . '/img"';
		$variables['imgdir_default'] = '~"' . $this->default_theme_url . '/img"';

		try {
			$this->parsed_css .= $this->lessc->parse(
				$this->unparsed_variable_file,
				$variables
			);
		} catch ( Exception $e ) {
			throw $e;
		}
		return $this->parsed_css;
	}

	/**
	 * Check if the option that stores the less variables is set, otherwise create it
	 *
	 * @param Ai1ec_Less_File $file
	 * @internal param string $theme_path
	 */
	public function initialize_less_variables_if_not_set() {
		$saved_variables = $this->_registry->get( 'model.option' )->get(
			self::DB_KEY_FOR_LESS_VARIABLES
		);

		// If the key is not set, we create the variables
		if ( ! $saved_variables ) {

			$variables_to_save = $this->get_less_variable_data_from_config_file();

			// do not store the description
			foreach( $variables_to_save as $name => $attributes ) {
				unset( $variables_to_save[$name]['description'] );
			}
			$this->_registry->get( 'model.option' )->set(
				self::DB_KEY_FOR_LESS_VARIABLES,
				$variables_to_save
			);
		}
	}

	/**
	 * Invalidates CSS cache if ai1ec_invalidate_css_cache option was flagged.
	 * Deletes flag afterwards.
	 */
	public function invalidate_css_cache_if_requested() {
		$option = $this->_registry->get( 'model.option' );

		if ( $option->get( 'ai1ec_invalidate_css_cache' ) ) {
			$css_controller = $this->_registry->get( 'css.frontend' );
			$css_controller->invalidate_cache( null, false );
			$option->delete( 'ai1ec_invalidate_css_cache' );
		}
	}

	/**
	 * After updating core themes, we also need to update the LESS variables with
	 * the new ones as they may have changed. This function assumes that the
	 * user_variables.php file in the active theme and/or parent theme has just
	 * been updated.
	 */
	public function update_less_variables_on_theme_update() {
		// Get old variables from the DB.
		$saved_variables = $this->get_saved_variables();
		// Get the new variables from file.
		$new_variables = $this->get_less_variable_data_from_config_file();
		foreach ( $new_variables as $variable_name => $variable_data ) {
			unset( $variable_data['description'] );
			// If the variable already exists, keep the old value.
			if ( isset( $saved_variables[$variable_name] ) ) {
				$variable_data['value'] = $saved_variables[$variable_name]['value'];
			}
			$new_variables[$variable_name] = $variable_data;
		}
		// Wave the new variables to the DB.
		$this->_registry->get( 'model.option' )->set(
			self::DB_KEY_FOR_LESS_VARIABLES,
			$new_variables
		);
	}

	/**
	 * Get the data for the config from the parsed file.
	 *
	 * @param Ai1ec_File_Less $file
	 * @return array
	 */
	public function get_less_variable_data_from_config_file() {
		$loader = $this->_registry->get( 'theme.loader' );

		// load the file to parse using the usal convention
		$file = $loader->get_file( 'less/user_variables.php', array(), false );

		// This variable is locate in the required file
		$variables = $file->get_content();
		// inject extension variables
		$variables = apply_filters( 'ai1ec_less_variables', $variables );
		return $variables;
	}


	/**
	 * Convert the variables coming from the db to key value pairs used by the less parser
	 *
	 * @param array $variables
	 * @return array
	 */
	private function convert_less_variables_for_parsing( array $variables ) {
		$converted_variables = array();
		foreach( $variables as $variable_name => $variable_params ) {
			$converted_variables[$variable_name] = $variable_params['value'];
		}
		return $converted_variables;
	}


	/**
	 * Different themes need different variable.less files.
	 * Here i use the usual fallback ( active theme first then vortex ) to load it unparsed
	 *
	 */
	private function load_less_variables_from_file() {
		$loader = $this->_registry->get( 'theme.loader' );
		$file = $loader->get_file( 'variables.less', array(), false );
		$this->unparsed_variable_file = $file->get_content();
	}

	/**
	 * a static method to get variables
	 *
	 * @return array
	 */
	public function get_saved_variables() {
		$variables = $this->_registry->get( 'model.option' )->get(
			self::DB_KEY_FOR_LESS_VARIABLES
		);
		if ( ! $variables ) {
			$variables = $this->get_less_variable_data_from_config_file();
		} else {
			// inject extension variables
			$variables = apply_filters( 'ai1ec_less_variables', $variables );
		}
		// We don't store description in options table, so find it in current config
		// file.
		$variables_from_config = $this->get_less_variable_data_from_config_file();

		// Add the description at runtime so that it can be translated.
		foreach ( $variables as $name => $attrs ) {
			// Also filter out any legacy variables that are no longer found in
			// current config file (exceptions thrown is this is not handled here).
			if ( ! isset( $variables_from_config[$name] ) ) {
				unset( $variables[$name] );
			}
			// If description is available in config file, use it.
			else if ( isset( $variables_from_config[$name]['description'] ) ) {
				$variables[$name]['description'] =
					$variables_from_config[$name]['description'];
			}
		}
		return $variables;
	}

	/**
	 * Tries to fix the double url as of AIOEC-882
	 *
	 * @param string $url
	 * @return string
	 */
	public function sanitize_default_theme_url( $url ) {
		$pos_http = strrpos( $url, 'http://');
		$pos_https = strrpos( $url, 'https://');
		// if there are two http
		if( 0 !== $pos_http ) {
			// cut of the first one
			$url = substr( $url, $pos_http );
		} else if ( 0 !== $pos_https ) {
			$url = substr( $url, $pos_https );
		}
		return $url;
	}
}
