"""App settings, read from environment variables (prefix TUTOR_) or a .env file."""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Every field is read from an env var named TUTOR_<FIELD>, e.g. TUTOR_ENVIRONMENT.

    There is deliberately no default target language or level here. Those come from the
    learner (later, the logged-in user's saved choice), not from app config.
    environment falls back to "local" because a wrong value there is harmless.
    """

    model_config = SettingsConfigDict(env_prefix="TUTOR_", env_file=".env", extra="ignore")

    environment: Literal["local", "test", "prod"] = "local"


@lru_cache
def get_settings() -> Settings:
    return Settings()
