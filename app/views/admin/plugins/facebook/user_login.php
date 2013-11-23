	<p>
	<?php _e( 'Click below to connect your calendar to Facebook.', AI1EC_PLUGIN_NAME ); ?>
	</p>
	<div id="ai1ec-facebook-connect" class="ai1ec-feed-container">
		<a class="btn btn-primary btn-large" href="<?php echo $login_url ?>">
			<i class="icon-facebook-sign icon-large"></i>
			<?php _e( 'Connect to Facebook', AI1EC_PLUGIN_NAME ) ?>
		</a>
		<?php echo $question_mark ?>
	</div>
	<input type="submit" style="display:none" name="<?php echo $submit_name ?>" id="<?php echo $submit_name ?>" value="">
	<?php echo $modal_html ?>


