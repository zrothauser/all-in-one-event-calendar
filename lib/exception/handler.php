<?php
/**
 * Handles exception and errors.
 *
 * @author     Time.ly Network Inc
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Exception
 **/
require_once 'ai1ec.php';
require_once 'error.php';

class Ai1ec_Exception_Handler {

	/**
	 * @var string The option for the messgae in the db
	 */
	const DB_DEACTIVATE_MESSAGE = 'ai1ec_deactivate_message';

	/**
	 * @var string The GET parameter to reactivate the plugin
	 */
	const DB_REACTIVATE_PLUGIN  = 'ai1ec_reactivate_plugin';

	/**
	 * @var callable The previous exception handler
	 */
	protected $_prev_ex_handler;

	/**
	 * @var string|array The previous error handler
	 * It's a string if it's a function, an array if it's a method
	 */
	protected $_prev_er_handler;

	/**
	 * @var string The name of the Exception class to handle
	 */
	protected $_exception_class;

	/**
	 * @var string The name of the ErrorException class to handle
	 */
	protected $_error_exception_class;

	/**
	 * @var string The message to display in the admin notice
	 */
	protected $_message;

	/**
	 * @param callable|null $_prev_ex_handler
	 */
	public function set_prev_ex_handler( $_prev_ex_handler ) {
		$this->_prev_ex_handler = $_prev_ex_handler;
	}

	/**
	 * @param callable|null $_prev_er_handler
	 */
	public function set_prev_er_handler( $_prev_er_handler ) {
		$this->_prev_er_handler = $_prev_er_handler;
	}

	/**
	 * @param string $exception_class
	 * @param string $error_exception_class
	 */
	public function __construct( $exception_class, $error_exception_class ) {
		$this->_exception_class       = $exception_class;
		$this->_error_exception_class = $error_exception_class;
	}

	/**
	 * Handles all exceptions
	 * 
	 * @param Exception $exception
	 */
	public function handle_exception( Exception $exception ) {
		// if it's something we handle, handle it
		if ( $exception instanceof $this->_exception_class ) {
			// check if it has a methof for deatiled html
			$message = method_exists( $exception, 'get_html_message' ) ?
					$exception->get_html_message() :
					$exception->getMessage();
			$this->soft_deactivate_plugin( $message );
		}
		// if it's a PHP error in our plugin files, deactivate and redirect
		else if ( $exception instanceof $this->_error_exception_class ) {
			$this->soft_deactivate_plugin( $exception->getMessage() );
		}
		// if another handler was set, let it handle the exception
		if ( is_callable( $this->_prev_ex_handler ) ) {
			$this->_prev_ex_handler( $exception );
		}
	}

	/**
	 * Throws an ai1ec_error_exception if the error comes from our plugin
	 *
	 * @param int    $errno
	 * @param string $errstr 
	 * @param string $errfile
	 * @param string $errline
	 * @param array  $errcontext
	 *
	 * @throws Ai1ec_Error_Exception
	 *
	 * @return boolean|void
	 */
	public function handle_error( $errno, $errstr, $errfile, $errline, 
		array $errcontext ) {
		// if the error is not in our plugin, let PHP handle things.
		if ( false === strpos( $errfile, AI1EC_PLUGIN_NAME ) ) {
			if ( is_callable( $this->_prev_er_handler ) ) {
				return call_user_func_array( 
					$this->_prev_er_handler, 
					func_get_args()
				);
			}
			return false;
		} else {
			throw new Ai1ec_Error_Exception( $errstr, $errno, 0, $errfile, 
				$errline );
		}
	}

	/**
	 * Perform what's needed to deactivate the plugin softly
	 *
	 * @param string $message
	 */
	protected function soft_deactivate_plugin( $message ) {
		add_option( self::DB_DEACTIVATE_MESSAGE, $message );
		$this->redirect();
	}

	/**
	 * Perform what's needed to reactivate the plugin.
	 * 
	 * @return boolean
	 */
	public function reactivate_plugin() {
		return delete_option( self::DB_DEACTIVATE_MESSAGE );
	}

	/**
	 * Returns the disabled message or false.
	 * 
	 * @return string|boolean
	 */
	public function get_disabled_message() {
		return get_option( self::DB_DEACTIVATE_MESSAGE, false );
	}

	/**
	 * Add an admin notice.
	 * 
	 * @param string $message
	 */
	public function show_notices( $message ) {
		// save the message to use it later
		$this->_message = $message;
		add_action( 'admin_notices', array( $this, 'render_admin_notice' ) );
	}

	/**
	 * Renders the html for the Admin Notice.
	 * 
	 */
	public function render_admin_notice() {
		$redirect_url = add_query_arg(
			self::DB_REACTIVATE_PLUGIN,
			true,
			get_admin_url( $_SERVER['REQUEST_URI'] )
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