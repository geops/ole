# -*- coding: utf-8 -*-

from pylons import request, response, session, tmpl_context as c
from pylons.controllers.util import abort, redirect

from testapp.lib.base import BaseController
from testapp.model.areas import Area
from testapp.model.meta import Session

from mapfish.protocol import Protocol, create_default_filter
from mapfish.decorators import geojsonify

class AreasController(BaseController):
    readonly = False # if set to True, only GET is supported

    def __init__(self):
        self.protocol = Protocol(Session, Area, self.readonly)

    @geojsonify
    def index(self, format='json'):
        """GET /: return all features."""
        # If no filter argument is passed to the protocol index method
        # then the default MapFish filter is used.
        #
        # If you need your own filter with application-specific params 
        # taken into acount, create your own filter and pass it to the
        # protocol read method.
        #
        # E.g.
        #
        # from sqlalchemy.sql import and_
        #
        # default_filter = create_default_filter(request, Area)
        # filter = and_(default_filter, Area.columname.ilike('%value%'))
        # return self.protocol.read(request, filter=filter)
        if format != 'json':
            abort(404)
        return self.protocol.read(request)

    @geojsonify
    def show(self, id, format='json'):
        """GET /id: Show a specific feature."""
        if format != 'json':
            abort(404)
        return self.protocol.read(request, response, id=id)

    @geojsonify
    def create(self):
        """POST /: Create a new feature."""
        return self.protocol.create(request, response)

    @geojsonify
    def update(self, id):
        """PUT /id: Update an existing feature."""
        return self.protocol.update(request, response, id)

    def delete(self, id):
        """DELETE /id: Delete an existing feature."""
        return self.protocol.delete(request, response, id)

    def count(self):
        """GET /count: Count all features."""
        return self.protocol.count(request)
