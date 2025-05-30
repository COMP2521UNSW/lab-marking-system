from src.dtos.AbstractDto import AbstractDto

class StudentDto(AbstractDto):
    __zid: str
    __name: str
    __email: str
    __lab_class: str
    
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
