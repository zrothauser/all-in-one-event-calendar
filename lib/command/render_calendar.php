<?php
/**
 * The concrete command that renders the calendar.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Command
 */
class Ai1ec_Command_Render_Calendar extends Ai1ec_Command {

	/* (non-PHPdoc)
	 * @see Ai1ec_Command::is_this_to_execute()
	 */
	public function is_this_to_execute() {
		$settings          = $this->_registry->get( 'settings' );
		$calendar_page_id  = $settings->get( 'calendar_page_id' );
		if ( empty( $calendar_page_id ) ) {
			return false;
		}
		$localization      = $this->_registry->get( 'localization.helper' );
		$aco               = $this->_registry->get( 'acl.aco' );
		$page_ids_to_match = array( $calendar_page_id ) +
		$localization->get_translations_of_page(
				$calendar_page_id
		);
		foreach ( $page_ids_to_match as $page_id ) {
			if ( $aco->is_page( $page_id ) ) {
				$this->_request->set_current_page( $page_id );
				if ( ! $aco->post_password_required( $page_id ) ) {
					return true;
				}
			}
		}
		return false;
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_Command::do_execute()
	 */
	public function do_execute() {
		// get the calendar html
	}
}