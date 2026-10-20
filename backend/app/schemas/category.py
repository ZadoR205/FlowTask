import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.state import StateResponse
from app.schemas.collaborator import CollaboratorResponse


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=25, description="Nombre de la categoría / tablero")
    description: Optional[str] = Field(None, max_length=75, description="Descripción opcional")


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class CategoryDetailResponse(CategoryResponse):
    states: List[StateResponse] = []
    collaborators: List[CollaboratorResponse] = []

    model_config = ConfigDict(from_attributes=True)
