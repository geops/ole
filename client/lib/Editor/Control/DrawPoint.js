/**
 * @copyright  2011 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 */

/**
 * Class: OpenLayers.Editor.Control.DrawPoint
 *
 * Inherits from:
 *  - <OpenLayers.Control.DrawFeature>
 */
OpenLayers.Editor.Control.DrawPoint = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    title: OpenLayers.i18n('oleDrawPoint'),
    featureType: 'point',

    /**
     * Constructor: OpenLayers.Editor.Control.DrawPath
     * Create a new control for drawing points.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Points will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (layer, options) {
        this.callbacks = OpenLayers.Util.extend(this.callbacks, {
            point: function (point) {
                this.layer.events.triggerEvent('pointadded', {point: point});
            }
        });

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
                [layer, OpenLayers.Handler.Point, options]);

        this.title = OpenLayers.i18n('oleDrawPoint');
    },

    /**
     * Method: draw point
     */
    drawFeature: function (geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry),
                proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature});

        feature.featureType = this.featureType;

        if (proceed !== false) {
            this.events.triggerEvent('beforefeatureadded', {feature: feature});
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent('featureadded', {feature: feature});
        }
    },

    CLASS_NAME: 'OpenLayers.Editor.Control.DrawPoint'
});