# FlowTask - Backend API

API REST para el módulo interno de seguimiento de actividades y tableros colaborativos **FlowTask**, desarrollada con **FastAPI**, **SQLAlchemy 2.0** y **PostgreSQL**.

El sistema permite clasificar actividades por tableros (**Categorías**), definir flujos de estados dinámicos e independientes por tablero (**States**), incorporar miembros mediante invitaciones por correo (**Collaborators**) con roles de propiedad (**Ownership**), y gestionar el ciclo de vida de actividades (**Tasks**) con validaciones estrictas y control de acceso por rol.

---

## 🚀 Stack Tecnológico

* **Lenguaje:** Python 3.10+
* **Framework:** FastAPI
* **ORM:** SQLAlchemy v2.0 (sintaxis moderna `Mapped`, `mapped_column`, `relationship`, `select`)
* **Validaciones:** Pydantic v2 & Pydantic-Settings
* **Base de Datos:** PostgreSQL 16 (driver `psycopg` v3) / SQLite (in-memory para tests rápidos)
* **Servidor:** Uvicorn
* **Testing:** Pytest & HTTPX (`TestClient`)
* **Contenedores:** Docker & Docker Compose

---

## 🏛️ Arquitectura en Capas

El backend sigue rigurosamente el patrón de **Arquitectura en Capas** con separación nítida de responsabilidades:

```text
backend/
├── app/
│   ├── core/           # Configuración (.env) y dependencias de autenticación/headers
│   ├── database.py     # Engine de SQLAlchemy 2.0, SessionLocal y Depends(get_db)
│   ├── models/         # Modelos relacionales ORM (User, Collaborator, Category, State, Task)
│   ├── schemas/        # DTOs de validación y serialización Pydantic v2
│   ├── repositories/   # Capa pura de acceso a datos y consultas SQLAlchemy
│   ├── services/       # Lógica y reglas de negocio del dominio
│   └── routers/        # Controladores HTTP y endpoints REST
├── tests/              # Suite de pruebas automatizadas con SQLite en memoria
├── main.py             # Instancia FastAPI, CORS estricto y montaje de routers
├── seed.py             # Script de inicialización de datos base
├── requirements.txt    # Dependencias fijadas del proyecto
├── docker-compose.yml  # Servicio PostgreSQL 16
└── .env.example        # Plantilla de variables de entorno
```

---

## 📋 Requisitos Previos

* **Python 3.10** o superior instalado en el sistema.
* **Docker y Docker Compose** (recomendado para levantar PostgreSQL) o una instancia local de PostgreSQL activa.
* **Git** para clonar el repositorio.

---

## ⚙️ Guía de Instalación y Puesta en Marcha

### Paso 1: Clonar y situarse en la carpeta backend
```bash
cd backend
```

### Paso 2: Crear y activar un entorno virtual

**En Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**En Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Paso 3: Instalar dependencias
```bash
pip install -r requirements.txt
```

### Paso 4: Configurar variables de entorno
Copia el archivo `.env.example` como `.env`:
```bash
cp .env.example .env
```

Contenido por defecto de `.env`:
```env
PROJECT_NAME="FlowTask API"
VERSION="1.0.0"
API_V1_STR="/api/v1"
DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/flowtask_db"
CORS_ORIGINS="http://localhost:3000,http://localhost:5173,http://localhost:4200"
```

### Paso 5: Levantar PostgreSQL con Docker Compose
Si dispones de Docker, inicia el contenedor de base de datos en segundo plano:
```bash
docker compose up -d
```
> Esto iniciará un contenedor PostgreSQL 16 accesible en el puerto `5432` con usuario `postgres`, contraseña `postgres` y base de datos `flowtask_db`.

### Paso 6: Generación automática de esquema e inicio del servidor
FastAPI ejecuta automáticamente la creación de tablas en PostgreSQL mediante su evento `lifespan` al arrancar:
```bash
uvicorn main:app --reload --port 8000
```

La API estará lista y escuchando en:
* **API Base:** [http://localhost:8000](http://localhost:8000)
* **Documentación Interactiva Swagger (OpenAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Documentación ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Paso 7: Cargar datos iniciales de demo (Seed)
Puedes poblar o resetear por completo los datos de prueba de dos formas:

1. **Vía Endpoint HTTP (Recomendado):**
   Envía una petición `POST` a `/seed` o `/api/v1/seed` (disponible directamente desde Swagger UI en `/docs`). Esto resetea el esquema completo y carga 3 usuarios demo, 3 tableros, sus estados y 4 tareas de ejemplo.
2. **Vía Terminal CLI:**
   ```bash
   python seed.py
   ```

### Paso 8: Puesta en marcha de la aplicación Frontend (React + Vite)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```

La aplicación web estará disponible en [http://localhost:5173](http://localhost:5173).  
Permite iniciar sesión por correo o utilizar el botón **"Acceder con Cuentas Demo"** para probar instantáneamente los roles de **Admin**, **Carlos Dev** o **Ana Design**.

---

## 🧪 Ejecución de Pruebas Automatizadas

La suite de pruebas utiliza una base de datos SQLite en memoria (`sqlite:///:memory:`) para ejecutarse de forma aislada, ultrarrápida y sin requerir dependencias de red ni PostgreSQL levantado:

```bash
pytest -v
```

Cobertura de pruebas incluidas:
1. `test_categories.py`: Caso 1 (`GET /categories`), creación de tableros, asignación de dueño y autogeneración de estado `BACKLOG` con `order = 0`.
2. `test_states.py`: Cálculo automático del orden secuencial ($0, 1, 2\dots$), protección absoluta contra borrado de `BACKLOG`, rechazo de borrado de estados con tareas asociadas (HTTP 409) y reordenamiento automático de estados posteriores.
3. `test_collaborators.py`: Permiso exclusivo del dueño para agregar colaboradores por correo, rechazo a no dueños (HTTP 403), validación de emails inexistentes (HTTP 404) y duplicados (HTTP 409).
4. `test_tasks.py`: Casos 2, 3, 4 y 5. Creación con estado por defecto, validación de responsable colaborador, permisos de cambio de estado (dueño vs colaborador asignado vs colaborador no asignado), borrado seguro y 404 para tareas inexistentes.
5. `test_seed.py`: Verificación del reseteo DDL total y siembra de datos mediante `POST /seed` y `POST /api/v1/seed`.

---

## 🔑 Identificación de Usuarios y Autenticación

Para facilitar la interacción tanto en Swagger como en el Frontend o tests, los endpoints protegidos resuelven el usuario activo mediante cualquiera de los siguientes encabezados HTTP:

| Encabezado | Descripción | Ejemplo |
| :--- | :--- | :--- |
| `X-User-Email` | Correo del usuario registrado | `admin@flowtask.com` |
| `X-User-Id` | UUID del usuario registrado | `c0a80101-0000-0000-0000-000000000001` |

### Usuarios Poblados por Defecto (Seeder)
* **Admin:** `admin@flowtask.com` (Dueño de los tableros *Trabajo* y *Personal*)
* **Carlos Dev:** `carlos@flowtask.com` (Dueño del tablero *Urgente*, colaborador en *Trabajo*)
* **Ana Design:** `ana@flowtask.com` (Colaboradora en *Urgente*)

---

## 📖 Matriz de Reglas de Negocio y Permisos

| Acción | Dueño del Tablero (`ownership = True`) | Colaborador Asignado | Colaborador NO Asignado |
| :--- | :---: | :---: | :---: |
| Crear Tarea en el Tablero | ✅ Permitido | ✅ Permitido | ❌ 403 Forbidden |
| Asignar / Cambiar Responsable | ✅ Permitido (solo a colaboradores) | ❌ 403 Forbidden | ❌ 403 Forbidden |
| Cambiar Estado de la Tarea (`PATCH /tasks/{id}`) | ✅ Permitido | ✅ **Permitido** | ❌ 403 Forbidden |
| Editar Título / Descripción / Fecha de la Tarea | ✅ Permitido | ❌ 403 Forbidden | ❌ 403 Forbidden |
| Eliminar Tarea (`DELETE /tasks/{id}`) | ✅ Permitido | ❌ 403 Forbidden | ❌ 403 Forbidden |
| Crear / Eliminar Estados del Tablero | ✅ Permitido | ❌ 403 Forbidden | ❌ 403 Forbidden |
| Añadir Colaboradores al Tablero por Correo | ✅ Permitido | ❌ 403 Forbidden | ❌ 403 Forbidden |
| Eliminar Estado `BACKLOG` (`order = 0`) | ❌ **Bloqueado (400)** | ❌ Bloqueado | ❌ Bloqueado |
| Eliminar Estado con Tareas Asociadas | ❌ **Bloqueado (409)** | ❌ Bloqueado | ❌ Bloqueado |

---

## 📡 Catálogo de Endpoints Principales

Todos los endpoints están disponibles tanto en la raíz (ej. `/tasks`) como con el prefijo de versión `/api/v1` (ej. `/api/v1/tasks`).

### Categorías (Tableros)
* `GET /api/v1/categories` - Lista todas las categorías (Caso 1 de listado general).
* `GET /api/v1/categories/me` - Lista **únicamente los tableros accesibles** para el usuario autenticado (`X-User-Id`), ya sea como dueño o colaborador.
* `POST /api/v1/categories` - Crea un nuevo tablero (Header `X-User-Id` requerido). Genera el estado `BACKLOG` y asigna al creador como dueño.
* `GET /api/v1/categories/{id}` - Obtiene el detalle del tablero, incluyendo sus estados ordenados y sus colaboradores.
* `DELETE /api/v1/categories/{id}` - Elimina el tablero (Solo dueño).

### Estados (States)
* `POST /categories/{id}/states` - Crea un nuevo estado con order correlativo automático (Solo dueño).
* `GET /categories/{id}/states` - Lista los estados de un tablero ordenados por su orden.
* `DELETE /states/{id}` - Elimina un estado si no es `BACKLOG` y no tiene tareas (Solo dueño). Reordena automáticamente los estados siguientes.

### Colaboradores
* `POST /categories/{id}/collaborators` - Invita a un usuario por correo `{ "email": "..." }` al tablero (Solo dueño).
* `GET /categories/{id}/collaborators` - Lista los colaboradores de un tablero con su rol de propiedad.

### Tareas (Tasks)
* `POST /tasks` - Crea una nueva tarea (Caso 2). Si no se envía `status_id`, se asigna por defecto a `BACKLOG`.
* `GET /tasks` - Lista tareas con filtros reactivos: `?category_id=...&status_id=...&responsible_id=...` (Caso 3).
* `GET /tasks/{id}` - Retorna el detalle de una tarea. Si no existe, devuelve HTTP 404 `{"detail": "Tarea no encontrada"}` (Caso 5).
* `PATCH /tasks/{id}` - Modifica campos o cambia de estado rápidamente (Caso 4). Valida permisos según sea dueño o responsable asignado.
* `DELETE /tasks/{id}` - Elimina una tarea (Caso 4, Solo dueño).

### Autenticación y Usuarios
* `POST /api/v1/auth/register` - Registro público de nuevas cuentas de usuario (`name`, `email`).
* `POST /api/v1/auth/login` - Inicio de sesión por correo electrónico para obtener el identificador de usuario (`X-User-Id`).
* `GET /api/v1/users` - Lista todos los usuarios registrados.
* `GET /api/v1/users/{id}` - Obtiene los datos de un usuario por su ID.
