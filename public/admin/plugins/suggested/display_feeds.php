<?php
	if ( 0 === count( $suggested_feeds ) ):
?>
<p><?php _e( 'No feeds to display.', AI1EC_PLUGIN_NAME ); ?></p>
<?php
	else:
?>
<table class="ai1ec-suggested-events">
	<tbody>
		<?php foreach ( $suggested_feeds as $event ):?>
		<tr data-event-id="<?php echo $event->id;?>">
			<td class="ai1ec-suggested-image" style="background-image:url(<?php echo $event->image;?>)"></td>
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
			<td class="ai1ec-suggested-event-import">
				<a href="#" class="ai1ec-btn ai1ec-btn-primary ai1ec-btn-sm
					               ai1ec-suggested-import-event">
					<i class="ai1ec-fa ai1ec-fa-plus ai1ec-fa-xs ai1ec-fa-fw"></i>
					<?php _e( 'Import', AI1EC_PLUGIN_NAME ); ?>
				</a>
				<a href="#" class="ai1ec-btn ai1ec-btn-primary ai1ec-btn-sm ai1ec-btn-warning
					               ai1ec-disabled ai1ec-hidden ai1ec-suggested-processing">
					<?php _e( 'Importing', AI1EC_PLUGIN_NAME ); ?>&hellip;
				</a>
				<a href="#" class="ai1ec-btn ai1ec-btn-primary ai1ec-btn-sm ai1ec-btn-danger
					               ai1ec-hidden ai1ec-suggested-remove-event">
					<i class="ai1ec-fa ai1ec-fa-minus ai1ec-fa-xs ai1ec-fa-fw"></i>
					<?php _e( 'Remove', AI1EC_PLUGIN_NAME ); ?>
				</a>
				<a href="#" class="ai1ec-suggested-whole-feed">
					<?php _e( 'All events from this feed', AI1EC_PLUGIN_NAME ); ?>
				</a>
			</td>
		</tr>
		<?php endforeach; ?>
	</tbody>
</table>
<?php
	endif;
?>
