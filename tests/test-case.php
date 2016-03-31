<?php

class BaseTestCase extends WP_UnitTestCase {
	
	public function setUp(){
		parent::setUp();		
	}

	public function tearDown(){
		parent::tearDown();				
	}

	/**
	 * Sign in into the Wordpress
	 */
	protected function wp_sign() {		
		$current_user = wp_get_current_user();
		if ( $current_user->ID == 0 ) {
			$user = wp_signon( [ 'user_login' => 'admin', 'user_password' => 'password'] );
			if ( ! $user instanceof WP_User ) {
				throw new Exception( 'Authentication error' );			
			}
			wp_set_current_user( $user->ID );							
		} 
	}

	/**
	 * Sign in to Timely Network
	 */
	protected function api_sign() {
		global $ai1ec_registry;
		$_POST['ai1ec_email']    = 'phpunit@time.ly';
		$_POST['ai1ec_password'] = '123456';
		$api                     = $ai1ec_registry->get( 'model.api.api-registration' );
		if ( false === $api->is_signed() ) {
			$response = $api->signin();
			$this->assertTrue( $api->is_response_success( $response ), 'Authentication error. Check the user name and password to access the API' );
			$this->assertTrue( $api->save_payment_settings( array( 'payment_method' => 'paypal', 'paypal_email' => 'phpunit@time.ly', 'first_name' => 'Test', 'last_name' => 'Test', 'currency' => 'CAD' ) ), "Error saving the payments settings for test" );
			$this->assertTrue( $api->has_payment_settings() );
		}
	}	

	/**
	 * Create the _POST variable used internaly by a lot of methods
	 */
	protected function create_post_request( $data ) {
		$_SERVER['REQUEST_METHOD']   = 'POST';
		$_REQUEST = $_POST = $GLOBALS['_POST'] = $data;
	}

	/**
	 * Create the _POST variable used internaly by a lot of methods
	 */
	protected function create_get_request( $data ) {
		$_SERVER['REQUEST_METHOD']   = 'GET';
		$_REQUEST = $_POST = $GLOBALS['_GET'] = $data;
	}

	/**
	 * Assert if a value is not blank
	 */
	protected function assertNotBlank( $value, $message = '' ) {
		if ( ai1ec_is_blank( $value ) ) {
			$this->fail( $message );
		}
	}

	/**
	 * Assert if the array is not empty
	 */
	protected function assertArrayNotEmpty( $value, $message = '' ) {
		if ( is_null( $value ) || 
			! is_array( $value ) || 
			0 === count( $value ) ) {
			$this->fail( $message );
		}
	}

	/**
	 * Assert the size of the array has the size expected
	 */
	protected function assertArrayCount( $value, $expected, $message = '' ) {
		if ( is_null( $value ) || 
			! is_array( $value ) || 
			$expected !== count( $value ) ) {
			$this->fail( $message );
		}
	}

}

