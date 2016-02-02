<?php

/**
 * Class for Timely API communication for Registration.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.4
 * @package    Ai1EC
 * @subpackage Ai1EC.Model
 */
class Ai1ec_Api_Registration extends Ai1ec_Api_Abstract {

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
	 * @return object Response body in JSON.
	 */
	public function signin() {
		$body['email']    = $_POST['ai1ec_email'];
		$body['password'] = $_POST['ai1ec_password'];
		$request          = array(
			'headers' => $this->_get_headers( false ),
			'body'    => json_encode( $body ),
			'timeout' => parent::DEFAULT_TIMEOUT
		);
		$url              = AI1EC_API_URL . 'auth/authenticate';
		$response         = wp_remote_post( $url, $request );
		$response_code    = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			$response_body = json_decode( $response['body'], true );
			$this->_save_settings( $response_body['message'], true, $response_body['auth_token'], $this->_find_user_calendar() );
		} else {
			$error_message = $this->_transform_error_message( 
				__( 'We were unable to Sign you In for Time.ly Ticketing', AI1EC_PLUGIN_NAME ), 
				$response, 
				AI1EC_API_URL 
			);
			$this->_save_settings( $error_message, false, '', 0 );
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $error_message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
		}
	}

	/**
	 * @return object Response body in JSON.
	 */
	public function signup() {
		$body['name']                  = $_POST['ai1ec_name'];
		$body['email']                 = $_POST['ai1ec_email'];
		$body['password']              = $_POST['ai1ec_password'];
		$body['password_confirmation'] = $_POST['ai1ec_password_confirmation'];
		$body['phone']                 = $_POST['ai1ec_phone'];
		$body['terms']                 = $_POST['ai1ec_terms'];
		$request      = array(
			'headers' => $this->_get_headers( false ),
			'body'    => json_encode( $body ),
			'timeout' => parent::DEFAULT_TIMEOUT
		);
		$url           = AI1EC_API_URL . 'auth/register';
		$response      = wp_remote_post( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			$response_body = json_decode( $response['body'], true );
			$this->_save_settings( $response_body['Registration'], true, $response_body['auth_token'] , $this->_create_calendar() );
		} else {
			$error_message = $this->_transform_error_message( 
				__( 'We were unable to Sign you Up for Time.ly Ticketing', AI1EC_PLUGIN_NAME ), 
				$response, 
				AI1EC_API_URL 
			);
			$this->_save_settings( $error_message, false, '', 0 );
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $error_message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
		}
	}
 
 	/**
	 * Clean the ticketing settings on WP database only
	 */
	public function signout() {
		$this->_save_settings( '', false, '', 0 );
		return array( 'message' => '');
	}

}