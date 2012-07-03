/**
 * @copyright  2011 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 */

/**
 * Class: OpenLayers.Editor.Control.SnappingSettings
 * ...
 *
 * Inherits from:
 *  - <OpenLayers.Control.Button>
 */
OpenLayers.Editor.Control.CADTools = OpenLayers.Class(OpenLayers.Control.Button, {

    title: OpenLayers.i18n('oleCADTools'),

    layer: null,

    parallelDrawingButton: null,

    guidedDrawingButton: null,

    tolerance: 10,

    fixedAngleDrawingControl: null,
    parallelDrawingControl: null,

    initialize: function(layer, options) {

        this.layer = layer;

        this.fixedAngleDrawingControl = new OpenLayers.Editor.Control.FixedAngleDrawing(layer);
        this.parallelDrawingControl = new OpenLayers.Editor.Control.ParallelDrawing(layer);

        OpenLayers.Control.Button.prototype.initialize.apply(this, [options]);
        
        this.trigger = OpenLayers.Function.bind(this.openCADToolsDialog, this);

        this.events.register("deactivate", this, this.onDeactivate);

        this.title = OpenLayers.i18n('oleCADTools');

    },

    setMap: function(map) {

        OpenLayers.Control.Button.prototype.setMap.call(this, map);

        this.map.addControl(this.fixedAngleDrawingControl);
        this.map.addControl(this.parallelDrawingControl);
    },

    openCADToolsDialog: function() {

        if (this.active) {
            this.deactivate();
            this.map.editor.dialog.hide();
        } else {

            this.activate();

            var content, element;

            content = document.createElement('div');

            var toolbar = document.createElement('div');
            toolbar.setAttribute('class', 'olEditorControlEditorPanel');
            toolbar.setAttribute('style', 'top:10px;right:10px;');

            this.parallelDrawingButton = document.createElement('div');
            this.parallelDrawingButton.title = OpenLayers.i18n('oleCADToolsDialogParallelDrawing');
            if (this.parallelDrawingControl.active) {
                this.parallelDrawingButton.setAttribute('class', 'olEditorParallelDrawingActive');
            } else {
                this.parallelDrawingButton.setAttribute('class', 'olEditorParallelDrawingInactive');
            }
            OpenLayers.Event.observe(this.parallelDrawingButton, 'click', OpenLayers.Function.bind(function() {
                if (this.parallelDrawingControl.active) {
                    this.parallelDrawingControl.deactivate();
                    this.parallelDrawingButton.setAttribute('class', 'olEditorParallelDrawingInactive');
                } else {
                    this.parallelDrawingControl.activate();
                    this.parallelDrawingButton.setAttribute('class', 'olEditorParallelDrawingActive');
                }
            }, this, this.parallelDrawingButton));
            toolbar.appendChild(this.parallelDrawingButton);

            this.guidedDrawingButton = document.createElement('div');
            this.guidedDrawingButton.title = OpenLayers.i18n('oleCADToolsDialogGuidedDrawing');
            if (this.fixedAngleDrawingControl.active) {
                this.guidedDrawingButton.setAttribute('class', 'olEditorGuidedDrawingActive');
            } else {
                this.guidedDrawingButton.setAttribute('class', 'olEditorGuidedDrawingInactive');
            }
            OpenLayers.Event.observe(this.guidedDrawingButton, 'click', OpenLayers.Function.bind(function() {
                if (this.fixedAngleDrawingControl.active) {
                    this.fixedAngleDrawingControl.deactivate();
                    this.guidedDrawingButton.setAttribute('class', 'olEditorGuidedDrawingInactive');
                } else {
                    var layer = this.map.getLayersByClass('OpenLayers.Editor.Layer.Snapping')[0];
                    var snapping = new OpenLayers.Control.Snapping({
                        layer: this.layer,
                        targets: [{layer: layer, tolerance: this.tolerance}]
                    });
                    snapping.activate();
                    this.fixedAngleDrawingControl.activate();
                    this.guidedDrawingButton.setAttribute('class', 'olEditorGuidedDrawingActive');
                }
            }, this, this.guidedDrawingButton));
            toolbar.appendChild(this.guidedDrawingButton);

            content.appendChild(toolbar);

            /*
            toleranceHeader = document.createElement('h4');
            toleranceHeader.innerHTML = OpenLayers.i18n('oleSnappingSettingsTolerance');
            content.appendChild(toleranceHeader);
            */

            var settings = document.createElement('div');
            var showGuideLine = document.createElement('p');
            var showLayer = document.createElement('input');
            showLayer.type = 'checkbox';
            showLayer.id = 'oleCADToolsDialogShowLayer';
            showLayer.name = 'guidedDrawing';
            showLayer.value = 'true';
            showGuideLine.appendChild(showLayer);

            OpenLayers.Event.observe(showGuideLine, 'click', OpenLayers.Function.bind(function(event) {
                // Prevent propagation of event to drawing controls
                OpenLayers.Event.stop(event, true);
                
                var snappingLayer = this.map.getLayersByClass('OpenLayers.Editor.Layer.Snapping')[0];
                snappingLayer.setVisibility(showLayer.checked);
            }, this));

            element = document.createElement('label');
            element.setAttribute('for', 'oleCADToolsDialogShowLayer');
            element.innerHTML = OpenLayers.i18n('oleCADToolsDialogShowLayer');
            showGuideLine.appendChild(element);
            settings.appendChild(showGuideLine);

            var toleranceSetting = document.createElement('p');
            element = document.createElement('input');
            element.type = 'text';
            element.id = 'oleCADToolsDialogTolerance';
            element.size = 4;
            element.value = this.tolerance;
            toleranceSetting.appendChild(element);

            element = document.createElement('label');
            element.setAttribute('for', 'oleCADToolsDialogTolerance');
            element.innerHTML = OpenLayers.i18n('oleCADToolsDialogTolerance');
            toleranceSetting.appendChild(element);
            settings.appendChild(toleranceSetting);

            content.appendChild(settings);
            this.map.editor.dialog.show({
                content: content,
                toolbox: true
            });
        }
    },



    CLASS_NAME: "OpenLayers.Editor.Control.CADTools"
});