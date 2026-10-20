import uuid
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.collaborator import Collaborator
    from app.models.state import State


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(25), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(75), nullable=True)

    # Relationships
    collaborators: Mapped[List["Collaborator"]] = relationship(
        "Collaborator",
        back_populates="category",
        cascade="all, delete-orphan"
    )
    states: Mapped[List["State"]] = relationship(
        "State",
        back_populates="category",
        cascade="all, delete-orphan",
        order_by="State.order"
    )
