from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import create_db_and_tables

#Router
from routers import auth, users, sessions, gamification 

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    print("✅ Base de datos lista.")
    yield

app = FastAPI(lifespan=lifespan)

from fastapi.middleware.cors import CORSMiddleware


# habilita la comunicación entre el backend y el frontend
origins = [
    "http://localhost:4321",
    "http://127.0.0.1:4321",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# router se conecta a la app
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(sessions.router)
app.include_router(gamification.router)

@app.get("/")
def read_root():
    return {"mensaje": "API de Focus funcionando correctamente 🚀"}