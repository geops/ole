/**
 * @copyright  2011 geOps
 * @license    https://github.com/geops/ole/blob/master/license.txt
 * @link       https://github.com/geops/ole
 */

/**
 * Class: OpenLayers.Editor.Control.DrawRegular
 *
 * Inherits from:
 *  - <OpenLayers.Control.DrawFeature>
 */
OpenLayers.Editor.Control.DrawRegular = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    /**
     * Property: minArea
     * {Number} Minimum area of new polygons.
     */
    minArea: 0,

    title: OpenLayers.i18n('oleDrawRegular'),

    /**
     * @var {Array} List of sides available to the regular drawing option. Values above 20 will be handled as circle.
     */
    sides: [3,4,5,6,40],

    /**
     * Constructor: OpenLayers.Editor.Control.DrawRegular
     * Create a new control for drawing polygons.
     *
     * Parameters:
     * layer - {<OpenLayers.Layer.Vector>} Regular polygons will be added to this layer.
     * options - {Object} An optional object whose properties will be used
     *     to extend the control.
     */
    initialize: function (layer, options) {
        this.callbacks = OpenLayers.Util.extend(this.callbacks, {
            point: function(point) {
                this.layer.events.triggerEvent('pointadded', {point: point});
            }
        });

        OpenLayers.Control.DrawFeature.prototype.initialize.apply(this,
            [layer, OpenLayers.Handler.RegularPolygon, options]);

        this.title = OpenLayers.i18n('oleDrawRegular');
    },

    activate: function() {
        var activated = OpenLayers.Control.Button.prototype.activate.call(this), content, row;

        content = document.createElement('div');
        row = document.createElement('div');
        OpenLayers.Element.addClass(row, 'oleDrawRegularIrregular');

        // Create and add the checkbox for 'irregular' option (different side lengths)
        var irregularCB = document.createElement('input');
        irregularCB.type = 'checkbox';
        irregularCB.id = 'oleCADToolsDialogIrregular';
        irregularCB.checked = true;
        // The following is required due to a bug in IE (below version 8) to tick the checkbox prior inserting it into the DOM
        irregularCB.defaultChecked = true;
        OpenLayers.Event.observe(irregularCB, 'change', OpenLayers.Function.bind(function(event) {
            this.handler.setOptions({irregular: irregularCB.checked});
        }, this));
        this.handler.setOptions({irregular: irregularCB.checked});
        row.appendChild(irregularCB);

        // Create and add the label for 'irregular' checkbox
        var irregularLabel = document.createElement('label');
        irregularLabel.htmlFor = 'oleCADToolsDialogIrregular';
        irregularLabel.appendChild(document.createTextNode(OpenLayers.i18n('oleDrawRegularIrregular')));
        row.appendChild(irregularLabel);
        content.appendChild(row);

        row = document.createElement('div');

        // Create and add the selector for number of sides (shape kind),
        var sidesSelect = document.createElement('select');
        sidesSelect.id = 'oleCADToolsDialogSides';
        for(var i = 0; i < this.sides.length; ++i) {
            // 20 or more sides implies a circle
            if (this.sides[i] < 20) {
                var optionText = OpenLayers.i18n('oleDrawRegularSides'+this.sides[i]);
            } else {
                var optionText = OpenLayers.i18n('oleDrawRegularCircle');
            }
            sidesSelect.options.add(new Option(optionText, this.sides[i]));
        }

        // Set up a listener for the sides selector
        OpenLayers.Event.observe(sidesSelect, 'change', OpenLayers.Function.bind(function (event) {
            // this.handler.setOptions({sides: parseInt(event.target.value)});
            //this.handler.setOptions({sides: parseInt(document.getElementById('oleCADToolsDialogSides').value)});
            //this.handler.setOptions({irregular: document.getElementById('oleCADToolsDialogIrregular').checked});

            // Set sides from selected option value  (event.target.value does not work in IE8!)
            var option = sidesSelect.options[sidesSelect.selectedIndex];
            this.handler.setOptions({sides: parseInt(option.value)});

        }, this));

        // Set default shape
        this.handler.setOptions({sides: parseInt(sidesSelect.options[0].value)});
        row.appendChild(sidesSelect);

        // Create and add the label for the sides selector
        var sidesLabel = document.createElement('label');
        sidesLabel.htmlFor = 'oleCADToolsDialogSides';
        sidesLabel.appendChild(document.createTextNode(OpenLayers.i18n('oleDrawRegularShape')));
        row.appendChild(sidesLabel);
        content.appendChild(row);

        this.map.editor.dialog.show({
            content: content,
            toolbox: true
        });

        return activated;
    },

    deactivate: function() {
        var deactivated = OpenLayers.Control.Button.prototype.deactivate.call(this);

        if (deactivated && typeof this.map.editor.dialog.hide == 'function') {
            this.map.editor.dialog.hide();
        }

        return deactivated;
    },

    /**
     * Method: draw polygon only if area greater than or equal to minArea
     */
    drawFeature: function (geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry),
            proceed = this.layer.events.triggerEvent('sketchcomplete', {feature: feature});
        if (proceed !== false && geometry.getArea() >= this.minArea) {
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent('featureadded', {feature : feature});
        }
    },

    CLASS_NAME: 'OpenLayers.Editor.Control.DrawRegular'
});
