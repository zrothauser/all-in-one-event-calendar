<div class="ai1ec-feed-container well well-small clearfix">
	<h4>
		<?php _e( 'iCalendar/.ics Feed URL:', AI1EC_PLUGIN_NAME ); ?>
	</h4>
	<div class="row-fluid">
		<input type="text" class="ai1ec-feed-url span12" readonly="readonly"
			value="<?php echo esc_attr( $feed_url ) ?>" />
	</div>
	<input type="hidden" name="feed_id" class="ai1ec_feed_id" value="<?php echo $feed_id;?>" />
	<div class="clearfix">
		<?php if ( $event_category ) : ?>
			<div class="ai1ec-feed-category pull-left">
				<?php _e( 'Event categories:', AI1EC_PLUGIN_NAME ); ?>
				<strong><?php echo $event_category; ?></strong>
			</div>
		<?php endif; ?>
		<?php if ( $tags ) : ?>
			<div class="ai1ec-feed-tags pull-left">
				<?php _e( 'Tag with', AI1EC_PLUGIN_NAME ); ?>:
				<strong><?php echo $tags; ?></strong>
			</div>
		<?php endif; ?>
	</div>
	<div class="clearfix">
		<div class="ai1ec-feed-comments-enabled pull-left">
			<?php _e( 'Allow comments', AI1EC_PLUGIN_NAME ); ?>:
			<strong><?php
			if ( $comments_enabled ) {
				_e( 'Yes', AI1EC_PLUGIN_NAME );
			} else {
				_e( 'No',  AI1EC_PLUGIN_NAME );
			}
			?></strong>
		</div>
		<div class="ai1ec-feed-map-display-enabled pull-left">
			<?php _e( 'Show map', AI1EC_PLUGIN_NAME ); ?>:
			<strong><?php
			if ( $map_display_enabled ) {
				_e( 'Yes', AI1EC_PLUGIN_NAME );
			} else {
				_e( 'No',  AI1EC_PLUGIN_NAME );
			}
			?></strong>
		</div>
	</div>
	<div class="ai1ec-feed-keep-tags-categories">
		<?php _e( 'Keep original events categories and tags', AI1EC_PLUGIN_NAME ); ?>:
		<strong><?php
		if ( $keep_tags_categories ) {
			_e( 'Yes', AI1EC_PLUGIN_NAME );
		} else {
			_e( 'No',  AI1EC_PLUGIN_NAME );
		}
		?></strong>
	</div>
	<div class="pull-right">
		<img src="images/wpspin_light.gif" class="ajax-loading pull-left" alt="" />
		<div class="btn-group pull-left">
			<button class="btn ai1ec_update_ics">
				<i class="icon-refresh"></i>
				<?php _e( 'Refresh', AI1EC_PLUGIN_NAME ); ?>
			</button>
			<button class="btn ai1ec_delete_ics">
				<i class="icon-remove"></i>
				<?php _e( 'Remove', AI1EC_PLUGIN_NAME ); ?>
			</button>
		</div>
	</div>
	<?php if( $events ): ?>
		<input type="hidden" class="ai1ec_flush_ics" value="<?php echo $events ?>" />
	<?php endif ?>
</div>
