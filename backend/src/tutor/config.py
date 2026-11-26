"""App settings, read from environment variables (prefix TUTOR_) or a .env file."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="TUTOR_", env_file=".env", extra="ignore")

    environment: str = "local"
    default_language: str = "de"
    default_level: str = "A1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
