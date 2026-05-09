from fastapi import FastAPI
import time
from sqlalchemy.exc import OperationalError
from app.database import engine, Base
from app.routes.auth import router as auth_router
from app.routes.lessons import router as lessons_router
from app.routes.progress import router as progress_router
from app.routes.dashboard import router as dashboard_router
from app.routes.placement import router as placement_router
from app.routes.answers import router as answers_router
from app.routes.profile import router as profile_router
from app.routes.review import router as review_router
from app.models.user import User
from app.models.lesson import Lesson
from app.models.progress import Progress
from app.models.question_bank import QuestionBank
from app.models.user_answer import UserAnswer
from app.models.lesson_content import LessonContent

from dotenv import load_dotenv
load_dotenv()


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="English AI Platform",
    version="0.1.0",
    description="AI-powered adaptive English learning platform"
)

import os

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(lessons_router)
app.include_router(progress_router)
app.include_router(dashboard_router)
app.include_router(placement_router)
app.include_router(answers_router)
app.include_router(profile_router)
app.include_router(review_router)

# Intentar crear las tablas (con reintentos por si la DB no está lista)
max_retries = 5
for i in range(max_retries):
    try:
        Base.metadata.create_all(bind=engine)
        print("DEBUG: Tablas creadas/verificadas con éxito.")
        break
    except OperationalError:
        if i < max_retries - 1:
            print(f"DEBUG: La DB no está lista. Reintentando en 2 segundos... ({i+1}/{max_retries})")
            time.sleep(2)
        else:
            print("ERROR: No se pudo conectar a la DB después de varios intentos.")
            raise

@app.get("/")
def root():
    return {"message": "English AI Platform is running 🚀"}


@app.get("/health")
def health_check():
    return {"status": "ok"}