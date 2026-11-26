import pytest
from fastapi.testclient import TestClient

from tutor.languages import get_language
from tutor.main import create_app


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


def test_health(client: TestClient) -> None:
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_languages_lists_german_a1(client: TestClient) -> None:
    resp = client.get("/languages")
    assert resp.status_code == 200
    codes = {lang["code"]: lang for lang in resp.json()}
    assert codes["de"]["levels"] == ["A1"]


def test_unknown_language_raises() -> None:
    with pytest.raises(ValueError, match="Unsupported language"):
        get_language("xx")
