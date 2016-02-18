<?php

class TestApiRegistration extends BaseTestCase {

 	/**
	 * @group api-ticketing
	 * @group api-ticketing-sign-up
	 */
	function testSignup() {	
		global $ai1ec_registry;

		//sign wordpress
		$this->wp_sign();
		
		$data['ai1ec_name']			   	     = 'Eli';
		$data['ai1ec_email']				 = 'phpunit@time.ly';
		$data['ai1ec_password']              = '123456';
		$data['ai1ec_password_confirmation'] = '123456';
		$data['ai1ec_phone']				 = '0000000';
		$data['ai1ec_terms']				 = 1;
		
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
	 * @group api-ticketing
	 * @group api-ticketing-sign-in
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
		$message = $api->get_api_error_msg( $response->raw );
		$this->assertEquals( "Signin Failed. Please verify your account information and try again.", $message );
	}

 	/**
	 * @group api-ticketing
	 * @group api-ticketing-payment-settings
	 */
	function testSavePaymentSettings() {	
		global $ai1ec_registry;

		//sign wordpress
		$this->wp_sign();
		
		//sign in into the api
		$this->api_sign();	

		$data['ai1ec_payment_method'] = 'cheque';
		$data['ai1ec_paypal_email']   = '';
		$data['ai1ec_first_name']     = '';
		$data['ai1ec_last_name']      = '';
		$data['ai1ec_street']         = 'Stars street ' . rand();
		$data['ai1ec_city']           = 'Vancouver ' . rand();
		$data['ai1ec_state']          = 'BC';
		$data['ai1ec_country']        = 'Canada';
		$data['ai1ec_postcode']       = '00000';

		$this->create_post_request( $data );

		$api = $ai1ec_registry->get( 'model.api.api-ticketing' );
		$response = $api->save_payment_preferences();
		$this->assertNotFalse( $response );

		$response = (array) $api->get_payment_preferences();
		$this->assertEquals( $data['ai1ec_payment_method'], $response['payment_method'] );
		$this->assertEquals( $data['ai1ec_street'], $response['street'] );
		$this->assertEquals( $data['ai1ec_city'], $response['city'] );
	}

	/**
	 * @group api-ticketing
	 * @group api-ticketing-crud
	 */
	function testCRUDTicketEvent() {		
		global $ai1ec_registry;

		//sign wordpress
		$this->wp_sign();
		
		//sign in into the api
		$this->api_sign();	

		//preparing the data that will be used to POST request
		$nonce                       = wp_create_nonce( 'ai1ec' );
		$ticket_type_1               = array( 
			'ticket_name'   => 'Special Ticket' ,
			'description'   => 'Special Ticket' ,
			'ticket_price'  => 9.99,
			'unlimited'     => 'on',
			'buy_min_limit' => 1,
			'buy_max_limit' => 25,
			'availibility'  => 'on',
			'ticket_status' => 'open'
 		);

		$data[AI1EC_POST_TYPE]       = $nonce;
		$data['action']              = 'editpost';
		$data['ai1ec_cost_type']     = 'tickets';
		$data['ai1ec_contact_name']  = 'Eli';
		$data['ai1ec_contact_phone'] = '+5541000000';
		$data['ai1ec_contact_email'] = 'eli@time.ly';
		$data['ai1ec_start_time']    = '2026-02-16 19:33:33';
		$data['ai1ec_end_time']      = '2026-02-20 19:33:33';
		$data['ai1ec_venue']         = 'Vancouver';
		$data['visibility']          = 'public';
		$data['ai1ec_tickets']       = array(
			$ticket_type_1 
		);
	
		$this->create_post_request( $data );

		try {
			//Creating the POST of AI1EC type
			//This post with the data above data array will trigger the store_event
			//method from API to save the tickets on Timely Network
			$post_id  = $this->factory->post->create( [ 'post_type' => AI1EC_POST_TYPE ] );
			if ( isset( $_POST['_ticket_store_event_error'] ) ) {
				$this->assertFalse( true, $_POST['_ticket_store_event_error'] );
			}		

			//Retrieving the Tickets Types saved
			$api      = $ai1ec_registry->get( 'model.api.api-ticketing' );
			$tickets  = json_decode( $api->get_ticket_types( $post_id ) );
			$this->assertNotNull( $tickets );
			if ( isset( $tickets->data ) ) {
				$this->assertArrayNotEmpty( $tickets->data );
				$this->assertArrayCount( $tickets->data, 1 );
			} else {
				$this->assertFalse( true, 'Tickets Types not saved' );
			}

			//Changing the POST request to add a new ticket, remove the old one				
			//and test the update inside the API
			$ticket_type_1['id']         = $tickets->data[0]->id;        
			$ticket_type_1['created_at'] = $tickets->data[0]->created_at;        
			$ticket_type_1['remove'] = true;

			//updating the event to add a new ticket and remove the old one
			$ticket_type_2 = array( 
				'ticket_name'   => 'Special Ticket 2' ,
				'description'   => '' ,
				'ticket_price'  => 1.99,
				'unlimited'     => 'on',
				'buy_min_limit' => 1,
				'buy_max_limit' => 25,
				'availibility'  => 'on',
				'ticket_status' => 'open'
	 		);
	 		$data['ai1ec_tickets'] = array( $ticket_type_1, $ticket_type_2 );
			
			$this->create_post_request( $data );

			$post     = get_post( $post_id );
			$this->assertNotNull( $post );
			$result                = wp_update_post( $post, true );
			$this->assertFalse( is_wp_error( $post ) );

			//Retrieve the Tickets Types again to check
			$tickets  = json_decode( $api->get_ticket_types( $post_id ) );
			$this->assertNotNull( $tickets );
			if ( isset( $tickets->data ) ) {
				$this->assertArrayNotEmpty( $tickets->data );
				$this->assertArrayCount( $tickets->data, 1 );
			} else {
				$this->assertFalse( true, 'Tickets Types not returned' );
			}
		} finally {
			//Finishing.... deleting the post and consequently the ticket event saved
			$result = wp_delete_post( $post_id, true );
			$this->assertTrue ( false !== $result );
		}
 	}

}

