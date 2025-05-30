from src.models.Student import Student
from src.dtos.StudentDto import StudentDto

def convertToDto(student: Student) -> StudentDto:
    if student is None:
        return None

    studentDto: StudentDto = StudentDto()

    studentDto.set_zid(student.get_name())
    studentDto.set_name(student.get_name())
    studentDto.set_email(student.get_email())
    studentDto.set_lab_class(student.get_lab_class())

    return studentDto
