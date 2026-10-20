from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.database import engine, Base
import app.models  # noqa: F401 - Asegura el registro de todos los modelos
from app.routers import (
    auth_router,
    users_router,
    categories_router,
    states_router,
    collaborators_router,
    tasks_router,
    seed_router
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialización de tablas en la base de datos si no existen
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="API REST de seguimiento de actividades y tableros FlowTask",
    lifespan=lifespan
)

# Configuración estricta de CORS para puertos locales de Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusión de routers exclusivamente bajo el prefijo de versión API v1 (/api/v1)
for router in [auth_router, users_router, categories_router, states_router, collaborators_router, tasks_router, seed_router]:
    app.include_router(router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }


@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "ok"}
