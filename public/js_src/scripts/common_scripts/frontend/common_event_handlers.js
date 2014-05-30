define(
	[
		"jquery_timely"
	],
	function( $ ) {
	"use strict"; // jshint ;_;

	/**
	 * Handler for popover trigger: mouseenter.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_popover_over = function( e ) {
		var $this = $( this ),
				$pop_content = $this.next( '.ai1ec-popup' ),
				el_content_data, el_classes_data, popover_placement;

		// If no popover found, quit.
		if ( $pop_content.length === 0 ) {
			return;
		}

		el_content_data = $pop_content.html();
		el_classes_data = $pop_content.attr( 'class' );

		// Position popover to the left only if there's room for it within the
		// bounds of the view (popovers are 182 pixels wide, a product of padding
		// and inner width as defined in style.less).
		var $bounds = $this.closest( '#ai1ec-calendar-view' );
		if ( $bounds.length === 0 ) {
			$bounds = $( 'body' );
		}
		if ( $this.offset().left - $bounds.offset().left > 182 ) {
			popover_placement = 'left';
		} else {
			popover_placement = 'right';
		}

		$this.constrained_popover( {
			content: el_content_data,
			title: '',
			placement: popover_placement,
			trigger: 'manual',
			html: true,
			template:
				'<div class="timely ai1ec-popover ' + el_classes_data + '">' +
					'<div class="ai1ec-arrow"></div>' +
					'<div class="ai1ec-popover-inner">' +
						'<div class="ai1ec-popover-content"><div></div></div>' +
					'</div>' +
				'</div>',
			container: 'body'
		}).constrained_popover( 'show' );
	};

	/**
	 * Handler for popover trigger: mouseleave. Remove popup if entering an
	 * element that is not the popup.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_popover_out = function( e ) {
		var $el = $( e.toElement || e.relatedTarget );
		// If an ancestor of element being entered is not a popup, hide popover.
		if ( $el.closest( '.ai1ec-popup' ).length === 0 ) {
			$( this ).constrained_popover( 'hide' );
		}
	};

	/**
	 * Handler for popover; remove the popover on mouseleave of itself. Hide popup
	 * if entering an element that is not a tooltip.
	 * Also remove any visible tooltip if removing popup.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_popover_self_out = function( e ) {
		var $el = $( e.toElement || e.relatedTarget );
		// If an ancestor of element being entered is not a tooltip, hide popover.
		if ( $el.closest( '.ai1ec-tooltip' ).length === 0 ) {
			$( this ).remove();
			$( 'body > .ai1ec-tooltip' ).remove();
		}
	};

	/**
	 * Manually handle tooltip mouseenter. Need to apply .timely namespace.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_tooltip_over = function( e ) {
		var $this = $( this ),
		    params = {
					template:
						'<div class="timely ai1ec-tooltip">' +
							'<div class="ai1ec-tooltip-arrow"></div>' +
							'<div class="ai1ec-tooltip-inner"></div>' +
						'</div>',
					trigger: 'manual',
					container: 'body'
				};

		// Don't add tooltips to category colour squares already contained in
		// descriptive category labels.
		if ( $this.is( '.ai1ec-category .ai1ec-color-swatch' ) ) {
			return;
		}
		if ( $this.is( '.ai1ec-tooltip-auto' ) ) {
			params.placement = get_placement_function( 250 );
		}
		$this.tooltip( params );
		$this.tooltip( 'show' );
	};

	/**
	 * Manually handle tooltip mouseleave. Do not hide if entering tooltip or
	 * tooltip triggering action.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_tooltip_out = function( e ) {
		var $el = $( e.toElement || e.relatedTarget );
		if ( $el.closest( '.ai1ec-tooltip' ).length === 0 ) {
			if ( $( this ).data( 'bs.tooltip' ) ) {
				$( this ).tooltip( 'hide' );
			}
		}
	};

	/**
	 * Handler for tooltip; remove the tooltip on mouseleave of itself, unless
	 * moving onto the tooltip trigger action. If moving onto an element that is
	 * not in a popup, hide any visible popup.
	 *
	 * @param  {object} e JS event object
	 */
	var handle_tooltip_self_out = function( e ) {
		var $el = $( e.toElement || e.relatedTarget );
		// If an ancestor of element being entered is not a tooltip trigger action,
		// hide tooltip.
		if ( $el.closest( '.ai1ec-tooltip-trigger' ).length === 0 ) {
			$( this ).remove();
		}
		// If an ancestor of element being entered is not a popup, hide any popup.
		if ( $el.closest( '.ai1ec-popup' ).length === 0 ) {
			$( 'body > .ai1ec-popup' ).remove();
		}
	};

	var get_placement_function = function( width ) {
		return function (tip, element) {
				var left,
					right;

				var $element = $(element);
				var defaultPosition = $element.attr("data-placement");
				var pos = $.extend({}, $element.offset(), {
					width: element.offsetWidth,
					height: element.offsetHeight
				});

				var testLeft = function() {
					if (left === false) return false;
					left = ( ( pos.left - width ) >= 0);
					return left ? "left" : false;
				};

				var testRight = function() {
					if (right === false) return false;
					right = ( ( pos.left + width ) <= $(window).width() );
					return right ? "right" : false;
				};

				switch (defaultPosition) {
					case "top"    : return "top"; break;
					case "bottom" : return "bottom"; break;
					case "left"   : if ( testLeft() ) return "left";
					case "right"  : if ( testRight() ) return "right";
					default:
						if ( testLeft() ) return "left";
						if ( testRight() ) return "right";
						return defaultPosition;
				}
		}
	};

	return {
		handle_popover_over        : handle_popover_over,
		handle_popover_out         : handle_popover_out,
		handle_popover_self_out    : handle_popover_self_out,
		handle_tooltip_over        : handle_tooltip_over,
		handle_tooltip_out         : handle_tooltip_out,
		handle_tooltip_self_out    : handle_tooltip_self_out
	};
} );
