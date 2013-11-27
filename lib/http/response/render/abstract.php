<?php
/**
 * Abstract strategy class to render the Request.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Http.Response.Render
 */
abstract class Ai1ec_Http_Response_Render_Strategy extends Ai1ec_Base {

	/**
	 * Dump output buffers before starting output
	 *
	 * @return bool True unless an error occurs
	 */
	protected function _dump_buffers() {
		// ob_end_clean() fails if any level of compression is set.
		$this->_registry->get( 'dbi.dbi' )->disable_debug();
		if ( ini_get( 'zlib.output_compression' ) ) {
			return false;
		}
		$result = true;
		while ( ob_get_level() ) {
			$result &= ob_end_clean();
		}
		return $result;
	}

	/**
	 * Render the output.
	 *
	 * @param array $params
	 */
	abstract public function render( array $params );

}