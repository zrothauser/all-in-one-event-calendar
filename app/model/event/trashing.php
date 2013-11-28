<?php

/**
 * Handles trash/delete operations.
 *
 * NOTICE: only operations on events entries themselve is handled.
 * If plugins need some extra handling - they must bind to appropriate
 * actions on their will.
 */
class Ai1ec_Event_Trashing extends Ai1ec_Base {

	public function remove_childs( $post_id, $full_remove = false ) {
		// to be filled when hierarchy is introduced
		return true;
	}

	/**
	 * Handle post (event) trashing.
	 *
	 * @wp_hook trash_post
	 *
	 * @param int $post_id ID of post, which was trashed.
	 *
	 * @return bool Success.
	 */
	public function trash( $post_id ) {
		return $this->remove_childs( $post_id, false ) &&
		$this->delete_cache( $post_id );
	}

	/**
	 * Handle post (event) untrashing.
	 *
	 * @wp_hook untrash_post
	 *
	 * @param int $post_id ID of post, which was untrashed.
	 *
	 * @return bool Success.
	 */
	public function untrash( $post_id ) {
		// to be filled when hierarchy is introduced
		return true;
	}

	/**
	 * Handle post (event) deletion.
	 *
	 * Executed before post is deleted, but after meta is removed.
	 *
	 * @wp_hook delete_post
	 *
	 * @param int $post_id ID of post, which was trashed.
	 *
	 * @return bool Success.
	 */
	public function delete( $post_id ) {
		$post_id = (int)$post_id;
		$where   = array( 'post_id' => (int)$post_id );
		$format  = array( '%d' );
		$dbi     = $this->_registry->get( 'dbi.dbi' );
		$success = $this->remove_childs( $post_id, true );
		$success &= $dbi->delete( 'ai1ec_events',          $where, $format );
		$success &= $dbi->delete( 'ai1ec_event_instances', $where, $format );
		unset( $where, $dbi );
		return $success && $this->delete_cache( $post_id );
	}

	/**
	 * Remove the cache for a specific event
	 *
	 * @param $event_id
	 * @internal param $event_id
	 *
	 * @return boolean
	 */
	public function delete_cache( $event_id ) {
		// to be added with cache introduction
		return true;
	}

	/**
	 * Callback on post untrashing
	 *
	 * @param int $post_id ID of post being untrashed
	 *
	 * @return void Method does not return
	 */
	public function untrashed_post( $post_id ) {

		try {
			$ai1ec_event = $this->_registry->get( 'model.event', $post_id );
			if (
				isset( $ai1ec_event->post ) &&
				! empty( $ai1ec_event->recurrence_rules )
			) { // untrash child event
				$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
				$children = $ai1ec_events_helper
					->get_child_event_objects( $ai1ec_event->post_id, true );
				foreach ( $children as $child ) {
					wp_untrash_post( $child->post_id );
				}
			}
		} catch ( Ai1ec_Event_Not_Found $exception ) {
			// ignore - not an event
		}
	}

	/**
	 * Callback on post trashing
	 *
	 * @param int $post_id ID of post being trashed
	 *
	 * @return void Method does not return
	 */
	public function trashed_post( $post_id ) {
		try {
			$ai1ec_event = $this->_registry->get( 'model.event', $post_id );
			if (
				isset( $ai1ec_event->post ) &&
				! empty( $ai1ec_event->recurrence_rules )
			) { // trash child event
				$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
				$children = $ai1ec_events_helper
					->get_child_event_objects( $ai1ec_event->post_id );
				foreach ( $children as $child ) {
					wp_trash_post( $child->post_id );
				}
			}
		} catch ( Ai1ec_Event_Not_Found $exception ) {
			// ignore - not an event
		}
	}

	/**
	 * delete_hook function
	 *
	 * If the deleted post is an event
	 * then all entries that match the post_id are
	 * removed from ai1ec_events and ai1ec_event_instances tables
	 *
	 * @param int $pid Post ID
	 *
	 * @return bool | int
	 **/
	function delete_post( $pid ) {
		$ai1ec_importer_plugin_helper = $this->
			_registry->get( 'Ai1ec_Importer_Plugin_Helper' );
		$dbi = $this->_registry->get( 'dbi' );
		$pid = (int)$pid;
		$sql = '
			SELECT
				ID
			FROM
				' . $dbi->get_table_name( 'posts' ) . '
			WHERE
				ID        = ' . $pid . ' AND
				post_type = \'' . AI1EC_POST_TYPE . '\'';

		// is this post an event?
		if ( $dbi->get_var( $sql ) ) {
			try {
				// clean pages cache
				$this->_registry->get( 'events.list.helper' )
					->clean_post_cache( $pid );

				// We need to pass an event object to the importer plugins
				// to clean up.
				$ai1ec_event = $this->_registry->get( 'model.event', $pid );
				if (
					isset( $ai1ec_event->post ) &&
					! empty( $ai1ec_event->recurrence_rules )
				) { // delete child event
					$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
					$children = $ai1ec_events_helper->get_child_event_objects(
						$ai1ec_event->post_id,
						true
					);
					foreach ( $children as $child ) {
						wp_delete_post( $child->post_id, true );
					}
				}
				$ai1ec_importer_plugin_helper->handle_post_event(
					$ai1ec_event,
					'delete'
				);
				$table_name = $dbi->prefix . 'ai1ec_events';
				$sql = '
					DELETE FROM
						' . $table_name . '
					WHERE
						post_id = ' . $pid;
				// delete from ai1ec_events
				$dbi->query( $sql );

				return $this->delete( $pid );

			} catch ( Ai1ec_Event_Not_Found $exception ) {
				/**
				 * Possible reason, why event `delete` is triggered, albeit
				 * no details are found corresponding to it - the WordPress
				 * is not transactional - it uses no means, to ensure, that
				 * everything is deleted once and forever and thus it could
				 * happen so, that partial records are left in DB.
				 */
				return true; // already deleted
			}
		}
		return true;
	}

}