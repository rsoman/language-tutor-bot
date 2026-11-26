"""Conversation API contract (spec 003).

Claude-generated boilerplate: the request and response models, and endpoints that validate
their input and then answer 501. The conversation logic itself (prompts, LLM calls, deciding
what feedback to give) is hand-written by the owner and replaces the 501s.
"""

from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from tutor.routers.common import LanguageLevelIn

router = APIRouter(prefix="/conversations", tags=["conversations"])

NOT_WRITTEN_YET = "Conversation logic is not written yet"


class ConversationIn(LanguageLevelIn):
    """Starts a conversation in one language at one of its levels."""


class TutorMessageOut(BaseModel):
    """Something the tutor says, in the target language, with an optional translation."""

    text: str
    translation: str | None = Field(
        default=None, description="The same message in the learner's own language"
    )


class SegmentOut(BaseModel):
    """A piece of the corrected sentence. Changed pieces are shown in bold (D0001)."""

    text: str
    changed: bool


FeedbackKind = Literal["grammar_error", "new_word", "known_word", "unclear_word"]


class FeedbackOut(BaseModel):
    """One feedback card on a learner message (D0001, D0002).

    Which fields are set depends on the kind: an unclear word only has an explanation
    (the tutor's question); the others have original, replacement and corrected_sentence.
    """

    kind: FeedbackKind
    original: str | None = Field(default=None, description="What the learner wrote")
    replacement: str | None = Field(default=None, description="What it should be")
    explanation: str | None = None
    corrected_sentence: list[SegmentOut] | None = Field(
        default=None, description="The whole corrected sentence; joining the texts gives it"
    )


class ConversationOut(BaseModel):
    id: str
    opening: TutorMessageOut


class TurnIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)


class TurnOut(BaseModel):
    feedback: list[FeedbackOut]
    reply: TutorMessageOut


@router.post("", status_code=status.HTTP_201_CREATED)
def start_conversation(body: ConversationIn) -> ConversationOut:
    """Starts a conversation and returns the tutor's opening message."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=NOT_WRITTEN_YET)


@router.post("/{conversation_id}/turns")
def take_turn(conversation_id: str, body: TurnIn) -> TurnOut:
    """Sends the learner's message; returns feedback on it and the tutor's reply."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=NOT_WRITTEN_YET)
