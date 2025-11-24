from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship


# MODELOS BASE y Entidades Principales

class User(SQLModel, table=True):
    """
    Representa al estudiante
    Equivalente a la tabla 'users'
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    full_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Gamificación simplificada para validar el MVP
    current_points: int = Field(default=0)
    current_streak_days: int = Field(default=0)

    # Relaciones para poder navegar de usuario a sus datos facil
    profile: Optional["Profile"] = Relationship(back_populates="user")
    sessions: List["Session"] = Relationship(back_populates="user")
    goals: List["Goal"] = Relationship(back_populates="user")


class Profile(SQLModel, table=True):
    """
    Perfil motivacional del usuario (Arquetipo A, B, o C).
    Equivalente a la tabla 'profiles'.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    #el resultado del test: Competitivo, Evitador, Social
    archetype: str 
    
    #datos extra del onboarding
    bio: Optional[str] = None
    
    user: Optional[User] = Relationship(back_populates="profile")


class Goal(SQLModel, table=True):
    """
    Las metas que el usuario define
    Equivalente a la tabla 'goals' pero hardcodeada para validar el MVP
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    title: str 
    description: Optional[str] = None
    target_minutes_week: int = Field(default=120) # Meta de tiempo por semana
    
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: Optional[User] = Relationship(back_populates="goals")


class Session(SQLModel, table=True):
    """
    El corazón del Pomodoro que es sesion de estudio
    Equivalente a la tabla 'sessions' pero hardcodeada para validar el MVP
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    # Planificación
    intended_minutes: int # Cuánto tiempo planeaba estudiar 15, 25 o 50 min
    
    # Ejecución 
    started_at: datetime = Field(default_factory=datetime.utcnow)
    ended_at: Optional[datetime] = None
    
    # Estado final
    completed: bool = Field(default=False) # ¿Termina o abandona?
    abandon_reason: Optional[str] = None   # Si abandona, ¿por qué?
    
    user: Optional[User] = Relationship(back_populates="sessions")

