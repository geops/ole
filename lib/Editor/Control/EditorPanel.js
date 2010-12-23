/**
 * @copyright  2010 geOps
 * @license    http://www.geops.de/license.txt
 * @version    $Id$
 * @link       http://www.geops.de
 */

/**
 * Class: OpenLayers.Editor.Control.EditorPanel
 * The EditorPanel is a panel of all controls from a given editor. 
 *     By default it appears in the upper right corner of the map.
 *
 * Inherits from:
 *  - <OpenLayers.Control.Panel>
 */
OpenLayers.Editor.Control.EditorPanel = OpenLayers.Class(OpenLayers.Control.Panel, {

    /**
     * Constructor: OpenLayers.Editor.Control.EditorPanel
     * Create an editing toolbar for a given editor.
     *
     * Parameters:
     * editor - {<OpenLayers.Editor>}
     * options - {Object}
     */
    initialize: function (editor, options) {

        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);

        var control = null, controls = [];

        for (var i=0, len=editor.activeControls.length; i<len; i++) {
            
            control = editor.activeControls[i];
            
            if (OpenLayers.Util.indexOf(editor.editorControls, control) > -1) {
                controls.push(new OpenLayers.Editor.Control[control](
                    editor.editLayer, editor.options[control]
                ));
            }


            switch (control) {

                case 'Separator':
                    controls.push(new OpenLayers.Control.Button({
                        displayClass: 'olControlSeparator'
                    }));
                    break;

                case 'Navigation':
                    controls.push(new OpenLayers.Control.Navigation(
                        OpenLayers.Util.extend(
                            {title: OpenLayers.i18n('oleNavigation')},
                            editor.options.Navigation)
                    ));
                    break;

                case 'DragFeature':
                    controls.push(new OpenLayers.Control.DragFeature(editor.editLayer,
                        OpenLayers.Util.extend(
                            {title: OpenLayers.i18n('oleDragFeature')},
                            editor.options.DragFeature)
                    ));
                    break;

                case 'ModifyFeature':
                    controls.push(new OpenLayers.Control.ModifyFeature(editor.editLayer,
                        OpenLayers.Util.extend(
                            {title: OpenLayers.i18n('oleModifyFeature')},
                            editor.options.ModifyFeature)
                    ));
                    break;

                case 'SelectFeature':
                    controls.push(new OpenLayers.Control.SelectFeature(
                        editor.sourceLayers.concat([editor.editLayer]),
                        OpenLayers.Util.extend(
                            {title: OpenLayers.i18n('oleSelectFeature'),
                                multiple: true, toggle: true},
                            editor.options.SelectFeature)
                    ));
                    break;

                default:
                    break;
            }
        }
        this.addControls(controls);
        editor.map.addControl(this);
    },

    CLASS_NAME: 'OpenLayers.Editor.Control.EditorPanel'
});