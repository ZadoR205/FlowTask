import uuid
from datetime import date, timedelta


def setup_board_and_collaborator(client, owner_user, collab_user):
    headers_owner = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Dev Board"}, headers=headers_owner)
    cat_id = cat_res.json()["id"]

    # Agregar collab_user al tablero
    client.post(
        f"/categories/{cat_id}/collaborators",
        json={"email": collab_user.email},
        headers=headers_owner
    )

    # Crear estado "En Progreso"
    st_res = client.post(
        f"/categories/{cat_id}/states",
        json={"name": "En Progreso"},
        headers=headers_owner
    )
    st_progreso_id = st_res.json()["id"]

    # Obtener estado BACKLOG
    detail = client.get(f"/categories/{cat_id}").json()
    backlog_id = next(s["id"] for s in detail["states"] if s["name"] == "BACKLOG")

    return cat_id, backlog_id, st_progreso_id


def test_create_task_defaults_to_backlog(client, owner_user, collab_user):
    cat_id, backlog_id, _ = setup_board_and_collaborator(client, owner_user, collab_user)
    headers = {"X-User-Id": str(owner_user.id)}

    # Caso 2: Crear tarea sin especificar status_id -> debe asignarse a BACKLOG
    payload = {
        "title": "Aprender FastAPI",
        "description": "Estudiar SQLAlchemy 2.0 y routers",
        "due_date": str(date.today() + timedelta(days=3)),
        "category_id": cat_id
    }
    response = client.post("/tasks", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Aprender FastAPI"
    assert data["status_id"] == backlog_id
    assert data["status"]["name"] == "BACKLOG"
    assert data["category_name"] == "Dev Board"


def test_create_task_nonexistent_category_returns_404(client, owner_user):
    headers = {"X-User-Id": str(owner_user.id)}
    payload = {
        "title": "Tarea Huérfana",
        "description": "Sin categoría válida",
        "due_date": str(date.today()),
        "category_id": str(uuid.uuid4())
    }
    response = client.post("/tasks", json=payload, headers=headers)
    assert response.status_code == 404
    assert "Categoría no encontrada" in response.json()["detail"]


def test_create_task_empty_title_fails_validation(client, owner_user, collab_user):
    cat_id, _, _ = setup_board_and_collaborator(client, owner_user, collab_user)
    headers = {"X-User-Id": str(owner_user.id)}
    payload = {
        "title": "",  # Vacío
        "description": "Descripción",
        "due_date": str(date.today()),
        "category_id": cat_id
    }
    response = client.post("/tasks", json=payload, headers=headers)
    assert response.status_code == 422


def test_create_task_with_responsible_validation(client, owner_user, collab_user, external_user):
    cat_id, _, _ = setup_board_and_collaborator(client, owner_user, collab_user)
    headers_owner = {"X-User-Id": str(owner_user.id)}

    # Asignar a usuario que NO es colaborador del tablero -> 422
    payload_invalid = {
        "title": "Tarea Mal Asignada",
        "description": "Usuario externo no pertenece",
        "due_date": str(date.today()),
        "category_id": cat_id,
        "responsible_id": str(external_user.id)
    }
    res_inv = client.post("/tasks", json=payload_invalid, headers=headers_owner)
    assert res_inv.status_code == 422

    # Asignar a colaborador válido -> 201
    payload_valid = {
        "title": "Tarea Asignada",
        "description": "Colaborador verificado",
        "due_date": str(date.today()),
        "category_id": cat_id,
        "responsible_id": str(collab_user.id)
    }
    res_val = client.post("/tasks", json=payload_valid, headers=headers_owner)
    assert res_val.status_code == 201
    assert res_val.json()["responsible_id"] == str(collab_user.id)
    assert res_val.json()["responsible"]["email"] == collab_user.email


def test_list_tasks_and_filtering(client, owner_user, collab_user):
    # Caso 3: Tablero de tareas y filtros
    cat_id, backlog_id, st_progreso_id = setup_board_and_collaborator(client, owner_user, collab_user)
    headers = {"X-User-Id": str(owner_user.id)}

    client.post("/tasks", json={
        "title": "Tarea 1",
        "description": "D1",
        "due_date": str(date.today()),
        "category_id": cat_id,
        "status_id": backlog_id
    }, headers=headers)

    client.post("/tasks", json={
        "title": "Tarea 2",
        "description": "D2",
        "due_date": str(date.today()),
        "category_id": cat_id,
        "status_id": st_progreso_id
    }, headers=headers)

    # Listar todas
    res_all = client.get(f"/tasks?category_id={cat_id}")
    assert res_all.status_code == 200
    assert len(res_all.json()) == 2

    # Filtrar por status_id
    res_filtered = client.get(f"/tasks?status_id={st_progreso_id}")
    assert res_filtered.status_code == 200
    items = res_filtered.json()
    assert len(items) == 1
    assert items[0]["title"] == "Tarea 2"
    assert items[0]["status"]["name"] == "En Progreso"


def test_task_status_transition_permissions(client, owner_user, collab_user, external_user):
    # Caso 4: Transición de estados y permisos por rol
    cat_id, backlog_id, st_progreso_id = setup_board_and_collaborator(client, owner_user, collab_user)
    headers_owner = {"X-User-Id": str(owner_user.id)}

    # Crear tarea asignada a collab_user
    t1_res = client.post("/tasks", json={
        "title": "Tarea De Carlos",
        "description": "Asignada a Carlos",
        "due_date": str(date.today()),
        "category_id": cat_id,
        "responsible_id": str(collab_user.id)
    }, headers=headers_owner)
    t1_id = t1_res.json()["id"]

    # Crear tarea sin asignar
    t2_res = client.post("/tasks", json={
        "title": "Tarea Huérfana",
        "description": "Sin responsable",
        "due_date": str(date.today()),
        "category_id": cat_id
    }, headers=headers_owner)
    t2_id = t2_res.json()["id"]

    # 1. Colaborador PUEDE cambiar de estado su tarea asignada
    headers_collab = {"X-User-Id": str(collab_user.id)}
    patch_res = client.patch(f"/tasks/{t1_id}", json={"status_id": st_progreso_id}, headers=headers_collab)
    assert patch_res.status_code == 200
    assert patch_res.json()["status_id"] == st_progreso_id

    # 2. Colaborador NO PUEDE cambiar de estado una tarea NO asignada a él -> 403 Forbidden
    patch_fail = client.patch(f"/tasks/{t2_id}", json={"status_id": st_progreso_id}, headers=headers_collab)
    assert patch_fail.status_code == 403
    assert "Solo el responsable asignado" in patch_fail.json()["detail"]

    # 3. Colaborador NO PUEDE modificar título/descripción -> 403 Forbidden
    patch_title_fail = client.patch(f"/tasks/{t1_id}", json={"title": "Nuevo Titulo"}, headers=headers_collab)
    assert patch_title_fail.status_code == 403

    # 4. Dueño PUEDE cambiar cualquier tarea
    patch_owner = client.patch(f"/tasks/{t2_id}", json={"status_id": st_progreso_id}, headers=headers_owner)
    assert patch_owner.status_code == 200
    assert patch_owner.json()["status_id"] == st_progreso_id


def test_delete_task_permissions(client, owner_user, collab_user):
    cat_id, _, _ = setup_board_and_collaborator(client, owner_user, collab_user)
    headers_owner = {"X-User-Id": str(owner_user.id)}

    t_res = client.post("/tasks", json={
        "title": "Para Borrar",
        "description": "...",
        "due_date": str(date.today()),
        "category_id": cat_id
    }, headers=headers_owner)
    t_id = t_res.json()["id"]

    # Colaborador intenta borrar -> 403 Forbidden
    headers_collab = {"X-User-Id": str(collab_user.id)}
    del_collab = client.delete(f"/tasks/{t_id}", headers=headers_collab)
    assert del_collab.status_code == 403

    # Dueño borra -> 204 No Content
    del_owner = client.delete(f"/tasks/{t_id}", headers=headers_owner)
    assert del_owner.status_code == 204

    # Verificar que ya no existe -> 404
    assert client.get(f"/tasks/{t_id}").status_code == 404


def test_edge_case_get_nonexistent_task(client):
    # Caso 5: Consulta de recursos inexistentes debe devolver 404 {"detail": "Tarea no encontrada"}
    random_id = uuid.uuid4()
    response = client.get(f"/tasks/{random_id}")
    assert response.status_code == 404
    assert response.json() == {"detail": "Tarea no encontrada"}
