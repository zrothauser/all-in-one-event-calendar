<?php
/**
 * Controller that handles javascript related functions.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
class Ai1ec_Javascript_Controller {

	// The js handle used when enqueueing
	const JS_HANDLE = 'ai1ec_requirejs';

	// The namespace for require.js functions
	const REQUIRE_NAMESPACE = 'timely';

	// the name of the configuration module for the frontend
	const FRONTEND_CONFIG_MODULE = 'ai1ec_calendar';

	//the name of the get parameter we use for loading js
	const LOAD_JS_PARAMETER = 'ai1ec_render_js';

	// just load backend scripts
	const LOAD_ONLY_BACKEND_SCRIPTS = 'common_backend';

	// just load backend scripts
	const LOAD_ONLY_FRONTEND_SCRIPTS = 'common_frontend';

	// Are we in the backend
	const IS_BACKEND_PARAMETER = 'is_backend';

	// Are we on the calendar page
	const IS_CALENDAR_PAGE = 'is_calendar_page';

	// this is the value of IS_BACKEND_PARAMETER which triggers loading of backend script
	const TRUE_PARAM = 'true';

	// the javascript file for event page
	const EVENT_PAGE_JS = 'event.js';

	// the javascript file for calendar page
	const CALENDAR_PAGE_JS = 'calendar.js';

	private $_registry;

	/**
	 * Holds an instance of the settings object
	 *
	 * @var Ai1ec_Settings
	 */
	private $_settings;

	/**
	 * @var Ai1ec_Locale
	 */
	private $_locale;

	/**
	 * @var Ai1ec_Scripts
	 */
	private $_scripts_helper;

	/**
	 * @var Ai1ec_Acl_Aco
	 */
	private $_aco;

	/**
	 * @var Ai1ec_Template_Link_Helper
	 */
	private $_template_link_helper;

	/**
	 * @var bool
	 */
	protected $_frontend_scripts_loaded = false;

	/**
	 * Public constructor.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 *
	 * @return void
	 */
	public function __construct( Ai1ec_Registry_Object $registry ) {
		$this->_registry             = $registry;
		$this->_settings             = $registry->get( 'model.settings' );
		$this->_locale               = $registry->get( 'p28n.wpml' );
		$this->_aco                  = $registry->get( 'acl.aco' );
		$this->_template_link_helper = $registry->get( 'template.link.helper' );
		// this will need to be modified
		$this->_scripts_helper       = $registry->get( 'script.helper' );
	}

	/**
	 * Load javascript files for frontend pages.
	 *
	 * @wp-hook ai1ec_load_frontend_js
	 *
	 * @param $is_calendar_page boolean Whether we are displaying the main
	 *                                  calendar page or not
	 *
	 * @return void
	 */
	public function load_frontend_js( $is_calendar_page, $is_shortcode = false ) {
		$page = null;

		// ======
		// = JS =
		// ======
		if( $this->_are_we_accessing_the_single_event_page() === true ) {
			$page = self::EVENT_PAGE_JS;
		}
		if( $is_calendar_page === true ) {
			$page = self::CALENDAR_PAGE_JS;
		}
		if( null !== $page ) {
			$this->_add_link_to_render_js( $page, false );
		}
	}
	/**
	 * Render the javascript for the appropriate page.
	 *
	 * @return void
	 */
	public function render_js() {
		$js_path = AI1EC_ADMIN_THEME_JS_PATH . DIRECTORY_SEPARATOR;
		$common_js = '';
		$page_to_load = $_GET[self::LOAD_JS_PARAMETER];

		if ( $_GET[self::IS_BACKEND_PARAMETER] === self::TRUE_PARAM ) {
			$common_js = file_get_contents( $js_path . 'pages/common_backend.js' );
		} else if (
			$page_to_load === self::EVENT_PAGE_JS ||
			$page_to_load === self::CALENDAR_PAGE_JS ||
			$page_to_load === self::LOAD_ONLY_FRONTEND_SCRIPTS
		) {
			if ( $page_to_load === self::LOAD_ONLY_FRONTEND_SCRIPTS &&
				true === $this->_frontend_scripts_loaded
			) {
				return;
			}
			if ( false === $this->_frontend_scripts_loaded ) {
				$common_js = file_get_contents( $js_path . 'pages/common_frontend.js' );
				$this->_frontend_scripts_loaded = true;
			}
		}
		// create the config object for require js
		$require_config = $this->_create_require_js_config_object();
		// load require
		$require = file_get_contents( $js_path . 'require.js' );

		// get jquery
		$jquery = $this->_get_jquery_version_based_on_browser(
				$_SERVER['HTTP_USER_AGENT']
		);
		// load the script for the page

		$page_js = '';
		if ( $page_to_load !== self::LOAD_ONLY_BACKEND_SCRIPTS &&
			$page_to_load !== self::LOAD_ONLY_FRONTEND_SCRIPTS
		) {
			$page_js = file_get_contents( $js_path . 'pages/' . $page_to_load );
		}


		$translation = $this->_get_frontend_translation_data();
		$permalink = $this->_template_link_helper
			->get_permalink( $this->_settings->get( 'calendar_page_id' ) );

		$translation['calendar_url'] = $permalink;

		$tranlsation_module = $this->_create_require_js_module(
				self::FRONTEND_CONFIG_MODULE,
				$translation
		);
		$config = $this->_create_require_js_module(
				'ai1ec_config',
				$this->_get_translation_data()
		);
		// let extensions add their files.
		$extension_files = array();
		$extension_files = apply_filters( 'ai1ec_render_js', $extension_files );
		$ext_js = '';
		foreach ( $extension_files as $file ) {
			$ext_js .= file_get_contents( $file );
		}

		$javascript = $require . $require_config . $tranlsation_module .
		$config . $jquery . $page_js . $common_js . $ext_js;
		$this->_echo_javascript( $javascript );
	}

	/**
	 * Embed JIRA reporting routine.
	 *
	 * Currently limited to admin Dashboard.
	 *
	 * @return bool Success to add JavaScript.
	 */
	protected function _add_jira_reporter() {
		if ( ! is_admin() ) {
			return false;
		}
		if (
			! isset( $_GET['page'] ) &&
			! isset( $_REQUEST['post_type'] )
		) {
			return false;
		}
		if (
			isset( $_GET['page'] ) &&
			0 !== strncasecmp(
				$_GET['page'],
				AI1EC_PLUGIN_NAME,
				strlen( AI1EC_PLUGIN_NAME )
			)
		) {
			return false;
		}
		if (
			isset( $_REQUEST['post_type'] ) &&
			AI1EC_POST_TYPE !== $_REQUEST['post_type']
		) {
			return false;
		}
		return wp_enqueue_script(
			'timely_jira_collector',
			'https://jira.time.ly:8443/s/en_US-ekw80v-418945332/850/31/1.2.9/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?collectorId=7910ef3f',
			array(),
			'7910ef3f'
		);
	}

	/**
	 * Check what file needs to be loaded and add the correct link.
	 *
	 * @wp-hook init
	 *
	 * @return void
	 */
	public function load_admin_js() {
		// Initialize dashboard view

		$script_to_load = FALSE;
		if ( $this->are_we_on_calendar_feeds_page() === TRUE ) {
			// Load script for the importer plugins
			$script_to_load = 'calendar_feeds.js';
		}
		// Start the scripts for the event category page
		if ( $this->_are_we_editing_event_categories() === TRUE ) {
			// Load script required when editing categories
			$script_to_load = 'event_category.js';
		}
		if ( $this->_are_we_editing_less_variables() === TRUE ) {
			// Load script required when editing categories
			$script_to_load = 'less_variables_editing.js';
		}
		// Load the js needed when you edit an event / add a new event
		if (
			true === $this->_are_we_creating_a_new_event() ||
			true === $this->_are_we_editing_an_event()
		) {
			// Load script for adding / modifying events
			$script_to_load = 'add_new_event.js';
		}
		if( $this->_are_we_accessing_the_calendar_settings_page() === TRUE ) {
			$script_to_load = 'admin_settings.js';
		}

		if( false === $script_to_load ) {
			$script_to_load = self::LOAD_ONLY_BACKEND_SCRIPTS;
		}

		$this->_add_link_to_render_js( $script_to_load, true );

		$this->_add_jira_reporter();

	}

	/**
	 * Loads version 1.9 or 2.0 of jQuery based on user agent.
	 *
	 * @param string $user_agent
	 *
	 * @return string
	 */
	private function _get_jquery_version_based_on_browser( $user_agent ) {
		$js_path = AI1EC_ADMIN_THEME_JS_PATH . DIRECTORY_SEPARATOR;
		$jquery = 'jquery_timely20.js';
		preg_match( '/MSIE (.*?);/', $user_agent, $matches );
		if ( count( $matches ) > 1 ) {
			//Then we're using IE
			$version = (int) $matches[1];
			if ( $version <= 8 ) {
				//IE 8 or under!
				$jquery = 'jquery_timely19.js';
			}
		}
		return file_get_contents( $js_path . $jquery );
	}

	/**
	 * Echoes the Javascript if not cached.
	 *
	 * Echoes the javascript with the correct content.
	 * Since the content is dinamic, i use the hash function.
	 *
	 * @param string $javascript
	 *
	 * @return void
	 */
	private function _echo_javascript( $javascript ) {
		$conditional_get = new HTTP_ConditionalGet( array(
			'contentHash' => md5( $javascript )
			)
		);
		$conditional_get->sendHeaders();
		if ( ! $conditional_get->cacheIsValid ) {
			$http_encoder = new HTTP_Encoder( array(
				'content' => $javascript,
				'type' => 'text/javascript'
			)
			);
			$http_encoder->encode();
			$http_encoder->sendAll();
		}
		Ai1ec_Http_Response_Helper::stop( 0 );
	}

	/**
	 * Creates a requirejs module that can be used for translations
	 *
	 * @param string $object_name
	 * @param array $data
	 *
	 * @return string
	 */
	private function _create_require_js_module( $object_name, array $data ) {
		foreach ( (array) $data as $key => $value ) {
			if ( ! is_scalar( $value ) )
				continue;
			$data[$key] = html_entity_decode( (string) $value, ENT_QUOTES, 'UTF-8');
		}
		$json_data = json_encode( $data );
		$prefix = self::REQUIRE_NAMESPACE;
		$script = "$prefix.define( '$object_name', $json_data );";

		return $script;
	}

	/**
	 * Create the array needed for translation and passing other settings to JS.
	 *
	 * @return $data array the dynamic data array
	 */
	private function _get_translation_data() {

		$force_ssl_admin = force_ssl_admin();
		if ( $force_ssl_admin && ! is_ssl() ) {
			force_ssl_admin( false );
		}
		$ajax_url        = admin_url( 'admin-ajax.php' );
		force_ssl_admin( $force_ssl_admin );

		$settings        = $this->_registry->get( 'model.settings' );

		$data = array(
			// ICS feed error messages
			'duplicate_feed_message'         => esc_html(
				Ai1ec_I18n::__( 'This feed is already being imported.' )
			),
			'invalid_url_message'            => esc_html(
				Ai1ec_I18n::__( 'Please enter a valid iCalendar URL.' )
			),
			'invalid_email_message'          => esc_html(
				Ai1ec_I18n::__( 'Please enter a valid e-mail address.' )
			),
			'now'                            => $this->_registry->get( 'date.system' )
				->current_time(),
			'strict_mode'                    => $settings->get(
				'event_platform_strict'
			),
			'size_less_variable_not_ok'      => Ai1ec_I18n::__( 
				'The value you have entered is not a valid CSS length.'
			),
			'confirm_reset_theme'            => Ai1ec_I18n::__( 
				'Are you sure you want to reset your theme options to their default values?'
			),
		);
		return $data;
	}
	/**
	 * Get the array with translated data for the frontend
	 *
	 * @return array
	 */
	private function _get_frontend_translation_data() {
		$data = array(
			'export_url' => AI1EC_EXPORT_URL,
		);

		// Replace desired CSS selector with calendar, if selector has been set
		$calendar_selector = $this->_settings->get( 'calendar_css_selector' );
		if( $calendar_selector ) {
			$page             = get_post(
				$this->_settings->get( 'calendar_post_id ' )
			);
			$data['selector'] = $calendar_selector;
			$data['title']    = $page->post_title;
		}
		$data['fonts'] = array();
		$fonts_dir = AI1EC_DEFAULT_THEME_URL . 'font_css/';
		$data['fonts'][] = array(
			'name' => 'League Gothic',
			'url'  => $fonts_dir . 'font-league-gothic.css',
		);
		$data['fonts'][] = array(
			'name' => 'fontawesome',
			'url'  => $fonts_dir . 'font-awesome.css',
		);
		return $data;
	}

	/**
	 * Create the config object for requirejs.
	 *
	 * @return string
	 */
	private function _create_require_js_config_object() {
		$js_url    = AI1EC_ADMIN_THEME_JS_URL;
		$version   = AI1EC_VERSION;
		$namespace = self::REQUIRE_NAMESPACE;
		$config    = <<<JSC
		$namespace.require.config( {
			waitSeconds : 15,
			urlArgs     : 'ver=$version',
			baseUrl     : '$js_url'
		} );
JSC;
		return $config;
	}

	/**
	 *	Check if we are in the calendar feeds page
	 *
	 * @return boolean TRUE if we are in the calendar feeds page FALSE otherwise
	 */
	private function are_we_on_calendar_feeds_page() {
		$path_details = pathinfo( $_SERVER["SCRIPT_NAME"] );
		$post_type = isset( $_GET['post_type'] ) ? $_GET['post_type'] : FALSE;
		$page = isset( $_GET['page'] ) ? $_GET['page'] : FALSE;
		if( $post_type === FALSE || $page === FALSE ) {
			return FALSE;
		}
		$is_calendar_feed_page = $path_details['basename'] === 'edit.php' &&
		                         $post_type                === 'ai1ec_event' &&
		                         $page                     === 'all-in-one-event-calendar-feeds';
		return $is_calendar_feed_page;
	}

	/**
	 * Add the link to render the javascript
	 *
	 * @param string $page
	 * @param boolean $backend
	 *
	 * @return void
	 */
	private function _add_link_to_render_js( $page, $backend ) {
		$load_backend_script = 'false';
		if ( true === $backend ) {
			$load_backend_script = self::TRUE_PARAM;
		}
		$is_calendar_page = false;
		if( true === is_page( $this->_settings->get( 'calendar_page_id' ) ) ) {
			$is_calendar_page = self::TRUE_PARAM;
		}
		$url = $this->_template_link_helper->get_site_url() . '?' .
				// Add the page to load
				self::LOAD_JS_PARAMETER . '=' . $page . '&' .
				// If we are in the backend, we must load the common scripts
				self::IS_BACKEND_PARAMETER . '=' . $load_backend_script . '&' .
				// If we are on the calendar page we must load the correct option
				self::IS_CALENDAR_PAGE . '=' . $is_calendar_page;
		if ( true === $backend ) {
			$this->_scripts_helper->enqueue_script(
					self::JS_HANDLE,
					$url,
					array( 'postbox' ),
					true
			);
		} else {
			$this->_scripts_helper->enqueue_script(
					self::JS_HANDLE,
					$url,
					array(),
					true
			);
		}
	}

	/**
	 * check if we are editing an event
	 *
	 * @return boolean TRUE if we are editing an event FALSE otherwise
	 */
	private function _are_we_editing_an_event() {
		$path_details = pathinfo( $_SERVER["SCRIPT_NAME"] );
		$post_id = isset( $_GET['post'] ) ? $_GET['post'] : FALSE;
		$action = isset( $_GET['action'] ) ? $_GET['action'] : FALSE;
		if( $post_id === FALSE || $action === FALSE ) {
			return FALSE;
		}

		$editing = (
			'post.php' === $path_details['basename'] &&
			'edit'     === $action &&
			$this->_aco->is_our_post_type( $post_id )
		);
		return $editing;
	}

	/**
	 * check if we are creating a new event
	 *
	 * @return boolean TRUE if we are creating a new event FALSE otherwise
	 */
	private function _are_we_creating_a_new_event() {
		$path_details = pathinfo( $_SERVER["SCRIPT_NAME"] );
		$post_type = isset( $_GET['post_type'] ) ? $_GET['post_type'] : '';
		return $path_details['basename'] === 'post-new.php' &&
				$post_type === AI1EC_POST_TYPE;
	}

	/**
	 * Check if we are accessing the settings page
	 *
	 * @return boolean TRUE if we are accessing the settings page FALSE otherwise
	 */
	private function _are_we_accessing_the_calendar_settings_page() {
		$path_details = pathinfo( $_SERVER["SCRIPT_NAME"] );
		$page = isset( $_GET['page'] ) ? $_GET['page'] : '';
		return $path_details['basename'] === 'edit.php' &&
				$page === AI1EC_PLUGIN_NAME . '-settings';
	}

	/**
	 * Check if we are editing less variables
	 *
	 * @return boolean TRUE if we are accessing a single event page FALSE otherwise
	 */
	private function _are_we_editing_less_variables() {
		$path_details = pathinfo( $_SERVER["SCRIPT_NAME"] );
		$page = isset( $_GET['page'] ) ? $_GET['page'] : '';
		return $path_details['basename'] === 'edit.php' && $page === AI1EC_PLUGIN_NAME . '-edit-css';
	}

	/**
	 * Check if we are accessing the events category page
	 *
	 * @return boolean TRUE if we are accessing the events category page FALSE otherwise
	 */
	private function _are_we_editing_event_categories() {
		$path_details = pathinfo( $_SERVER["SCRIPT_NAME"] );
		$post_type = isset( $_GET['post_type'] ) ? $_GET['post_type'] : '';
		return $path_details['basename'] === 'edit-tags.php' && $post_type === AI1EC_POST_TYPE;
	}

	/**
	 * Check if we are accessing a single event page
	 *
	 * @return boolean TRUE if we are accessing a single event page FALSE otherwise
	 */
	private function _are_we_accessing_the_single_event_page() {
		return $this->_aco->is_our_post_type();
	}

}