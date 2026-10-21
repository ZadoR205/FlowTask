import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select, func, update
from app.models.state import State


class StateRepository:
    @staticmethod
    def get_by_id(db: Session, state_id: uuid.UUID) -> Optional[State]:
        stmt = select(State).where(State.id == state_id)
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_by_category(db: Session, category_id: uuid.UUID) -> List[State]:
        stmt = select(State).where(State.category_id == category_id).order_by(State.order.asc())
        return list(db.execute(stmt).scalars().all())

    @staticmethod
    def get_backlog_state(db: Session, category_id: uuid.UUID) -> Optional[State]:
        stmt = select(State).where(
            State.category_id == category_id,
            State.order == 0
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def count_by_category(db: Session, category_id: uuid.UUID) -> int:
        stmt = select(func.count(State.id)).where(State.category_id == category_id)
        return db.execute(stmt).scalar() or 0

    @staticmethod
    def create(db: Session, name: str, order: int, category_id: uuid.UUID) -> State:
        state = State(
            name=name,
            order=order,
            category_id=category_id
        )
        db.add(state)
        db.commit()
        db.refresh(state)
        return state

    @staticmethod
    def delete(db: Session, state: State) -> None:
        db.delete(state)
        db.commit()

    @staticmethod
    def reorder_after_delete(db: Session, category_id: uuid.UUID, deleted_order: int) -> None:
        stmt = (
            update(State)
            .where(
                State.category_id == category_id,
                State.order > deleted_order
            )
            .values(order=State.order - 1)
        )
        db.execute(stmt)
        db.commit()
