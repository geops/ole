
module("Import Feature");

test("test ImportFeature constructor and methods", 5, function() {

    var result = "";
    var sourceLayer = new OpenLayers.Layer.Vector("Source Layer");
    var sourceFeature = wkt.read("POLYGON((620867.66739033 258915.13008619,620923.8234449 258935.22804256,620955.15261219 258848.92505343,620904.90772126 258827.64486432,620867.66739033 258915.13008619))");
    sourceLayer.addFeatures([sourceFeature]);
    var editor = new OpenLayers.Editor(null, {
        status: function(options) {return options.content}
    });
    var importFeature = new OpenLayers.Editor.Control.ImportFeature(editor.editLayer);

    editor.editLayer.destroyFeatures();
    editor.map.addControl(importFeature);
    editor.map.addLayer(sourceLayer);

    ok(importFeature instanceof OpenLayers.Editor.Control.ImportFeature,
        "new importFeature returns OpenLayers.Editor.Control.ImportFeature object.");

    ok(importFeature.map instanceof OpenLayers.Map,
        "importFeature.map returns OpenLayers.Map object.");

    result = importFeature.importFeature();
    equals(result, "oleImportFeatureSourceLayer",
        "importFeature without selected import layer");

    editor.sourceLayers.push(sourceLayer);
    result = importFeature.importFeature();
    equals(result, "oleImportFeatureSourceFeature",
        "importFeature with selected import layer but without selected feature");

    editor.sourceLayers[0].selectedFeatures.push(sourceFeature);
    importFeature.importFeature();
    equals(wkt.write(editor.editLayer.features[0]), wkt.write(sourceFeature),
        "importFeature");

});