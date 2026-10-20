import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.collaborator import Collaborator


class CollaboratorRepository:
    @staticmethod
    def get(db: Session, user_id: uuid.UUID, category_id: uuid.UUID) -> Optional[Collaborator]:
        stmt = select(Collaborator).where(
            Collaborator.user_id == user_id,
            Collaborator.category_id == category_id
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_by_category(db: Session, category_id: uuid.UUID) -> List[Collaborator]:
        stmt = select(Collaborator).where(Collaborator.category_id == category_id)
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def is_owner(db: Session, user_id: uuid.UUID, category_id: uuid.UUID) -> bool:
        stmt = select(Collaborator).where(
            Collaborator.user_id == user_id,
            Collaborator.category_id == category_id,
            Collaborator.ownership == True  # noqa: E712
        )
        return db.execute(stmt).scalar_one_or_none() is not None

    @staticmethod
    def is_collaborator(db: Session, user_id: uuid.UUID, category_id: uuid.UUID) -> bool:
        stmt = select(Collaborator).where(
            Collaborator.user_id == user_id,
            Collaborator.category_id == category_id
        )
        return db.execute(stmt).scalar_one_or_none() is not None

    @staticmethod
    def create(db: Session, user_id: uuid.UUID, category_id: uuid.UUID, ownership: bool = False) -> Collaborator:
        collab = Collaborator(
            user_id=user_id,
            category_id=category_id,
            ownership=ownership
        )
        db.add(collab)
        db.commit()
        db.refresh(collab)
        return collab

    @staticmethod
    def delete(db: Session, collab: Collaborator) -> None:
        db.delete(collab)
        db.commit()
