import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.category import Category
from app.models.user import User
from app.schemas.category import CategoryCreate
from app.repositories.category_repository import CategoryRepository
from app.repositories.collaborator_repository import CollaboratorRepository
from app.repositories.state_repository import StateRepository


class CategoryService:
    @staticmethod
    def create_category(db: Session, category_in: CategoryCreate, current_user: User) -> Category:
        # Crear categoría base
        category = CategoryRepository.create(db, category_in)

        # Registrar al usuario creador como dueño en Collaborator
        CollaboratorRepository.create(
            db=db,
            user_id=current_user.id,
            category_id=category.id,
            ownership=True
        )

        # Autogenerar automáticamente el estado obligatorio BACKLOG con order 0
        StateRepository.create(
            db=db,
            name="BACKLOG",
            order=0,
            category_id=category.id
        )

        db.refresh(category)
        return category

    @staticmethod
    def get_category_by_id(db: Session, category_id: uuid.UUID) -> Category:
        category = CategoryRepository.get_by_id(db, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada."
            )
        return category

    @staticmethod
    def list_categories(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
        return CategoryRepository.get_all(db, skip=skip, limit=limit)

    @staticmethod
    def list_user_categories(db: Session, user_id: uuid.UUID) -> List[Category]:
        return CategoryRepository.get_by_user(db, user_id)

    @staticmethod
    def delete_category(db: Session, category_id: uuid.UUID, current_user: User) -> None:
        category = CategoryService.get_category_by_id(db, category_id)
        if not CollaboratorRepository.is_owner(db, current_user.id, category_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el dueño del tablero puede eliminar esta categoría."
            )
        CategoryRepository.delete(db, category)
