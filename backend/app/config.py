import os
from datetime import timedelta

SECRET_KEY = os.environ.get("SECRET_KEY", "supersecretkey123")  # En producción debe ser un secreto real
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60