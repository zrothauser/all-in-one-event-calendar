<?php

/**
 * Redirect for categories and tags.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Request
 */
class Ai1ec_Request_Redirect extends Ai1ec_Base {

	/**
	 * Checks if current request is direct for Events cats/tags and redirects
	 * to filtered calendar.
	 *
	 * @param object $wpobj WP object.
	 *
	 * @return void Method does not return.
	 */
	public function handle_categories_and_tags( $wpobj ) {
		$cats   = constant( 'Ai1ec_Event_Taxonomy::CATEGORIES' );
		$tags   = constant( 'Ai1ec_Event_Taxonomy::TAGS' );
		$is_cat = isset( $wpobj->query_vars[$cats] );
		$is_tag = isset( $wpobj->query_vars[$tags] );
		if (
			! isset( $wpobj->query_vars ) ||
			( ! $is_cat && ! $is_tag )
		) {
			return;
		}

		if ( $is_cat ) {
			$query_ident = $cats;
			$url_ident   = 'cat_ids';
		}
		if ( $is_tag ) {
			$query_ident = $tags;
			$url_ident   = 'tag_ids';
		}
		$term = get_term_by(
			'slug',
			$wpobj->query_vars[$query_ident],
			$query_ident
		);
		if ( ! $term ) {
			return;
		}
		$href = $this->_registry->get(
			'html.element.href',
			array( $url_ident => $term->term_id )
		);
		$params = array(
			'url'        => $href->generate_href(),
			'query_args' => array(),
		);
		$this->_registry->get( 'http.response.render.strategy.redirect' )
			->render( $params );
		Ai1ec_Http_Response_Helper::stop( 0 );
	}
}

