"""App settings, read from environment variables (prefix TUTOR_) or a .env file."""

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Every field is read from an env var named TUTOR_<FIELD>, e.g. TUTOR_ENVIRONMENT.

    The values below are only fallbacks for local development when the env var is unset.
    Real deployments set them through the environment (Lambda config, CI secrets).
    """

    model_config = SettingsConfigDict(env_prefix="TUTOR_", env_file=".env", extra="ignore")

    environment: Literal["local", "test", "prod"] = "local"
    default_language: str = "de"
    default_level: str = "A1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
