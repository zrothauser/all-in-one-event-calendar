define(
	[
		"external_libs/twig"
	],
	function( Twig ) {
		Twig.extendFunction( 'ai1ec_disable_content_output', function() {
		});
		return Twig;
	}
);
