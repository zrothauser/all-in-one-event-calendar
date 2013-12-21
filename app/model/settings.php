<?php

/**
 * Model used for storing/retrieving plugin options.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Model
 */
class Ai1ec_Settings extends Ai1ec_App {

	/**
	 * @constant string Name of WordPress options key used to store settings.
	 */
	const WP_OPTION_KEY          = 'ai1ec_settings';

	/**
	 * @var array Map of value names and their representations.
	 */
	protected $_options          = array();

	/**
	 * @var bool Indicator for modified object state.
	 */
	protected $_updated          = false;

	/**
	 * Register new option to be used.
	 *
	 * @param string $option   Name of option.
	 * @param mixed $value     The value
	 * @param string $type     Option type to be used for validation.
	 * @param string $renderer Name of class to render the option.
	 *
	 * @return Ai1ec_Settings Instance of self for chaining.
	 */
	public function register( $option, $value, $type, $renderer ) {
		$this->_options[$option] = array(
			'value'    => $value,
			'type'     => $type,
			'legacy'   => false,
		);
		if ( null !== $renderer ) {
			$this->_options[$option]['renderer'] = $renderer;
		}
		return $this;
	}

	/**
	 * Gets the options.
	 * 
	 * @return array:
	 */
	public function get_options() {
		return $this->_options;
	}

	/**
	 * Get field options as registered.
	 *
	 * @param string $option Name of option field to describe.
	 *
	 * @return array|null Description or null if nothing is found.
	 */
	public function describe( $option ) {
		if ( ! isset( $this->_options[$option] ) ) {
			return null;
		}
		return $this->_options[$option];
	}

	/**
	 * Get value for option.
	 *
	 * @param string $option  Name of option to get value for.
	 * @param mixed  $default Value to return if option is not found.
	 *
	 * @return mixed Value or $default if none is found.
	 */
	public function get( $option, $default = null ) {
		// notice, that `null` is not treated as a value
		if ( ! isset( $this->_options[$option] ) ) {
			return $default;
		}
		return $this->_options[$option]['value'];
	}

	/**
	 * Check if platform mode is activated.
	 *
	 * @return bool Activity status.
	 */
	public function is_event_platform_active() {
		if ( defined( 'AI1EC_EVENT_PLATFORM' ) && AI1EC_EVENT_PLATFORM ) {
			return true;
		}
		if ( $this->get( 'event_platform', false ) ) {
			return true;
		}
		return false;
	}

	/**
	 * Set new value for previously initialized option.
	 *
	 * @param string $option Name of option to update.
	 * @param mixed  $value  Actual value to be used for option.
	 *
	 * @throws Ai1ec_Settings_Exception
	 *
	 * @return Ai1ec_Settings Instance of self for chaining.
	 */
	public function set( $option, $value ) {
		if ( ! isset( $this->_options[$option] ) ) {
			throw new Ai1ec_Settings_Exception(
				'Option "' . $option . '" was not registered'
			);
		}
		if ( 'array' === $this->_options[$option]['type'] ) {
			if (
				! is_array( $this->_options[$option]['value'] ) ||
				! is_array( $value ) ||
				$value != $this->_options[$option]['value']
			) {
				$this->_options[$option]['value'] = $value;
				$this->_updated                   = true;
			}
		} else if (
			(string)$value !== (string)$this->_options[$option]['value']
		) {
			$this->_options[$option]['value'] = $value;
			$this->_updated                   = true;
		}
		return $this;
	}

	/**
	 * Parse legacy values into new structure.
	 *
	 * @param mixed $values Expected legacy representation.
	 *
	 * @return array Parsed values representation, or input cast as array.
	 */
	protected function _parse_legacy( Ai1ec_Settings $values ) {
		$result    = array();
		$variables = get_object_vars( $values );
		$default_tags_cat = array();
		foreach ( $variables as $key => $value ) {
			if ( 'default_categories' === $key ) {
				$default_tags_cat['categories'] = $value;
				continue;
			}
			if ( 'default_tags' === $key ) {
				$default_tags_cat['tags'] = $value;
				continue;
			}
			$type = 'string';
			if ( is_array( $value ) ) {
				$type = 'array';
			} elseif ( is_bool( $value ) ) {
				$type = 'bool';
			} elseif ( is_int( $value ) ) {
				$type = 'int';
			}
			$this->_options[$key] = array(
				'value'    => $value,
				'type'     => $type,
				'legacy'   => true,
			);
			if ( isset ( $this->_standard_options[$key]['renderer'] ) ) {
				$this->_options[$key]['renderer'] = $this->_standard_options[$key]['renderer'];
			}
		}
		$this->_options['default_tags_categories'] = array(
			'value'    => $default_tags_cat,
			'type'     => 'array',
			'legacy'   => true,
			'renderer' => $this->_standard_options['default_tags_categories']['renderer']
		);
	}

	/**
	 * Write object representation to persistence layer.
	 *
	 * Upon successful write to persistence layer the objects internal
	 * state {@see self::$_updated} is updated respectively.
	 *
	 * @return bool Success.
	 */
	public function persist() {
		$success = $this->_registry->get( 'model.option' )
			->set( self::WP_OPTION_KEY, $this->_options );
		if ( $success ) {
			$this->_updated = false;
		}
		return $success;
	}

	/**
	 * Check object state and update it's database representation as needed.
	 *
	 * @return void Destructor does not return.
	 */
	public function shutdown() {
		if ( $this->_updated ) {
			$this->persist();
		}
	}

	/**
	 * Initiate options map from storage.
	 *
	 * @return void Return from this method is ignored.
	 */
	protected function _initialize() {
		$this->_set_standard_values();
		$values         = $this->_registry->get( 'model.option' )
			->get( self::WP_OPTION_KEY, array() );
		$this->_updated = false;
		if ( empty( $values ) ) {
			$this->_register_standard_values();
			$this->_updated = true;
		} else if ( $values instanceof Ai1ec_Settings ) {
			$values = $this->_parse_legacy( $values );
			$this->_updated = true;
		} else {
			$this->_options = $values;
		}
		$this->_registry->get( 'controller.shutdown' )->register(
			array( $this, 'shutdown' )
		);
	}

	/**
	 * Set the standard values for the options of the core plugin.
	 * 
	 */
	protected function _set_standard_values() {
		$this->_standard_options = array(
			'ai1ec_db_version' => array(
				'type' => 'int',
				'default'  => false,
			),
			'feeds_page' => array(
				'type' => 'string',
				'default'  => false,
			),
			'settings_page' => array(
				'type' => 'string',
				'default'  => false,
			),
			'less_variables_page' => array(
				'type' => 'string',
				'default'  => false,
			),
			'input_date_format' => array(
				'type' => 'string',
				'default'  => 'd/m/yyyy',
			),
			'plugins_options' => array(
				'type' => 'array',
				'default'  => array(),
			),
			'calendar_page_id' => array(
				'type' => 'mixed',
				'renderer' => array(
					'class' => 'calendar-page-selector',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__( 'Calendar page' )
				),
				'default'  => false,
			),
			'week_start_day' => array(
				'type' => 'int',
				'renderer' => array(
					'class'   => 'select',
					'tab'     => 'viewing-events',
					'label'   => Ai1ec_I18n::__( 'Week starts on' ),
					'options' => 'get_weekdays',
				),
				'default'  => $this->_registry->get( 'model.option' )->get(
					'start_of_week'
				),
			),
			'default_tags_categories' => array(
				'type' => 'array',
				'renderer' => array(
					'class' => 'tags-categories',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__( 'Preselected calendar filters' ),
					'help'  => Ai1ec_I18n::__( 
						'To clear, hold ⌘/<abbr class="initialism">CTRL</abbr> and click selection.'
					)
				),
				'default'  => array(
					'categories' => array(),
					'tags' => array(),
				),
			),
			'exact_date' => array(
				'type' => 'string',
				'renderer' => array(
					'class' => 'input',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__( 'Default calendar start date (optional)' ),
					'type'  => 'date',
				),
				'default'  => '',
			),
			'posterboard_tile_min_width' => array(
				'type' => 'int',
				'renderer' => array(
					'class'     => 'input',
					'tab'       => 'viewing-events',
					'label'     => Ai1ec_I18n::__( 'Posterboard tile minimum width' ),
					'append'    => 'px',
					'type'      => 'append',
					'validator' => 'numeric'
				),
				'default'  => 240,
			),
			'posterboard_events_per_page' => array(
				'type' => 'int',
				'renderer' => array(
					'class'     => 'input',
					'tab'       => 'viewing-events',
					'label'     => Ai1ec_I18n::__( 'Posterboard pages show at most' ),
					'append'    => 'events',
					'type'      => 'append',
					'validator' => 'numeric',
				),
				'default'  => 30,
			),
			'agenda_events_per_page' => array(
				'type' => 'int',
				'renderer' => array(
					'class'     => 'input',
					'tab'       => 'viewing-events',
					'label'     => Ai1ec_I18n::__( 'Agenda pages show at most' ),
					'type'      => 'append',
					'append'    => 'events',
					'validator' => 'numeric',
				),
				'default'  => 10,
			),
			'agenda_include_entire_last_day' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__(
						'In <span class="ai1ec-tooltip-toggle"
						data-original-title="These include Agenda view,
						 Posterboard view, and the Upcoming Events widget.">
						 Agenda-like views</span>, <strong>include all events
						from last day shown</strong>'
					)
				),
				'default'  => false,
			),
			'agenda_events_expanded' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__(
						'Keep all events <strong>expanded</strong> in Agenda view'
					)
				),
				'default'  => false,
			),
			'show_year_in_agenda_dates' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__(
						'<strong>Show year</strong> in Posterboard, Agenda and widget view date label'
					)
				),
				'default'  => false,
			),
			'show_location_in_title' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__(
						'<strong>Show location in event titles</strong> in calendar views'
					)
				),
				'default'  => true,
			),
			'exclude_from_search' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__(
						'<strong>Exclude</strong> events from search results'
					)
				),
				'default'  => false,
			),
			'turn_off_subscription_buttons' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__(
						'Hide <strong>Subscribe</strong>/<strong>Add to Calendar</strong> buttons in calendar and single event views '
					)
				),
				'default'  => false,
			),
			'hide_maps_until_clicked' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__(
						' Hide <strong>Google Maps</strong> until clicked'
					)
				),
				'default'  => false,
			),
			'embedding' => array(
				'type' => 'html',
				'renderer' => array(
					'class' => 'html',
					'tab'   => 'viewing-events',
				),
				'default'  => null,
			),
			'input_date_format' => array(
				'type' => 'string',
				'renderer' => array(
					'class'   => 'select',
					'tab'     => 'editing-events',
					'label'   => Ai1ec_I18n::__(
						'Input dates in this format'
					),
					'options' => array(
						array( 
							'text' => Ai1ec_I18n::__( 'Default (d/m/yyyy)' ),
							'value' => 'def'
					 	),
						array(
							'text' => Ai1ec_I18n::__( 'US (m/d/yyyy)' ),
							'value' => 'us'
						),
						array(
							'text' => Ai1ec_I18n::__( 'ISO 8601 (yyyy-m-d)' ),
							'value' => 'iso'
						),
						array( 
							'text' => Ai1ec_I18n::__( 'Dotted (m.d.yyyy)' ),
							'value' => 'dot'
					 	),
					),
				),
				'default'  => 'def',
			),
			'input_24h_time' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'editing-events',
					'label' => Ai1ec_I18n::__(
						' Use <strong>24h time</strong> in time pickers'
					)
				),
				'default'  => false,
			),
			'disable_autocompletion' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'editing-events',
					'label' => Ai1ec_I18n::__(
						'<strong>Disable address autocomplete</strong> function'
					)
				),
				'default'  => false,
			),
			'geo_region_biasing' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'editing-events',
					'label' => Ai1ec_I18n::__(
						'Use the configured <strong>region</strong> (WordPress locale) to bias the address autocomplete function '
					)
				),
				'default'  => false,
			),
			'show_publish_button' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'editing-events',
					'label' => Ai1ec_I18n::__(
						'Display <strong>Publish</strong> at bottom of Edit Event form'
					)
				),
				'default'  => false,
			),
			'show_create_event_button' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'editing-events',
					'label' => Ai1ec_I18n::__(
						' Show the old <strong>Post Your Event</strong> button above the calendar to privileged users'
					),
					'help'  => Ai1ec_I18n::__(
						'<a target="_blank" href="http://time.ly/pro-calendar">Upgrade to Pro</a> for the new <strong>front-end Post Your Event form</strong>.'
					),
				),
				'default'  => false,
			),
			'calendar_css_selector' => array(
				'type' => 'string',
				'renderer' => array(
					'class' => 'input',
					'tab'   => 'advanced',
					'item'  => 'advanced',
					'label' => Ai1ec_I18n::__( 'Move calendar into this DOM element' ),
					'type'  => 'normal',
					'help'  => Ai1ec_I18n::__(
						'Optional. Use this JavaScript-based shortcut to place the 
						calendar a DOM element other than the usual page content container 
						if you are unable to create an appropriate page template
						 for the calendar page. To use, enter a 
						<a target="_blank" href="http://api.jquery.com/category/selectors/">
						jQuery selector</a> that evaluates to a single DOM element. 
						Any existing markup found within the target will be replaced 
						by the calendar.'
					),
				),
				'default'  => '',
			),
			'skip_in_the_loop_check' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'advanced',
					'item'  => 'advanced',
					'label' => Ai1ec_I18n::__(
						'<strong>Skip <tt>in_the_loop()</tt> check </strong> that protects against multiple calendar output'
					),
					'help'  => Ai1ec_I18n::__(
						'Try enabling this option if your calendar does not appear on the calendar page. It is needed for compatibility with a small number of themes that call <tt>the_content()</tt> from outside of The Loop. Leave disabled otherwise.'
					),
				),
				'default'  => false,
			),
			'disable_gzip_compression' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'advanced',
					'item'  => 'advanced',
					'label' => Ai1ec_I18n::__(
						'Disable <strong>gzip</strong> compression. Use this option if calendar is non-responsive. Read <a href="http://support.time.ly/disable-gzip-compression/">more about</a> the issue.'
					),
				),
				'default'  => false,
			),
			'event_platform' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'advanced',
					'item'  => 'advanced',
					'label' => Ai1ec_I18n::__(
						' Turn this blog into an <strong>events-only platform</strong>'
					),
				),
				'default'  => false,
			),
			'event_platform_strict' => array(
				'type' => 'bool',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'advanced',
					'item'  => 'advanced',
					'label' => Ai1ec_I18n::__(
						'<strong>Strict</strong> event platform mode'
					),
					'help'  => Ai1ec_I18n::__(
						'Prevents plugins from adding menu items unrelated to calendar/media/user management'
					),
				),
				'default'  => false,
			),
		);
	}

	/**
	 * Register the standard setting values.
	 * 
	 */
	protected function _register_standard_values() {
		foreach ( $this->_standard_options as $key => $option ) {
			$renderer = isset( $option['renderer'] ) ? $option['renderer'] : null;
			$this->register( $key, $option['default'], $option['type'], $renderer );
		}
	}

}