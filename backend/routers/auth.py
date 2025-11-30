from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import Annotated



from database import get_session
from models import User
from security import get_password_hash, verify_password, create_access_token


from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt 
from config import settings #  lee SECRET_KEY
from models import User

# Declaracion del router
router = APIRouter(prefix="/auth", tags=["auth"])

# --- ESQUEMAS basicos ---
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    career: str

class Token(BaseModel):
    access_token: str
    token_type: str
    
# token viene en la cabecera Authorization: Bearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    """
    Valida el token y devuelve el usuario actual
    en casi de qye ek token fuese falso o expira entoncs lanza error
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # se decodifica el token usando la SECRET_KEY
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Buscar al usuario en la DB
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
        
    return user

# ENDPOINT: REGISTRO  
@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, session: Session = Depends(get_session)):
    # Verificar si existe
    statement = select(User).where(User.email == user_data.email)
    user = session.exec(statement).first()
    if user:
        raise HTTPException(status_code=400, detail="Email ya registrado")
    
    # Hashea y guarda
    career_capitalized = user_data.career.strip().capitalize() if user_data.career else "Mi carrera"
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        career=career_capitalized[:30] 
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return {"message": "Usuario creado", "user_id": new_user.id}

# ENDPOINT: LOGIN
@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session)
):
    """
    Recibe user email y password.
    Si son correctos devuelve el TOKEN JWT.
    """
    # Busca usuario por email 
    statement = select(User).where(User.email == form_data.username)
    user = session.exec(statement).first()

    # Verifica usuario y contraseña si existen de antes
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # crea el token de acceso
    access_token = create_access_token(data={"sub": user.email})
    
    # Entrega el token al usuario
    return {"access_token": access_token, "token_type": "bearer"}


#ENDPOINT: PERFIL DEL USUARIO
@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    """
    Devuelve los datos del usuario logueado.
    Requiere enviar el Token en el header.
    """
    return current_user