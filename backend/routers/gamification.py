import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from database import get_session
from models import User, UserItem
from routers.auth import get_current_user

router = APIRouter(prefix="/gamification", tags=["gamification"])

# RULETA:
# Definimos los premios posibles y sus probabilidades
REWARDS = [
    {"label": "+5 Granos", "value": 5, "weight": 50},   # 50% probabilidad
    {"label": "+20 Granos", "value": 20, "weight": 30}, # 30%
    {"label": "+50 Granos", "value": 50, "weight": 10}, # 10%
    {"label": "+5 Minutos", "value": 0, "weight": 10},  # 10% Esto no se implementa en este MVP aun, pero se deja listo
]

@router.post("/spin")
def spin_wheel(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Gira la ruleta. Cuesta 50 puntos girarla (por el mvp dejare 10 para hacer la demo).
    """
    COST_TO_SPIN = 10 

    if current_user.current_points < COST_TO_SPIN:
        raise HTTPException(status_code=400, detail="No tienes suficientes granos para girar (10 requeridos)")

    # Se resta el valor de la entrada para girar
    current_user.current_points -= COST_TO_SPIN
    
    # Se elige un premio basado en las probabilidades antes definidas
    choices = [r for r in REWARDS]
    weights = [r["weight"] for r in REWARDS]
    reward = random.choices(choices, weights=weights, k=1)[0]

    # Se da el premio
    current_user.current_points += reward["value"]
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)

    return {
        "prize": reward["label"],
        "value": reward["value"],
        "new_balance": current_user.current_points,
        "message": f"¡Ganaste {reward['label']}!"
    }

# TIENDA:
class PurchaseRequest(BaseModel):
    item_id: str
    price: int
    name: str

@router.post("/buy")
def buy_item(
    item: PurchaseRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Cuando se compra un item se resta puntos y lo guarda en el inventario
    """
    #Verificando el saldo
    if current_user.current_points < item.price:
        raise HTTPException(status_code=400, detail="Te faltan granos de café 💸")

    # Verificar si ya tiene el item (para sumar cantidad en vez de duplicar fila)
    statement = select(UserItem).where(
        UserItem.user_id == current_user.id, 
        UserItem.item_id == item.item_id
    )
    existing_item = session.exec(statement).first()

    if existing_item:
        existing_item.quantity += 1
        session.add(existing_item)
    else:
        # Registor en el inventario
        new_item = UserItem(
            user_id=current_user.id,
            item_id=item.item_id,
            item_name=item.name,
            quantity=1
        )
        session.add(new_item)

    # 3. Cobrar el precio del item
    current_user.current_points -= item.price
    session.add(current_user)
    
    session.commit()
    
    return {
        "success": True, 
        "new_balance": current_user.current_points,
        "message": f"¡Compraste {item.name}!",
        "inventory_updated": True
    }

#ENDPOINT: CONSULTAR INVENTARIO:
@router.get("/inventory")
def get_my_inventory(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Devuelve la lista de cosas que el usuario ha comprado.
    """
    statement = select(UserItem).where(UserItem.user_id == current_user.id)
    items = session.exec(statement).all()
    return items