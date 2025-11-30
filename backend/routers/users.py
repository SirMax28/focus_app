from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from database import get_session
from models import User, Profile
from routers.auth import get_current_user 
from datetime import datetime, timedelta

router = APIRouter(prefix="/users", tags=["users"])

# Esquemas Pydantic
class OnboardingData(BaseModel):
    score: int
    archetype: str # "A", "B", o "C"
    preferred_minutes: int
    
# Esquema para actualizar plan
class PlanUpdate(BaseModel):
    new_archetype: str  # A, B, C
    new_minutes: int    # 15, 25, 40

#ENDPOINT: GUARDAR DIAGNÓSTICO
@router.post("/onboarding")
def save_onboarding(
    data: OnboardingData, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Guarda o actualiza el perfil motivacional del usuario tras completar el quiz de onboarding
    """
    #verifica si ya existe un perfil para este usuario
    statement = select(Profile).where(Profile.user_id == current_user.id)
    existing_profile = session.exec(statement).first()
    
    #Si existe se actualiza con el fin de evitar errores
    if existing_profile:
        existing_profile.archetype = data.archetype
        session.add(existing_profile)
        session.commit()
        session.refresh(existing_profile)
        return {"message": "Perfil actualizado correctamente", "archetype": data.archetype}

    #Si no existe entonces se crea uno nuevo
    new_profile = Profile(
        user_id=current_user.id,
        archetype=data.archetype,
    )
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)
    
    return {"message": "Perfil creado exitosamente", "archetype": data.archetype}

#ENDPOINT: CONSULTAR MI PERFIL
@router.get("/my-profile")
def get_my_profile(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    El Frontend usa esto para saber si debe mandar al usuario al dashboard o al quiz.
    Si devuelve 404 -> Usuario Nuevo -> Ir al Quiz.
    Si devuelve 200 -> Usuario Viejo -> Ir al Dashboard.
    """
    statement = select(Profile).where(Profile.user_id == current_user.id)
    profile = session.exec(statement).first()
    
    if not profile:
        #lanza un error 404 a propósito. 
        #el frontend captura este error y sabra que debe redirigir al quiz
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
        
    return profile

#ENDPOINT: REVISION SEMANAL, REVISAR SI TOCA
@router.get("/check-weekly-review")
def check_weekly_review(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Este enpoint devuelve true si ha pasado más de una semana desde la última revisión
    o si nunca se ha hecho.
    """
    # Si nunca ha hecho revisión, hay que hacerla
    if not current_user.last_weekly_review:
        # damos un margen de 3 dias desde la creación de la cuenta
        days_since_creation = (datetime.utcnow() - current_user.created_at).days
        if days_since_creation < 3:
            return {"due": False}
        return {"due": True}

    # Si ya la hizo se comprueba si ha pasado una semana
    days_since_review = (datetime.utcnow() - current_user.last_weekly_review).days
    
    # Si han pasado 7 días o más es necesario hacer una revisión
    if days_since_review >= 7:
        return {"due": True}
        
    return {"due": False}

#ENDPOINT: GUARDAR RESULTADO DE REVISIÓN
@router.post("/update-plan")
def update_plan(
    update_data: PlanUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    #Actualiza el perfil
    statement = select(Profile).where(Profile.user_id == current_user.id)
    profile = session.exec(statement).first()
    
    if profile:
        profile.archetype = update_data.new_archetype

        session.add(profile)
    
    #Marcar que el estudiante ha hecho la revisión semanal
    current_user.last_weekly_review = datetime.utcnow()
    session.add(current_user)
    
    session.commit()
    return {"message": "Plan actualizado correctamente"}