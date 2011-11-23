from testapp.lib.base import BaseController
import testapp.model as model
    
def split(geo, cut):
    """
    Splits the geometry along the cut line
    """
    # Choose query depended on the type of object that shall be split
    splitQuery = None
    if 'POLYGON' in geo:
        # For areas
        splitQuery = """
            SELECT ST_AsGeoJSON(ST_Polygonize(ST_Union(ST_Boundary(geo.geo), %(cut)s::geometry))) AS geo
            FROM (
                SELECT ST_Multi(ST_Collect(multi.geo)) AS geo
                FROM (
                    SELECT (ST_Dump(%(geo)s::geometry)).geom as geo
                ) as multi
            ) AS geo"""
    else:
        # For lines
        splitQuery = "SELECT ST_AsGeoJSON(ST_Force_Collection(ST_Difference(%(geo)s::geometry, %(cut)s::geometry))) AS geo"
    
    return _execute(splitQuery, {
        'cut': cut,
        'geo': geo
    })

def merge(geo):
    """
    Merges the geometries
    """
    mergeQuery = None
    if 'POLYGON' in geo:
        # areas
        mergeQuery  = "SELECT ST_AsGeoJSON(ST_Union(geo)) AS geo FROM (SELECT (ST_Dump(%(geo)s::geometry)).geom as geo) AS geo"
    else:
        # lines
        mergeQuery = "SELECT ST_AsGeoJSON(ST_Force_Collection(ST_LineMerge(ST_Collect(geo)))) AS geo FROM (SELECT (ST_Dump(%(geo)s::geometry)).geom as geo) AS geo"
    
    return _execute(mergeQuery, {
        'geo': geo
    })
    
def clean(geo):
    """
    Calculates a canonical representation of the geometry
    """
    query = """
        SELECT ST_AsGeoJSON(ST_BuildArea(ST_Union(ST_Boundary(geo),ST_Startpoint(ST_Boundary(geo))))) AS geo
        FROM (
            SELECT ST_Multi(ST_Collect(multi.geo)) AS geo
            FROM (
                SELECT (ST_Dump(%(geo)s::geometry)).geom as geo
            ) as multi
        ) AS geo"""
    return _execute(query, {
        'geo': geo
    })

def _execute(query, parameters):
    """
    Executes a query and returns resulting geometry
    """
    session = model.Session.connection()
    result = session.execute(query, parameters).first()
    return result['geo']