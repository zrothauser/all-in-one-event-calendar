<?php

/**
 * This class represents a LESS variable of type color. It supports hex, rgb
 * and rgba formats.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Less
 */
class Ai1ec_Less_Variable_Color extends Ai1ec_Less_Variable {

	public function __construct( Ai1ec_Registry_Object $registry, $params ) {
		$bootstrap_colorpicker = Ai1ec_Helper_Factory::create_bootstrap_colorpicker_instance(
			$params['value'],
			$params['id']
		);
		parent::__construct( $registry, $params );
		$this->renderable = $this->set_up_renderable( $bootstrap_colorpicker );
	}

	public function render() {
		$this->renderable->render();
	}
	/**
	 * (non-PHPdoc)
	 * Set up the color picker
	 * @see Ai1ec_Less_Variable::set_up_renderable()
	 */
	private function set_up_renderable( Ai1ec_Renderable $renderable ) {
		$renderable->set_label( $this->description );
		if( substr($this->value, 0, 3) === 'rgb' ) {
			if( substr($this->value, 0, 4) === 'rgba' ) {
				$renderable->set_format( 'rgba' );
			} else {
				$renderable->set_format( 'rgb' );
			}
		}
		return $renderable;
	}

}
