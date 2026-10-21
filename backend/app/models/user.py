import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.collaborator import Collaborator
    from app.models.task import Task


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(25), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)

    # Relationships
    collaborations: Mapped[List["Collaborator"]] = relationship(
        "Collaborator",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    assigned_tasks: Mapped[List["Task"]] = relationship(
        "Task",
        back_populates="responsible"
    )
