<?php

class TestApiRegistration extends BaseTestCase {

 	/**
	 * @group api-registration
	 * @group api-registration-sign-up
	 */
	function testSignup() {	
		global $ai1ec_registry;

		//sign wordpress
		$this->wp_sign();
		
		$data['ai1ec_name']                  = 'Eli';
		$data['ai1ec_email']                 = 'phpunit@time.ly';
		$data['ai1ec_password']              = '123456';
		$data['ai1ec_password_confirmation'] = '123456';
		$data['ai1ec_phone']                 = '0000000';
		$data['ai1ec_terms']                 = 1;
		
		$this->create_post_request( $data );

		$api           = $ai1ec_registry->get( 'model.api.api-registration' );
		$response      = $api->signup();		
		$this->assertNotNull( $response );
		$this->assertTrue( isset ( $response->raw ) );
		$response_code = wp_remote_retrieve_response_code( $response->raw );
		$this->assertEquals( $response_code, 400 );
		$message = $api->get_api_error_msg( $response->raw );
		$this->assertEquals( "The email has already been taken.", $message );

		//Signin Failed. Please verify your account information and try again.
	}

	/**
	 * @group api-registration
	 * @group api-registration-sign-in
	 */
	function testSignin() {	
		global $ai1ec_registry;

		//sign wordpress
		$this->wp_sign();

		$data['ai1ec_email']	= 'not_existent_user@time.ly';
		$data['ai1ec_password'] = 'anyone';

		$this->create_post_request( $data );

		$api           = $ai1ec_registry->get( 'model.api.api-registration' );
		$response      = $api->signin();		
		$this->assertNotNull( $response );
		$this->assertTrue( isset ( $response->raw ) );
		$response_code = wp_remote_retrieve_response_code( $response->raw );
		$this->assertEquals( $response_code, 400 );
		$message       = $api->get_api_error_msg( $response->raw );
		$this->assertEquals( "Signin Failed. Please verify your account information and try again.", $message );
	}

/**
	 * @group api-registration
	 * @group api-registration-availability
	 */
	function testAvailability() {	
		global $ai1ec_registry;
		$api                = $ai1ec_registry->get( 'model.api.api-registration' );
		$response           = $api->availability();		
		$this->assertNotNull( $response, "response should not be null" );
		echo print_r( $response, true );
		$this->assertTrue( is_array( $response ), "response must be an array" );
		$has_ticketing_code = false;
		foreach ( $response as $value) {
			$this->assertTrue( isset( $value->code ), "code attribute not defined" );
			$this->assertTrue( isset( $value->available ), "available attribute not defined" );
			if ( false === $value->available ) {
				$this->assertTrue( isset( $value->not_available_reason ), "not_available_reason should be defined if code is not available" );
			}
			if ( 'ticketing' === $value->code ) {
				$has_ticketing_code = true;
			}
		}
		$this->assertTrue( $has_ticketing_code, "feature ticketing not defined" );
	}
}

