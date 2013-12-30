<?php

/**
 * This class process event content.
 *
 * @author     Time.ly Network Inc.
 * @since      2.0
 *
 * @package    AI1EC
 * @subpackage AI1EC.View.Event
 */
class Ai1ec_View_Event_Content extends Ai1ec_Base {

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

	/**
	 * Generate the html for the "Back to calendar" button for this event.
	 *
	 * @return string
	 */
	public function get_back_to_calendar_button_html() {
		global $ai1ec_calendar_controller;
		$class     = '';
		$data_type = '';
		$href      = '';
		if ( isset( $_COOKIE['ai1ec_calendar_url'] ) ) {
			$href = json_decode(
				stripslashes( $_COOKIE['ai1ec_calendar_url'] )
			);
			setcookie( 'ai1ec_calendar_url', '', time() - 3600 );
		} else {
			$href = $this->_registry->get( 'html.element.href', array() );
			$href = $href->generate_href();
		}
		$text = Ai1ec_I18n::__( 'Back to Calendar' );
		$html = <<<HTML
<a class="ai1ec-calendar-link btn btn-small pull-right $class"
	 href="$href"
	 $data_type>
	<i class="icon-arrow-left"></i> $text
</a>
HTML;
		return apply_filters( 'ai1ec_get_back_to_calendar_html', $html, $href );
	}

	/**
	 * Simple regex-parse of post_content for matches of <img src="foo" />; if
	 * one is found, return its URL.
	 *
	 * @param   null       $size           (width, height) array of returned image
	 *
	 * @return  string|null
	 */
	public function get_content_img_url( Ai1ec_Event $event, &$size = null ) {
		preg_match(
			'/<img([^>]+)src=["\']?([^"\'\ >]+)([^>]*)>/i',
			$event->get( 'post' )->post_content,
			$matches
		);
		// Check if we have a result, otherwise a notice is issued.
		if ( empty( $matches ) ) {
			return null;
		}
	
		$url = $matches[2];
		$size = array( 0, 0 );
	
		// Try to detect width and height.
		$attrs = $matches[1] . $matches[3];
		$matches = null;
		preg_match_all(
			'/(width|height)=["\']?(\d+)/i',
			$attrs,
			$matches,
			PREG_SET_ORDER
		);
		// Check if we have a result, otherwise a notice is issued.
		if ( ! empty( $matches ) ) {
			foreach ( $matches as $match ) {
				$size[ $match[1] === 'width' ? 0 : 1 ] = $match[2];
			}
		}
	
		return $url;
	}
}