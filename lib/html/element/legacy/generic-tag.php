<?php

/**
 * @author Timely Network Inc
 *
 * This class is responsible for rendering a generic HTML tag.
 */
class Ai1ec_Generic_Html_Tag extends Ai1ec_Html_Element_Can_Have_Children {

	/**
	 * @var string the tag type
	 */
	private $type;

	/**
	 * @var string
	 */
	private $text;
	
	/**
	 * @var boolean
	 */
	private $prepend_text = true;

	/**
	 * @param boolean $prepend_text
	 */
	public function set_prepend_text( $prepend_text ) {
		$this->prepend_text = $prepend_text;
	}

	/**
	 * @param string $text
	 */
	public function set_text( $text ) {
		$this->text = $text;
	}

	/**
	 * @param string $type
	 */
	public function set_type( $type ) {
		$this->type = $type;
	}

	/**
	 * (non-PHPdoc)
	 * @see Ai1ec_Renderable::render()
	 */
	public function render() {
		$class = $this->create_class_markup();
		$id = $this->create_attribute_markup( 'id', $this->id );
		$attributes = $this->render_attributes_markup();
		echo "<{$this->type} $class $id $attributes>";
		if( true === $this->prepend_text ) {
			echo $this->text;
		}
		foreach( $this->container->renderables as $renderable ) {
			$renderable->render();
		}
		if( false === $this->prepend_text ) {
			echo $this->text;
		}
		echo "</{$this->type}>";
	}

	public function __construct( $type ) {
		parent::__construct();
		$this->type = $type;
	}
}
