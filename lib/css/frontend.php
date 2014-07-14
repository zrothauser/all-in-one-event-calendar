<?php

/**
 * The class which handles Frontend CSS.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Css
 */
class Ai1ec_Css_Frontend extends Ai1ec_Base {

	const QUERY_STRING_PARAM                = 'ai1ec_render_css';

	// This is for testing purpose, set it to AI1EC_DEBUG value.
	const PARSE_LESS_FILES_AT_EVERY_REQUEST = AI1EC_DEBUG;

	const KEY_FOR_PERSISTANCE               = 'ai1ec_parsed_css';
	/**
	 * @var Ai1ec_Persistence_Context
	 */
	private $persistance_context;

	/**
	 * @var Ai1ec_Less_Lessphp
	 */
	private $lessphp_controller;

	/**
	 * @var Ai1ec_Wordpress_Db_Adapter
	 */
	private $db_adapter;

	/**
	 * @var Ai1ec_Template_Adapter
	 */
	private $template_adapter;

	public function __construct(
		Ai1ec_Registry_Object $registry
	) {
		parent::__construct( $registry );
		$this->persistance_context = $this->_registry->get(
			'cache.strategy.persistence-context',
			self::KEY_FOR_PERSISTANCE,
			AI1EC_CACHE_PATH,
			true
		);
		if ( ! $this->persistance_context->is_file_cache() ) {
			$this->_registry->get( 'notification.admin' )
				->store(
					sprintf(
						__(
							'Cache directory, <code>%s</code>, is not writable. Your calendar will perform more slowly until you make this directory writable by the web server.',
							AI1EC_PLUGIN_NAME
						),
						AI1EC_CACHE_PATH
					),
					'error',
					2,
					array( Ai1ec_Notification_Admin::RCPT_ADMIN ),
					true
				);
		}
		$this->lessphp_controller  = $this->_registry->get( 'less.lessphp' );
		$this->db_adapter          = $this->_registry->get( 'model.option' );
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
		$etag = '"' . md5( __FILE__ . $_GET[self::QUERY_STRING_PARAM] ) . '"';
		header( 'ETag: ' . $etag );
		$max_age = 31536000;
		$time_sys = $this->_registry->get( 'date.system' );
		header(
			'Expires: ' .
			gmdate(
				'D, d M Y H:i:s',
				$time_sys->current_time() + $max_age
			) .
			' GMT'
		);
		header( 'Cache-Control: public, max-age=' . $max_age );
		if (
			empty( $_SERVER['HTTP_IF_NONE_MATCH'] ) ||
			$etag !== stripslashes( $_SERVER['HTTP_IF_NONE_MATCH'] )
		) {
			// compress data if possible
			$compatibility_ob = $this->_registry->get( 'compatibility.ob' );
			if ( $this->_registry->get( 'http.request' )->client_use_gzip() ) {
				$compatibility_ob->start( 'ob_gzhandler' );
				header( 'Content-Encoding: gzip' );
			} else {
				$compatibility_ob->start();
			}
			$content = $this->get_compiled_css();
			echo $content;
			$compatibility_ob->end_flush();
		} else {
			// Not modified!
			status_header( 304 );
		}
		// We're done!
		Ai1ec_Http_Response_Helper::stop( 0 );
	}

	/**
	 *
	 * @param string $css
	 * @throws Ai1ec_Cache_Write_Exception
	 */
	public function update_persistence_layer( $css ) {
		$filename = $this->persistance_context->write_data_to_persistence( $css );
		$this->save_less_parse_time( $filename );
	}


	/**
	 * Get the url to retrieve the css
	 *
	 * @return string
	 */
	public function get_css_url() {
		// get what's saved. I t could be false, a int or a string.
		// if it's false or a int, use PHP to render CSS
		$saved_par = $this->db_adapter->get( self::QUERY_STRING_PARAM );
		if ( empty( $saved_par )  || is_numeric( $saved_par ) ) {
			$time = (int) $saved_par;
			$template_helper = $this->_registry->get( 'template.link.helper' );
			return add_query_arg(
				array( self::QUERY_STRING_PARAM => $time, ),
				trailingslashit( $template_helper->get_site_url() )
			);
		}
		// otherwise return the string
		return $saved_par;
	}

	/**
	 * Create the link that will be added to the frontend
	 */
	public function add_link_to_html_for_frontend() {
		$url = $this->get_css_url();
		wp_enqueue_style( 'ai1ec_style', $url, array(), AI1EC_VERSION );
	}

	/**
	 * Invalidate the persistence layer only after a successful compile of the
	 * LESS files.
	 *
	 * @param  array   $variables          LESS variable array to use
	 * @param  boolean $update_persistence Whether the persist successful compile
	 *
	 * @return boolean                     Whether successful
	 */
	public function invalidate_cache(
		array $variables    = null,
		$update_persistence = false
	) {
		$notification = $this->_registry->get( 'notification.admin' );
		try {
			// Try to parse the css
			$css = $this->lessphp_controller->parse_less_files( $variables );
			// Reset the parse time to force a browser reload of the CSS, whether we are
			// updating persistence or not. Do it here to be sure files compile ok.
			$this->save_less_parse_time();
			if ( $update_persistence ) {
				$this->update_persistence_layer( $css );
			} else {
				$this->persistance_context->delete_data_from_persistence();
			}
		} catch ( Ai1ec_Cache_Write_Exception $e ) {
			// This means successful during parsing but problems persisting the CSS.
			$message = '<p>' . Ai1ec_I18n::__( "The LESS file compiled correctly but there was an error while saving the generated CSS to persistence." ) . '</p>';
			$notification->store( $message, 'error' );
			return false;
		} catch ( Exception $e ) {
			// An error from lessphp.
			$message = sprintf(
				Ai1ec_I18n::__( '<p><strong>There was an error while compiling CSS.</strong> The message returned was: <em>%s</em></p>' ),
				$e->getMessage()
			);
			$notification->store( $message, 'error', 1 );
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
		$notification    = $this->_registry->get( 'notification.admin' );

		if ( $no_parse_errors ) {
			$this->db_adapter->set(
				Ai1ec_Less_Lessphp::DB_KEY_FOR_LESS_VARIABLES,
				$variables
			);

			if ( true === $resetting ) {
				$message = sprintf(
					'<p>' . Ai1ec_I18n::__(
						"Theme options were successfully reset to their default values. <a href='%s'>Visit site</a>"
					) . '</p>',
					get_site_url()
				);
			} else {
				$message = sprintf(
					'<p>' .Ai1ec_I18n::__(
						"Theme options were updated successfully. <a href='%s'>Visit site</a>"
					) . '</p>',
					get_site_url()
				);
			}

			$notification->store( $message );
		}
	}
	/**
	 * Try to get the CSS from cache.
	 * If it's not there re-generate it and save it to cache
	 * If we are in preview mode, recompile the css using the theme present in the url.
	 *
	 */
	public function get_compiled_css() {
		try {
			// If we want to force a recompile, we throw an exception.
			if( self::PARSE_LESS_FILES_AT_EVERY_REQUEST === true ) {
				throw new Ai1ec_Cache_Not_Set_Exception();
			}else {
				// This throws an exception if the key is not set
				$css = $this->persistance_context->get_data_from_persistence();
				return $css;
			}
		} catch ( Ai1ec_Cache_Not_Set_Exception $e ) {
			$css = $this->lessphp_controller->parse_less_files();
			try {
				$this->update_persistence_layer( $css );
				return $css;
			} catch ( Ai1ec_Cache_Write_Exception $e ) {
				if ( ! self::PARSE_LESS_FILES_AT_EVERY_REQUEST ) {
					$this->_registry->get( 'notification.admin' )
						->store(
							sprintf( 
								__(
									'Your CSS is being compiled on every request, which causes your calendar to perform slowly. The following error occurred: %s',
									AI1EC_PLUGIN_NAME
								),
								$e->getMessage()
							),
							'error',
							2,
							array( Ai1ec_Notification_Admin::RCPT_ADMIN ),
							true
						);
				}

				// If something is really broken, still return the css.
				// This means we parse it every time. This should never happen.
				return $css;
			}
		}
	}

	/**
	 * Save the compile time to the db so that we can use it to build the link
	 */
	private function save_less_parse_time( $data = false ) {
		$to_save = is_string( $data ) ? 
			AI1EC_CACHE_URL . $data : 
			$this->_registry->get( 'date.system' )->current_time();
		$this->db_adapter->set(
			self::QUERY_STRING_PARAM,
			$to_save,
			true
		);
	}
}
