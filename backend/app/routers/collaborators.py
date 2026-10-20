import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.collaborator import CollaboratorAdd, CollaboratorResponse
from app.services.collaborator_service import CollaboratorService
from app.core.security import get_current_user

router = APIRouter(prefix="/categories/{category_id}/collaborators", tags=["Collaborators (Colaboradores)"])


@router.post("", response_model=CollaboratorResponse, status_code=status.HTTP_201_CREATED)
def add_collaborator(
    category_id: uuid.UUID,
    collab_in: CollaboratorAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Añade un usuario existente como colaborador a este tablero a partir de su correo electrónico.
    Acción permitida únicamente al dueño del tablero.
    """
    return CollaboratorService.add_collaborator(db, category_id, collab_in.email, current_user)


@router.get("", response_model=List[CollaboratorResponse])
def list_collaborators(
    category_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Lista todos los colaboradores asociados al tablero.
    """
    return CollaboratorService.list_collaborators(db, category_id)
