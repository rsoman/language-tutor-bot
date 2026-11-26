"""Spec 004: the word lookup API contract (answers 501 until the hand-written lookup exists)."""

import pytest
from fastapi.testclient import TestClient

from tutor.languages import LANGUAGES
from tutor.main import create_app


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


@pytest.fixture
def supported() -> tuple[str, str]:
    """Any supported language code and one of its levels, taken from the registry."""
    profile = next(iter(LANGUAGES.values()))
    return profile.code, profile.levels[0]


def lookup(client: TestClient, language: str, level: str, query: str) -> int:
    params = {"language": language, "level": level, "query": query}
    return client.get("/words/lookup", params=params).status_code


def test_lookup_is_not_implemented_yet(client: TestClient, supported: tuple[str, str]) -> None:
    code, level = supported
    resp = client.get("/words/lookup", params={"language": code, "level": level, "query": "x"})
    assert resp.status_code == 501
    assert resp.json()["detail"] == "Word lookup is not written yet"


def test_lookup_rejects_unsupported_language(client: TestClient) -> None:
    assert lookup(client, "xx", "L1", "word") == 422


def test_lookup_rejects_level_outside_the_language(
    client: TestClient, supported: tuple[str, str]
) -> None:
    code, _ = supported
    assert lookup(client, code, "no-such-level", "word") == 422


def test_lookup_rejects_empty_query(client: TestClient, supported: tuple[str, str]) -> None:
    code, level = supported
    assert lookup(client, code, level, "") == 422


def test_lookup_rejects_query_over_60_characters(
    client: TestClient, supported: tuple[str, str]
) -> None:
    code, level = supported
    assert lookup(client, code, level, "a" * 61) == 422


def test_openapi_lists_word_out_with_features(client: TestClient) -> None:
    schemas = client.get("/openapi.json").json()["components"]["schemas"]
    assert "WordOut" in schemas
    feature_ref = schemas["WordOut"]["properties"]["features"]["items"]["$ref"]
    feature = schemas[feature_ref.split("/")[-1]]
    assert set(feature["properties"]) == {"name", "value"}
