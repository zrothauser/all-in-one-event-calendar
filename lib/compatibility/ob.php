<?php

/**
 * Wrapper for ob_get_clean() to prevent fail under some circumstances
 */
class Ai1ec_Compatibility_OutputBuffer {

	/**
	 * Wrap the ob_end_flush() method:
	 * Flush (send) the output buffer and turn off output buffering
	 */
	public function end_flush(){
		return ob_end_flush();
	}

	/**
	 * Wrap the ob_get_contents() method:
	 * Return the contents of the output buffer
	 */
	public function get_contents(){
		return ob_get_contents();
	}

	/**
	 * Wrap the ob_get_level() method:
	 * Returns the nesting level of the output buffering mechanism.
	 */
	public function get_level(){
		return ob_get_level();
	}

	/**
	 * Wrap the ob_start() method:
	 * This function will turn output buffering on.
	 */
	public function start( $output_callback = NULL,
		$chunk_size = 0,
		$flags = PHP_OUTPUT_HANDLER_STDFLAGS
	){
		return ob_start( $output_callback, $chunk_size, $flags);
	}

	/**
	 * Wrap ob_end_clean() and check the zip level to avoid crashing:
	 * Clean (erase) the output buffer and turn off output buffering
	 */
	public function end_clean(){

		$level = ob_end_clean();
		while ( $level ) {
			ob_end_clean();
			$new_level = ob_get_level();
			if ( $new_level === $level ) {
				break;
			}
			$level = $new_level;
		}

		return true;

	}
}