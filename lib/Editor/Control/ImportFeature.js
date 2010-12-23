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

        if (this.map.editor.sourceLayers.length > 0) {
            
            for (var i = 0, li = this.map.editor.sourceLayers.length; i < li; i++) {
                for (var j = 0, lj = this.map.editor.sourceLayers[i].selectedFeatures.length; j < lj; j++) {
                    importFeatures.push(this.map.editor.sourceLayers[i].selectedFeatures[j])
                }
            }

            if (importFeatures.length > 0) {

                this.layer.addFeatures(importFeatures);

            } else {
                return this.map.editor.status({
                    type: 'error',
                    content: OpenLayers.i18n('oleImportFeatureSourceFeature')
                });
            }

        } else {
            return this.map.editor.status({
                type: 'error',
                content: OpenLayers.i18n('oleImportFeatureSourceLayer')
            });
        }
    },

    CLASS_NAME: 'OpenLayers.Editor.Control.ImportFeature'
});