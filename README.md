# FlowTask - Fullstack App (Backend + Frontend + Base de Datos)

Aplicación modular de seguimiento de actividades y tableros colaborativos **FlowTask**, compuesta por un backend con **FastAPI**, **SQLAlchemy 2.0** y **PostgreSQL**, junto a un frontend reactivo con **React 18**, **TypeScript**, **Tailwind CSS** y **Nginx**.

El sistema permite clasificar actividades por tableros (**Categorías**), definir flujos de estados dinámicos e independientes por tablero (**States**), incorporar miembros mediante invitaciones por correo (**Collaborators**) con roles de propiedad (**Ownership**), y gestionar el ciclo de vida de actividades (**Tasks**) con validaciones estrictas y control de acceso por rol.

---

## Stack

- **Backend:** Python 3.10+ / 3.11, FastAPI, SQLAlchemy v2.0, Pydantic v2, Uvicorn
- **Base de Datos:** PostgreSQL 16 (driver `psycopg` v3) / SQLite (in-memory para suite de pruebas)
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS (diseño táctil Stitch)
- **Servidor Web Producción:** Nginx Alpine
- **Testing:** Pytest & HTTPX (`TestClient`)
- **Contenedores:** Docker & Docker Compose

---

## Despliegue Rápido con Docker Compose

Puedes levantar todo el ecosistema (Base de Datos + Backend API + Frontend Web) con un solo comando desde la raíz del proyecto:

### 1. (Opcional) Configurar variables de entorno

```bash
cp .env.example .env
```

> Si omites este paso, Docker Compose utilizará los valores por defecto definidos en el archivo (`flowtask_db`, usuario `postgres` y puerto `8000` para la API).

### 2. Construir e iniciar todos los servicios

```bash
docker compose up --build -d
```

### 3. Acceso a los servicios

Una vez que los contenedores estén levantados:

- **Frontend Web (React + Nginx):** [http://localhost:5173](http://localhost:5173)
- **Backend API REST:** [http://localhost:8000](http://localhost:8000)
- **Documentación Interactiva Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Base de Datos PostgreSQL:** `localhost:5432` (BD: `flowtask_db`, Usuario: `postgres`)

### 4. Semilla de datos de prueba (Seed)

Una vez en el Frontend, puedes presionar el botón **"Semilla BD"** en la barra superior o hacer `POST http://localhost:8000/api/v1/seed` desde Swagger para cargar los usuarios y tableros demo.

### 5. Comandos útiles

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Detener todos los servicios
docker compose down

# Detener y borrar volúmenes de base de datos
docker compose down -v
```

---

## Guía de Instalación y Desarrollo Local Manual (Sin Docker)

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

- **API Base:** [http://localhost:8000](http://localhost:8000)
- **Documentación Interactiva Swagger (OpenAPI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Documentación ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Paso 7: Correr el frontend

En una nueva terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación web estará disponible en [http://localhost:5173](http://localhost:5173).  
Permite iniciar sesión por correo o utilizar el botón **"Acceder con Cuentas Demo"** para probar instantáneamente los roles de **Admin**, **Carlos Dev** o **Ana Design**.

---

## Ejecución de Pruebas Automatizadas

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

## Identificación de Usuarios y Autenticación

Para facilitar la interacción tanto en Swagger como en el Frontend o tests, los endpoints protegidos resuelven el usuario activo mediante el siguiente encabezado HTTP:

| Encabezado  | Descripción                 | Ejemplo                                |
| :---------- | :-------------------------- | :------------------------------------- |
| `X-User-Id` | UUID del usuario registrado | `c0a80101-0000-0000-0000-000000000001` |

### Usuarios Poblados por Defecto (Seeder)

- **Admin:** `admin@flowtask.com` (Dueño de los tableros _Trabajo_ y _Personal_)
- **Carlos Dev:** `carlos@flowtask.com` (Dueño del tablero _Urgente_, colaborador en _Trabajo_)
- **Ana Design:** `ana@flowtask.com` (Colaboradora en _Urgente_)

---
