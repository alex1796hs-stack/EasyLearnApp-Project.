from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.progress import Progress
from app.models.lesson import Lesson
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter(prefix="/progress", tags=["Progress"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/{lesson_id}")
def complete_lesson(
    lesson_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    existing_progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.lesson_id == lesson_id
    ).first()

    if existing_progress:
        return {"message": "Lesson already marked as completed"}

    progress = Progress(
        user_id=current_user.id,
        lesson_id=lesson_id,
        completed=True
    )

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return {"message": "Lesson marked as completed"}

@router.get("/me")
def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    progress = db.query(Progress).filter(
        Progress.user_id == current_user.id
    ).all()

    return progress