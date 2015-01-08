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
		$taxonomy_metadata = array(
			'events_categories' => array(
				'icon' => 'ai1ec-fa ai1ec-fa-folder-open'
			),
			'events_tags'       => array(
				'icon' => 'ai1ec-fa ai1ec-fa-tags'
			)
		);
		$taxonomy_metadata = apply_filters(
			'ai1ec_add_custom_groups',
			$taxonomy_metadata
		);
		$group_data = array();
		do_action( 'ai1ec_taxonomy_management_css' );
		foreach ( $taxonomies as $taxonomy => $data ) {
			if ( true === $data->public ) {
				$active_taxonomy =
					isset( $_GET['taxonomy'] ) &&
					$taxonomy === $_GET['taxonomy'];
				$edit_url = '';
				if (
					true === $active_taxonomy &&
					isset( $taxonomy_metadata[$taxonomy]['url'] )
				) {
					$edit_url = $taxonomy_metadata[$taxonomy]['url'];
				}
				$this->_taxonomies[] = array(
					'url'        => add_query_arg(
						array(
							'post_type' => AI1EC_POST_TYPE,
							'taxonomy'  => $taxonomy
					 	),
						admin_url( 'edit-tags.php' )
					),
					'name'       => $data->labels->name,
					'active'     => $active_taxonomy,
					'icon'       => isset( $taxonomy_metadata[$taxonomy] ) ?
						$taxonomy_metadata[$taxonomy]['icon'] :
						'',
					'edit_url'   => $edit_url,
					'edit_label' => Ai1ec_I18n::__( 'Edit' ),
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
				'taxonomies' => apply_filters( 'ai1ec_custom_taxonomies', $this->_taxonomies )
			),
			true
		)->render();

	}

}
