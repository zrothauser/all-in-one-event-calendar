<?php

/**
 * This class represent a LESS variable of type font.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Less
 */
class Ai1ec_Less_Variable_Font extends Ai1ec_Less_Variable {

	const CUSTOM_FONT = 'custom';

	const CUSTOM_FONT_ID_SUFFIX = '_custom';

	private $use_custom_value = false;

	private $custom_value;

	/**
	 *
	 * @var array
	 */
	private $fonts = array(
		'Arial'               => 'Arial, Helvetica, sans-serif',
		'Arial Black'         => '"Arial Black", Gadget, sans-serif',
		'Comic Sans MS'       => '"Comic Sans MS", cursive',
		'Courier New'         => '"Courier New", monospace',
		'Georgia'             => 'Georgia, Georgia, serif',
		'Helvetica Neue'      => '"Helvetica Neue", Helvetica, Arial, sans-serif',
		'League Gothic'       => '"League Gothic", Impact, "Arial Black", Arial, sans-serif',
		'Impact'              => 'Impact, Charcoal, sans-serif',
		'Lucida Console'      => '"Lucida Console", Monaco, monospace',
		'Lucida Sans Unicode' => '"Lucida Sans Unicode", Lucida Grande, sans-serif',
		'MS Sans Serif'       => '"MS Sans Serif", Geneva, sans-serif',
		'MS Serif'            => '"MS Serif", "New York", serif',
		'Palatino'            => '"Palatino Linotype", "Book Antiqua", Palatino, serif',
		'Tahoma'              => 'Tahoma, Geneva, sans-serif',
		'Times New Roman'     => '"Times New Roman", Times, serif',
		'Trebuchet Ms'        => '"Trebuchet MS", "Lucida Grande", sans-serif',
		'Verdana'             => 'Verdana, Geneva, sans-serif',

	);

	/**
	 * @param Ai1ec_Registry_Object $registry
	 * @param array $params
	 */
	public function __construct( Ai1ec_Registry_Object $registry, array $params ) {
		$this->fonts[__( "Custom...", AI1EC_PLUGIN_NAME )] = self::CUSTOM_FONT;
		$select = Ai1ec_Helper_Factory::create_select_instance(
			$params['id']
		);
		$select->add_class( 'ai1ec_font' );
		parent::__construct( $registry, $params );
		$this->renderable = $this->set_up_renderable( $select );

	}
	/**
	 * (non-PHPdoc)
	 * add the fonts
	 * @see Ai1ec_Less_Variable::set_up_renderable()
	 */
	public function set_up_renderable( Ai1ec_Renderable $renderable ) {
		foreach( $this->fonts as $text => $key ) {
			$renderable->add_option( $text, $key );
		}
		if( ! in_array( $this->value, $this->fonts ) ) {
			$this->use_custom_value = true;
			$this->custom_value = $this->value;
			$this->value = self::CUSTOM_FONT;
		}
		$renderable->set_value( $this->value );
		return $renderable;
	}

	/**
	 * (non-PHPdoc)
	 * @see Ai1ec_Less_Variable::render()
	 */
	public function render() {
		$input = Ai1ec_Helper_Factory::create_input_instance();
		$input->set_name( $this->id . self::CUSTOM_FONT_ID_SUFFIX );
		$input->set_id( $this->id . self::CUSTOM_FONT_ID_SUFFIX );
		if( $this->value !== self::CUSTOM_FONT ) {
			$input->add_class( 'hide' );
		} else {
			$input->set_value( $this->custom_value );
		}
		$input->add_class( 'ai1ec-custom-font' );
		$input->set_attribute(
			'placeholder',
			__( "Enter custom font(s)", AI1EC_PLUGIN_NAME )
		);
		echo $this->render_opening_of_control_group();
		$this->renderable->render();
		echo ' '; // Required for adequate spacing between <select> and <input>.
		$input->render();
		echo $this->render_closing_of_control_group();
	}
}
