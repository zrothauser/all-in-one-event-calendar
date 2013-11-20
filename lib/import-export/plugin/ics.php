<?php

/**
 * The class which handles ics feeds tab.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Import-export.Plugin
 */
class Ai1ecIcsConnectorPlugin extends Ai1ec_Connector_Plugin {

	const ICS_OPTION_DB_VERSION = 'ai1ec_ics_db_version';

	const ICS_DB_VERSION        = 106;

	/**
	 * @var array
	 *   title: The title of the tab and the title of the configuration section
	 *   id: The id used in the generation of the tab
	 */
	protected $variables = array(
			"title" => "ICS",
			"id"    => "ics"
	);

	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );

		// Add AJAX Actions.
		// Add iCalendar feed
		add_action( 'wp_ajax_ai1ec_add_ics',    array( $this, 'add_ics_feed' ) );
		// Delete iCalendar feed
		add_action( 'wp_ajax_ai1ec_delete_ics', array( $this, 'delete_feeds_and_events' ) );
		// Update iCalendar feed
		add_action( 'wp_ajax_ai1ec_update_ics', array( $this, 'update_ics_feed' ) );
		// Add iCalendar feed frontend handling
		add_action( 'wp_ajax_nopriv_ai1ec_add_ics_frontend', array( $this, 'add_ics_feed_frontend' ) );
		add_action( 'wp_ajax_ai1ec_add_ics_frontend', array( $this, 'add_ics_feed_frontend' ) );
		// Cron job hook
		add_action( 'ai1ec_cron'              , array( $this, 'cron' ) );
		// Handle schema changes.
		$this->_install_schema();
		// Install the CRON
		$this->install_cron();
	}

	/**
	 * update_ics_feed function
	 *
	 * Imports the selected iCalendar feed
	 *
	 * @return void
	 **/
	public function update_ics_feed( $feed_id = false ) {
		$db = $this->_registry->get( 'dbi.dbi' );
		$ajax = false;
		// if no feed is provided, we are using ajax
		if( ! $feed_id ) {
			$ajax = true;
			$feed_id = (int) $_REQUEST['ics_id'];
		}
		$table_name = $db->get_table_name( 'ai1ec_event_feeds' );
		$feed = $db->get_row(
			$db->prepare(
				"SELECT * FROM $table_name WHERE feed_id = %d", $feed_id
			)
		);

		if ( $feed ) {
			// flush the feed
			$this->flush_ics_feed( false, $feed->feed_url );
			$count = 0;
			$message = false;
			// reimport the feed
			$response = wp_remote_get( $feed->feed_url, array( 'sslverify' => false, 'timeout' => 120 ) );
			if (
				! is_wp_error( $response )             &&
				isset( $response['response'] )         &&
				isset( $response['response']['code'] ) &&
				$response['response']['code'] == 200   &&
				isset( $response['body'] )             &&
				! empty( $response['body'] )
			) {
				try {
					$import_export = $this->_registry->get( 'controller.import-export' );
					$args = array();
					$args['feed'] = $feed;
					$args['comments_enabled'] = 'open';
					if ( isset( $feed->comments_enabled ) && $feed->comments_enabled < 1 ) {
						$comment_status = 'closed';
					}

					$args['do_show_map'] = 0;
					if (
					isset( $feed->map_display_enabled ) &&
						$feed->map_display_enabled > 0
					) {
						$args['do_show_map'] = 1;
					}
					$args['source'] = $response['body'];
					$count = $import_export->import_events( 'ics', $args );
				} catch ( Ai1ec_Parse_Exception $e ) {
					$message = "the provided feed didn't return valid ics data";
				} catch ( Ai1ec_Engine_Not_Set_Exception $e ) {
					$message = "ics import is not supported on this install.";
				}
			} else {
				$message = __(
					"We couldn't find a valid transport to fetch the calendar data.
					You should set allow_url_fopen in php.ini as suggested in
					<a href='http://forums.hostdime.com/showthread.php?8620-PHP-allow_url_fopen' target='_blank' >this</a> article",
					AI1EC_PLUGIN_NAME
				);
			}

			if ( $count == 0 ) {
				// If results are 0, it could be result of a bad URL or other error, send a specific message
				$return_message = false === $message ?
					__( 'No events were found', AI1EC_PLUGIN_NAME ) :
					$message;
				$output = array(
						'error'   => true,
						'message' => $return_message
				);
			} else {
				$output = array(
						'error'       => false,
						'message'     => sprintf( _n( 'Imported %s event', 'Imported %s events', $count, AI1EC_PLUGIN_NAME ), $count ),
				);
			}
		} else {
			$output = array(
					'error' 	=> true,
					'message'	=> __( 'Invalid ICS feed ID', AI1EC_PLUGIN_NAME )
			);
		}
		$output['ics_id'] = $feed_id;
		if( true === $ajax ) {
			$render_json = $this->_registry->get(
				'http.response.render.strategy.json'
			);
			$render_json->render( $output );
		}
	}

	/**
	 * Validates the add new feed url form
	 *
	 * @return array
	 */
	private function validate_form() {
		$response = array( 'success' => true );
		// Check nonce.
		if ( isset( $_POST[AI1EC_POST_TYPE] ) &&
		! wp_verify_nonce( $_POST[AI1EC_POST_TYPE], 'ai1ec_submit_ics_form' ) ) {
			$response['message'] = __( 'Access denied.', AI1EC_PLUGIN_NAME );
			$response['success'] = false;
			return $response;
		}

		$settings = $this->_registry->get( 'model.settings' );
		$public_key = $settings->get( 'recaptcha_public_key' );
		// Check CAPTCHA.
		if ( ! is_user_logged_in() &&
			! empty( $public_key ) ) {
			$captcha = $this->_registry->get( 'security.captcha' );

			$check = $captcha->check_captcha();
			if( false === $check['success'] ) {
				$response['success'] = false;
				$response['message'] = $check['message'];
				return $response;
			}
		}
		$response['message'] = __( 'Your suggestion was submitted to a site administrator for review.', AI1EC_PLUGIN_NAME );
		return $response;
	}

	/**
	 * Send an e-mail to the admin and another to the user if form passes
	 * validation.
	 */
	public function add_ics_feed_frontend() {

		$db = $this->_registry->get( 'dbi.dbi' );
		$table_name = $db->get_table_name( 'ai1ec_event_feeds' );
		$check = $this->validate_form();

		$check['nonce'] = wp_nonce_field(
			'ai1ec_submit_ics_form',
			AI1EC_POST_TYPE,
			true,
			false
		);

		if ( true === $check['success'] ) {
			$ai1ec_settings = $this->_registry->get( 'model.settings' );
			// Strip slashes if ridiculous PHP setting magic_quotes_gpc is enabled.
			if ( get_magic_quotes_gpc() ) {
				foreach ( $_POST as &$param ) {
					$param = stripslashes( $param );
				}
			}
			$translations = $this->get_translations();
			$notification_for_admin = $this->_registry->get(
				'notification.mail',
				array( get_option( 'admin_email' ) ),
				$ai1ec_settings->get( 'admin_mail_body' ),
				$ai1ec_settings->get( 'admin_mail_subject' )
			);
			$notification_for_user = $this->_registry->get(
				'notification.mail',
				array( $_POST['ai1ec_submitter_email'] ),
				$ai1ec_settings->get( 'user_mail_body' ),
				$ai1ec_settings->get( 'user_mail_subject' )
			);
			$notification_for_admin->set_translations( $translations );
			$notification_for_admin->send();
			$notification_for_user->set_translations( $translations );
			$notification_for_user->send();
		}
		$json = $this->_registry->get( 'http.response.strategy.json' );

		$json->render( $check );
	}

	/**
	 * Returns the translations array
	 *
	 * @return array
	 */
	private function get_translations() {
		$categories = isset( $_POST['ai1ec_categories'] ) ? $_POST['ai1ec_categories'] : array();
		foreach ( $categories as &$cat ) {
			$term = get_term( $cat, 'events_categories' );
			$cat = $term->name;
		}
		$translations = array(
			'[feed_url]'   => $_POST['ai1ec_calendar_url'],
			'[categories]' => implode( ', ' , $categories ),
			'[user_email]' => $_POST['ai1ec_submitter_email'],
			'[site_title]' => get_bloginfo( 'name' ),
			'[site_url]'   => site_url(),
			'[feeds_url]'  => admin_url( AI1EC_FEED_SETTINGS_BASE_URL . '#ics' ),
		);
		return $translations;
	}

	/**
	 * This function sets up the cron job for updating the events, and upgrades it if it is out of date.
	 *
	 * @return void
	 */
	private function install_cron() {
		// If existing CRON version is not consistent with current plugin's version,
		// or does not exist, then create/update cron using
		if (
			$this->_registry->get( 'model.option' )->get( 'ai1ec_cron_version' ) !=
			AI1EC_CRON_VERSION
		) {
			$settings = $this->_registry->get( 'model.settings' );
			// delete our scheduled crons
			wp_clear_scheduled_hook( 'ai1ec_cron' );
			// set the new cron
			wp_schedule_event(
				current_time( 'timestamp' ) + 600,
				$settings->get( 'cron_freq' ),
				'ai1ec_cron'
			);
			// update the cron version
			update_option( 'ai1ec_cron_version', AI1EC_CRON_VERSION );
		}
	}

	/**
	 * Handles all the required steps to install / update the schema
	 */
	protected function _install_schema() {
		// If existing DB version is not consistent with current plugin's
		// version,
		// or does not exist, then create/update table structure using
		// dbDelta().
		$option = $this->_registry->get( 'model.option' );
		if ( $option->get( self::ICS_OPTION_DB_VERSION ) !=
			 self::ICS_DB_VERSION ) {
			$db = $this->_registry->get( 'dbi.dbi' );
			// ======================
			// = Create table feeds =
			// ======================
			$table_name = $db->get_table_name( 'ai1ec_event_feeds' );
			$sql = "CREATE TABLE $table_name (
					feed_id bigint(20) NOT NULL AUTO_INCREMENT,
					feed_url varchar(255) NOT NULL,
					feed_category varchar(255) NOT NULL,
					feed_tags varchar(255) NOT NULL,
					comments_enabled tinyint(1) NOT NULL DEFAULT '1',
					map_display_enabled tinyint(1) NOT NULL DEFAULT '0',
					keep_tags_categories tinyint(1) NOT NULL DEFAULT '0',
					PRIMARY KEY  (feed_id),
					UNIQUE KEY feed (feed_url)
					) CHARACTER SET utf8;";

			if ( $this->_registry->get( 'database.helper' )->apply_delta( $sql ) ) {
				$option->update( self::ICS_OPTION_DB_VERSION,
					self::ICS_DB_VERSION );
			} else {
				trigger_error( 'Failed to upgrade ICS DB schema',
					E_USER_WARNING );
			}
		}
	}

	/**
	 * cron function
	 *
	 * Import all ICS feeds
	 *
	 * @return void
	 *
	 */
	public function cron() {
		$db = $this->_registry->get( 'dbi.dbi' );
		// Initializing custom post type and custom taxonomies
		$post_type = $this->_registry->get( 'post.custom-type' );
		$post_type->register();

		// ====================
		// = Select all feeds =
		// ====================
		$table_name = $db->get_table_name( 'ai1ec_event_feeds' );
		$sql = "SELECT * FROM {$table_name}";
		$feeds = $db->get_results( $sql );

		// ===============================
		// = go over each iCalendar feed =
		// ===============================
		foreach ( $feeds as $feed ) {
			// update the feed
			$this->update_ics_feed( $feed->feed_id );
		}
	}

	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Connector_Plugin::handle_feeds_page_post()
	 */
	public function handle_feeds_page_post() {
		$settings = $this->_registry->get( 'model.settings' );
		if ( isset( $_POST['ai1ec_save_settings'] ) ) {
			$settings->set( 'cron_freq', $_REQUEST['cron_freq'] );
		}
	}
	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Connector_Plugin::render_tab_content()
	 */
	public function render_tab_content() {
		// Render the opening div
		$this->render_opening_div_of_tab();
		// Render the body of the tab
		$settings = $this->_registry->get( 'model.settings' );

		$select2_cats = $this->_registry->get(
			'html.element.legacy.select2.multiselect',
			array( 'name' => 'ai1ec_feed_category[]',
				'id' => 'ai1ec_feed_category',
				'use_id' => true,
				'type' => 'category',
				'placeholder' => __(
					'Categories (optional)',
					AI1EC_PLUGIN_NAME
				)
			),
			get_terms(
				'events_categories',
				array(
					'hide_empty' => false
				)
			)
		);
		$select2_tags = $this->_registry->get(
			'html.element.legacy.select2.input',
			array( 'id' => 'ai1ec_feed_tags'
			) );
		$modal = $this->_registry->get(
			'html.element.legacy.bootstrap.modal',
			esc_html__(
				"Do you want to keep the events imported from the calendar or remove them?",
				AI1EC_PLUGIN_NAME )
		);
		$modal->set_header_text(
			esc_html__( "Removing ICS Feed", AI1EC_PLUGIN_NAME ) );
		$modal->set_keep_button_text(
			esc_html__( "Keep Events", AI1EC_PLUGIN_NAME ) );
		$modal->set_delete_button_text(
			esc_html__( "Remove Events", AI1EC_PLUGIN_NAME ) );
		$modal->set_id( 'ai1ec-ics-modal' );
		$loader = $this->_registry->get( 'theme.loader' );
		$cron_freq = $loader->get_file(
			'cron_freq.php',
			array( 'cron_freq', $settings->get( 'cron_freq' ) ),
			true
		);
		$args = array(
			'cron_freq' => $cron_freq->get_content(),
			'event_categories' => $select2_cats,
			'event_tags' => $select2_tags,
			'feed_rows' => $this->_get_feed_rows(),
			'modal' => $modal
		);

		$display_feeds = $loader->get_file(
			'plugins/ics/display_feeds.php',
			$args,
			true
		);
		$display_feeds->render();
		$this->render_closing_div_of_tab();
	}

	/**
	 * get_feed_rows function
	 *
	 * Creates feed rows to display on settings page
	 *
	 * @return String feed rows
	 **/
	protected function _get_feed_rows() {
		$db = $this->_registry->get( 'dbi.dbi' );

		// Select all added feeds
		$rows = $db->get_results(
			'SELECT * FROM ' . $db->prefix . 'ai1ec_event_feeds'
		);

		$sql = 'SELECT COUNT(*) FROM ' . $db->prefix .
		       'ai1ec_events WHERE ical_feed_url = %s';
		$html = '';
		foreach ( $rows as $row ) {
			$events          = $db->get_var(
				$db->prepare( $sql, $row->feed_url )
			);
			$feed_categories = explode( ',', $row->feed_category );
			$categories      = array();

			foreach ( $feed_categories as $cat_id ) {
				$feed_category = get_term(
					$cat_id,
					'events_categories'
				);
				if ( $feed_category && ! is_wp_error( $feed_category ) ) {
					$categories[] = $feed_category->name;
				}
			}

			$args          = array(
				'feed_url'            => $row->feed_url,
				'event_category'      => implode( ', ', $categories ),
				'tags'                => stripslashes(
					str_replace( ',', ', ', $row->feed_tags )
				),
				'feed_id'             => $row->feed_id,
				'comments_enabled'    => (bool) intval(
					$row->comments_enabled
				),
				'map_display_enabled' => (bool) intval(
					$row->map_display_enabled
				),
				'keep_tags_categories' => (bool) intval(
					$row->keep_tags_categories
				),
				'events'              => $events,
			);
			$loader = $this->_registry->get( 'theme.loader' );
			$file = $loader->get_file( 'feed_row.php', $args );
			$html .= $file->get_content();
		}

		return $html;
	}
	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Connector_Plugin::display_admin_notices()
	 */
	public function display_admin_notices() {
		return;
	}
	/**
	 * (non-PHPdoc)
	 *
	 * @see Ai1ec_Connector_Plugin::run_uninstall_procedures()
	 */
	public function run_uninstall_procedures() {
		// Delete tables
		$db = $this->_registry->get( 'dbi.dbi' );
		$table_name = $db->prefix . 'ai1ec_event_feeds';
		$db->query( "DROP TABLE IF EXISTS $table_name" );
		// Delete scheduled tasks
		wp_clear_scheduled_hook( 'ai1ec_cron' );
		// Delete options
		delete_option( self::ICS_DB_VERSION );
		delete_option( self::ICS_OPTION_DB_VERSION );
	}

	/**
	 * add_ics_feed function
	 *
	 * Adds submitted ics feed to the database
	 *
	 * @return string JSON output
	 *
	 */
	public function add_ics_feed() {
		$db = $this->_registry->get( 'dbi.dbi' );
		$table_name = $db->get_table_name( 'ai1ec_event_feeds' );

		$feed_categories = empty( $_REQUEST['feed_category'] ) ? '' : implode(
			',', $_REQUEST['feed_category'] );
		$entry = array( 'feed_url' => $_REQUEST['feed_url'],
			'feed_category' => $feed_categories,
			'feed_tags' => $_REQUEST['feed_tags'],
			'comments_enabled' => Ai1ec_Number_Utility::db_bool(
				$_REQUEST['comments_enabled'] ),
			'map_display_enabled' => Ai1ec_Number_Utility::db_bool(
				$_REQUEST['map_display_enabled'] ),
			'keep_tags_categories' => Ai1ec_Number_Utility::db_bool(
				$_REQUEST['keep_tags_categories'] )
		);

		$format = array( '%s', '%s', '%s', '%d', '%d', '%d'
		);

		$db->insert( $table_name, $entry, $format );
		$feed_id = $db->get_insert_id();

		$categories = array();

		if ( ! empty( $_REQUEST['feed_category'] ) ) {
			foreach ( $_REQUEST['feed_category'] as $cat_id ) {
				$feed_category = get_term( $cat_id, 'events_categories' );
				$categories[] = $feed_category->name;
			}
		}

		$args = array( 'feed_url' => $_REQUEST['feed_url'],
			'event_category' => implode( ', ', $categories ),
			'tags' => str_replace( ',', ', ', $_REQUEST['feed_tags'] ),
			'feed_id' => $feed_id,
			'comments_enabled' => (bool) intval( $_REQUEST['comments_enabled'] ),
			'map_display_enabled' => (bool) intval(
				$_REQUEST['map_display_enabled']
			),
			'events' => 0,
			'keep_tags_categories' => (bool) intval(
				$_REQUEST['keep_tags_categories']
			)
		);
		$loader = $this->_registry->get( 'theme.loader' );
		// display added feed row
		$file = $loader->get_file( 'feed_row.php', $args, true );

		$output = $loader->get_content();

		$output = array(
			"error" => 0,
			"message" =>
			stripslashes( $output )
		);
		echo json_encode( $output );
		exit();
	}

	/**
	 * Delete feeds and events
	 */
	public function delete_feeds_and_events() {
		$remove_events = $_POST['remove_events'] === 'true' ? TRUE : FALSE;
		$ics_id = isset( $_POST['ics_id'] ) ? (int) $_REQUEST['ics_id'] : 0;
		if ( $remove_events ) {
			$output = $this->flush_ics_feed( TRUE, FALSE );
			if ( $output['error'] === FALSE ) {
				$this->delete_ics_feed( FALSE, $ics_id );
			}
			echo json_encode( $output );
			exit();
		} else {
			$this->delete_ics_feed( TRUE, $ics_id );

		}
	}
	/**
	 * flush_ics_feed function
	 *
	 * Deletes all event posts that are from that selected feed
	 *
	 * @param bool $ajax
	 *        	When set to TRUE, the data is outputted using json_response
	 * @param bool|string $feed_url
	 *        	Feed URL
	 *
	 * @return void
	 *
	 */
	public function flush_ics_feed( $ajax = TRUE, $feed_url = FALSE ) {
		$db = $this->_registry->get( 'dbi.dbi' );
		$ics_id = isset( $_REQUEST['ics_id'] ) ? (int) $_REQUEST['ics_id'] : 0;
		$table_name = $db->get_table_name( 'ai1ec_event_feeds' );
		if ( $feed_url === FALSE ) {
			$feed_url = $db->get_var(
				$db->prepare(
					"SELECT feed_url FROM $table_name WHERE feed_id = %d",
					$ics_id ) );
		}
		if ( $feed_url ) {
			$table_name = $db->get_table_name( 'ai1ec_events' );
			$sql = "SELECT post_id FROM {$table_name} WHERE ical_feed_url = '%s'";
			$events = $db->get_results( $db->prepare( $sql, $feed_url ) );
			$total = count( $events );
			foreach ( $events as $event ) {
				// delete post (this will trigger deletion of cached events, and
				// remove the event from events table)
				wp_delete_post( $event->post_id, 'true' );
			}
			$output = array( 'error' => FALSE,
				'message' => sprintf(
					__( 'Deleted %d events', AI1EC_PLUGIN_NAME ), $total ),
				'count' => $total
			);
		} else {
			$output = array( 'error' => TRUE,
				'message' => __( 'Invalid ICS feed ID', AI1EC_PLUGIN_NAME )
			);
		}
		if ( $ajax ) {
			$output['ics_id'] = $ics_id;
			return $output;
		}
	}
	/**
	 * delete_ics_feed function
	 *
	 * Deletes submitted ics feed id from the database
	 *
	 * @param bool $ajax When set to TRUE, the data is outputted using json_response
	 * @param bool|string $ics_id Feed URL
	 *
	 * @return String JSON output
	 **/
	public function delete_ics_feed( $ajax = TRUE, $ics_id = FALSE ) {
		$db = $this->_registry->get( 'dbi.dbi' );
		if ( $ics_id === FALSE ) {
			$ics_id = (int) $_REQUEST['ics_id'];
		}
		$table_name = $db->prefix . 'ai1ec_event_feeds';
		$db->query( $db->prepare( "DELETE FROM {$table_name} WHERE feed_id = %d", $ics_id ) );
		$output = array(
			'error'   => false,
			'message' => __( 'Feed deleted', AI1EC_PLUGIN_NAME ),
			'ics_id'  => $ics_id,
		);
		if ( $ajax === TRUE ) {
			echo json_encode( $output );
		}
	}

}