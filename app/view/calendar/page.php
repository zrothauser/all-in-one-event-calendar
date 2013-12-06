<?php
class Ai1ec_Calendar_Page extends Ai1ec_Base {

	/**
	 * @var Ai1ec_Memory_Utility Instance of memory to hold exact dates
	 */
	protected $_exact_dates = NULL;
	
	public function __construct( Ai1ec_Registry_Object $registry ) {
		parent::__construct( $registry );
		$this->_exact_dates = $registry->get( 'cache.memory' );
	}

	public function get_content( Ai1ec_Request_Parser $request ) {
		// Are we loading a shortcode?
		$shortcode       = $request->get( 'shortcode' );
		
		$view_args  = $this->get_view_args_for_view( $request );
		$action     = $view_args['action'];
		$type       = $request->get( 'request_type' );
		
		$exact_date = $this->get_exact_date( $request );
		$view = $this->_registry->get( 'view.calendar.view.oneday', $request );
		$view_args = $view->get_extra_arguments( $view_args, $exact_date );
		return $view->get_content( $view_args );
	}

	/**
	 * Get the exact date from request if available, or else from settings.
	 *
	 * @param Ai1ec_Abstract_Query settings@return boolean|int
	 */
	private function get_exact_date( Ai1ec_Abstract_Query $request ) {
		$settings = $this->_registry->get( 'model.settings' );
	
		// Preprocess exact_date.
		// Check to see if a date has been specified.
		$exact_date = $request->get( 'exact_date' );
		$use_key    = $exact_date;
		if ( NULL === ( $exact_date = $this->_exact_dates->get( $use_key ) ) ) {
			$exact_date = $use_key;
			// Let's check if we have a date
			if ( false !== $exact_date ) {
				// If it's not a timestamp
				if( ! Ai1ec_Validation_Utility::is_valid_time_stamp( $exact_date ) ) {
					// Try to parse it
					$exact_date = $this->return_gmtime_from_exact_date( $exact_date );
				}
			}
			// Last try, let's see if an exact date is set in settings.
			if ( false === $exact_date && $settings->get( 'exact_date' ) !== '' ) {
				$exact_date = $this->return_gmtime_from_exact_date(
					$settings->exact_date
				);
			}
			$this->_exact_dates->set( $use_key, $exact_date );
		}
		return $exact_date;
	}


	/**
	 * Decomposes an 'exact_date' parameter into month, day, year components based
	 * on date pattern defined in settings (assumed to be in local time zone),
	 * then returns a timestamp in GMT.
	 *
	 * @param  string     $exact_date 'exact_date' parameter passed to a view
	 * @return bool|int               false if argument not provided or invalid,
	 *                                else UNIX timestamp in GMT
	 */
	private function return_gmtime_from_exact_date( $exact_date ) {
		$settings = $this->_registry->get( 'model.settings' );
	
		$bits = Ai1ec_Validation_Utility::validate_date_and_return_parsed_date(
			$exact_date,
			$settings->get( 'input_date_format' )
		);
		if( false === $bits ) {
			$exact_date = false;
		} else {
			$exact_date = $this->_registry->get( 
				'date.time',
				gmmktime(
					0, 0, 0, $bits['month'], $bits['day'], $bits['year']
				),
				$this->_registry->get( 'model.option' )->get( 'timezone_string' )
			);
			$exact_date = $exact_date->format_to_gmt();
		}
		return $exact_date;
	}

	/**
	 * Returns the correct data attribute to use in views
	 *
	 * @param string $type
	 */
	private function return_data_type_for_request_type( $type ) {
		$data_type = 'data-type="json"';
		if ( $type === 'jsonp' ) {
			$data_type = 'data-type="jsonp"';
		}
		return $data_type;
	}

	public function get_view_args_for_view( Ai1ec_Abstract_Query $request ) {
		$settings = $this->_registry->get( 'model.settings' );
		// Define arguments for specific calendar sub-view (month, agenda,
		// posterboard, etc.)
		// Preprocess action.
		// Allow action w/ or w/o ai1ec_ prefix. Remove ai1ec_ if provided.
		$action = $request->get( 'action' );
	
		if ( 0 === strncmp( $action, 'ai1ec_', 6 ) ) {
			$action = substr( $action, 6 );
		}
		$view_args = $request->get_dict( array(
			'post_ids',
			'auth_ids',
			'cat_ids',
			'tag_ids',
		) );
	
		$add_defaults = array(
			'cat_ids' => 'default_categories',
			'tag_ids' => 'default_tags',
		);
		foreach ( $add_defaults as $query => $default ) {
			if ( empty( $view_args[$query] ) ) {
				$view_args[$query] = $settings->get( $default );
			}
		}
	
		$type = $request->get( 'request_type' );
		$view_args['data_type'] = $this->return_data_type_for_request_type(
			$type
		);
	
		$exact_date = $this->get_exact_date( $request );
	
		$view_args['no_navigation'] = $request
			->get( 'no_navigation' ) === 'true';
	
		// Find out which view of the calendar page was requested, and render it
		// accordingly.
		$view_args['action'] = $action;
		switch( $action ) {
			case 'posterboard':
			case 'stream':
			case 'agenda':
				$view_args += $request->get_dict( array(
				'page_offset',
				'time_limit',
				) );
				if( false !== $exact_date ) {
					$view_args['time_limit'] = $exact_date;
				}
				break;
	
			case 'month':
			case 'oneday':
			case 'week':
				$view_args["{$action}_offset"] = $request->get( "{$action}_offset" );
				if( false !== $exact_date ) {
					$view_args['exact_date'] = $exact_date;
				}
				break;
		}
		$view_args['request'] = $request;
		return $view_args;
	}
}