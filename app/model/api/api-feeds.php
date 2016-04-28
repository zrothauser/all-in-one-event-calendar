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
			return null;
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

		$response = $this->request_api( 'GET',
			$url,
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
			return null;
		}
	}

	/**
	 * Call the API to Process and Import the Feed
	 */
	public function import_feed( $feed_url ) {
		$calendar_id = $this->_get_ticket_calendar();
		if ( 0 >= $calendar_id ) {
			return null;
		}
		$response = $this->request_api( 'POST', AI1EC_API_URL . 'calendars/' . $calendar_id . '/feeds/import',
			json_encode( [ "url" => $feed_url ] )
		);
		if ( $this->is_response_success( $response ) ) {
			return $response->body; 	
		}  else {
			$this->save_error_notification( 
				$response, 
				__( 'We were unable to import feed', AI1EC_PLUGIN_NAME )
			);
			return null;
		}
	}

	/**
	 * Call the API to get the feed
	 */
	public function get_feed( $feed_id ) {
	    $calendar_id = $this->_get_ticket_calendar();
	    if ( 0 >= $calendar_id ) {
	        return null;
	    }
	    $response = $this->request_api( 'GET', AI1EC_API_URL . 'calendars/' . $calendar_id . '/feeds/' . $feed_id,
	            json_encode( [ "max" => "9999" ] )
	            );
	    
	    if ( $this->is_response_success( $response ) ) {
	        return $response->body;
	    }  else {
	        $this->save_error_notification(
	                $response,
	                __( 'We were unable to get feed data' , AI1EC_PLUGIN_NAME )
	                );
	        return null;
	    }
	}
}