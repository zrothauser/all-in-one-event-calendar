<p>
<?php _e(
    'Configure which other calendars your own calendar subscribes to.
    You can add any calendar that provides an iCalendar (.ics) feed.
    Enter the feed URL(s) below and the events from those feeds will be
    imported periodically.',
    AI1EC_PLUGIN_NAME ); ?>
</p>
<div id="ics-alerts"></div>
<label class="textinput" for="cron_freq">
  <?php _e( 'Check for new events', AI1EC_PLUGIN_NAME ) ?>:
</label>
<input type="submit" name="ai1ec_save_settings" id="ai1ec_save_settings"
	class="btn btn-primary pull-right"
	value="<?php _e( 'Update Settings', AI1EC_PLUGIN_NAME ); ?>" />
<?php echo $cron_freq ?>
<br class="clear" />

<div id="ai1ec-feeds-after" class="ai1ec-feed-container well well-small clearfix">
	<h4><?php _e( 'iCalendar/.ics Feed URL:', AI1EC_PLUGIN_NAME ) ?></h4>
	<div class="row-fluid">
		<input type="text" name="ai1ec_feed_url" id="ai1ec_feed_url" class="span12" />
	</div>
	<div class="row-fluid">
		<div class="span6">
			<?php $event_categories->render(); ?>
		</div>
		<div class="span6">
			<?php $event_tags->render(); ?>
		</div>
	</div>
	<div class="ai1ec-feed-comments-enabled">
		<label for="ai1ec_comments_enabled">
			<input type="checkbox" name="ai1ec_comments_enabled"
				id="ai1ec_comments_enabled" value="1" />
			<?php _e( 'Allow comments on imported events', AI1EC_PLUGIN_NAME ); ?>
		</label>
	</div>
	<div class="ai1ec-feed-map-display-enabled">
		<label for="ai1ec_map_display_enabled">
			<input type="checkbox" name="ai1ec_map_display_enabled"
				id="ai1ec_map_display_enabled" value="1" />
			<?php _e( 'Show map on imported events', AI1EC_PLUGIN_NAME ); ?>
		</label>
	</div>
	<div class="ai1ec-feed-add-tags-categories">
		<label for="ai1ec_add_tag_categories">
			<input type="checkbox" name="ai1ec_add_tag_categories"
				id="ai1ec_add_tag_categories" value="1" />
			<?php _e( 'Import any tags/categories provided by feed, in addition those selected above', AI1EC_PLUGIN_NAME ); ?>
		</label>
	</div>
	<div class="pull-right">
		<button id="ai1ec_add_new_ics" class="btn">
			<i class="icon-plus"></i>
			<?php _e( 'Add new subscription', AI1EC_PLUGIN_NAME ) ?>
		</button>
	</div>
</div>

<?php 
echo $feed_rows;
echo $modal->render();
?>

<?php submit_button( esc_attr__( 'Update Settings', AI1EC_PLUGIN_NAME ), 'primary', 'ai1ec_save_settings' ); ?>
