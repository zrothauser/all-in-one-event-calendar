<?php

/**
 * Execution guard
 */
class Ai1ec_Compatibility_Xguard {

	/**
	 * Method acquire always return time of last acquisition.
	 * If execution guard with that name was never acquired it returns 0 (zero).
	 * If acquisition fails it returns false.
	 *
	 * @param  string  $name Name of acquisition
	 * @return boolean
	 */
	public function acquire( $name ) {
		$name = $this->safe_name( $name );
		$path = AI1EC_PATH . DIRECTORY_SEPARATOR . 'xguard_' . $name . '.log';
		$handle = fopen( $path, 'r+' );
		if ( ! $handle ) {
			return false;
		}
		$last = false;
		if ( flock( $handle, LOCK_EX ) ) {
			$last = (int)fread( $handle, 100 );
			$success = ftruncate( $handle, 0 );
			$success &= fwrite( $handle, time() );
			$success &= fflush( $handle );
			$success &= flock( $handle, LOCK_UN );
			$success &= fclose( $handle );
			if ( ! $success ) {
				return false;
			}
		}
		return $last;
	}

	/**
	 * Method release logs execution guard release phase.
	 *
	 * @param  string  $name Name of acquisition
	 * @return boolean
	 */
	public function release( $name ) {
		$name = $this->safe_name( $name );
		$path = AI1EC_PATH . DIRECTORY_SEPARATOR . 'xguard_' . $name . '.log';
		$handle = fopen( $path, 'r+' );
		if ( ! $handle ) {
			return false;
		}
		$last = false;
		if ( flock( $handle, LOCK_EX ) ) {
			$last = unlink( $path, $handle );
		}
		return $last;
	}

	/**
	 * Prepare safe file names.
	 *
	 * @param  string  $name Name of acquisition
	 * @return string
	 */
	protected function safe_name( $name ) {
		return sanitize_file_name( $name );
	}

}