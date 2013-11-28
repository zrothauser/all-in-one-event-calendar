<?php

/**
 * Renderer of settings page Calendar page selection snippet.
 *
 * @author     Time.ly Network, Inc.
 * @instantiator new
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Html
 */
class Ai1ec_Html_Settings_Checkbox extends Ai1ec_Html_Element_Settings {
	public function render( $output = '' ) {
		$attributes = array(
			'class' => 'checkbox',
		);
		if ( true === $this->_args['value'] ) {
			$attributes['checked'] = 'checked';
		}
		$args = $this->_args;
		$args['attributes'] = $attributes;
		$loader = $this->_registry->get( 'theme.loader' );
		$file = $loader->get_file( 'setting/checkbox.twig', $args, true );
		return $file->get_content();
	}
}