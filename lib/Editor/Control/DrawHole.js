/**
 * @copyright  2010 geOps
 * @license    http://www.geops.de/license.txt
 * @version    $Id$
 * @link       http://www.geops.de
 */

/**
 * Class: OpenLayers.Editor.Control.DrawHole
 * The DrawHole control provides a method to cut holes in features
 *     from a given layer. All vertices from the hole feature must
 *     lay within the targted feature and only the top most feature
 *     will be processed.
 *
 * Inherits from:
 *  - <OpenLayers.Control.DrawFeature>
 */
OpenLayers.Editor.Control.DrawHole = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    /**
     * Property: minArea
     * {Number} Minimum hole area.
     */
    minArea: 2,

    title: OpenLayers.i18n('oleDrawHole'),
    
    /**
     * Constructor: OpenLayers.Editor.Control.DrawHole
     * Create a new control for deleting features.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (layer, options) {

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.Polygon, options]);

    },

    /**
     * Method: drawFeature
     * Cut hole only if area greater than or equal to minArea and all
     *     vertices intersect the targeted feature.
     */
    drawFeature: function (geometry) {

        var feature = new OpenLayers.Feature.Vector(geometry),
            proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature}),
            vertices = geometry.getVertices(), intersects;

        if (proceed !== false && geometry.getArea() >= this.minArea) {
            
            feature.state = OpenLayers.State.INSERT;

            features: for (var i = 0, li = this.layer.features.length; i < li; i++) {
                var layerFeature = this.layer.features[i];
                intersects = true;
                for (var j = 0, lj = vertices.length; j < lj; j++) {
                    if (!layerFeature.geometry.intersects(vertices[j])) {
                        intersects = false;
                    }
                }
                if (intersects) {
                    this.layer.removeFeatures([layerFeature]);
                    layerFeature.geometry.components.push(geometry.components[0]);
                    this.layer.addFeatures([layerFeature]);
                    break features;
                }
            }
        }
    },

    CLASS_NAME: 'OpenLayers.Editor.Control.DrawHole'
});