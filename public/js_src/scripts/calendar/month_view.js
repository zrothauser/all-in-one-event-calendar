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
	var extend_multiday_events = function( $calendar ) {
		var
			$days = $calendar.find( '.ai1ec-day' ),
			daysFirstWeek = $calendar.find( '.ai1ec-week:first .ai1ec-day' ).length;

		$calendar.find( '.ai1ec-month-view .ai1ec-multiday' ).each( function() {
			var container = this.parentNode,
				elHeight = $( this ).outerHeight( true ),
				$startEl = $( '.ai1ec-date', container ),
				startDay = parseInt( $startEl.text(), 10 ),
				nextMonthBar = $( this ).data( 'endTruncated' ),
				endDay = parseInt( nextMonthBar
					? $( $days[$days.length - 1] ).text()
					: $( this ).data( 'endDay' ), 10
				),
				$evtContainer = $( this ),
				bgColor = $( '.ai1ec-event', $evtContainer )[0].style.backgroundColor,
				curLine = 0,
				deltaDays = endDay - startDay + 1,
				daysLeft = deltaDays,
				marginSize,
				// this is the variable used to count the number of days for the event
				days = 0;

			$days.each( function( i ) {
				var $dayEl = $( '.ai1ec-date', this ),
					$td = $( this.parentNode ),
					cellNum = $td.index(),
					day = parseInt( $dayEl.text(), 10 );

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
								// line height is 16px - 3px of initial margin
								top: parseInt( $dayEl.css( 'marginBottom' ), 10 ) + 13,
								backgroundColor: bgColor
							});

						// Check the days left, if they are more than 7 a new block is needed
						// and we draw 7 days only
						var daysForThisBlock = ( daysLeft > 7 ) ? 7 : daysLeft;

						$block.css( 'width',
							create_percentual_width_from_days( daysForThisBlock )
						);

						if ( daysLeft > 7 ) {
							$block.append( create_multiday_arrow( 1, bgColor ) );
						}

						$block.append( create_multiday_arrow( 2, bgColor ) );
					}

					// Keep constant margin (number of bars) during the first row.
					if ( curLine === 0 ) {
						$dayEl.css( { 'marginBottom': marginSize + 'px' } );
					}
					// But need to reset it and append margins from the begining for
					// subsequent weeks.
					else {
						$dayEl.css( { 'marginBottom': '+=16px' } );
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
				var $lastBarPiece = $evtContainer.find(
					'.' + $evtContainer[0].className.replace( /\s+/igm, '.' )
				).last();
				$lastBarPiece.append( create_multiday_arrow( 1, bgColor ) );
			}

			$(this).css( {
				position: 'absolute',
				top: $startEl.outerHeight( true ) - elHeight - 1 + 'px',
				left: '1px',
				width: create_percentual_width_from_days( days )
			} );

			// Add an ending arrow to the initial event bar for multi-week events.
			if ( curLine > 0 ) {
				$( this ).append( create_multiday_arrow( 1, bgColor ) );
			}
			// Add a starting arrow to the initial event bar for events starting in
			// previous month.
			if ( $( this ).data( 'startTruncated' ) ) {
				$( this )
					.append( create_multiday_arrow( 2, bgColor ) )
					.addClass( 'ai1ec-multiday-bar' );
			}
		});
		// Second run for month. Try to position events better.
		$days.each( function() {
			var
				$dayEl          = $( '.ai1ec-date', this ),
				day             = parseInt( $dayEl.text(), 10 ),
				$week           = $dayEl.closest( '.ai1ec-week' ),
				eventCount      = $( this ).find( 'a.ai1ec-event-container:not(.ai1ec-multiday)' ).length,
				newMargin       = null,
				$multidayEvents;

			if ( 0 === eventCount ) {
				return;
			}
			$multidayEvents = $week.find( 'a.ai1ec-multiday[data-end-day]' )
				.filter( function() {
					return (
						$( this ).data( 'startDay' ) <= day &&
						$( this ).data( 'endDay'   ) >= day
					);
				} );
			$multidayEvents.each( function() {
				var newOffset = $( this ).prop( 'offsetTop' );
				if ( null === newMargin || newOffset > newMargin ) {
					newMargin = newOffset;
				}
			} );
			if ( null !== newMargin ) {
				newMargin += 3;
				$dayEl.css( 'marginBottom', newMargin );
			}
		} );
	};

	/**
	 * returns a string with the percentage to use as width for the specified
	 * number of days
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
			$arrow.css( { borderLeftColor: color } );
		} else {
			$arrow.css( {
				borderTopColor: color,
				borderRightColor: color,
				borderBottomColor: color
			} );
		}
		return $arrow;
	};

	return {
		extend_multiday_events: extend_multiday_events
	};

} );
