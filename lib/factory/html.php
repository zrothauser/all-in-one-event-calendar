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
	 * @param Ai1ec_Object_Registry $registry
	 */
	public function __construct( 
		Ai1ec_Object_Registry $registry
	 ) {
		$this->_registry                 = $registry;

		$this->page = $registry->get_environment( 'calendar_base_page' );
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
			'html.element.legacy.blank',
			$args['id'],
			$args['name']
		);
		$use_id = isset( $args['use_id'] );
		foreach ( $options as $term ) {
			$option_arguments = array();
			$color = false;
			$event_helper = $this->_registry->get( 'event_helper' );
			if( $args['type'] === 'category' ) {
				$color = $event_helper->get_category_color( $term->term_id );
			}
			if ( $color ) {
				$option_arguments["data-color"] = $color;
			}
			if( null !== $view_args ) {
				// create the href for ajax loading
				$href = self::create_href_helper_instance( $view_args, $args['type'] );
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
		}
	}
}