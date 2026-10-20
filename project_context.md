# Contexto del Proyecto: FlowTask (Synbad)

**Última actualización:** 2026-10-20  
**Estado:** Backend completamente implementado y normalizado. Endpoints centralizados bajo prefijo único `/api/v1/*` (sin duplicados en la raíz). Autenticación y onboarding bajo módulo de Auth (`POST /api/v1/auth/register` y `POST /api/v1/auth/login`), con header `X-User-Id` y soporte de botón global `Authorize` en Swagger UI. Suite de pruebas 100% en verde (29/29 tests).

---

## 1. Visión y Dominio del Negocio
FlowTask es un módulo ligero de seguimiento de actividades orientado a pequeños equipos de trabajo. Permite a los usuarios crear tableros organizados como categorías, definir estados personalizados por categoría (adecuados para distintas naturalezas de trabajo como Software, Diseño o Marketing), gestionar colaboradores por invitación de correo con roles de propiedad (`ownership`), y controlar el ciclo de vida de actividades/tareas con validaciones de permisos estrictas.

---

## 2. Stack Tecnológico del Backend
- **Lenguaje:** Python 3.10+
- **Framework Web:** FastAPI
- **ORM:** SQLAlchemy 2.0 (sintaxis moderna con `Mapped`, `mapped_column`, `relationship`, `select`)
- **Validación de Datos:** Pydantic v2 y Pydantic-Settings (con `email-validator`)
- **Base de Datos:** PostgreSQL 16 (vía driver `psycopg` v3 en producción y SQLite en memoria para la suite de pruebas automatizadas)
- **Servidor ASGI:** Uvicorn
- **Pruebas:** Pytest y HTTPX (`TestClient`)
- **Contenedores:** Docker & Docker Compose

---

## 3. Estructura de Directorios y Archivos

```text
Synbad/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py           # Variables de entorno con Pydantic-Settings
│   │   │   └── security.py         # Autenticación y resolución de usuario vía X-User-Id (APIKeyHeader)
│   │   ├── database.py             # Engine SQLAlchemy 2.0, SessionLocal, Base, get_db
│   │   ├── models/                 # Modelos relacionales ORM
│   │   │   ├── user.py             # Entidad User (id, name, email)
│   │   │   ├── collaborator.py     # Entidad Collaborator (user_id, category_id, ownership)
│   │   │   ├── category.py         # Entidad Category (id, name, description)
│   │   │   ├── state.py            # Entidad State (id, name, order, category_id)
│   │   │   └── task.py             # Entidad Task (id, title, description, status_id, due_date, responsible_id)
│   │   ├── schemas/                # Esquemas DTO de Pydantic v2
│   │   │   ├── auth.py             # UserLogin, LoginResponse
│   │   │   ├── user.py             # UserBase, UserCreate, UserResponse
│   │   │   ├── collaborator.py     # CollaboratorAdd, CollaboratorResponse
│   │   │   ├── category.py         # CategoryBase, CategoryCreate, CategoryResponse, CategoryDetailResponse
│   │   │   ├── state.py            # StateBase, StateCreate, StateResponse
│   │   │   ├── task.py             # TaskBase, TaskCreate, TaskUpdate, TaskResponse
│   │   │   └── seed.py             # SeedResponse
│   │   ├── repositories/           # Capa de acceso a datos pura (queries SQLAlchemy)
│   │   │   ├── user_repository.py
│   │   │   ├── collaborator_repository.py
│   │   │   ├── category_repository.py
│   │   │   ├── state_repository.py
│   │   │   └── task_repository.py
│   │   ├── services/               # Capa de lógica de negocio y reglas de dominio
│   │   │   ├── user_service.py     # Creación, consulta y login de usuarios
│   │   │   ├── collaborator_service.py
│   │   │   ├── category_service.py
│   │   │   ├── state_service.py
│   │   │   ├── task_service.py
│   │   │   └── seed_service.py     # Servicio de reseteo DDL (drop/create) y carga de demo data
│   │   └── routers/                # Capa de controladores HTTP FastAPI (montados en /api/v1)
│   │       ├── auth.py             # POST /api/v1/auth/register y POST /api/v1/auth/login
│   │       ├── users.py            # Consultas de usuarios (/api/v1/users y /api/v1/users/{id})
│   │       ├── categories.py       # Endpoints de tableros (/api/v1/categories)
│   │       ├── states.py           # Endpoints de estados (/api/v1/categories/{id}/states y /api/v1/states/{id})
│   │       ├── collaborators.py    # Endpoints de colaboradores (/api/v1/categories/{id}/collaborators)
│   │       ├── tasks.py            # Endpoints de tareas (/api/v1/tasks)
│   │       └── seed.py             # Endpoint POST /api/v1/seed
│   ├── tests/                      # Suite de pruebas automatizadas (29 tests)
│   │   ├── conftest.py             # Configuración de SQLite in-memory y ApiV1TestClient
│   │   ├── test_auth.py            # Tests de registro y login (201, 200, 404, 409, 422)
│   │   ├── test_categories.py      # Caso 1 y creación de tableros con dueño y BACKLOG
│   │   ├── test_states.py          # Autoincremento de order, protección BACKLOG y reordenamiento
│   │   ├── test_collaborators.py   # Gestión de colaboradores por correo y permisos
│   │   ├── test_tasks.py           # Casos 2, 3, 4 y 5 (validaciones, filtros, transiciones, 404)
│   │   └── test_seed.py            # Pruebas del endpoint de reseteo y siembra
│   ├── main.py                     # Entry point de la aplicación FastAPI, lifespan, CORS y rutas /api/v1
│   ├── seed.py                     # Script CLI de inicialización delegando en SeedService
│   ├── requirements.txt            # Dependencias fijadas del proyecto (incluye email-validator)
│   ├── docker-compose.yml          # Contenedor PostgreSQL 16
│   └── .env.example                # Plantilla de variables de entorno
├── project_context.md              # Estado arquitectónico y técnico del proyecto
├── README.md                       # Guía completa de instalación, despliegue y uso
└── .gitignore                      # Reglas de exclusión para Git y Python
```

---

## 4. Reglas de Negocio y Seguridad Implementadas

### A. Autenticación y Esquema de Seguridad
1. **Endpoint `POST /api/v1/auth/register`:**
   - Permite a cualquier nuevo usuario registrarse públicamente enviando `{ "name": "...", "email": "..." }`.
   - No requiere autenticación previa.
   - Retorna código `201 Created` con el ID asignado para su posterior uso en headers de autorización.
   - Valida unicidad de correo y nombre (409 Conflict si ya están registrados) y formato de correo electrónico (422).
2. **Endpoint `POST /api/v1/auth/login`:**
   - Permite al usuario iniciar sesión ingresando únicamente su correo electrónico `{ "email": "usuario@ejemplo.com" }`.
   - Retorna `{ "id": "<UUID>", "name": "...", "email": "..." }`.
   - Si el correo no existe, devuelve 404.
3. **Esquema de Autorización `APIKeyHeader`:**
   - Se utiliza `APIKeyHeader(name="X-User-Id", auto_error=False)`.
   - En Swagger UI se expone el botón global verde **"Authorize"** con el ícono de candado. Al ingresar el UUID del usuario una sola vez, Swagger adjunta `X-User-Id: <UUID>` en todas las peticiones a endpoints protegidos.
   - Si no se provee el header o el usuario no existe en la base de datos, el sistema retorna `401 Unauthorized`. Si el formato no es un UUID válido, retorna `400 Bad Request`.

### B. Categorías (Tableros)
1. Al crear una categoría (`POST /api/v1/categories`), el usuario autenticado se registra automáticamente en `Collaborator` con `ownership = True`.
2. Se genera de forma automática el estado inicial obligatorio `"BACKLOG"` con `order = 0`.
3. `GET /api/v1/categories` retorna las categorías registradas en JSON (Caso 1).

### C. Estados (`States`)
1. Solo el dueño del tablero (`ownership = True`) puede crear o eliminar estados.
2. Cada nuevo estado calcula su `order` automáticamente como $N$ (donde $N$ es la cantidad actual de estados de la categoría), manteniendo la correlación $0, 1, \dots, n-1$ sin huecos ni valores negativos.
3. El estado `"BACKLOG"` (o con `order = 0`) no puede ser eliminado bajo ninguna circunstancia (error 400 Bad Request).
4. Un estado que contiene tareas asociadas no puede ser eliminado (error 409 Conflict). Las tareas deben ser movidas previamente.
5. Al eliminar un estado sin tareas, los estados posteriores se reordenan restando 1 a su `order` para preservar la secuencia sin saltos.

### D. Colaboradores (`Collaborators`)
1. Solo el dueño del tablero puede invocar `POST /api/v1/categories/{id}/collaborators` pasando el correo `{ "email": "..." }`.
2. El usuario debe existir previamente en el sistema (404 si no se encuentra).
3. No se permiten duplicados en el mismo tablero (409 Conflict).

### E. Tareas (`Tasks`)
1. **Creación (`POST /api/v1/tasks`):**
   - Requiere ser colaborador o dueño del tablero.
   - Si no se especifica `status_id`, se asigna de manera predeterminada al estado `"BACKLOG"` (`order = 0`).
   - Si se especifica `status_id`, se valida que exista y pertenezca a la misma categoría (422 si no coincide).
   - El responsable (`responsible_id`) es opcional. Solo el dueño puede asignarlo y debe pertenecer a los colaboradores del tablero (422 si no es colaborador, 403 si intenta asignarlo un no-dueño).
2. **Transición de Estado y Edición (`PATCH /api/v1/tasks/{id}`):**
   - El dueño del tablero puede cambiar de estado y modificar cualquier campo de la tarea.
   - Un colaborador **solo puede cambiar el estado de las tareas que tenga asignadas** (`responsible_id == current_user.id`). Cualquier intento sobre otra tarea o sobre campos como título/descripción devuelve 403 Forbidden.
3. **Eliminación (`DELETE /api/v1/tasks/{id}`):**
   - Acción reservada exclusivamente al dueño del tablero (403 para colaboradores).
4. **Consulta y Filtros (`GET /api/v1/tasks` y `GET /api/v1/tasks/{id}`):**
   - Filtros soportados por query params: `category_id`, `status_id`, `responsible_id`, `skip`, `limit`.
   - Si se consulta una tarea inexistente (`GET /api/v1/tasks/99999`), retorna 404 con `{"detail": "Tarea no encontrada"}` sin errores 500 no controlados (Caso 5).

### F. Reseteo y Semilla de Base de Datos (`Seed`)
1. **Endpoint `POST /api/v1/seed`:** Ejecuta `Base.metadata.drop_all` y `create_all`, reiniciando el esquema limpio y cargando 3 usuarios demo, 3 tableros con sus estados en orden correlativo y 4 tareas de ejemplo.
2. **Script CLI `python seed.py`:** Reutiliza el mismo `SeedService` para ejecución manual desde terminal.
3. **Generación automática en arranque (`lifespan`):** Al levantar FastAPI (`uvicorn main:app`), el evento `lifespan` invoca `Base.metadata.create_all(bind=engine)`, asegurando que las tablas siempre existan sin requerir scripts manuales.
