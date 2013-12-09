<?php
class Ai1ec_View_Event_Renderer extends Ai1ec_Base {
	
	/**
	 * Style attribute for event category
	 */
	public function get_color_style( Ai1ec_Event $event ) {
		static $color_styles = array();
		$id = $event->get( 'id' );
		if ( ! isset( $color_styles[$id] ) ) {
			$categories = wp_get_post_terms(
				$id,
				'events_categories'
			);
			if ( $categories && ! empty( $categories ) ) {
				$color_styles[$id] = $this->get_event_category_color_style(
					$categories[0]->term_id,
					$this->allday || $this->get_multiday()
				);
			}
		}
		return $color_styles[$id];
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
		$id = $event->get( 'id' );
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