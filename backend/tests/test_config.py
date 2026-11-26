from pathlib import Path

import pytest
from pydantic import ValidationError

from tests.conftest import SAMPLE_LANGUAGE, SAMPLE_LEVEL
from tutor.config import load_settings


@pytest.fixture(autouse=True)
def no_dotenv(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    # Run from an empty folder so a developer's local backend/.env can't affect these tests.
    monkeypatch.chdir(tmp_path)


def test_settings_read_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TUTOR_ENVIRONMENT", "prod")
    settings = load_settings()
    assert settings.environment == "prod"
    assert settings.default_language == SAMPLE_LANGUAGE.code
    assert settings.default_level == SAMPLE_LEVEL


def test_environment_falls_back_to_local(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("TUTOR_ENVIRONMENT", raising=False)
    assert load_settings().environment == "local"


def test_unknown_environment_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TUTOR_ENVIRONMENT", "staging")
    with pytest.raises(ValidationError):
        load_settings()


@pytest.mark.parametrize("var", ["TUTOR_DEFAULT_LANGUAGE", "TUTOR_DEFAULT_LEVEL"])
def test_language_and_level_are_required(monkeypatch: pytest.MonkeyPatch, var: str) -> None:
    monkeypatch.delenv(var)
    with pytest.raises(ValidationError):
        load_settings()


def test_unsupported_default_language_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TUTOR_DEFAULT_LANGUAGE", "xx")
    with pytest.raises(ValidationError, match="Unsupported language"):
        load_settings()


def test_level_outside_the_language_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TUTOR_DEFAULT_LEVEL", "not-a-level")
    with pytest.raises(ValidationError, match="not-a-level"):
        load_settings()
