/**
 * @copyright  2010 geOps
 * @license    http://www.geops.de/license.txt
 * @version    $Id$
 * @link       http://www.geops.de
 */

/**
 * Class: OpenLayers.Editor.Control.MergeFeature
 * ...
 *
 * Inherits from:
 *  - <OpenLayers.Control.Button>
 */
OpenLayers.Editor.Control.MergeFeature = OpenLayers.Class(OpenLayers.Control.Button, {

    url: '',

    title: OpenLayers.i18n('oleMergeFeature'),

    /**
     * Constructor: OpenLayers.Editor.Control.MergeFeature
     * Create a new control for merging features.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function(layer, options) {

        this.layer = layer;

        OpenLayers.Control.Button.prototype.initialize.apply(this, [options]);

        this.trigger = this.mergeFeature;

    },

    /**
     * Method: mergeFeature
     */
    mergeFeature: function () {
        if (this.layer.selectedFeatures.length < 2) {
            this.map.editor.showStatus('error', OpenLayers.i18n('oleMergeFeatureSelectFeature'));
        } else {
            var multiPolygon = this.map.editor.toMultiPolygon(this.layer.selectedFeatures),
                multiPolygonJSON = new OpenLayers.Format.GeoJSON().write(multiPolygon);
            OpenLayers.Request.POST({
                url: this.url,
                data: OpenLayers.Util.getParameterString({geo: multiPolygonJSON}),
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                callback: this.map.editor.requestComplete,
                scope: this.map.editor
            });
        }
    },
    
    CLASS_NAME: "OpenLayers.Editor.Control.MergeFeature"
});