from pathlib import Path

import pytest
from pydantic import ValidationError

from tutor.config import Settings


@pytest.fixture(autouse=True)
def no_dotenv(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    # Run from an empty folder so a developer's local backend/.env can't affect these tests.
    monkeypatch.chdir(tmp_path)


def test_settings_read_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TUTOR_ENVIRONMENT", "prod")
    assert Settings().environment == "prod"


def test_environment_falls_back_to_local(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("TUTOR_ENVIRONMENT", raising=False)
    assert Settings().environment == "local"


def test_unknown_environment_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TUTOR_ENVIRONMENT", "staging")
    with pytest.raises(ValidationError):
        Settings()


def test_settings_have_no_default_language_or_level() -> None:
    # The target language and level come from the learner (later: their saved choice),
    # never from app config. See docs/adr/0001-language-agnostic-core.md.
    fields = Settings.model_fields
    assert "default_language" not in fields
    assert "default_level" not in fields
