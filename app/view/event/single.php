<?php
class Ai1ec_View_Event_Single extends Ai1ec_Base {
	public function get_content( Ai1ec_Event $event ) {
		$settings = $this->_registry->get( 'model.settings' );
		$rrule = $this->_registry->get( 'recurrence.rule' );
		$taxonomy = $this->_registry->get( 'view.event.taxonomy' );
		$location = $this->_registry->get( 'view.event.location' );
		$ticket = $this->_registry->get( 'view.event.ticket' );
		$content = $this->_registry->get( 'view.event.content' );
		
		$subscribe_url = AI1EC_EXPORT_URL . '&ai1ec_post_ids=' . $event->get( 'post_id' );
		$subscribe_url = str_replace( 'webcal://', 'http://', $subscribe_url );
		$event->set_runtime( 'ticket_url_label', $ticket->get_tickets_url_label( $event, false ) );
		$event->set_runtime( 'content_img_url', $content->get_content_img_url( $event ) );
		$args = array(
			'event'                   => $event,
			'recurrence'              => $rrule->rrule_to_text( $event->get( 'recurrence_rules' ) ),
			'exclude'                 => $this->_get_exclude_html( $event, $rrule ),
			'categories'              => $taxonomy->get_categories_html( $event ),
			'tags'                    => $taxonomy->get_tags_html( $event ),
			'location'                => nl2br(
				 $location->get_location( $event )
			),
			'map'                     => $location->get_map_view( $event ),
			'contact'                 => $ticket->get_contact_html( $event ),
			'back_to_calendar'        => $content->get_back_to_calendar_button_html(),
			'subscribe_url'           => $subscribe_url,
			'edit_instance_url'       => NULL,
			'edit_instance_text'      => NULL,
			'google_url'              => 'http://www.google.com/calendar/render?cid=' . urlencode( $subscribe_url ),
			'show_subscribe_buttons'  => ! $settings->get( 'turn_off_subscription_buttons' ),
		);
		if (
			! empty( $args['recurrence'] ) &&
			! $event->get( 'instance_id' ) &&
			current_user_can( 'edit_ai1ec_events' )
		) {
			$args['edit_instance_url'] = admin_url(
				'post.php?post=' . $event->post_id .
				'&action=edit&instance=' . $event->instance_id
			);
			$args['edit_instance_text'] = sprintf(
				__( 'Edit this occurrence (%s)', AI1EC_PLUGIN_NAME ),
				$event->get_short_start_date()
			);
		}
		$loader = $this->_registry->get( 'theme.loader' );
		return $loader->get_file( 'event-single.twig', $args, false )->get_content();
	}
	
	public function get_footer( $event ) {
		$loader = $this->_registry->get( 'theme.loader' );
		$args = array(
			'event' => $event,
		);
		return $loader->get_file( 'event-single-footer.twig', $args, false )->get_content();
	}
	protected function _get_exclude_html( Ai1ec_Event $event, Ai1ec_Recurrence_Rule $rrule ) {
		$excludes = array();
		$exception_rules = $event->get( 'exception_rules' );
		$exception_dates = $event->get( 'exception_dates' );
		if ( $exception_rules ) {
			$excludes[] =
				$rrule->rrule_to_text( $exception_rules );
		}
		if ( $exception_dates ) {
			$excludes[] =
				$rrule->exdate_to_text( $exception_dates );
		}
		return implode( __( ', and ', AI1EC_PLUGIN_NAME ), $excludes );
	}

}