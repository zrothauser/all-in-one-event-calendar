<?php

/**
 * Events Controller
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.Controller
 */
class Ai1ec_Events_Controller extends Ai1ec_Base {

	/**
	 * Handle clean-up when post is deleted.
	 *
	 * @wp_hook delete_post Before performing actual delete.
	 *
	 * @param int $post_id ID of post being removed.
	 *
	 * @return bool Success.
	 */
	public function delete( $post_id ) {
		$dbi   = $this->_registry->get( 'dbi.dbi' );
		$where = array( 'post_id' => (int)$post_id );
		$dbi->delete( 'ai1ec_events',          $where, array( '%d' ) );
		$dbi->delete( 'ai1ec_event_instances', $where, array( '%d' ) );
		return true;
	}

	public function get_events() {
		$start  = $this->_registry->get( 'date.time', strtotime( '-1 month' ) );
		$end    = $this->_registry->get( 'date.time', strtotime( '+1 month' ) );
		$events = $this->_registry->get( 'model.search' )
			->get_events_between( $start, $end );

		$template = $this->_registry->get( 'theme.loader' )->get_file(
			'twig/event-list.twig',
			compact( 'events', 'start', 'end' ),
			false
		);

		return $template->get_content();
	}

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
		if ( get_post_type() != AI1EC_POST_TYPE ) {
			return $content;
		}

		$event = new Ai1ec_Event( $this->_registry, get_the_ID() );

		ob_start();

		$this->excerpt_view( $event );

		// Re-apply any filters to the post content that normally would have been
		// applied if it weren't for our interference (below).
		echo shortcode_unautop( wpautop(
				$this->_registry->get( 'Ai1ec_Event_Helper' )->trim_excerpt(
					apply_filters( 'the_content', $event->post->post_content )
				)
		) );

		$page_content = ob_get_contents();
		ob_end_clean();

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
		if ( get_post_type() != AI1EC_POST_TYPE ) {
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