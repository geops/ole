# -*- coding: utf-8 -*-

from sqlalchemy import Column, types

from geoalchemy import GeometryColumn, LineString, GeometryDDL

from mapfish.sqlalchemygeom import GeometryTableMixIn
from testapp.model.meta import Session, Base

class Line(Base, GeometryTableMixIn):
    __tablename__ = 'lines'
    id = Column(types.Integer, primary_key=True)
    the_geom = GeometryColumn(LineString(srid=4326))

# Triggers SQLAlchemy's DDL statement creation
GeometryDDL(Line.__table__)