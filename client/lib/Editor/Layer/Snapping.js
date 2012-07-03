/**
 * Layer to draw guidelines and points for snapping
 */
OpenLayers.Editor.Layer.Snapping = OpenLayers.Class(OpenLayers.Layer.Vector, {
    CLASS_NAME: 'OpenLayers.Editor.Layer.Snapping',

    /**
     * @var {Array.<OpenLayers.Feature.Vector>} Renderer intersections between guide lines
     */
    intersectionPoints: null,
    
    initialize: function(name, options) {
        this.intersectionPoints = [];
        
        if(options.styleMap===undefined){
            // Set default styles for guide lines
            options.styleMap = new OpenLayers.StyleMap({
                // Base styles to be merged with specific styles from rules
                'default': new OpenLayers.Style(
                    {
                        strokeColor: '#ff00ff',
                        strokeOpacity: 0.5,
                        strokeWidth: 1,
                        strokeDashstyle: 'solid',
                        fillColor: '#ff00ff'
                    }, {
                        rules: [
                            // Styles lines
                            new OpenLayers.Rule({
                                evaluate: function(feature){
                                    return feature.geometry instanceof OpenLayers.Geometry.LineString;
                                },
                                symbolizer: {
                                    strokeDashstyle: 'longdash'
                                }
                            }),
                            // Styles points
                            new OpenLayers.Rule({
                                evaluate: function(feature){
                                    return feature.geometry instanceof OpenLayers.Geometry.Point;
                                },
                                symbolizer: {
                                    graphicName: 'cross',
                                    pointRadius: 3,
                                    strokeWidth: 0
                                }
                            }),
                            // Styles everything else
                            new OpenLayers.Rule()
                        ]
                    }
                )
            });
        }
        OpenLayers.Layer.Vector.prototype.initialize.call(this, name, options);
    },

    /**
     * Adds geometries or vector features as guidelines
     * @param {Array.<(OpenLayers.Feature.Vector|OpenLayers.Geometry)>} features
     * @param {Object} options
     */
    addGuides: function(features, options){
        var vectorFeatures = [];
        for(var i=0; i<features.length; i++){
            if(features[i] instanceof OpenLayers.Feature.Vector){
                vectorFeatures[i] = features[i];
            } else {
                vectorFeatures[i] = new OpenLayers.Feature.Vector(features[i]);
            }
        }
        OpenLayers.Layer.Vector.prototype.addFeatures.call(this, vectorFeatures, options);
        return vectorFeatures;
    },

    /**
     * Calculates line running along segment.
     * @return {Object} In case the line's slope is infinite the property x is given to denote the line's location
     */
    getLine: function(segment){
        if(segment.x1===segment.x2){
            return {
                m: Infinity,
                x: segment.x1
            };
        }
        var m = (segment.y2-segment.y1)/(segment.x2-segment.x1);
        var b = segment.y2-(m*segment.x2);
        return {
            m: m,
            b: b
        }
    },

    /**
     * Adds a guide line to represent the given line.
     * @param {Object} line Line as returned by getLine
     * @return {OpenLayers.Feature.Vector} Guide line
     */
    addLine: function(line){
        var maxExtent = this.map.getMaxExtent();
        var guideLine;
        if(line.m===Infinity){
            guideLine = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString([
                    new OpenLayers.Geometry.Point(line.x, maxExtent.top),
                    new OpenLayers.Geometry.Point(line.x, maxExtent.bottom)
                ])
            );
        } else {
            guideLine = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.LineString([
                    this.createWorldBoundaryPoint(line.m, maxExtent.left, line.b, maxExtent),
                    this.createWorldBoundaryPoint(line.m, maxExtent.right, line.b, maxExtent)
                ])
            );
        }
        this.addFeatures([
            guideLine
        ]);
        this.rebuildIntersectionPoints();
        return guideLine;
    },

    /**
     * Create a point that lies on the world boundary and the guideline such that this point is closest to the given x coordinate
     * @param {Number} m Slope of the guideline
     * @param {Number} x Horizontal ordinate on the guideline to select closest world boundary by proximity
     * @param {Number} b Vertical offset of guideline from coordinate system's origin
     * @param {OpenLayers.Bounds} maxExtent World boundary
     * @return {OpenLayers.Geometry.Point}
     */
    createWorldBoundaryPoint: function(m, x, b, maxExtent){
        var xBoundary;
        var candidateY = m*x+b;
        if(candidateY>maxExtent.top){
            xBoundary = (maxExtent.top-b)/m;
        } else if(candidateY<maxExtent.bottom){
            xBoundary = (maxExtent.bottom-b)/m;
        } else {
            xBoundary = x;
        }
        return new OpenLayers.Geometry.Point(xBoundary, m*xBoundary+b);
    },

    /**
     * Discards previous snapping points and adds new snapping points at guide line intersections.
     */
    rebuildIntersectionPoints: function(){
        var maxExtent = this.map.getMaxExtent();
        
        this.removeFeatures(this.intersectionPoints);
        this.intersectionPoints = [];

        // Intersect each segment with all other segments
        this.features.forEach(function(feature){
            if(feature.geometry instanceof OpenLayers.Geometry.Curve){
                var segments = feature.geometry.getSortedSegments();
                segments.forEach(function(segment){
                    var line = this.getLine(segment);
                    this.features.forEach(function(featureOther){
                        if(featureOther.geometry instanceof OpenLayers.Geometry.Curve){
                            var segmentsOther = featureOther.geometry.getSortedSegments();
                            segmentsOther.forEach(function(segmentOther){
                                var lineOther = this.getLine(segmentOther);
                                if(line.m===lineOther.m){
                                    // Skip since parallel lines don't intersect
                                    return;
                                }

                                var x = (lineOther.b-line.b)/(line.m-lineOther.m);
                                var y = line.m*x+line.b;
                                // Only add intersections withing the defined coordinate area
                                if(x>=maxExtent.left && x<=maxExtent.right && y>=maxExtent.bottom && y<=maxExtent.top){
                                    this.intersectionPoints.push(
                                        new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(x, y))
                                    );
                                }
                            }, this);
                        }
                    }, this);
                }, this);
            }
        }, this);
        this.addFeatures(this.intersectionPoints);
    },

    removeFeatures: function(features, options) {
        OpenLayers.Layer.Vector.prototype.removeFeatures.apply(this, arguments);

        // Update intersections whenever an external caller removes features
        if(features!==this.intersectionPoints){
            this.rebuildIntersectionPoints();
        }
    }
});