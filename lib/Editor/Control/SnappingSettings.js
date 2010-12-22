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
OpenLayers.Editor.Control.SnappingSettings = OpenLayers.Class(OpenLayers.Control.Button, {

    title: OpenLayers.i18n('oleSnappingSettings'),

    layer: null,

    snapping: new OpenLayers.Control.Snapping(),

    tolerance: 10,

    snappingLayers: [],

    initialize: function(layer, options) {

        this.layer = layer;

        OpenLayers.Control.Button.prototype.initialize.apply(this, [options]);
        
        this.trigger = this.openSnappingDialog.bind(this);

        this.events.register("deactivate", this, this.onDeactivate);

    },

    onDeactivate: function() {
        if(this.snapping.active) {
            this.activate();
        }
    },

    openSnappingDialog: function() {

        this.activate();

        var layerListDiv = new Element('div').
            writeAttribute('id','layerList').
            writeAttribute('style','margin-bottom:10px');
        
        var content = document.createElement('div');

        var toleranceHeader = new Element('h4').update("Snapping Toleranz");
        content.appendChild(toleranceHeader);

        var toleranceTrack = new Element('div').addClassName('sliderTrack').
            writeAttribute('style','width:209px; height:28px;');
        var toleranceHandle = new Element('div').addClassName('sliderHandle').
            writeAttribute('style','width:17px; height:21px;');
        toleranceTrack.appendChild(toleranceHandle);
        content.appendChild(toleranceTrack);
        var toleranceValue = new Element('div').addClassName('sliderValue').
            update(this.tolerance+' Pixel');
        content.appendChild(toleranceValue);

        new Control.Slider(toleranceHandle,toleranceTrack, {
            axis:'horizontal',
            range: $R(0, 200),
            sliderValue: this.tolerance,
            onSlide: this.changeTolerance.bind(this)
        });

        var layerHeader = new Element('h4').update("Snapping Layer");
        content.appendChild(layerHeader);

        content.appendChild(layerListDiv);

        this.map.editor.dialog.show(content, {
            title: 'Snapping Einstellungen',
            save: this.changeSnapping.bind(this),
            cancel: this.changeSnapping.bind(this)
        });

        this.redraw();
    },

    redraw: function() {
        var layerListDiv = $('layerList');
        layerListDiv.innerHTML = '';
        for (var i = 0; i <  this.map.layers.length; i++) {
            var layer = this.map.layers[i];
        //this.map.layers.each( function(layer) {
            if(layer.CLASS_NAME == "OpenLayers.Layer.Vector" && layer.name.search(/OpenLayers.Handler.+/) == -1) {
                var layerListItemLabel = new Element('label',{'for': 'Snapping.'+layer.id}).
                    update(layer.name);
                var layerListItemInput = new Element('input',{
                    'type':'checkbox',
                    'name':'snappingLayer',
                    'id':'Snapping.'+layer.id,
                    'value':'true'});
                if(this.snappingLayers.indexOf('Snapping.'+layer.id) >= 0) {
                    layerListItemInput.writeAttribute('checked','checked');
                    // IE7 hack
                    layerListItemInput.defaultChecked = 'selected';
                }
                layerListDiv.appendChild(layerListItemInput);
                layerListDiv.appendChild(layerListItemLabel);
                layerListDiv.appendChild(new Element('br'));
                layerListItemInput.observe('click', this.addSnappingLayer.bind(this));
            }
        }
    },

    addSnappingLayer: function(e) {
        if(this.snappingLayers.indexOf(e.element().id) >= 0)
            this.snappingLayers.splice(this.snappingLayers.indexOf(e.element().id), 1);
        else
            this.snappingLayers.push(e.element().id);
        this.redraw();
    },

    

    changeTolerance: function(value) {
        $$('div.sliderValue')[0].update(value.toFixed(0)+' Pixel');
        this.tolerance = value.toFixed(0);
    },
    
    changeSnapping: function(e) {
        if (e.element().id == 'saveButton') {
            if(this.snappingLayers.length > 0) {
                this.snapping.deactivate()
                var targets = [];
                for (var i = 0; i <  this.snappingLayers.length; i++) {
                    targets.push({
                        layer:this.map.getLayersBy('id',this.snappingLayers[i].substr(9))[0],
                        tolerance: parseInt(this.tolerance)
                    });
                }
                this.snapping = new OpenLayers.Control.Snapping({
                    layer: this.layer,
                    targets: targets
                });
                targets.each( function(target) {
                    target.layer.redraw();
                    target.layer.setVisibility(true);
                });
                this.snapping.activate();
            } else {
                if (this.snapping.active) {
                    this.snapping.deactivate();
                    this.snapping.targets = null;
                }
            }
        }
        if (!this.snapping.active) this.deactivate();
    },

    CLASS_NAME: "OpenLayers.Editor.Control.SnappingSettings"
});