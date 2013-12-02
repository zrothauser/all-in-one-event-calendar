<?php

/**
 * Renderer of settings page input option.
 *
 * @author       Time.ly Network, Inc.
 * @instantiator new
 * @since        2.0
 * @package      Ai1EC
 * @subpackage   Ai1EC.Html
 */
class Ai1ec_Html_Setting_Input extends Ai1ec_Html_Element_Settings {

	
	/* (non-PHPdoc)
	 * @see Ai1ec_Html_Element_Settings::render()
	 */
	public function render( $output ) {
		$type  = $this->_args['renderer']['type'];
		$date  = $append = false;
		$class = '';
		switch ( $type ) {
			case 'date': 
				$date = true;
				$class = 'input-small';
				break;

			case 'append':
				$append = true;
				$class = 'input-mini';
				break;

			default:
				$class = 'input-xlarge';
		}

		$input_args = array(
			'class' => $class,
		);
		if ( true === $date ) {
			$settings    = $this->_registry->get( 'model.settings' );
			$input_args += array(
				'data-date-weekstart' => $settings->get( 'week_start_day' ),
				'data-date-format'    => $settings->get( 'input_date_format' ),
				'size'                => 8,
			);
		}
		$args = array(
			'id'         => $this->_args['id'],
			'label'      => $this->_args['renderer']['label'],
			'input_args' => $input_args,
			'value'      => $this->_args['value'],
		);
		if ( true === $append ) {
			$args['append'] = $this->_args['renderer']['append'];
		}
		if ( isset( $this->_args['renderer']['help'] ) ) {
			$args['help'] = $this->_args['renderer']['help'];
		}
		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'setting/input.twig', $args, true );
		return parent::render( $file->get_content() );
	}

}