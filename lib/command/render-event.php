<?php

/**
 * The concrete command that renders the event.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Command
 */
class Ai1ec_Command_Render_Event extends Ai1ec_Command_Render_Calendar {

	/* (non-PHPdoc)
	 * @see Ai1ec_Command::is_this_to_execute()
	 */
	public function is_this_to_execute() {
		$aco = $this->_registry->get( 'acl.aco' );
		return $aco->is_our_post_type();
	}

	/* (non-PHPdoc)
	 * @see Ai1ec_Command::do_execute()
	 */
	public function do_execute() {
		throw new Ai1ec_Exception( 'Single event view is not implemented.' );
		// get the event html
		$event = $this->_registry->get( 'model.event', get_the_ID() );
		$event_page = null;
		$footer_html = '';
		if( is_single() ) {
			$event_page = $this->_registry->get( 'view.event.single' );
			$footer_html = $event_page->get_footer( $event );
		} else {
			// still to implement
		}
		$css = $this->_registry->get( 'css.frontend' )->add_link_to_html_for_frontend();
		$js = $this->_registry->get( 'controller.javascript' )->load_frontend_js( false );
		$to_return = array(
			'data'     => $event_page->get_content( $event ),
			'is_event' => true,
		);
		if ( ! empty( $footer_html ) ) {
			$to_return['footer'] = $event_page->get_footer( $event );
		}
		return $to_return;
	}
}