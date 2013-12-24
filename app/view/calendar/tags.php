<?php
class Ai1ec_View_Calendar_Tags extends Ai1ec_View_Calendar_Taxonmy {

	/**
	 * Generates the HTML for a tag selector.
	 *
	 * @param array $view_args        Arguments to the parent view
	 *
	 * @return string                 Markup for categories selector
	 */
	public function get_html_for_tags( $view_args ) {
		global $ai1ec_view_helper;

		$tags = get_terms( 'events_tags', array( 'orderby' => 'name' ) );
		if( empty( $tags ) ) {
			return '';
		}

		foreach( $tags as &$tag ) {
			$href = $this->_registry->get( 'html.element.href', $view_args, 'tag' );
			$href->set_term_id( $tag->term_id );
			$tag->href = $href->generate_href();
		}

		$href_for_clearing_filter =
			$this->generate_href_without_arguments( $view_args, array( 'tag_ids' ) );

		$args = array(
			"tags"             => $tags,
			"selected_tag_ids" => $view_args['tag_ids'],
			"data_type"        => $view_args['data_type'],
			"clear_filter"     => $href_for_clearing_filter,
		);
		return $ai1ec_view_helper->get_theme_view( "tags.php", $args );
	}
	
}