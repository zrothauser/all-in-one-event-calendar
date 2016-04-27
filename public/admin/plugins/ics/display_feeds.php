<?php
	if ( ! $api_signed ):
?>
<div class="ai1ec-ics-signup-box">
	<p>
		<?php _e( 'Please, Sign In to <b>Timely Network</b> to manage your feeds.', AI1EC_PLUGIN_NAME ) ?>
	</p>
	<a href="edit.php?post_type=ai1ec_event&page=all-in-one-event-calendar-settings"
	   class="ai1ec-btn ai1ec-btn-primary ai1ec-btn-md">
		<?php _e( 'Sign In to Timely Network', AI1EC_PLUGIN_NAME ) ?>
	</a>
</div>
<?php
	endif;
?>
<div id="ics-alerts"></div>
<p></p>
<h5><?php _e( 'My imported Feeds:', AI1EC_PLUGIN_NAME ) ?></h5>
<div class="timely ai1ec-form-inline ai1ec-panel-group" id="ai1ec-feeds-accordion">
	<?php echo $feed_rows; ?>
</div>
<br />
<h5><?php _e( 'My imported Events:', AI1EC_PLUGIN_NAME ) ?></h5>
<?php echo $modal->render(); ?>
