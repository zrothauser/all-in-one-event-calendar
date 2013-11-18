<?php
/**
 *
 * @author Timely Network Inc
 *
 * This class is responsible for rendering an HTML select element.
 */

class Ai1ec_Html_Element_Select extends Ai1ec_Html_Element {

	/**
	 * @var string
	 */
	private $values = array();

	/**
	 * @var array
	 */
	private $options = array();

	public function __construct( $id, $name = null ) {
		if ( null === $name ) {
			$name = $id;
		}
		parent::__construct();
		$this->id = $id;
		$this->set_attribute( 'name', $name );
	}

	/**
	 * Selects can have more than one value ( multiselects )
	 *
	 * @param string $value
	 */
	public function set_value( $value ) {
		if ( is_array( $value ) ) {
			foreach ( $value as $val ) {
				$this->values[$val] = true;
			}
		} else {
			$this->values[$value] = true;
		}
	}

	/**
	 * Adds an option to the select
	 *
	 * @param string $text
	 * @param string $value
	 */
	public function add_option( $text, $value = null, $attrs = array() ) {
		$option = $this->_registry->get(
			'html.element.legacy.generic-tag',
			'option'
		);
		if ( null === $value ) {
			$value = $text;
		}
		$option->set_attribute( 'value', $value );
		$option->set_text( $text );
		foreach ( $attrs as $name => $value ) {
			$option->set_attribute( $name, $value );
		}
		$this->options[] = $option;
	}

	/**
	 *
	 * @see Ai1ec_Renderable::render()
	 *
	 */
	public function render() {
		$select = $this->_registry->get(
			'html.element.legacy.generic-tag',
			'select'
		);
		$select->set_id( $this->id );
		foreach ( $this->attributes as $name => $value ) {
			$select->set_attribute( $name, $value );
		}
		foreach ( $this->classes as $class ) {
			$select->add_class( $class );
		}
		foreach ( $this->options as $option ) {
			$value = $option->get_attribute( 'value' );
			if ( isset( $this->values[$value[0]] ) ) {
				$option->set_attribute( 'selected', 'selected' );
			}
			$select->add_renderable_children( $option );
		}
		$select->render();
	}

}
