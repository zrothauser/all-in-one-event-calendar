<?php

/**
 *
 * @author time.ly
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

	public function __construct() {
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
		$this->install_schema();
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
		global $wpdb,
		       $ai1ec_view_helper,
		       $ai1ec_importer_helper;
		$ajax = false;
		// if no feed is provided, we are using ajax
		if( ! $feed_id ) {
			$ajax = true;
			$feed_id = (int) $_REQUEST['ics_id'];
		}
		$table_name = $wpdb->prefix . 'ai1ec_event_feeds';
		$feed = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table_name WHERE feed_id = %d", $feed_id ) );

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
			$ai1ec_view_helper->json_response( $output );
		}
	}

}
