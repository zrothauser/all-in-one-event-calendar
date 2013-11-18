<?php

/**
 * Event Dispatcher processing.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package	   AI1EC
 * @subpackage AI1EC.Event
 */
class Ai1ec_Event_Dispatcher {

	/**
	 * Register callback object.
	 *
	 * @param string						$hook		   Name of the event hook.
	 * @param Ai1ec_Event_Callback_Abstract $entity		   Event Callback object.
	 * @param integer						$priority	   Priorify of the event hook execution.
	 * @param integer						$accepted_args Number of accepted method parameters.
	 *
	 * @return Ai1ec_Event_Dispatcher Event Dispatcher Object.
	 */
	public function register(
		$hook,
		Ai1ec_Event_Callback_Abstract $entity,
		$priority      = 10,
		$accepted_args = 1
	) {
		$wp_method = 'add_action';
		if ( $entity instanceof Ai1ec_Event_Callback_Filter ) {
			$wp_method = 'add_filter';
		}
		$wp_method(
			$hook,
			array( $entity, 'run' ),
			$priority,
			$accepted_args
		);

		return $this;
	}

}