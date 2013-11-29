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
class Ai1ec_Validator_Numeric_Or_Default extends Ai1ec_Validator {
	
	public function validate() {
		if ( ! is_numeric( $this->_value ) ) {
			throw new Ai1ec_Value_Not_Valid_Exception();
		}
		return (int)$this->_value;
	}
}