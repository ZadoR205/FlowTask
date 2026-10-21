from pydantic import BaseModel, Field


class SeedResponse(BaseModel):
    message: str = Field(..., description="Mensaje de confirmación de la operación")
    users: int = Field(..., description="Cantidad de usuarios creados")
    categories: int = Field(..., description="Cantidad de categorías/tableros creados")
    states: int = Field(..., description="Cantidad de estados creados")
    tasks: int = Field(..., description="Cantidad de tareas creadas")
