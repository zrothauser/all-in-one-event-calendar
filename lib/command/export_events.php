<?php
class Ai1ec_Command_Export_Events extends Ai1ec_Command {
	
	
	public function is_this_to_execute() {
		$params = $this->get_parameters();
		if ( false === $params ) {
			return false;
		}
		if ( $params['action'] === Ai1ec_Command::EXPORT_METHOD &&
 			$params['controller'] === Ai1ec_Command::EXPORT_CONTROLLER ) {
			return true;
		}
		return false;
	}


	/* (non-PHPdoc)
	 * @see Ai1ec_Command::do_execute()
	 */
	public function do_execute() {
		$this->_render_strategy = $this->_registry->get( 
			'http.response.render.strategy.ical'
		);
		$export_controller = $this->_registry->get( 'controller.import-export' );

	}

}