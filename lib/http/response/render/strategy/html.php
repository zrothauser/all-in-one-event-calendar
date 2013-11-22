<?php
/**
 * Render the request as html.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Http.Response.Render.Strategy
 */
class Ai1ec_Render_Strategy_Html extends Ai1ec_Http_Response_Render_Strategy {
	
	protected $_html;

	public function render( array $params ) {
		$this->_html = $params['data'];
		// Replace page content - make sure it happens at (almost) the very end of
		// page content filters (some themes are overly ambitious here)
		add_filter( 'the_content', array( $this, 'append_content' ), PHP_INT_MAX - 1 );
	}
	
	/**
	 * Append locally generated content to normal page content. By default,
	 * first checks if we are in The Loop before outputting to prevent multiple
	 * calendar display - unless setting is turned on to skip this check.
	 *
	 * @param  string $content Post/Page content
	 * @return string          Modified Post/Page content
	 */
	function append_content( $content ) {
		$settings = $this->_registry->get( 'model.settings' );
	
		// Include any admin-provided page content in the placeholder specified in
		// the calendar theme template.
		if ( $settings->get( 'skip_in_the_loop_check' ) || in_the_loop() ) {
			$content = str_replace(
				'<!-- AI1EC_PAGE_CONTENT_PLACEHOLDER -->',
				$content,
				$this->_html
			);
		}
	
		return $content;
	}
}