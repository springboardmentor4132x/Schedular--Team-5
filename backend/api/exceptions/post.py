from fastapi import HTTPException

class PostNotFoundException(HTTPException):
    def __init__(self, post_id: int):
        super().__init__(status_code=404, detail=f"Post {post_id} not found")