$(function() {

    $('#page').show();

    var map,
        editor,
        tabs = ['#map', '#features', '#documentation', '#video'];

    map = new OpenLayers.Map('map', {
        theme: null,
        maxExtent: new OpenLayers.Bounds(-500,-500, 500, 500)
    });
    map.addLayer(new OpenLayers.Layer.OSM());
    map.setCenter(new OpenLayers.LonLat(872949, 6106592), 12);

    editor = new OpenLayers.Editor(map, {
        activeControls: ['Navigation', 'SnappingSettings', 'CADTools', 'Separator', 'SplitFeature', 'MergeFeature', 'CleanFeature', 'DeleteFeature', 'SelectFeature', 'Separator', 'DragFeature', 'DrawHole', 'ModifyFeature', 'Separator'],
        featureTypes: ['polygon', 'path', 'point'],
        showStatus: function(type, message) {
            alert(message);
        }
    });
    editor.startEditMode();
    $('#map').data('editor', editor);

    function update_page() {
        $(tabs.join(', ')).hide();
        if ($.inArray(window.location.hash, tabs) > -1) {
            $(window.location.hash).show();
            $('#navigation a').removeClass('active');
            $('#navigation a[href='+window.location.hash+']').addClass('active');
        } else {
            $('#map').show();
            $('#navigation a[href=#map]').addClass('active');
        }
    }

    update_page();

    $(window).bind('hashchange', function(event) {
        update_page();
    });

    $('#navigation a').click(function(event) {
        $(tabs.join(', ')).hide();
        $(event.target.hash).show();
        $('#navigation a').removeClass('active');
        $(event.target).addClass('active');
    });

    function supportsLocalStorage() {
        try {
            return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
            return false;
        }
    }

    if (supportsLocalStorage()) {

        var geoJSON = new OpenLayers.Format.GeoJSON();

        map.events.register('moveend', this, function(object, element) {
            localStorage['ole.map.zoom'] = map.zoom;
            localStorage['ole.map.center.lat'] = map.center.lat;
            localStorage['ole.map.center.lon'] = map.center.lon;
        });

        editor.editLayer.events.register('featureadded', this, function(object, element) {
            localStorage['ole.map.features'] = geoJSON.write(editor.editLayer.features);
        });
        editor.editLayer.events.register('featureremoved', this, function(object, element) {
            localStorage['ole.map.features'] = geoJSON.write(editor.editLayer.features);
        });
        editor.editLayer.events.register('afterfeaturemodified', this, function(object, element) {
            localStorage['ole.map.features'] = geoJSON.write(editor.editLayer.features);
        });

        if (parseInt(localStorage['ole.map.zoom']) >= 0) {
            map.setCenter(
                new OpenLayers.LonLat(
                    parseFloat(localStorage['ole.map.center.lon']),
                    parseFloat(localStorage['ole.map.center.lat'])
                ),
                parseInt(localStorage['ole.map.zoom'])
            );
            editor.editLayer.addFeatures(geoJSON.read(localStorage['ole.map.features']));
        }
    }
});