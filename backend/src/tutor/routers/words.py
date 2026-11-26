"""Word lookup API contract (spec 004).

Claude-generated boilerplate: models and an endpoint that validates its input and then
answers 501. Finding the word (word data, retrieval) is hand-written by the owner.
"""

from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from tutor.routers.common import LanguageLevelIn

router = APIRouter(prefix="/words", tags=["words"])

NOT_WRITTEN_YET = "Word lookup is not written yet"


class WordLookupIn(LanguageLevelIn):
    """Query parameters for a lookup: a word in the learner's own language."""

    query: str = Field(min_length=1, max_length=60)


class WordFeatureOut(BaseModel):
    """One grammatical feature the language's profile declares, e.g. a plural (D0003)."""

    name: str
    value: str


class WordExampleOut(BaseModel):
    """An example sentence in the target language, with its translation."""

    text: str
    translation: str | None = None


class WordOut(BaseModel):
    """The best match for a lookup, in the target language."""

    headword: str = Field(description="The word as the learner should write it")
    part_of_speech: str
    features: list[WordFeatureOut]
    example: WordExampleOut | None = Field(
        default=None, description="An example sentence and its translation"
    )


@router.get("/lookup")
def lookup_word(params: Annotated[WordLookupIn, Query()]) -> WordOut:
    """Looks up one word. 404 when nothing matches (once the logic exists)."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=NOT_WRITTEN_YET)
