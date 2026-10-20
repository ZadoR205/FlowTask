import uuid
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
from app.models.task import Task
from app.models.state import State


class TaskRepository:
    @staticmethod
    def get_by_id(db: Session, task_id: uuid.UUID) -> Optional[Task]:
        stmt = (
            select(Task)
            .options(
                joinedload(Task.status).joinedload(State.category),
                joinedload(Task.responsible)
            )
            .where(Task.id == task_id)
        )
        return db.execute(stmt).scalar_one_or_none()

    @staticmethod
    def get_all(
        db: Session,
        category_id: Optional[uuid.UUID] = None,
        status_id: Optional[uuid.UUID] = None,
        responsible_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        stmt = (
            select(Task)
            .options(
                joinedload(Task.status).joinedload(State.category),
                joinedload(Task.responsible)
            )
        )

        if category_id:
            stmt = stmt.join(State, State.id == Task.status_id).where(State.category_id == category_id)

        if status_id:
            stmt = stmt.where(Task.status_id == status_id)

        if responsible_id:
            stmt = stmt.where(Task.responsible_id == responsible_id)

        stmt = stmt.offset(skip).limit(limit)
        return list(db.execute(stmt).scalars().unique().all())

    @staticmethod
    def count_by_state(db: Session, state_id: uuid.UUID) -> int:
        stmt = select(func.count(Task.id)).where(Task.status_id == state_id)
        return db.execute(stmt).scalar() or 0

    @staticmethod
    def create(db: Session, task: Task) -> Task:
        db.add(task)
        db.commit()
        db.refresh(task)
        return TaskRepository.get_by_id(db, task.id) or task

    @staticmethod
    def update(db: Session, task: Task, update_data: Dict[str, Any]) -> Task:
        for key, value in update_data.items():
            if hasattr(task, key):
                setattr(task, key, value)
        db.commit()
        db.refresh(task)
        return TaskRepository.get_by_id(db, task.id) or task

    @staticmethod
    def delete(db: Session, task: Task) -> None:
        db.delete(task)
        db.commit()
