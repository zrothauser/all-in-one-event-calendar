<?php

/**
 * Wrapper for all the output buffer calls (ob_*)
 */
class Ai1ec_Compatibility_OutputBuffer {

	/**
	 * Wrap the ob_end_flush() method:
	 * Flush (send) the output buffer and turn off output buffering
	 *
	 * @return bool Returns TRUE on success or FALSE on failure
	 */
	public function end_flush() {
		return ob_end_flush();
	}

	/**
	 * Wrap the ob_get_contents() method:
	 * Return the contents of the output buffer
	 *
	 * @retrun string This will return the contents of the output buffer or
	 * FALSE, if output buffering isn't active.
	 */
	public function get_contents() {
		return ob_get_contents();
	}

	/**
	 * Wrap the ob_get_level() method:
	 * Returns the nesting level of the output buffering mechanism.
	 *
	 * @return int Returns the level of nested output buffering handlers or zero
	 * if output buffering is not active.
	 */
	public function get_level() {
		return ob_get_level();
	}

	/**
	 * Wrap the ob_start() method:
	 * This function will turn output buffering on.
	 *
	 * @param null $output_callback
	 * @param int $chunk_size
	 * @param int $flags
	 * @return bool Returns TRUE on success or FALSE on failure.
	 */
	public function start(
		$output_callback = null,
		$chunk_size      = 0,
		$flags           = PHP_OUTPUT_HANDLER_STDFLAGS
	) {
		return ob_start( $output_callback, $chunk_size, $flags );
	}

	/**
	 * Wrap ob_end_clean() and check the zip level to avoid crashing:
	 * Clean (erase) the output buffer and turn off output buffering
	 *
	 * @return bool Returns TRUE on success or FALSE on failure
	 */
	public function end_clean() {
		return ob_end_clean();
	}

	/**
	 * Handle the closing of the object buffer when more then one object buffer
	 * is opened. This cause an error if it's not correctly handled
	 *
	 * @return bool Returns TRUE on success or FALSE on failure
	 */
	public function end_clean_all() {
		$level   = $this->get_level();
		$success = true;
		while ( $level ) {
			$this->end_clean();
			$new_level = $this->get_level();
			if ( $new_level === $level ) {
				$success = false;
				break;
			}
			$level = $new_level;
		}
		return $success;
	}

	/**
	 * Wrap the ob_get_clean() method:
	 * Gets the current buffer contents and delete current output buffer.
	 *
	 * @return string Returns the contents of the output buffer and end output
	 * buffering. If output buffering isn't active then FALSE is returned.
	 */
	public function get_clean(){
		return ob_get_clean();
	}
}