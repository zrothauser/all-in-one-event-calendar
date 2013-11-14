<?php

/**
 * Abstract class for notifications.
 *
 * @author     Timely Network Inc
 * @since      2013.04.22
 *
 * @package    AllInOneEventCalendar
 * @subpackage AllInOneEventCalendar.Lib.Notification.Abstract
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