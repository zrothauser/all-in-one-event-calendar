<?php
class Ai1ec_Factory_Html {


	/**
	 * @var boolean
	 */
	protected $pretty_permalinks_enabled = false;

	/**
	 * @var string
	 */
	protected $page;

	/**
	 * @var Ai1ec_Object_Registry
	 */
	protected $_registry;
	
	/**
	 * The contructor method.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 */
	public function __construct( 
		Ai1ec_Registry_Object $registry
	 ) {
		$this->_registry                 = $registry;

		$this->page = $registry->get_environment( 'calendar_base_page' );
	}

	/**
	 * @param array $args
	 * @param string $type
	 * @return Ai1ec_Href_Helper
	 */
	public function create_href_helper_instance( array $args, $type = 'normal' ) {
		$href = new Ai1ec_Href_Helper( $args, $this->$page );
		$href->set_pretty_permalinks_enabled( $this->pretty_permalinks_enabled );
		switch ( $type ) {
			case 'category':
				$href->set_is_category( true );
				break;
			case 'tag':
				$href->set_is_tag( true );
				break;
			case 'author':
				$href->set_is_author( true );
				break;
			default:
				break;
		}
	
		return $href;
	}

	public function create_select2_multiselect( 
		array $args, 
		array $options, 
		array $view_args = null 
	) {
		// if no data is present and we are in the frontend, return a blank element.
		if( empty( $options ) && null !== $view_args ) {
			return $this->_registry->get( 'html.element.legacy.blank' );
		}
		static $cached_flips = array();
		$select2 = $this->_registry->get( 
			'html.element.legacy.select2-multiselect',
			$args['id'],
			$args['name']
		);
		$use_id = isset( $args['use_id'] );
		foreach ( $options as $term ) {
			$option_arguments = array();
			$color = false;
			$event_helper = $this->_registry->get( 'event.helper' );
			if( $args['type'] === 'category' ) {
				$color = $event_helper->get_category_color( $term->term_id );
			}
			if ( $color ) {
				$option_arguments["data-color"] = $color;
			}
			if( null !== $view_args ) {
				// create the href for ajax loading
				$href = $this->create_href_helper_instance( $view_args, $args['type'] );
				$href->set_term_id( $term->term_id );
				$option_arguments["data-href"] = $href->generate_href();
				// check if the option is selected
				$type_to_check = '';
				// first let's check the correct type
				switch ( $args['type'] ) {
					case 'category':
						$type_to_check = 'cat_ids';
						break;
					case 'tag':
						$type_to_check = 'tag_ids';
						break;
					case 'author':
						$type_to_check = 'auth_ids';
						break;
				}
				// let's flip the array. Just once for performance sake,
				// the categories doesn't change in the same request
				if( ! isset( $cached_flips[$type_to_check] ) ) {
					$cached_flips[$type_to_check] = array_flip( $view_args[$type_to_check] );
				}
				if( isset( $cached_flips[$type_to_check][$term->term_id] ) ) {
					$option_arguments["selected"] = 'selected';
				}
			}
			if ( true === $use_id ) {
				$select2->add_option( $term->name, $term->term_id, $option_arguments );
			} else {
				$select2->add_option( $term->name, $term->name, $option_arguments );
			}
		}
		$select2->set_attribute( "multiple", "multiple" );
		$select2->set_attribute( "data-placeholder", $args['placeholder'] );
		$select2->add_class( 'ai1ec-select2-multiselect-selector span12' );
		$container = Ai1ec_Helper_Factory::create_generic_html_tag( 'div' );
		if( isset( $args['type'] ) ) {
			$container->add_class( 'ai1ec-' . $args['type'] . '-filter' );
		}
		$container->add_renderable_children( $select2 );
		return $container;
	}
	/**
	 * Creates a tag selector using the Select2 widget.
	 *
	 * @return Ai1ec_Input
	 */
	public function create_select2_input( array $args ) {
		if( ! isset ( $args['name'] ) ) {
			$args['name'] = $args['id'];
		}
		// Get tags.
		$tags = get_terms(
			'events_tags',
			array(
				'orderby' => 'name',
				'hide_empty' => 0,
			)
		);
	
		// Build tags array to pass as JSON.
		$tags_json = array();
		foreach ( $tags as $term ) {
			$tags_json[] = $term->name;
		}
		$tags_json = json_encode( $tags_json );
		$tags_json = _wp_specialchars( $tags_json, 'single', 'UTF-8' );
		$input = new Ai1ec_Select2_Input();
		$input->set_id( $args['id'] );
		$input->set_name( $args['name'] );
		$input->set_attribute( "data-placeholder",
			__( 'Tags (optional)', AI1EC_PLUGIN_NAME )
		);
		$input->set_attribute( "data-ai1ec-tags", $tags_json );
		$input->add_class( 'ai1ec-tags-selector span12' );
		return $input;
	}
}