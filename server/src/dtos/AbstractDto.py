from json import dumps

class AbstractDto:
    def toJSON(self):
        return dumps(
            self,
            default=lambda o: o.__dict__, 
            sort_keys=True,
            indent=4
        )
