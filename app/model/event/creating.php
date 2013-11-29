<?php

/**
 * Handles create/update operations.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Model
 */
class Ai1ec_Event_Creating extends Ai1ec_Base {

	/**
	 * save_post function
	 *
	 * Saves meta post data
	 *
	 * @wp_hook save_post
	 *
	 * @param  int    $post_id Post ID
	 * @param  object $post    Post object
	 *
	 * @return object|null Saved Ai1ec_Event object if successful or null.
	 */
	function save_post( $post_id, $post ) {
		// verify this came from the our screen and with proper authorization,
		// because save_post can be triggered at other times
		if (
			! isset( $_POST[AI1EC_POST_TYPE] ) ||
			! wp_verify_nonce( $_POST[AI1EC_POST_TYPE], 'ai1ec' )
		) {
			return null;
		}

		if (
			isset( $post->post_status ) &&
			'auto-draft' === $post->post_status
		) {
			return null;
		}

		// verify if this is not inline-editing
		if (
			isset( $_REQUEST['action'] ) &&
			'inline-save' === $_REQUEST['action']
		) {
			return null;
		}

		// verify that the post_type is that of an event
		if ( ! $this->_registry->get( 'acl.aco' )->is_our_post_type( $post ) ) {
			return null;
		}

		$ai1ec_events_helper          = $this->_registry->get( 'event.helper' );

		/**
		 * =====================================================================
		 *
		 * CHANGE CODE BELLOW TO HAVE FOLLOWING PROPERTIES:
		 * - be initializiable from model;
		 * - have sane defaults;
		 * - avoid that cluster of isset and ternary operator.
		 *
		 * =====================================================================
		 */

		// LABEL:magicquotes
		// remove WordPress `magical` slashes - we work around it ourselves
		$_POST = stripslashes_deep( $_POST );

		$all_day          = isset( $_POST['ai1ec_all_day_event'] )    ? 1                                             : 0;
		$instant_event    = isset( $_POST['ai1ec_instant_event'] )    ? 1                                             : 0;
		$start_time       = isset( $_POST['ai1ec_start_time'] )       ? $_POST['ai1ec_start_time']                    : '';
		$end_time         = isset( $_POST['ai1ec_end_time'] )         ? $_POST['ai1ec_end_time']                      : '';
		$venue            = isset( $_POST['ai1ec_venue'] )            ? $_POST['ai1ec_venue']                         : '';
		$address          = isset( $_POST['ai1ec_address'] )          ? $_POST['ai1ec_address']                       : '';
		$city             = isset( $_POST['ai1ec_city'] )             ? $_POST['ai1ec_city']                          : '';
		$province         = isset( $_POST['ai1ec_province'] )         ? $_POST['ai1ec_province']                      : '';
		$postal_code      = isset( $_POST['ai1ec_postal_code'] )      ? $_POST['ai1ec_postal_code']                   : '';
		$country          = isset( $_POST['ai1ec_country'] )          ? $_POST['ai1ec_country']                       : '';
		$google_map       = isset( $_POST['ai1ec_google_map'] )       ? 1                                             : 0;
		$cost             = isset( $_POST['ai1ec_cost'] )             ? $_POST['ai1ec_cost']                          : '';
		$is_free          = isset( $_POST['ai1ec_is_free'] )          ? (bool)$_POST['ai1ec_is_free']                 : false;
		$ticket_url       = isset( $_POST['ai1ec_ticket_url'] )       ? $_POST['ai1ec_ticket_url']                    : '';
		$contact_name     = isset( $_POST['ai1ec_contact_name'] )     ? $_POST['ai1ec_contact_name']                  : '';
		$contact_phone    = isset( $_POST['ai1ec_contact_phone'] )    ? $_POST['ai1ec_contact_phone']                 : '';
		$contact_email    = isset( $_POST['ai1ec_contact_email'] )    ? $_POST['ai1ec_contact_email']                 : '';
		$contact_url      = isset( $_POST['ai1ec_contact_url'] )      ? $_POST['ai1ec_contact_url']                   : '';
		$show_coordinates = isset( $_POST['ai1ec_input_coordinates'] )? 1                                             : 0;
		$longitude        = isset( $_POST['ai1ec_longitude'] )        ? $_POST['ai1ec_longitude']                     : '';
		$latitude         = isset( $_POST['ai1ec_latitude'] )         ? $_POST['ai1ec_latitude']                      : '';

		$rrule  = NULL;
		$exrule = NULL;
		$exdate = NULL;

		// if rrule is set, convert it from local to UTC time
		if (
			isset( $_POST['ai1ec_repeat'] ) &&
			! empty( $_POST['ai1ec_repeat'] )
		) {
			$rrule = $ai1ec_events_helper->ics_rule_to_gmt(
				$_POST['ai1ec_rrule']
			);
		}

		// if exrule is set, convert it from local to UTC time
		if (
			isset( $_POST['ai1ec_exclude'] ) &&
			! empty( $_POST['ai1ec_exclude'] ) &&
			NULL !== $rrule // no point for exclusion, if repetition is not set
		) {
			$exrule = $this->_registry->get( 'recurrence.rule' )->merge_exrule(
				$_POST['ai1ec_exrule'],
				$_POST['ai1ec_rrule']
			);
			$exrule = $ai1ec_events_helper->ics_rule_to_gmt( $exrule );
		}

		// if exdate is set, convert it from local to UTC time
		if (
			isset( $_POST['ai1ec_exdate'] ) &&
			! empty( $_POST['ai1ec_exdate'] )
		) {
			$exdate = $ai1ec_events_helper->exception_dates_to_gmt(
				$_POST['ai1ec_exdate']
			);
		}

		$is_new = false;
		$event  = null;
		try {
			$event =  $this->_registry->get(
				'model.event',
				$post_id ? $post_id : null
			);
		} catch ( Ai1ec_Event_Not_Found $excpt ) {
			// Post exists, but event data hasn't been saved yet. Create new event
			// object.
			$is_new         = true;
			$event          =  $this->_registry->get( 'model.event' );
			$event->post_id = $post_id;
		}
		// If the events is marked as instant, make it last 30 minutes
		if ( $instant_event ) {
			$end_time = $start_time + 1800;
		}

		$event->set_start( $start_time );
		$event->set_end(   $end_time );
		$event->allday              = $all_day;
		$event->instant_event       = $instant_event;
		$event->venue               = $venue;
		$event->address             = $address;
		$event->city                = $city;
		$event->province            = $province;
		$event->postal_code         = $postal_code;
		$event->country             = $country;
		$event->show_map            = $google_map;
		$event->cost                = $cost;
		$event->is_free             = $is_free;
		$event->ticket_url          = $ticket_url;
		$event->contact_name        = $contact_name;
		$event->contact_phone       = $contact_phone;
		$event->contact_email       = $contact_email;
		$event->contact_url         = $contact_url;
		$event->recurrence_rules    = $rrule;
		$event->exception_rules     = $exrule;
		$event->exception_dates     = $exdate;
		$event->show_coordinates    = $show_coordinates;
		$event->longitude           = trim( $longitude ) !== '' ? (float) $longitude : NULL;
		$event->latitude            = trim( $latitude ) !== '' ? (float) $latitude : NULL;

		$event->save( ! $is_new );

		$ai1ec_events_helper->delete_event_cache( $post_id );
		$ai1ec_events_helper->cache_event( $event );
		// LABEL:magicquotes
		// restore `magic` WordPress quotes to maintain compatibility
		$_POST = add_magic_quotes( $_POST );
		return $event;
	}

	/**
	 * Create a copy of an event.
	 *
	 * Copy is created calling {@uses wp_insert_post} function.
	 * Using 'post_parent' to add hierarchy.
	 *
	 * NOTICE: it depends on `$_POST` to be populated correctly.
	 *
	 * @return int|bool New post ID or false on failure.
	 */
	public function create_duplicate_post( ) {
		if ( ! isset( $_POST['post_ID'] ) ) {
			return false;
		}

		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );

		$clean_fields        = array(
			'ai1ec_repeat'      => null,
			'ai1ec_rrule'       => '',
			'ai1ec_exrule'      => '',
			'ai1ec_exdate'      => '',
			'post_ID'           => null,
			'post_name'         => null,
			'ai1ec_instance_id' => null,
		);
		$old_post_id = $_POST['post_ID'];
		$instance_id = $_POST['ai1ec_instance_id'];
		foreach ( $clean_fields as $field => $to_value ) {
			if ( null === $to_value ) {
				unset( $_POST[$field] );
			} else {
				$_POST[$field] = $to_value;
			}
		}
		$_POST                = _wp_translate_postdata( false, $_POST );
		$_POST['post_parent'] = $old_post_id;
		$post_id              = wp_insert_post( $_POST );
		$ai1ec_events_helper->event_parent(
			$post_id,
			$old_post_id,
			$instance_id
		);
		return $post_id;
	}

}