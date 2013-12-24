<?php
class Ai1ec_View_Calendar_Taxonomy extends Ai1ec_Base {
	
	/**
	 * Returns a link to a calendar page without the given arguments; does not
	 * otherwise disturb current page state.
	 *
	 * @param array $args           Current arguments to the calendar
	 * @param array $args_to_remove Names of arguments to remove from current args
	 *
	 * @return string
	 */
	public function generate_href_without_arguments(
		array $args,
		array $args_to_remove
	) {
		$args_to_remove = array_flip( $args_to_remove );
		$args = array_diff_key( $args, $args_to_remove );
		$href = $this->_registry->get( 'html.element.href', $args );
		return $href->generate_href();
	}
	
	/**
	 * Generates the HTML for a tag selector.
	 *
	 * @param array $view_args        Arguments to the parent view
	 *
	 * @return string                 Markup for categories selector
	 */
	public function get_html_for_taxonomy( $view_args, $tag = false ) {
		$taxonomy_name      = 'events_categories';
		$type               = 'category';
		$type_for_filter    = 'cat_ids';
		$type_for_view_args = 'categories';
		if ( true === $tag ) {
			$taxonomy_name      = 'events_tags';
			$type               = 'tag';
			$type_for_filter    = 'tag_ids';
			$type_for_view_args = 'tags';
		}
		
	
		$terms = get_terms( $taxonomy_name, array( 'orderby' => 'name' ) );
		if( empty( $terms ) ) {
			return '';
		}
	
		foreach( $terms as &$term ) {
			$href = $this->_registry->get( 'html.element.href', $view_args, $type );
			$href->set_term_id( $term->term_id );
			$term->href = $href->generate_href();
			if ( false === $tag ) {
				$taxonomy = $this->_registry->get( 'view.event.taxonomy' );
				$term->color = $taxonomy->get_category_color_square( $term->term_id );
			}
		}
	
		$href_for_clearing_filter =
			$this->generate_href_without_arguments( $view_args, array( $type_for_filter ) );
	
		$args = array(
			$type_for_view_args            => $terms,
			'selected_' . $type_for_filter => $view_args[$type_for_filter],
			"data_type"                    => $view_args['data_type'],
			"clear_filter"                 => $href_for_clearing_filter,
		);
		$loader = $this->_registry->get( 'theme.loader' );
		return $loader->get_file( $type_for_view_args . '.twig', $args, false )
			->get_content();
	}
}