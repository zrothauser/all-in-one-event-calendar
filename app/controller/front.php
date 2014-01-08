<?php

/**
 * The front controller of the plugin.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
class Ai1ec_Front_Controller {

	/**
	 * @var Ai1ec_Registry_Object The Object registry.
	 */
	protected $_registry;

	/**
	 * @var bool Whether the domain has alredy been loaded or not.
	 */
	protected $_domain_loaded = false;

	/**
	 * @var string The pagebase used by Ai1ec_Href_Helper.
	 */
	protected $_pagebase_for_href;

	/**
	 * @var Ai1ec_Request_Parser Instance of the request pa
	 */
	protected $_request;

	/**
	 * Initialize the controller.
	 *
	 * @param Ai1ec_Loader $ai1ec_loader Instance of Ai1EC classes loader
	 *
	 * @return void
	 */
	public function initialize( $ai1ec_loader ) {
		ai1ec_start();
		$this->_init( $ai1ec_loader );
		$this->_initialize_dispatcher();
		$this->_registry->get( 'less.lessphp' )->initialize_less_variables_if_not_set();
		$this->_registry->get( 'controller.shutdown' )
			->register( 'ai1ec_stop' );
		add_action( 'plugins_loaded', array( $this, 'register_extensions' ) );
	}

	/**
	 * Notify extensions and pass them instance of objects registry.
	 *
	 * @return void
	 */
	public function register_extensions() {
		do_action( 'ai1ec_loaded', $this->_registry );
	}

	/**
	 * Perform actions needed when our plugin is activated.
	 *
	 * @wp_hook activate_all-in-one-event-calendar/all-in-one-event-calendar.php
	 *
	 * @return void
	 */
	public function activation_hook() {
		$this->_registry->get( 'app' )->register_post_type();
		// Flush rewrite rules.
		$this->_registry->get( 'rewrite' )->check_rewrites();
	}

	/**
	 * Execute commands if our plugin must handle the request.
	 *
	 * @wp_hook init
	 *
	 * @return void
	 */
	public function route_request() {
		$this->_process_request();
		// get the resolver
		$resolver = $this->_registry->get(
			'command.resolver',
			$this->_request
		);
		// get the command
		$command = $resolver->get_command();
		// if we have a command
		if ( null !== $command ) {
			$command->execute();
		}
	}

	/**
	 * Initializes the URL router used by our plugin.
	 *
	 * @wp_hook init
	 *
	 * @return void
	 */
	public function initialize_router() {
		$settings            = $this->_registry->get( 'model.settings' );

		$cal_page            = $settings->get( 'calendar_page_id' );

		if (
			! $cal_page ||
			$cal_page < 1
		) { // Routing may not be affected in any way if no calendar page exists.
			return null;
		}
		$router              = $this->_registry->get( 'routing.router' );
		$localization_helper = $this->_registry->get( 'p28n.wpml' );
		$page_base          = '';
		$clang              = '';

		if ( $localization_helper->is_wpml_active() ) {
			$trans = $localization_helper
				->get_wpml_translations_of_page(
					$cal_page,
					true
				);
			$clang = $localization_helper->get_language();
			if ( isset( $trans[$clang] ) ) {
				$cal_page = $trans[$clang];
			}
		}
		$template_link_helper = $this->_registry->get( 'template.link.helper' );

		if ( ! get_post( $cal_page ) ) {
			return null;
		}

		$page_base = $template_link_helper->get_page_link(
			$cal_page
		);

		$page_base = Ai1ec_Wp_Uri_Helper::get_pagebase( $page_base );
		$page_link = 'index.php?page_id=' .
			$cal_page;
		$pagebase_for_href = Ai1ec_Wp_Uri_Helper::get_pagebase_for_links(
			get_page_link( $cal_page ),
			$clang
		);

		// save the pagebase to set up the factory later
		$application = $this->_registry->get( 'bootstrap.registry.application' );
		$application->set( 'calendar_base_page', $pagebase_for_href );
		$option = $this->_registry->get( 'model.option' );

		// If the calendar is set as the front page, disable permalinks.
		// They would not be legal under a Windows server. See:
		// https://issues.apache.org/bugzilla/show_bug.cgi?id=41441
		if (
			$option->get( 'permalink_structure' ) &&
			( int ) get_option( 'page_on_front' ) !==
			( int ) $settings->get( 'calendar_page_id' )
		) {
			$application->set( 'permalinks_enabled', true );
		}

		// If we are requesting the calendar page and we have a saved cookie,
		// redirect the user. Do not redirect if the user saved the home page,
		// otherwise we enter a loop.
		$cookie_dto = $router->get_cookie_set_dto();
		if ( true === $cookie_dto->get_is_cookie_set_for_calendar_page() ) {
			$cookie = $cookie_dto->get_calendar_cookie();
			$href = Ai1ec_View_Factory::create_href_helper_instance( $cookie );
			// wp_redirect sanitizes the url which strips out the |
			header( 'Location: ' . $href->generate_href(), true, '302' );
			exit ( 0 );
		}
		// We need to reset the cookie, it's to early for the is_page() call
		$router->set_cookie_set_dto();

		$router->asset_base( $page_base )
			->register_rewrite( $page_link );
	}

	/**
	 * Initialize the system.
	 *
	 * Perform all the inizialization needed for the system.
	 * Throws some uncatched exception for critical failures.
	 * Plugin will be disabled by the exception handler on those failures.
	 *
	 * @param Ai1ec_Loader $ai1ec_loader Instance of Ai1EC classes loader
	 *
	 * @throws Ai1ec_Constants_Not_Set_Exception
	 * @throws Ai1ec_Database_Update_Exception
	 * @throws Ai1ec_Database_Schema_Exception
	 *
	 * @return void Method does not return
	 */
	protected function _init( $ai1ec_loader ) {
		$exception = null;
		// Load the textdomain
		add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );
		try {
			// Initialize the registry object
			$this->_initialize_registry( $ai1ec_loader );
			// Load the css if needed
			$this->_load_css_if_needed();
			// Initialize the crons
			$this->_install_crons();
			// Register the activation hook
			$this->_initialize_schema();
			// set the default theme if not set
			$this->_add_default_theme_if_not_set();
		} catch ( Ai1ec_Constants_Not_Set_Exception $e ) {
			// This is blocking, throw it and disable the plugin
			$exception = $e;
		} catch ( Ai1ec_Database_Update_Exception $e ) {
			// Blocking throw it so that the plugin is disabled
			$exception = $e;
		} catch ( Ai1ec_Database_Schema_Exception $e ) {
			// Blocking throw it so that the plugin is disabled
			$exception = $e;
		}
		if ( null !== $exception ) {
			throw $exception;
		}
	}

	/**
	 * Set the default theme if no theme is set.
	 */
	protected function _add_default_theme_if_not_set() {
		$option = $this->_registry->get( 'model.option' );
		$theme  = $option->get( 'ai1ec_current_theme', array() );
		if ( empty( $theme ) ) {
			$option->set(
				'ai1ec_current_theme',
				array(
					'theme_dir'  => AI1EC_DEFAULT_THEME_PATH,
					'theme_root' => AI1EC_DEFAULT_THEME_ROOT,
					'stylesheet' => 'vortex',
					'legacy'     => false,
				)
			);
		}
	}

	/**
	 * Adds actions handled by the front controller.
	 */
	protected function _add_front_controller_actions() {
		// Initialize router. I use add_action as the dispatcher would just add
		// overhead.
		add_action(
			'init',
			array( $this, 'initialize_router' ),
			PHP_INT_MAX - 1
		);
		// Route the request.
		$action = 'template_redirect';
		if ( is_admin() ) {
			$action = 'init';
		}
		add_action( $action, array( $this, 'route_request' ) );
	}

	/**
	 * Initialize the dispatcher.
	 *
	 * Complete this when writing the dispatcher.
	 *
	 * @return void
	 */
	protected function _initialize_dispatcher() {
		$dispatcher = $this->_registry->get( 'event.dispatcher' );
		$dispatcher->register_action(
			'init',
			array( 'post.custom-type', 'register' )
		);
		$this->_add_front_controller_actions();
		if ( isset( $_GET[Ai1ec_Javascript_Controller::LOAD_JS_PARAMETER] ) ) {
			$dispatcher->register_action(
				'wp_loaded',
				array( 'controller.javascript', 'render_js' )
			);
		}
		$dispatcher->register_action(
			'delete_post',
			array( 'model.event.trashing', 'delete' )
		);
		$dispatcher->register_action(
			'trashed_post',
			array( 'model.event.trashing', 'trash' )
		);
		$dispatcher->register_action(
			'untrashed_post',
			array( 'model.event.trashing', 'untrash' )
		);
		$dispatcher->register_action(
			'pre_http_request',
			array( 'http.request', 'pre_http_request' ),
			10,
			3
		);
		$dispatcher->register_action(
			'http_request_args',
			array( 'http.request', 'init_certificate' ),
			10,
			2
		);
		$dispatcher->register_filter(
			'get_the_excerpt',
			array( 'view.event.content', 'event_excerpt' ),
			11
		);
		remove_filter( 'the_excerpt', 'wpautop', 10 );
		$dispatcher->register_filter(
			'the_excerpt',
			array( 'view.event.content', 'event_excerpt_noautop' ),
			11
		);

		if ( is_admin() ) {
			// get the repeat box
			$dispatcher->register_action(
				'wp_ajax_ai1ec_get_repeat_box',
				array( 'view.admin.get-repeat-box', 'get_repeat_box' )
			);
			// save rrurle and convert it to text
			$dispatcher->register_action(
				'wp_ajax_ai1ec_rrule_to_text',
				array( 'view.admin.get-repeat-box', 'convert_rrule_to_text' )
			);
			$dispatcher->register_action(
				'admin_enqueue_scripts',
				array( 'css.admin', 'admin_enqueue_scripts' )
			);
			$dispatcher->register_action(
				'admin_menu',
				array( 'view.admin.calendar-feeds', 'add_page' )
			);
			$dispatcher->register_action(
				'admin_menu',
				array( 'view.admin.theme-options', 'add_page' )
			);
			$dispatcher->register_action(
				'admin_menu',
				array( 'view.admin.theme-switching', 'add_page' )
			);
			$dispatcher->register_action(
				'admin_menu',
				array( 'view.admin.settings', 'add_page' )
			);
			$dispatcher->register_action(
				'init',
				array( 'controller.javascript', 'load_admin_js' )
			);
			$dispatcher->register_action(
				'wp_ajax_ai1ec_add_ics',
				array( 'calendar-feed.ics', 'add_ics_feed' )
			);
			$dispatcher->register_action(
				'wp_ajax_ai1ec_delete_ics',
				array( 'calendar-feed.ics', 'delete_feeds_and_events' )
			);
			$dispatcher->register_action(
				'wp_ajax_ai1ec_update_ics',
				array( 'calendar-feed.ics', 'update_ics_feed' )
			);
			$dispatcher->register_action(
				'ai1ec_cron',
				array( 'calendar-feed.ics', 'cron' )
			);
			$dispatcher->register_action(
				'network_admin_notices',
				array( 'notification.admin', 'send' )
			);
			$dispatcher->register_action(
				'admin_notices',
				array( 'notification.admin', 'send' )
			);
			$dispatcher->register_action(
				'admin_footer-edit.php',
				array( 'clone.renderer-helper', 'duplicate_custom_bulk_admin_footer' )
			);
			$dispatcher->register_filter(
				'post_row_actions',
				array( 'clone.renderer-helper', 'duplicate_post_make_duplicate_link_row' ),
				10,
				2
			);
			$dispatcher->register_action(
				'add_meta_boxes',
				array( 'view.admin.add-new-event', 'event_meta_box_container' )
			);
			$dispatcher->register_action(
				'save_post',
				array( 'model.event.creating', 'save_post' ),
				10,
				2
			);
			$dispatcher->register_action(
				'manage_ai1ec_event_posts_custom_column',
				array( 'view.admin.all-events', 'custom_columns' ),
				10,
				2
			);
			$dispatcher->register_filter(
				'manage_ai1ec_event_posts_columns',
				array( 'view.admin.all-events', 'change_columns' )
			);
			$dispatcher->register_filter(
				'manage_edit-ai1ec_event_sortable_columns',
				array( 'view.admin.all-events', 'sortable_columns' )
			);
			$dispatcher->register_filter(
				'posts_orderby',
				array( 'view.admin.all-events', 'orderby' ),
				10,
				2
			);
			add_action( 'admin_head', array( $this, 'admin_head' ) );

		} else { // ! is_admin()
			$dispatcher->register_shortcode(
				'ai1ec',
				array( 'view.calendar.shortcode', 'shortcode' )
			);
		}

	}

	/**
	 * Outputs menu icon between head tags
	 */
	public function admin_head() {
		global $wp_version;
		$argv = array(
			'before_font_icons'    => version_compare( $wp_version, '3.8', '<' ),
			'admin_theme_img_url'  => AI1EC_ADMIN_THEME_IMG_URL,
			'admin_theme_font_url' => AI1EC_ADMIN_THEME_FONT_URL,
		);
		$this->_registry->get( 'theme.loader' )
			->get_file( 'timely-menu-icon.twig', $argv, true )
			->render();
	}

	/**
	 * _add_defaults method
	 *
	 * Add (merge) default options to given query variable.
	 *
	 * @param string settingsquery variable to ammend
	 *
	 * @return string|NULL Modified variable values or NULL on failure
	 *
	 * @global    Ai1ec_Settings $ai1ec_settings Instance of settings object
	 *                                           to pull data from
	 * @staticvar array          $mapper         Mapping of query names to
	 *                                           default in settings
	 */
	protected function _add_defaults( $name ) {
		$settings = $this->_registry->get( 'model.settings' );
		static $mapper = array(
			'cat' => 'categories',
			'tag' => 'tags',
		);
		$rq_name = 'ai1ec_' . $name . '_ids';
		if (
			! isset( $mapper[$name] ) ||
			! array_key_exists( $rq_name, $this->_request )
		) {
			return NULL;
		}
		$options  = explode( ',', $this->_request[$rq_name] );
		$property = 'default_' . $mapper[$name];
		$options  = array_merge(
			$options,
			$settings->get( $property )
		);
		$filtered = array();
		foreach ( $options as $item ) { // avoid array_filter + is_numeric
			$item = (int)$item;
			if ( $item > 0 ) {
				$filtered[] = $item;
			}
		}
		unset( $options );
		if ( empty( $filtered ) ) {
			return NULL;
		}
		return implode( ',', $filtered );
	}

	/**
	 * Process_request function.
	 *
	 * Initialize/validate custom request array, based on contents of $_REQUEST,
	 * to keep track of this component's request variables.
	 *
	 * @return void
	 **/
	protected function _process_request() {
		$settings       = $this->_registry->get( 'model.settings' );
		$this->_request = $this->_registry->get( 'http.request.parser' );
		$aco            = $this->_registry->get( 'acl.aco' );
		$page_id        = $settings->get( 'calendar_page_id' );
		if (
			! $aco->is_admin() &&
			$page_id &&
			is_page( $page_id )
		) {
			foreach ( array( 'cat', 'tag' ) as $name ) {
				$implosion = $this->_add_defaults( $name );
				if ( $implosion ) {
					$this->request['ai1ec_' . $name . '_ids'] = $implosion;
					$_REQUEST['ai1ec_' . $name . '_ids']      = $implosion;
				}
			}
		}
	}

	/**
	 * Initialize cron functions.
	 *
	 * @throws Ai1ec_Scheduling_Exception
	 *
	 * @return void
	 */
	protected function _install_crons() {
		$scheduling = $this->_registry->get( 'scheduling.utility', $this->_registry );
		$allow      = $this->_registry->get( 'model.settings', $this->_registry )
				->get( 'allow_statistics' );
		$correct    = false;
		// install the cron for stats
		$hook_name = 'ai1ec_n_cron';
		// if stats are disabled, cancel the cron
		if ( false === $allow ) {
			$scheduling->delete( $hook_name );
			$correct = true;
		} else {
			$correct = $scheduling->reschedule(
				$hook_name,
				AI1EC_N_CRON_FREQ,
				AI1EC_N_CRON_VERSION
			);
		}
		// Enable checking for cron updates
		$hook_name = 'ai1ec_u_cron';
		// reschedule the cron
		$correct   = $scheduling->reschedule(
			$hook_name,
			AI1EC_U_CRON_FREQ,
			AI1EC_U_CRON_VERSION
		);
		if ( false === $correct ) {
			throw new Ai1ec_Scheduling_Exception(
				'Some CRON function might not have been installed'
			);
		}
	}

	/**
	 * Register the activation hook for the plugin.
	 *
	 * @return void
	 */
	protected function _register_activation_hook() {
		// register_activation_hook
		register_activation_hook(
			AI1EC_PLUGIN_NAME . '/' . AI1EC_PLUGIN_NAME . '.php',
			array( $this, 'activation_hook' )
		);
	}

	/**
	 * Initialize the registry object.
	 *
	 * @param Ai1ec_Loader $ai1ec_loader Instance of Ai1EC classes loader
	 *
	 * @return void Method does not return
	 */
	protected function _initialize_registry( $ai1ec_loader ) {
		$this->_registry = new Ai1ec_Registry_Object( $ai1ec_loader );
		Ai1ec_Time_Utility::set_registry( $this->_registry );
	}

	/**
	 * Loads the CSS for the plugin
	 *
	 */
	protected function _load_css_if_needed() {
		// ==================================
		// = Add the hook to render the css =
		// ==================================
		if ( isset( $_GET[Ai1ec_Css_Frontend::GET_VARIBALE_NAME] ) ) {
			$css_controller = $this->_registry->get( 'css.frontend' );
			$css_controller->render_css();
			exit( 0 );
		}
	}

	/**
	 * Load the texdomain for the plugin.
	 *
	 * @wp_hook plugins_loaded
	 *
	 * @return void
	 */
	public function load_textdomain() {
		if ( false === $this->_domain_loaded ) {
			load_plugin_textdomain(
				AI1EC_PLUGIN_NAME, false, AI1EC_LANGUAGE_PATH
			);
			$this->_domain_loaded = true;
		}
	}

	/**
	 * Check if the schema is up to date.
	 *
	 * @throws Ai1ec_Database_Schema_Exception
	 * @throws Ai1ec_Database_Update_Exception
	 *
	 * @return void
	 */
	protected function _initialize_schema() {
		$option     = $this->_registry->get( 'model.option' );
		$schema_sql = $this->get_current_db_schema();
		$version    = sha1( $schema_sql );
		// If existing DB version is not consistent with current plugin's version,
		// or does not exist, then create/update table structure using dbDelta().
		if ( $option->get( 'ai1ec_db_version' ) != $version ) {

			$this->_registry->get( 'database.applicator' )
				->remove_instance_duplicates();

			$schema     = $this->_registry->get( 'database.schema' );
			if ( ! $schema->upgrade( 200 /* past 1.x point */ ) ) {
				throw new Ai1ec_Database_Schema_Exception(
					'Failed to perform schema upgrade'
				);
			}
			unset( $schema );

			if ( $this->_registry->get( 'database.helper' )->apply_delta( $schema_sql ) ) {
				$option->set( 'ai1ec_db_version', $version );
			} else {
				throw new Ai1ec_Database_Update_Exception();
			}
		}
	}

	/**
	 * Get current database schema as a multi SQL statement.
	 *
	 * @return string Multiline SQL statement.
	 */
	public function get_current_db_schema() {
		$dbi = $this->_registry->get( 'dbi.dbi' );
		// =======================
		// = Create table events =
		// =======================
		$table_name = $dbi->get_table_name( 'ai1ec_events' );
		$sql = "CREATE TABLE $table_name (
				post_id bigint(20) NOT NULL,
				start int(10) UNSIGNED NOT NULL,
				end int(10) UNSIGNED,
				timezone_name varchar(50),
				allday tinyint(1) NOT NULL,
				instant_event tinyint(1) NOT NULL DEFAULT 0,
				recurrence_rules longtext,
				exception_rules longtext,
				recurrence_dates longtext,
				exception_dates longtext,
				venue varchar(255),
				country varchar(255),
				address varchar(255),
				city varchar(255),
				province varchar(255),
				postal_code varchar(32),
				show_map tinyint(1),
				contact_name varchar(255),
				contact_phone varchar(32),
				contact_email varchar(128),
				contact_url varchar(255),
				cost varchar(255),
				ticket_url varchar(255),
				ical_feed_url varchar(255),
				ical_source_url varchar(255),
				ical_organizer varchar(255),
				ical_contact varchar(255),
				ical_uid varchar(255),
				show_coordinates tinyint(1),
				latitude decimal(20,15),
				longitude decimal(20,15),
				facebook_eid bigint(20),
				facebook_user bigint(20),
				facebook_status varchar(1) NOT NULL DEFAULT '',
				force_regenerate tinyint(1) NOT NULL DEFAULT 0,
				PRIMARY KEY  (post_id),
				KEY feed_source (ical_feed_url)
				) CHARACTER SET utf8;";

		// ==========================
		// = Create table instances =
		// ==========================
		$table_name = $dbi->get_table_name( 'ai1ec_event_instances' );
		$sql .= "CREATE TABLE $table_name (
				id bigint(20) NOT NULL AUTO_INCREMENT,
				post_id bigint(20) NOT NULL,
				start int(10) UNSIGNED NOT NULL,
				end int(10) UNSIGNED NOT NULL,
				PRIMARY KEY  (id),
				UNIQUE KEY evt_instance (post_id,start)
				) CHARACTER SET utf8;";

		// ================================
		// = Create table category colors =
		// ================================
		$table_name = $dbi->get_table_name( 'ai1ec_event_category_colors' );
		$sql .= "CREATE TABLE $table_name (
			term_id bigint(20) NOT NULL,
			term_color varchar(255) NOT NULL,
			PRIMARY KEY  (term_id)
			) CHARACTER SET utf8;";

		return $sql;
	}

}
