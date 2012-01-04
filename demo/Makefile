COMPILED_JS_DIR=public/js/min
JAVA?=java
CLOSURE_COMPILER=$(JAVA) -jar tools/closure-compiler.jar
YUI_COMPRESSOR=$(JAVA) -jar tools/yuicompressor.jar
MARKDOWN=perl tools/Markdown.pl --html4tags

all: html js

# *********************************************************************************
# Generate HTML files
# *********************************************************************************

html: html-features html-documentation

html-features:
	curl -L https://github.com/geops/ole/raw/master/features.md > /tmp/ole.text.md
	$(MARKDOWN) /tmp/ole.text.md > application/views/scripts/index/features.phtml

html-documentation:
	curl -L https://github.com/geops/ole/raw/master/documentation.md > /tmp/ole.text.md
	$(MARKDOWN) /tmp/ole.text.md > application/views/scripts/index/documentation.phtml


# *********************************************************************************
# Javascript/CSS Compression
# *********************************************************************************

# call this to compile the contents of public
static-files: js css

js: js-openlayers js-ole js-jquery

js-dir:
	# create the diretory if it does not exist
	[ -d $(COMPILED_JS_DIR) ] || mkdir $(COMPILED_JS_DIR)

js-openlayers: js-dir
	# for adapting the openlayers build please alter the file at
	# public/js/openlayers/build/demo.cfg
	# or use full.cfg to avoid the horrible js dependency tracking
	# Closure-compiler will break openlayers, yui-compressor works
	rm -f $(COMPILED_JS_DIR)/openlayers.js
	cd public/js/openlayers/build && python build.py demo.cfg
	$(YUI_COMPRESSOR) -o $(COMPILED_JS_DIR)/openlayers.js public/js/openlayers/build/OpenLayers.js
	rm -f public/js/openlayers/build/OpenLayers.js

js-jquery: js-dir
	# jquery core and jquery ui
	rm -f $(COMPILED_JS_DIR)/jquery.js
	cat public/js/jquery.js public/js/demo.js > /tmp/js.tmp.js
	$(YUI_COMPRESSOR) -o $(COMPILED_JS_DIR)/jquery.js /tmp/js.tmp.js

js-ole: js-dir
	# ole related js
	# the ordering in the following command corresponds to the ordering in the file
	rm -f $(COMPILED_JS_DIR)/ole.js
	cat public/js/ole/lib/Editor.js \
		public/js/ole/lib/Editor/Lang/en.js \
		public/js/ole/lib/Editor/Control/CleanFeature.js \
		public/js/ole/lib/Editor/Control/DeleteFeature.js \
		public/js/ole/lib/Editor/Control/Dialog.js \
		public/js/ole/lib/Editor/Control/DrawHole.js \
		public/js/ole/lib/Editor/Control/DrawPoint.js \
		public/js/ole/lib/Editor/Control/DrawPath.js \
		public/js/ole/lib/Editor/Control/DrawPolygon.js \
		public/js/ole/lib/Editor/Control/EditorPanel.js \
		public/js/ole/lib/Editor/Control/ImportFeature.js \
		public/js/ole/lib/Editor/Control/LayerSettings.js \
		public/js/ole/lib/Editor/Control/MergeFeature.js \
		public/js/ole/lib/Editor/Control/SnappingSettings.js \
		public/js/ole/lib/Editor/Control/UndoRedo.js \
		public/js/ole/lib/Editor/Control/SplitFeature.js >/tmp/js.tmp.js
	$(CLOSURE_COMPILER) --js /tmp/js.tmp.js --js_output_file $(COMPILED_JS_DIR)/ole.js
	rm -f /tmp/js.tmp.js


