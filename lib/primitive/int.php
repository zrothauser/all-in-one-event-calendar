<?php

/**
 * Integers manipulation class.
 *
 * @author       Time.ly Network, Inc.
 * @since        2.0
 * @package      Ai1EC
 * @subpackage   Ai1EC.Primitive
 */
final class Ai1ec_Primitive_Int {

	/**
	 * Cast input as non-negative integer.
	 *
	 * @param string $input Arbitrary scalar input.
	 *
	 * @return int Non-negative integer parsed from input.
	 */
	public function positive( $input ) {
		$input = (int)$input;
		if ( $input < 1 ) {
			return 0;
		}
		return $input;
	}

}