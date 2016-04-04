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
		$response         = $this->request_api( 'POST', AI1EC_API_URL . 'auth/authenticate', json_encode( $body ), true, array( 'Authorization' => null ) );
		if ( $this->is_response_success( $response ) ) {
			$response_body = (array) $response->body;
			$this->save_ticketing_settings( $response_body['message'], true, $response_body['auth_token'], $this->_find_user_calendar(), $body['email'] );
			$this->has_payment_settings();
		} else {
			$error_message = $this->save_error_notification( $response, __( 'We were unable to Sign you In for Time.ly Ticketing', AI1EC_PLUGIN_NAME ) );
			$this->save_ticketing_settings( $error_message, false, '', 0, null );
		}
		return $response;
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
		$response                      = $this->request_api( 'POST', AI1EC_API_URL . 'auth/register', json_encode( $body ), true );
		if ( $this->is_response_success( $response ) ) {
			$response_body = (array) $response->body;
			$this->save_ticketing_settings( $response_body['Registration'], true, $response_body['auth_token'] , $this->_create_calendar(), $body['email'] );
		} else {
			$error_message = $this->save_error_notification( $response, __( 'We were unable to Sign you Up for Time.ly Ticketing', AI1EC_PLUGIN_NAME ) );
			$this->save_ticketing_settings( $error_message, false, '', 0, null );
		}
		return $response;
	}

	/**
	 * @return object Response body in JSON.
	 */
	protected function availability() {
		$response = $this->request_api( 'GET', AI1EC_API_URL . 'feature/availability', null, true );
		if ( $this->is_response_success( $response ) ) {
			return $response->body;
		} else {
			return null;
		}
	}

	protected function is_feature_available( $feature_code ) {
		$availability = $this->availability();
		if ( ! is_null( $availability ) ) {
			foreach ( $availability as $value) {
				if ( isset( $value->code ) && $feature_code === $value->code
					&& isset( $value->available ) && true === $value->available ) {
					return true;
				}
			}
		}
		return false;
	}

	public function is_ticket_available() {
		return $this->is_feature_available( 'ticketing' );
	}
 
 	/**
	 * Clean the ticketing settings on WP database only
	 */
	public function signout() {
		$this->clear_ticketing_settings();
		return array( 'message' => '');
	}

	/**
	 * @return object Response body from API.
	 */
	public function save_payment_preferences() {
		$calendar_id = $this->_get_ticket_calendar();
		if ( 0 >= $calendar_id ) {
			return false;
		}
		$settings  = array(
			'payment_method' => $_POST['ai1ec_payment_method'],
			'paypal_email'   => $_POST['ai1ec_paypal_email'],
			'first_name'     => $_POST['ai1ec_first_name'],
			'last_name'      => $_POST['ai1ec_last_name'],
			'currency'       => $_POST['ai1ec_currency']
		);
		$custom_headers['content-type'] = 'application/x-www-form-urlencoded';
		$response = $this->request_api( 'PUT', AI1EC_API_URL . 'calendars/' . $calendar_id . '/payment', 
			$settings, 
			true, //decode response body
			$custom_headers 
		);
		if ( $this->is_response_success( $response ) ) {
			$this->save_payment_settings( $settings );
			$notification  = $this->_registry->get( 'notification.admin' );
			$notification->store( 
				__( 'Payment preferences were saved.', AI1EC_PLUGIN_NAME ), 
				'updated', 
				0, 
				array( Ai1ec_Notification_Admin::RCPT_ADMIN ), 
				false 
			);
			return $response->body;
		} else {
			$this->save_error_notification( $response, 
				__( 'Payment preferences were not saved.', AI1EC_PLUGIN_NAME )
			);
			return false;
		}
	}

	public function _order_comparator( $order1, $order2 ) {
		return strcmp( $order1->created_at, $order2->created_at ) * -1;
	}

	/**
	 * @return object Response body in JSON.
	 */
	public function get_purchases() {
		$response = $this->request_api( 'GET', AI1EC_API_URL . 'calendars/' . $this->_get_ticket_calendar() . '/sales', 
			null, //body
			true //decode response body
			);
		if ( $this->is_response_success( $response ) ) {
			$result = $response->body;
			if ( isset( $result->orders ) ) {
				usort( $result->orders, array( "Ai1ec_Api_Registration", "_order_comparator" ) );
				return $result->orders;
			} else {
				return array();
			}
		} else {
			$this->save_error_notification( $response, 
				__( 'We were unable to get the Sales information from Time.ly Ticketing', AI1EC_PLUGIN_NAME )
			);
			return array();
		}
	}
}