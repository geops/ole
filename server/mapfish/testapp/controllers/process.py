from testapp.lib.base import BaseController
from pylons import request, response

from testapp.lib.editor.actions import split, merge, clean

from mapfish.decorators import geojsonify

class ProcessController(BaseController):
    def __init__(self):
        response.headers['Content-Type'] = 'application/json';
        response.charset = 'utf8'
    
    @geojsonify
    def split(self):
        cut = request.params.getone('cut')
        geo = request.params.getone('geo');
        
        return {
            'error': False,
            'geo': split(geo, cut),
            'message': 'split successful'
        }
    
    @geojsonify
    def merge(self):
        geo = request.params.getone('geo');
        
        return {
            'error': False,
            'geo': merge(geo),
            'message': 'merge successful'
        }
    
    @geojsonify
    def clean(self):
        geo = request.params.getone('geo');
        
        return {
            'error': False,
            'geo': clean(geo),
            'message': 'clean successful'
        }