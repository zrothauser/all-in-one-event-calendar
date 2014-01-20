<?php

/**
 * Renderer of settings page Calendar page selection snippet.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Html
 */
class Ai1ec_Html_Element_Enabled_Views
    extends Ai1ec_Html_Element_Settings {
	
	public function render( $output = '' ) {
		fb($this->_args);
		$this->_convert_values();
		$args = array( 
			'views' => $this->_args['value'],
			'label' => $this->_args['renderer']['label'],
		);
		$loader = $this->_registry->get( 'theme.loader' );
		return $loader->get_file( 'setting/enabled-views.twig', $args, true )
			->get_content();
	}
	
	protected function _convert_values() {
		foreach( $this->_args['value'] as &$view ) {
			$view['enabled'] ? 
				$view['enabled'] = 'checked="checked"' : 
				$view['enabled'] = '';
			$view['default'] ?
				$view['default'] = 'checked="checked"' :
				$view['default'] = '';
		}
	}
}