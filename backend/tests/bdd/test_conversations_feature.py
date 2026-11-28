"""Step definitions for features/003-conversation-chat.feature (the conversation API contract).

The endpoints are stubs, so a valid request answers 501 until the owner writes the logic.
The steps take a supported language and its levels from the registry, so no real language is named.
"""

import httpx
from fastapi.testclient import TestClient
from pytest_bdd import parsers, scenarios, then, when

from tutor.languages import LANGUAGES
from tutor.main import create_app

scenarios("003-conversation-chat.feature")

# A code that is not in the registry. Not a real language code (ISO 639 reserves qaa-qtz).
UNSUPPORTED_LANGUAGE = "qzz"


def _language(phrase: str) -> str:
    if phrase == "a supported language":
        return next(iter(LANGUAGES.values())).code
    if phrase == "an unsupported language":
        return UNSUPPORTED_LANGUAGE
    raise ValueError(f"Unknown language phrase {phrase!r}")


def _level(phrase: str, language: str) -> str:
    if phrase == "one of its levels":
        return LANGUAGES[language].levels[0]
    if phrase == "a level it does not have":
        return "no-such-level"
    if phrase == "any level (ignored)":
        return "L1"
    raise ValueError(f"Unknown level phrase {phrase!r}")


def _message(phrase: str) -> str:
    messages = {
        'the text "Hello"': "Hello",
        "an empty message": "",
        "only spaces": "     ",
        "500 characters": "a" * 500,
        "501 characters": "a" * 501,
        "500 characters with spaces around them": "  " + "a" * 500 + "  ",
    }
    return messages[phrase]


@when(
    parsers.parse("a client starts a conversation in {language} at {level}"),
    target_fixture="response",
)
def start_conversation(language: str, level: str) -> httpx.Response:
    code = _language(language)
    body = {"language": code, "level": _level(level, code)}
    return TestClient(create_app()).post("/conversations", json=body)


@when(parsers.parse("a client sends a turn with {message}"), target_fixture="response")
def send_turn(message: str) -> httpx.Response:
    body = {"message": _message(message)}
    return TestClient(create_app()).post("/conversations/c-1/turns", json=body)


@then(parsers.parse("the API answers {status:d}"))
def check_status(response: httpx.Response, status: int) -> None:
    assert response.status_code == status
