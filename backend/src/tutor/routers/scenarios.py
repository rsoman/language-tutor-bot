"""Scenarios API contract (spec 005).

Claude-generated boilerplate: models and an endpoint that validates its input and then
answers 501. Scenario content, recommendations and progress are hand-written by the owner.
"""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from tutor.routers.common import LanguageLevelIn

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

NOT_WRITTEN_YET = "Scenarios are not written yet"


class ScenariosQuery(LanguageLevelIn):
    """The learner's language and level. The answer also holds stretch scenarios."""


class ScenarioOut(BaseModel):
    """One scenario. The client groups the flat list into sections."""

    id: str
    title: str = Field(description="Title in the learner's own language")
    native_title: str = Field(description="Title in the target language")
    topics: str = Field(description="What the scenario practises, one short line")
    level: str = Field(description="One of the language's levels")
    recommended: bool
    done: bool
    last_result: str | None = Field(default=None, description="e.g. 'Last time: 2 corrections'")


@router.get("")
def list_scenarios(params: Annotated[ScenariosQuery, Query()]) -> list[ScenarioOut]:
    """Scenarios at the learner's level, plus stretch scenarios at another level."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=NOT_WRITTEN_YET)
