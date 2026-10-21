import uuid
from pydantic import BaseModel, ConfigDict, Field


class StateBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=25, description="Nombre del estado")


class StateCreate(StateBase):
    pass


class StateResponse(StateBase):
    id: uuid.UUID
    order: int
    category_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)
