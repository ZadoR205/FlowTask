import uuid
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.schemas.user import UserResponse


class CollaboratorAdd(BaseModel):
    email: EmailStr = Field(..., description="Correo del usuario a añadir como colaborador")


class CollaboratorResponse(BaseModel):
    user_id: uuid.UUID
    category_id: uuid.UUID
    ownership: bool
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)
