"""Handler to interact with the database"""

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
# from sqlalchemy import Sequence
# from sqlalchemy.sql import text

class Base(DeclarativeBase):
    pass

db: SQLAlchemy = SQLAlchemy(model_class=Base)
Model = db.Model

def db_insert(value: Model):
    """Insert a new value into a database collection"""
    db.session.add(value)
    db_save()

def db_delete(value: Model):
    """Remove a value from its database collection"""
    db.session.delete(value)
    db_save()

def db_save():
    """Save a value in the db"""
    db.session.commit()

def db_default_init():
    """Default initialises the database"""
    db.create_all()
    db.session.commit()
