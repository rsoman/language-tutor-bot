"""Target languages the tutor supports.

Nothing outside this module should hard-code a language. Prompts, corpora and evals
are looked up by `LanguageProfile.code`, so adding a language means adding a profile
here plus its data, not changing orchestration code.

Proficiency levels are also per language: European languages usually use CEFR
(A1 to C2), while others have their own scales (for example JLPT for Japanese or
HSK for Chinese). Each profile names its level system, so no code assumes CEFR.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class LevelSystem:
    name: str  # e.g. "CEFR"
    levels: tuple[str, ...]  # all levels, easiest first

    def rank(self, level: str) -> int:
        """The level's difficulty rank: its position in this system, 1 for the easiest."""
        return self.levels.index(level) + 1


CEFR = LevelSystem(name="CEFR", levels=("A1", "A2", "B1", "B2", "C1", "C2"))


@dataclass(frozen=True)
class LanguageProfile:
    code: str  # ISO 639-1, e.g. "de"
    name: str  # English name, e.g. "German"
    native_name: str  # e.g. "Deutsch"
    level_system: LevelSystem
    levels: tuple[str, ...]  # the levels we have content for, a subset of level_system.levels

    def __post_init__(self) -> None:
        unknown = [lvl for lvl in self.levels if lvl not in self.level_system.levels]
        if unknown:
            raise ValueError(
                f"Levels {unknown} are not part of {self.level_system.name} for {self.code!r}"
            )
        if not self.levels:
            raise ValueError(f"{self.code!r} needs at least one level")
        ranks = [self.level_system.rank(level) for level in self.levels]
        if ranks != sorted(ranks):
            raise ValueError(
                f"Levels for {self.code!r} must follow {self.level_system.name}, easiest first"
            )


LANGUAGES: dict[str, LanguageProfile] = {
    "de": LanguageProfile(
        code="de", name="German", native_name="Deutsch", level_system=CEFR, levels=("A1",)
    ),
}


def get_language(code: str) -> LanguageProfile:
    try:
        return LANGUAGES[code]
    except KeyError:
        supported = ", ".join(sorted(LANGUAGES))
        raise ValueError(f"Unsupported language {code!r}. Supported: {supported}") from None
