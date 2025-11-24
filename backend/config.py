import os
from dotenv import load_dotenv

#carga las variables del archivo .env al sistema
load_dotenv()

class Settings:
    SECRET_KEY = os.getenv("SECRET_KEY")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

# Instanciamos la clase para usarla donde se necesite
settings = Settings()