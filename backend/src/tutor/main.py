"""FastAPI entry point.

Run locally:  uv run uvicorn tutor.main:app --reload
"""

from fastapi import FastAPI
from pydantic import BaseModel

from tutor.config import get_settings
from tutor.languages import LANGUAGES
from tutor.routers import conversations


class HealthResponse(BaseModel):
    status: str
    environment: str


class LevelOut(BaseModel):
    code: str
    rank: int  # 1 for the easiest level of the language's level system


class LanguageOut(BaseModel):
    code: str
    name: str
    native_name: str
    level_system: str
    levels: list[LevelOut]  # easiest first


def create_app() -> FastAPI:
    app = FastAPI(title="Language Tutor Bot", version="0.1.0")

    @app.get("/health")
    def health() -> HealthResponse:  # pyright: ignore[reportUnusedFunction]
        return HealthResponse(status="ok", environment=get_settings().environment)

    @app.get("/languages")
    def languages() -> list[LanguageOut]:  # pyright: ignore[reportUnusedFunction]
        return [
            LanguageOut(
                code=p.code,
                name=p.name,
                native_name=p.native_name,
                level_system=p.level_system.name,
                levels=[
                    LevelOut(code=level, rank=p.level_system.rank(level)) for level in p.levels
                ],
            )
            for p in LANGUAGES.values()
        ]

    app.include_router(conversations.router)

    # Spec 001 (echo endpoint) is yours to hand-write. See specs/001-echo-endpoint.md.

    return app


app = create_app()
