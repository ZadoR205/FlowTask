# FlowTask

Módulo ligero de seguimiento de actividades y tableros colaborativos (FastAPI + PostgreSQL + React).

---

## Requisitos

- **Con Docker:** Docker y Docker Compose v2+.
- **Sin Docker (Local):**
  - Python 3.10+
  - Node.js 18+ y npm
  - PostgreSQL 16 (o Docker solo para la base de datos)

---

## Ejecución con Docker (Recomendado)

Inicia todos los servicios (Base de datos, Backend y Frontend) con un solo comando:

```bash
docker compose up --build
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API & Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL:** `localhost:5432`

---

## Ejecución Normal (Desarrollo Local)

### 1. Base de Datos

Si no tienes PostgreSQL instalado localmente, puedes levantar solo el contenedor de base de datos:

```bash
docker compose up db -d
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

---

## Usuarios Poblados por Defecto (Seed Data)

Puedes sembrar o resetear los datos demo con el botón **"Seed Data"** en el frontend o mediante `POST http://localhost:8000/api/v1/seed`:

| Usuario        | Correo                | Rol / Tableros                                   |
| :------------- | :-------------------- | :----------------------------------------------- |
| **Admin**      | `admin@flowtask.com`  | Dueño de _"Trabajo"_ y _"Personal"_              |
| **Carlos Dev** | `carlos@flowtask.com` | Dueño de _"Urgente"_, colaborador en _"Trabajo"_ |
| **Ana Design** | `ana@flowtask.com`    | Colaboradora en _"Urgente"_                      |

---

## Ejecución de Pruebas Automatizadas

La suite de pruebas utiliza una base de datos SQLite en memoria (`sqlite:///:memory:`) para ejecutarse de forma aislada, ultrarrápida y sin requerir dependencias de red ni PostgreSQL levantado:

```bash
pytest -v
```

Cobertura de pruebas incluidas:

1. `test_categories.py`: (`GET /categories`), creación de tableros, asignación de dueño y autogeneración de estado `BACKLOG` con `order = 0`.
2. `test_states.py`: Cálculo automático del orden secuencial ($0, 1, 2\dots$), protección absoluta contra borrado de `BACKLOG`, rechazo de borrado de estados con tareas asociadas (HTTP 409) y reordenamiento automático de estados posteriores.
3. `test_collaborators.py`: Permiso exclusivo del dueño para agregar colaboradores por correo, rechazo a no dueños (HTTP 403), validación de emails inexistentes (HTTP 404) y duplicados (HTTP 409).
4. `test_tasks.py`: Creación con estado por defecto, validación de responsable colaborador, permisos de cambio de estado (dueño vs colaborador asignado vs colaborador no asignado), borrado seguro y 404 para tareas inexistentes.
5. `test_seed.py`: Verificación del reseteo DDL total y siembra de datos mediante `POST /seed` y `POST /api/v1/seed`.

---

## Decisiones de Diseño y Arquitectura

Para la arquitectura del backend se siguió la estructura especificada (arquitectura en capas) en el documento de prueba técnica.

1. **Decisiones de Diseño:** <br>
   Dado que en las instrucciones no había demasiado detalle del comportamiento, más que de manejo de errores y restricciones, y se especifica que es para uso de un pequeño equipo. Tomé ciertas libertades y opté permitir que los usuarios puedan crear y gestionar sus propios tableros o "Categorias" y estados para los mismos. Estos tableros pueden ser compartidos con otros usuarios. El sistema guarda la relación del usuario con el tablero para definir los comportamientos de "dueño" o "colaborador" dentro del mismo. Donde solo el dueño tiene permiso para agregar colaboradores, crear estados, tareas y asignar responsabilidades. El responsable de una tarea es el único que puede cambiar el estado de la misma, con excepción del dueño que tiene permiso para hacerlo sobre cualquier tarea del tablero.

   De esta forma el sistema permite cierta flexibilidad para la gestión de tareas dentro de un equipo, sin perder el control de la administración de los tableros.

   Hay un sistema sencillo de autenticación, que por falta de tiempo y para mantener simplicidad a la hora del desarrollo no se usó jwt o gestion de sesiones compleja, si no que se utiliza el propio id del usuario logueado para obtener los datos del mismo, y validar permisos. Para realizar login se puede usar la ruta `POST /api/v1/auth/login` y se obtendrá el id del usuario, el cual se debe pasar en la cabecera de las siguientes peticiones como x-user-id.

   El diseño del frontend tomó inspiración de la aplicación web Trello. Cómo estaba permitiendo que los usuarios puedan añadir o eliminar libremente las columnas o estados de una tarea, quería que se viera e interactuara más como un tablero kanban. Cabe mencionar que el diseño cómo tal fue hecho en stitch.

2. **Decisiones de Arquitectura:** <br>
   Se optó por seguir la estructura especificada en el documento de prueba técnica, dividiendo el backend en capas de dominio, infraestructura y presentación.
   Las migraciones de la base de datos viven dentro de los modelos ORM, cuya migración se ejecuta dentro de la funcion lifespan de main.py.
   Para las pruebas unitarias se optó por usar una base de datos en memoria SQLite, sin embargo para la conexión final se utiliza PostgreSQL, esto debido a una decision personal de usar un estilo de base de datos más parecido a un entorno real de la aplicación puesto que no tendría sentido que opere mediante usuarios utilizando una base de datos en memoria. Pese a que entiendo que la arquitectura en si misma permitiría el uso de diferentes bases de datos sin demasiados cambios.

   Para el frontend se decidio usar React con Vite, Tailwind CSS y TypeScript con la librería de Tailwind CSS. La estructuración del frontend es una arquitectura modular basada en componentes y orientada responsabilidades. Con una capa de dominio y contratos (types), de servicios, de contexto donde viven la sesion de usuario y los toasts y la de presentacion que contiene todas las interfaces de usuario. Para evitar que tras cada cambio se tuviera que recargar la pagina se optó por aplicar los cambios directamente sobre el estado en memoria de react utilizando la respuesta del API, para mantener la consistencia del estado.

3. **Uso de IA:** <br>
   Se trabajo en el IDE Antigravity con el modelo de Gemini 3.8 flash. Su uso fue estrictamente para la generación de tests y para la corrección de errores en el código en backend. Además de delegacion de tareas repetitivas o menores como refactorizaciones, aplicar estilos o completar implementaciones de funciones ya definidas. Todas las decisiones de negocio, funcionalidades, arquitectura y mitigación a errores fueron tomadas y analizadas por mí. Asímismo el diseño de la base de datos fue hecho a mano cuyo modelo se puede ver en [dbdiagram.io](https://dbdiagram.io/d/Reto-Full-Stack-6a9aec985450bea1bef1f2d1)
