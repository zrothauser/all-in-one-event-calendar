<?php

/**
 * Abstract class for notifications.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Notification
 */
abstract class Ai1ec_Notification {

	/**
	 * An array of recipients
	 *
	 * @var array
	 */
	protected $recipients = array();

	/**
	 * The message to send
	 *
	 * @var string
	 */
	protected $message;

	public function __construct( array $recipients, $message ) {
		$this->recipients = $recipients;
		$this->message = $message;
	}

	/**
	 * This function performs the actual sending of the message
	 *
	 */
	abstract public function send();
}