# Minifies OLE using Closure Compiler
minified:
	java -jar closurecompiler.jar \
	--charset 'UTF-8' \
	--jscomp_error=checkDebuggerStatement \
	--jscomp_warning=checkVars \
	--jscomp_warning=deprecated \
	--jscomp_warning=duplicate \
	--jscomp_warning=invalidCasts \
	--externs client/lib/externs.js \
	--js 'client/lib/Editor.js' \
	--js 'client/lib/Editor/Control/CleanFeature.js' \
	--js 'client/lib/Editor/Control/DragFeature.js' \
	--js 'client/lib/Editor/Control/DeleteFeature.js' \
	--js 'client/lib/Editor/Control/Dialog.js' \
	--js 'client/lib/Editor/Control/DrawHole.js' \
	--js 'client/lib/Editor/Control/DrawPolygon.js' \
	--js 'client/lib/Editor/Control/DrawPath.js' \
	--js 'client/lib/Editor/Control/DrawPoint.js' \
	--js 'client/lib/Editor/Control/EditorPanel.js' \
	--js 'client/lib/Editor/Control/ImportFeature.js' \
	--js 'client/lib/Editor/Control/LayerSettings.js' \
	--js 'client/lib/Editor/Control/MergeFeature.js' \
	--js 'client/lib/Editor/Control/TransformFeature.js' \
	--js 'client/lib/Editor/Control/FixedAngleDrawing.js' \
	--js 'client/lib/Editor/Layer.js' \
	--js 'client/lib/Editor/Layer/Snapping.js' \
	--js 'client/lib/Editor/Control/SnappingSettings.js' \
	--js 'client/lib/Editor/Control/SplitFeature.js' \
	--js 'client/lib/Editor/Control/UndoRedo.js' \
	--js 'client/lib/Editor/Control/CADTools.js' \
	--js 'client/lib/Editor/Control/ParallelDrawing.js' \
	--js_output_file client/examples/ole.min.js