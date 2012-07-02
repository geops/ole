/**
 * Layer to draw guidelines and points for snapping
 */
OpenLayers.Editor.Layer.Snapping = OpenLayers.Class(OpenLayers.Layer.Vector, {
    CLASS_NAME: 'OpenLayers.Editor.Layer.Snapping',
    
    initialize: function(name, options) {
        if(options.styleMap===undefined){
            // Set default styles for guide lines
            options.styleMap = new OpenLayers.StyleMap({
                // Base styles to be merged with specific styles from rules
                'default': new OpenLayers.Style(
                    {
                        strokeColor: '#ff00ff',
                        strokeOpacity: 0.5,
                        strokeWidth: 1,
                        strokeDashstyle: 'solid',
                        fillColor: '#ff00ff'
                    }, {
                        rules: [
                            // Styles lines
                            new OpenLayers.Rule({
                                evaluate: function(feature){
                                    return feature.geometry instanceof OpenLayers.Geometry.LineString;
                                },
                                symbolizer: {
                                    strokeDashstyle: 'longdash'
                                }
                            }),
                            // Styles points
                            new OpenLayers.Rule({
                                evaluate: function(feature){
                                    return feature.geometry instanceof OpenLayers.Geometry.Point;
                                },
                                symbolizer: {
                                    graphicName: 'cross',
                                    pointRadius: 3,
                                    strokeWidth: 0
                                }
                            }),
                            // Styles everything else
                            new OpenLayers.Rule()
                        ]
                    }
                )
            });
        }
        OpenLayers.Layer.Vector.prototype.initialize.call(this, name, options);
    },

    /**
     * Adds geometries or vector features as guidelines
     * @param {Array.<(OpenLayers.Feature.Vector|OpenLayers.Geometry)>} features
     * @param {Object} options
     */
    addFeatures: function(features, options){
        var vectorFeatures = [];
        for(var i=0; i<features.length; i++){
            if(features[i] instanceof OpenLayers.Feature.Vector){
                vectorFeatures[i] = features[i];
            } else {
                vectorFeatures[i] = new OpenLayers.Feature.Vector(features[i]);
            }
        }
        OpenLayers.Layer.Vector.prototype.addFeatures.call(this, vectorFeatures, options);
    }
});