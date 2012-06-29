/**
 * Creates orthogonal guidelines while drawing lines
 */
OpenLayers.Editor.Control.FixedAngleDrawing = OpenLayers.Class(OpenLayers.Control, {
    CLASS_NAME: 'OpenLayers.Editor.Control.FixedAngleDrawing',

    /**
     * @var {OpenLayers.Vector.Feature} Feature that is currently be worked on
     */
    sketch: null,
    /**
     * @var {Number} Number of vertices in geometry
     */
    sketchLength: null,
    /**
     * @var {Boolean} Whether guidelines shall be shown
     */
    showGuideLines: false,
    
    initialize: function(editLayer) {
        OpenLayers.Control.prototype.initialize.call(this);
        this.layer = editLayer;
    },
    
    activate: function() {
        var activated = OpenLayers.Control.prototype.activate.call(this);
        if(activated) {
            if(this.layer && this.layer.events) {
                this.layer.events.on({
                    sketchstarted: this.onSketchModified,
                    sketchmodified: this.onSketchModified,
                    sketchcomplete: this.onSketchComplete,
                    scope: this
                });
            }
        }
        return activated;
    },
    
    deactivate: function() {
        var deactivated = OpenLayers.Control.prototype.deactivate.call(this);
        if(deactivated) {
            if(this.layer && this.layer.events) {
                this.layer.events.un({
                    sketchstarted: this.onSketchModified,
                    sketchmodified: this.onSketchModified,
                    scope: this
                });
            }
        }
        this.feature = null;
        this.point = null;
        return deactivated;
    },

    /**
     * Detects start of sketching and triggers guideline modification
     */
    onSketchModified: function(event){
        if(this.sketch===null){
            this.sketch = event.feature;
            this.sketchLength = this.sketch.geometry.components.length;
        } else if(event.feature.geometry.components.length>this.sketchLength){
            this.sketchLength = this.sketch.geometry.components.length;
            if(this.showGuideLines){
                var vertexLength = this.sketch.geometry.components.length;
                this.updateGuideLines(this.sketch.geometry.components[vertexLength-3], this.sketch.geometry.components[vertexLength-2]);
            } else {
                this.showGuideLines = true;
            }
        }
    },

    /**
     * Resets flags once the user is done editing a geometry
     */
    onSketchComplete: function(){
        var snappingGuideLayer = map.getLayersByClass('OpenLayers.Editor.Layer.Snapping')[0];
        snappingGuideLayer.destroyFeatures();
        this.sketch = null;
        this.sketchLength = null;
        this.showGuideLines = false;
    },

    /**
     * Draws guidelines at pointLastFixed
     * @var {OpenLayers.Geometry.Point} pointEarlierFixed Point draw before last point was drawn
     * @var {OpenLayers.Geometry.Point} pointLastFixed Last point drawn
     */
    updateGuideLines: function(pointEarlierFixed, pointLastFixed){
        console.log(arguments);
        var snappingGuideLayer = map.getLayersByClass('OpenLayers.Editor.Layer.Snapping')[0];
        snappingGuideLayer.destroyFeatures();
        snappingGuideLayer.addFeatures([pointLastFixed.clone()]);

        var maxExtend = map.getMaxExtent()

        // Draw guide along segment
        var m = (pointLastFixed.y-pointEarlierFixed.y)/(pointLastFixed.x-pointEarlierFixed.x);
        var b = pointLastFixed.y-(m*pointLastFixed.x);
        snappingGuideLayer.addFeatures([
            new OpenLayers.Geometry.LineString([
                new OpenLayers.Geometry.Point(maxExtend.left, m*(maxExtend.left)+b),
                new OpenLayers.Geometry.Point(maxExtend.right, m*maxExtend.right+b)
            ])
        ]);

        // Draw guide orthogonal to segment with intersection at pointLastFixed
        var m2 = (-1/m);
        var b2 = pointLastFixed.y-(m2*pointLastFixed.x);
        snappingGuideLayer.addFeatures([
            new OpenLayers.Geometry.LineString([
                new OpenLayers.Geometry.Point(maxExtend.left, m2*(maxExtend.left)+b2),
                new OpenLayers.Geometry.Point(maxExtend.right, m2*maxExtend.right+b2)
            ])
        ]);
    }
});