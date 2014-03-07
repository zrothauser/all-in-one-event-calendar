define(
		[
		 "jquery_timely",
		 "external_libs/modernizr"
		 ],
		function( $, Modernizr ) {
	"use strict"; // jshint ;_;
	// *** Month view ***

	var isOpera = navigator.userAgent.match(/opera/i);
	var isWebkit = navigator.userAgent.match(/webkit/i);
	/**
	 * Extends day bars for multiday events.
	 */
	var extend_multiday_events = function() {
		var $days = $('.ai1ec-day');
		var daysFirstWeek = $( '.ai1ec-week:first .ai1ec-day' ).length;

		$('.ai1ec-month-view .ai1ec-multiday').each( function() {
			var container = this.parentNode;
			var elHeight = $(this).outerHeight( true );
			var endDay = parseInt( $(this).data( 'endDay' ), 10 );
			var $startEl = $( '.ai1ec-date', container );
			var startDay = parseInt( $startEl.text(), 10 );

			var nextMonthBar = $( this ).data( 'endTruncated' );
			if ( nextMonthBar ) {
				endDay = parseInt( $($days[$days.length - 1]).text(), 10 ) ;
			}

			var $evtContainer = $(this);
			var bgColor = $( '.ai1ec-event', $evtContainer )[0].style.backgroundColor;
			var curLine = 0;
			var deltaDays = endDay - startDay + 1;
			var daysLeft = deltaDays;
			var marginSize;

			// this is the variable used to count the number of days for the event
			var days = 0;

			$days.each( function( i ) {
				var $dayEl = $( '.ai1ec-date', this );
				var $td = $( this.parentNode );
				var cellNum = $td.index();
				var day = parseInt( $dayEl.text(), 10 );
				if ( day >= startDay && day <= endDay ) {
					if ( day === startDay ) {
						marginSize = parseInt( $dayEl.css( 'marginBottom' ), 10 ) + 16;
					}

					if ( curLine === 0 ) {
						// Extend initial event bar to the end of first (!) week.
						days++;
					}

					if ( cellNum === 0 && day > startDay && daysLeft !== 0 ) {
						// Clone the event as well as its associated popup
						var $clone = $evtContainer
							.next( '.ai1ec-popup' )
							.andSelf()
							.clone( false );
						$dayEl.parent().append( $clone );

						var $block = $clone.first();

						// Create a new spanning multiday bar. "ai1ec-multiday-bar" is used
						// for proper styling, while "ai1ec-multiday-clone" identifies the
						// clones so they can be removed when required.
						$block.addClass( 'ai1ec-multiday-bar ai1ec-multiday-clone' );

						$block
							.css({
								position: "absolute",
								left: '1px',
								top: parseInt( $dayEl.css( 'marginBottom' ), 10 ) + 13, // line height is 16px - 3px of initial margin
								backgroundColor: bgColor
							});

						// Check the days left, if they are more than 7 a new block is needed and we draw 7 days only
						var daysForThisBlock = ( daysLeft > 7 ) ? 7 : daysLeft;

						$block.css( 'width', create_percentual_width_from_days( daysForThisBlock ) );

						if ( daysLeft > 7 ) {
							$block.append( create_multiday_arrow( 1, bgColor ));
						}

						$block.append( create_multiday_arrow( 2, bgColor ));
					}

					// Keep constant margin (number of bars) during the first row.
					if ( curLine === 0 ) {
						$dayEl.css({ 'marginBottom': marginSize + 'px' });
					}
					// But need to reset it and append margins from the begining for
					// subsequent weeks.
					else {
						$dayEl.css({ 'marginBottom': '+=16px' });
					}

					daysLeft--;

					// If in the last column of the table and there are more days left,
					// increment curLine.
					if ( daysLeft > 0 && cellNum === 6 ) {
						curLine++;
					}
				}
			});
			// Adding "start arrow" to the end of multi-month bars.
			if ( nextMonthBar ) {
				var $lastBarPiece = $( '.' + $evtContainer[0].className.replace( /\s+/igm, '.' ) ).last();
				$lastBarPiece.append( create_multiday_arrow( 1, bgColor ));
			}

			$(this).css({
				position: 'absolute',
				top: $startEl.outerHeight( true ) - elHeight - 1 + 'px',
				left: '1px',
				width: create_percentual_width_from_days( days )
			});

			// Add an ending arrow to the initial event bar for multi-week events.
			if ( curLine > 0 ) {
				$(this).append( create_multiday_arrow( 1, bgColor ) );
			}
			// Add a starting arrow to the initial event bar for events starting in
			// previous month.
			if ( $(this).data( 'startTruncated' ) ) {
				$(this)
					.append( create_multiday_arrow( 2, bgColor ) )
					.addClass( 'ai1ec-multiday-bar' );
			}
		});
	};

	/**
	 * returns a string with the percentage to use as width for the specified number of days
	 *
	 * @param int days the number of days
	 *
	 */
	var create_percentual_width_from_days = function( days ) {
		var percent;
		switch ( days ) {
			case 1:
				percent = 97.5;
				break;
			case 2:
				percent = 198.7;
				break;
			case 3:
				percent = 300;
				break;
			case 4:
				percent = 401;
				break;
			case 5:
				if( isWebkit || isOpera ) {
					percent = 507;
				} else {
					percent = 503.4;
				}
				break;
			case 6:
				if( isWebkit || isOpera ) {
					percent = 608;
				} else {
					percent = 603.5;
				}
				break;
			case 7:
				if( isWebkit || isOpera ) {
					percent = 709;
				} else {
					percent = 705;
				}
				break;
		}
		return percent + '%';
	};

	/**
	 * Creates arrow for multiday bars.
	 *
	 * @param {int}    type  1 for ending arrow, 2 for starting arrow
	 * @param {string} color Color of the multiday event
	 */
	var create_multiday_arrow = function( type, color ) {
		var $arrow = $( '<div class="ai1ec-multiday-arrow' + type + '"></div>' );
		if ( type === 1 ) {
			$arrow.css({ borderLeftColor: color });
		} else {
			$arrow.css({ borderTopColor: color, borderRightColor: color, borderBottomColor: color });
		}
		return $arrow;
	};

	return {
		extend_multiday_events: extend_multiday_events
	};

} );
