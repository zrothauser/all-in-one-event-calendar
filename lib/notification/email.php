<?php

/**
 * Concrete implementation for email notifications.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Notification
 */
class Ai1ec_Email_Notification extends Ai1ec_Notification {

	/**
	 * @var string
	 */
	private $subject;
	
	/**
	 * @var array
	 */
	private $translations = array();

	/**
	 * @param array: $translations
	 */
	public function set_translations( array $translations ) {
		$this->translations = $translations;
	}

	public function __construct( array $recipients, $message, $subject ) {
		parent::__construct( $recipients, $message );
		$this->subject = $subject;
	}

	public function send() {
		$this->parse_text();
		return wp_mail( $this->recipients, $this->subject, $this->message );
	}

	private function parse_text() {
		$this->message = strtr( $this->message, $this->translations );
		$this->subject = strtr( $this->subject, $this->translations );
	}
}