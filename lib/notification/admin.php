<?php

/**
 * Admin notifications. Dispatchment is delayed.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Notification
 */
class Ai1ec_Notification_Admin extends Ai1ec_Notification {

	/**
	 * @var string Option key for messages storage.
	 */
	const OPTION_KEY   = 'ai1ec_admin';

	/**
	 * @var string Name of messages for all admins.
	 */
	const RCPT_ALL     = 'all';

	/**
	 * @var string Name of network-admin only messages.
	 */
	const RCPT_NETWORK = 'network_admin_notices';

	/**
	 * @var string Name of admin only messages.
	 */
	const RCPT_ADMIN   = 'admin_notices';

	/**
	 * @var array Map of messages to be rendered.
	 */
	protected $_message_list = array();

	/**
	 * Set local variables. Optionally store message, if any passed.
	 *
	 * @param Ai1ec_Registry_Object $registry   Inejcted object registry.
	 * @param string                $message    Message to be dispatched.
	 * @param array                 $recipients List of message recipients.
	 *
	 * @return void
	 */
	public function __construct(
		Ai1ec_Registry_Object $registry,
		$message          = null,
		array $recipients = array( self::RCPT_ALL ),
		$class            = 'updated'
	) {
		$this->_registry = $registry;
		if ( $message ) {
			$this->store( $message, $recipients, $class );
		}
	}

	/**
	 * Add message to store.
	 *
	 * @param string $message    Actual message.
	 * @param array  $recipients List of message recipients.
	 * @param string $class      Message box class.
	 *
	 * @return bool Success.
	 */
	public function store( $message, array $recipients, $class ) {
		$this->retrieve();
		$entity  = compact( 'message', 'class' );
		$msg_key = sha1( json_encode( $entity ) );
		if ( isset( $this->_message_list['_messages'][$msg_key] ) ) {
			return true;
		}
		$this->_message_list['_messages'][$msg_key] = $entity;
		foreach ( $recipients as $rcpt ) {
			if ( ! isset( $this->_message_list[$rcpt] ) ) {
				continue;
			}
			$this->_message_list[$rcpt][] = $msg_key;
		}
		return $this->write();
	}

	/**
	 * Replace database representation with in-memory list version.
	 *
	 * @return bool Success.
	 */
	public function write() {
		return $this->_registry->get( 'model.option' )
			->set( self::OPTION_KEY, $this->_message_list );
	}

	/**
	 * Update in-memory list from data store.
	 *
	 * @return Ai1ec_Notification_Admin Instance of self for chaining.
	 */
	public function retrieve() {
		static $default = array(
			'_messages'        => array(),
			self::RCPT_ALL     => array(),
			self::RCPT_NETWORK => array(),
			self::RCPT_ADMIN   => array(),
		);
		$this->_message_list = $this->_registry->get( 'model.option' )
			->get( self::OPTION_KEY, null );
		if ( null === $this->_message_list ) {
			$this->_message_list = $default;
		} else {
			$this->_message_list = array_merge(
				$default,
				$this->_message_list
			);
		}
		return $this;
	}

	/**
	 * Display messages.
	 *
	 * @wp_hook network_admin_notices
	 * @wp_hook admin_notices
	 *
	 * @return bool Update status.
	 */
	public function send() {
		$this->retrieve();
		$filter       = current_filter();
		$destinations = array( self::RCPT_ALL, current_filter() );
		$modified     = false;
		foreach ( $destinations as $dst ) {
			if ( ! empty( $this->_message_list[$dst] ) ) {
				foreach ( $this->_message_list[$dst] as $key ) {
					if (
						isset( $this->_message_list['_messages'][$key] )
					) {
						$this->_render_message(
							$this->_message_list['_messages'][$key]
						);
						unset( $this->_message_list['_messages'][$key] );
					}
				}
				$this->_message_list[$dst] = array();
				$modified = true;
			}
		}
		if ( ! $modified ) {
			return false;
		}
		return $this->write();
	}

	protected function _render_message( array $entity ) {
		static $theme = null;
		if ( null === $theme ) {
			$theme = $this->_registry->get( 'theme.loader' );
		}
		$file = $theme->get_file(
			'notification/admin.twig',
			$entity,
			true
		);
		return $file->render();
	}

}