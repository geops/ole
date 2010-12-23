/* Copyright (c) 2006 MetaCarta, Inc., published under a modified BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/repository-license.txt
 * for the full text of the license. */


/**
 * @requires OpenLayers/Control/DragFeature.js
 * @requires OpenLayers/Control/SelectFeature.js
 * @requires OpenLayers/Handler/Keyboard.js
 *
 * Class: OpenLayers.Control.ModifyFeature
 * Control to modify features.  When activated, a click renders the vertices
 *     of a feature - these vertices can then be dragged.  By default, the
 *     delete key will delete the vertex under the mouse.  New features are
 *     added by dragging "virtual vertices" between vertices.  Create a new
 *     control with the <OpenLayers.Control.ModifyFeature> constructor.
 *
 * Inherits From:
 *  - <OpenLayers.Control>
 */
OpenLayers.Editor.Control.UndoRedo = OpenLayers.Class(OpenLayers.Control, {

     /**
     * Property: handler
     * {<OpenLayers.Handler.Keyboard>}
     */
    handler: null,

     /**
     * APIProperty: autoActivate
     * {Boolean} Activate the control when it is added to a map.  Default is
     *     true.
     */
    autoActivate: true,

    /**
     * Constant: KEY_Z
     * {int}
     */
    KEY_Z: 90,

    /**
     * Constant: KEY_Y
     * {int}
     */
    KEY_Y: 89,

	/**
     * APIMethod: onUndo
     *
     * Called after a successful undo, passing in the feature that was altered.
     */
	onUndo: function(){},

	/**
     * APIMethod: onRedo
     *
     * Called after a successful redo, passing in the feature that was altered.
     */
	onRedo: function(){},

	/**
     * APIMethod: onRemoveFeature
     *
     * Called when the Undo/Redo control is about to remove a feature from the layer. This call happens before the feature is removed.
     */
	onRemoveFeature: function(){},

	/**
     * Property: undoStack
     * {<Array>}
     *
     * A stack containing states of a feature that can be undone. Objects on this stack are hashes, of the form {feature: ..., :geometry ...}.
     */
    undoStack: null,

 	/**
     * Property: redoStack
     * {<Array>}
     *
     * A stack containing states of a feature that can be redone. Objects on this stack are hashes, of the form {feature: ..., :geometry ...}.
     */
    redoStack: null,

    /**
     * Constructor: OpenLayers.Control.UndoRedo
     * Create a new Undo/Redo control. Does not take any parameters.
     */
    initialize: function() {

        OpenLayers.Control.prototype.initialize.apply(this, arguments);

        this.undoStack = new Array();
        this.redoStack = new Array();
    },

    /**
     * Method: draw
     * Activates the control.
     */
    draw: function() {
        this.handler = new OpenLayers.Handler.Keyboard( this, {
                "keydown": this.handleKeydown} );
    },

    /**
     * Method: handleKeydown
     * Called by the feature handler on keydown.
     *
     * Parameters:
     * {Integer} Key code corresponding to the keypress event.
     */
    handleKeydown: function(e) {
        if (e.keyCode === this.KEY_Z && e.ctrlKey === true && e.shiftKey === false) {
            this.undo();
        }
        else if (e.ctrlKey === true && ((e.keyCode === this.KEY_Y) || (e.keyCode === this.KEY_Z && e.shiftKey === true))) {
            this.redo();
        }
    },

    /**
     * APIMethod: undo
     * Causes an the Undo/Redo control to process an undo.
     */
    undo: function() {
        var feature = this.moveBetweenStacks(this.undoStack, this.redoStack);
        if (feature) this.onUndo(feature);
    },

    /**
     * APIMethod: redo
     * Causes an the Undo/Redo control to process an undo.
     */
    redo: function() {
        var feature = this.moveBetweenStacks(this.redoStack, this.undoStack);
        if (feature) this.onRedo(feature);
    },

    /**
     * Method: moveBetweenStacks
     * The "meat" of the Undo/Redo control -- it actually does the undoing/redoing. Although some idiosyncrasies exist, this function
     * handles moving states from the undo stack to the redo stack, and vice versa. It also handles adding and removing features from the map.
     *
     * Parameters: TODO
     */
    moveBetweenStacks: function(fromStack, toStack) {

        if (fromStack.length > 0) {

            var state = fromStack.pop();
            toStack.push(state);

            var layer = this.map.getLayersBy('id', state.layerId)[0];
            var feature = layer.getFeatureById(state.id);

            // If the feature is not on the layer we must be redoing a previous addition.
            // Add the feature on the map.
            if (feature == null) {
                console.log("redo previous addition");
                feature = new OpenLayers.Feature.Vector(state.geometry);
                feature.id = state.id;
                layer.addFeatures(feature);
            }

            // So, we're either undoing or redoing a feature to a previous state.
            // Remove the feature from the layer.
            else {
                console.log("goto previous state");
                layer.removeFeatures(feature);
                if (fromStack.length > 0) {
                    var prevState = fromStack[fromStack.length - 1];
                    if (prevState.id == state.id) {
                        feature.geometry = prevState.geometry;
                        feature.id = prevState.id;
                        layer.drawFeature(feature);
                        return state;
                    }
                }
                layer.removeFeatures(feature);
            }
            return state;
        }
    },

    register: function(event) {

        if (this.undoStack.length > 0) {
            var prev = this.undoStack[this.undoStack.length - 1];
            if (prev.geometry.equals(event.feature.geometry) && prev.id === event.feature.id) {
//                console.log("already registered: "+prev.geometry.equals(event.feature.geometry));
                return;
            }
        }

//        if (this.undoStack[this.undoStack.length - 1].geometry != event.feature.geometry) {
//            console.log("registered");
//            console.log(event.feature);
            this.redoStack = new Array();
            this.undoStack.push({
                id: event.feature.id,
                layerId: event.feature.layer.id, 
                geometry: event.feature.geometry.clone()
            });
//        }
        

    },

    CLASS_NAME: "OpenLayers.Editor.Control.UndoRedo"
});