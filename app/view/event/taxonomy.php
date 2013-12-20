<?php

/**
 * This class renders the html for the event taxonomy.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View.Event
 */
class Ai1ec_View_Event_Taxonomy extends Ai1ec_Base {
	
	/**
	 * Style attribute for event category
	 */
	public function get_color_style( Ai1ec_Event $event ) {
		static $color_styles = array();
		$id = $event->get( 'post_id' );
		$categories = wp_get_post_terms(
			$id,
			'events_categories'
		);
		if ( $categories && ! empty( $categories ) ) {
			if ( ! isset( $color_styles[$categories[0]->term_id] ) )
			$color_styles[$categories[0]->term_id] = $this->get_event_category_color_style(
				$categories[0]->term_id,
				$event->is_allday() || $event->is_multiday()
			);
			return $color_styles[$categories[0]->term_id];
		}

		return '';
	}
	
	/**
	 * get_event_category_color_style function
	 *
	 * Returns the style attribute assigning the category color style to an event.
	 *
	 * @param int  $term_id Term ID of event category
	 * @param bool $allday  Whether the event is all-day
	 * @return string
	 **/
	public function get_event_category_color_style(
		$term_id,
		$allday = false
	) {
		$taxonomy = $this->_registry->get( 'model.taxonomy' );
		$color = $taxonomy->get_category_color( $term_id );
		if ( ! is_null( $color ) && ! empty( $color ) ) {
			if( $allday )
				return 'background-color: ' . $color . ';';
			else
				return 'color: ' . $color . ' !important;';
		}
		return '';
	}
	
	/**
	 * HTML of category color boxes for this event
	 */
	public function get_category_colors( Ai1ec_Event $event ) {
		static $category_colors = array();
		$id = $event->get( 'post_id' );
		if ( ! isset( $category_colors[$id] ) ) {
			$categories = wp_get_post_terms(
				$id,
				'events_categories'
			);
			$category_colors[$id] = $this->get_event_category_colors( $categories );
		}
		return $category_colors[$id];
	}
	
	/**
	 * get_category_color_square function
	 *
	 * Returns the HTML markup for the category color square of the given Event
	 * Category term ID.
	 *
	 * @param int $term_id The term ID of event category
	 * @return string
	 **/
	public function get_category_color_square( $term_id ) {
		$taxonomy = $this->_registry->get( 'model.taxonomy' );
		$color = $taxonomy->get_category_color( $term_id );
		if ( NULL !== $color && ! empty( $color ) ) {
			$cat = get_term( $term_id, 'events_categories' );
			return '<span class="ai1ec-color-swatch ai1ec-tooltip-trigger" ' .
				'style="background:' . $color . '" title="' .
				esc_attr( $cat->name ) . '"></span>';
		}
		return '';
	}

	/**
	 * get_event_category_colors function
	 *
	 * Returns category color squares for the list of Event Category objects.
	 *
	 * @param array $cats The Event Category objects as returned by get_terms()
	 * @return string
	 **/
	public function get_event_category_colors( $cats ) {
		$sqrs = '';
	
		foreach ( $cats as $cat ) {
			$tmp = $this->get_category_color_square( $cat->term_id );
			if ( ! empty( $tmp ) ) {
				$sqrs .= $tmp;
			}
		}
	
		return $sqrs;
	}
}