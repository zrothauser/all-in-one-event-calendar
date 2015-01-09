<?php

/**
 * Wrapper for Twig_Environment
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Twig
 */
class Ai1ec_Twig_Environment extends Twig_Environment {

	/**
	 * @var Ai1ec_Registry_Object The registry Object.
	 */
	protected $_registry = null;

	/**
	 * Loads a template by name.
	 *
	 * @param string  $name	 The template name
	 * @param integer $index The index if it is an embedded template
	 *
	 * @return Twig_TemplateInterface A template instance representing the given template name
	 */
	public function loadTemplate( $name, $index = null ) {
		try {
			return parent::loadTemplate( $name, $index );
		} catch ( RuntimeException $excpt ) {
			/*
			 * We should not rely on is_writable - WP Engine case.
			 * I've made twig directory read-only and is_writable was returning
			 * true.
			 */
			$this->_registry->get(
				'twig.cache'
			)->set_unavailable( $this->cache );
			/*
			 * Some copy paste from original Twig method. Just to avoid first
			 * error during rendering.
			 */
			$cls = $this->getTemplateClass( $name, $index );
			eval(
				'?>' .
				$this->compileSource(
					$this->getLoader()->getSource( $name ),
					$name
				)
			);
			return $this->loadedTemplates[$cls] = new $cls($this);
		}
	}

	/**
	 * Set Ai1ec_Registry_Object
	 *
	 * @param Ai1ec_Registry_Object $registry
	 *
	 * @return void
	 */
	public function set_registry( Ai1ec_Registry_Object $registry ) {
		$this->_registry = $registry;
	}

}
