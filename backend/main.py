from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import create_db_and_tables

#Router
from routers import auth 

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    print("✅ Base de datos lista.")
    yield

app = FastAPI(lifespan=lifespan)

# router se conecta a la app
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"mensaje": "API de Focus funcionando correctamente 🚀"}