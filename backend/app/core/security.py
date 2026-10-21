import uuid
from typing import Optional
from fastapi import HTTPException, status, Depends, Security
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.database import get_db
from app.models.user import User

api_key_header = APIKeyHeader(
    name="X-User-Id",
    auto_error=False,
    description="ID de usuario (UUID) para autorización en el sistema"
)


def get_current_user(
    x_user_id: Optional[str] = Security(api_key_header),
    db: Session = Depends(get_db)
) -> User:
    """Dependency que autentica al usuario mediante el header X-User-Id."""
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales de usuario no proporcionadas. Use el header X-User-Id."
        )

    try:
        parsed_id = uuid.UUID(x_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de X-User-Id inválido (debe ser un UUID válido)."
        )

    stmt = select(User).where(User.id == parsed_id)
    user = db.execute(stmt).scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado con las credenciales provistas."
        )

    return user
