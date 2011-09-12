<?php
// $Id: openlayers_cck_vector_layer.inc,v 1.1.2.3 2010/05/18 19:25:57 tmcw Exp $

/**
 * @file
 * Implementation of OpenLayers behavior.
 */

/**
 * Vector Layer Behavior
 */
class openlayers_behavior_ole extends openlayers_behavior {
  /**
   * Provide initial values for options.
   */
  function options_init() {
    return array();
  }

  function options_form($defaults) {
    return array(
      'processing_controls' => array(
        '#title' => t('Processing Controls'),
        '#type' => 'checkboxes',
        '#options' => array(
          'MergeFeature' => t('Merge features (requires PostGIS)'),
          'SplitFeature' => t('Split features (requires PostGIS)'),
          'CleanFeature' => t('Clean features (requires PostGIS)'),
          'DeleteFeature' => t('Delete features'),
          'ImportFeature' => t('Import features'),
        ),
        '#description' => t('Select what controls are available for processing.'),
        '#default_value' => isset($defaults['processing_controls']) ? $defaults['processing_controls'] : array(),
      ),
      'editing_controls' => array(
        '#title' => t('Editing Controls'),
        '#type' => 'checkboxes',
        '#options' => array(
          'DragFeature' => t('Drag features'),
          'DrawHole' => t('Draw hole'),
          'ModifyFeature' => t('Modify features'),
        ),
        '#description' => t('Select what controls are available for editing.'),
        '#default_value' => isset($defaults['editing_controls']) ? $defaults['editing_controls'] : array(),
      ),
      'other_controls' => array(
        '#title' => t('Other Controls'),
        '#type' => 'checkboxes',
        '#options' => array(
          'Navigation' => t('Navigation'),
          'UndoRedo' => t('Undo / redo'),
          'LayerSettings' => t('Layer settings'),
        ),
        '#description' => t('Select what other controls are available.'),
        '#default_value' => isset($defaults['other_controls']) ? $defaults['other_controls'] : array(),
      ),
      'feature_types' => array(
        '#title' => t('Available Features'),
        '#type' => 'checkboxes',
        '#options' => array(
          'point' => t('Point'),
          'path' => t('Path'),
          'polygon' => t('Polygon'),
        ),
        '#description' => t('Select what features are available to draw.'),
        '#default_value' => isset($defaults['feature_types']) ? $defaults['feature_types'] : array(),
      ),
      'feature_limit' => array(
        '#title' => t('Number of features'),
        '#type' => 'textfield',
        '#description' => t('The number of features that are allowed to be
          drawn. Leave blank or at 0 for unlimited.'),
        '#default_value' => isset($defaults['feature_limit']) ?
          $defaults['feature_limit'] : 0,
      ),
      'element_id' => array(
        '#type' => 'textfield',
        '#default_value' => (isset($defaults['element_id'])) ?
          $defaults['element_id'] : '',
        '#title' => t('Element ID'),
        '#description' => t('The DOM element ID that will be passed the value of the features.  This will probably be a textfield or textarea.'),
      )
    );
  }

  function js_dependency() {
    return array();
  }

  /**
   * Render.
   */
  function render(&$map) {

    global $language;

    drupal_add_js('if (!OpenLayers.Lang.'.$language->language.') OpenLayers.Lang.'.$language->language.' = {};
        OpenLayers.Lang.setCode("'.$language->language.'");', 'inline');

    drupal_add_js(drupal_get_path('module', 'ole') .'/includes/behaviors/js/openlayers_behavior_ole.js');

    $path = check_plain(variable_get('openlayers_editor_source', ''));
    // Check for full URL and include it manually if external.
    if (valid_url($path, TRUE)) {
      drupal_add_js($path, 'external');
    }
    else {
      drupal_add_js($path);
    }
    
    $cssPath = check_plain(variable_get('openlayers_editor_css', ''));

    drupal_add_css($cssPath, 'file');

    return $this->options;
  }
}
