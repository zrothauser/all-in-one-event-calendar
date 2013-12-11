<?php

/**
 * @author Timely Network Inc
 *
 * This class is responsible of Handling CSS generation functions
 */

class Ai1ec_Css_Frontend extends Ai1ec_Base {

	const GET_VARIBALE_NAME                 = 'ai1ec_render_css';

	// This is for testing purpose, set it to AI1EC_DEBUG value.
	const PARSE_LESS_FILES_AT_EVERY_REQUEST = AI1EC_DEBUG;

	const KEY_FOR_PERSISTANCE = 'ai1ec_parsed_css';
	/**
	 * @var Ai1ec_Css_Persistence_Helper
	 */
	private $persistance_context;

	/**
	 * @var Ai1ec_Lessphp_Controller
	 */
	private $lessphp_controller;

	/**
	 * @var Ai1ec_Wordpress_Db_Adapter
	 */
	private $db_adapter;

	/**
	 * @var boolean
	 */
	private $preview_mode;

	/**
	 * @var Ai1ec_Template_Adapter
	 */
	private $template_adapter;

	public function __construct(
		Ai1ec_Registry_Object $registry,
		$preview_mode = false
	) {
		parent::__construct( $registry );
		$this->persistance_context = $this->_registry->get( 
			'cache.strategy.persistence-context',
			self::KEY_FOR_PERSISTANCE,
			AI1EC_CACHE_PATH 
		);
		$this->lessphp_controller  = $this->_registry->get( 'less.lessphp' );
		$this->db_adapter          = $this->_registry->get( 'model.option' );
		$this->preview_mode        = $preview_mode;
	
	}

	/**
	 * Renders the css for our frontend.
	 *
	 * Sets etags to avoid sending not needed data
	 */
	public function render_css() {
		header( 'HTTP/1.1 200 OK' );
		header( 'Content-Type: text/css', true, 200 );
		// Aggressive caching to save future requests from the same client.
		$etag = '"' . md5( __FILE__ . $_GET[self::GET_VARIBALE_NAME] ) . '"';
		header( 'ETag: ' . $etag );
		$max_age = 31536000;
		header(
			'Expires: ' .
			gmdate(
				'D, d M Y H:i:s',
				Ai1ec_Time_Utility::current_time() + $max_age
			) .
			' GMT'
		);
		header( 'Cache-Control: public, max-age=' . $max_age );
		if (
			empty( $_SERVER['HTTP_IF_NONE_MATCH'] ) ||
			$etag !== stripslashes( $_SERVER['HTTP_IF_NONE_MATCH'] )
		) {
			// compress data if possible
			if ( Ai1ec_Http_Utility::client_use_gzip() ) {
				ob_start( 'ob_gzhandler' );
				header( 'Content-Encoding: gzip' );
			} else {
				ob_start();
			}
			$content = $this->get_compiled_css();
			echo $content;
			ob_end_flush();
		} else {
			// Not modified!
			status_header( 304 );
		}
		// We're done!
		ai1ec_stop( 0 );
	}

	/**
	 *
	 * @param string $css
	 * @throws Ai1ec_Cache_Write_Exception
	 */
	public function update_persistence_layer( $css ) {
		$this->persistance_context->write_data_to_persistence( $css );
		$this->save_less_parse_time();
	}


	/**
	 * Get the url to retrieve the css
	 *
	 * @return string
	 */
	public function get_css_url() {
		$time = $this->db_adapter->get( self::GET_VARIBALE_NAME );
		return $this->template_adapter->get_site_url() . "/?" . self::GET_VARIBALE_NAME . "=$time";
	}

	/**
	 * Create the link that will be added to the frontend
	 */
	public function add_link_to_html_for_frontend() {
		$preview = '';
		if( true === $this->preview_mode ) {
			// bypass browser caching of the css
			$now = strtotime( 'now' );
			$preview = "&preview=1&nocache={$now}&ai1ec_stylesheet=" . $_GET['ai1ec_stylesheet'];
		}
		$url = $this->get_css_url() . $preview;
		$this->template_adapter->enqueue_script( 'ai1ec_style', $url );
	}

	/**
	 * Invalidate the persistence layer only after a succesful compile of the
	 * LESS files.
	 *
	 * @param array $variables
	 * @param boolean $update_persistence
	 * @return boolean
	 */
	public function invalidate_cache( array $variables = null, $update_persistence = false ) {
		// Reset the parse time to force a browser reload of the CSS, whether we are
		// updating persistence or not.
		$this->save_less_parse_time();
		try {
			// Try to parse the css
			$css = $this->lessphp_controller->parse_less_files( $variables );
			if ( $update_persistence ) {
				$this->update_persistence_layer( $css );
			} else {
				$this->persistance_context->delete_data_from_persistence();
			}
		} catch ( Ai1ec_Cache_Write_Exception $e ) {
			$message = Ai1ec_Helper_Factory::create_admin_message_instance(
				'<p>' . __( "The LESS file compiled correctly but there was an error while saving the generated CSS to persistence.", AI1EC_PLUGIN_NAME ) . '</p>',
				__( "An error ocurred while updating CSS", AI1EC_PLUGIN_NAME )
			);
			$this->admin_notices_helper->add_renderable_children( $message );
			// this means a correct parsing but an error in saving to persistance
			return false;
		} catch ( Exception $e ) {
			$message = Ai1ec_Helper_Factory::create_admin_message_instance(
				sprintf(
					__( '<p>The message returned was: <em>%s</em></p>', AI1EC_PLUGIN_NAME ),
					$e->getMessage()
				),
				__( "An error occurred while compiling LESS files", AI1EC_PLUGIN_NAME )
			);
			$this->admin_notices_helper->add_renderable_children( $message );
			return false;
		}
		return true;
	}


	/**
	 * Update the less variables on the DB and recompile the CSS
	 *
	 * @param array $variables
	 * @param boolean $resetting are we resetting or updating variables?
	 */
	public function update_variables_and_compile_css( array $variables, $resetting ) {
		$no_parse_errors = $this->invalidate_cache( $variables, true );
		$notification   = $this->_registry->get( 'notification.admin' );
		if ( $no_parse_errors ) {
			$this->db_adapter->set(
				Ai1ec_Lessphp_Controller::DB_KEY_FOR_LESS_VARIABLES,
				$variables
			);
			

			$message = sprintf(
				'<p>' . __(
					"Theme options were updated successfully. <a href='%s'>Visit site</a>",
					AI1EC_PLUGIN_NAME
				) . '</p>',
				get_site_url()
			);
			$notification->store( $message, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), 'updated' );

			if ( true === $resetting ) {
				$message = sprintf(
					'<p>' . __(
						"Theme options were successfully reset to their default values. <a href='%s'>Visit site</a>",
						AI1EC_PLUGIN_NAME
					) . '</p>',
					get_site_url()
				);
				$notification->store( $message, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), 'updated' );
			}
		}
	}
	/**
	 * Try to get the CSS from cache.
	 * If it's not there re-generate it and save it to cache
	 * If we are in preview mode, recompile the css using the theme present in the url.
	 *
	 */
	private function get_compiled_css() {
		try {
			// If we want to force a recompile, we throw an exception.
			if( $this->preview_mode === true || self::PARSE_LESS_FILES_AT_EVERY_REQUEST === true ) {
				throw new Ai1ec_Cache_Not_Set_Exception();
			}else {
				// This throws an exception if the key is not set
				$css = $this->persistance_context->get_data_from_persistence();
				return $css;
			}
		} catch ( Ai1ec_Cache_Not_Set_Exception $e ) {
			// If we are in preview mode we force a recompile and we pass the variables.
			if( $this->preview_mode ) {
				return $this->lessphp_controller->parse_less_files(
					$this->lessphp_controller->get_less_variable_data_from_config_file()
				);
			} else {
				$css = $this->lessphp_controller->parse_less_files();
			}
			try {
				$this->update_persistence_layer( $css );
				return $css;
			} catch ( Ai1ec_Cache_Write_Exception $e ) {
				// If something is really broken, still return the css.
				// This means we parse it every time. This should never happen.
				return $css;
			}
		}
	}

	/**
	 * Save the compile time to the db so that we can use it to build the link
	 */
	private function save_less_parse_time() {
		$this->db_adapter->set(
			self::GET_VARIBALE_NAME,
			$this->_registry->get( 'date.system' )->current_time()
		);
	}
}
