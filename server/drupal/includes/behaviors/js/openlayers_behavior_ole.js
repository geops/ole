// $Id

/**
 * @file
 * Main JS file for geofield
 *
 * @ingroup geofield
 */

(function($) {
/**
 * This behaviour moves the map into a new column on the right side.
 * In addition it zooms to the layer "openlayers_drawfeatures_layer".
 */
Drupal.behaviors.openlayers_behavior_ole = {
  'attach': function(context, settings) {

    function openlayers_behavior_ole_control_group(controls, seperator) {
      var arr = [];
      for (var i in controls) {
        if (controls[i]) {
          arr.push(i);
        }
      }
      if (arr.length > 0) {
        arr.push('Separator');
      }
      return arr;
    }

    function openlayers_behavior_ole_update(features) {

      // needs testing
//      while (features.type == 'featureadded' && feature_limit &&
//        (feature_limit < features.object.features.length)) {
//        features.feature.layer.removeFeatures(features.object.features.shift());
//      }

      var features_copy = features.object.clone();
      for (var i in features_copy.features) {
        features_copy.features[i].geometry.transform(
          features.object.map.projection,
          sourceProjection
        );
      }
      element.val(wktFormat.write(features_copy.features));
    }

    var data = $(context).data('openlayers'),
        wktFormat = new OpenLayers.Format.WKT(),
        element, sourceProjection, processing_controls, editing_controls, other_controls;

    if (data) {

      element = $('#' + data.map.behaviors['openlayers_behavior_ole'].element_id);
      sourceProjection = new OpenLayers.Projection('EPSG:'+data.map.behaviors['openlayers_behavior_ole'].srid);

      data.map.behaviors['openlayers_behavior_ole'].processing_controls.SelectFeature = 'SelectFeature';
      processing_controls = openlayers_behavior_ole_control_group(
          data.map.behaviors['openlayers_behavior_ole'].processing_controls);
      editing_controls = openlayers_behavior_ole_control_group(
          data.map.behaviors['openlayers_behavior_ole'].editing_controls);

      other_controls = openlayers_behavior_ole_control_group(
          data.map.behaviors['openlayers_behavior_ole'].other_controls);

      var editor = new OpenLayers.Editor(data.openlayers, {
        showStatus: function(message) {alert(message);},
        activeControls: other_controls.concat(processing_controls).concat(editing_controls),
        featureTypes: data.map.behaviors['openlayers_behavior_ole'].feature_types,
        featureLimit: data.map.behaviors['openlayers_behavior_ole'].feature_limit,
        oleUrl: '/ole/'
      });

      editor.editLayer.events.register('featureadded', this, openlayers_behavior_ole_update);
      editor.editLayer.events.register('afterfeaturemodified', this, openlayers_behavior_ole_update);
      editor.editLayer.events.register('featureremoved', this, openlayers_behavior_ole_update);
      
      var features = wktFormat.read(element.text());
      if (features) {
        if (features.constructor == Array) {
          for (var i in features) {
            features[i].geometry = features[i].geometry.transform(
              sourceProjection,
              data.openlayers.projection
            );
          }
        }
        else {
          features.geometry = features.geometry.transform(
            sourceProjection,
            data.openlayers.projection
          );
          features = [features];
        }
        editor.loadFeatures(features);
      }
      editor.startEditMode();

    }
  }
};
})(jQuery);
