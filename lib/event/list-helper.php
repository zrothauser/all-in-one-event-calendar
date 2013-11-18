<?php

/**
 *  Events list management helper
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage Ai1EC.Events
 */

class Ai1ec_Events_List_Helper
{

	/**
	 * @var Ai1ec_Registry_Object The Object registry.
	 */
	private $_registry;

	/**
	 * @var Ai1ec_Dbi database access wrapper
	 */
	protected $_dbi             = NULL;

	/**
	 * @var bool Purges events cache at the end of request, when set to true
	 */
	protected $_force_purge     = false;

	/**
	 * Mark all events cache for purging
	 *
	 * @return Ai1ec_Events_List_Helper Instance of self for chaining
	 */
	public function purge() {
		$this->_force_purge = true;
		return $this;
	}

	/**
	 * clean_post_cache method
	 *
	 * Clean cache entries for given post
	 *
	 * @param int $post_id ID of post to delete cache entries for
	 *
	 * @return Ai1ec_Events_List_Helper Instance of self for chaining
	 */
	public function clean_post_cache( $post_id ) {
		// @TODO: perform cache clean-up based on post_id
		return $this->purge();
	}

	/**
	 * Hook on `post_save` action to mark cache purge need
	 *
	 * @param int     $post_id ID of post edited
	 * @param WP_Post $post    Instance of edited post object
	 *
	 * @return void Method does not return
	 */
	public function handle_post_save_purge( $post_id, $post ) {
		if (
			isset( $post->post_type ) &&
			AI1EC_POST_TYPE === $post->post_type
		) {
			$this->clean_post_cache( $post_id );
		}
	}

	/**
	 * delete_event_cache method
	 *
	 * Delete instances cache for given event
	 *
	 * @param int $post_id     ID of post to delete instances entries for
	 * @param int $instance_id ID of instance to delete, if any [optional=NULL]
	 *
	 * @return bool Success
	 */
	public function delete_event_cache( $post_id, $instance_id = NULL) {
		$this->_clean_instance_table( $post_id, $instance_id );
		return $this->clean_post_cache( $post_id );
	}

	/**
	 * delete_event_instance_cache
	 *
	 * Delete single event instance cache for given event
	 *
	 * @param int $post_id     ID of post to delete instances entries for
	 * @param int $instance_id ID of instance to delete
	 *
	 * @return bool Success
	 */
	public function delete_event_instance_cache( $post_id, $instance_id ) {
		return $this->delete_event_cache( $post_id, $instance_id );
	}

	/**
	 * Destructor
	 *
	 * Process steps, that needs to be processed at the very end of request
	 *
	 * @return void Destructor does not return
	 */
	public function __destruct() {
		if ( $this->_force_purge ) {
			$this->_purge();
		}
	}

	/**
	 * Clean entire cache - get rid of all events cache entries
	 *
	 * @return int Count of cache entries deleted
	 */
	protected function _purge() {
		// purge entire cache
		$pattern = 'ai1ec-response';
		$cache   = Ai1ec_Strategies_Factory::create_blob_persistence_context(
			$pattern,
			AI1EC_CACHE_PATH
		);
		return $cache->delete_matching_entries_from_persistence( $pattern );
	}

	/**
	 * _clean_instance_table method
	 *
	 * Clean event instances table for given event
	 *
	 * @param int $post_id     ID of post to delete instances entries for
	 * @param int $instance_id ID of instance to delete, if any [optional=NULL]
	 *
	 * @return bool Success
	 */
	protected function _clean_instance_table( $post_id, $instance_id = NULL ) {
		$table_name = $this->_dbi->get_table_name( 'ai1ec_event_instances' );
		$query      = 'DELETE FROM `' . $table_name .
			'` WHERE `post_id` = %d';
		if ( NULL !== $instance_id ) {
			$query .= ' AND `id` = %d';
		}
		$statement  = $this->_dbi->prepare( $query, $post_id, $instance_id );
		return $this->_dbi->query( $statement );
	}

	/**
	 * Constructor
	 *
	 * Initiate helper, bind `$wpdb` to local `$this->_db` and create a named
	 * hook 'ai1ec_purge_events_cache', which allows to purge all event cache
	 * entries, not knowing internal system representation.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 */
	protected function __construct( Ai1ec_Registry_Object $registry ) {
		$this->_registry    = $registry;
		$this->_force_purge = false;
	}

}
