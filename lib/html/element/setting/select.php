<?php

/**
 * Renderer of settings page select option.
 *
 * @author       Time.ly Network, Inc.
 * @instantiator new
 * @since        2.0
 * @package      Ai1EC
 * @subpackage   Ai1EC.Html
 */
class Ai1ec_Html_Setting_Select extends Ai1ec_Html_Element_Settings {

	
	/* (non-PHPdoc)
	 * @see Ai1ec_Html_Element_Settings::render()
	 */
	public function render( $output ) {
		$options = $this->_args['renderer']['options'];
		if ( ! is_array( $options ) ) {
			$options = $this->{$options}();
		} else {
			foreach ( $options as &$option ) {
				if ( $option['value'] === $this->_args['value'] ) {
					$option['args'] = array(
						'selected' => 'selected',
					);
				}
			}
		}
		
		$select_args = array(
			'class' => 'inputwidth'
		);
		$args = array(
			'id'         => $this->_args['id'],
			'label'      => $this->_args['renderer']['label'],
			'attributes' => $select_args,
			'options'    => $options,
		);
		$loader = $this->_registry->get( 'theme.loader' );
		$file   = $loader->get_file( 'setting/select.twig', $args, true );
		return parent::render( $file->get_content() );
	}

	/**
	 * Gets the options for the "Starting day of week" select.
	 * 
	 * @return array
	 */
	protected function get_weekdays() {
		$locale  = $this->_registry->get( 'p28n.wpml' );
		$options = array();
		for ( $day_index = 0; $day_index <= 6; $day_index++ ) {
			$option = array(
				'text'  => $locale->get_weekday( $day_index ),
				'value' => $day_index,
			);
			if ( $this->_args['value'] === $day_index ) {
				$option['args'] = array(
					'selected' => 'selected',
				);
			}
			$options[] = $option;
		}
		return $options;
	}

}