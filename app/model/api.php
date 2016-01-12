<?php

/**
 * Class for Timely API communication.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.4
 * @package    Ai1EC
 * @subpackage Ai1EC.Model
 */
class Ai1ec_Api extends Ai1ec_App {

	const DEFAULT_TIMEOUT           = 30; //30 seconds (Wordpress default is 5)
	const EVENT_ID_METADATA         = '_ai1ec_api_event_id';
	const THUMBNAIL_ID_METADATA     = '_ai1ec_thumbnail_id';
	const ICS_CHECKOUT_URL_METADATA = '_ai1ec_ics_checkout_url';
	const ICS_API_URL_METADATA      = '_ai1ec_ics_api_url';
	const MAX_TICKET_TO_BUY_DEFAULT = 25;

	private $_get_ticket_types_error;
	private $_get_tickets_error;
	private $_sign_up_error;
	private $_sign_in_error;
	private $_update_event_error;
	private $_missing_tickets_error;
	private $_get_purchaes_error;

	private $_settings;

	/**
	 * Post construction routine.
	 *
	 * Override this method to perform post-construction tasks.
	 *
	 * @return void Return from this method is ignored.
	 */
	protected function _initialize() {
		$this->_settings                = $this->_registry->get( 'model.settings' );

		$this->_get_ticket_types_error  = __( 'We were unable to get the Tickets Details from Time.ly Ticketing'                   , AI1EC_PLUGIN_NAME );
		$this->_get_tickets_error       = __( 'We were unable to get the Tickets Attendees from Time.ly Ticketing'                 , AI1EC_PLUGIN_NAME );
		$this->_sign_up_error           = __( 'We were unable to Sign you Up for Time.ly Ticketing'                                , AI1EC_PLUGIN_NAME );
		$this->_sign_in_error           = __( 'We were unable to Sign you In for Time.ly Ticketing'                                , AI1EC_PLUGIN_NAME );
		$this->_create_event_error      = __( 'We were unable to create the Event on Time.ly Ticketing'                            , AI1EC_PLUGIN_NAME );
		$this->_update_event_error      = __( 'We were unable to update the Event on Time.ly Ticketing'                            , AI1EC_PLUGIN_NAME );
		$this->_missing_tickets_error   = __( 'The event has the option Tickets selected but any ticket was added.'                , AI1EC_PLUGIN_NAME );
		$this->_tickets_removed_error   = __( 'We were unable to remove the Tickets from Time.ly Ticketing'                        , AI1EC_PLUGIN_NAME );
		$this->_tickets_imported_error  = __( 'This Event was replicated from another site. Any changes on Tickets were discarded.', AI1EC_PLUGIN_NAME );
		$this->_save_pref_error         = __( 'Payment preferences were not saved.'                                                , AI1EC_PLUGIN_NAME );
		$this->_save_pref_success       = __( 'Payment preferences were saved.'                                                    , AI1EC_PLUGIN_NAME );
		$this->_event_not_found_error   = __( 'Event not found inside the database.'                                               , AI1EC_PLUGIN_NAME );
		$this->_get_purchases_error     = __( 'We were unable to get the Sales information from Time.ly Ticketing'                 , AI1EC_PLUGIN_NAME );
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

	private function _count_valid_tickets( $post_ticket_types ) {
		if (false === isset( $post_ticket_types ) || 0 === count( $post_ticket_types ) ) {
			return 0;
		} else {
			$count = 0;
			foreach ( $post_ticket_types as $ticket_type_ite ) {
				if ( !isset( $ticket_type_ite['remove'] ) ) {
					$count++;
				}
			}
			return $count;
		}
	}

	/**
	*  Create or update a Ticket Event on API server
	 * @return object Response body in JSON.
	 */
	public function store_event( Ai1ec_Event $event, WP_Post $post ) {
		
		if ( isset( $_POST['ai1ec_tickets_loading_error'] ) ) {
			//do not update tickets because is unsafe. There was a problem to load the tickets,
			//the customer received the same message when the event was loaded.
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $_POST['ai1ec_tickets_loading_error'], 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return null;
		}
		if ( $this->is_ticket_event_imported( $event->get( 'post_id' ) ) )  {
			//prevent changes on Ticket Events that were imported
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $this->_tickets_imported_error, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return null;
		} else if ( false === ai1ec_is_blank( $event->get( 'ical_feed_url' ) ) ) {
			//prevent ticket creating inside Regular Events that were imported
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $this->_tickets_imported_error, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return null;			
		}
		$api_event_id = get_post_meta(
					$event->get( 'post_id' ),
					self::EVENT_ID_METADATA,
					true
				);
		$is_new       = ! $api_event_id;
		if ( 0 === $this->_count_valid_tickets( $_POST['ai1ec_tickets'] ) ) {
			$message      = $this->_missing_tickets_error;
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return null;
		}
		$headers   = $this->_get_headers();
		$fields    = array( 'visibility' => $_POST['visibility'] );
		$body_data = $this->_parse_event_fields_to_api_structure(
			$event,
			$post,
			$_POST['ai1ec_tickets'],
			$fields
		);
		$url       = AI1EC_API_URL . 'events';
		if ( $api_event_id ) {
			$url    = $url . '/' . $api_event_id;
		}

		//get the thumbnail id saved previously
		$event_thumbnail_id = get_post_meta( $event->get( 'post_id' ), self::THUMBNAIL_ID_METADATA, true );
		if ( false === isset( $event_thumbnail_id ) ) {
			$event_thumbnail_id = 0;
		}
		//get the current thumbnail id
		$post_thumbnail_id  = get_post_thumbnail_id( $event->get( 'post_id' ) );
		if ( false === isset( $post_thumbnail_id ) ) {
			$post_thumbnail_id = 0;
		}
		$update_image = ( $event_thumbnail_id !== $post_thumbnail_id );
		$payload = '';
		if ( true === $update_image && 0 < $post_thumbnail_id ) {
			$boundary                  = wp_generate_password( 24 );
			$headers['content-type']   = 'multipart/form-data; boundary=' . $boundary;
			$body_data['update_image'] = '1';
			foreach ($body_data as $key => $value) {
	            if ( is_array( $value ) ) {
	            	$index = 0;
	            	foreach ( $value as $ticket_type_ite ) {
		            	foreach ( $ticket_type_ite as $child_key => $child_value ) {
	            			$payload .= '--' . $boundary;
	 						$payload .= "\r\n";
			            	$payload .= 'Content-Disposition: form-data; name="' . $key . '[' . $index . '][' . $child_key . ']"' . "\r\n";
		   		            $payload .= "\r\n";
				            $payload .= $child_value;
				            $payload .= "\r\n";
				        }
				        $index++;
				    }
	            } else {
	            	$payload .= '--' . $boundary;
	 				$payload .= "\r\n";
	            	$payload .= 'Content-Disposition: form-data; name="' . $key . '"' . "\r\n";
   		            $payload .= "\r\n";
		            $payload .= $value;
		            $payload .= "\r\n";
	            }
			}
			$file_path = get_attached_file ( $post_thumbnail_id );
			$file_type = wp_check_filetype ( $file_path );
			$payload  .= '--' . $boundary;
			$payload  .= "\r\n";
			$payload  .= 'Content-Disposition: form-data; name="image_id"; filename="' . basename( $file_path ) . '"' . "\r\n";
			$payload  .= 'Content-Type: ' . $file_type['type'] . "\r\n";
			$payload  .= "\r\n";
			$payload  .= file_get_contents( $file_path );
			$payload  .= "\r\n";
			$payload  .= '--' . $boundary . '--';
		} else {
			$body_data['update_image'] = (true === $update_image) ? '1' : '0';
		 	$payload                   = json_encode( $body_data );
		}
		$request   = array(
			'method'  => 'POST',
			'headers' => $headers,
			'body'    => $payload,
			'timeout' => self::DEFAULT_TIMEOUT
		);
		$response      = wp_remote_request( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			$response_json = json_decode( $response['body'] );
			if ( $is_new && isset( $response_json->id ) ) {
				update_post_meta( $event->get( 'post_id' ), self::EVENT_ID_METADATA, $response_json->id );
			}
			if ( $post_thumbnail_id > 0 ) {
				update_post_meta( $event->get( 'post_id' ), self::THUMBNAIL_ID_METADATA, $post_thumbnail_id );
			} else {
				delete_post_meta( $event->get( 'post_id' ), self::THUMBNAIL_ID_METADATA );
			}
			return true;
		} else {
			$error_message = '';
			if ( $is_new ) {
				$error_message = $this->_transform_error_message( $this->_create_event_error, $response, $url, false );
			} else {
				$error_message = $this->_transform_error_message( $this->_update_event_error, $response, $url, false );
			}
			$notification  = $this->_registry->get( 'notification.admin' );
			$notification->store( $error_message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return false;
		}
	}

	/**
	 * @return object Response body from API.
	 */
	public function save_payment_preferences() {
		$calendar_id = $this->_get_ticket_calendar();
		if ( 0 >= $calendar_id ) {
			return null;
		}
		$url       = AI1EC_API_URL . 'calendars/' . $calendar_id . '/payment' ;
		$settings  = array(
			'payment_method' => $_POST['ai1ec_payment_method'],
			'paypal_email'   => $_POST['ai1ec_paypal_email'],
			'first_name'     => $_POST['ai1ec_first_name'],
			'last_name'      => $_POST['ai1ec_last_name'],
			'street'         => $_POST['ai1ec_street'],
			'city'           => $_POST['ai1ec_city'],
			'state'          => $_POST['ai1ec_state'],
			'country'        => $_POST['ai1ec_country'],
			'postcode'       => $_POST['ai1ec_postcode']
		);
		$headers   = $this->_get_headers();
		$headers['content-type'] = 'application/x-www-form-urlencoded';
		$request   = array(
			'method'  => 'PUT',
			'headers' => $headers,
			'body'    => $settings,
			'timeout' => self::DEFAULT_TIMEOUT
		);
		$response      = wp_remote_request( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		$notification  = $this->_registry->get('notification.admin');
		if ( 200 !== $response_code ) {
			$error_message = $this->_transform_error_message( $this->_save_pref_error, $response, AI1EC_API_URL );
			$notification->store( $error_message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return false;
		}else{
			$notification->store( $this->_save_pref_success, 'updated', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
		}
		$response_json = json_decode( $response['body'] );
		return $response_json;
	}

	/**
	 * @return object Response from API, or empty defaults
	 */
	public function get_payment_preferences() {
		$calendar_id = $this->_get_ticket_calendar();
		$settings    = null;
		if( ! empty( $calendar_id ) ) {
			$request       = array(
						'method'  => 'GET',
						'headers' => $this->_get_headers(),
						'timeout' => self::DEFAULT_TIMEOUT
				        );
			$response      = wp_remote_request( AI1EC_API_URL."calendars/$calendar_id/payment", $request );
			$response_code = wp_remote_retrieve_response_code( $response );
			if ( 200 === $response_code ) {				
				$settings      = json_decode( $response['body'] );			
			}
		}

		if ( is_null( $settings ) ) {
			return (object) array('payment_method'=>'cheque', 'paypal_email'=> '', 'first_name'=>'',  'last_name'=>'', 'street'=> '', 'city'=> '', 'state'=> '', 'postcode'=> '', 'country'=> '');
		} else {
			return $settings;	
		}		
	}

	/**
	 * Parse the fields of an Event to the structure used by API
	 */
	protected function _parse_event_fields_to_api_structure( Ai1ec_Event $event , WP_Post $post, $post_ticket_types, $api_fields_values  ) {

		$calendar_id = $this->_get_ticket_calendar();
		if ( $calendar_id <= 0 ) {
			return null;
		}

		//fields of ai1ec events table used by API
		$body['latitude']         = $event->get( 'latitude' );
		$body['longitude']        = $event->get( 'longitude' );
		$body['post_id']          = $event->get( 'post_id' );
		$body['calendar_id']      = $calendar_id;
		$body['dtstart']          = $event->get( 'start' )->format_to_javascript();
		$body['dtend']            = $event->get( 'end' )->format_to_javascript();
		$body['timezone']         = $event->get( 'timezone_name' );
		$body['venue_name']       = $event->get( 'venue' );
		$body['address']          = $event->get( 'address' );
		$body['city']             = $event->get( 'city' );
		$body['province']         = $event->get( 'province' );
		$body['postal_code']      = $event->get( 'postal_code' );
		$body['country']          = $event->get( 'country' );
		$body['contact_name']     = $event->get( 'contact_name' );
		$body['contact_phone']    = $event->get( 'contact_phone' );
		$body['contact_email']    = $event->get( 'contact_email' );
		$body['contact_website']  = $event->get( 'contact_url' );
		$body['uid']              = $event->get( 'ical_uid' );
		$body['title']            = $post->post_title;
		$body['description']      = $post->post_content;
		$body['url']              = get_permalink( $post->ID );
		$body['status']           = $post->post_status;
		$body['tax_rate']         = 0;

		$utc_current_time         = $this->_registry->get( 'date.time')->format_to_javascript();
		$body['created_at']       = $utc_current_time;
		$body['updated_at']       = $utc_current_time;		

		//removing blank values
		foreach ($body as $key => $value) {
			if ( ai1ec_is_blank( $value ) )	{
				unset( $body[ $key ] );
			}
		}

		if ( null !== $api_fields_values && is_array( $api_fields_values )) {
			foreach ($api_fields_values as $key => $value) {
				$body[$key] = $api_fields_values[$key];
				if ( 'visibility' === $key ) {
					if ( 0 === strcasecmp( 'private', $value ) ) {
						$body['status'] = 'private';
					} else if ( 0 === strcasecmp( 'password', $value ) ) {
						$body['status'] = 'password';
					}
				}
			}
		}

		$tickets_types = array();
		if ( isset( $post_ticket_types )) {
			$index         = 0;
			foreach ( $post_ticket_types as $ticket_type_ite ) {
				$tickets_types[$index++] = $this->_parse_tickets_type_post_to_api_structure(
					$ticket_type_ite,
					$event
				);
			}
		}
		$body['ticket_types'] = $tickets_types;

        return $body;
	}

	/**
	 * Parse the fields of a Ticket Type to the structure used by API
	 */
	protected function _parse_tickets_type_post_to_api_structure( $ticket_type_ite, $event ) {
		$utc_current_time = $this->_registry->get( 'date.time' )->format_to_javascript();
		if ( isset( $ticket_type_ite['id'] ) ) {
			$ticket_type['id']          = $ticket_type_ite['id'];
			$ticket_type['created_at'] 	= $ticket_type_ite['created_at'];
		} else {
			$ticket_type['created_at'] 	= $utc_current_time;
		}
		if ( isset( $ticket_type_ite['remove'] ) ) {
			$ticket_type['deleted_at'] 	= $utc_current_time;
		}
		$ticket_type['name']        = $ticket_type_ite['ticket_name'];
		$ticket_type['description'] = $ticket_type_ite['description'];
		$ticket_type['price']       = $ticket_type_ite['ticket_price'];
		if ( 0 === strcasecmp( 'on',  $ticket_type_ite['unlimited'] ) ) {
			$ticket_type['quantity'] = null;
		} else {
			$ticket_type['quantity'] = $ticket_type_ite['quantity'];			
		}
		$ticket_type['buy_min_qty']   = $ticket_type_ite['buy_min_limit'];
		if ( ai1ec_is_blank( $ticket_type_ite['buy_max_limit'] ) ) {
			$ticket_type['buy_max_qty'] = null;
		} else {
			$ticket_type['buy_max_qty'] = $ticket_type_ite['buy_max_limit'];
		}		
		if ( 0 === strcasecmp( 'on',  $ticket_type_ite['availibility'] ) ) {
			//immediate availability
			$timezone_start_time            = $this->_registry->get( 'date.time' );
			$timezone_start_time->set_timezone( $event->get('timezone_name') );						
			$ticket_type['sale_start_date'] = $timezone_start_time->format_to_javascript( $event->get('timezone_name') );
			$ticket_type['sale_end_date']   = $event->get( 'end' )->format_to_javascript();
		} else {
			$ticket_type['sale_start_date'] =  $ticket_type_ite['ticket_sale_start_date'];
			$ticket_type['sale_end_date']   =  $ticket_type_ite['ticket_sale_end_date'];
		}
		$ticket_type['updated_at'] = $utc_current_time;
		$ticket_type['status']     = $ticket_type_ite['ticket_status'];
		return $ticket_type;
	}

	/**
	 * Unparse the fields of API structure to the Ticket Type
	 */
	protected function _unparse_tickets_type_from_api_structure( $ticket_type_api ) {
		$ticket_type                         = $ticket_type_api;
		$ticket_type->ticket_name            = $ticket_type_api->name;
		$ticket_type->ticket_price           = $ticket_type_api->price;
		$ticket_type->buy_min_limit          = $ticket_type_api->buy_min_qty;
		if ( null === $ticket_type_api->buy_max_qty ) {
			$ticket_type->buy_max_limit = self::MAX_TICKET_TO_BUY_DEFAULT;
		} else {
			$ticket_type->buy_max_limit = $ticket_type_api->buy_max_qty;
		}		
		$ticket_type->ticket_sale_start_date = $ticket_type_api->sale_start_date; //YYYY-MM-YY HH:NN:SS
		$ticket_type->ticket_sale_end_date   = $ticket_type_api->sale_end_date; //YYYY-MM-YY HH:NN:SS
		$ticket_type->ticket_status 	     = $ticket_type_api->status;
		if ( false === isset( $ticket_type_api->quantity ) ||
			null === $ticket_type_api->quantity ) {
		 	$ticket_type->unlimited          = 'on';
		} else {		
 			$ticket_type->unlimited          = 'off';
		}
		$ticket_type->ticket_type_id = $ticket_type_api->id;
		$ticket_type->available      = $ticket_type_api->available;
		$ticket_type->availability   = $this->_parse_availability_message( $ticket_type_api->availability );

		//derived property to set the max quantity of dropdown
		if ( $ticket_type->available !== null ) {			
			if ( $ticket_type->available > $ticket_type->buy_max_limit ) {
				$ticket_type->buy_max_available = $ticket_type->buy_max_limit;
			} else {
				$ticket_type->buy_max_available = $ticket_type->available;
			}
		} else {
			$ticket_type->buy_max_available = $ticket_type->buy_max_limit;
		}					
		return $ticket_type;
	}

	public function _parse_availability_message( $availability ){
		if ( ai1ec_is_blank ( $availability ) ) {
			return null;
		} else {
			switch ($availability) {
				case 'past_event':
					return __( 'Past Event' );
				case 'event_closed':
					return __( 'Event closed' );		
				case 'not_available_yet':
					return __( 'Not available yet' );					
				case 'sale_closed':
					return __( 'Sale closed' );
				case 'sold_out':
					return __( 'Sold out' );														
				default:
					return __( 'Not available' );
			}
		}
    }


	/**
	 * @return string JSON.
	 */
	public function get_ticket_types( $post_id ) {
		$api_event_id = get_post_meta(
			$post_id,
			Ai1ec_Api::EVENT_ID_METADATA,
			true
		);
		if ( ! $api_event_id ) {
			return json_encode( array( 'data' => array() ) );
		}
		$request = array(
			'headers' => $this->_get_headers(),
			'timeout' => self::DEFAULT_TIMEOUT
			);
		$url           = $this->get_api_url( $post_id ) . 'events/' . $api_event_id . '/ticket_types';
		$response      = wp_remote_get( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			$result = json_decode( $response['body'] );
			if ( isset( $result->ticket_types ) ) {
		 		foreach ( $result->ticket_types as $ticket_api ) {
		 			$this->_unparse_tickets_type_from_api_structure( $ticket_api );
				}
				return json_encode( array( 'data' => $result->ticket_types ) );
			} else {
				return json_encode( array( 'data' => array() ) );
			}
		} else {
			$error_message = $this->_transform_error_message( $this->_get_ticket_types_error, $response, $url, true );
			return json_encode( array( 'data' => array(), 'error' => $error_message ) );
		}
	}

	/**
	 * @return object Response body in JSON.
	 */
	public function get_tickets( $post_id ) {
		$api_event_id = get_post_meta(
			$post_id,
			Ai1ec_Api::EVENT_ID_METADATA,
			true
		);
		if ( ! $api_event_id ) {
			return json_encode( array( 'data' => array() ) );
		}
		$request  = array(
			'headers' => $this->_get_headers(),
			'timeout' => self::DEFAULT_TIMEOUT
			);
		$url           = $this->get_api_url( $post_id ) . 'events/' . $api_event_id . '/tickets';
		$response      = wp_remote_get( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			return $response['body'];
		} else {
			$error_message = $this->_transform_error_message( $this->_get_tickets_error, $response, $url, true );
			return json_encode( array( 'data' => array(), 'error' => $error_message ) );
		}
	}
	
	public function _order_comparator( $order1, $order2 ) {
		return strcmp( $order1->created_at, $order2->created_at ) * -1;
	}

	/**
	 * @return object Response body in JSON.
	 */
	public function get_purchases() {
		$request  = array(
			'headers' => $this->_get_headers(),
			'timeout' => self::DEFAULT_TIMEOUT
			);
		$url           = AI1EC_API_URL . 'calendars/' . $this->_get_ticket_calendar() . '/sales';
		$response      = wp_remote_get( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			$result = json_decode( $response['body'] );
			if ( isset( $result->orders ) ) {
				usort( $result->orders, array( "Ai1ec_Api", "_order_comparator" ) );
				return $result->orders;
			} else {
				return array();
			}
		} else {
			$error_message = $this->_transform_error_message( $this->_get_purchases_error, $response, $url, true );
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $error_message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return array();
		}
	}

	public function is_ticket_event_imported( $post_id ) {
		//if the event is imported, the ICS added the api url on metadata information
		$api_url = get_post_meta(
					$post_id,
					Ai1ec_Api::ICS_API_URL_METADATA,
					true
				);
		return (false === ai1ec_is_blank ( $api_url ));
	}

	protected function get_api_url ( $post_id ) {
		//if the event is imported, the ICS added the api url on metadata informatino
		$api_url = get_post_meta(
					$post_id,
					Ai1ec_Api::ICS_API_URL_METADATA,
					true
				);
		if ( ai1ec_is_blank ( $api_url ) ) {
			return AI1EC_API_URL;
		} else {
			return $api_url;
		}
	}

	/**
	 * Clean the ticketing settings on WP database only
	 */
	public function signout() {
		$this->_save_settings( '', false, '', 0 );
		return array( 'message' => '');
	}

	private function _save_settings( $message, $enabled, $token, $calendar_id ) {
		$this->_settings->set( 'ticketing_message'    , $message );
		$this->_settings->set( 'ticketing_enabled'    , $enabled );
		$this->_settings->set( 'ticketing_token'      , $token );
		$this->_settings->set( 'ticketing_calendar_id', $calendar_id );		
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
			'timeout' => self::DEFAULT_TIMEOUT
		);
		$url              = AI1EC_API_URL . 'auth/authenticate';
		$response         = wp_remote_post( $url, $request );
		$response_code    = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			$response_body = json_decode( $response['body'], true );
			$this->_save_settings( $response_body['message'], true, $response_body['auth_token'], $this->_find_user_calendar() );
		} else {
			$error_message = $this->_transform_error_message( $this->_sign_in_error, $response, AI1EC_API_URL );
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
			'timeout' => self::DEFAULT_TIMEOUT
		);
		$url           = AI1EC_API_URL . 'auth/register';
		$response      = wp_remote_post( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			$response_body = json_decode( $response['body'], true );
			$this->_save_settings( $response_body['Registration'], true, $response_body['auth_token'] , $this->_create_calendar() );
		} else {
			$error_message = $this->_transform_error_message( $this->_sign_up_error, $response, AI1EC_API_URL );
			$this->_save_settings( $error_message, false, '', 0 );
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $error_message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
		}
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
     * Check if the response that came from the API is the event not found
     */
    private function _is_event_notfound_error( $response_code, $response ) {
    	if ( 404 === $response_code ) {
			if ( isset( $response['body'] ) ) {
				$response_body = json_decode( $response['body'], true );
				if ( json_last_error() === JSON_ERROR_NONE &&
					$response_body &&
					isset( $response_body['message'] ) ) {
					if ( false !== stripos( $response_body['message'], 'event not found') ) {
						return true;
					}
				}
			}
		}
		return false;
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
	 * @return NULL in case of success or an error string in case of error
	 */
    public function update_api_event_fields( WP_Post $post, $api_fields_values ) {
    	$post_id      = $post->ID;
   		$api_event_id = get_post_meta(
			$post_id,
			self::EVENT_ID_METADATA,
			true
		);
		if ( ! $api_event_id ) {
			return null;
		}
		if ( $this->is_ticket_event_imported( $post_id ) )  {
			return null;
		}
		//updating the event status
		try {
			$event =  $this->_registry->get(
				'model.event',
				$post_id ? $post_id : null
			);
		} catch ( Ai1ec_Event_Not_Found_Exception $excpt ) {
			$message      = $this->_event_not_found_error;
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return $message;
		}
		$headers   = $this->_get_headers();
		$body_data = $this->_parse_event_fields_to_api_structure(
			$event,
			$post,
			null, //does not update ticket types, just chaging the api fields specified
			$api_fields_values
		);
		$url       = AI1EC_API_URL . 'events' . '/' . $api_event_id;
		$request   = array(
			'method'  => 'POST',
			'headers' => $headers,
			'body'    => json_encode( $body_data ),
			'timeout' => self::DEFAULT_TIMEOUT
		);
		$response      = wp_remote_request( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 !== $response_code ) {
			if ( $this->_is_event_notfound_error( $response_code, $response ) ) {
				if ( isset( $api_fields_values['status'] ) &&
					'trash' === $api_fields_values['status'] ) {
					//this is an exception, the event was deleted on API server, but for some reason
					//the metada EVENT_ID_METADATA was not unset, in this case leave the event be
					//move to trash
					return null;
				}
			}
			$message      = $this->_transform_error_message( $this->_update_event_error, $response, $url, true );
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return $message;
        } else {
        	return null;
        }
    }

    /**
     * Deletes the API event
     * @return NULL in case of success or an error string in case of error
     */
    public function delete_api_event( $post_id ) {
    	if ( $this->is_ticket_event_imported( $post_id ) )  {
    		$this->clear_event_metadata( $post_id );
    		return null;
    	}
    	$api_event_id = get_post_meta(
			$post_id,
			self::EVENT_ID_METADATA,
			true
		);
		if ( ! $api_event_id ) {
			return null;
		}
		$request   = array(
			'method'  => 'DELETE',
			'headers' => $this->_get_headers(),
			'timeout' => self::DEFAULT_TIMEOUT
		);
		$url           = AI1EC_API_URL . 'events/' . $api_event_id;
		$response      = wp_remote_request( $url, $request );
		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 === $response_code ) {
			$this->clear_event_metadata( $post_id );
			return null;
        } else {
			if ( $this->_is_event_notfound_error( $response_code, $response ) ) {
				//this is an exception, the event was deleted on API server, but for some reason
				//the metada EVENT_ID_METADATA was not unset, in this case leave the event be
				//move to trash
				return null;
			}
        	$message      = $this->_transform_error_message( $this->_tickets_removed_error, $response, $url, true );
			$notification = $this->_registry->get( 'notification.admin' );
			$notification->store( $message, 'error', 0, array( Ai1ec_Notification_Admin::RCPT_ADMIN ), false );
			return $message;
        }
    }

    /**
     * Clear the event metadata used by Event from the post id
     */
    public function clear_event_metadata( $post_id ) {
		delete_post_meta( $post_id, self::EVENT_ID_METADATA );
		delete_post_meta( $post_id, self::THUMBNAIL_ID_METADATA );
		delete_post_meta( $post_id, self::ICS_CHECKOUT_URL_METADATA );
		delete_post_meta( $post_id, self::ICS_API_URL_METADATA );
    }

    public function create_checkout_url( $api_event_id , $url_checkout = AI1EC_TICKETS_CHECKOUT_URL) {
    	return str_replace( '{event_id}', $api_event_id, $url_checkout );
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
}