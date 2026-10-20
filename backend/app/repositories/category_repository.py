import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.category import Category
from app.models.collaborator import Collaborator
from app.schemas.category import CategoryCreate


class CategoryRepository:
    @staticmethod
    def get_by_id(db: Session, category_id: uuid.UUID) -> Optional[Category]:
        stmt = select(Category).where(Category.id == category_id)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Category]:
        stmt = select(Category).offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_by_user(db: Session, user_id: uuid.UUID) -> List[Category]:
        stmt = (
            select(Category)
            .join(Collaborator, Collaborator.category_id == Category.id)
            .where(Collaborator.user_id == user_id)
        )
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def create(db: Session, category_in: CategoryCreate) -> Category:
        category = Category(
            name=category_in.name,
            description=category_in.description
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    @staticmethod
    def delete(db: Session, category: Category) -> None:
        db.delete(category)
        db.commit()
