<?php
	if ( 0 === count( $suggested_feeds ) ):
?>
<p><?php _e( 'No feeds to display.', AI1EC_PLUGIN_NAME ); ?></p>
<?php
	else:
?>
<table class="ai1ec-suggested-events" data-ai1ec-show="list both">
	<tbody>
		<?php foreach ( $suggested_feeds as $event ):?>
		<tr class="ai1ec-suggested-event"
			data-event="<?php echo esc_attr( json_encode( $event ) ); ?>"
			data-event-id="<?php echo $event->id;?>">
			<td class="ai1ec-suggested-image"
				style="background-image:url(<?php if ( isset( $event->image ) ) { echo esc_attr( $event->image ); }?>)">&nbsp;
			</td>
			<td class="ai1ec-suggested-content">
				<a href="<?php echo $event->url;?>" class="ai1ec-suggested-title">
					<?php echo strip_tags( $event->title );?>
				</a>
				<div class="ai1ec-suggested-date">
					<?php
						$date = new DateTime( $event->dtstart );
						echo $date->format( 'l jS M \'y' ) . '@';
						echo $event->venue_name;
					?>
				</div>
				<div class="ai1ec-suggested-description" data-ai1ec-show="list">
					<?php echo strip_tags( $event->description ) ;?>
				</div>
			</td>
			<td class="ai1ec-suggested-event-actions">
				<?php echo $event_actions; ?>
			</td>
		</tr>
		<?php endforeach; ?>
	</tbody>
</table>
<?php
	endif;
?>
