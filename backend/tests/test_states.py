from datetime import date, timedelta


def test_states_sequential_order_autoincrement(client, owner_user):
    headers = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Sprint Board"}, headers=headers)
    cat_id = cat_res.json()["id"]

    # Al crearse, BACKLOG tiene order 0
    # Añadir: "In Analysis" (order 1)
    s1 = client.post(f"/categories/{cat_id}/states", json={"name": "In Analysis"}, headers=headers)
    assert s1.status_code == 201
    assert s1.json()["order"] == 1

    # Añadir: "In Process" (order 2)
    s2 = client.post(f"/categories/{cat_id}/states", json={"name": "In Process"}, headers=headers)
    assert s2.status_code == 201
    assert s2.json()["order"] == 2

    # Añadir: "In Review" (order 3)
    s3 = client.post(f"/categories/{cat_id}/states", json={"name": "In Review"}, headers=headers)
    assert s3.status_code == 201
    assert s3.json()["order"] == 3

    # Añadir: "Deploy" (order 4)
    s4 = client.post(f"/categories/{cat_id}/states", json={"name": "Deploy"}, headers=headers)
    assert s4.status_code == 201
    assert s4.json()["order"] == 4

    # Verificar listado ordenado
    list_res = client.get(f"/categories/{cat_id}/states")
    assert list_res.status_code == 200
    states = list_res.json()
    assert len(states) == 5
    for idx, st in enumerate(states):
        assert st["order"] == idx


def test_cannot_delete_backlog_state(client, owner_user):
    headers = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Protected Board"}, headers=headers)
    cat_id = cat_res.json()["id"]

    states = client.get(f"/categories/{cat_id}/states").json()
    backlog_state = states[0]
    assert backlog_state["name"] == "BACKLOG"
    assert backlog_state["order"] == 0

    # Intentar eliminar BACKLOG -> 400 Bad Request
    del_res = client.delete(f"/states/{backlog_state['id']}", headers=headers)
    assert del_res.status_code == 400
    assert "BACKLOG no puede ser eliminado" in del_res.json()["detail"]


def test_cannot_delete_state_with_active_tasks(client, owner_user):
    headers = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Board With Tasks"}, headers=headers)
    cat_id = cat_res.json()["id"]

    # Crear estado adicional
    st_res = client.post(f"/categories/{cat_id}/states", json={"name": "In Progress"}, headers=headers)
    st_id = st_res.json()["id"]

    # Crear una tarea en ese estado
    task_payload = {
        "title": "Tarea Activa",
        "description": "Descripción",
        "due_date": str(date.today() + timedelta(days=2)),
        "category_id": cat_id,
        "status_id": st_id
    }
    task_res = client.post("/tasks", json=task_payload, headers=headers)
    assert task_res.status_code == 201

    # Intentar eliminar el estado que contiene tareas -> 409 Conflict
    del_res = client.delete(f"/states/{st_id}", headers=headers)
    assert del_res.status_code == 409
    assert "contiene" in del_res.json()["detail"].lower()


def test_delete_empty_state_reorders_subsequent(client, owner_user):
    headers = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Reorder Board"}, headers=headers)
    cat_id = cat_res.json()["id"]

    # Estados: BACKLOG (0), S1 (1), S2 (2)
    s1 = client.post(f"/categories/{cat_id}/states", json={"name": "State 1"}, headers=headers).json()
    s2 = client.post(f"/categories/{cat_id}/states", json={"name": "State 2"}, headers=headers).json()

    assert s1["order"] == 1
    assert s2["order"] == 2

    # Eliminar S1 (order 1)
    del_res = client.delete(f"/states/{s1['id']}", headers=headers)
    assert del_res.status_code == 204

    # Verificar que S2 ahora tiene order 1
    states = client.get(f"/categories/{cat_id}/states").json()
    assert len(states) == 2
    assert states[0]["name"] == "BACKLOG"
    assert states[0]["order"] == 0
    assert states[1]["name"] == "State 2"
    assert states[1]["order"] == 1
