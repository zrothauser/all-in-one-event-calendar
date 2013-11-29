<?php

/**
 * Class Ai1ec_View_Add_New_Event
 */
class Ai1ec_View_Add_New_Event extends Ai1ec_Base {

	/**
	 * Add Event Details meta box to the Add/Edit Event screen in the dashboard.
	 *
	 * @return void
	 */
	public function meta_box_view() {

		$ai1ec_events_helper  = $this->_registry->get( 'event.helper' );
		$theme_loader         = $this->_registry->get( 'theme.loader' );
		$empty_event          = $this->_registry->get( 'model.event' );
		$post_helper          = $this->_registry->get( 'post.helper' );

		// ==================
		// = Default values =
		// ==================
		// ATTENTION - When adding new fields to the event remember that you must
		// also set up the duplicate-controller.
		// TODO: Fix this duplication.
		$all_day_event    = '';
		$instant_event    = '';
		$start            = $this->_registry->get( 'date.time' );
		$end              = $this->_registry->get( 'date.time', '+1 hour' );
		$show_map         = false;
		$google_map       = '';
		$venue            = '';
		$country          = '';
		$address          = '';
		$city             = '';
		$province         = '';
		$postal_code      = '';
		$contact_name     = '';
		$contact_phone    = '';
		$contact_email    = '';
		$contact_url      = '';
		$cost             = '';
		$is_free          = 'checked="checked"';
		$rrule            = '';
		$rrule_text       = '';
		$repeating_event  = false;
		$exrule           = '';
		$exrule_text      = '';
		$exclude_event    = false;
		$exdate           = '';
		$show_coordinates = false;
		$longitude        = '';
		$latitude         = '';
		$coordinates      = '';
		$ticket_url       = '';

		$instance_id = false;
		if ( isset( $_REQUEST['instance'] ) ) {
			$instance_id = absint( $_REQUEST['instance'] );
		}
		$parent_event_id = (int)$ai1ec_events_helper->event_parent(
			$post_helper->get_post_object_value( 'ID' )
		);
		if ( empty( $parent_event_id ) ) {
			$parent_event_id = null;
		}
		if ( $instance_id ) {
			add_filter(
				'print_scripts_array',
				array( $this, 'disable_autosave' )
			);
		}

		try {
			// on some php version, nested try catch blocks fail and the exception would never be caught.
			// this is why we use this approach.
			$excpt = null;
			$event = null;
			try {
				$event = $this->_registry->get(
					'model.event',
					$parent_event_id,
					$instance_id
				);
			} catch ( Ai1ec_Event_Not_Found $excpt ) {
				$ai1ec_localization_helper = $this->_registry
					->get( 'p28n.wpml' );
				$translatable_id = $ai1ec_localization_helper
					->get_translatable_id();
				if ( false !== $translatable_id ) {
					$event = $this->_registry->get(
						'model.event',
						$translatable_id,
						$instance_id
					);
				}
			}
			if ( null !== $excpt ) {
				throw $excpt;
			}

			// Existing event was found. Initialize form values with values from
			// event object.
			$all_day_event    = $event->allday ? 'checked' : '';
			$instant_event    = $event->instant_event ? 'checked' : '';

			$start            = $event->start;
			$end 	          = $event->end;

			$multi_day        = $event->get_multiday();

			$show_map         = $event->show_map;
			$google_map       = $show_map ? 'checked="checked"' : '';

			$show_coordinates = $event->show_coordinates;
			$coordinates      = $show_coordinates ? 'checked="checked"' : '';
			$longitude        = $event->longitude !== NULL ? floatval( $event->longitude ) : '';
			$latitude         = $event->latitude !== NULL ?  floatval( $event->latitude ) : '';
			// There is a known bug in Wordpress (https://core.trac.wordpress.org/ticket/15158) that saves 0 to the DB instead of null.
			// We handle a special case here to avoid having the fields with a value of 0 when the user never inputted any coordinates
			if ( ! $show_coordinates ) {
				$longitude = '';
				$latitude = '';
			}

			$venue            = $event->venue;
			$country          = $event->country;
			$address          = $event->address;
			$city             = $event->city;
			$province         = $event->province;
			$postal_code      = $event->postal_code;
			$contact_name     = $event->contact_name;
			$contact_phone    = $event->contact_phone;
			$contact_email    = $event->contact_email;
			$contact_url      = $event->contact_url;
			$cost             = $event->cost;
			$ticket_url       = $event->ticket_url;
			$rrule            = empty( $event->recurrence_rules ) ? '' : $ai1ec_events_helper->ics_rule_to_local( $event->recurrence_rules );
			$exrule           = empty( $event->exception_rules )  ? '' : $ai1ec_events_helper->ics_rule_to_local( $event->exception_rules );
			$exdate           = empty( $event->exception_dates )  ? '' :  $ai1ec_events_helper->exception_dates_to_local( $event->exception_dates );
			$repeating_event  = empty( $rrule )  ? false : true;
			$exclude_event    = empty( $exrule ) ? false : true;

			$is_free = '';
			if ( ! empty( $event->is_free ) ) {
				$is_free = 'checked="checked" ';
				$cost    = '';
			}

			if ( $repeating_event ) {
				$rrule_text = ucfirst( $ai1ec_events_helper->rrule_to_text( $rrule ) );
			}

			if ( $exclude_event ) {
				$exrule_text = ucfirst( $ai1ec_events_helper->rrule_to_text( $exrule ) );
			}
		} catch ( Ai1ec_Event_Not_Found $e ) {
			// Event does not exist.
			// Leave form fields undefined (= zero-length strings)
			$event = null;
		}

		// Time zone; display if set.
		$timezone = '';

		$timezone_string = $this->_registry->get( 'date.timezone' )
			->get_default_timezone();

		if ( $timezone_string ) {
			$timezone = $this->_registry->get( 'utility.time' )->get_gmt_offset_expr();
		}

		// This will store each of the accordion tabs' markup, and passed as an
		// argument to the final view.
		$boxes = array();

		// ===============================
		// = Display event time and date =
		// ===============================
		$args = array(
			'all_day_event'      => $all_day_event,
			'instant_event'      => $instant_event,
			'start'              => $start,
			'end'                => $end,
			'repeating_event'    => $repeating_event,
			'rrule'              => $rrule,
			'rrule_text'         => $rrule_text,
			'exclude_event'      => $exclude_event,
			'exrule'             => $exrule,
			'exrule_text'        => $exrule_text,
			'timezone'           => $timezone,
			'timezone_string'    => $timezone_string,
			'exdate'             => $exdate,
			'parent_event_id'    => $parent_event_id,
			'instance_id'        => $instance_id,
		);

		$boxes[] = $theme_loader
			->get_file( 'box_time_and_date.php', $args, true )
			->get_content();

		// =================================================
		// = Display event location details and Google map =
		// =================================================
		$args = array(
			'venue'            => $venue,
			'country'          => $country,
			'address'          => $address,
			'city'             => $city,
			'province'         => $province,
			'postal_code'      => $postal_code,
			'google_map'       => $google_map,
			'show_map'         => $show_map,
			'show_coordinates' => $show_coordinates,
			'longitude'        => $longitude,
			'latitude'         => $latitude,
			'coordinates'      => $coordinates,
		);
		$boxes[] = $theme_loader
			->get_file( 'box_event_location.php', $args, true )
			->get_content();

		// ======================
		// = Display event cost =
		// ======================
		$args = array(
			'cost'       => $cost,
			'is_free'    => $is_free,
			'ticket_url' => $ticket_url,
			'event'      => $empty_event,
		);
		$boxes[] = $theme_loader
			->get_file( 'box_event_cost.php', $args, true )
			->get_content();



		// =========================================
		// = Display organizer contact information =
		// =========================================
		$args = array(
			'contact_name'    => $contact_name,
			'contact_phone'   => $contact_phone,
			'contact_email'   => $contact_email,
			'contact_url'     => $contact_url,
			'event'           => $empty_event,
		);
		$boxes[] = $theme_loader
			->get_file( 'box_event_contact.php', $args, true )
			->get_content();

		// ==================
		// = Publish button =
		// ==================
		$publish_button = '';
		if (
			$this->_registry->get( 'model.settings' )
				->get( 'show_publish_button' )
		) {
			$args             = array();
			$post_type_object = get_post_type_object(
				$post_helper->get_post_object_value( 'post_type' )
			);
			if ( current_user_can( $post_type_object->cap->publish_posts ) ) {
				$args['button_value'] = is_null( $event )
					? Ai1ec_I18n::__( 'Publish' )
					: Ai1ec_I18n::__( 'Update' );
			} else {
				$args['button_value'] = Ai1ec_I18n::__( 'Submit for Review' );
			}

			$boxes[] = $theme_loader
				->get_file( 'box_publish_button.php', $args, true )
				->get_content();

		}

		// Display the final view of the meta box.
		$args = array(
			'boxes'          => $boxes,
			'publish_button' => $publish_button,
		);

		echo $theme_loader
			->get_file( 'add_new_event_meta_box.php', $args, true )
			->get_content();
	}

	/**
	 * disable_autosave method
	 *
	 * Callback to disable autosave script
	 *
	 * @param array $input List of scripts registered
	 *
	 * @return array Modified scripts list
	 */
	public function disable_autosave( array $input ) {
		wp_deregister_script( 'autosave' );
		$autosave_key = array_search( 'autosave', $input );
		if ( false === $autosave_key || ! is_scalar( $autosave_key ) ) {
			unset( $input[$autosave_key] );
		}
		return $input;
	}

}