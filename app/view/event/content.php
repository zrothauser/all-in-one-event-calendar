<?php

/**
 * The Calendar Feeds page.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View.Event
 */
class Ai1ec_View_Evenet_Content extends Ai1ec_Base {

	/**
	 * event_excerpt function
	 *
	 * Overrides what wp_trim_excerpt() returned if the post is an event,
	 * and outputs better rich-text (but not too rich) excerpt instead.
	 *
	 * @param string $content Event content.
	 *
	 * @return void
	 **/
	public function event_excerpt( $content ) {
		if ( ! $this->_registry->get( 'acl.aco' )->is_our_post_type() ) {
			return $content;
		}

		$event = $this->_registry->get( 'model.event', get_the_ID() );

		$this->_registry->get( 'compatibility.ob' )->start();

		$this->excerpt_view( $event );

		// Re-apply any filters to the post content that normally would have been
		// applied if it weren't for our interference (below).
		echo shortcode_unautop( wpautop(
				$this->_registry->get( 'Ai1ec_Event_Helper' )->trim_excerpt(
					apply_filters( 'the_content', $event->post->post_content )
				)
		) );

		$page_content = $this->_registry->get( 'compatibility.ob' )->get_clean();
		$this->_registry->get( 'compatibility.ob' )->end_clean();

		return $page_content;
	}

	/**
	 * event_excerpt_noautop function
	 *
	 * Conditionally apply wpautop() filter to content, only if it is not an
	 * event.
	 *
	 * @param string $content Event content.
	 *
	 * @return void
	 **/
	public function event_excerpt_noautop( $content ) {
		if ( ! $this->_registry->get( 'acl.aco' )->is_our_post_type() ) {
			return wpautop( $content );
		}
		return $content;
	}

	/**
	 * Outputs event-specific details as HTML to be prepended to post content
	 * when displayed in an excerpt format.
	 *
	 * @param Ai1ec_Event $event  The event being displayed
	 *
	 * @return void
	 */
	public function excerpt_view( Ai1ec_Event $event ) {
		$location = esc_html(
			str_replace( "\n", ', ', rtrim( $event->get_location() ) )
		);

		$args = array(
			'timespan_html' => $event->get_timespan_html(),
			'location'      => $location,
		);

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/event-excerpt.twig',
			$args,
			false
		);

		echo $template->get_content();
	}
}