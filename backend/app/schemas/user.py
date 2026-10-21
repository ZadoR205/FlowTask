import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=25, description="Nombre del usuario")
    email: EmailStr = Field(..., max_length=50, description="Correo electrónico único")


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
