"""Conversation API contract (spec 003).

Claude-generated boilerplate: the request models, and endpoints that validate their input and
then answer 501. The response models are the tutor's LLM output (the opening and reply
messages and the feedback cards), so the owner writes them, together with the conversation
logic that replaces the 501s. Their contract is described in specs/003-conversation-chat.md.
"""

from typing import NoReturn, Self

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, model_validator

from tutor.languages import LANGUAGES

router = APIRouter(prefix="/conversations", tags=["conversations"])

NOT_WRITTEN_YET = "Conversation logic is not written yet"


class ConversationIn(BaseModel):
    """Starts a conversation in one language at one of its levels."""

    language: str = Field(description="Language code from GET /languages, e.g. 'xx'")
    level: str = Field(description="One of that language's levels")

    @model_validator(mode="after")
    def check_language_and_level(self) -> Self:
        profile = LANGUAGES.get(self.language)
        if profile is None:
            raise ValueError(f"Unsupported language {self.language!r}")
        if self.level not in profile.levels:
            raise ValueError(f"Level {self.level!r} is not offered for {self.language!r}")
        return self


class TurnIn(BaseModel):
    message: str = Field(min_length=1, max_length=500)


# response_model=None: the response models are the owner's to write (see the module docstring).
@router.post("", status_code=status.HTTP_201_CREATED, response_model=None)
def start_conversation(body: ConversationIn) -> NoReturn:
    """Starts a conversation and returns the tutor's opening message."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=NOT_WRITTEN_YET)


@router.post("/{conversation_id}/turns", response_model=None)
def take_turn(conversation_id: str, body: TurnIn) -> NoReturn:
    """Sends the learner's message; returns feedback on it and the tutor's reply."""
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail=NOT_WRITTEN_YET)
