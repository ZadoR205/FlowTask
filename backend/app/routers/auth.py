from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import UserLogin, LoginResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registro público de nuevas cuentas de usuario.
    No requiere cabeceras de autorización.
    """
    return UserService.create_user(db, user_in)


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Autenticación simplificada mediante correo electrónico.
    Retorna el ID del usuario para ser utilizado en el header X-User-Id y en el botón 'Authorize' de Swagger.
    """
    return UserService.login(db, login_in.email)
