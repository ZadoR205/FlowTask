def test_owner_can_add_collaborator(client, owner_user, collab_user):
    headers_owner = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Team Board"}, headers=headers_owner)
    cat_id = cat_res.json()["id"]

    # Dueño añade colaborador por email
    add_res = client.post(
        f"/categories/{cat_id}/collaborators",
        json={"email": collab_user.email},
        headers=headers_owner
    )
    assert add_res.status_code == 201
    data = add_res.json()
    assert data["user_id"] == str(collab_user.id)
    assert data["ownership"] is False


def test_non_owner_cannot_add_collaborator(client, owner_user, collab_user, external_user):
    headers_owner = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Private Board"}, headers=headers_owner)
    cat_id = cat_res.json()["id"]

    # Usuario no dueño intenta invitar
    headers_ext = {"X-User-Id": str(external_user.id)}
    res = client.post(
        f"/categories/{cat_id}/collaborators",
        json={"email": collab_user.email},
        headers=headers_ext
    )
    assert res.status_code == 403


def test_add_nonexistent_user_email(client, owner_user):
    headers_owner = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Board"}, headers=headers_owner)
    cat_id = cat_res.json()["id"]

    res = client.post(
        f"/categories/{cat_id}/collaborators",
        json={"email": "nobody@nowhere.com"},
        headers=headers_owner
    )
    assert res.status_code == 404


def test_add_duplicate_collaborator_fails(client, owner_user, collab_user):
    headers_owner = {"X-User-Id": str(owner_user.id)}
    cat_res = client.post("/categories", json={"name": "Board"}, headers=headers_owner)
    cat_id = cat_res.json()["id"]

    # Agregar por primera vez
    client.post(
        f"/categories/{cat_id}/collaborators",
        json={"email": collab_user.email},
        headers=headers_owner
    )

    # Intentar agregar de nuevo -> 409 Conflict
    res_dup = client.post(
        f"/categories/{cat_id}/collaborators",
        json={"email": collab_user.email},
        headers=headers_owner
    )
    assert res_dup.status_code == 409
