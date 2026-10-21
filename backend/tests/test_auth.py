def test_register_success(client):
    # Registro exitoso de una nueva cuenta
    payload = {
        "name": "Nuevo Usuario",
        "email": "nuevo@flowtask.com"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["name"] == payload["name"]
    assert data["email"] == payload["email"]


def test_register_duplicate_email(client, owner_user):
    # Intento de registro con email ya existente (409 Conflict)
    payload = {
        "name": "Otro Nombre",
        "email": owner_user.email
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 409
    assert "correo electrónico" in response.json()["detail"]


def test_register_duplicate_name(client, owner_user):
    # Intento de registro con nombre de usuario ya existente (409 Conflict)
    payload = {
        "name": owner_user.name,
        "email": "diferente@flowtask.com"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 409
    assert "nombre de usuario" in response.json()["detail"]


def test_register_invalid_email_format(client):
    # Validación de formato de correo con Pydantic (422)
    payload = {
        "name": "Usuario Test",
        "email": "formato-invalido"
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 422


def test_login_success(client, owner_user):
    # Login exitoso con email existente
    response = client.post("/auth/login", json={"email": owner_user.email})
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(owner_user.id)
    assert data["email"] == owner_user.email
    assert data["name"] == owner_user.name


def test_login_user_not_found(client):
    # Intento de login con correo no registrado
    response = client.post("/auth/login", json={"email": "inexistente@flowtask.com"})
    assert response.status_code == 404
    assert "No existe ningún usuario registrado" in response.json()["detail"]


def test_login_invalid_email_format(client):
    # Formato de correo inválido
    response = client.post("/auth/login", json={"email": "correo-invalido"})
    assert response.status_code == 422
