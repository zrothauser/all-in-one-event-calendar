<?php

/**
 * Internationalization layer.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.P28n
 */
class Ai1ec_I18n {

	/**
	 * Translates string. Wrapper for WordPress `__()` function.
	 *
	 * @param string $term Message to translate.
	 *
	 * @return string Translated string representation.
	 */
	static public function __( $term ) {
		return __( $term, AI1EC_PLUGIN_NAME );
	}

}