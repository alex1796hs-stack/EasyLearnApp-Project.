import os
from datetime import timedelta

SECRET_KEY = "supersecretkey123"  # luego lo moveremos a .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60