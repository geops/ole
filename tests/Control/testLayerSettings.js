
module("Layer Settings");

test("test Layer Settings constructor", 1, function() {

    var editor = new OpenLayers.Editor(null);
    var layerSettings = new OpenLayers.Editor.Control.LayerSettings();
    editor.map.addControl(layerSettings);

    ok(layerSettings instanceof OpenLayers.Editor.Control.LayerSettings,
        "new layerSettings returns OpenLayers.Editor.Control.LayerSettings object.");

});