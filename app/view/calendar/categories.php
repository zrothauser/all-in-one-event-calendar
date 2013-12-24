<?php
class Ai1ec_View_Calendar_Categories extends Ai1ec_View_Calendar_Taxonmy {

	/**
	 * Generates the HTML for a category selector.
	 *
	 * @param array $view_args        Arguments to the parent view
	 *
	 * @return string                 Markup for categories selector
	 */
	public function get_html_for_categories( $view_args ) {
	
		// Get categories & tags. Add category color info to available categories.
		$categories = get_terms( 'events_categories', array( 'orderby' => 'name' ) );
		if( empty( $categories ) ) {
			return '';
		}
	
		foreach( $categories as &$cat ) {
			$taxonomy = $this->_registry->get( 'view.event.taxonomy' );
			$cat->color = $taxonomy->get_category_color_square( $cat->term_id );
			$href = $this->_registry->get( 'html.element.href', $view_args, 'category' );
			$href->set_term_id( $cat->term_id );
			$cat->href = $href->generate_href();
		}
	
		$href_for_clearing_filter =
			$this->generate_href_without_arguments( $view_args, array( 'cat_ids' ) );
	
		$args = array(
			"categories"       => $categories,
			"selected_cat_ids" => $view_args['cat_ids'],
			"data_type"        => $view_args['data_type'],
			"clear_filter"     => $href_for_clearing_filter,
		);
		$loader = $this->_registry->get( 'theme.loader' );
		return $loader->get_file( 'categories.twig', $args, false )->get_content();
	}
	
}