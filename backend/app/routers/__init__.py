from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.categories import router as categories_router
from app.routers.states import router as states_router
from app.routers.collaborators import router as collaborators_router
from app.routers.tasks import router as tasks_router
from app.routers.seed import router as seed_router

__all__ = [
    "auth_router",
    "users_router",
    "categories_router",
    "states_router",
    "collaborators_router",
    "tasks_router",
    "seed_router"
]

