<?php
class Ai1ec_Calendar_Page extends Ai1ec_Base {
	
	public function get_content( Ai1ec_Request_Parser $request ) {
		
	}
	public function get_view_args_for_view( Ai1ec_Abstract_Query $request ) {
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
				$view_args[$query] = $ai1ec_settings->{$default};
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