<?php
class Ai1ec_Import_Export_Controller {
	protected $_engines = array();
	protected $_registry;
	
	/**
	 * This controller is instanciated only if we need to import/export something.
	 * When it is instanciated it allows other engines to be injected through a filter.
	 * If we do not plan to ship core engines, let's skip the $core_engines param.
	 * 
	 * @param Ai1ec_Object_Registry $registry
	 * @param array $core_engines
	 */
	public function __construct( 
			Ai1ec_Object_Registry $registry, 
			array $core_engines = array( 'ics' ) 
	) {
		$this->_registry = $registry;
		$known_engines   = apply_filters( 'ai1ec_register_import_export_engines', $core_engines );
		foreach ( $known_engines as $engine ) {
			$this->register( $engine );
		}
	}

	public function register( $engine ) {
		$this->_engines[$engine] = true;
	}

	public function import_events( $engine, $args ) {
		if ( ! isset( $this->_engines[$engine] ) ) {
			throw new Ai1ec_Engine_Not_Set_Exception( 'The engine ' . $engine . 'is not registered.' );
		}
		// external engines must register themselves into the registry.
		$engine = $this->_registry->get( 'import-export.' . $engine );
		$ex = null;
		try {
			return $engine->import( $args );
		} catch ( Ai1ec_Parse_Exception $e ) {
			$ex = $e;
		}
		throw $ex;
	}
}

?>