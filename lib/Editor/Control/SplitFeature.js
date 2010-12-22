
OpenLayers.Editor.Control.SplitFeature = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    url: '',

    title: OpenLayers.i18n('oleSplitFeature'),

    initialize: function(layer, options) {

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.Path, options]);

        this.events.register('activate', this, this.test);

    },

    test: function() {
        if (this.layer.selectedFeatures.length < 1) {
            alert ('Bitte mindestens 1 Flächen auswählen.');
            this.deactivate();
        }
    },

    /**
     * Method: split Features
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry);
        var proceed = this.layer.events.triggerEvent(
            'sketchcomplete', {feature: feature}
        );
        if(proceed !== false) {
            if (this.layer.selectedFeatures.length > 0) {
                var multiPolygon = this.map.editor.toMultiPolygon(this.layer.selectedFeatures);
                var polyGeoJSON = new OpenLayers.Format.GeoJSON().write(multiPolygon);
                var lineGeoJSON = new OpenLayers.Format.GeoJSON().write(geometry);
                OpenLayers.Request.POST({
                    url: this.url,
                    data: OpenLayers.Util.getParameterString({cut: lineGeoJSON, geo: polyGeoJSON}),
                    headers: {"Content-Type": "application/x-www-form-urlencoded"},
                    callback: this.map.editor.requestComplete,
                    scope: this.map.editor
                });
            }
        }
    },

    CLASS_NAME: 'OpenLayers.Editor.Control.SplitFeature'
});