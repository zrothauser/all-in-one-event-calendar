<?php

abstract class Ai1ec_Http_Response_Render_Strategy {

	/**
	 * Dump output buffers before starting output
	 *
	 * @return bool True unless an error occurs
	 */
	protected function _dump_buffers() {
		$result = true;
		while ( ob_get_level() ) {
			$result &= ob_end_clean();
		}
		return $result;
	}

	abstract public function render( array $params );
}