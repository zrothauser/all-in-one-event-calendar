<?php

class BaseTestCase extends WP_UnitTestCase {

	public function setUp(){
		parent::setUp();		
		$user = wp_signon( [ 'user_login' => 'admin', 'user_password' => 'password'] );
		if ( ! $user instanceof WP_User ) {
			throw new Exception( 'Authentication error' );			
		}
	}

	public function tearDown(){
		parent::tearDown();		
	}

	protected function api_sign() {
		global $ai1ec_registry;
		$_POST['ai1ec_email']    = 'eli@time.ly';
		$_POST['ai1ec_password'] = '123456';
		$api                     = $ai1ec_registry->get( 'model.api.api-registration' );
		$this->assertTrue( $api->signin(), 'Authentication error. Check the user name and password to access the API' );
	}	

	protected function assertNotBlank( $value, $message = '' ) {
		if ( ai1ec_is_blank( $value ) ) {
			$this->fail( $message );
		}
	}
}

