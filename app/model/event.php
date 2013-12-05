<?php

/**
 * Modal class representing an event or an event instance.
 *
 * @author       Time.ly Network, Inc.
 * @since        2.0
 * @instantiator new
 * @package      Ai1EC
 * @subpackage   Ai1EC.Model
 */
class Ai1ec_Event extends Ai1ec_Base {

	/**
	 * @var Ai1ec_Event_Entity Data store object reference.
	 */
	protected $_entity    = null;

	protected $_swizzable = array(
		'contact_url' => 0,
		'cost'        => 0,
		'ticket_url'  => 0,
		'start'       => -1,
		'end'         => -1,
	);

	protected $_is_multiday = null;

	public function __set( $property, $value ) {
		trigger_error(
			'Directly accessing Ai1ec_Event attributes is deprecated',
			E_USER_WARNING
		);
		return $this->set( $property, $value );
	}

	/**
	 * Handle property accessors.
	 *
	 * @param string $name Property name
	 *
	 * @return mixed Property value
	 *
	 * @throws E_USER_WARNING Always, because this method is deprecated and will be removed
	 */
	public function __get( $name ) {
		trigger_error(
			'Directly accessing Ai1ec_Event attributes is deprecated',
			E_USER_WARNING
		);
		$method = 'get_' . $name;
		if ( method_exists( $this, $name ) ) {
			return $this->{$method}();
		}
		return $this->get( $name );
	}

	public function get( $property ) {
		return $this->_entity->get( $property );
	}

	/**
	 * Handle property initiation.
	 *
	 * Decides, how to extract value stored in permanent storage.
	 *
	 * @param string $property Name of property to handle
	 * @param mixed  $value    Value, read from permanent storage
	 *
	 * @return bool Success
	 */
	public function set( $property, $value ) {
		if (
			isset( $this->_swizzable[$property] ) &&
			$this->_swizzable[$property] >= 0
		) {
			$method = '_handle_property_construct_' . $property;
			$value  = $this->{$method}( $value );
		}
		$this->_entity->set( $property, $value );
		return $this;
	}

	public function initialize_from_array( array $data ) {
		// =======================================================
		// = Assign each event field the value from the database =
		// =======================================================
		foreach ( $this->_entity->list_properties() as $property ) {
			if ( 'post' !== $property && isset( $data[$property] ) ) {
				$this->set( $property, $data[$property] );
				unset( $data[$property] );
			}
		}
		if ( isset( $data['post'] ) ) {
			$this->set( 'post', (object)$data['post'] );
		} else {
			// ========================================
			// = Remaining fields are the post fields =
			// ========================================
			$this->set( 'post', (object)$data );
		}
		return $this;
	}

	public function initialize_from_id( $post_id, $instance = false ) {
		$post = get_post( $post_id );
		if ( ! $post || $post->post_status == 'auto-draft' ) {
			throw new Ai1ec_Event_Not_Found_Exception(
				'Post with ID \'' . $post_id .
				'\' could not be retrieved from the database.'
			);
		}
		$post_id    = (int)$post_id;
		$dbi        = $this->_registry->get( 'dbi.dbi' );

		$left_join  = '';
		$select_sql = '
			e.post_id,
			e.recurrence_rules,
			e.exception_rules,
			e.allday,
			e.instant_event,
			e.recurrence_dates,
			e.exception_dates,
			e.venue,
			e.country,
			e.address,
			e.city,
			e.province,
			e.postal_code,
			e.show_map,
			e.contact_name,
			e.contact_phone,
			e.contact_email,
			e.contact_url,
			e.cost,
			e.ticket_url,
			e.ical_feed_url,
			e.ical_source_url,
			e.ical_organizer,
			e.ical_contact,
			e.ical_uid,
			e.longitude,
			e.latitude,
			e.show_coordinates,
			e.facebook_eid,
			e.facebook_status,
			e.facebook_user,
			GROUP_CONCAT( ttc.term_id ) AS categories,
			GROUP_CONCAT( ttt.term_id ) AS tags
		';

		if ( false !== $instance && is_numeric( $instance ) ) {
			$select_sql .= ", IF( aei.start IS NOT NULL, aei.start, e.start ) as start," .
						   "  IF( aei.start IS NOT NULL, aei.end,   e.end )   as end ";

			$instance = (int)$instance;
			$this->instance_id = $instance;
			$left_join = 	'LEFT JOIN ' . $dbi->get_table_name( 'ai1ec_event_instances' ) .
				' aei ON aei.id = ' . $instance . ' AND e.post_id = aei.post_id ';
		} else {
			$select_sql .= ', e.start as start, e.end as end, e.allday ';
		}

		// =============================
		// = Fetch event from database =
		// =============================
		$query = 'SELECT ' . $select_sql . '
			FROM ' . $dbi->get_table_name( 'ai1ec_events' ) . ' e
				LEFT JOIN ' .
					$dbi->get_table_name( 'term_relationships' ) . ' tr
					ON ( e.post_id = tr.object_id )
				LEFT JOIN ' . $dbi->get_table_name( 'term_taxonomy' ) . ' ttc
					ON (
						tr.term_taxonomy_id = ttc.term_taxonomy_id AND
						ttc.taxonomy = \'events_categories\'
					)
				LEFT JOIN ' . $dbi->get_table_name( 'term_taxonomy' ) . ' ttt
					ON (
						tr.term_taxonomy_id = ttt.term_taxonomy_id AND
						ttt.taxonomy = \'events_tags\'
					)
				' . $left_join . '
			WHERE e.post_id = ' . $post_id . '
			GROUP BY e.post_id';

		$event = $dbi->get_row( $query, ARRAY_A );
		if ( null === $event || null === $event['post_id'] ) {
			throw new Ai1ec_Event_Not_Found_Exception(
				'Event with ID \'' . $post_id .
				'\' could not be retrieved from the database.'
			);
		}

		$event['post'] = $post;
		return $this->initialize_from_array( $event );
	}

	/**
	 * Create new event object, using provided data for initialization.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 * @param int|array $data  Look up post with id $data, or initialize fields
	 *                         with flat associative array $data containing both
	 *                         post and event fields returned by join query
	 * @param bool $instance
	 *
	 * @throws Ai1ec_Invalid_Argument
	 * @throws Ai1ec_Event_Not_Found_Exception
	 *
	 * @return void
	 */
	function __construct(
		Ai1ec_Registry_Object $registry,
		$data     = null,
		$instance = false
	) {
		parent::__construct( $registry );
		$this->_entity = $this->_registry->get( 'model.event.entity' );

		if ( null === $data ) {
			return; // empty object
		} else if ( is_numeric( $data ) ) {
			$this->initialize_from_id( $data, $instance );
		} else if ( is_array( $data ) ) {
			$this->initialize_from_array( $data );
		} else {
			throw new Ai1ec_Invalid_Argument(
				'Argument to constructor must be integer, array or null' .
				', not ' . var_export( $data, true )
			);
		}
	}

	/**
	 * Restore original URL from loggable event URL
	 *
	 * @param string $value URL as seen by visitor
	 *
	 * @return string Original URL
	 */
	public function get_nonloggable_url( $value ) {
		if (
			empty( $value ) ||
			false === strpos( $value, AI1EC_REDIRECTION_SERVICE )
		) {
			return $value;
		}
		$decoded = json_decode(
			base64_decode(
				trim(
					substr( $value, strlen( AI1EC_REDIRECTION_SERVICE ) ),
					'/'
				)
			),
			true
		);
		if ( ! isset( $decoded['l'] ) ) {
			return '';
		}
		return $decoded['l'];
	}

	/**
	 * Convert URL to a loggable form
	 *
	 * @param string $url    URL to which access must be counted
	 * @param string $intent Char definition: 'b' - buy, 'd' - details
	 *
	 * @return string Loggable URL form
	 */
	protected function _make_url_loggable( $url, $intent ) {
		static $options = NULL;
		$url = trim( $url );
		if ( ! $url || ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			return $url;
		}
		if ( ! isset( $options ) ) {
			$options = array(
				'l' => NULL,
				'e' => ( false !== strpos( AI1EC_VERSION, 'pro' ) ) ? 'p' : 's',
				'v' => (string)AI1EC_VERSION,
				'i' => NULL,
				'c' => NULL,
				'o' => (string)get_site_url(),
			);
		}
		$options['l'] = (string)$url;
		$options['i'] = (string)$intent;
		$options['c'] = (string)$this->cost;
		return AI1EC_REDIRECTION_SERVICE .
			base64_encode( json_encode( $options ) );
	}

	/**
	 * Make `Ticket URL` loggable
	 *
	 * @param string $value Ticket URL stored in database
	 *
	 * @return bool Success
	 */
	public function _handle_property_construct_ticket_url( $value ) {
		return $this->_make_url_loggable( $value, 'b' );
	}

	/**
	 * Make `Contact URL` loggable
	 *
	 * @param string $value Contact URL stored in database
	 *
	 * @return bool Success
	 */
	public function _handle_property_construct_contact_url( $value ) {
		return $this->_make_url_loggable( $value, 'd' );
	}

	/**
	 * Handle `cost` value reading from permanent storage.
	 *
	 * @param string $value Value stored in permanent storage
	 *
	 * @return bool Success: true, always
	 */
	protected function _handle_property_construct_cost( $value ) {
		$test_value = false;
		if (
			isset( $value{1} ) && (
				':' === $value{1} || ';' === $value{1}
			)
		) {
			$test_value = unserialize( $value );
		}
		$cost = $is_free = NULL;
		if ( false === $test_value ) {
			$cost    = trim( $value );
			$is_free = false;
		} else {
			extract( $test_value, EXTR_IF_EXISTS );
		}
		$this->_entity->set( 'is_free', (bool)$is_free );
		return (string)$cost;
	}

	public function get_uid() {
		static $_blog_url = NULL;
		if ( NULL === $_blog_url ) {
			$_blog_url = bloginfo( 'url' );
		}
		return $this->post_id . '@' . $_blog_url;
	}

	public function is_free() {
		return $this->get( 'is_free' );
	}

	public function is_allday() {
		return $this->get( 'allday' );
	}

	public function is_instant() {
		return $this->get( 'instant_event' );
	}

	public function is_multiday() {
		if ( null === $this->_is_multiday ) {
			$start = $this->get( 'start' );
			$end   = $this->get( 'end' );
			$diff  = $end->diff_sec( $start );
			$this->_is_multiday = $diff > 86400 &&
				$start->format( 'Y-m-d' ) !== $end->format( 'Y-m-d' );
		}
		return $this->_is_multiday;
	}

	/**
	 * Create/update entity representation.
	 *
	 * Saves the current event data to the database. If $this->post_id exists,
	 * but $update is false, creates a new record in the ai1ec_events table of
	 * this event data, but does not try to create a new post. Else if $update
	 * is true, updates existing event record. If $this->post_id is empty,
	 * creates a new post AND record in the ai1ec_events table for this event.
	 *
	 * @param  bool  $update  Whether to update an existing event or create a
	 *                        new one
	 * @return int            The post_id of the new or existing event.
	 */
	function save( $update = false ) {
		$dbi        = $this->_registry->get( 'dbi.dbi' );
		$columns    = $this->prepare_store_entity();
		$format     = $this->prepare_store_format( $columns );
		$table_name = $dbi->get_table_name( 'ai1ec_events' );
		$post_id    = $columns['post_id'];

		if ( $post_id ) {

			$success = false;
			if ( ! $update ) {
				$success = $dbi->insert(
					$table_name,
					$columns,
					$format
				);
			} else {
				$success = $dbi->update(
					$table_name,
					$columns,
					array( 'post_id' => $columns['post_id'] ),
					$format,
					array( '%d' )
				);
			}
			if ( false === $success ) {
				return false;
			}

		} else {
			// ===================
			// = Insert new post =
			// ===================
			$post_id = wp_insert_post( $this->get( 'post' ), false );
			if ( 0 === $post_id ) {
				return false;
			}
			$this->set( 'post_id', $post_id );
			$columns['post_id'] = $post_id;

			$taxonomy   = $this->_registry->get(
				'model.event.taxonomy',
				$post_id
			);
			$taxonomy->set_categories( $this->get( 'categories' ) );
			$taxonomy->set_tags(       $this->get( 'tags' ) );

			if (
				$feed = $this->get( 'feed' ) &&
				isset( $feed->feed_id )
			) {
				$taxonomy->set_feed( $feed );
			}

			// =========================
			// = Insert new event data =
			// =========================
			if ( false === $dbi->insert( $table_name, $columns, $format ) ) {
				return false;
			}
		}

		// give other plugins / extensions the ability to do things
		// when saving, like fetching authors which i removed as it's not core.
		do_action( 'ai1ec_save_event' );

		$instance_model = $this->_registry->get( 'model.event.instance' );
		$instance_model->recreate( $this );

		do_action( 'ai1ec_event_saved', $post_id, $this );
		return $post_id;
	}

	public function prepare_store_format( array $entity ) {
		$format = array(
			'%d',
			'%d',
			'%d',
			'%d',
			'%d',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%d',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%s',
			'%d',
			'%f',
			'%f',
			'%s',
			'%s',
			'%s',
		);
		return $format;
	}

	public function prepare_store_entity() {
		$entity = array(
			'post_id'          => $this->storage_format( 'post_id' ),
			'start'            => $this->storage_format( 'start' ),
			'end'              => $this->storage_format( 'end' ),
			'allday'           => $this->storage_format( 'allday' ),
			'instant_event'    => $this->storage_format( 'instant_event' ),
			'recurrence_rules' => $this->storage_format( 'recurrence_rules' ),
			'exception_rules'  => $this->storage_format( 'exception_rules' ),
			'recurrence_dates' => $this->storage_format( 'recurrence_dates' ),
			'exception_dates'  => $this->storage_format( 'exception_dates' ),
			'venue'            => $this->storage_format( 'venue' ),
			'country'          => $this->storage_format( 'country' ),
			'address'          => $this->storage_format( 'address' ),
			'city'             => $this->storage_format( 'city' ),
			'province'         => $this->storage_format( 'province' ),
			'postal_code'      => $this->storage_format( 'postal_code' ),
			'show_map'         => $this->storage_format( 'show_map' ),
			'contact_name'     => $this->storage_format( 'contact_name' ),
			'contact_phone'    => $this->storage_format( 'contact_phone' ),
			'contact_email'    => $this->storage_format( 'contact_email' ),
			'contact_url'      => $this->storage_format( 'contact_url' ),
			'cost'             => $this->storage_format( 'cost' ),
			'ticket_url'       => $this->storage_format( 'ticket_url' ),
			'ical_feed_url'    => $this->storage_format( 'ical_feed_url' ),
			'ical_source_url'  => $this->storage_format( 'ical_source_url' ),
			'ical_uid'         => $this->storage_format( 'ical_uid' ),
			'show_coordinates' => $this->storage_format( 'show_coordinates' ),
			'latitude'         => $this->storage_format( 'latitude' ),
			'longitude'        => $this->storage_format( 'longitude' ),
			'facebook_eid'     => $this->storage_format( 'facebook_eid',  0 ),
			'facebook_user'    => $this->storage_format( 'facebook_user', 0 ),
			'facebook_status'  => $this->storage_format( 'facebook_status' ),
		);
		return $entity;
	}

	public function storage_format( $field, $default = null ) {
		$value = $this->_entity->get( $field, $default );
		if (
			isset( $this->_swizzable[$field] ) &&
			$this->_swizzable[$field] <= 0
		) {
			$value = $this->{ '_handle_property_destruct_' . $field }( $value );
		}
		return $value;
	}

	/**
	 * Store `Ticket URL` in non-loggable form
	 *
	 * @param string $ticket_url URL for buying tickets.
	 *
	 * @return string Non loggable URL
	 */
	protected function _handle_property_destruct_ticket_url( $ticket_url ) {
		return $this->get_nonloggable_url( $ticket_url );
	}

	protected function _handle_property_destruct_start( Ai1ec_Date_Time $start ) {
		return $start->format_to_gmt();
	}

	protected function _handle_property_destruct_end( Ai1ec_Date_Time $end ) {
		return $end->format_to_gmt();
	}

	/**
	 * Store `Contact URL` in non-loggable form.
	 *
	 * @param string $contact_url URL for contact details.
	 *
	 * @return string Non loggable URL.
	 */
	protected function _handle_property_destruct_contact_url( $contact_url ) {
		return $this->get_nonloggable_url( $contact_url );
	}

	/**
	 * Handle `cost` writing to permanent storage.
	 *
	 * @param string $cost Value of cost.
	 *
	 * @return string Serialized value to store.
	 */
	protected function _handle_property_destruct_cost( $cost ) {
		$cost = array(
			'cost'    => $cost,
			'is_free' => false,
		);
		if ( $this->get( 'is_free' ) ) {
			$cost['is_free'] = true;
		}
		return serialize( $cost );
	}

}
