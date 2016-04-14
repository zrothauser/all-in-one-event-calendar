define(
	[
		'jquery_timely',
		'ai1ec_config'
	],
	function( $, ai1ec_config ) {
	'use strict';
	$( '[name="ai1ec_tickets_submit"]' ).on( 'click', function() {
		$( '.ai1ec-ticket-field-error' ).hide();
		$( '.ai1ec-required:visible' ).each( function() {
			var $this = $( this );
			$this.removeClass( 'ai1ec-error' );
			if (
				! $.trim( $this.val() ) ||
				( 'checkbox' === $this.attr( 'type' ) && ! this.checked )
			) {
				$this.addClass( 'ai1ec-error' );
				$this.closest( 'td' ).find( '.ai1ec-ticket-field-error' ).show();
				$this.prev( '.ai1ec-ticket-field-error' ).show();
			}
		} );
		if ( ! $( '.ai1ec-ticket-field-error:visible' ).length ) {
			$( '.ai1ec-noauto' ).remove();
			$( this ).closest( 'form' ).submit();
		}
		return false;
	} );

	$( '[name="ai1ec_tickets_signin"]' ).on( 'click', function() {
		$( '.ai1ec-ticket-field-error' ).hide();
		$( '.ai1ec-required:visible' ).each( function() {
			var $this = $( this );
			$this.removeClass( 'ai1ec-error' );
			if (
				! $.trim( $this.val() ) ||
				( 'checkbox' === $this.attr( 'type' ) && ! this.checked )
			) {
				$this.addClass( 'ai1ec-error' );
				$this.closest( 'td' ).find( '.ai1ec-ticket-field-error' ).show();
			}
		} );
		if ( ! $( '.ai1ec-ticket-field-error:visible' ).length ) {
			$( '.ai1ec-noauto' ).remove();
			var
				$form_div = $( '#ai1ec-api-signup-form' ),
				action    = $form_div.attr( 'data-action' ),
				$form     = $( '<form></form', {
					method : 'POST',
					action : action,
					class  : 'ai1ec-hidden'
				} );
			
			$form_div.appendTo( $form );
			$form.appendTo( 'body' ).submit();
			
		}
		return false;
	} );

	$( 'input[name="ai1ec_payment_method"]' ).on( 'click change', function() {
		$( '.ai1ec-payment-details' ).removeClass( 'ai1ec-active' );
		$( this ).closest( 'li' )
			.find( '.ai1ec-payment-details' )
				.addClass( 'ai1ec-active' );
	} );

	$( '[name="ai1ec_signing"]' ).on( 'click', function() {
		$( '.ai1ec-error' ).removeClass( 'ai1ec-error' );
		if ( '2' === this.value ) {
			$( '.ai1ec-ticketing-signup tr' ).not( ':first' ).not( '.signin' ).hide();
			$( '.signin' ).removeClass( 'ai1ec-hidden' );
		} else {
			$( '.ai1ec-ticketing-signup tr' ).show();
			$( '.signin:last' ).addClass( 'ai1ec-hidden' );
		}
	} );

	$( '#ai1ec-api-signout' ).on( 'click', function() {
		$( '#ai1ec-api-signout-confirm' ).show();
		$( this ).hide();
		return false;
	} );

	$( '#ai1ec-api-signout-cancel' ).on( 'click', function() {
		$( '#ai1ec-api-signout-confirm' ).hide();
		$( '#ai1ec-api-signout' ).show();
		return false;
	} );

	$( '#ai1ec-api-signout-confirm' ).on( 'click', function() {
		if ( ! $( '#ai1ec-api-signout-confirm:visible' ).length ) {
			return false;
		}
		var
			$container = $( '#ai1ec-api-signed-in' ),
			action     = $( '#ai1ec-api-signout' ).attr( 'data-action' ),
			$input     = $( '<input type="hidden" name="ai1ec_signout" value="1" />' ),
			$form      = $( '<form></form', {
				method : 'POST',
				action : action,
				class  : 'ai1ec-hidden'
			} );

		$form
			.append( $input, $container )
			.appendTo( 'body' )
			.submit();
		
		return false;
	} );


	$( '.ai1ec-tickets-manage ul.ai1ec-nav-tabs li' ).on( 'click', function() {
		$( '.ai1ec-tickets-manage ul.ai1ec-nav-tabs li.ai1ec-active' )
			.removeClass( 'ai1ec-active' );
		$( '.ai1ec-tickets-manage .ai1ec-tab-pane' )
			.removeClass( 'ai1ec-active' );
		$( this ).addClass( 'ai1ec-active' );
		$tab = $( $( this ).find( 'a' ).attr( 'href' ) );
		$tab.addClass( 'ai1ec-active' )
		return false;
	} );

	$( document ).on( 'click', 'a.ai1ec-has-tickets', function() {
		var
			$this       = $( this ),
			$tr         = $this.closest( 'tr' ), 
			post_id     = $this.attr( 'data-post-id' ),
			columns     = $tr.find( 'td, th' ).not( '.hidden' ).length,
			$empty_row  = $( '<tr class="ai1ec-tickets-details ai1ec-tickets-details-'
				+ post_id + '"><td colspan="' + columns
				+ '" class="ai1ec-ticket-details-row-empty"></td></tr>' ),
			$ticket_row = $( '<tr class="ai1ec-tickets-details ai1ec-tickets-details-'
				+ post_id + '""><td colspan="'+ columns
				+ '" class="ai1ec-ticket-details-row"><div></div></td></tr>' );

		if ( $this.hasClass( 'ai1ec-tickets-shown' ) ) {
			$( '.ai1ec-tickets-details-' + post_id ).remove();
			$this.text( ai1ec_config.ticketing.details )
				.removeClass( 'ai1ec-tickets-shown' );
			return false;
		}

		$this.text( ai1ec_config.ticketing.hide_details )
			.addClass( 'ai1ec-tickets-shown' );

		$tr
			.after( $ticket_row )
			.after( $empty_row );

		$ticket_row
			.find( '.ai1ec-ticket-details-row > div' )
				.append( ai1ec_config.ticketing.loading_details );

		$.ajax( {
			url     : ai1ec_config.ajax_url,
			type    : 'POST',
			data    : {
				action         : 'ai1ec_show_ticket_details',
				ai1ec_event_id : post_id
			},
			success : function( response ) {
				response = $.parseJSON( response );
				if ( response && response.data && response.data.length ) {
					$ticket_row
						.find( '.ai1ec-ticket-details-row > div' )
							.html( '' );

					var
						$table = $( '<table></table>' ),
						$head  = $( '<thead></thead>'),
						$body  = $( '<tbody></tbody>' );

					$head = $(
						'<th>' + ai1ec_config.ticketing.type_and_price + '</th>'
						+ '<th class="ai1ec-hidden-sm">' + ai1ec_config.ticketing.info + '</th>'
						+ '<th>' + ai1ec_config.ticketing.report + '</th>'
						+ '<th class="ai1ec-hidden-sm">' + ai1ec_config.ticketing.sale_dates + '</th>'
						+ '<th class="ai1ec-hidden-sm">' + ai1ec_config.ticketing.limits + '</th>'
						+ '<th class="ai1ec-ticket-details-actions">' + ai1ec_config.ticketing.actions + '</th>'
					);
					$head.appendTo( $table );
					for ( var i = 0; i < response.data.length; i++ ) {
						var
							$row   = $( '<tr></tr>' ),
							status = '<span class="ai1ec-tickets-status ai1ec-tickets-status-'
								+ _s( response.data[i]['ticket_status'] ) + '">'
								+ _s( response.data[i]['ticket_status'] ) + '</span>';

						$row.append(
							$( '<td></td>').html(
								'"' + _s( response.data[i]['name'] ) + '"'
								+ '<br /><b>$' + _s( response.data[i]['price'] ) + '</b>'
								+ '<div class="ai1ec-visible-sm">' + status + '</div>'
							),
							$( '<td class="ai1ec-hidden-sm"></td>').html(
								status
							),
							$( '<td></td>').html(
								ai1ec_config.ticketing.sold + ' '
								+ _s( response.data[i]['sold'] )
								+ '<br>'
								+ ai1ec_config.ticketing.left + ' '
								+ ( ( null == response.data[i]['available'] )
									? ai1ec_config.ticketing.unlimited
									: _s( response.data[i]['available'] )
								)
							),
							$( '<td class="ai1ec-hidden-sm"></td>').html(
								ai1ec_config.ticketing.start + ' ' + _s( response.data[i]['sale_start_date'] )
								+ '<br />' +  ai1ec_config.ticketing.end + ' '
								+ _s( response.data[i]['sale_end_date'] )
							),
							$( '<td class="ai1ec-hidden-sm"></td>').html(
								ai1ec_config.ticketing.min + ' '+ _s( response.data[i]['buy_min_qty'] )
								+ '<br />' + ai1ec_config.ticketing.max + ''
								+ _s( response.data[i]['buy_max_qty'] )
							),
							$( '<td></td>').html(
								'<a href="#" class="ai1ec-show-attendees" data-ticket-type="'
								+ _s( response.data[i]['id'] ) + '" data-post-id="'
								+ post_id + '">' + ai1ec_config.ticketing.attendees + '</a>'
							)
						);
						$table.append( $row );
					}
					$ticket_row
						.find( '.ai1ec-ticket-details-row > div' )
							.append( $table );
				} else if ( response && response.error ) {
					$ticket_row
						.find( '.ai1ec-ticket-details-row > div' )
							.html( '' );
					$ticket_row
						.find( '.ai1ec-ticket-details-row > div' )
							.append( response.error );
				}
			}
		} );
		return false;
	} );

	$( document ).on( 'click', '.ai1ec-show-attendees', function() {
		var
			$this          = $( this ),
			$tr            = $this.closest( 'tr' ),
			ticket_type_id = $( this ).attr( 'data-ticket-type' ),
			post_id        = $this.attr( 'data-post-id' )
			attendees      = 0;

		if ( $this.hasClass( 'ai1ec-attendees-shown' ) ) {
			$this.removeClass( 'ai1ec-attendees-shown' )
				.text( ai1ec_config.ticketing.attendees );
			$tr.next( '.ai1ec-ticket-attendees-row' ).remove();
			return false;
		}
		$this
			.text( ai1ec_config.ticketing.hide_attendees )
			.addClass( 'ai1ec-attendees-shown' );

		$.ajax( {
			url     : ai1ec_config.ajax_url,
			type    : 'POST',
			data    : {
				action         : 'ai1ec_show_attendees',
				ai1ec_event_id : post_id
			},
			success : function( response ) {
				response = $.parseJSON( response );
				var $attendees_row = $(
						'<tr class="ai1ec-ticket-attendees-row">'
						+ '<td colspan="6" class="ai1ec-ticket-attendees">'
						+ '<h3>' + ai1ec_config.ticketing.attendees_list + '</h3>'
						+ '<table class="ai1ec-attendees-list"><thead>'
							+'<th class="ai1ec-hidden-sm">#</th>'
							+ '<th>' + ai1ec_config.ticketing.guest_name + '</th>'
							+ '<th class="ai1ec-hidden-sm">' + ai1ec_config.ticketing.status + '</th>'
							+ '<th>' + ai1ec_config.ticketing.code + '</th>'
							+ '<th class="ai1ec-hidden-sm">' + ai1ec_config.ticketing.email + '</th>'
						+'</thead><tbody></tbody></table></td></tr>'
					);
				if ( response && response.data && response.data.length ) {
					for ( var i = 0; i < response.data.length; i++ ){
						if ( ticket_type_id == response.data[i]['ticket_type_id'] ) {
							$att_row = $( '<tr></tr>' );
							$att_row.append(
								$( '<td class="ai1ec-hidden-sm"></td>').text( i + 1 ),
								$( '<td></td>').text(
									response.data[i]['holder_first_name'] + ' '
									+ response.data[i]['holder_last_name']
								),
								$( '<td class="ai1ec-hidden-sm"></td>').text(
									response.data[i]['status']
								),
								$( '<td></td>').text( response.data[i]['ticket_code'] ),
								$( '<td class="ai1ec-hidden-sm"></td>').html(
									'<a href="' + _s( response.data[i]['holder_email'] ) + '">'
									+ _s( response.data[i]['holder_email'] ) + '</a>'
								)
							);
							$attendees_row.find( 'tbody' ).append( $att_row );
							attendees ++;
						}
					}
					if ( ! attendees ) {
						$attendees_row
							.find( 'table' )
								.replaceWith( '<h4>' + ai1ec_config.ticketing.no_attendees + '</h4>' );
					}
					$tr.after( $attendees_row );
				} else if ( response && response.error ) {
					$attendees_row
						.find( 'table' )
							.replaceWith( '<h4>' + response.error + '</h4>' );
					$tr.after( $attendees_row );
				}
			}
		} );
		return false;
	} );

	
	// Sanitizing values received from API.
	var _s = function ( val ) {
		if ( 'string' === typeof val ) {
			val = val
				.replace( /&/g, '&amp;' )
				.replace( /</g, '&lt;' )
				.replace( />/g, '&gt;' )
				.replace( /"/g, '&quot;' )
				.replace( /'/g, '&#039;' );
		}
		return val;
		
	};
} );
