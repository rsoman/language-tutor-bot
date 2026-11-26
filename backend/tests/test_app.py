import pytest
from fastapi.testclient import TestClient

from tutor.languages import LanguageProfile, LevelSystem, get_language
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


def test_languages_report_their_level_system(client: TestClient) -> None:
    resp = client.get("/languages")
    codes = {lang["code"]: lang for lang in resp.json()}
    assert codes["de"]["level_system"] == "CEFR"


def test_profile_rejects_levels_outside_its_system() -> None:
    # A made-up language with a non-CEFR scale, so no real language is hard-coded here.
    scale = LevelSystem(name="TestScale", levels=("L1", "L2", "L3"))
    LanguageProfile(code="xx", name="Test", native_name="Test", level_system=scale, levels=("L1",))
    with pytest.raises(ValueError, match="not part of TestScale"):
        LanguageProfile(
            code="xx", name="Test", native_name="Test", level_system=scale, levels=("A1",)
        )
