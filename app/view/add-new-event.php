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
		$start_timestamp  = '';
		$end_timestamp    = '';
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
		$parent_event_id = $ai1ec_events_helper->event_parent( $post_helper
			->get_post_object_value("ID") );
		if ( $instance_id ) {
			add_filter(
				'print_scripts_array',
				array( $this, 'disable_autosave' )
			);
		}

		try {
			// on some php version, nested try catch blocks fail and the exception would never be caught.
			// this is why we use this approach.
			$excpt = NULL;
			$event = NULL;
			try {
				$event = $this->_registry->get( 'model.event', $post_helper
					->get_post_object_value("ID"), $instance_id );
			} catch ( Ai1ec_Event_Not_Found $excpt ) {
				$ai1ec_localization_helper = $this->_registry
					->get( 'p28n.wpml' );
				$translatable_id = $ai1ec_localization_helper
					->get_translatable_id();
				if ( false !== $translatable_id ) {
					$event = $this->_registry->get( 'model.event', $translatable_id, $instance_id );
				}
			}
			if ( NULL !== $excpt ) {
				throw $excpt;
			}

			// Existing event was found. Initialize form values with values from
			// event object.
			$all_day_event    = $event->allday ? 'checked' : '';
			$instant_event    = $event->instant_event ? 'checked' : '';

			$start_timestamp  = $event->start->format_to_gmt();
			$end_timestamp 	  = $event->end->format_to_gmt();

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
		}
		catch ( Ai1ec_Event_Not_Found $e ) {
			// Event does not exist.
			// Leave form fields undefined (= zero-length strings)
			$event = null;
		}

		// Time zone; display if set.
		$timezone = '';

		$timezone_string = $this
			->_registry
			->get( 'date.timezone' )
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
			'start_timestamp'    => $start_timestamp,
			'end_timestamp'      => $end_timestamp,
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
		if ( $this->_registry->get( 'model.settings' )->get( 'show_publish_button' ) ) {
			$args             = array();
			$post_type        = $post_helper->get_post_object_value("post_type");
			$post_type_object = get_post_type_object( $post_type );
			if ( current_user_can( $post_type_object->cap->publish_posts ) ) {
				$args['button_value'] = is_null( $event )
					? __( 'Publish', AI1EC_PLUGIN_NAME )
					: __( 'Update', AI1EC_PLUGIN_NAME );
			} else {
				$args['button_value'] = __( 'Submit for Review', AI1EC_PLUGIN_NAME );
			}

			$boxes[] = $theme_loader
				->get_file( 'box_publish_button.php', $args, true )
				->get_content();

		}

		// ==========================
		// = Parent/Child relations =
		// ==========================
		if ( $event ) {
			$parent   = $ai1ec_events_helper
				->get_parent_event( $event->post_id );
			if ( $parent ) {
				try {
					$parent =  $this->_registry->get( 'model.event', $parent );
				} catch ( Ai1ec_Event_Not_Found $exception ) { // ignore
					$parent = NULL;
				}
			}
			$children = $ai1ec_events_helper
				->get_child_event_objects( $event->post_id );
			$args    = compact( 'parent', 'children' );
			$boxes[] = $theme_loader
				->get_file( 'box_event_children.php', $args, true )
				->get_content();
		}

		// Display the final view of the meta box.
		$args = array(
			'boxes'          => $boxes,
			'publish_button' => $publish_button,
		);

		echo($theme_loader
			->get_file( 'add_new_event_meta_box.php', $args, true )
			->get_content());

	}


	/**
	 * Outputs event-specific details as HTML to be prepended to post content
	 * when displayed as a single page.
	 *
	 * @param Ai1ec_Event $event  The event being displayed
	 */
	function single_view( $event ) {

		$ai1ec_settings               = $this->_registry->get( 'settings' );
		$ai1ec_view_helper            = $this->_registry->get( 'view.helper' );

		static $bootstrap_modal_added = false;
		$subscribe_url                = AI1EC_EXPORT_URL . "&ai1ec_post_ids=$event->post_id";
		$subscribe_url                = str_replace( 'webcal://', 'http://', $subscribe_url );
		// if we are inside the notification time ( 6 hour from start ) do not show the button
		// also do not show the button if the cookie is set since it means the user already subscribed
		// i save the instance id in the cookie to check for recurring events

		$show_email_subscribe         = $this->_show_email_subscribe( $event );
		$args = array(
			'event'                   => $event,
			'recurrence'              => $event->get_recurrence_html(),
			'exclude'                 => $event->get_exclude_html(),
			'categories'              => $event->get_categories_html(),
			'tags'                    => $event->get_tags_html(),
			'location'                => nl2br(
				esc_html( $event->get_location() )
			),
			'map'                     => $this->get_map_view( $event ),
			'contact'                 => $event->get_contact_html(),
			'back_to_calendar'        => $event->get_back_to_calendar_button_html(),
			'subscribe_url'           => $subscribe_url,
			'edit_instance_url'       => NULL,
			'edit_instance_text'      => NULL,
			'google_url'              => 'http://www.google.com/calendar/render?cid=' . urlencode( $subscribe_url ),
			'show_subscribe_buttons'  => ! $ai1ec_settings->turn_off_subscription_buttons,
			'show_email_subscribe'    => $show_email_subscribe,
		);
		if (
			! empty( $args['recurrence'] ) &&
			! empty( $event->instance_id ) &&
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
		if ( false === $bootstrap_modal_added && true === $show_email_subscribe ) {
			$bootstrap_modal_added = true;
			$this->add_modal_for_email_subscription( $event );
		}
		$ai1ec_view_helper->display_theme( 'event-single.php', $args );
	}

	/**
	 * Check if e-mail subscription button should be displayed
	 *
	 * @param Ai1ec_Event $event Event being checked
	 *
	 * @return bool True to display e-mail subscription button
	 */
	protected function _show_email_subscribe( Ai1ec_Event $event ) {
		global $ai1ec_settings;
		if ( ! $ai1ec_settings->enable_user_event_notifications ) {
			return false;
		}
		if (
			isset( $_COOKIE['ai1ec_event_subscribed'] ) &&
			in_array(
				$event->instance_id,
				(array)json_decode( $_COOKIE['ai1ec_event_subscribed'] )
			)
		) {
			return false;
		}
		$notification_controller = $this
			->_registry
			->get( 'notification.controller' );

		if (
			$notification_controller
				->check_if_notification_should_be_sent_for_event( $event )
		) {
			return false;
		}
		return true;
	}

	/**
	 * Create the modal for the event subscription
	 *
	 * @param $event Ai1ec_Event
	 */
	private function add_modal_for_email_subscription( Ai1ec_Event $event ) {
		$current_user = wp_get_current_user();
		$user_email = $current_user->user_email;
		unset( $current_user );
		// Create containing div
		$div = Ai1ec_Helper_Factory::create_generic_html_tag( 'div' );
		$div->add_class( 'ai1ec_email_container form-horizontal' );
		$div->set_attribute( 'data-event_id', $event->post_id );
		$div->set_attribute( 'data-event_instance', $event->instance_id );
		// Add alert container to containing div
		$div_alerts = Ai1ec_Helper_Factory::create_generic_html_tag( 'div' );
		$div_alerts->add_class( 'alerts' );
		// Add paragraph to containing div
		$paragraph = Ai1ec_Helper_Factory::create_generic_html_tag( 'p' );
		$paragraph->set_text(
			__(
				'Enter your email address below to receive a notification about the event 6 hours before it starts.',
				AI1EC_PLUGIN_NAME )
		);
		$div->add_renderable_children( $paragraph );
		// Add div.control-group to containing div
		$control_group = Ai1ec_Helper_Factory::create_generic_html_tag( 'div' );
		$control_group->add_class( 'control-group' );
		$div->add_renderable_children( $control_group );
		// Add label to div.control-group
		$label = Ai1ec_Helper_Factory::create_generic_html_tag( 'label' );
		$label->add_class( 'control-label' );
		$label->set_attribute( 'for', 'ai1ec_email_subscribe' );
		$label->set_text( __( 'Email:', AI1EC_PLUGIN_NAME ) );
		$control_group->add_renderable_children( $label );
		// Add div.controls to div.control-group
		$controls = Ai1ec_Helper_Factory::create_generic_html_tag( 'div' );
		$controls->add_class( 'controls' );
		$control_group->add_renderable_children( $controls );
		// Add input to div.controls
		$input = Ai1ec_Helper_Factory::create_input_instance();
		$input->set_id( 'ai1ec_email_subscribe' );
		$input->set_name( 'ai1ec_email_subscribe' );
		if (! empty( $user_email )) {
			$input->set_value( $user_email );
		}
		$input->set_attribute( 'placeholder', __( 'Email', AI1EC_PLUGIN_NAME ) );
		$controls->add_renderable_children( $input );
		// Create modal and add our enclosing div to it
		$bootstrap_modal = Ai1ec_Helper_Factory::create_bootstrap_modal_instance(
			$div_alerts->render_as_html() . $div->render_as_html()
		);
		$bootstrap_modal->set_header_text(
			__( 'Get notified about this event', AI1EC_PLUGIN_NAME )
		);
		$bootstrap_modal->set_id( 'ai1ec_subscribe_email_modal' );
		$bootstrap_modal->add_class( 'fade' );
		$bootstrap_modal->set_keep_button_text(
			'<i class="icon-ok"></i> ' . __( 'Subscribe', AI1EC_PLUGIN_NAME )
		);
		$bootstrap_modal->set_delete_button_text(
			'<i class="icon-remove"></i> ' . __( 'Close', AI1EC_PLUGIN_NAME )
		);
		$ai1ec_deferred_helper = Ai1ec_Deferred_Rendering_Helper::get_instance();
		$ai1ec_deferred_helper->add_renderable_children( $bootstrap_modal );
	}

	/**
	 * Outputs event-specific details as HTML to be prepended to post content
	 * when displayed in a loop alongside other event posts.
	 *
	 * @param Ai1ec_Event $event  The event being displayed
	 */
	function multi_view( $event ) {
		$ai1ec_view_helper = $this->_registry->get( 'view.helper' );
		global $ai1ec_calendar_helper;

		$location = esc_html(
			str_replace( "\n", ', ', rtrim( $event->get_location() ) )
		);

		$args = array(
			'event'              => $event,
			'recurrence'         => $event->get_recurrence_html(),
			'categories'         => $event->get_categories_html(),
			'tags'               => $event->get_tags_html(),
			'location'           => $location,
			'contact'            => $event->get_contact_html(),
			'calendar_url'       => $ai1ec_calendar_helper->get_calendar_url(),
		);
		$ai1ec_view_helper->display_theme( 'event-multi.php', $args );
	}

	/**
	 * Outputs event-specific details as HTML to be prepended to post content
	 * when displayed in an excerpt format.
	 *
	 * @param Ai1ec_Event $event  The event being displayed
	 */
	function excerpt_view( $event ) {

		$ai1ec_view_helper = $this->_registry->get( 'view.helper' );

		$location          = esc_html(
			str_replace( "\n", ', ', rtrim( $event->get_location() ) )
		);

		$args = array(
			'event'    => $event,
			'location' => $location,
		);
		$ai1ec_view_helper->display_theme( 'event-excerpt.php', $args );
	}

	/**
	 * get_map_view function
	 *
	 * Returns HTML markup displaying a Google map of the given event, if the event
	 * has show_map set to true. Returns a zero-length string otherwise.
	 *
	 * @param Ai1ec_Event $event
	 *
	 * @return void
	 */
	function get_map_view( &$event ) {
		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
		$ai1ec_settings      = $this->_registry->get( 'settings' );
		$ai1ec_view_helper   = $this->_registry->get( 'view.helper' );
		if( ! $event->show_map )
			return '';

		$location = $ai1ec_events_helper->get_latlng( $event );
		if ( ! $location ) {
			$location = $event->address;
		}

		$args = array(
			'address'                 => $location,
			'gmap_url_link'           => $ai1ec_events_helper->get_gmap_url( $event, false ),
			'hide_maps_until_clicked' => $ai1ec_settings->hide_maps_until_clicked,
		);
		return $ai1ec_view_helper->get_theme_view( 'event-map.php', $args );
	}

	/**
	 * single_event_footer function
	 *
	 * Outputs any markup that should appear below the post's content on the
	 * single post page for this event.
	 *
	 * @param Ai1ec_Event $event
	 *
	 * @return void
	 **/
	function single_event_footer( &$event ) {
		$ai1ec_view_helper = $this->_registry->get( 'view.helper' );

		$args = array(
			'event' => &$event,
		);
		return $ai1ec_view_helper->display_theme( 'event-single-footer.php', $args );
	}





	/**
	 * event_excerpt function
	 *
	 * Overrides what wp_trim_excerpt() returned if the post is an event,
	 * and outputs better rich-text (but not too rich) excerpt instead.
	 *
	 * @param string $text
	 *
	 * @return string the post excerpt
	 **/
	function event_excerpt( $text ) {

		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );

		if ( get_post_type() != AI1EC_POST_TYPE ) {
			return $text;
		}

		$event = $this->_registry->get( 'model.event', get_the_ID() );

		ob_start();

		$this->excerpt_view( $event );

		// Re-apply any filters to the post content that normally would have been
		// applied if it weren't for our interference (below).
		echo shortcode_unautop( wpautop(
			$ai1ec_events_helper->trim_excerpt(
				apply_filters( 'the_content', $event->post->post_content )
			)
		) );

		$page_content = ob_get_contents();
		ob_end_clean();

		return $page_content;
	}

	/**
	 * event_excerpt_noautop function
	 *
	 * Conditionally apply wpautop() filter to content, only if it is not an
	 * event.
	 *
	 * @param string $content the post content
	 *
	 * @return string
	 **/
	function event_excerpt_noautop( $content ) {
		if ( get_post_type() != AI1EC_POST_TYPE ) {
			return wpautop( $content );
		}
		return $content;
	}

	/**
	 * Returns the appropriate output to prepend to an event post, depending on
	 * WP loop context.
	 *
	 * @param Ai1ec_Event $event  The event post being displayed
	 * @param string $content     The post's original content
	 *
	 * @return string             The event data markup to prepend to the post content
	 */
	function get_view( $event, $content ) {

		ob_start();

		if( is_single() ) {
			$this->single_view( $event );
		} else {
			$this->multi_view( $event );
		}
		echo $content;

		if( is_single() )
			$this->single_event_footer( $event );

		$page_content = ob_get_contents();
		ob_end_clean();

		return $page_content;
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