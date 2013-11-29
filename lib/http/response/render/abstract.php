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

		$this->_registry->get( 'dbi.dbi' )->disable_debug();
		if ( ini_get( 'zlib.output_compression' ) ) {
			return false;
		}

		return $this
			->_registry
			->get( 'compatibility.outputbuffer' )
			->end_clean();

	}

	/**
	 * Render the output.
	 *
	 * @param array $params
	 */
	abstract public function render( array $params );

}