timely.define(
	[
		"jquery_timely",
		"external_libs/bootstrap/popover"
	],
	function( $ ) {

	 // jshint ;_;

	/* CONSTRAINED_POPOVER PUBLIC CLASS DEFINITION
	 * =========================================== */

	var ConstrainedPopover = function( element, options ) {
		this.init( 'constrained_popover', element, options );
	};

	ConstrainedPopover.DEFAULTS = $.extend(
		{},
		$.fn.popover.Constructor.DEFAULTS,
		{
			container: '',
			content: this.options
		}
	);

	// Note: ConstrainedPopover extends Bootstrap's Popover.

	ConstrainedPopover.prototype =
		$.extend( {}, $.fn.popover.Constructor.prototype );

	ConstrainedPopover.prototype.constructor = ConstrainedPopover;

	ConstrainedPopover.prototype.getDefaults = function () {
		return ConstrainedPopover.DEFAULTS
	};

	/**
	 * Extends Popover.prototype.applyPlacement by repositioning popover within
	 * constrained bounds, after it has been otherwise positioned naturally.
	 */
	ConstrainedPopover.prototype.applyPlacement =
		function( offset, placement ) {
			$.fn.popover.Constructor.prototype.applyPlacement.call( this, offset, placement );

			var $tip     = this.tip(),
			    actualWidth = $tip[0].offsetWidth,
			    actualHeight = $tip[0].offsetHeight,
			    pos      = this.getPosition(),
			    finalPos = {};

			switch ( placement ) {
				case 'left':
					newPos = this.defineBounds( pos );
					if ( typeof newPos.top === "undefined" ) {
						finalPos["top"] = pos.top + pos.height / 2 - actualHeight / 2;
					} else {
						finalPos["top"] = newPos.top - actualHeight / 2;
					}
					if ( typeof newPos.left === "undefined" ) {
						finalPos["left"] = pos.left - actualWidth;
					} else {
						finalPos["left"] = newPos.left - actualWidth;
					}
					$tip.offset( finalPos );
					break;

				case 'right':
					newPos = this.defineBounds( pos );
					if ( typeof newPos.top === "undefined" ) {
						finalPos["top"] = pos.top + pos.height / 2 - actualHeight / 2;
					} else {
						finalPos["top"] = newPos.top - actualHeight / 2;
					}
					if ( typeof newPos.left === "undefined" ) {
						finalPos["left"] = pos.left + pos.width;
					} else {
						finalPos["left"] = newPos.left + pos.width;
					}
					$tip.offset( finalPos );
					break;
			}
		};

	ConstrainedPopover.prototype.defineBounds = function( pos ) {
		var containerOffset,
		    boundTop,
		    boundLeft,
		    boundBottom,
		    boundRight,
		    newPos = {},
		    $container = $( 'body' === this.options.container  ? document : this.options.container );

		if ( $container.length ) {
			containerOffset = $container.offset() || { top: 0, left: 0 };

			boundTop = containerOffset.top;
			boundLeft = containerOffset.left;
			boundBottom = boundTop + $container.height();
			boundRight = boundLeft + $container.width();

			// Constrain y-axis overflow
			if ( pos.top + ( pos.height / 2 ) < boundTop ) {
				newPos['top'] = boundTop;
			}
			if ( pos.top + ( pos.height / 2 ) > boundBottom ) {
				newPos['top'] = boundBottom;
			}

			// Constrain x-axis overflow
			if ( pos.left - ( pos.width / 2 ) < boundLeft ) {
				newPos['left'] = boundLeft;
			}
			if ( pos.left - ( pos.width / 2 ) > boundRight ) {
				newPos['left'] = boundRight;
			}
			return newPos;
		}
		return false;
	};

	// CONSTRAINED_POPOVER PLUGIN DEFINITION
	// =====================================

	var old = $.fn.popover

	$.fn.constrained_popover = function( option ) {
		return this.each( function () {
			var $this = $(this),
			    data = $this.data('ai1ec.constrained_popover'),
			    options = typeof option == 'object' && option;

			if ( !data ) {
				$this.data(
					'ai1ec.constrained_popover',
					( data = new ConstrainedPopover( this, options ) )
				);
			}
			if ( typeof option == 'string' ) {
				data[option]();
			}
		})
	}

	$.fn.constrained_popover.Constructor = ConstrainedPopover;

	// CONSTRAINED_POPOVER NO CONFLICT
	// ===============================

	$.fn.constrained_popover.noConflict = function () {
		$.fn.constrained_popover = old;
		return this;
	}

} );
