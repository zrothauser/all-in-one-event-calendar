define(
	[
		"external_libs/twig"
	],
	function( Twig ) {
		Twig.extendFunction( 'disable_post_content', function() {
		});
		return Twig;
	}
);
