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
		$type,
		$renderer = 'Ai1ec_Html_Element_Settings'
	) {
		$value = null;
		if ( isset( $this->_options[$option] ) ) {
			$value = $this->_options[$option]['value'];
		} else {
			$this->_updated = true;
		}
		$this->_options[$option] = array(
			'name'     => $option,
			'value'    => $value,
			'type'     => $type,
			'renderer' => $renderer,
			'legacy'   => false,
		);
		return $this;
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
		if ( (string)$value !== (string)$this->_options[$option]['value'] ) {
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
	public function parse_legacy( $values ) {
		if ( ! $values instanceof Ai1ec_Settings ) {
			return (array)$values;
		}
		$result    = array();
		$variables = get_object_vars( $values );
		foreach ( $variables as $key => $value ) {
			$type = 'string';
			if ( is_array( $value ) ) {
				$type = 'array';
			} elseif ( is_bool( $value ) ) {
				$type = 'bool';
			}
			$result[$key] = array(
				'name'     => $key,
				'value'    => $value,
				'type'     => $type,
				'renderer' => 'Ai1ec_Html_Element_Settings',
				'legacy'   => true,
			);
		}
		return $result;
	}

	/**
	 * Check object state and update it's database representation as needed.
	 *
	 * @return void Destructor does not return.
	 */
	public function __destruct() {
		if ( $this->_updated ) {
			$this->_sys->get( 'option' )
				->set( self::WP_OPTION_KEY, $this->_options );
		}
	}

	/**
	 * Initiate options map from storage.
	 *
	 * @return void Return from this method is ignored.
	 */
	protected function __initialize() {
		$values         = $this->_sys->get( 'option' )
			->get( self::WP_OPTION_KEY, array() );
		$values = $this->parse_legacy( $values );
		$this->_options = $values;
		$this->_register_defaults();
		$this->_updated = false;
	}

	/**
	 * Initialize default (globally used) options.
	 *
	 * @return void Method does not return.
	 */
	protected function _register_defaults() {
		$this->register(
			'calendar_page_id',
			'int',
			'Ai1ec_Html_Element_Calendar_Page_Selector'
		);
	}

}