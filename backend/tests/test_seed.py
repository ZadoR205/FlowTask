from fastapi import status


def test_seed_endpoint_success(client):
    """
    Verifica que el endpoint POST /seed resetea y puebla la base de datos
    con los datos de demo y responde HTTP 200 OK.
    """
    response = client.post("/seed")
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["message"] == "Base de datos reseteada y sembrada con éxito"
    assert data["users"] == 3
    assert data["categories"] == 3
    assert data["states"] == 10
    assert data["tasks"] == 4

    # Verificar que los datos son inmediatamente accesibles vía API
    categories_res = client.get("/categories")
    assert categories_res.status_code == status.HTTP_200_OK
    categories = categories_res.json()
    assert len(categories) == 3
    names = [c["name"] for c in categories]
    assert "Trabajo" in names
    assert "Personal" in names
    assert "Urgente" in names


def test_seed_endpoint_with_api_v1_prefix(client):
    """
    Verifica que el endpoint también responda bajo el prefijo /api/v1/seed.
    """
    response = client.post("/api/v1/seed")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["users"] == 3
