<?php

/**
 * This class is repsonsible for rendering a Bootstrap-colorpicker component.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Html
 */
class Ai1ec_Bootstrap_Colorpicker extends Ai1ec_Html_Element {

	/**
	 * @var string
	 */
	private $value;

	/**
	 * @var string
	 */
	private $label;
	/**
	 * @var string
	 */
	private $format = 'hex';
	/**
	 * @var boolean
	 */
	private $readonly = false;

	/**
	 * @param boolean $readonly
	 */
	public function set_readonly( $readonly ) {
		$this->readonly = $readonly;
	}

	/**
	 * @param string $format
	 */
	public function set_format( $format ) {
		$this->format = $format;
	}

	/**
	 * @param string $label
	 */
	public function set_label( $label ) {
		$this->label = $label;
	}

	public function __construct( Ai1ec_Registry_Object $registry, $color, $id ) {
		// Call the parent to set the template adapter.
		parent::__construct( $registry );
		$this->value = $color;
		$this->id = $id;
	}

	/**
	 *
	 * @see Ai1ec_Renderable::render()
	 *
	 */
	public function render() {
		$label = $this->label;
		$id    = $this->template_adapter->escape_attribute( $this->id );
		$value = $this->template_adapter->escape_attribute( $this->value );
		$label = isset( $this->label ) ?
			"<label class='control-label' for='$id'>$label</label>" :
			'';
		$readonly = $this->readonly === true ? 'readonly' : '';

		$args = array(
			'label' =>    $label,
			'readonly' => $readonly
		);
		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'control-group-open.twig', $args, true );
		return $file->render();

	}
}
