<?php

/**
 * Routing (management) base class
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Routing
 */

class Ai1ec_Router {

	/**
	 * @var Ai1ec_Router Instance of self
	 */
	static private $_instance = null;

	/**
	 * @var boolean
	 */
	private static $at_least_one_filter_set_in_request;

	/**
	 * @var string Calendar base url
	 */
	protected $_calendar_base = null;

	/**
	 * @var string Base URL of WP installation
	 */
	protected $_site_url = NULL;

	/**
	 * @var Ai1ec_Adapter_Query_Interface Query manager object
	 */
	protected $_query_manager = null;
	
	/**
	 * @var Ai1ec_Cookie_Present_Dto
	 */
	protected $cookie_set_dto;

	/**
	 * Singleton access method
	 *
	 * @return Ai1ec_Router Instance of self
	 */
	static public function instance() {
		if (
			! isset( self::$_instance ) ||
			! ( self::$_instance instanceof Ai1ec_Router )
		) {
			self::$_instance = new Ai1ec_Router();
		}
		return self::$_instance;
	}

	/**
	 * Check if at least one filter is set in the request
	 *
	 * @param array $view_args
	 * @return boolean
	 */
	static public function is_at_least_one_filter_set_in_request( array $view_args ) {
		if( null === self::$at_least_one_filter_set_in_request ) {
			$filter_set = false;
			$ai1ec_settings = Ai1ec_Settings::get_instance();
			// check if something in the filters is set
			foreach ( Ai1ec_Cookie_Utility::$types as $type ) {
				if( ! empty( $view_args[$type] ) ) {
					$filter_set = true;
					break;
				}
			}
			// check if the default view is set
			if( $ai1ec_settings-> default_calendar_view !== $view_args['action'] ) {
				$filter_set = true;
			}
			self::$at_least_one_filter_set_in_request = $filter_set;
		}
		return self::$at_least_one_filter_set_in_request;
	}

	/**
	 * @return the $cookie_set_dto
	 */
	public function get_cookie_set_dto() {
		if( null === $this->cookie_set_dto ) {
			$this->cookie_set_dto =  Ai1ec_Cookie_Utility::is_cookie_set_for_current_page();
		}
		return $this->cookie_set_dto;
	}

	/**
	 * @param Ai1ec_Cookie_Present_Dto $cookie_set_dto
	 */
	public function set_cookie_set_dto( Ai1ec_Cookie_Present_Dto $cookie_set_dto = null ) {
		$this->cookie_set_dto = $cookie_set_dto;
	}

	/**
	 * Set base (AI1EC) URI
	 *
	 * @param string $uri Base URI (i.e. http://www.example.com/calendar)
	 *
	 * @return Ai1ec_Router Object itself
	 */
	public function asset_base( $url ) {
		$this->_calendar_base = $url;
		return $this;
	}

	/**
	 * Get base URL of WP installation
	 *
	 * @return string URL where WP is installed
	 */
	public function get_site_url() {
		if ( NULL === $this->_site_url ) {
			$this->_site_url = site_url();
		}
		return $this->_site_url;
	}

	/**
	 * Generate (update) URI
	 *
	 * @param array	 $arguments List of arguments to inject into AI1EC group
	 * @param string $page		Page URI to modify
	 *
	 * @return string Generated URI
	 */
	public function uri( array $arguments, $page = NULL ) {
		if ( NULL === $page ) {
			$page = $this->_calendar_base;
		}
		$uri_parser = new Ai1ec_Uri();
		$parsed_url = $uri_parser->parse( $page );
		$parsed_url['ai1ec'] = array_merge(
			$parsed_url['ai1ec'],
			$arguments
		);
		$result_uri = $uri_parser->write( $parsed_url );

		return $result_uri;
	}

	/**
	 * Register rewrite rule to enable work with pretty URIs
	 */
	public function register_rewrite( $rewrite_to ) {
		if (
			! $this->_calendar_base &&
			! $this->_query_manager->rewrite_enabled()
		) {
			return $this;
		}
		$base = basename( $this->_calendar_base );
		if ( false !== strpos( $base, '?' ) ) {
			return $this;
		}
		$base       = '(?:.+/)?' . $base;
		$named_args = str_replace(
			'[:DS:]',
			preg_quote( Ai1ec_Uri::DIRECTION_SEPARATOR ),
			'[a-z][a-z0-9\-_[:DS:]\/]*[:DS:][a-z0-9\-_[:DS:]\/]'
		);
		$regexp     = $base . '(\/' . $named_args . ')';
		$clean_base = trim( $this->_calendar_base, '/' );
		$clean_site = trim( $this->get_site_url(), '/' );
		if ( 0 === strcmp( $clean_base, $clean_site ) ) {
			$regexp     = '(' . $named_args . ')';
			$rewrite_to = remove_query_arg( 'pagename', $rewrite_to );
		}
		$this->_query_manager->register_rule(
			$regexp,
			$rewrite_to
		);
		return $this;
	}

	/**
	 * Initiate internal variables
	 */
	protected function __construct() {
		$this->_query_manager = Ai1ec_Adapter::query_manager();
	}

}
