import uuid
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.schemas.state import StateResponse
from app.schemas.user import UserResponse
from app.repositories.task_repository import TaskRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.state_repository import StateRepository
from app.repositories.collaborator_repository import CollaboratorRepository


class TaskService:
    @staticmethod
    def _format_task_response(task: Task) -> TaskResponse:
        return TaskResponse(
            id=task.id,
            title=task.title,
            description=task.description,
            due_date=task.due_date,
            status_id=task.status_id,
            responsible_id=task.responsible_id,
            status=StateResponse.model_validate(task.status),
            responsible=UserResponse.model_validate(task.responsible) if task.responsible else None,
            category_id=task.status.category.id,
            category_name=task.status.category.name
        )

    @staticmethod
    def create_task(db: Session, task_in: TaskCreate, current_user: User) -> TaskResponse:
        # Verificar existencia de la categoría
        category = CategoryRepository.get_by_id(db, task_in.category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada."
            )

        # Verificar que el usuario sea colaborador o dueño del tablero
        if not CollaboratorRepository.is_collaborator(db, current_user.id, task_in.category_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Debes ser colaborador o dueño del tablero para crear tareas en esta categoría."
            )

        # Determinar el estado inicial
        if task_in.status_id:
            state = StateRepository.get_by_id(db, task_in.status_id)
            if not state or state.category_id != task_in.category_id:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="El estado especificado no existe o no pertenece a la categoría indicada."
                )
            target_status_id = task_in.status_id
        else:
            backlog_state = StateRepository.get_backlog_state(db, task_in.category_id)
            if not backlog_state:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No se encontró el estado BACKLOG del tablero."
                )
            target_status_id = backlog_state.id

        # Manejo del responsable
        is_owner = CollaboratorRepository.is_owner(db, current_user.id, task_in.category_id)
        if task_in.responsible_id:
            if not is_owner:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Solo el dueño del tablero puede asignar el responsable de una tarea."
                )
            if not CollaboratorRepository.is_collaborator(db, task_in.responsible_id, task_in.category_id):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="El usuario asignado como responsable debe ser un colaborador de este tablero."
                )

        # Crear la tarea
        task = Task(
            title=task_in.title.strip(),
            description=task_in.description.strip(),
            due_date=task_in.due_date,
            status_id=target_status_id,
            responsible_id=task_in.responsible_id
        )
        created_task = TaskRepository.create(db, task)
        return TaskService._format_task_response(created_task)

    @staticmethod
    def get_task_by_id(db: Session, task_id: uuid.UUID) -> TaskResponse:
        task = TaskRepository.get_by_id(db, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarea no encontrada"
            )
        return TaskService._format_task_response(task)

    @staticmethod
    def list_tasks(
        db: Session,
        category_id: Optional[uuid.UUID] = None,
        status_id: Optional[uuid.UUID] = None,
        responsible_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[TaskResponse]:
        tasks = TaskRepository.get_all(
            db=db,
            category_id=category_id,
            status_id=status_id,
            responsible_id=responsible_id,
            skip=skip,
            limit=limit
        )
        return [TaskService._format_task_response(t) for t in tasks]

    @staticmethod
    def update_task(db: Session, task_id: uuid.UUID, task_in: TaskUpdate, current_user: User) -> TaskResponse:
        task = TaskRepository.get_by_id(db, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarea no encontrada"
            )

        category_id = task.status.category_id
        is_owner = CollaboratorRepository.is_owner(db, current_user.id, category_id)

        update_data = task_in.model_dump(exclude_unset=True)

        # Validar permisos sobre campos administrativos
        non_status_keys = {"title", "description", "due_date", "responsible_id"}
        if any(k in update_data for k in non_status_keys):
            if not is_owner:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Solo el dueño del tablero puede modificar los detalles o el responsable de la tarea."
                )

        # Validar responsable si se actualiza
        if "responsible_id" in update_data and update_data["responsible_id"] is not None:
            if not CollaboratorRepository.is_collaborator(db, update_data["responsible_id"], category_id):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="El usuario asignado como responsable debe ser un colaborador de este tablero."
                )

        # Validar cambio de estado
        if "status_id" in update_data and update_data["status_id"] is not None:
            new_status_id = update_data["status_id"]
            target_state = StateRepository.get_by_id(db, new_status_id)
            if not target_state or target_state.category_id != category_id:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="El estado destino no pertenece a la misma categoría del tablero."
                )

            # Regla de permisos:
            # Si no es dueño, solo puede cambiar de estado si la tarea está asignada a él
            if not is_owner:
                if task.responsible_id != current_user.id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Solo el responsable asignado o el dueño del tablero pueden cambiar el estado de esta tarea."
                    )

        updated_task = TaskRepository.update(db, task, update_data)
        return TaskService._format_task_response(updated_task)

    @staticmethod
    def delete_task(db: Session, task_id: uuid.UUID, current_user: User) -> None:
        task = TaskRepository.get_by_id(db, task_id)
        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tarea no encontrada"
            )

        category_id = task.status.category_id
        if not CollaboratorRepository.is_owner(db, current_user.id, category_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo el dueño del tablero puede eliminar tareas."
            )

        TaskRepository.delete(db, task)
