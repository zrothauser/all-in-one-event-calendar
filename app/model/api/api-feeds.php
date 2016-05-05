<?php

/**
 * Class for Timely API communication related to Discover Events and Feeds.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.4
 * @package    Ai1EC
 * @subpackage Ai1EC.Model
 */
class Ai1ec_Api_Feeds extends Ai1ec_Api_Abstract {

	/**
	 * Post construction routine.
	 *
	 * Override this method to perform post-construction tasks.
	 *
	 * @return void Return from this method is ignored.
	 */
	protected function _initialize() {
		parent::_initialize();
	}

	/**
	 * Getting a suggested events list.
	 * @return stClass Response using the following format:
	 * [total] => 10
	 * [per_page] => 8
	 * [current_page] => 1
	 * [last_page] => 2
	 * [next_page_url] => http://dev.time.ly:882/api/calendars/4/discover/events?page=2
	 * [prev_page_url] => 
	 * [from] => 1
	 * [to] => 8
	 * [data] => Array list of suggested events
	 */
	public function get_suggested_events() {
		$calendar_id = $this->_get_ticket_calendar();
		if ( 0 >= $calendar_id ) {
			throw new Exception( 'Calendar ID not found' );
		}

		$body = null;
		if (
			isset( $_POST[ 'lat' ] ) &&
			isset( $_POST[ 'lng' ] ) &&
			isset( $_POST[ 'radius' ] )
		) {
			$body=[ 
				'lat'    => $_POST[ 'lat' ],
				'lng'    => $_POST[ 'lng' ],
				'radius' => $_POST[ 'radius' ]
			];
		}

	 	$page     = isset( $_POST[ 'page' ] ) ? $_POST[ 'page' ] : 1;
	 	$max      = isset( $_POST[ 'max' ] ) ? $_POST[ 'max' ] : 8;
	 	$term     = isset( $_POST[ 'term' ] ) && $_POST[ 'term' ] 
	 		? urlencode( $_POST[ 'term' ] )
	 		: null;
	 	$location = isset( $_POST[ 'location' ] ) && $_POST[ 'location' ]
	 		? '&location=' . urlencode( $_POST[ 'location' ] ) 
	 		: '';

	 	if ( null === $term ) {
			return null;
		}
		
	 	$url      = AI1EC_API_URL .
	 		"calendars/$calendar_id/discover/events?page=$page&max=$max&term=$term" .
	 		$location;

		$response = $this->request_api( 'GET', $url,
			null !== $body ? json_encode( $body ) : null,
			true //decode body response
		);

		if ( $this->is_response_success( $response ) ) {
			return $response->body; 	
		}  else {
			$this->save_error_notification( 
				$response, 
				__( 'We were unable to get the Suggested Events from Time.ly Network', AI1EC_PLUGIN_NAME )
			);
			throw new Exception( 'We were unable to get the Suggested Events from Time.ly Network' );
		}
	}

	/**
	 * Call the API to Process and Import the Feed
	 */
	public function import_feed( $entry, $automatic_import = false ) {
		$calendar_id = $this->_get_ticket_calendar();
		if ( 0 >= $calendar_id ) {
			throw new Exception( 'Calendar ID not found' );
		}
		$response = $this->request_api( 'POST', AI1EC_API_URL . 'calendars/' . $calendar_id . '/feeds/import',
			json_encode( [
				'url'                           => $entry['feed_url'],
				'categories'                    => $entry['feed_category'],
				'tags'                          => $entry['feed_tags'],
				'allow_comments'                => $entry['comments_enabled'],
				'show_maps'                     => $entry['map_display_enabled'],
				'import_any_tag_and_categories' => $entry['keep_tags_categories'],
				'preserve_imported_events'      => $entry['keep_old_events'],
				'assign_default_utc'            => $entry['import_timezone']
			] )
		);

		if ( $this->is_response_success( $response ) ) {
			// Refresh list of subscriptions and limits
			$this->get_subscriptions( true );

			return $response->body;
		} else {
			// This is just for not showing duplicated error messages
			if ( ! $automatic_import ) {
				$this->save_error_notification(
					$response,
					__( 'We were unable to import feed', AI1EC_PLUGIN_NAME )
				);
			}
			throw new Exception( $this->get_api_error_msg( $response->raw ) );
		}
	}

	/**
	 * Call the API to get the feed
	 */
	public function get_feed( $feed_id ) {
		$calendar_id = $this->_get_ticket_calendar();
		if ( 0 >= $calendar_id ) {
			throw new Exception( 'Calendar ID not found' );
		}
		$response = $this->request_api( 'GET', AI1EC_API_URL . 'calendars/' . $calendar_id . '/feeds/get/' . $feed_id,
			json_encode( [ "max" => "9999" ] )
		);

		if ( $this->is_response_success( $response ) ) {
			return $response->body;
		} else {
			$this->save_error_notification(
				$response,
				__( 'We were unable to get feed data', AI1EC_PLUGIN_NAME )
			);
			throw new Exception( $this->get_api_error_msg( $response->raw ) );
		}
	}

	/**
	 * Call the API to get list of feed subscriptions
	 */
	public function get_and_sync_feed_subscriptions() {
		$response = $this->request_api( 'GET', AI1EC_API_URL . 'calendars/' . $this->_get_ticket_calendar() . '/feeds/list',
			null,
			true
		);

		if ( $this->is_response_success( $response ) ) {
			$db = $this->_registry->get( 'dbi.dbi' );
			$table_name = $db->get_table_name( 'ai1ec_event_feeds' );

			// Select all feeds - Import every feed to API
			$rows = $db->select(
				$table_name,
				array(
					'feed_id',
					'feed_url',
					'feed_name',
					'feed_category',
					'feed_tags',
					'comments_enabled',
					'map_display_enabled',
					'keep_tags_categories',
					'keep_old_events',
					'import_timezone'
				)
			);

			foreach ( $rows as $row ) {
				// Build array with feed options
				$entry = array(
					'feed_url'             => $row->feed_url,
					'feed_category'        => $row->feed_category,
					'feed_tags'            => $row->feed_tags,
					'comments_enabled'     => $row->comments_enabled,
					'map_display_enabled'  => $row->map_display_enabled,
					'keep_tags_categories' => $row->keep_tags_categories,
					'keep_old_events'      => $row->keep_old_events,
					'import_timezone'      => $row->import_timezone
				);
				// Import and update API feed settings
				$response_import = $this->import_feed( $entry, true );
				if ( null !== $response_import ) {
					$db->update(
						$table_name,
						array(
							'feed_name'      => $response_import->id,
							'feed_status'    => 'a',
							'updated_at_gmt' => current_time( 'mysql', 1 )
						),
						array(
							'feed_id'        => $row->feed_id
						)
					);
				}
			}

			// Now add calendars from API that doesn't existe in local database
			$response_body = (array) $response->body;
			foreach( $response_body as $feed ) {
				$found = false;

				foreach ( $rows as $row ) {
					if ( $row->feed_name === $feed->feed_id ) {
						$found = true;
						break;
					}
				}

				// Not found in local database.. Insert
				if ( ! $found ) {
					$entry = array(
						'feed_url'             => $feed->url,
						'feed_name'            => $feed->feed_id,
						'feed_category'        => $feed->categories,
						'feed_tags'            => $feed->tags,
						'comments_enabled'     => $feed->allow_comments,
						'map_display_enabled'  => $feed->show_maps,
						'keep_tags_categories' => $feed->import_any_tag_and_categories,
						'keep_old_events'      => $feed->preserve_imported_events,
						'import_timezone'      => $feed->assign_default_utc,
						'feed_status'          => 'a',
						'updated_at_gmt'       => current_time( 'mysql', 1 )
					);
					$format = array( '%s', '%s', '%s', '%s', '%d', '%d', '%d', '%d', '%d', '%s', '%s' );
					$res    = $db->insert(
						$table_name,
						$entry,
						$format
					);
				}
			}
		}
	}

	/**
	 * Call the API to unsubscribe feed
	 */
	public function unsubscribe_feed( $feed_id, $feed_event_uid = '' ) {
		$calendar_id = $this->_get_ticket_calendar();
		if ( 0 >= $calendar_id ) {
			throw new Exception( 'Calendar ID not found' );
		}

		$response = $this->request_api( 'POST', AI1EC_API_URL . 'calendars/' . $calendar_id . '/feeds/unsubscribe',
			json_encode( [
				'feed_id'        => $feed_id,
				'feed_event_uid' => $feed_event_uid
			] )
		);

		// Refresh list of subscriptions and limits
		$this->get_subscriptions( true );

		if ( $this->is_response_success( $response ) ) {
			return $response->body;
		} else {
			$this->save_error_notification(
				$response,
				__( 'We were unable to unsubscribe feed', AI1EC_PLUGIN_NAME )
			);
			throw new Exception( $this->get_api_error_msg( $response->raw ) );
		}
	}
}
