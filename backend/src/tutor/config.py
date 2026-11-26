"""App settings, read from environment variables (prefix TUTOR_) or a .env file."""

from functools import lru_cache
from typing import Literal, Self

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from tutor.languages import get_language


class Settings(BaseSettings):
    """Every field is read from an env var named TUTOR_<FIELD>, e.g. TUTOR_ENVIRONMENT.

    default_language and default_level are required: there is no built-in fallback,
    so the app never silently assumes a target language. Startup fails with a clear
    error if they are missing, or if the level is not offered for that language.
    environment falls back to "local" because a wrong value there is harmless.
    """

    model_config = SettingsConfigDict(env_prefix="TUTOR_", env_file=".env", extra="ignore")

    environment: Literal["local", "test", "prod"] = "local"
    default_language: str
    default_level: str

    @model_validator(mode="after")
    def check_language_and_level(self) -> Self:
        profile = get_language(self.default_language)  # raises for unsupported codes
        if self.default_level not in profile.levels:
            raise ValueError(
                f"Level {self.default_level!r} is not offered for {profile.code!r}; "
                f"choose one of {list(profile.levels)}"
            )
        return self


def load_settings() -> Settings:
    """Build Settings from the environment. Use this instead of calling Settings() directly."""
    # Pyright sees required fields with no arguments and reports a missing-argument error.
    # pydantic-settings fills them from env vars at runtime, so the error is a false positive.
    return Settings()  # pyright: ignore[reportCallIssue]


@lru_cache
def get_settings() -> Settings:
    return load_settings()
