from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from datetime import datetime, timedelta
from pydantic import BaseModel
from database import get_session
from models import User, Session as SessionModel 
from routers.auth import get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])

# datos que envia el frontend al completar una sesion
class SessionCompleted(BaseModel):
    duration_minutes: int
    label: str = "Estudio"

#ENDPOINT: COMPLETAR SESION
@router.post("/complete")
def complete_session(
    data: SessionCompleted, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Marca una sesión como completada y da puntos.
    Regla: 10 puntos por cada minuto estudiado (por ahora para el mvp).
    """
    #Calcular puntos
    points_earned = data.duration_minutes * 10
    
    #Guardar el registro de la sesión
    new_session = SessionModel(
        user_id=current_user.id,
        intended_minutes=data.duration_minutes,
        started_at=datetime.utcnow(), # Simplificado ya que se asume que empezó ahora
        ended_at=datetime.utcnow(),
        completed=True,
        abandon_reason=None
    )
    session.add(new_session)
    
    #LÓGICA DE RACHA
    today = datetime.utcnow().date()
    last_date = current_user.last_streak_date.date() if current_user.last_streak_date else None
    # Esta es una bandera para el Frontend
    first_session_of_day = False 

    if last_date != today:
        # en caso de que no haya hecho ya una sesion hoy
        first_session_of_day = True
        
        if last_date == today - timedelta(days=1):
            # En caso de que haya estudiado ayer se continua racha
            current_user.current_streak_days += 1
        elif last_date is None:
            # Nunca había estudiado entonces empieza racha
            current_user.current_streak_days = 1
        else:
            # Si se saltó días entonces reinicio 
            current_user.current_streak_days = 1
            
        # Se actualiza la fecha de última racha al dia en curso
        current_user.last_streak_date = datetime.utcnow()
        
        # Bonus, se da puntos extra por mantener racha
        points_earned += 50 
    
    # actualiza puntos del usuario
    current_user.current_points += points_earned
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {
        "message": "Sesión guardada",
        "points_earned": points_earned,
        "new_total_points": current_user.current_points,
        "streak": current_user.current_streak_days,
        "first_session_of_day": first_session_of_day
    }