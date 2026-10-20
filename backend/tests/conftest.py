import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Asegurar que backend esté en el sys.path
backend_path = Path(__file__).resolve().parent.parent
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

from app.database import Base, get_db
import app.models  # noqa: F401
from app.models.user import User
from main import app

# Configuración de SQLite en memoria para tests aislados y rápidos
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    class ApiV1TestClient(TestClient):
        def request(self, method: str, url, *args, **kwargs):
            url_str = str(url)
            if url_str.startswith("/") and not url_str.startswith("/api/v1") and not url_str.startswith("/health") and url_str != "/":
                url_str = f"/api/v1{url_str}"
            return super().request(method, url_str, *args, **kwargs)

    with ApiV1TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def owner_user(db_session):
    user = User(name="Owner User", email="owner@flowtask.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def collab_user(db_session):
    user = User(name="Collaborator User", email="collab@flowtask.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def external_user(db_session):
    user = User(name="External User", email="external@flowtask.com")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user
