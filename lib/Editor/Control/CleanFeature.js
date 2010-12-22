/**
 * @copyright  2010 geOps
 * @license    http://www.geops.de/license.txt
 * @version    $Id$
 * @link       http://www.geops.de
 */

/**
 * Class: OpenLayers.Editor.Control.CleanFeature
 * The Clean Feature control converts all selected features from a given layer 
 *     to a multipolygon and sends it as GeoJSON named "geo" to a server.
 *     The server whose url gets set by the contructor cleans the geometry and
 *     sends the result as GeoJSON named "geo" back to the client.
 *
 * Inherits from:
 *  - <OpenLayers.Control.Button>
 */
OpenLayers.Editor.Control.CleanFeature = OpenLayers.Class(OpenLayers.Control.Button, {

    url: '',

    title: OpenLayers.i18n('oleCleanFeature'),

    /**
     * Constructor: OpenLayers.Editor.Control.MergeFeature
     * Create a new control for merging features.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>}
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (layer, options) {
        this.layer = layer;
        OpenLayers.Control.Button.prototype.initialize.apply(this, [options]);
        this.trigger = this.cleanFeature;
    },

    /**
     * Method: cleanFeature
     */
    cleanFeature: function () {
        if (this.layer.selectedFeatures.length < 1) {
            this.map.editor.dialog.show(OpenLayers.i18n('oleCleanFeatureSelectFeature'));
        }
        else {
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
    
    CLASS_NAME: "OpenLayers.Editor.Control.CleanFeature"
});