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
	 * get_category_image_square function
	 *
	 * Returns the HTML markup for the category image square of the given Event
	 * Category term ID.
	 *
	 * @param int $term_id The term ID of event category
	 * @return string
	 **/
	public function get_category_image_square( $term_id ) {
		$taxonomy = $this->_registry->get( 'model.taxonomy' );
		$image = $taxonomy->get_category_image( $term_id );
		if ( NULL !== $image && ! empty( $image ) ) {
			return '<img src="' . $image . '" alt="" class="ai1ec_category_small_image_preview" />';
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

	/**
	 * Categories as HTML, either as blocks or inline.
	 *
	 * @param Ai1ec_Event $event
	 * @param   string $format      Return 'blocks' or 'inline' formatted result
	 * @return  string              String of HTML for category blocks
	 */
	public function get_categories_html( Ai1ec_Event $event, $format = 'blocks' ) {
		$categories = wp_get_post_terms(
			$event->get( 'post_id' ),
			'events_categories'
		);
		foreach ( $categories as &$category ) {
			$href = $this->_registry->get( 
				'html.element.href',
				array( 'cat_ids' => $category->term_id )
			);

			$class = '';
			$data_type = '';

			$title = '';
			if ( $category->description ) {
				$title = 'title="' .
					esc_attr( $category->description ) . '" ';
			}

			$html = '';
			$class .= ' ai1ec-category';
			$color_style = '';
			if ( $format === 'inline' ) {
				$taxonomy = $this->_registry->get( 'model.taxonomy' );
				$color_style = $taxonomy->get_category_color(
					$category->term_id
				);
				if ( $color_style !== '' ) {
					$color_style = 'style="color: ' . $color_style . ';" ';
				}
				$class .= '-inline';
			}

			$html .= '<a ' . $data_type . ' class="' . $class .
			' ai1ec-term-id-' . $category->term_id . '" ' .
			$title . $color_style . 'href="' . $href->generate_href() . '">';

			if ( $format === 'blocks' ) {
				$html .= $this->get_category_color_square(
					$category->term_id
				) . ' ';
			}
			else {
				$html .=
				'<i ' . $color_style . 'class="icon-folder-open"></i>';
			}

			$html .= esc_html( $category->name ) . '</a>';
			$category = $html;
		}
		return join( ' ', $categories );
	}
	
	/**
	 * Tags as HTML
	 */
	public function get_tags_html( Ai1ec_Event $event ) {
		$tags = wp_get_post_terms(
			$event->get( 'post_id' ),
			'events_tags'
		);
		foreach ( $tags as &$tag ) {
			$href = $this->_registry->get( 
				'html.element.href',
				array( 'tag_ids' => $tag->term_id )
			);
			$class = '';
			$data_type = '';
			$title = '';
			if ( $tag->description ) {
				$title = 'title="' . esc_attr( $tag->description ) . '" ';
			}
			$tag = '<a ' . $data_type . ' class="ai1ec-tag ' . $class .
			' ai1ec-term-id-' . $tag->term_id . '" ' . $title .
			'href="' . $href->generate_href() . '">' .
			'<i class="icon-tag"></i>' . esc_html( $tag->name ) . '</a>';
		}
		return join( ' ', $tags );

	}

	/**
	 * Add category form
	 *
	 * @return void
	 **/
	public function events_categories_add_form_fields() {

		$loader = $this->_registry->get( 'theme.loader' );

		// Category color
		$args  = array(
			'color'       => '',
			'style'       => '',
			'label'       => __( 'Category Color', AI1EC_PLUGIN_NAME ),
			'description' => __(
				'Events in this category will be identified by this color',
				AI1EC_PLUGIN_NAME ),
			'edit'        => false
		);

		$file   = $loader->get_file(
			'setting/categories-color-picker.twig',
			$args,
			true
		);

		echo( $file->get_content() );

		// Category image
		$args  = array(
			'image_src'    => '',
			'image_style'  => 'style="display:none"',
			'section_name' => __( 'Category Image', AI1EC_PLUGIN_NAME ),
			'label'        => __( 'Add Image', AI1EC_PLUGIN_NAME),
			'description'  => __( 'Assign an optional image to the category. Recommended size: square, minimum 400&times;400 pixels.', AI1EC_PLUGIN_NAME ),
			'edit'         => false,
		);

		$file   = $loader->get_file(
			'setting/categories-image.twig',
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
		$table_name = $db->get_table_name( 'ai1ec_event_category_meta' );
		$fields     = $db->get_results(
			$db->prepare(
				"SELECT term_color, term_image FROM {$table_name} WHERE term_id = %d ",
				$term->term_id )
		);

		$color      = $fields[0]->term_color;
		$image      = $fields[0]->term_image;

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
			'setting/categories-color-picker.twig',
			$args,
			true
		);

		echo( $file->get_content() );

		$style = 'style="display:none"';

		if( ! is_null( $image ) && ! empty( $image ) ) {
			$style = '';
		}

		// Category image
		$args  = array(
			'image_src'    => $image,
			'image_style'  => $style,
			'section_name' => __( 'Category Image', AI1EC_PLUGIN_NAME ),
			'label'        => __( 'Add Image', AI1EC_PLUGIN_NAME),
			'description'  => __( 'Assign an optional image to the category. Recommended size: square, minimum 400&times;400 pixels.', AI1EC_PLUGIN_NAME ),
			'edit'         => true,
		);

		$file   = $loader->get_file(
			'setting/categories-image.twig',
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

		$tag_image_value = '';
		if (
			isset( $_POST['ai1ec_category_image_url'] ) &&
			! empty( $_POST['ai1ec_category_image_url'] )
		) {
			$tag_image_value = $_POST['ai1ec_category_image_url'];
		}

		$table_name = $db->get_table_name( 'ai1ec_event_category_meta' );
		$term       = $db->get_row( $db->prepare(
			'SELECT term_id' .
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
					'term_image' => $tag_image_value,
				),
				array(
					'%d',
					'%s',
					'%s',
				)
			);
		} else { // term exist, update it
			if ( NULL === $tag_color_value ) {
				$tag_color_value = $term->term_color;
			}
			$db->update(
				$table_name,
				array(
					'term_color' => $tag_color_value,
					'term_image' => $tag_image_value ),
				array( 'term_id' => $term_id ),
				array( '%s', '%s' ),
				array( '%d' )
			);
		}
	}


	/**
	 * Inserts Color element at index 2 of columns array
	 *
	 * @param array $columns Array with event_category columns
	 *
	 * @return array Array with event_category columns where Color is inserted
	 * at index 2
	 */
	public function manage_event_categories_columns( $columns ) {

		wp_enqueue_media();

		$this->_registry->get( 'css.admin' )
			->process_enqueue( array(
				array( 'style', 'admin.css' )
			) );

		$ret = array_splice( $columns, 0, 3 ) + // get only first element
			// insert at index 2
			array( 'cat_color' => __( 'Color', AI1EC_PLUGIN_NAME ) ) +
			// insert at index 3
			array( 'cat_image' => __( 'Image', AI1EC_PLUGIN_NAME ) ) +
			// insert rest of elements at the back
			array_splice( $columns, 0, count( $columns ) );

		return $ret;
	}

	/**
	 * Returns the color or image of the event category
	 * that will be displayed on event category lists page in the backend
	 *
	 * @param $not_set
	 * @param $column_name
	 * @param $term_id
	 * @internal param array $columns Array with event_category columns
	 *
	 * @return array Array with event_category columns where Color is inserted
	 * at index 2
	 */
	public function manage_events_categories_custom_column(
		$not_set,
		$column_name,
		$term_id
	) {

		switch ( $column_name ) {
			case 'cat_color':
				return $this->get_category_color_square( $term_id );
			case 'cat_image':
				return $this->get_category_image_square( $term_id );
		}
	}
}