"""Spec 003: the conversation API contract.

The endpoints validate their input and answer 501 until the hand-written conversation
logic exists. These tests pin the contract the frontend is generated from.
"""

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


def test_start_conversation_is_not_implemented_yet(
    client: TestClient, supported: tuple[str, str]
) -> None:
    code, level = supported
    resp = client.post("/conversations", json={"language": code, "level": level})
    assert resp.status_code == 501
    assert resp.json()["detail"] == "Conversation logic is not written yet"


def test_start_conversation_rejects_unsupported_language(client: TestClient) -> None:
    resp = client.post("/conversations", json={"language": "xx", "level": "L1"})
    assert resp.status_code == 422


def test_start_conversation_rejects_level_outside_the_language(
    client: TestClient, supported: tuple[str, str]
) -> None:
    code, _ = supported
    resp = client.post("/conversations", json={"language": code, "level": "no-such-level"})
    assert resp.status_code == 422


def test_turn_rejects_empty_message(client: TestClient) -> None:
    resp = client.post("/conversations/c-1/turns", json={"message": ""})
    assert resp.status_code == 422


def test_turn_rejects_message_over_500_characters(client: TestClient) -> None:
    resp = client.post("/conversations/c-1/turns", json={"message": "a" * 501})
    assert resp.status_code == 422


def test_turn_is_not_implemented_yet(client: TestClient) -> None:
    resp = client.post("/conversations/c-1/turns", json={"message": "hello"})
    assert resp.status_code == 501


def test_openapi_lists_the_request_models(client: TestClient) -> None:
    # The response models are the tutor's LLM output, written by the owner (spec 003).
    schemas = client.get("/openapi.json").json()["components"]["schemas"]
    assert {"ConversationIn", "TurnIn"} <= set(schemas)
