import uuid
from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.state import StateResponse
from app.schemas.user import UserResponse


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=25, description="Título obligatorio de la tarea")
    description: str = Field(..., min_length=1, description="Descripción detallada de la tarea")
    due_date: date = Field(..., description="Fecha límite de la tarea en formato ISO (YYYY-MM-DD)")


class TaskCreate(TaskBase):
    category_id: uuid.UUID = Field(..., description="ID del tablero / categoría asociada")
    status_id: Optional[uuid.UUID] = Field(None, description="ID del estado (por defecto se asigna BACKLOG)")
    responsible_id: Optional[uuid.UUID] = Field(None, description="ID del colaborador asignado")


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=25)
    description: Optional[str] = None
    due_date: Optional[date] = None
    status_id: Optional[uuid.UUID] = None
    responsible_id: Optional[uuid.UUID] = None


class TaskResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str
    due_date: date
    status_id: uuid.UUID
    responsible_id: Optional[uuid.UUID] = None
    status: StateResponse
    responsible: Optional[UserResponse] = None
    category_id: uuid.UUID
    category_name: str

    model_config = ConfigDict(from_attributes=True)
