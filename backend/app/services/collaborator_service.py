import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.collaborator import Collaborator
from app.models.user import User
from app.repositories.category_repository import CategoryRepository
from app.repositories.collaborator_repository import CollaboratorRepository
from app.repositories.user_repository import UserRepository


class CollaboratorService:
    @staticmethod
    def add_collaborator(db: Session, category_id: uuid.UUID, email: str, current_user: User) -> Collaborator:
        category = CategoryRepository.get_by_id(db, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada."
            )

        # Solo el dueño del tablero puede añadir colaboradores
        if not CollaboratorRepository.is_owner(db, current_user.id, category_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el dueño del tablero puede añadir colaboradores."
            )

        # Buscar usuario por correo
        target_user = UserRepository.get_by_email(db, email)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró ningún usuario registrado con el correo especificado."
            )

        # Verificar si ya es colaborador
        if CollaboratorRepository.is_collaborator(db, target_user.id, category_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El usuario ya es colaborador de este tablero."
            )

        return CollaboratorRepository.create(
            db=db,
            user_id=target_user.id,
            category_id=category_id,
            ownership=False
        )

    @staticmethod
    def list_collaborators(db: Session, category_id: uuid.UUID) -> List[Collaborator]:
        category = CategoryRepository.get_by_id(db, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada."
            )
        return CollaboratorRepository.get_by_category(db, category_id)
