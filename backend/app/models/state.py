import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.task import Task


class State(Base):
    __tablename__ = "states"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(25), nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False
    )

    # Relationships
    category: Mapped["Category"] = relationship("Category", back_populates="states")
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="status")
