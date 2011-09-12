 /**
 * @copyright  2010 geOps
 * @license    http://www.geops.de/license.txt
 * @version    $Id$
 * @link       http://www.geops.de
 */

/**
 * @requires Editor/Control/EditorPanel.js
 */

/**
 * Class: OpenLayers.Editor
 * The OpenLayers Editor provides basic methods and informations for map editing.
 *     Highlevel functions are implemented in different controls and can be
 *     activated by the editor constructor. 
 *
 */
OpenLayers.Editor = OpenLayers.Class({

    /**
     * Property: map
     * {<OpenLayers.Map>} this gets set in the constructor.
     */
    map: null,

    /**
     * Property: id
     * {String} Unique identifier for the Editor.
     */
    id: null,

    /**
     * Property: editLayer
     * {<OpenLayers.Layer.Vector>} Editor workspace.
     */
    editLayer: null,

    /**
     * Property: editorPanel
     * {<OpenLayers.Editor.Control.EditorPanel>} Contains icons for active controls
     *     and gets set by startEditMode() and unset by stopEditMode().
     */
    editorPanel: null,

    /**
     * Property: editMode
     * {Boolean} The editor is active.
     */
    editMode: false,

    /**
     * Property: dialog
     * {<OpenLayers.Editor.Control.Dialog>} ...
     */
    dialog: null,

    /**
     * Property: status
     */
    showStatus: null,

    /**
     * Property: activeControls
     * {Array} ...
     */
    activeControls: [],

    /**
     * Property: editorControls
     * {Array} Contains names of all available editor controls. In particular
     *   this information is needed by this EditorPanel.
     */
    editorControls: ['CleanFeature', 'DeleteFeature', 'Dialog', 'DrawHole', 
        'DrawPolygon', 'EditorPanel', 'ImportFeature',
        'MergeFeature', 'SaveFeature', 'SnappingSettings', 'SplitFeature'],

    /**
     * Property: sourceLayers
     * {Array} ...
     */
    sourceLayers: [],

    /**
     * Property: parameters
     * {Object} ...
     */
    params: {},

    geoJSON: new OpenLayers.Format.GeoJSON(),

    /**
     * Property: options
     * {Object} ...
     */
    options: {},

    initialize: function (map, options) {

        OpenLayers.Util.extend(this, options);

        if (map instanceof OpenLayers.Map) {
            this.map = map;
        } else {
            this.map = new OpenLayers.Map();
        }
        
        if (!options) {
            options = {};
        }

        if (!options.dialog) {
            this.dialog = new OpenLayers.Editor.Control.Dialog();
            this.map.addControl(this.dialog);
        }

        this.id = OpenLayers.Util.createUniqueID('OpenLayers.Editor_');
        this.undoRedo = new OpenLayers.Editor.Control.UndoRedo();

        this.editLayer = new OpenLayers.Layer.Vector('Editor', {
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillColor: '#07f',
                    fillOpacity: 0.8,
                    strokeColor: '#037',
                    strokeWidth: 2,
                    graphicZIndex: 1,
                    pointRadius: 5
                }),
                'select': new OpenLayers.Style({
                    fillColor: '#fc0',
                    strokeColor: '#f70',
                    graphicZIndex: 2
                }),
                'temporary': new OpenLayers.Style({
                    fillColor: '#fc0',
                    fillOpacity: 0.8,
                    strokeColor: '#f70',
                    strokeWidth: 2,
                    graphicZIndex: 2,
                    pointRadius: 5
                })
            })
        })
        this.editLayer.events.register('featureadded', this.undoRedo, this.undoRedo.register);
        this.editLayer.events.register('afterfeaturemodified', this.undoRedo, this.undoRedo.register);


        this.map.editor = this;
        this.map.addLayer(this.editLayer);
        this.map.addLayers(this.sourceLayers);
        this.map.addControl(new OpenLayers.Editor.Control.LayerSettings());
        this.map.addControl(this.undoRedo);

        return this;
    },
    
    startEditMode: function () {
        if (!this.editorPanel) {
            this.editorPanel = new OpenLayers.Editor.Control.EditorPanel(this);
            this.editMode = true;
        }
    },

    stopEditMode: function () {
        this.map.removeControl(this.editorPanel);
        this.editorPanel = null;
        this.map.addControl(new OpenLayers.Control.DragPan({'autoActivate': true}));
        this.editMode = false;
    },

    status: function(options) {
        if (options.type == 'error') {
            alert(options.content);
        }
    },

    loadFeatures: function (options) {
        this.editLayer.destroyFeatures();
        this.params = options.params;
        if(options.features) {
            var geo =  new OpenLayers.Format.GeoJSON().read(options.features);
            this.editLayer.addFeatures(this.toFeatures(geo));
            this.map.zoomToExtent(this.editLayer.getDataExtent());
        } else {
            OpenLayers.Request.GET({
                url: this.options.LoadFeature.url,
                params: options.params,
                callback: this.loadFeaturesComplete,
                scope: this
            });
        }
    },

    loadFeaturesComplete: function (request) {
        var geo, responseJSON = new OpenLayers.Format.JSON().read(request.responseText);
        if (responseJSON.length > 0) {
            if (responseJSON[0].error) {
                this.showStatus('error', responseJSON.message);
            } else {
                OpenLayers.Util.extend(this.params, responseJSON[0].params);
                geo =  new OpenLayers.Format.GeoJSON().read(responseJSON[0].geo);
                if (!geo) {
                    this.showStatus('error', 'Geometrie konnte nicht geladen werden.')
                } else {
                    this.editLayer.addFeatures(this.toFeatures(geo));
                    this.map.zoomToExtent(this.editLayer.getDataExtent());
                }
            }
        }
    },

    requestComplete: function (response) {
        var responseJSON = new OpenLayers.Format.JSON().read(response.responseText),
            multiPolygon;
        if (!responseJSON) {
            this.showStatus('error', OpenLayers.i18n('oleNoJSON'))
        } else if (responseJSON.error) {
            this.showStatus('error', responseJSON.message)
        } else {
            if (responseJSON.params) {
                OpenLayers.Util.extend(this.params, responseJSON.params);
            }
            if (responseJSON.geo) {
                multiPolygon = this.geoJSON.read(responseJSON.geo);
                this.editLayer.removeFeatures(this.editLayer.selectedFeatures);
                this.editLayer.addFeatures(this.toFeatures(multiPolygon));
            }
        }
    },

    toFeatures: function (multiPolygon) {
        var features = [];
        if (!(multiPolygon instanceof Array)) {
            multiPolygon = [multiPolygon];
        }
        for (var i = 0, li = multiPolygon.length; i < li; i++) {
            if (multiPolygon[i].geometry.CLASS_NAME === 'OpenLayers.Geometry.MultiPolygon' ||
                multiPolygon[i].geometry.CLASS_NAME === 'OpenLayers.Geometry.Collection') {
                for (var j = 0, lj = multiPolygon[i].geometry.components.length; j < lj; j++) {
                    features.push(new OpenLayers.Feature.Vector(
                        multiPolygon[i].geometry.components[j]
                    ));
                }
            } else if (multiPolygon[i].geometry.CLASS_NAME === 'OpenLayers.Geometry.Polygon') {
                features.push(new OpenLayers.Feature.Vector(multiPolygon[i].geometry));
            }
        }
        return features;
    },

    toMultiPolygon: function (features) {
        var components = [];
        for (var i = 0, l = features.length; i < l; i++) {
            if (features[i].geometry.CLASS_NAME === 'OpenLayers.Geometry.Polygon') {
                components.push(features[i].geometry);
            }
        }
        return new OpenLayers.Geometry.MultiPolygon(components);
    },

    CLASS_NAME: 'OpenLayers.Editor'
});

OpenLayers.Editor.Control = OpenLayers.Class(OpenLayers.Control, {

    initialize: function (options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    CLASS_NAME: 'OpenLayers.Editor.Control'
});

