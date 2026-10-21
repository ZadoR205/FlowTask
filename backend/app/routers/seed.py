from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.seed import SeedResponse
from app.services.seed_service import SeedService

router = APIRouter(prefix="/seed", tags=["Seed & Database Reset"])


@router.post(
    "",
    response_model=SeedResponse,
    status_code=status.HTTP_200_OK,
    summary="Resetear y sembrar datos de prueba",
    description="Elimina todas las tablas existentes (drop_all), las regenera limpias (create_all) e inserta los datos de demo predeterminados."
)
def reset_and_seed(db: Session = Depends(get_db)):
    """
    Ejecuta el reseteo completo de la base de datos y la recarga de datos demo.
    """
    result = SeedService.reset_and_seed_db(db)
    return result
