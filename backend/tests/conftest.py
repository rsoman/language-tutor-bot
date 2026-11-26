"""Shared test setup.

Settings now require TUTOR_DEFAULT_LANGUAGE and TUTOR_DEFAULT_LEVEL, so every test runs
with them set. The values are taken from the first supported language, so no test
hard-codes a target language.
"""

from collections.abc import Iterator

import pytest

from tutor.config import get_settings
from tutor.languages import LANGUAGES

SAMPLE_LANGUAGE = next(iter(LANGUAGES.values()))
SAMPLE_LEVEL = SAMPLE_LANGUAGE.levels[0]


@pytest.fixture(autouse=True)
def required_settings(monkeypatch: pytest.MonkeyPatch) -> Iterator[None]:
    monkeypatch.setenv("TUTOR_DEFAULT_LANGUAGE", SAMPLE_LANGUAGE.code)
    monkeypatch.setenv("TUTOR_DEFAULT_LEVEL", SAMPLE_LEVEL)
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()
