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

	public function get_post_excerpt( Ai1ec_Event $event ) {
		$content = strip_tags(
			strip_shortcodes(
				preg_replace(
					'#<\s*script[^>]*>.+<\s*/\s*script\s*>#x',
					'',
					apply_filters(
						'the_content',
						$event->get( 'post' )->post_content
					)
				)
			)
		);
		$content = preg_replace( '/\s+/', ' ', $content );
		$words = explode( ' ', $content );
		if ( count( $words ) > 25 ) {
			return implode(
				' ',
				array_slice( $words, 0, 25 )
			) . ' [...]';
		}
		return $content;
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