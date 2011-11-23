# -*- coding: utf-8 -*-

from sqlalchemy import Column, types

from geoalchemy import GeometryColumn, Point, GeometryDDL

from mapfish.sqlalchemygeom import GeometryTableMixIn
from testapp.model.meta import Session, Base

class Point(Base, GeometryTableMixIn):
    __tablename__ = 'points'
    id = Column(types.Integer, primary_key=True)
    the_geom = GeometryColumn(Point(srid=4326))

# Triggers SQLAlchemy's DDL statement creation
GeometryDDL(Point.__table__)