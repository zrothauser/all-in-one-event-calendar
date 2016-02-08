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
	 * That's currently a mock for getting a suggested events list.
	 * @return object Response body in JSON.
	 */
	public function get_suggested_events( $page = 0, $max = 20 ) {
		$calendar_id = $this->_get_ticket_calendar();
		if ( 0 >= $calendar_id ) {
			return null;
		}

		$body = null;
	 	if ( isset( $_POST[ 'lat1' ] ) &&
	 		isset( $_POST[ 'lng1' ] ) &&
	 		isset( $_POST[ 'lat2' ] ) &&
	 		isset( $_POST[ 'lng2' ] ) ) {
			$body=[ 
				'lat1' => $_POST[ 'lat1' ],
				'lng1' => $_POST[ 'lng1' ],
				'lat2' => $_POST[ 'lat2' ],
				'lng2' => $_POST[ 'lng2' ]
			];
	 	}
		$response = $this->request_api( 'GET',
			"calendars/$calendar_id/discover/events?page=$page&max=$max",
			null !== $body ? json_encode( $body ) : null, 
			true //decode body response
		);
		if ( $this->is_response_success( $response ) ) {
			return $response->body->data; 	
		}  else {
			$this->save_error_notification( 
				$response, 
				__( 'We were unable to get the Suggested Events from Time.ly Network', AI1EC_PLUGIN_NAME )
			);
			return [];
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
		$response = $this->request_api( 'POST',
			"calendars/$calendar_id/feeds/import",
			json_encode( [ "url" => $feed_url ] )			
		);
		if ( $this->is_response_success( $response ) ) {
			return $response->body; 	
		}  else {
			$this->save_error_notification( 
				$response, 
				__( 'We were unable to Import de Feed', AI1EC_PLUGIN_NAME )
			);
			return null;
		}
	}

}