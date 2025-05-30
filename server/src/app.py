"""Definition for the application"""

from os import environ
from json import dumps

from flask import Flask, Response
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from src.database import db, db_default_init

def default_handler(err: HTTPException) -> Response:
    """Default handler for error messages"""

    response: Response = err.get_response() # type: ignore
    response.data = dumps(
        {
            "code": err.code,
            "message": err.description,
        }
    )
    response.content_type = "application/json"

    return response

app: Flask = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["TRAP_HTTP_EXCEPTIONS"] = True
app.register_error_handler(Exception, default_handler)
db.init_app(app)

with app.app_context():
    db_default_init()

if __name__ == "__main__":
    app.run("127.0.0.1", 5050, debug=True)
