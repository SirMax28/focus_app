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
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependencia para obtener conexión a la DB en cada peticion"""
    with Session(engine) as session:
        yield session