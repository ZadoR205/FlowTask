import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.state import StateCreate, StateResponse
from app.services.state_service import StateService
from app.core.security import get_current_user

router = APIRouter(tags=["States (Estados de Tablero)"])


@router.post("/categories/{category_id}/states", response_model=StateResponse, status_code=status.HTTP_201_CREATED)
def create_state(
    category_id: uuid.UUID,
    state_in: StateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea un nuevo estado para la categoría.
    Solo el dueño del tablero puede crear estados.
    El orden se asigna automáticamente con el siguiente valor correlativo (0..n-1).
    """
    return StateService.create_state(db, category_id, state_in, current_user)


@router.get("/categories/{category_id}/states", response_model=List[StateResponse])
def list_states(
    category_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Lista todos los estados pertenecientes a un tablero ordenados por su campo order.
    """
    return StateService.list_states(db, category_id)


@router.delete("/states/{state_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_state(
    state_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Elimina un estado del tablero.
    - Solo permitido al dueño.
    - El estado 'BACKLOG' (order 0) está protegido y NO puede ser eliminado.
    - Si el estado contiene tareas asociadas, se rechaza la eliminación (HTTP 409).
    - Los estados subsiguientes son reordenados automáticamente para no dejar huecos.
    """
    StateService.delete_state(db, state_id, current_user)
