<?php

class Ai1ec_Command_Render_Event extends Ai1ec_Command {

	public function is_this_to_execute() {
		$aco = $this->_registry->get( 'acl.aco' );
		return $aco->is_our_post_type();
	}

	public function do_execute() {
	}
}

?>