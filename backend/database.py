import os
from sqlmodel import SQLModel, create_engine, Session

# Nombre del archivo para los datos SQLite
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

# El motor que conecta Python con el archivo
engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    """Crea las tablas si no existen"""
    # Se importa aquí para que SQLModel registre los modelos antes de crear la DB
    import models
    
    # Si existe la variable RESET_DB=true, eliminar la base de datos
    if os.getenv("RESET_DB", "").lower() == "true":
        if os.path.exists(sqlite_file_name):
            os.remove(sqlite_file_name)
            print("🗑️ Base de datos eliminada por RESET_DB=true")
    
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependencia para obtener conexión a la DB en cada peticion"""
    with Session(engine) as session:
        yield session