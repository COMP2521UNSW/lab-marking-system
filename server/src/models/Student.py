from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String

from src.database import Model

class Student(Model):
    """Representation of a Student in the system"""
    
    __tablename__ = "student"
    
    __zid: Mapped[str] = mapped_column(String(8), primary_key=True, autoincrement=False)
    __name: Mapped[str] = mapped_column(String(80), nullable=False)
    __email: Mapped[str] = mapped_column(String(120), nullable=False)
    __lab_class: Mapped[str] = mapped_column(String(20), nullable=False)
    
    def get_zid(self) -> str:
        return self.__zid
    
    def set_zid(self, zid: str):
        self.__zid = zid
        return
    
    def get_name(self) -> str:
        return self.__name
    
    def set_name(self, name: str):
        self.__name = name
        return
    
    def get_email(self) -> str:
        return self.__email
    
    def set_email(self, email: str):
        self.__email = email
        return
    
    def get_lab_class(self) -> str:
        return self.__lab_class
    
    def set_lab_class(self, lab_class: str):
        self.__lab_class = lab_class
        return
