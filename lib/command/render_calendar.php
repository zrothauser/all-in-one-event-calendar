<?php
class Ai1ec_Command_Render_Calendar extends Ai1ec_Command {

	public function is_this_to_execute() {
		$settings = $this->_registry->get( 'settings' );
		$localization = $this->_registry->get( 'localization.helper' );
		$calendar_page_id = $settings->get( 'calendar_page_id' );
		$aco = $this->_registry->get( 'acl.aco' );
		if ( empty( $calendar_page_id ) ) {
			return false;
		}
		$page_ids_to_match = array( $calendar_page_id ) +
		$localization->get_translations_of_page(
				$calendar_page_id
		);
		foreach ( $page_ids_to_match as $page_id ) {
			if ( $aco->is_page( $page_id ) ) {
				$this->_request->set_current_page( $page_id );
				if( ! $aco->post_password_required( $page_id ) ) {
					return true;
				}
			}
		}
		return false;
	}

	public function do_execute() {
	}
}

?>