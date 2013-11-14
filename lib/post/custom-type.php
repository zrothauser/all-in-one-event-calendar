<?php
class Ai1ec_Post_Custom_Type {

	/**
	 * @var Ai1ec_Object_Registry
	 */
	protected $_registry;
	
	/**
	 * The contructor method.
	 *
	 * @param Ai1ec_Object_Registry $registry
	 */
	function __construct( Ai1ec_Object_Registry $registry ) {
		$this->_registry = $registry;
	}
	public function register() {
		$settings = $this->_registry->get( 'model.settings' );
		
		// Create event contributor role with the same capabilities
		// as subscriber role, plus event managing capabilities
		// if we have not created it yet.
		if ( ! get_role( 'ai1ec_event_assistant' ) ) {
			$caps = get_role( 'subscriber' )->capabilities;
			$role = add_role(
				'ai1ec_event_assistant',
				'Event Contributor',
				$caps
			);
			$role->add_cap( 'publish_ai1ec_events' );
			$role->add_cap( 'edit_ai1ec_events' );
			$role->add_cap( 'delete_ai1ec_event' );
			$role->add_cap( 'read' );
			unset( $caps, $role );
		}
		
		// Add event managing capabilities to administrator, editor, author.
		// The last created capability is "manage_ai1ec_feeds", so check for
		// that one.
		$role = get_role( 'administrator' );
		if ( is_object( $role ) && ! $role->has_cap( 'manage_ai1ec_feeds' ) ) {
			$role_list = array( 'administrator', 'editor', 'author' );
			foreach ( $role_list as $role_name ) {
				$role = get_role( $role_name );
				if ( NULL === $role || ! ( $role instanceof WP_Role ) ) {
					continue;
				}
				// Read events.
				$role->add_cap( 'read_ai1ec_event' );
				// Edit events.
				$role->add_cap( 'edit_ai1ec_event' );
				$role->add_cap( 'edit_ai1ec_events' );
				$role->add_cap( 'edit_others_ai1ec_events' );
				$role->add_cap( 'edit_private_ai1ec_events' );
				$role->add_cap( 'edit_published_ai1ec_events' );
				// Delete events.
				$role->add_cap( 'delete_ai1ec_event' );
				$role->add_cap( 'delete_ai1ec_events' );
				$role->add_cap( 'delete_others_ai1ec_events' );
				$role->add_cap( 'delete_published_ai1ec_events' );
				$role->add_cap( 'delete_private_ai1ec_events' );
				// Publish events.
				$role->add_cap( 'publish_ai1ec_events' );
				// Read private events.
				$role->add_cap( 'read_private_ai1ec_events' );
				// Manage categories & tags.
				$role->add_cap( 'manage_events_categories' );
				// Manage calendar feeds.
				$role->add_cap( 'manage_ai1ec_feeds' );
		
				if ( 'administrator' === $role_name ) {
					// Change calendar themes & manage calendar options.
					$role->add_cap( 'switch_ai1ec_themes' );
					$role->add_cap( 'manage_ai1ec_options' );
				}
			}
		}
		
		// ===============================
		// = labels for custom post type =
		// ===============================
		$labels = array(
			'name'               => _x( 'Events', 'Custom post type name', AI1EC_PLUGIN_NAME ),
			'singular_name'      => _x( 'Event', 'Custom post type name (singular)', AI1EC_PLUGIN_NAME ),
			'add_new'            => __( 'Add New', AI1EC_PLUGIN_NAME ),
			'add_new_item'       => __( 'Add New Event', AI1EC_PLUGIN_NAME ),
			'edit_item'          => __( 'Edit Event', AI1EC_PLUGIN_NAME ),
			'new_item'           => __( 'New Event', AI1EC_PLUGIN_NAME ),
			'view_item'          => __( 'View Event', AI1EC_PLUGIN_NAME ),
			'search_items'       => __( 'Search Events', AI1EC_PLUGIN_NAME ),
			'not_found'          => __( 'No Events found', AI1EC_PLUGIN_NAME ),
			'not_found_in_trash' => __( 'No Events found in Trash', AI1EC_PLUGIN_NAME ),
			'parent_item_colon'  => __( 'Parent Event', AI1EC_PLUGIN_NAME ),
			'menu_name'          => __( 'Events', AI1EC_PLUGIN_NAME ),
			'all_items'          => $this->get_all_items_name(),
		);
		
		
		// ================================
		// = support for custom post type =
		// ================================
		$supports = array( 'title', 'editor', 'comments', 'custom-fields', 'thumbnail' );
		
		// =============================
		// = args for custom post type =
		// =============================
		$page_base = false;
		if ( $settings->get( 'calendar_page_id' ) ) {
			$page_base = get_page_uri( $settings->calendar_page_id );
		}
		
		$rewrite     = array( 'slug' => __( 'ai1ec_event', AI1EC_PLUGIN_NAME ) );
		$has_archive = true;
		if (
			$settings->get( 'calendar_base_url_for_permalinks' ) &&
			$page_base
		) {
			$rewrite     =  array( 'slug' => $page_base );
			$has_archive = AI1EC_ALTERNATIVE_ARCHIVE_URL;
		}
		$args = array(
			'labels'              => $labels,
			'public'              => true,
			'publicly_queryable'  => true,
			'show_ui'             => true,
			'show_in_menu'        => true,
			'query_var'           => true,
			'rewrite'             => $rewrite,
			'capability_type'     => array( 'ai1ec_event', 'ai1ec_events' ),
			'capabilities'        => array(
				'read_post'               => 'read_ai1ec_event',
				'edit_post'               => 'edit_ai1ec_event',
				'edit_posts'              => 'edit_ai1ec_events',
				'edit_others_posts'       => 'edit_others_ai1ec_events',
				'edit_private_posts'      => 'edit_private_ai1ec_events',
				'edit_published_posts'    => 'edit_published_ai1ec_events',
				'delete_post'             => 'delete_ai1ec_event',
				'delete_posts'            => 'delete_ai1ec_events',
				'delete_others_posts'     => 'delete_others_ai1ec_events',
				'delete_published_posts'  => 'delete_published_ai1ec_events',
				'delete_private_posts'    => 'delete_private_ai1ec_events',
				'publish_posts'           => 'publish_ai1ec_events',
				'read_private_posts'      => 'read_private_ai1ec_events' ),
			'has_archive'         => $has_archive,
			'hierarchical'        => false,
			'menu_position'       => 5,
			'supports'            => $supports,
			'exclude_from_search' => $settings->exclude_from_search,
		);
		
		// ========================================
		// = labels for event categories taxonomy =
		// ========================================
		$events_categories_labels = array(
			'name'          => _x( 'Event Categories', 'Event categories taxonomy', AI1EC_PLUGIN_NAME ),
			'singular_name' => _x( 'Event Category', 'Event categories taxonomy (singular)', AI1EC_PLUGIN_NAME )
		);
		
		// ==================================
		// = labels for event tags taxonomy =
		// ==================================
		$events_tags_labels = array(
			'name'          => _x( 'Event Tags', 'Event tags taxonomy', AI1EC_PLUGIN_NAME ),
			'singular_name' => _x( 'Event Tag', 'Event tags taxonomy (singular)', AI1EC_PLUGIN_NAME )
		);
		
		// ==================================
		// = labels for event feeds taxonomy =
		// ==================================
		$events_feeds_labels = array(
			'name'          => _x( 'Event Feeds', 'Event feeds taxonomy', AI1EC_PLUGIN_NAME ),
			'singular_name' => _x( 'Event Feed', 'Event feed taxonomy (singular)', AI1EC_PLUGIN_NAME )
		);
		
		// ======================================
		// = args for event categories taxonomy =
		// ======================================
		$events_categories_args = array(
			'labels'       => $events_categories_labels,
			'hierarchical' => true,
			'rewrite'      => array( 'slug' => 'events_categories' ),
			'capabilities' => array(
				'manage_terms' => 'manage_events_categories',
				'edit_terms'   => 'manage_events_categories',
				'delete_terms' => 'manage_events_categories',
				'assign_terms' => 'edit_ai1ec_events'
			)
		);
		
		// ================================
		// = args for event tags taxonomy =
		// ================================
		$events_tags_args = array(
			'labels'       => $events_tags_labels,
			'hierarchical' => false,
			'rewrite'      => array( 'slug' => 'events_tags' ),
			'capabilities' => array(
				'manage_terms' => 'manage_events_categories',
				'edit_terms'   => 'manage_events_categories',
				'delete_terms' => 'manage_events_categories',
				'assign_terms' => 'edit_ai1ec_events'
			)
		);
		
		// ================================
		// = args for event feeds taxonomy =
		// ================================
		$events_feeds_args = array(
			'labels'       => $events_feeds_labels,
			'hierarchical' => false,
			'rewrite'      => array( 'slug' => 'events_feeds' ),
			'capabilities' => array(
				'manage_terms' => 'manage_events_categories',
				'edit_terms'   => 'manage_events_categories',
				'delete_terms' => 'manage_events_categories',
				'assign_terms' => 'edit_ai1ec_events'
			),
			'public'        => false // don't show taxonomy in admin UI
		);
		
		// ======================================
		// = register event categories taxonomy =
		// ======================================
		register_taxonomy( 
			'events_categories', 
			array( AI1EC_POST_TYPE ), 
			$events_categories_args 
		);
		
		// ================================
		// = register event tags taxonomy =
		// ================================
		register_taxonomy( 
			'events_tags', 
			array( AI1EC_POST_TYPE ), 
			$events_tags_args 
		);
		
		// ================================
		// = register event tags taxonomy =
		// ================================
		register_taxonomy( 
			'events_feeds', 
			array( AI1EC_POST_TYPE ), 
			$events_feeds_args
		);
		
		// ========================================
		// = register custom post type for events =
		// ========================================
		register_post_type( AI1EC_POST_TYPE, $args );
	}
}