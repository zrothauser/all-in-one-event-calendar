<?php

/**
 * This class represent a LESS variable of type size.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Less
 */
class Ai1ec_Less_Variable_Size extends Ai1ec_Less_Variable {

	public function __construct( Ai1ec_Registry_Object $registry, array $params ) {
		parent::__construct( $registry, $params );
	}

	/**
	 *
	 * @see Ai1ec_Renderable::render()
	 *
	 */
	public function render() {
		$input = Ai1ec_Helper_Factory::create_input_instance();
		$input->set_name( $this->id );
		$input->set_id( $this->id );
		$input->add_class( 'input-mini' );
		$input->add_class( 'ai1ec-less-variable-size' );
		$input->set_value( $this->value );
		$input->set_attribute( 'placeholder', __( 'Length', AI1EC_PLUGIN_NAME ) );
		echo $this->render_opening_of_control_group();
		$input->render();
		echo $this->render_closing_of_control_group();
	}
}
