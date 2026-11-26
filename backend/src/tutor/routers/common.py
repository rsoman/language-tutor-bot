"""Pieces shared by several routers."""

from typing import Self

from pydantic import BaseModel, Field, model_validator

from tutor.languages import LANGUAGES


class LanguageLevelIn(BaseModel):
    """A supported language and one of its levels. Anything else is a 422."""

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
