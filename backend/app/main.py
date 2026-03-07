from fastapi import FastAPI
from app.database import engine
from app.models.user import User
from app.routes.auth import router as auth_router
from app.models.lesson import Lesson
from app.models.progress import Progress
from app.routes.lessons import router as lessons_router
from app.database import Base
from app.routes.progress import router as progress_router


app = FastAPI(
    title="English AI Platform",
    version="0.1.0",
    description="AI-powered adaptive English learning platform"
)
app.include_router(auth_router)
app.include_router(lessons_router)
app.include_router(progress_router)

#Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "English AI Platform is running 🚀"}


@app.get("/health")
def health_check():
    return {"status": "ok"}