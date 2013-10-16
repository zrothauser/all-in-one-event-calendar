<?php
/**
 * Handles exception and errors.
 *
 * @author     Timely Network Inc
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Exception
 **/
require_once 'ai1ec.php';
require_once 'error.php';

class Ai1ec_Exception_Handler {

	/**
	 * @var string the option for the messgae in the db
	 */
	const DB_DEACTIVATE_MESSAGE = 'ai1ec_deactivate_message';

	/**
	 * @var string the GET parameter to reactivate the plugin.
	 */
	const DB_REACTIVATE_PLUGIN  = 'ai1ec_reactivate_plugin';

	/**
	 * @var callable the previous exception handler
	 */
	protected $_prev_ex_handler;

	/**
	 * @var mixed string/array the prev error handler.
	 */
	protected $_prev_er_handler;

	/**
	 * @var string the name of the Exception class to handle.
	 */
	protected $_exception_class;

	/**
	 * @var string the name of the ErrorException class to handle.
	 */
	protected $_error_exception_class;

	/**
	 * @var the message to display in the admin notice.
	 */
	protected $_message;

	/**
	 * @param mixed $_prev_ex_handler
	 */
	public function set_prev_ex_handler( $_prev_ex_handler ) {
		$this->_prev_ex_handler = $_prev_ex_handler;
	}

	/**
	 * @param mixed $_prev_er_handler
	 */
	public function set_prev_er_handler( $_prev_er_handler ) {
		$this->_prev_er_handler = $_prev_er_handler;
	}

	public function __construct( $exception_class, $error_exception_class ) {
		$this->_exception_class = $exception_class;
		$this->_error_exception_class = $error_exception_class;
	}

	/**
	 * Handles all exceptions
	 * 
	 * @param Exception $exception
	 */
	public function handle_exception( Exception $exception ) {
		// if it's something we handle, handle it
		if( is_subclass_of( $exception, $this->_exception_class ) ) {
			// check if it has a methof for deatiled html
			$message = method_exists( $exception, 'get_html_message' ) ?
					$exception->get_html_message() :
					$exception->getMessage();
			$this->soft_deactivate_plugin( $message );
			$this->redirect();
		}
		// if it's a PHP error in our plugin files, deactivate and redirect
		else if ( $exception instanceof $this->_error_exception_class ) {
			$this->soft_deactivate_plugin( $exception->getMessage() );
			$this->redirect();
		}
		// if another handler was set, let it handle the exception
		if ( is_callable( $this->_prev_ex_handler ) ) {
			$this->_prev_ex_handler( $exception );
		}
	}

	/**
	 * Throws an ai1ec_error_exception if the error comes from our plugin
	 *
	 * @param int $errno
	 * @param str $errstr
	 * @param str $errfile
	 * @param str $errline
	 * @param array $errcontext
	 * @throws ai1ec_error_exception
	 * @return boolean/void
	 */
	public function handle_error(
		$errno,
		$errstr,
		$errfile,
		$errline,
		array $errcontext
	) {
		// if the error is not in our plugin, let PHP handle things.
		if( false === strpos( $errfile, AI1EC_PLUGIN_NAME ) ) {
			return false;
		}
		throw new Ai1ec_Error_Exception( $errstr, $errno, 0, $errfile, $errline );
	}

	/**
	 * Perform what's needed to deactivate the plugin softly
	 *
	 * @param string $message
	 */
	protected function soft_deactivate_plugin( $message ) {
		add_option( self::DB_DEACTIVATE_MESSAGE, $message );
	}

	/**
	 * Perform what's needed to reactivate the plugin.
	 * 
	 */
	public function reactivate_plugin() {
		delete_option( self::DB_DEACTIVATE_MESSAGE );
	}

	/**
	 * Returns the disabled message or false.
	 * 
	 * @return mixed string/boolean
	 */
	public function get_disabled_message() {
		return get_option( self::DB_DEACTIVATE_MESSAGE, false );
	}

	/**
	 * Ad an admin notice.
	 * 
	 * @param string $message
	 */
	public function show_notices( $message ) {
		// save the message to use it later
		$this->_message = $message;
		add_action( 'admin_notices', array( $this, 'render_admin_notice' ) );
	}

	public function render_admin_notice() {
		$redirect_url = get_admin_url( $_SERVER['REQUEST_URI'] );
		$redirect_url .= Ai1ec_Http_Response::get_param_delimiter_char(
			$redirect_url
		);
		$label = __( 
			'All In One Event Calendar has been disabled due to an error. Here is the description',
			AI1EC_PLUGIN_NAME
		);
		$redirect_url .= self::DB_REACTIVATE_PLUGIN . '=true';
		$message = '<div class="message error">'. 
						'<h3>' . $label . '</h3>' .
						'<p>' . $this->_message . '</p>';
		$message .= sprintf(
			__( 
				'<p>If you corrected the error and want to reactivate the plugin, <a href="%s">click here</a></p>', 
				AI1EC_PLUGIN_NAME
			),
			$redirect_url
		);
		$message .= '</div>';
		echo $message;
	}

	/**
	 * Redirect the user either to the front page or the dasbord page
	 */
	protected function redirect() {
		if ( is_admin() ) {
			Ai1ec_Http_Response::redirect( get_admin_url() );
		} else {
			Ai1ec_Http_Response::redirect( get_site_url() );
		}
	}
}