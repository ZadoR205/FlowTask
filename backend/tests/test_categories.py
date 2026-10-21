import uuid


def test_create_category_with_backlog_state(client, owner_user):
    headers = {"X-User-Id": str(owner_user.id)}
    payload = {
        "name": "Proyecto Alpha",
        "description": "Tablero principal del sprint"
    }
    response = client.post("/categories", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Proyecto Alpha"
    assert "id" in data

    cat_id = data["id"]

    # Verificar que el estado BACKLOG se autogeneró con order 0
    detail_res = client.get(f"/categories/{cat_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert len(detail_data["states"]) == 1
    assert detail_data["states"][0]["name"] == "BACKLOG"
    assert detail_data["states"][0]["order"] == 0

    # Verificar que el usuario se registró como dueño
    assert len(detail_data["collaborators"]) == 1
    assert detail_data["collaborators"][0]["user_id"] == str(owner_user.id)
    assert detail_data["collaborators"][0]["ownership"] is True


def test_create_category_unauthorized(client):
    response = client.post("/categories", json={"name": "Sin Auth"})
    assert response.status_code == 401


def test_list_categories_endpoint(client, owner_user):
    # Caso 1: GET /categories debe retornar la lista de categorías registradas en formato JSON
    headers = {"X-User-Id": str(owner_user.id)}
    client.post("/categories", json={"name": "Tablero 1"}, headers=headers)
    client.post("/categories", json={"name": "Tablero 2"}, headers=headers)

    response = client.get("/categories")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 2


def test_delete_category_permissions(client, owner_user, external_user):
    headers_owner = {"X-User-Id": str(owner_user.id)}
    res = client.post("/categories", json={"name": "Para Borrar"}, headers=headers_owner)
    cat_id = res.json()["id"]

    # Usuario ajeno intenta borrar -> 403 Forbidden
    headers_external = {"X-User-Id": str(external_user.id)}
    del_res_ext = client.delete(f"/categories/{cat_id}", headers=headers_external)
    assert del_res_ext.status_code == 403

    # Dueño borra -> 204 No Content
    del_res_owner = client.delete(f"/categories/{cat_id}", headers=headers_owner)
    assert del_res_owner.status_code == 204

    # Verificar que ya no existe -> 404 Not Found
    get_res = client.get(f"/categories/{cat_id}")
    assert get_res.status_code == 404


def test_list_my_categories_endpoint(client, owner_user, external_user):
    headers_owner = {"X-User-Id": str(owner_user.id)}
    headers_ext = {"X-User-Id": str(external_user.id)}

    # Owner crea su tablero
    client.post("/categories", json={"name": "Tablero Dueño"}, headers=headers_owner)

    # External crea su tablero
    client.post("/categories", json={"name": "Tablero Externo"}, headers=headers_ext)

    # Owner solo debe ver su propio tablero en /categories/me
    res_owner = client.get("/categories/me", headers=headers_owner)
    assert res_owner.status_code == 200
    owner_cats = res_owner.json()
    owner_names = [c["name"] for c in owner_cats]
    assert "Tablero Dueño" in owner_names
    assert "Tablero Externo" not in owner_names

    # External solo debe ver su propio tablero
    res_ext = client.get("/categories/me", headers=headers_ext)
    assert res_ext.status_code == 200
    ext_cats = res_ext.json()
    ext_names = [c["name"] for c in ext_cats]
    assert "Tablero Externo" in ext_names
    assert "Tablero Dueño" not in ext_names

    # Sin auth responde 401
    res_unauth = client.get("/categories/me")
    assert res_unauth.status_code == 401

