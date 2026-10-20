import uuid
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.repositories.user_repository import UserRepository


class UserService:
    @staticmethod
    def create_user(db: Session, user_in: UserCreate) -> User:
        if UserRepository.get_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un usuario registrado con este correo electrónico."
            )
        if UserRepository.get_by_name(db, user_in.name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un usuario con este nombre de usuario."
            )
        return UserRepository.create(db, user_in)

    @staticmethod
    def get_user_by_id(db: Session, user_id: uuid.UUID) -> User:
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado."
            )
        return user

    @staticmethod
    def list_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return UserRepository.get_all(db, skip=skip, limit=limit)

    @staticmethod
    def login(db: Session, email: str) -> User:
        user = UserRepository.get_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No existe ningún usuario registrado con este correo electrónico."
            )
        return user

