"""Grammar topics API contract (spec 006).

Claude-generated boilerplate: models and an endpoint that validates its input and then
answers 501. Which topics exist, progress tracking and the pass mark are hand-written by
the owner.
"""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from tutor.routers.common import LanguageLevelIn

router = APIRouter(prefix="/grammar", tags=["grammar"])

NOT_WRITTEN_YET = "Grammar topics are not written yet"


class GrammarTopicsQuery(LanguageLevelIn):
    """The learner's language and level."""


class ScoreOut(BaseModel):
    """A test result, e.g. 8 of 10 correct."""

    correct: int = Field(ge=0)
    total: int = Field(ge=1)


class GrammarTopicOut(BaseModel):
    """One grammar topic and the learner's progress on it."""

    id: str
    title: str = Field(description="Topic name in the learner's own language")
    example: str = Field(description="A short example in the target language")
    times_learned: int = Field(ge=0, description="How often the learner took the lesson")
    best_score: ScoreOut | None = Field(
        default=None, description="Best test result; null until the first test"
    )
    passed: bool = Field(description="Whether the best score reaches the pass mark")


@router.get("/topics")
def list_topics(params: Annotated[GrammarTopicsQuery, Query()]) -> list[GrammarTopicOut]:
    """The grammar topics of one level, in teaching order."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=NOT_WRITTEN_YET)
