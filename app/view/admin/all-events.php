<?php

class Ai1ec_View_Admin_All_Events extends Ai1ec_Base {
	
	/**
	 * change_columns function
	 *
	 * Adds Event date/time column to our custom post type
	 * and renames Date column to Post Date
	 *
	 * @param array $columns Existing columns
	 *
	 * @return array Updated columns array
	 */
	public function change_columns( array $columns = array() ) {
		$columns['author']           = Ai1ec_I18n::__( 'Author' );
		$columns['date']             = Ai1ec_I18n::__( 'Post Date' );
		$columns['ai1ec_event_date'] = Ai1ec_I18n::__( 'Event date/time' );
		return $columns;
	}

	/**
	 * orderby function
	 *
	 * Orders events by event date
	 *
	 * @param string $orderby Orderby sql
	 * @param object $wp_query
	 *
	 * @return void
	 **/
	public function orderby( $orderby, $wp_query ) {
		
		$db = $this->_registry->get( 'dbi.dbi' );
		$aco = $this->_registry->get( 'acl.aco' );
	
		if( true === $aco->is_all_events_page() ) {
			$wp_query->query = wp_parse_args( $wp_query->query );
			$table_name = $db->get_table_name( 'ai1ec_events' );
			$posts = $db->get_table_name( 'posts' );
			if( isset( $wp_query->query['orderby'] ) && 'ai1ec_event_date' === @$wp_query->query['orderby'] ) {
				$orderby = "(SELECT start FROM {$table_name} WHERE post_id = {$posts}.ID) " . $wp_query->get('order');
			} else if( empty( $wp_query->query['orderby'] ) || $wp_query->query['orderby'] === 'menu_order title' ) {
				$orderby = "(SELECT start FROM {$table_name} WHERE post_id = {$posts}.ID) " . 'desc';
			}
		}
		return $orderby;
	}
	
	/**
	 * custom_columns function
	 *
	 * Adds content for custom columns
	 *
	 * @return void
	 **/
	public function custom_columns( $column, $post_id ) {
		switch( $column ) {
			case 'ai1ec_event_date':
				try {
					$event = $this->_registry->get( 'model.event', $post_id );
					$time = $this->_registry->get( 'view.event.time' );
					echo $time->get_timespan_html( $event );
				} catch( Exception $e ) {
					// event wasn't found, output empty string
					echo "";
				}
				break;
		}
	}
	
	/**
	 * sortable_columns function
	 *
	 * Enable sorting of columns
	 *
	 * @return void
	 **/
	public function sortable_columns( $columns ) {
		$columns["ai1ec_event_date"] = 'ai1ec_event_date';
		return $columns;
	}
}