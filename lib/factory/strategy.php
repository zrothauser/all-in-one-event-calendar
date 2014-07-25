<?php

/**
 * A factory class for caching strategy.
 *
 * @author     Time.ly Network, Inc.
 * @since      2.0
 * @package    Ai1EC
 * @subpackage Ai1EC.Factory
 */
class Ai1ec_Factory_Strategy extends Ai1ec_Base {

	/**
	 * create_cache_strategy_instance method
	 *
	 * Method to instantiate new cache strategy object
	 *
	 * @param string $cache_dirs Cache directory to use
	 * @param array   $skip_small_bits Set to true, to ignore small entities
	 *                                cache engines, as APC [optional=false]
	 *
	 * @return Ai1ec_Cache_Strategy Instantiated writer
	 */
	public function create_cache_strategy_instance(
		$cache_dirs = null,
		$skip_small_bits = false
	) {
		$engine = null;
		$name   = '';
		if ( true !== $skip_small_bits && Ai1ec_Cache_Strategy_Apc::is_available() ) {
			$engine = $this->_registry->get( 'cache.strategy.apc' );
		} else if (
			null !== $cache_dirs &&
			$cache_dir = $this->_get_writable_cache_dir( $cache_dirs )
		) {
			$engine = $this->_registry->get( 'cache.strategy.file', $cache_dir );
		} else if ( true !== $skip_small_bits ) {
			$engine = $this->_registry->get(
				'cache.strategy.db',
				$this->_registry->get( 'model.option' )
			);
		} else {
			$engine = $this->_registry->get( 'cache.strategy.void' );
		}
		return $engine;
	}

	/**
	 * create_persistence_context method
	 *
	 * @param string               $key_for_persistance
	 * @param Ai1ec_Cache_Strategy $cache_strategy
	 * @param string               $cache_dirs
	 *
	 * @return Ai1ec_Persistence_Context Instance of persistance context
	 */
	public function create_persistence_context(
		$key_for_persistance,
		$cache_dirs = null,
		$skip_small_bits = false
	) {
		return new Ai1ec_Persistence_Context(
			$key_for_persistance,
			$this->create_cache_strategy_instance( $cache_dirs, $skip_small_bits )
		);
	}

	/**
	 * Get a writable directory if possible, falling back on wp_contet dir
	 * 
	 * @param array $cache_dirs
	 * @return boolean|string
	 */
	protected function _get_writable_cache_dir( $cache_dirs ) {
		$writable_folder = false;
		foreach ( $cache_dirs as $cache_dir ) {
			if ( $this->_is_cache_dir_writable( $cache_dir['path'] ) ) {
				$writable_folder = $cache_dir;
				break;
			}
		}
		return $writable_folder;
	}

	/**
	 * _is_cache_dir_writable method
	 *
	 * Check if given cache directory is writable.
	 *
	 * @param string $directory A path to check for writability
	 *
	 * @return bool Writability
	 */
	protected function _is_cache_dir_writable( $directory ) {
		static $cache_directories = array();
		if ( ! isset( $cache_directories[$directory] ) ) {
			$filesystem = $this->_registry->get( 'filesystem.checker' );
			$cache_directories[$directory] = $filesystem->is_writable(
				$directory
			);
		}
		return $cache_directories[$directory];
	}
}
