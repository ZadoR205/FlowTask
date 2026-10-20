import uuid
from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, Date, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.state import State
    from app.models.user import User


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(25), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("states.id"),
        nullable=False
    )
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    responsible_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    # Relationships
    status: Mapped["State"] = relationship("State", back_populates="tasks")
    responsible: Mapped[Optional["User"]] = relationship("User", back_populates="assigned_tasks")

    @property
    def category_id(self) -> Optional[uuid.UUID]:
        return self.status.category_id if self.status else None
