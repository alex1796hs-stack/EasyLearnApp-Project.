from sqlalchemy import Column, Integer, String, Text
from app.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    level = Column(String, nullable=False)  # A1, B2, C1 etc.