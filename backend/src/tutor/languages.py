"""Target languages the tutor supports.

Nothing outside this module should hard-code a language. Prompts, corpora and evals
are looked up by `LanguageProfile.code`, so adding a language means adding a profile
here plus its data, not changing orchestration code.
"""

from dataclasses import dataclass

CEFR_LEVELS = ("A1", "A2", "B1", "B2", "C1", "C2")


@dataclass(frozen=True)
class LanguageProfile:
    code: str  # ISO 639-1, e.g. "de"
    name: str  # English name, e.g. "German"
    native_name: str  # e.g. "Deutsch"
    levels: tuple[str, ...]  # CEFR levels we have content for


LANGUAGES: dict[str, LanguageProfile] = {
    "de": LanguageProfile(code="de", name="German", native_name="Deutsch", levels=("A1",)),
}


def get_language(code: str) -> LanguageProfile:
    try:
        return LANGUAGES[code]
    except KeyError:
        supported = ", ".join(sorted(LANGUAGES))
        raise ValueError(f"Unsupported language {code!r}. Supported: {supported}") from None
