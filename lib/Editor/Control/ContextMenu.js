/**
 * @copyright  2015 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 */

/**
 * Class: OpenLayers.Editor.Control.ContextMenu
 * The ContextMenu contains editor controls
 *     and is opened on feature selection
 *
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 *
 * @constructor
 * @param {OpenLayers.Layer} The editor layer
 * @param {Object=} options
 */
OpenLayers.Editor.Control.ContextMenu = OpenLayers.Class(OpenLayers.Control.Panel, {

    /**
     * {Number} Type of the control
     */
    type: OpenLayers.Control.TYPE_BUTTON,

    /**
     * {Number} Distance (in pixel) of the context menu to the bbox
     * of the selected features
     */
    menuBufferDistance: 10,

    /**
     * {Array} Contains list of controls appearing on context menu
     */
    contextMenuControls: ['CleanFeature', 'DeleteFeature', 'DrawHole',
        'MergeFeature', 'SplitFeature', 'TransformFeature'],

    /**
     * Constructor OpenLayers.Editor.Control.ContextMenu
     *
     * Parameters:
     * @param {OpenLayers.Layer} The editor layer
     * @param {Object} options
     */
    initialize: function (layer, options) {
        layer.events.register('featureselected', this, this.openContextMenu);
        layer.events.register('featureunselected', this, this.closeContextMenu);
        layer.map.events.register('move', this, this.updatePosition);

        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);

        layer.map.addControl(this);
    },

    /**
     * Move all context menu controls from editor panel
     * to this panel
     */
    addContextMenuControls: function() {
        var controls = [];
        for (var i = 0; i < this.contextMenuControls.length; i++) {
            var controlName = this.contextMenuControls[i];
            var control = this.map.editor.controls[controlName];
            if (control) {
                controls.push(control);
            }
        }

        this.addControls(controls);
    },

    /**
     * Open the context menu
     */
    openContextMenu: function() {
        this.div.style.display = '';
        this.addContextMenuControls();
        this.activate();
        this.updatePosition();

        for (var i = 0; i < this.controls.length; i++) {
            OpenLayers.Element.removeClass(this.controls[i].panel_div,
                'oleControlDisabled');
        }
    },

    /**
     * Close the context menu
     */
    closeContextMenu: function() {
        if (!this.map.editor.editLayer.selectedFeatures.length) {
            this.div.style.display = 'none';
            this.deactivate();
        }
    },

    /**
     * Place the context menu on the point on the selected features'
     * bounding box with the smallest distance to the map center.
     */
    updatePosition: function() {
        var selFeatures = this.map.editor.editLayer.selectedFeatures;

        if (!selFeatures.length) {
            return;
        }

        var bounds = new OpenLayers.Bounds();
        var mapCenter = this.map.getExtent().getCenterLonLat();
        mapCenter = new OpenLayers.Geometry.Point(
            mapCenter.lon, mapCenter.lat);

        for (var i = 0; i < (selFeatures || []).length; i++) {
            bounds.extend(selFeatures[i].geometry.getBounds());
        }

        var dist = bounds.toGeometry().distanceTo(mapCenter,
            {'details': true}) || {'x0': bounds.left, 'y0': bounds.top};

        var menuPosition = this.map.getPixelFromLonLat(
            new OpenLayers.LonLat(dist.x0, dist.y0));

        this.div.style.right = 'initial';
        this.div.style.left = menuPosition.x + 'px';
        this.div.style.top = menuPosition.y + 'px';

        if (dist.y0 === bounds.top) {
            this.div.style.top = parseInt(this.div.style.top) -
                this.menuBufferDistance - this.div.clientHeight + 'px';
        } else if (dist.y0 === bounds.bottom) {
            this.div.style.top = parseInt(this.div.style.top) +
                this.menuBufferDistance + 'px';
        }

        if (dist.x0 === bounds.left) {
            this.div.style.left = parseInt(this.div.style.left) -
                this.menuBufferDistance - this.div.clientWidth + 'px';
        } else if (dist.x0 === bounds.right) {
            this.div.style.left = parseInt(this.div.style.left) +
                this.menuBufferDistance + 'px';
        }
    },

    CLASS_NAME: 'oleContextMenu OpenLayers.Editor.Control.EditorPanel'
});
