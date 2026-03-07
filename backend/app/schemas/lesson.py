from pydantic import BaseModel


class LessonCreate(BaseModel):
    title: str
    content: str
    level: str


class LessonResponse(BaseModel):
    id: int
    title: str
    content: str
    level: str

    class Config:
        from_attributes = True