## Documentation

### About

**OpenLayers Editor** (ole) provides a set of controls for extended editing of spatial data.

### Example

    editor = new OpenLayers.Editor(map, {
        activeControls: ['SnappingSettings', 'SplitFeature', 'MergeFeature', 'CleanFeature'],
        featureTypes: ['polygon', 'path', 'point', 'text']
    });
    editor.startEditMode();

See [`client/example`](https://github.com/geops/ole/tree/master/client/example) for some inspiration.

### Requirements

* [OpenLayers](http://openlayers.org/)

### Server-side processing

Some controls like merge, split and clean depend on server-side processing.
A Drupal module and a Zend Framework module is provided  (see [`server`](https://github.com/geops/ole/tree/master/server)). 
Also [SharpMap](http://sharpmap.codeplex.com/) supports server-side processing.
Set `editor.oleUrl` according to your server configuration.