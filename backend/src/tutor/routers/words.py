"""Word lookup API contract (spec 004).

Claude-generated boilerplate: the request model and an endpoint that validates its input and
then answers 501. The owner writes the response model (the word, its features and an example)
together with the lookup itself (word data, retrieval). The response contract is described in
specs/004-word-help.md.
"""

from typing import Annotated, NoReturn

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import Field

from tutor.routers.common import LanguageLevelIn

router = APIRouter(prefix="/words", tags=["words"])

NOT_WRITTEN_YET = "Word lookup is not written yet"


class WordLookupIn(LanguageLevelIn):
    """Query parameters for a lookup: a word in the learner's own language."""

    query: str = Field(min_length=1, max_length=60)


# response_model=None: the response model is the owner's to write (see the module docstring).
@router.get("/lookup", response_model=None)
def lookup_word(params: Annotated[WordLookupIn, Query()]) -> NoReturn:
    """Looks up one word. 404 when nothing matches (once the logic exists)."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=NOT_WRITTEN_YET)
