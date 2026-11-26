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
    monkeypatch.setenv("TUTOR_DEFAULT_LEVEL", "A2")
    settings = Settings()
    assert settings.environment == "prod"
    assert settings.default_level == "A2"


def test_settings_fall_back_to_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("TUTOR_ENVIRONMENT", raising=False)
    assert Settings().environment == "local"


def test_unknown_environment_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("TUTOR_ENVIRONMENT", "staging")
    with pytest.raises(ValidationError):
        Settings()
