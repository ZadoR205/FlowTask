import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate


class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.strip())
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[User]:
        stmt = select(User).where(User.name == name.strip())
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        stmt = select(User).offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create(db: Session, user_in: UserCreate) -> User:
        user = User(
            name=user_in.name,
            email=user_in.email
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
