import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.state import State
from app.models.user import User
from app.schemas.state import StateCreate
from app.repositories.category_repository import CategoryRepository
from app.repositories.collaborator_repository import CollaboratorRepository
from app.repositories.state_repository import StateRepository
from app.repositories.task_repository import TaskRepository


class StateService:
    @staticmethod
    def create_state(db: Session, category_id: uuid.UUID, state_in: StateCreate, current_user: User) -> State:
        category = CategoryRepository.get_by_id(db, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada."
            )

        if not CollaboratorRepository.is_owner(db, current_user.id, category_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el dueño del tablero puede crear nuevos estados."
            )

        # Asignar automáticamente el siguiente order secuencial (n-1 de la cantidad total)
        current_count = StateRepository.count_by_category(db, category_id)
        return StateRepository.create(
            db=db,
            name=state_in.name,
            order=current_count,
            category_id=category_id
        )

    @staticmethod
    def list_states(db: Session, category_id: uuid.UUID) -> List[State]:
        category = CategoryRepository.get_by_id(db, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada."
            )
        return StateRepository.get_by_category(db, category_id)

    @staticmethod
    def delete_state(db: Session, state_id: uuid.UUID, current_user: User) -> None:
        state = StateRepository.get_by_id(db, state_id)
        if not state:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estado no encontrado."
            )

        if not CollaboratorRepository.is_owner(db, current_user.id, state.category_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el dueño del tablero puede eliminar estados."
            )

        # BACKLOG con order 0 no se puede eliminar bajo ninguna circunstancia
        if state.order == 0 or state.name.strip().upper() == "BACKLOG":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El estado BACKLOG no puede ser eliminado."
            )

        # Bloquear eliminación si tiene tareas asociadas
        tasks_count = TaskRepository.count_by_state(db, state_id)
        if tasks_count > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"No se puede eliminar el estado porque contiene {tasks_count} tarea(s) asociada(s). Mueva las tareas antes de eliminarlo."
            )

        category_id = state.category_id
        deleted_order = state.order

        # Eliminar y reordenar estados posteriores para mantener la secuencia 0..n-1
        StateRepository.delete(db, state)
        StateRepository.reorder_after_delete(db, category_id, deleted_order)
