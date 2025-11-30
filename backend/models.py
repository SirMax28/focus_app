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
    
    #Racha
    last_streak_date: Optional[datetime] = Field(default=None) 

    # Relaciones para poder navegar de usuario a sus datos facil
    profile: Optional["Profile"] = Relationship(back_populates="user")
    sessions: List["Session"] = Relationship(back_populates="user")
    goals: List["Goal"] = Relationship(back_populates="user")
    
    #Fecha de autoevaluación
    last_weekly_review: Optional[datetime] = Field(default=None)
    
    # Inventario
    inventory: List["UserItem"] = Relationship(back_populates="user")



class Profile(SQLModel, table=True):
    """
    Perfil motivacional del usuario (Arquetipo A, B, C)
    Equivalente a la tabla 'profiles'.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    #el resultado del quiz de onboarding
    archetype: str 
    
    #datos extra del onboarding
    bio: Optional[str] = None
    
    user: Optional[User] = Relationship(back_populates="profile")


class Goal(SQLModel, table=True):
    """
    Las metas que el usuario define
    equivalente a la tabla 'goals' pero hardcodeada para validar el MVP
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
    El corazón de la sesión de estudio
    Equivalente a la tabla 'sessions'
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
    
# INVENTARIO DE ITEMS 
class UserItem(SQLModel, table=True):
    """
    Registra qué items ha comprado el usuario en la tienda.
    """
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    
    item_id: str
    item_name: str
    acquired_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Cantidad
    quantity: int = Field(default=1) 
    
    user: Optional[User] = Relationship(back_populates="inventory")

