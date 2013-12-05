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
abstract class Ai1ec_Less_Variable extends Ai1ec_Html_Element {

	/**
	 * @var string
	 */
	protected $id;

	/**
	 * @var string
	 */
	protected $description;

	/**
	 * @var string
	 */
	protected $value;

	/**
	 * @var Ai1ec_Renderable
	 */
	protected $renderable;

	/**
	 * it takes an array of parameters and a renderable.
	 *
	 * @param Ai1ec_Registry_Object $registry
	 * @param array $params
	 * @internal param \Ai1ec_Renderable $renderable
	 */
	public function __construct( Ai1ec_Registry_Object $registry, array $params ) {
		parent::__construct( $registry );
		$this->id          = $params['id'];
		$this->description = $params['description'];
		$this->value       = $params['value'];

	}

	/**
	 * Render the opening part of the control group html
	 *
	 * @return string
	 */
	protected function render_opening_of_control_group() {

		$args = array(
			'label' => $this->description,
			'id'    => $this->template_adapter->escape_attribute( $this->id )
		);
		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'control-group-open.twig', $args, true );
		return $file->render();
	}

	/**
	 * Render the closing part of the control group html
	 *
	 * @return string
	 */
	protected function render_closing_of_control_group() {
		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'control-group-close.twig', null, true );
		return $file->render();
	}
}
