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
	private $_registry;

	/**
	 * @var bool Whether the domain has alredy been loaded or not.
	 */
	private $_load_domain = false;

	/**
	 * @var string The pagebase used by Ai1ec_Href_Helper.
	 */
	private $_pagebase_for_href;

	/**
	 * @var Ai1ec_Request_Parser Instance of the request pa
	 */
	private $_request;

	/**
	 * Initialize the controller.
	 *
	 * @param Ai1ec_Loader $ai1ec_loader Instance of Ai1EC classes loader
	 *
	 * @return void
	 */
	public function initialize( $ai1ec_loader ) {
		$this->_init( $ai1ec_loader );
		$this->_initialize_dispatcher();
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
			return NULL;
		}
		$router              = $this->_registry->get( 'routing.router' );
		$localization_helper = $this->_registry->get( 'p28n.wpml' );
		$uri_helper          = $this->_registry->get( 'routing.uri-helper' );
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

		$page_base = $template_link_helper->get_page_link(
			$cal_page
		);

		$page_base = $uri_helper::get_pagebase( $page_base );
		$page_link = 'index.php?page_id=' .
			$cal_page;
		$pagebase_for_href = $uri_helper::get_pagebase_for_links(
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
	private function _init( $ai1ec_loader ) {
		$exception = null;
		try {
			// Initialize the registry object
			$this->_initialize_registry( $ai1ec_loader );
			// Initialize the crons
			$this->_install_crons();
			// Register the activation hook
			$this->_initialize_schema();
			// Load the textdomain
			$this->_load_textdomain();
		} catch ( Ai1ec_Constants_Not_Set_Exception $e ) {
			// This is blocking, throw it and disable the plugin
			$exception = $e;
		} catch ( Ai1ec_Scheduling_Exception $e ) {
			// This is minor, maybe display a notice
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
	 * Adds actions handled by the front controller.
	 *
	 */
	private function _add_front_controller_actions() {
		// Initialize router. I use add_action as the dispatcher would just add overhead.
		add_action( 'init', array( $this, 'initialize_router' ), PHP_INT_MAX - 1 );
		// Route the request.
		add_action( 'template_redirect', array( $this, 'route_request' ) );
	}
	/**
	 * Initialize the dispatcher.
	 *
	 * Complete this when writing the dispatcher.
	 *
	 * @return void
	 */
	private function _initialize_dispatcher() {
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
			array( 'controller.events', 'delete' )
		);
		if ( is_admin() ) {
			$dispatcher->register_action(
				'admin_enqueue_scripts',
				array( 'css.admin', 'admin_enqueue_scripts' )
			);
			$dispatcher->register_action(
				'admin_menu',
				array( 'view.calendar-feeds', 'add_page' )
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

		}

	}

	/**
	 * Process_request function.
	 *
	 * Initialize/validate custom request array, based on contents of $_REQUEST,
	 * to keep track of this component's request variables.
	 *
	 * @return void
	 **/
	private function _process_request() {
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
	private function _install_crons() {
		$scheduling = $this->_registry->get( 'scheduling.utility', $this->_registry );
		$allow      = $this->_registry->get( 'model.settings', $this->_registry )
				->get( 'allow_statistics' );
		$correct   = false;
		// install the cron for stats
		$hook_name = 'ai1ec_n_cron';
		// if stats are disabled, cancel the cron
		if ( false === $allow ) {
			$scheduling->delete( $hook_name );
		}
		$correct = $scheduling->reschedule(
			$hook_name,
			AI1EC_N_CRON_FREQ,
			AI1EC_N_CRON_VERSION
		);
		// Enable checking for cron updates
		$hook_name = 'ai1ec_u_cron';
		// reschedule the cron
		$correct = $scheduling->reschedule(
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
	private function _register_activation_hook() {
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
	private function _initialize_registry( $ai1ec_loader ) {
		$this->_registry = new Ai1ec_Registry_Object( $ai1ec_loader );
	}

	/**
	 * Load the texdomain for the plugin.
	 *
	 * @return void
	 */
	private function _load_textdomain() {
		if ( false === $this->_load_domain ) {
			load_plugin_textdomain(
				AI1EC_PLUGIN_NAME, false, AI1EC_LANGUAGE_PATH
			);
			$this->_load_domain = true;
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
	private function _initialize_schema() {
		$option = $this->_registry->get( 'model.option' );
		// If existing DB version is not consistent with current plugin's version,
		// or does not exist, then create/update table structure using dbDelta().
		if ( $option->get( 'ai1ec_db_version' ) != AI1EC_DB_VERSION ) {

			$applicator = $this->_registry->get( 'database.applicator' );


			$applicator->remove_instance_duplicates();

			$structures = array();
			$schema     = $this->_registry->get( 'database.schema' );
			if ( ! $schema->upgrade( AI1EC_DB_VERSION ) ) {
				throw new Ai1ec_Database_Schema_Exception(
					'Failed to perform schema upgrade'
				);
			}
			unset( $schema );
			$dbi = $this->_registry->get( 'dbi.dbi' );
			// =======================
			// = Create table events =
			// =======================
			$table_name = $dbi->get_table_name( 'ai1ec_events' );
			$sql = "CREATE TABLE $table_name (
					post_id bigint(20) NOT NULL,
					start int(10) UNSIGNED NOT NULL,
					end int(10) UNSIGNED,
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
			if ( $this->_registry->get( 'database.helper' )->apply_delta( $sql ) ) {
				$option->set( 'ai1ec_db_version', AI1EC_DB_VERSION );
			} else {
				throw new Ai1ec_Database_Update_Exception();
			}
		}
	}

}