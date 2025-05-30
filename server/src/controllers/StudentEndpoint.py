from flask import Response, make_response, request

from src.app import app
from src.services import StudentService
from src.dtos.StudentDto import StudentDto

@app.route("/student/{zid}", methods=["GET"])
def getByZid(self) -> Response:
    """Returns a student given the zID"""
    
    token: str = request.headers["Authorization"]
    zid: str = request.args["zid"]
    
    result: StudentDto = StudentService.getByZid(zid)
    
    return make_response(result.toJSON(), 200)
