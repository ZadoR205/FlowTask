from datetime import date, timedelta
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.database import engine as default_engine, Base
import app.models  # noqa: F401 - Asegura el registro de todos los modelos ORM
from app.models.user import User
from app.models.category import Category
from app.models.collaborator import Collaborator
from app.models.state import State
from app.models.task import Task


class SeedService:
    @staticmethod
    def reset_and_seed_db(db: Session) -> Dict[str, Any]:
        """
        Elimina completamente el esquema existente (drop_all),
        reconstruye las tablas limpias (create_all) y puebla la base
        de datos con usuarios, tableros, estados y tareas de demostración.
        """
        target_engine = db.get_bind() if db else default_engine

        # Rollback previo para cerrar cualquier transacción pendiente antes de DDL
        db.rollback()
        Base.metadata.drop_all(bind=target_engine)
        Base.metadata.create_all(bind=target_engine)

        today = date.today()

        # Creación de Usuarios Base
        admin = User(name="Admin", email="admin@flowtask.com")
        carlos = User(name="Carlos Dev", email="carlos@flowtask.com")
        ana = User(name="Ana Design", email="ana@flowtask.com")
        db.add_all([admin, carlos, ana])
        db.commit()
        db.refresh(admin)
        db.refresh(carlos)
        db.refresh(ana)

        # Tablero 1: "Trabajo" (Dueño: admin)
        cat_trabajo = Category(name="Trabajo", description="Actividades y proyectos del equipo de desarrollo")
        db.add(cat_trabajo)
        db.commit()
        db.refresh(cat_trabajo)

        collab_trabajo_admin = Collaborator(user_id=admin.id, category_id=cat_trabajo.id, ownership=True)
        collab_trabajo_carlos = Collaborator(user_id=carlos.id, category_id=cat_trabajo.id, ownership=False)
        db.add_all([collab_trabajo_admin, collab_trabajo_carlos])

        st_t_backlog = State(name="BACKLOG", order=0, category_id=cat_trabajo.id)
        st_t_progreso = State(name="En Progreso", order=1, category_id=cat_trabajo.id)
        st_t_revision = State(name="En Revisión", order=2, category_id=cat_trabajo.id)
        st_t_completada = State(name="Completada", order=3, category_id=cat_trabajo.id)
        db.add_all([st_t_backlog, st_t_progreso, st_t_revision, st_t_completada])
        db.commit()

        t1 = Task(
            title="Configurar PostgreSQL",
            description="Levantar contenedor y migrar esquemas con SQLAlchemy 2.0",
            due_date=today + timedelta(days=2),
            status_id=st_t_progreso.id,
            responsible_id=carlos.id
        )
        t2 = Task(
            title="Diseñar Arquitectura",
            description="Definir capas de routers, services y repositories",
            due_date=today + timedelta(days=1),
            status_id=st_t_completada.id,
            responsible_id=admin.id
        )
        db.add_all([t1, t2])

        # Tablero 2: "Personal" (Dueño: admin)
        cat_personal = Category(name="Personal", description="Metas, hábitos y pendientes personales")
        db.add(cat_personal)
        db.commit()
        db.refresh(cat_personal)

        collab_personal_admin = Collaborator(user_id=admin.id, category_id=cat_personal.id, ownership=True)
        db.add(collab_personal_admin)

        st_p_backlog = State(name="BACKLOG", order=0, category_id=cat_personal.id)
        st_p_en_curso = State(name="En Curso", order=1, category_id=cat_personal.id)
        st_p_hecho = State(name="Completada", order=2, category_id=cat_personal.id)
        db.add_all([st_p_backlog, st_p_en_curso, st_p_hecho])
        db.commit()

        t3 = Task(
            title="Organizar espacio",
            description="Limpiar escritorio y organizar cables de oficina",
            due_date=today + timedelta(days=5),
            status_id=st_p_backlog.id,
            responsible_id=admin.id
        )
        db.add(t3)

        # Tablero 3: "Urgente" (Dueño: carlos)
        cat_urgente = Category(name="Urgente", description="Incidencias prioritarias de producción")
        db.add(cat_urgente)
        db.commit()
        db.refresh(cat_urgente)

        collab_urgente_carlos = Collaborator(user_id=carlos.id, category_id=cat_urgente.id, ownership=True)
        collab_urgente_admin = Collaborator(user_id=admin.id, category_id=cat_urgente.id, ownership=False)
        collab_urgente_ana = Collaborator(user_id=ana.id, category_id=cat_urgente.id, ownership=False)
        db.add_all([collab_urgente_carlos, collab_urgente_admin, collab_urgente_ana])

        st_u_backlog = State(name="BACKLOG", order=0, category_id=cat_urgente.id)
        st_u_atendiendo = State(name="Atendiendo", order=1, category_id=cat_urgente.id)
        st_u_resuelto = State(name="Completada", order=2, category_id=cat_urgente.id)
        db.add_all([st_u_backlog, st_u_atendiendo, st_u_resuelto])
        db.commit()

        t4 = Task(
            title="Fix CORS Frontend",
            description="Asegurar encabezados permitidos para peticiones desde React y Angular",
            due_date=today,
            status_id=st_u_atendiendo.id,
            responsible_id=carlos.id
        )
        db.add(t4)
        db.commit()

        return {
            "message": "Base de datos reseteada y sembrada con éxito",
            "users": 3,
            "categories": 3,
            "states": 10,
            "tasks": 4
        }
