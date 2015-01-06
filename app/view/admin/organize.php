<?php

/**
 * The page to manage taxonomies.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View
 */
class Ai1ec_View_Organize extends Ai1ec_Base {
	
	/**
	 * @var array The taxonomies for events
	 */
	protected $_taxonomies = array();
	
	/**
	 * Register actions to draw the headers
	 */
	public function add_taxonomy_actions() {
		$taxonomies = get_object_taxonomies( AI1EC_POST_TYPE, 'object' );
		$dispatcher = $this->_registry->get( 'event.dispatcher' );
		foreach ( $taxonomies as $taxonomy => $data ) {
			if ( true === $data->public ) {
				$this->_taxonomies[] = array(
					'url'   => add_query_arg( 
						array( 
							'post_type' => AI1EC_POST_TYPE,
							'taxonomy'  => $taxonomy
					 	),
						admin_url( 'edit-tags.php' )
					),
					'name'   => $data->labels->name,
					'active' => isset( $_GET['taxonomy'] ) && $taxonomy === $_GET['taxonomy'] ?
						'ai1ec-active' :
						''
				);
				$dispatcher->register_action(
					$taxonomy . '_pre_add_form',
					array( 'view.admin.organize', 'render_header' )
				);
			}
		}
	}
	
	/**
	 * render header to manage taxonomies
	 */
	public function render_header() {
		$this->_registry->get( 'theme.loader' )->get_file(
			'organize/header.twig',
			array( 
				'taxonomies' => $this->_taxonomies
			),
			true
		)->render();	

	}

}