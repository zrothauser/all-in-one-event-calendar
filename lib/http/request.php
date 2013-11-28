<?php

/**
 * Utility handling HTTP(s) automation issues
 *
 * @author     Timely Network Inc
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Http
 */
class Ai1ec_Http_Request {

	/**
	 * Public constructor
	 *
	 * @param Ai1ec_Registry_Object $registry
	 *
	 * @return void
	 */
	public function __construct( Ai1ec_Registry_Object $registry ) {
		$this->_registry = $registry;
	}

	/**
	 * Check if client accepts gzip and we should compress content
	 *
	 * Plugin settings, client preferences and server capabilities are
	 * checked to make sure we should use gzip for output compression.
	 *
	 * @return bool True when gzip should be used
	 */
	public function client_use_gzip() {
		$settings = $this->_registry->get( 'model.settings' );

		if (
			$settings->get( 'disable_gzip_compression' ) ||
			isset( $_SERVER['HTTP_ACCEPT_ENCODING'] ) &&
			'identity' === $_SERVER['HTTP_ACCEPT_ENCODING'] ||
			! extension_loaded( 'zlib' )
		) {
			return false;
		}
		$zlib_output_handler = ini_get( 'zlib.output_handler' );
		if (
			in_array( 'ob_gzhandler', ob_list_handlers() ) ||
			in_array(
				strtolower( ini_get( 'zlib.output_compression' ) ),
				array( '1', 'on' )
			) ||
			! empty( $zlib_output_handler )
		) {
			return false;
		}
		return true;
	}

	/**
	 * Disable `streams` transport support as necessary
	 *
	 * Following (`streams`) transport is disabled only when request to cron
	 * dispatcher are made to make sure that requests does have no impact on
	 * browsing experience - site is not slowed down, when crons are spawned
	 * from within current screen session.
	 *
	 * @param mixed  $output  HTTP output
	 * @param string $url     Original request URL
	 *
	 * @return mixed Original or modified $output
	 */
	public function pre_http_request( $output, $url ) {
		$cron_url = site_url( 'wp-cron.php' );
		remove_filter( 'use_streams_transport', 'ai1ec_return_false' );
		if (
			0 === strncmp( $url, $cron_url, strlen( $cron_url ) ) &&
			! function_exists( 'curl_init' )
		) {
			add_filter( 'use_streams_transport', 'ai1ec_return_false' );
		}
		return $output;
	}

	/**
	 * Inject time.ly certificate to cURL resource handle
	 *
	 * @param resource $curl Instance of cURL resource
	 *
	 * @return void Method does not return
	 */
	public function curl_inject_certificate( $curl ) {
		// verify that the passed argument
		// is resource of type 'curl'
		if (
			is_resource( $curl ) &&
			'curl' === get_resource_type( $curl )
		) {
			// set CURLOPT_CAINFO to AI1EC_CA_ROOT_PEM
			curl_setopt( $curl, CURLOPT_CAINFO, AI1EC_CA_ROOT_PEM );
		}
	}

}
