<div class="timely ai1ec-panel-group ai1ec-form-inline"
	id="ai1ec-add-new-event-accordion">
	<?php foreach ( $boxes as $box ) : ?>
		<div class="panel panel-default">
			<?php echo $box; ?>
		</div>
	<?php endforeach; ?>
	</div>
	<?php if ( ! empty( $publish_button ) ) : ?>
		<?php echo $publish_button; ?>
	<?php endif; ?>
</div>
