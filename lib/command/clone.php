<?php
class Ai1ec_Command_Clone extends Ai1ec_Command {
	
	const CLONE_AS_DRAFT_ACTION = 'duplicate_post_save_as_new_post_draft';
	
	const CLONE_ACTION          = 'duplicate_post_save_as_new_post';
	
	protected $_posts = array();

	/**
	 * The abstract method concrete command must implement.
	 *
	 * Retrieve whats needed and returns it
	 *
	 * @return array
	 */
	public function do_execute() {
		foreach ( $_REQUEST['post'] as $row ) {
			$this->duplicate_post_create_duplicate(
				get_post( $row )
			);
		}
	}

	/**
	 * Returns whether this is the command to be executed.
	 *
	 * I handle the logi of execution at this levele, which is not usual for
	 * The front controller pattern, because othe extensions need to inject
	 * logic into the resolver ( oAuth or ics export for instance )
	 * and this seems to me to be the most logical way to do this.
	 *
	 * @return boolean
	 */
	public function is_this_to_execute() {
		// duplicate all selected post by top dropdown
		if (
			isset( $_REQUEST['action'] ) &&
			$_REQUEST['action'] === 'clone' &&
			! empty( $_REQUEST['post'] )
		) {
			foreach ( $_REQUEST['post'] as $post_id ) {
				$this->_posts[] = array(
					'status' => 'new',
					'post'   => get_post( $post_id )
				);
			}
			return true;
		}
		
		// duplicate all selected post by bottom dropdown
		if (
			isset( $_REQUEST['action2'] ) &&
			$_REQUEST['action2'] === 'clone' &&
			! empty( $_REQUEST['post'] )
		) {
			foreach ( $_REQUEST['post'] as $post ) {
				$this->_posts[] = array(
					'status' => 'new',
					'post'   => $post
				);
			}
			$this->_posts = $_REQUEST['post'];
			return true;
		}

		// duplicate single post
		if (
			isset( $_REQUEST['action'] ) &&
			$_REQUEST['action'] === 'duplicate_post_save_as_new_post' &&
			! empty( $_REQUEST['post'] )
		) {
			$this->_posts[] = array(
				'status' => 'new',
				'post'   => get_post( $_REQUEST['post'] )
			);
		}
		// duplicate single post as draft
		if (
			isset( $_REQUEST['action'] ) &&
			$_REQUEST['action'] === 'duplicate_post_save_as_new_post' &&
			! empty( $_REQUEST['post'] )
		) {
			$this->_posts[] = array(
				'status' => 'draft',
				'post'   => get_post( $_REQUEST['post'] )
			);
		}
		return false;
	}
	
	/**
	 * Sets the render strategy.
	 * 
	 * @param Ai1ec_Request_Parser $request
	 */
	public function set_render_strategy( Ai1ec_Request_Parser $request ) {
		;
	}
}