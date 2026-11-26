"""Spec 006: the grammar topics API contract (answers 501 until the hand-written logic exists)."""

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


def test_topics_are_not_implemented_yet(client: TestClient, supported: tuple[str, str]) -> None:
    code, level = supported
    resp = client.get("/grammar/topics", params={"language": code, "level": level})
    assert resp.status_code == 501
    assert resp.json()["detail"] == "Grammar topics are not written yet"


def test_topics_reject_unsupported_language(client: TestClient) -> None:
    resp = client.get("/grammar/topics", params={"language": "xx", "level": "L1"})
    assert resp.status_code == 422


def test_topics_reject_level_outside_the_language(
    client: TestClient, supported: tuple[str, str]
) -> None:
    code, _ = supported
    resp = client.get("/grammar/topics", params={"language": code, "level": "no-such-level"})
    assert resp.status_code == 422


def test_openapi_lists_grammar_topic_out(client: TestClient) -> None:
    schemas = client.get("/openapi.json").json()["components"]["schemas"]
    topic = schemas["GrammarTopicOut"]
    expected = {"id", "title", "example", "times_learned", "best_score", "passed"}
    assert expected <= set(topic["properties"])
    # best_score is nullable: anyOf [ScoreOut, null]
    kinds = [option.get("type") for option in topic["properties"]["best_score"]["anyOf"]]
    assert "null" in kinds
