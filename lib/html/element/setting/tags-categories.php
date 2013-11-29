<?php
class Ai1ec_Html_Setting_Tags_Categories extends Ai1ec_Html_Element_Settings {
	public function render( $output = '' ) {
		$tags = array();
		$categories = array();
		foreach ( array( 'tags', 'categories' ) as $type ) {
			$options = array(
				'taxonomy'     => 'events_' . $type,
				'hierarchical' => true,
				'hide_empty'   => false,
			);
			${$type} = get_categories( $options );
		}
		if ( empty ( $tags ) && empty ( $categories ) ) {
			return '';
		}
		$args = array(
			'label' => $this->_args['renderer']['label'],
			'help' => $this->_args['renderer']['help'],
		);
		$loader = $this->_registry->get( 'theme.loader' );
		if ( ! empty ( $tags ) ) {
			$args['tags'] = $this->_get_select_for_terms(
				'tags',
				Ai1ec_I18n::__( 'Tags' ),
				$tags
			);
		}
		$categories_html = '';
		if ( ! empty ( $categories ) ) {
			$args['categories'] = $this->_get_select_for_terms(
				'categories',
				Ai1ec_I18n::__( 'Categories' ),
				$categories
			);
		}
		return $loader->get_file( 'setting/tags-categories.twig', $args, true )
						->get_content();
	}

	
	protected function _get_select_for_terms( $type, $label, array $terms ) {
		$loader = $this->_registry->get( 'theme.loader' );
		$options = array();
		foreach ( $terms as $term ) {
			$option = array(
				'value' => $term->term_id,
				'text'  => $term->name,
			);
		}
		if ( in_array( $term->term_id , $this->_args['value'][$type]) ) {
			$option['args'] = array(
				'selected' => 'selected',
			);
		}
		$options[] = $option;
		$args = array(
			'id' => 'default_' . $type,
			'name' => 'default_' . $type . '[]',
			'label' => $label,
			'options' => $options,
			'attributes' => array(
				'class' => 'inputwidth',
				'multiple' => 'multiple',
			),
		);
		return $loader->get_file( 'setting/select.twig', $args, true )
						->get_content();
	}
}