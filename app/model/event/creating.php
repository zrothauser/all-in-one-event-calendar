<?php

/**
 * Handles trash/delete operations.
 *
 * NOTICE: only operations on events entries themselve is handled.
 * If plugins need some extra handling - they must bind to appropriate
 * actions on their will.
 */
class Ai1ec_Event_Creating extends Ai1ec_Base {

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
		if (
			! isset( $_POST[AI1EC_POST_TYPE] ) ||
			! wp_verify_nonce( $_POST[AI1EC_POST_TYPE], 'ai1ec' )
		) {
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
			$exrule = $this->_registry->get( 'recurrence.rule' )->merge_exrule(
				$_POST['ai1ec_exrule'],
				$_POST['ai1ec_rrule']
			);
			$exrule = $ai1ec_events_helper->ics_rule_to_gmt( $exrule );
		}

		// if exdate is set, convert it from local to UTC time
		if( isset( $_POST['ai1ec_exdate'] ) && ! empty( $_POST['ai1ec_exdate'] ) )
			$exdate = $ai1ec_events_helper->exception_dates_to_gmt( $_POST['ai1ec_exdate'] );

		$is_new = false;
		$event  = null;
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
		if( $post->post_status !== 'draft'){
			$ai1ec_importer_plugin_helper->handle_post_event( $event, 'save' );
		}
		$event->save( ! $is_new );

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
	function post_updated_messages( $messages ) {

		$post_helper = $this->_registry->get( 'post.helper' );
		$post_ID     = $post_helper->get_post_object_value("ID");

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
				$this->_registry->get( 'date.time', $post_helper->get_post_object_value("post_daet") )->format(
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
	function event_content( $content ) {
		$ai1ec_events_helper = $this->_registry->get( 'event.helper' );
		$event_content       = null;
		$event               = null;
		$add_new_event       = $this->_registry->get( 'view.add.new.event' );

		if( $this->_registry->get( 'acl.aco' )->is_our_post_type() ) {
			$event = $ai1ec_events_helper->get_event( get_the_ID() );
			$event_content = $add_new_event->get_view( $event, $content );
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
		$add_new_event       = $this->_registry->get( 'view.add.new.event' );
		$event->set_request( $request );
		$title   = apply_filters(
			'the_title',
			$event->post->post_title,
			$event->post_id
		);
		$content = $add_new_event->get_view(
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
}