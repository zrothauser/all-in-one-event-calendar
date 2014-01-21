<?php

/**
 * Model used for storing/retrieving taxonomy.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Html
 */
class Ai1ec_Taxonomy extends Ai1ec_Base {
	
	/**
	 * get_category_color function
	 *
	 * Returns the color of the Event Category having the given term ID.
	 *
	 * @param int dbm_id The ID of the Event Category
	 *
	 * @return string Color to use
	 *
	 * @staticvar Ai1ec_Memory_Utility $colors Cached entries instance
	 */
	public function get_category_color( $term_id ) {
		static $colors = NULL;
		if ( ! isset( $colors ) ) {
			$colors = $this->_registry->get( 'cache.memory' );
		}
		$term_id = (int)$term_id;
		if ( NULL === ( $color = $colors->get( $term_id ) ) ) {
			$db = $this->_registry->get( 'dbi.dbi' );
	
			$color = (string)$db->get_var(
				'SELECT term_color FROM ' . $db->get_table_name( 'ai1ec_event_category_colors' ) .
				' WHERE term_id = ' .
				$term_id
			);
			$colors->set( $term_id, $color );
		}
		return $color;
	}

	/**
	 * Add category form
	 *
	 * @return void
	 **/
	public function events_categories_add_form_fields() {

		$args  = array(
			'color'       => '',
			'style'       => '',
			'label'       => __( 'Category Color', AI1EC_PLUGIN_NAME ),
			'description' => __(
				'Events in this category will be identified by this color',
				AI1EC_PLUGIN_NAME ),
			'edit'        => false
		);

		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file(
			'settings/categories-color-picker.twig',
			$args,
			true
		);

		echo( $file->get_content() );
	}

	/**
	 * Edit category form
	 *
	 * @param $term
	 * @return void
	 */
	function events_categories_edit_form_fields( $term ) {

		$db         = $this->_registry->get( 'dbi.dbi' );
		$table_name = $db->get_table_name( 'ai1ec_event_category_colors' );
		$color      = $db->get_var(
			$db->prepare(
				"SELECT term_color FROM {$table_name} WHERE term_id = %d ",
				$term->term_id )
		);

		$style = '';
		$clr   = '';

		if( ! is_null( $color ) && ! empty( $color ) ) {
			$style = 'style="background-color: ' . $color . '"';
			$clr   = $color;
		}

		$args = array(
			'style'       => $style,
			'color'       => $clr,
			'label'       => __( 'Category Color', AI1EC_PLUGIN_NAME ),
			'description' => __(
				'Events in this category will be identified by this color',
				AI1EC_PLUGIN_NAME ),
			'edit'        => true,
		);

		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file(
			'settings/categories-color-picker.twig',
			$args,
			true
		);

		echo( $file->get_content() );
	}

	/**
	 * Hook to process event categories creation
	 *
	 * @param $term_id
	 * @return void Method does not return
	 */
	function created_events_categories( $term_id ) {
		$this->edited_events_categories( $term_id );
	}

	/**
	 * edited_events_categories method
	 *
	 * A callback method, triggered when `event_categories' are being edited
	 *
	 * @param int $term_id ID of term (category) being edited
	 *
	 * @return void Method does not return
	 */
	function edited_events_categories( $term_id ) {

		$db              = $this->_registry->get( 'dbi.dbi' );

		$tag_color_value = '';
		if (
			isset( $_POST['tag-color-value'] ) &&
			! empty( $_POST['tag-color-value'] )
		) {
			$tag_color_value = $_POST['tag-color-value'];
		}

		$table_name = $db->get_table_name( 'ai1ec_event_category_colors' );
		$term       = $db->get_row( $db->prepare(
			'SELECT term_id, term_color' .
			' FROM ' . $table_name .
			' WHERE term_id = %d',
			$term_id
		) );

		if ( NULL === $term ) { // term does not exist, create it
			$db->insert(
				$table_name,
				array(
					'term_id'    => $term_id,
					'term_color' => $tag_color_value,
				),
				array(
					'%d',
					'%s',
				)
			);
		} else { // term exist, update it
			if ( NULL === $tag_color_value ) {
				$tag_color_value = $term->term_color;
			}
			$db->update(
				$table_name,
				array( 'term_color' => $tag_color_value ),
				array( 'term_id'    => $term_id ),
				array( '%s' ),
				array( '%d' )
			);
		}
	}

}