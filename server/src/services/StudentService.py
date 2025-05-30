from src.models.Student import Student
from src.dtos.StudentDto import StudentDto
from src.converters import StudentConverter

def getByZid(zid: str) -> StudentDto:
    student: Student | None = Student.query.get(zid)
    if student is None:
        raise KeyError
    return StudentConverter.convertToDto(student)
