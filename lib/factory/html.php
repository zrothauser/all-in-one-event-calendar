<?php

/**
 * A factory class for html elements
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Factory
 */
class Ai1ec_Factory_Html extends Ai1ec_Base {

	/**
	 * @var boolean
	 */
	protected $pretty_permalinks_enabled = false;

	/**
	 * @var string
	 */
	protected $page;

	/**
	 * The contructor method.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 */
	public function __construct(
		Ai1ec_Registry_Object $registry
	 ) {
		parent::__construct( $registry );
		$app = $registry->get( 'bootstrap.registry.application' );

		$this->page = $app->get( 'calendar_base_page' );
		$this->pretty_permalinks_enabled = $app->get( 'pretty_permalinks' );
	}

	/**
	 * Creates an instance of the class which generates href for links.
	 *
	 * @param array $args
	 * @param string $type
	 *
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

	/**
	 * Creates a select2 Multiselect.
	 *
	 * @param array $args      The arguments for the select.
	 * @param array $options   The options of the select
	 * @param array $view_args The args used in the front end.
	 *
	 * @return Ai1ec_File_Twig
	 */
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

		$use_id = isset( $args['use_id'] );
		$options_to_add = array();
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
				$options_to_add[] = array(
					'text'  => $term->name,
					'value' => $term->term_id,
					'args'  => $option_arguments,
				);
			} else {
				$options_to_add[] = array(
					'text'  => $term->name,
					'value' => $term->name,
					'args'  => $option_arguments,
				);
			}
		}
		$select2_args = array(
			'multiple' => 'multiple',
			'data-placeholder' => $args['placeholder'],
			'class' => 'ai1ec-select2-multiselect-selector span12'
		);
		$container_class = false;
		if( isset( $args['type'] ) ) {
			$container_class = 'ai1ec-' . $args['type'] . '-filter';
		}
		$loader =$this->_registry->get( 'theme.loader' );
		$select2 = $loader->get_file(
			'select2_multiselect.twig',
			array(
				'name'            => $args['name'],
				'id'              => $args['id'],
				'container_class' => $container_class,
				'select2_args'    => $select2_args,
				'options'         => $options_to_add,
			),
			true
		);
		return $select2;
	}


	/**
	 * Creates a select2 input.
	 *
	 * @param array $args The arguments of the input.
	 *
	 * @return Ai1ec_File_Twig
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
		$loader =$this->_registry->get( 'theme.loader' );
		$select2_args = array(
			'data-placeholder' => __( 'Tags (optional)', AI1EC_PLUGIN_NAME ),
			'class'            => 'ai1ec-tags-selector span12',
			'data-ai1ec-tags'  => $tags_json
		);
		$select2 = $loader->get_file(
			'select2_input.twig',
			array(
				'name'            => $args['name'],
				'id'              => $args['id'],
				'select2_args'    => $select2_args,

			),
			true
		);
		return $select2;
	}
}