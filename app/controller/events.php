<?php

/**
 * Controller class for events.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
class Ai1ec_Events_Controller extends Ai1ec_Base {

	/**
	 * Handle clean-up when post is deleted.
	 *
	 * @wp_hook delete_post Before performing actual delete.
	 *
	 * @param int $post_id ID of post being removed.
	 *
	 * @return bool Success.
	 */
	public function delete( $post_id ) {
		$dbi   = $this->_registry->get( 'dbi.dbi' );
		$where = array( 'post_id' => (int)$post_id );
		$dbi->delete( 'ai1ec_events',          $where, array( '%d' ) );
		$dbi->delete( 'ai1ec_event_instances', $where, array( '%d' ) );
		return true;
	}

	/*
	 * Constructor
	 *
	 * @param Ai1ec_Registry_Object $registry
	 *
	 **/
	public function __construct( Ai1ec_Registry_Object $registry ) {

		parent::__construct( $registry );

		if ( basename( $_SERVER['SCRIPT_NAME'] ) == 'post.php' ||
            basename( $_SERVER['SCRIPT_NAME'] ) == 'post-new.php') {
			add_action( 'admin_action_editpost', array( $this, 'admin_init_post' ) );
		}
	}

	/**
	 * admin_init_post method
	 *
	 * Bind to admin_action_editpost action to override default save
	 * method when user is editing single instance.
	 * New post is created with some fields unset.
	 */
	public function admin_init_post( ) {
		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
		if (
			isset( $_POST['ai1ec_instance_id'] ) &&
			isset( $_POST['action'] ) &&
			'editpost' === $_POST['action']
		) {
			$old_post_id = $_POST['post_ID'];
			$instance_id = $_POST['ai1ec_instance_id'];
			$post_id = $this->_create_duplicate_post( );
			if ( false !== $post_id ) {
				$created_event = $this->_registry->get( 'model.event', $post_id );
				$ai1ec_events_helper->add_exception_date(
					$old_post_id,
					$created_event->getStart()
				);
				$ai1ec_events_helper->delete_event_instance_cache(
					$old_post_id,
					$instance_id
				);
				$location = add_query_arg(
					'message',
					1,
					get_edit_post_link( $post_id, 'url' )
				);
				wp_redirect( apply_filters(
					'redirect_post_location',
					$location,
					$post_id
				) );
				exit( );
			}
		}
	}

	/**
	 * Callback on post untrashing
	 *
	 * @param int $post_id ID of post being untrashed
	 *
	 * @return void Method does not return
	 */
	public function untrashed_post( $post_id ) {

		try {
			$ai1ec_event = $this->_registry->get( 'model.event', $post_id );
			if (
				isset( $ai1ec_event->post ) &&
				! empty( $ai1ec_event->recurrence_rules )
			) { // untrash child event
				$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
				$children = $ai1ec_events_helper
					->get_child_event_objects( $ai1ec_event->post_id, true );
				foreach ( $children as $child ) {
					wp_untrash_post( $child->post_id );
				}
			}
		} catch ( Ai1ec_Event_Not_Found $exception ) {
			// ignore - not an event
		}
	}

	/**
	 * Callback on post trashing
	 *
	 * @param int $post_id ID of post being trashed
	 *
	 * @return void Method does not return
	 */
	public function trashed_post( $post_id ) {
		try {
			$ai1ec_event = $this->_registry->get( 'model.event', $post_id );
			if (
				isset( $ai1ec_event->post ) &&
				! empty( $ai1ec_event->recurrence_rules )
			) { // trash child event
				$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
				$children = $ai1ec_events_helper
					->get_child_event_objects( $ai1ec_event->post_id );
				foreach ( $children as $child ) {
					wp_trash_post( $child->post_id );
				}
			}
		} catch ( Ai1ec_Event_Not_Found $exception ) {
			// ignore - not an event
		}
	}

	/**
	 * delete_hook function
	 *
	 * If the deleted post is an event
	 * then all entries that match the post_id are
	 * removed from ai1ec_events and ai1ec_event_instances tables
	 *
	 * @param int $pid Post ID
	 *
	 * @return bool | int
	 **/
	function delete_post( $pid ) {
		$ai1ec_importer_plugin_helper = $this->
			_registry->get( 'Ai1ec_Importer_Plugin_Helper' );
		$dbi = $this->_registry->get( 'dbi' );
		$pid = (int)$pid;
		$sql = '
			SELECT
				ID
			FROM
				' . $dbi->get_table_name( 'posts' ) . '
			WHERE
				ID        = ' . $pid . ' AND
				post_type = \'' . AI1EC_POST_TYPE . '\'';

		// is this post an event?
		if ( $dbi->get_var( $sql ) ) {
			try {
				// clean pages cache
				$this->_registry->get( 'events.list.helper' )
					->clean_post_cache( $pid );

				// We need to pass an event object to the importer plugins
				// to clean up.
				$ai1ec_event = $this->_registry->get( 'model.event', $pid );
				if (
					isset( $ai1ec_event->post ) &&
					! empty( $ai1ec_event->recurrence_rules )
				) { // delete child event
					$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
					$children = $ai1ec_events_helper->get_child_event_objects(
						$ai1ec_event->post_id,
						true
					);
					foreach ( $children as $child ) {
						wp_delete_post( $child->post_id, true );
					}
				}
				$ai1ec_importer_plugin_helper->handle_post_event(
					$ai1ec_event,
					'delete'
				);
				$table_name = $dbi->prefix . 'ai1ec_events';
				$sql = '
					DELETE FROM
						' . $table_name . '
					WHERE
						post_id = ' . $pid;
				// delete from ai1ec_events
				$dbi->query( $sql );

				$table_name = $dbi->prefix . 'ai1ec_event_instances';
				$sql = '
					DELETE FROM
						' . $table_name . '
					WHERE
						post_id = ' . $pid;
				// delete from ai1ec_event_instances
				return $dbi->query( $sql );
			} catch ( Ai1ec_Event_Not_Found $exception ) {
				/**
				 * Possible reason, why event `delete` is triggered, albeit
				 * no details are found corresponding to it - the WordPress
				 * is not transactional - it uses no means, to ensure, that
				 * everything is deleted once and forever and thus it could
				 * happen so, that partial records are left in DB.
				 */
				return true; // already deleted
			}
		}
		return true;
	}

	/**
	 * Add Event Details meta box to the Add/Edit Event screen in the dashboard.
	 *
	 * @return void
	 */
	public function meta_box_view() {

		global $post;

		$ai1ec_events_helper  = $this->_registry->get( 'lib.event.helper' );
		$theme_loader         = $this->_registry->get( 'theme.loader' );

		$empty_event          = $this->_registry->get( 'model.event' );

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
		$parent_event_id = $ai1ec_events_helper->event_parent( $post->ID );
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
			try {
				$event = $this->_registry->get( 'model.event', $post->ID, $instance_id );
			} catch ( Ai1ec_Event_Not_Found $excpt ) {
				$ai1ec_localization_helper = $this->_registry
					->get( 'Ai1ec_Localization_Helper' );
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

			$start_timestamp  = $ai1ec_events_helper->gmt_to_local( $event->start );
			$end_timestamp 	  = $ai1ec_events_helper->gmt_to_local( $event->end );

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
			$facebook_status  = $event->facebook_status;

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
		$timezone_string = $this->_registry->get( 'Ai1ec_Meta_Post' )
			->get_option( 'timezone_string' );
		if ( $timezone_string ) {
			$timezone = $this->_registry->get( 'time' )->get_gmt_offset_expr();
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

		/*
			TODO Display Eventbrite ticketing
			$ai1ec_view_helper->display( 'box_eventbrite.php' );
		*/

		// ==================
		// = Publish button =
		// ==================
		$publish_button = '';
		if ( $this->_registry->get( 'model.settings' )->get( 'show_publish_button' ) ) {
			$args             = array();
			$post_type        = $post->post_type;
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
	 * save_post function
	 *
	 * Saves meta post data
	 *
	 * @param  int    $post_id Post ID
	 * @param  object $post    Post object
	 *
	 * @return object|null     Saved Ai1ec_Event object if successful, else null
	 */
	function save_post( $post_id, $post ) {
		$ai1ec_events_helper          = $this->_registry->get( 'event.helper' );
		$ai1ec_importer_plugin_helper = $this->_registry->get( 'Ai1ec_Importer_Plugin_Helper' );

		// verify this came from the our screen and with proper authorization,
		// because save_post can be triggered at other times
		if( isset( $_POST[AI1EC_POST_TYPE] ) && ! wp_verify_nonce( $_POST[AI1EC_POST_TYPE], 'ai1ec' ) ) {
			return null;
		} else if( ! isset( $_POST[AI1EC_POST_TYPE] ) ) {
			return null;
		}

		if( isset( $post->post_status ) && $post->post_status == 'auto-draft' ) {
			return null;
		}

		// verify if this is not inline-editing
		if( isset( $_REQUEST['action'] ) && $_REQUEST['action'] == 'inline-save' ) {
			return null;
		}

		// verify that the post_type is that of an event
		if( isset( $_POST['post_type'] ) && $_POST['post_type'] != AI1EC_POST_TYPE ) {
			return null;
		}

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
		$post_twitter     = isset( $_POST['ai1ec_oauth_provider_twitter'] )
			? (bool)$_POST['ai1ec_oauth_provider_twitter']
			: false;

		$rrule  = NULL;
		$exrule = NULL;
		$exdate = NULL;

		// if rrule is set, convert it from local to UTC time
		if( isset( $_POST['ai1ec_repeat'] ) && ! empty( $_POST['ai1ec_repeat'] ) )
			$rrule = $ai1ec_events_helper->ics_rule_to_gmt( $_POST['ai1ec_rrule'] );

		// if exrule is set, convert it from local to UTC time
		if (
			isset( $_POST['ai1ec_exclude'] ) &&
			! empty( $_POST['ai1ec_exclude'] ) &&
			NULL !== $rrule // no point for exclusion, if repetition is not set
		) {
			$exrule = $this->_merge_exrule(
				$_POST['ai1ec_exrule'],
				$_POST['ai1ec_rrule']
			);
			$exrule = $ai1ec_events_helper->ics_rule_to_gmt( $exrule );
		}

		// if exdate is set, convert it from local to UTC time
		if( isset( $_POST['ai1ec_exdate'] ) && ! empty( $_POST['ai1ec_exdate'] ) )
			$exdate = $ai1ec_events_helper->exception_dates_to_gmt( $_POST['ai1ec_exdate'] );

		$is_new = false;
		$event 	= null;
		try {
			$event =  $this->_registry->get( 'model.event', $post_id ? $post_id : null );
		} catch( Ai1ec_Event_Not_Found $e ) {
			// Post exists, but event data hasn't been saved yet. Create new event
			// object.
			$is_new = true;
			$event =  $this->_registry->get( 'model.event' );
			$event->post_id = $post_id;
		}
		// If the events is marked as instant, make it last 30 minutes
		if( $instant_event ) {
			$end_time = $start_time + 1800;
		}

		$event->start               = $ai1ec_events_helper->local_to_gmt( $start_time );
		$event->end                 = $ai1ec_events_helper->local_to_gmt( $end_time );
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

		// if we are not saving a draft, give the event to the plugins. Also do not pass events that are imported from facebook
	//	if( $post->post_status !== 'draft' && $event->facebook_status !== Ai1ecFacebookConnectorPlugin::FB_IMPORTED_EVENT ) { // TODO: reenable facebook check!
        if( $post->post_status !== 'draft'){
			$ai1ec_importer_plugin_helper->handle_post_event( $event, 'save' );
		}
		$saved_post_id = $event->save( ! $is_new );
		if ( $post_twitter ) {
			if ( ! add_post_meta(
				$saved_post_id,
				'_ai1ec_post_twitter',
				'pending',
				true
			) ) {
				update_post_meta(
					$saved_post_id,
					'_ai1ec_post_twitter',
					'pending'
				);
			}
		}

		$ai1ec_events_helper->delete_event_cache( $post_id );
		$ai1ec_events_helper->cache_event( $event );
		// LABEL:magicquotes
		// restore `magic` WordPress quotes to maintain compatibility
		$_POST = add_magic_quotes( $_POST );
		return $event;
	}

	/**
	 * post_updated_messages function
	 *
	 * Filter success messages returned by WordPress when an event post is
	 * updated/saved.
	 */
	function post_updated_messages( $messages )
	{
		global $post, $post_ID;

		$messages[AI1EC_POST_TYPE] = array(
			0 => '', // Unused. Messages start at index 1.
			1 => sprintf( __( 'Event updated. <a href="%s">View event</a>', AI1EC_PLUGIN_NAME ), esc_url( get_permalink( $post_ID ) ) ),
			2 => __( 'Custom field updated.', AI1EC_PLUGIN_NAME ),
			3 => __( 'Custom field deleted.', AI1EC_PLUGIN_NAME ),
			4 => __( 'Event updated.', AI1EC_PLUGIN_NAME ),
			/* translators: %s: date and time of the revision */
			5 => isset( $_GET['revision'] ) ? sprintf( __( 'Event restored to revision from %s', AI1EC_PLUGIN_NAME ), wp_post_revision_title( (int) $_GET['revision'], false ) ) : false,
			6 => sprintf( __( 'Event published. <a href="%s">View event</a>', AI1EC_PLUGIN_NAME ), esc_url( get_permalink($post_ID) ) ),
			7 => __( 'Event saved.' ),
			8 => sprintf( __( 'Event submitted. <a target="_blank" href="%s">Preview event</a>', AI1EC_PLUGIN_NAME ), esc_url( add_query_arg( 'preview', 'true', get_permalink( $post_ID ) ) ) ),
			9 => sprintf( __( 'Event scheduled for: <strong>%1$s</strong>. <a target="_blank" href="%2$s">Preview event</a>', AI1EC_PLUGIN_NAME ),
				// translators: Publish box date format, see http://php.net/date
                $this->_registry->get( 'date.time', $post->post_date )->format(
                    Ai1ec_I18n::__( 'M j, Y @ G:i' )
                ),
				esc_url( get_permalink($post_ID) ) ),
			10 => sprintf( __( 'Event draft updated. <a target="_blank" href="%s">Preview event</a>', AI1EC_PLUGIN_NAME ), esc_url( add_query_arg( 'preview', 'true', get_permalink( $post_ID ) ) ) ),
		);

		return $messages;
	}

	/**
	 * event_content function
	 *
	 * Filter event post content by inserting relevant details of the event
	 * alongside the regular post content.
	 *
	 * @param string $content Post/Page content
	 *
	 * @return string         Post/Page content
	 **/
	function event_content( $content )
	{
		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
		$event_content = null;
		$event = null;
		if( $this->_registry->get( 'acl.aco' )->is_our_post_type() ) {
			$event = $ai1ec_events_helper->get_event( get_the_ID() );
			$event_content = $this->get_view( $event, $content );
		}
		// if we have modified the content, we return the modified version.
		$to_return = ( null === $event_content ) ? $content : $event_content;
		// Pass the orginal content to the filter so that it can be modified
		return apply_filters(
			'ai1ec_event_content',
			$to_return,
			$event,
			$content
		);
	}

	/**
	 * Create the html for the event to be sent thorugh jsonp
	 *
	 * @param Ai1ec_Abstract_Query $request Post/Page content
	 *
	 * @return string
	 */
	public function event_content_jsonp( Ai1ec_Abstract_Query $request ) {
		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
		$event               = $ai1ec_events_helper->get_event( get_the_ID() );
		$event->set_request( $request );
		$title   = apply_filters(
			'the_title',
			$event->post->post_title,
			$event->post_id
		);
		$content = $this->get_view(
			$event,
			wpautop(
				apply_filters( 'the_content', $event->post->post_content )
			)
		);
		$article = <<<HTML
	<article>
		<header>
			<h1>
				$title
			</h1>
		</header>
		<div class="entry-content">
			$content
		</div>
	</article>
HTML;

		return $article;
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
		$notification_controller = $this->_registry-get( 'notification.controller' );
		if (
		$notification_controller
			->check_if_notification_should_be_sent_for_event( $event )
		) {
			return false;
		}
		return true;
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
		global $ai1ec_view_helper,
			   $ai1ec_calendar_helper;

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
	 * events_categories_add_form_fields function
	 *
	 * @return void
	 **/
	function events_categories_add_form_fields() {
		$ai1ec_view_helper = $this->_registry->get( 'view.helper' );

		$args = array( 'edit' => false );
		$ai1ec_view_helper->display_admin( 'event_categories-color_picker.php', $args );
	}

	/**
	 * events_categories_edit_form_fields function
	 *
	 * @param $term
	 *
	 * @return void
	 **/
	function events_categories_edit_form_fields( $term ) {
		$ai1ec_view_helper = $this->_registry->get( 'view.helper' );
		$dbi = $this->_registry->get( 'dbi' );

		$table_name = $dbi->get_table_name( 'ai1ec_event_category_colors' );
		$color      = $dbi->get_var(
			$dbi->prepare( "SELECT term_color FROM {$table_name} WHERE term_id = %d ", $term->term_id )
		);

		$style = '';
		$clr   = '';

		if( ! is_null( $color ) && ! empty( $color ) ) {
			$style = 'style="background-color: ' . $color . '"';
			$clr = $color;
		}

		$args = array(
			'style' => $style,
			'color' => $clr,
			'edit'  => true,
		);
		$ai1ec_view_helper->display_admin( 'event_categories-color_picker.php', $args );
	}

	/**
	 * Hook to process event categories creation
	 *
	 * @param term_id
	 *
	 * @return void Method does not return
	 */
	function created_events_categories( $term_id ) {
		return $this->edited_events_categories( $term_id );
	}

	/**
	 * edited_events_categories method
	 *
	 * A callback method, triggered when `event_categories' are being edited
	 *
	 * @param int $term_id ID of term (category) being edited
	 *
	 * @return void Method does not return
	 */
	function edited_events_categories( $term_id ) {

		$dbi = $this->_registry->get( 'dbi' );

		$tag_color_value = '';
		if (
			isset( $_POST['tag-color-value'] ) &&
			! empty( $_POST['tag-color-value'] )
		) {
			$tag_color_value = $_POST['tag-color-value'];
		}

		$table_name = $dbi->get_table_name( 'ai1ec_event_category_colors' );
		$term       = $dbi->get_row( $dbi->prepare(
			'SELECT term_id, term_color' .
			' FROM ' . $table_name .
			' WHERE term_id = %d',
			$term_id
		) );

		if ( NULL === $term ) { // term does not exist, create it
			$dbi->insert(
				$table_name,
				array(
					'term_id'    => $term_id,
					'term_color' => $tag_color_value,
				),
				array(
					'%d',
					'%s',
				)
			);
		} else { // term exist, update it
			if ( NULL === $tag_color_value ) {
				$tag_color_value = $term->term_color;
			}
			$dbi->update(
				$table_name,
				array( 'term_color' => $tag_color_value ),
				array( 'term_id'    => $term_id ),
				array( '%s' ),
				array( '%d' )
			);
		}
		$this->_registry->get( 'event.list.heler' )->purge();
	}

	/**
	 * _create_duplicate_post method
	 *
	 * Create copy of event by calling {@uses wp_insert_post} function.
	 * Using 'post_parent' to add hierarchy.
	 *
	 * @return int|bool New post ID or false on failure
	 **/
	protected function _create_duplicate_post( ) {

		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );

		if ( ! isset( $_POST['post_ID'] ) ) {
			return false;
		}
		$clean_fields = array(
			'ai1ec_repeat'      => NULL,
			'ai1ec_rrule'       => '',
			'ai1ec_exrule'      => '',
			'ai1ec_exdate'      => '',
			'post_ID'           => NULL,
			'post_name'         => NULL,
			'ai1ec_instance_id' => NULL,
		);
		$old_post_id = $_POST['post_ID'];
		$instance_id = $_POST['ai1ec_instance_id'];
		foreach ( $clean_fields as $field => $to_value ) {
			if ( NULL === $to_value ) {
				unset( $_POST[$field] );
			} else {
				$_POST[$field] = $to_value;
			}
		}
		$_POST   = _wp_translate_postdata( false, $_POST );
		$_POST['post_parent'] = $old_post_id;
		$post_id = wp_insert_post( $_POST );
		$ai1ec_events_helper->event_parent(
			$post_id,
			$old_post_id,
			$instance_id
		);
		return $post_id;
	}

	/**
	 * _merge_exrule method
	 *
	 * Merge RRULE values to EXRULE, to ensure, that it matches the according
	 * repetition values, it is meant to exclude.
	 *
	 * NOTE: one shall ensure, that RRULE values are placed in between EXRULE
	 * keys, so that wording in UI would remain the same after mangling.
	 *
	 * @param string $exrule Value for EXRULE provided by user
	 * @param string $rrule  Value for RRULE provided by user
	 *
	 * @return string Modified value to use for EXRULE
	 */
	protected function _merge_exrule( $exrule, $rrule ) {
		$list_exrule = explode( ';', $exrule );
		$list_rrule  = explode( ';', $rrule  );
		$map_exrule  = $map_rrule   = array();
		foreach ( $list_rrule as $entry ) {
			if ( empty( $entry ) ) {
				continue;
			}
			list( $key, $value ) = explode( '=', $entry );
			$map_rrule[$key] = $value;
		}
		foreach ( $list_exrule as $entry ) {
			if ( empty( $entry ) ) {
				continue;
			}
			list( $key, $value ) = explode( '=', $entry );
			$map_exrule[$key] = $value;
		}

		$resulting_map = array_merge( $map_rrule, $map_exrule );
		$result_rule   = array();
		foreach ( $resulting_map as $key => $value ) {
			$result_rule[] = $key . '=' . $value;
		}
		$result_rule = implode( ';', $result_rule );
		return $result_rule;
	}

>>>>>>> Fixes according to comments form @jbukutus and @nicoladj77
	public function get_events() {
		$start  = $this->_registry->get( 'date.time', strtotime( '-1 month' ) );
		$end    = $this->_registry->get( 'date.time', strtotime( '+1 month' ) );
		$events = $this->_registry->get( 'model.search' )
			->get_events_between( $start, $end );

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/event-list.twig',
			compact( 'events', 'start', 'end' ),
			false
		);

		return $template->get_content();
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