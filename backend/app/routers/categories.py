import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryDetailResponse
from app.services.category_service import CategoryService
from app.core.security import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories (Tableros)"])


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crea un nuevo tablero/categoría.
    El usuario que crea la categoría se asigna automáticamente como dueño (ownership=True)
    y se genera de forma inmediata el estado inicial 'BACKLOG' con order 0.
    """
    return CategoryService.create_category(db, category_in, current_user)


@router.get("", response_model=List[CategoryResponse])
def list_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retorna la lista de categorías registradas en formato JSON.
    """
    return CategoryService.list_categories(db, skip=skip, limit=limit)


@router.get("/{category_id}", response_model=CategoryDetailResponse)
def get_category_detail(
    category_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Obtiene el detalle de un tablero incluyendo sus estados ordenados y sus colaboradores.
    """
    return CategoryService.get_category_by_id(db, category_id)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Elimina un tablero. Acción permitida únicamente al dueño del tablero.
    """
    CategoryService.delete_category(db, category_id, current_user)
