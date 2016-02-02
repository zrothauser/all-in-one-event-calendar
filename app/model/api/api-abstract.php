<?php

/**
 * Common class for Timely API communication.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.4
 * @package    Ai1EC
 * @subpackage Ai1EC.Model
 */
abstract class Ai1ec_Api_Abstract extends Ai1ec_App {

	const DEFAULT_TIMEOUT           = 30; //30 seconds (Wordpress default is 5)

	protected $_settings;

	/**
	 * Post construction routine.
	 *
	 * Override this method to perform post-construction tasks.
	 *
	 * @return void Return from this method is ignored.
	 */
	protected function _initialize() {
		$this->_settings = $this->_registry->get( 'model.settings' );
	}

	/**
	 * Get the header array with authorization token
	 */
	protected function _get_headers( $with_authorizaton = true ) {
		$headers  = array(
			'content-type' => 'application/json'
		);
		if ( true === $with_authorizaton ) {
			$headers['Authorization'] = 'Basic ' . $this->_settings->get( 'ticketing_token' );
		}
		return $headers;
	}

	/**
	 * Create a standarized message to return
	 * 1) If the API respond with http code 400 and with a JSON body, so, we will consider the API message to append in the base message.
	 * 2) If the API does not responde with http code 400 or does not have a valid a JSON body, we will show the API URL and the http message error.
	 */
	protected function _transform_error_message( $base_message, $response, $url, $ask_for_reload = false ) {
		$http_response_code = wp_remote_retrieve_response_code( $response );
		$api_error          = $this->_get_api_error_msg( $response );
		$result = null;
		if ( false === ai1ec_is_blank( $api_error ) ) {
			$result = sprintf(
				__( '%s.<br/>Detail: %s.', AI1EC_PLUGIN_NAME ),
				$base_message, $api_error
			);
		} else {
			$error_message = sprintf(
				__( 'API URL: %s.<br/>Detail: %s - %s', AI1EC_PLUGIN_NAME ),
				$url,
				wp_remote_retrieve_response_code( $response ),
				wp_remote_retrieve_response_message( $response )
			);
			$mailto = '<a href="mailto:betasupport@time.ly" target="_top">betasupport@time.ly</a>';
			if ( true === $ask_for_reload ) {
				$result = sprintf(
					__( '%s. Please reload this page to try again. If this error persists, please contact us at %s. In your report please include the information below.<br/>%s.', AI1EC_PLUGIN_NAME ),
					$base_message,
					$mailto,
					$error_message
				);
			} else {
				$result = sprintf(
					__( '%s. Please try again. If this error persists, please contact us at %s. In your report please include the information below.<br/>%s.', AI1EC_PLUGIN_NAME ),
					$base_message,
					$mailto,
					$error_message
				);
			}
		}
		$result = trim( $result );
		$result = str_replace( '..', '.', $result );
		$result = str_replace( '.,', '.', $result );
		return $result;
	}


	/**
	 * Search for the API message error
	 */
	protected function _get_api_error_msg( $response ) {
		if ( isset( $response ) && false === is_wp_error( $response ) ) {
			$response_body = json_decode( $response['body'], true );
			if ( json_last_error() === JSON_ERROR_NONE &&
				isset( $response_body ) &&
				isset( $response_body['errors'] ) ) {
				$errors = $response_body['errors'];
				if ( false === is_array( $errors )) {
					$errors = array( $errors );
				}
				$messages = null;
				foreach ($errors as $key => $value) {
					if ( false === ai1ec_is_blank( $value ) ) {
						if ( is_array( $value ) ) {
							$value = implode ( ', ', $value );
						}
						$messages[] = $value;
					}
				}
				if ( null !== $messages && false === empty( $messages ) ) {
					return implode ( ', ', $messages);
				}
			}
		}
		return null;
	}

	/**
	 * Get the ticket calendar from settings, if the calendar does not exists in
	 * settings, then we will try to find on the API
	 * @return string JSON.
	 */
	protected function _get_ticket_calendar() {
		$ticketing_calendar_id = $this->_settings->get( 'ticketing_calendar_id' );
		if ( isset( $ticketing_calendar_id ) && $ticketing_calendar_id > 0) {
			return $ticketing_calendar_id;
		} else {
			//if the calendar is not saved on settings it should exists on API
			$ticketing_calendar_id = $this->_find_user_calendar();
			if ( $ticketing_calendar_id > 0 ) {
				$this->_settings->set( 'ticketing_calendar_id', $ticketing_calendar_id );
				return $ticketing_calendar_id;
			} else {
				//if the calendar should not exist on API, we will created
				$ticketing_calendar_id = $this->_create_calendar();
				if ( $ticketing_calendar_id > 0 ) {
					$this->_settings->set( 'ticketing_calendar_id', $ticketing_calendar_id );
				} else {
					return 0;
				}
			}
		}
	}

	/**
	 * Find the existent calendar when the user is signing in
	 */
	protected function _find_user_calendar() {
		$body = array(
			'title'    => get_bloginfo( 'name' )
		);
 		$request = array(
			'headers' => $this->_get_headers(),
			'body'    => json_encode( $body ),
			'timeout' => self::DEFAULT_TIMEOUT
		);
		$response      = wp_remote_get( AI1EC_API_URL . 'calendars', $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		$response_body = json_decode( $response['body'] );
		if ( 200 === $response_code ) {
			if ( is_array( $response_body ) ) {
				return $response_body[0]->id;
			} else {
				return $response_body->id;
			}
		} else {
			return 0;
		}
	}

	/**
	 * Create a calendar when the user is signup
	 */
	protected function _create_calendar() {
		$body = array(
			'title'    => get_bloginfo( 'name' ),
			'url'      => ai1ec_site_url(),
			'timezone' => $this->_settings->get( 'timezone_string' )
			);
 		$request = array(
			'headers' => $this->_get_headers(),
			'body'    => json_encode( $body ),
			'timeout' => self::DEFAULT_TIMEOUT
		);
		$response      = wp_remote_post( AI1EC_API_URL . 'calendars', $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		$response_body = json_decode( $response['body'] );
		if ( 200 === $response_code ) {
			return $response_body->id;
		} else {
			return 0;
		}
	}

    /**
     * Check if the current WP instance is signed into the API
     */
    public function is_signed() {
    	return true === $this->_settings->get( 'ticketing_enabled' );
    }

       /**
     * Get the last message return by Signup or Signup process
     */
    public function get_sign_message() {
    	return $this->_settings->get( 'ticketing_message' );
    }

	/**
     * Clear the last message return by Signup or Signup process
     */
    public function clear_sign_message() {
    	return $this->_settings->set( 'ticketing_message', '' );
    }

    protected function _save_settings( $message, $enabled, $token, $calendar_id ) {
		$this->_settings->set( 'ticketing_message'    , $message );
		$this->_settings->set( 'ticketing_enabled'    , $enabled );
		$this->_settings->set( 'ticketing_token'      , $token );
		$this->_settings->set( 'ticketing_calendar_id', $calendar_id );		
	}

}