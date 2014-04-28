<?php

/**
 * Renderer of settings page html.
 *
 * @author       Time.ly Network, Inc.
 * @instantiator new
 * @since        2.0
 * @package      Ai1EC
 * @subpackage   Ai1EC.Html
 */
class Ai1ec_Html_Setting_Cache extends Ai1ec_Html_Element_Settings {

	/* (non-PHPdoc)
	 * @see Ai1ec_Html_Element_Settings::render()
	 */
	public function render( $output = '' ) {
		$file   = $this->_args['id'] . '.twig';
		$method = 'get_' . $this->_args['id'] . '_args';
		$args   = array();
		if ( method_exists( $this, $method ) ) {
			$args = array_merge( $args, $this->{$method}() );
		}
		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'setting/' . $file, $args, true );
		return parent::render( $file->get_content() );
	}

	/**
	 * Returns data for Twig template.
	 *
	 * @return array Data for template
	 */
	public function get_twig_cache_args() {
		$args = array(
			'cache_available' => (
				AI1EC_CACHE_UNAVAILABLE !== $this->_args['value'] &&
				! empty( $this->_args['value'] )
			),
			'id'              => $this->_args['id'],
			'label'           => $this->_args['renderer']['label'],
			'text'            => array(
				'refresh' => Ai1ec_I18n::__( 'Click to perform rescan' ),
				'nocache' => Ai1ec_I18n::__( 'Cache is unavailable' ),
				'okcache' => Ai1ec_I18n::__( 'Cache is available' ),
				'rescan'  => Ai1ec_I18n::__( 'Rescanning cache... Please wait...' ),
			),
		);

		return $args;
	}
}