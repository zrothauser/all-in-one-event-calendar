#!/bin/bash

# Processes the Bootstrap .js files, wrapping in define() calls and prefixing
# CSS classes with "ai1ec-" so as to correspond to processed .less files (see
# build-3rdparty-less.sh).
#
# This script must be run each time Bootstrap scripts are updated.
#
# Usage examples:
#
#   $ ./build-bootstrap-js.sh
#
#   $ ./build-bootstrap-js.sh --preview

GLOB=external_libs/bootstrap/*

which replace >/dev/null

if [[ $? -eq 0 ]]
then

  echo \
"This script prepares a new version of Twitter Bootstrap's JavaScript files to
be properly namespaced for Ai1EC. It automates the following tasks:

  1.  Wraps each script in a define() statement for use with Require framework.

  2.  Converts the following CSS selectors:

      [data-attribute=\"xyz\"]    => [data-attribute=\"ai1ec-xyz\"]
      [data-slide]              => [data-ai1ec-slide]
      [data-slide-to]           => [data-ai1ec-slide-to]
      .classname                => .ai1ec-classname
      .classname1.classname2    => .ai1ec-classname1.ai1ec-classname2
      xyz:not(.classname)       => xyz:not(.ai1ec-classname)
      xyz > .classname          => xyz > .ai1ec-classname
      xyz, .classname           => xyz, .ai1ec-classname
      li.dropdown               => li.ai1ec-dropdown

  3.  Converts all JavaScript-based CSS class name traversing and manipulation:

      'classname'               => 'ai1ec-classname'

  4.  Converts all CSS class names in JavaScript-generated HTML markup:

      <tag class=\"xyz\">         => <tag class=\"ai1ec-xyz\">
"

  read -p "Press a key to continue..."

  echo "
Usage:

  # To perform the above tasks:
  $ $0

  # To just do a run-through of the tasks, without altering files:
  $ $0 --preview

NOTE #1: Before proceeding, please make sure the latest unaltered, unminified
Bootstrap JavaScript files are currently in ./external_libs/bootstrap.

NOTE #2: After processing is complete, please study the resulting source files
to ensure no incorrect replacements were made, or new patterns introduced that
failed to be matched. Use git diff to compare to previous version of Bootstrap
scripts to make this verification easier.

    *** Please modify this script if you find corrections are required! ***
"

  read -p "Press a key to continue or CTRL+C to abort..."

  # ================
  # = Common cases =
  # ================

  # Headers (define() call - all scripts but popover.js)
  replace \
    '\+function \(\$\) \{ "use strict";' \
    'define( ["jquery_timely"], function( $ ) { "use strict"; // jshint ;_;' \
    $GLOB --exclude="*popover.js" -r "$@"
  # Header for popover.js
  replace \
    '\+function \(\$\) \{ "use strict";' \
    'define( ["jquery_timely", "external_libs/bootstrap/tooltip"], function( $ ) { "use strict"; // jshint ;_;' \
    external_libs/bootstrap/popover.js -r "$@"

  # Footers (closing define())
  replace \
    '\}\(jQuery\);' \
    '} );' \
    $GLOB -r "$@"

  # [data-attribute=""], [data-attribute^=""] selectors
  replace \
    '\[data-([_a-zA-Z0-9-]+\^?)=(['"'"'"])?([_a-zA-Z0-9-]+)\2\]' \
    '[data-$1=$2ai1ec-$3$2]' \
    $GLOB -r "$@"

  # Strings beginning with .class selectors
  replace \
    '(['"'"'"]\s*)\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)' \
    '$1.ai1ec-$2' \
    $GLOB -r "$@"

  # add/remove/hasClass calls with string literal
  replace \
    '(add|remove|has|toggle)Class\((['"'"'"])(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)\2' \
    '$1Class($2ai1ec-$3$2' \
    $GLOB -r "$@"

  # add/remove/hasClass calls with variable
  replace \
    '(add|remove|has|toggle)Class\(([\$_a-zA-Z0-9]+)\)' \
    '$1Class("ai1ec-" + $2)' \
    $GLOB -r "$@"

  # Strings beginning with .class selectors, followed by 2nd .class selector
  replace \
    '(['"'"'"]\s*\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*)\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)' \
    '$1.ai1ec-$2' \
    $GLOB -r "$@"

  # CSS :not(), child, comma selectors followed by .class selector
  replace \
    '(:not\(['"'"'"]?|[>,]\s*)\.' \
    '$1.ai1ec-' \
    $GLOB -r "$@"

  # HTML class attributes
  replace \
    'class="' \
    'class="ai1ec-' \
    $GLOB -r "$@"

  # =====================
  # = Exceptional cases =
  # =====================
  # Whenever upgrading Bootstrap, be sure to check on these cases, and check for
  # new ones.

  # [data-slide], [data-slide-to] selectors
  replace \
    'data-slide\b' \
    'data-ai1ec-slide' \
    $GLOB -r "$@"

  # Unusual add/remove/hasClass calls (carousel.js, end of collapse.js)
  replace \
    'removeClass\(\[(type|'"'"'active'"'"'), direction\]' \
    'removeClass(["ai1ec-" + $1, "ai1ec-" + direction]' \
    $GLOB -r "$@"
  replace \
    'removeClass(['"'"'"])\]\((['"'"'"])(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)' \
    'removeClass$1]($2ai1ec-$3' \
    $GLOB -r "$@"

  # Floating string containing class (modal.js)
  replace \
    "'fade'" \
    "'ai1ec-fade'" \
    $GLOB -r "$@"

  # Multiple space-separated classes within one string (affix.js, popover.js,
  # tooltip.js)
  replace \
    'affix affix-top affix-bottom' \
    'ai1ec-affix ai1ec-affix-top ai1ec-affix-bottom' \
    $GLOB -r "$@"
  replace \
    'fade top bottom left right in' \
    'ai1ec-fade ai1ec-top ai1ec-bottom ai1ec-left ai1ec-right ai1ec-in' \
    $GLOB -r "$@"
  replace \
    'fade in top bottom left right' \
    'ai1ec-fade ai1ec-in ai1ec-top ai1ec-bottom ai1ec-left ai1ec-right' \
    $GLOB -r "$@"

  # Variable value assigned as HTML class (tooltip.js)
  replace \
    "addClass\(placement\)" \
    "addClass('ai1ec-' + placement)" \
    $GLOB -r "$@"

  # Class appended to LI element (scrollspy.js & tab.js)
  replace \
    "'li\.dropdown'" \
    "'li.ai1ec-dropdown'" \
    $GLOB -r "$@"

  exit 0
else
  echo 'Error: replace not found. Install Node.js then: npm install -g replace'
  exit 1
fi
