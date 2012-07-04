COMPILED_JS_DIR=public/js/min
JAVA?=java
CLOSURE_COMPILER=$(JAVA) -jar tools/closure-compiler.jar
YUI_COMPRESSOR=$(JAVA) -jar tools/yuicompressor.jar
MARKDOWN=perl tools/Markdown.pl --html4tags
OLE_SOURCE=../client/lib
APPLICATION_CONFIG=application/configs/application.ini

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

js-openlayers: js-dir setup
	cd .. && git submodule update
	# for adapting the openlayers build please alter the file at
	# public/js/openlayers/build/demo.cfg
	# or use full.cfg to avoid the horrible js dependency tracking
	# Closure-compiler will break openlayers, yui-compressor works
	rm -f $(COMPILED_JS_DIR)/openlayers.js
	cd public/js/openlayers/build && python build.py ../../../../openlayers.cfg
	$(YUI_COMPRESSOR) -o $(COMPILED_JS_DIR)/openlayers.js public/js/openlayers/build/OpenLayers.js
	rm -f public/js/openlayers/build/OpenLayers.js

js-jquery: js-dir
	# jquery core and jquery ui
	rm -f $(COMPILED_JS_DIR)/jquery.js
	cat public/js/jquery.js public/js/demo.js > /tmp/js.tmp.js
	$(YUI_COMPRESSOR) -o $(COMPILED_JS_DIR)/jquery.js /tmp/js.tmp.js

js-ole: js-dir
	# ole related js
	rm -f $(COMPILED_JS_DIR)/ole.js
	# the ordering in the following command corresponds to the ordering in the file
	#rm -f $(COMPILED_JS_DIR)/ole.js
	cat $(OLE_SOURCE)/Editor/Lang/en.js \
		$(OLE_SOURCE)/Editor.js \
		$(OLE_SOURCE)/Editor/Control/CleanFeature.js \
		$(OLE_SOURCE)/Editor/Control/DragFeature.js \
		$(OLE_SOURCE)/Editor/Control/DeleteFeature.js \
		$(OLE_SOURCE)/Editor/Control/Dialog.js \
		$(OLE_SOURCE)/Editor/Control/DrawHole.js \
		$(OLE_SOURCE)/Editor/Control/DrawPolygon.js \
		$(OLE_SOURCE)/Editor/Control/DrawPath.js \
		$(OLE_SOURCE)/Editor/Control/DrawPoint.js \
		$(OLE_SOURCE)/Editor/Control/EditorPanel.js \
		$(OLE_SOURCE)/Editor/Control/ImportFeature.js \
		$(OLE_SOURCE)/Editor/Control/LayerSettings.js \
		$(OLE_SOURCE)/Editor/Control/MergeFeature.js \
		$(OLE_SOURCE)/Editor/Control/SaveFeature.js \
		$(OLE_SOURCE)/Editor/Control/FixedAngleDrawing.js \
		$(OLE_SOURCE)/Editor/Layer.js \
		$(OLE_SOURCE)/Editor/Layer/Snapping.js \
		$(OLE_SOURCE)/Editor/Control/SnappingSettings.js \
		$(OLE_SOURCE)/Editor/Control/SplitFeature.js \
		$(OLE_SOURCE)/Editor/Control/UndoRedo.js \
		$(OLE_SOURCE)/Editor/Control/FixedAngleDrawing.js \
		$(OLE_SOURCE)/Editor/Control/CADTools.js \
		$(OLE_SOURCE)/Editor/Control/ParallelDrawing.js \
		> /tmp/js.tmp.js
	$(CLOSURE_COMPILER) --js /tmp/js.tmp.js --js_output_file $(COMPILED_JS_DIR)/ole.js
	rm -f /tmp/js.tmp.js

setup:
	if test -f $(APPLICATION_CONFIG); \
	then \
		echo 'Leaving existing configuration untouched'; \
	else \
		cp $(APPLICATION_CONFIG).dist $(APPLICATION_CONFIG); \
		echo 'Created configuration'; \
	fi

	# Copying OLE from its source (copy instead of symlinks because Apache's limits)
	rm -rf public/js/ole
	cp -r ../client/ public/js/ole

	cd .. && git submodule init

