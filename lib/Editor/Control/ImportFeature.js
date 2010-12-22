/**
 * @copyright  2010 geOps
 * @license    http://www.geops.de/license.txt
 * @version    $Id$
 * @link       http://www.geops.de
 */

/**
 * Class: OpenLayers.Editor.Control.ImportFeature
 * The ImportFeature provides a button to import all selected features
 *     to a given layer. Layers from which selected features will be imported
 *     must have a property exportFeature set to true.
 *
 * Inherits from:
 *  - <OpenLayers.Control.Button>
 */
OpenLayers.Editor.Control.ImportFeature = OpenLayers.Class(OpenLayers.Control.Button, {

    /**
     * Property: layer
     * {<OpenLayers.Layer.Vector>}
     */
    layer: null,

    title: OpenLayers.i18n('oleImportFeature'),

    /**
     * Constructor: OpenLayers.Editor.Control.DeleteFeature
     * Create a new control for importing features.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} The layer to which selected
     *     features will be imported.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (layer, options) {

        this.layer = layer;

        OpenLayers.Control.Button.prototype.initialize.apply(this, [options]);

        this.trigger = this.importFeature;

    },

    /**
     * Method: importFeature
     */
    importFeature: function () {

        var importFeatures = [];

        var countImportLayers = 0;

        for (var i = 0, li = this.map.layers.length; i < li; i++) {
            if(this.map.layers[i].exportFeature) {
                for (var j = 0, lj = this.map.layers[i].selectedFeatures.length; j < lj; j++) {
                    importFeatures.push(new OpenLayers.Feature.Vector(
                        this.map.layers[i].selectedFeatures[j].geometry.clone()
                    ));
                }
                countImportLayers++;
            }
        }
        if (!countImportLayers) {
            this.map.editor.dialog.show(
                OpenLayers.i18n('oleImportFeatureSelectLayer'), {type:'error'}
            );
        } else if (!importFeatures.length) {
            this.map.editor.dialog.show(
                OpenLayers.i18n('oleImportFeatureSelectFeature'), {type:'error'}
            );
        } else {
            this.layer.addFeatures(importFeatures);
        }
    },

    CLASS_NAME: 'OpenLayers.Editor.Control.ImportFeature'
});