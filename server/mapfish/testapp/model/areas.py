# -*- coding: utf-8 -*-

from sqlalchemy import Column, types

from geoalchemy import GeometryColumn, Polygon, GeometryDDL

from mapfish.sqlalchemygeom import GeometryTableMixIn
from testapp.model.meta import Session, Base

class Area(Base, GeometryTableMixIn):
    __tablename__ = 'areas'
    # The following fragment needed to be commented out in order to
    # make table creation succeed from: paster setup-app development.ini
    # Additionally, this file needs to be imported in websetup.py
    #__table_args__ = {
    #    "autoload": True,
    #    "autoload_with": Session.bind
    #}

    # A primary key column is required by SQLAlchemy to create DDL
    # statements
    id = Column(types.Integer, primary_key=True)
    the_geom = GeometryColumn(Polygon(srid=4326))

# Triggers SQLAlchemy's DDL statement creation
GeometryDDL(Area.__table__)