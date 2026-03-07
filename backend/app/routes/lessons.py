from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.lesson import Lesson
from app.schemas.lesson import LessonCreate, LessonResponse
from app.models.progress import Progress
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/lessons", tags=["Lessons"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=LessonResponse)
def create_lesson(lesson: LessonCreate, db: Session = Depends(get_db)):
    new_lesson = Lesson(**lesson.dict())
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson


@router.get("/", response_model=list[LessonResponse])
def list_lessons(db: Session = Depends(get_db)):
    return db.query(Lesson).all()

@router.get("/next")
def get_next_lesson(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    completed_lessons = db.query(Progress.lesson_id).filter(
        Progress.user_id == current_user.id
    )

    next_lesson = db.query(Lesson).filter(
        ~Lesson.id.in_(completed_lessons)
    ).order_by(Lesson.id).first()

    if not next_lesson:
        raise HTTPException(
            status_code=404,
            detail="No more lessons available"
        )

    return next_lesson