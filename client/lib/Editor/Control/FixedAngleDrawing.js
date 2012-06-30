/**
 * Creates orthogonal guidelines while drawing features
 */
OpenLayers.Editor.Control.FixedAngleDrawing = OpenLayers.Class(OpenLayers.Control, {
    CLASS_NAME: 'OpenLayers.Editor.Control.FixedAngleDrawing',
    
    initialize: function(editLayer) {
        OpenLayers.Control.prototype.initialize.call(this);
        this.layer = editLayer;
    },
    
    activate: function() {
        var activated = OpenLayers.Control.prototype.activate.call(this);
        if(activated) {
            if(this.layer && this.layer.events) {
                this.layer.events.on({
                    sketchstarted: this.onSketchStarted,
                    sketchmodified: this.onSketchModified,
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
                    sketchstarted: this.onSketchStarted,
                    sketchmodified: this.onSketchModified
                });
            }
        }
        return deactivated;
    },

    /**
     * Triggers guideline modification
     */
    onSketchModified: function(event){
        var vertices = event.feature.geometry.getVertices();
        if(vertices.length>2){
            this.updateGuideLines(
                vertices[vertices.length-3],
                vertices[vertices.length-2]
            );
        }
    },
    
    /**
     * Captures sketch and registers handler to hide guidelines after sketching is done
     */
    onSketchStarted: function(event){
        // A new sketch was added to the map
        var sketch = event.feature;
        
        var sketchLayer;
        if(sketch.geometry instanceof OpenLayers.Geometry.LineString || sketch.geometry instanceof OpenLayers.Geometry.Polygon){
            // Look for the active drawing control and get its temporary sketch layer
            sketchLayer = this.map.controls.filter(function(control){
                return control.active && control.handler instanceof OpenLayers.Handler.Path;
            })[0].handler.layer
        } else {
            // Feature type is not supported
            return;
        }
        sketchLayer.events.on({
            featureremoved: function(event){
                if(event.feature.id===sketch.id){
                    // Sketch was removed (canceled or completed)
                    this.getSnappingGuideLayer().destroyFeatures();
                }
            },
            scope: this
        })
    },
    
    /**
     * @return {OpenLayers.Editor.Layer.Snapping}
     */
    getSnappingGuideLayer: function(){
        return this.map.getLayersByClass('OpenLayers.Editor.Layer.Snapping')[0];
    },

    /**
     * Draws guidelines at pointLastFixed
     * @var {OpenLayers.Geometry.Point} pointEarlierFixed Point draw before last point was drawn
     * @var {OpenLayers.Geometry.Point} pointLastFixed Last point drawn
     */
    updateGuideLines: function(pointEarlierFixed, pointLastFixed){
        var snappingGuideLayer = this.getSnappingGuideLayer();
        snappingGuideLayer.destroyFeatures();
        snappingGuideLayer.addFeatures([pointLastFixed.clone()]);

        var maxExtend = this.map.getMaxExtent()

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