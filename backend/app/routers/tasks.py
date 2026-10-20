import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import TaskService
from app.core.security import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks (Tareas)"])


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Registro y validación de una nueva tarea.
    - Asocia la tarea a una categoría existente con fecha límite válida.
    - Si no se especifica status_id, se asigna automáticamente al estado 'BACKLOG'.
    - Si se especifica un responsable, debe ser un colaborador de la categoría y solo puede ser asignado por el dueño.
    """
    return TaskService.create_task(db, task_in, current_user)


@router.get("", response_model=List[TaskResponse])
def list_tasks(
    category_id: Optional[uuid.UUID] = Query(None, description="Filtrar por ID de categoría"),
    status_id: Optional[uuid.UUID] = Query(None, description="Filtrar por ID de estado"),
    responsible_id: Optional[uuid.UUID] = Query(None, description="Filtrar por ID de usuario responsable"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Caso 3: Tablero de tareas y filtros.
    Retorna la lista de tareas mostrando Título, Categoría legible, Estado y Fecha límite.
    Permite filtrar por categoría, estado o responsable.
    """
    return TaskService.list_tasks(
        db=db,
        category_id=category_id,
        status_id=status_id,
        responsible_id=responsible_id,
        skip=skip,
        limit=limit
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Caso 5 (Edge Case): Consulta de tarea por ID.
    Si la tarea no existe, retorna 404 con '{"detail": "Tarea no encontrada"}'.
    """
    return TaskService.get_task_by_id(db, task_id)


@router.patch("/{task_id}", response_model=TaskResponse)
@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Caso 4: Transición rápida de estados y edición.
    - El dueño del tablero puede modificar cualquier tarea o estado.
    - Un colaborador solo puede cambiar de estado las tareas que tenga asignadas.
    """
    return TaskService.update_task(db, task_id, task_in, current_user)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Caso 4: Borrado seguro de tareas.
    Solo el dueño del tablero puede eliminar una tarea.
    """
    TaskService.delete_task(db, task_id, current_user)
