
## Documentation

### About

**OpenLayers Editor** (ole) provides a set of controls for extended editing of spatial data.

### Example

    editor = new OpenLayers.Editor(map, {
        activeControls: ['SnappingSettings', 'SplitFeature', 'MergeFeature', 'CleanFeature'],
        featureTypes: ['polygon', 'path', 'point']
    });
    editor.startEditMode();

See [`client/example`](https://github.com/geops/ole/tree/master/client/example) for some inspiration.

### Requirements

* [OpenLayers](http://openlayers.org/) 2.11
* some controls depend on server-side processing

### Server-side processing

Some controls like merge, split and clean depend on server-side processing based on PostGIS.
A Drupal module and a Zend Framework modul is provided  (see [`server`](https://github.com/geops/ole/tree/master/server)).
Set `editor.oleUrl` according to your server configuration.