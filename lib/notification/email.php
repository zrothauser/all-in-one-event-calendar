<?php

/**
 * Concrete implementation for email notifications.
 *
 * @author       Time.ly Network Inc.
 * @since        2.0
 * @instantiator new
 * @package      AI1EC
 * @subpackage   AI1EC.Notification
 */
class Ai1ec_Email_Notification extends Ai1ec_Notification {

	/**
	 * @var string
	 */
	private $_subject;

	/**
	 * @var array
	 */
	private $_translations = array();

	/**
	 * @param array: $translations
	 */
	public function set_translations( array $translations ) {
		$this->_translations = $translations;
	}

	public function __construct(
		Ai1ec_Registry_Object $registry,
		$message,
		array $recipients,
		$subject
	) {
		parent::__construct( $registry );
		$this->_message    = $message;
		$this->_recipients = $recipients;
		$this->_subject    = $subject;
	}

	public function send( $headers = null ) {
		
		$this->_parse_text();	

		$is_html = false;	
		if ( null !== $headers ) {			
			foreach ( $headers as $key => $value ) {
				if ( 0 === strcasecmp( "content-type", $key ) && 
					0 === strcasecmp( "text/html", $value ) ) {
					$is_html = true;
					break;
				}
			}
		} 

		if ( false === $is_html ) {
			$handler = array( $this, 'mandrill_avoid_nl2br' );
			add_filter( 'mandrill_nl2br', $handler );
		}
			
		$result = wp_mail( $this->_recipients, $this->_subject, $this->_message, $headers );

		if ( false === $is_html ) {
			remove_filter( 'mandrill_nl2br', $handler );
		}
		return $result;		
	}

	public function mandrill_avoid_nl2br( $nl2br, $message ) {
		return false;
	}

	private function _parse_text() {
		if ( null !== $this->_translations ) {
			$this->_message = strtr( $this->_message, $this->_translations );
			$this->_subject = strtr( $this->_subject, $this->_translations );
		}
	}

}