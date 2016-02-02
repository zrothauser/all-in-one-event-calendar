<?php
	if ( 0 === count( $suggested_feeds ) ):
?>
<p><?php _e( 'No feeds to display.', AI1EC_PLUGIN_NAME ); ?></p>
<?php
	else:
?>
<div class="ai1ec-suggested-view-selector">
	<a href="#" class="ai1ec-suggested-view-list ai1ec-active">List</a> | 
	<a href="#" class="ai1ec-suggested-view-map">Map</a>
</div>
<div class="ai1ec-suggested-map-container ai1ec-hidden">
	<div id="ai1ec_events_map_canvas"></div>
</div>
<table class="ai1ec-suggested-events">
	<tbody>
		<?php foreach ( $suggested_feeds as $event ):?>
		<tr class="ai1ec-suggested-event"
			data-event="<?php echo esc_attr( json_encode( $event ) ); ?>"
			data-event-id="<?php echo $event->id;?>">
			<td class="ai1ec-suggested-image"
				style="background-image:url(http://localhost/wp-content/plugins/all-in-one-event-calendar/public/themes-ai1ec/vortex//img/default-event-avatar.png)"></td>
			<td class="ai1ec-suggested-content">
				<a href="<?php echo $event->url;?>" class="ai1ec-suggested-title">
					<?php echo strip_tags( $event->title );?>
				</a>
				<div class="ai1ec-suggested-date">
					<?php echo $event->dtstart;?> @ <?php echo $event->venue_name;?>
				</div>
				<div class="ai1ec-suggested-description">
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
<div class="ai1ec-suggested-events-actions-template ai1ec-hidden">
	<?php echo $event_actions; ?>
</div>
<?php
	endif;
?>
