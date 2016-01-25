<?php
	if ( ! $api_signed ):
?>
<div class="ai1ec-ics-signup-box">
	<p>
		<?php _e( 'Please, Sign up for a <b>Time.ly Network</b> account to manage your Feeds. It\'s free and easy.', AI1EC_PLUGIN_NAME ) ?>
	</p>
	<a href="edit.php?post_type=ai1ec_event&page=all-in-one-event-calendar-settings"
	   class="ai1ec-btn ai1ec-btn-primary ai1ec-btn-md">
		<?php _e( 'Sign Up for Time.ly Network', AI1EC_PLUGIN_NAME ) ?>
	</a>
</div>
<?php
	endif;
?>
<div id="ics-alerts"></div>
<div class="ai1ec-form-horizontal">
	<div class="ai1ec-form-group">
		<div class="ai1ec-col-md-12">
			<label class="ai1ec-control-label ai1ec-pull-left" for="cron_freq">
			  <?php _e( 'Check for new events', AI1EC_PLUGIN_NAME ) ?>:
			</label>
			<div class="ai1ec-col-sm-6">
				<?php echo $cron_freq ?>
			</div>
		</div>
	</div>
</div>

<div class="timely ai1ec-form-inline ai1ec-panel-group" id="ai1ec-feeds-accordion">
	<?php echo $feed_rows; ?>
</div>
