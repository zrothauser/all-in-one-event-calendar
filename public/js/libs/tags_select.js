timely.define(
	[
		"jquery_timely",
		"external_libs/select2"
	],
	function( $ ) {
	 // jshint ;_;

	/**
	 * Initialize any tag selectors on the page. Limit search to $container
	 * parent element if provided.
	 *
	 * @param  {object} $container jQuery object representing parent container
	 */
	var init = function( $container ) {
		if ( typeof $container === 'undefined' ) {
			$container = $( document );
		}
		$( '.ai1ec-tags-selector', $container ).each( function() {
			var $this = $( this );
			$this
				.select2( {
					tags: $this.data( 'ai1ecTags' ),
					tokenSeparators: [ ',' ]
				} );
		} );
	};

	/**
	 * Refresh any tag selectors on the page, usually to allow absolutely
	 * positioned components to be properly aligned when the selector is shown.
	 * Limit search to $container parent element if provided.
	 *
	 * @param  {object} $container jQuery object representing parent container
	 */
	var refresh = function( $container ) {
		$( '.ai1ec-tags-selector.select2-container', $container ).each( function() {
			$( this ).data( 'select2' ).resizeSearch();
		} );
	};

	return {
		init: init,
		refresh: refresh
	};
} );
