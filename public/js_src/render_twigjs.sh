#!/bin/bash

which twigjs >/dev/null

if [[ $? -eq 0 ]]
then

	twigjs \
		--output ../js_src/ \
		--module amd \
		--twig 'external_libs/twig", "agenda' \
		../themes-ai1ec/vortex/twig/agenda.twig
	mv \
		agenda.twig.js \
		agenda.js
	twigjs \
		--output ../js_src/ \
		--module amd \
		--twig 'external_libs/twig", "oneday' \
		../themes-ai1ec/vortex/twig/oneday.twig
	mv \
		oneday.twig.js \
		oneday.js
	twigjs \
		--output ../js_src/ \
		--module amd \
		--twig 'external_libs/twig", "month' \
		../themes-ai1ec/vortex/twig/month.twig
	mv \
		month.twig.js \
		month.js
	exit 0
else

	echo 'Error: twig.js not found. Install Node.js then: npm install -g twig'
	exit 1
fi