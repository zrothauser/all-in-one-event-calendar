<?php

/**
 * Model used for storing/retrieving plugin options.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Html
 */
class Ai1ec_Settings extends Ai1ec_App {

	/**
	 * @constant string Name of WordPress options key used to store settings.
	 */
	const WP_OPTION_KEY         = 'ai1ec_settings';

	/**
	 * @var array Map of value names and their representations.
	 */
	protected $_options         = array();


	/**
	 * @var array Map of value names and their representations.
	 */
	protected $_standard_options;

	/**
	 * @var bool Indicator for modified object state.
	 */
	protected $_updated         = false;

	/**
	 * Register new option to be used.
	 *
	 * @param string $option   Name of option.
	 * @param string $type     Option type to be used for validation.
	 * @param string $renderer Name of class to render the option.
	 *
	 * @return Ai1ec_Settings Instance of self for chaining.
	 */
	public function register(
		$option,
		$value,
		$type,
		$renderer
	) {
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
	 * Set new value for previously initialized option.
	 *
	 * @param string $option Name of option to update.
	 * @param mixed  $value  Actual value to be used for option.
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
		foreach ( $variables as $key => $value ) {
			$type = 'string';
			if ( is_array( $value ) ) {
				$type = 'array';
			} elseif ( is_bool( $value ) ) {
				$type = 'bool';
			} elseif ( is_int( $value ) ) {
				$type = 'int';
			}
			$result[$key] = array(
				'value'    => $value,
				'type'     => $type,
				'legacy'   => true,
			);
			if ( isset ( $this->_standard_options[$key]['renderer'] ) ) {
				$result[$key]['renderer'] = $this->_standard_options[$key]['renderer'];
			}
		}
		return $result;
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
		$success = $this->_sys->get( 'model.option' )
			->set( self::WP_OPTION_KEY, $this->_options );
		if ( $success ) {
			$this->_updated = false;
		}
		return $success;
	}

	/**
	 * Check object state and update it's database representation as needed.
	 *
	 * @return void No return is expected.
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
		$values  = $this->_sys->get( 'model.option' )
			->get( self::WP_OPTION_KEY, array() );
		$this->_updated = false;
		$values = array();
		if ( empty( $values ) ) {
			$this->_register_standard_values();
			$this->_updated = true;
		} else if ( $values instanceof Ai1ec_Settings ) {
			$values = $this->_parse_legacy( $values );
			$this->_updated = true;
		} else {
			$this->_options = $values;
		}
		$this->_sys->get( 'controller.shutdown' )->register(
			array( $this, 'shutdown' )
		);
	}

	protected function _set_standard_values() {
		$this->_standard_options = array(
			'ai1ec_db_version' => array(
				'type' => 'int',
				'default'  => false,
			),
			'ai1ec_calendar_id' => array(
				'type' => 'int',
				'renderer' => array(
					'class' => 'calendar-page-selector',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__( 'Calendar page:' )
				),
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
			'plugins_options' => array(
				'type' => 'array',
				'default'  => array(),
			),
			'show_location_in_title' => array(
				'type' => 'int',
				'renderer' => array(
					'class' => 'checkbox',
					'tab'   => 'viewing-events',
					'label' => Ai1ec_I18n::__(
						'<strong>Show location in event titles</strong> in calendar views'
					)
				),
				'default'  => false,
			),
		);
	}
	protected function _register_standard_values() {
		foreach ( $this->_standard_options as $key => $option ) {
			$renderer = isset( $option['renderer'] ) ? $option['renderer'] : null;
			$this->register( $key, $option['default'], $option['type'], $renderer );
		}
	}

}