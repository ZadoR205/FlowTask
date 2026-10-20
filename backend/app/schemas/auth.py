import uuid
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserLogin(BaseModel):
    email: EmailStr = Field(..., max_length=50, description="Correo electrónico del usuario")


class LoginResponse(BaseModel):
    id: uuid.UUID = Field(..., description="ID único del usuario (usar en header X-User-Id)")
    name: str = Field(..., description="Nombre del usuario")
    email: EmailStr = Field(..., description="Correo electrónico del usuario")

    model_config = ConfigDict(from_attributes=True)
