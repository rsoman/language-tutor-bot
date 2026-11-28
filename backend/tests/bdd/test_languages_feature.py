"""Step definitions for features/002-main-screen-shell.feature (the languages API contract).

The steps check whatever the language registry offers, so no real language is named.
"""

from typing import Any

from fastapi.testclient import TestClient
from pytest_bdd import scenarios, then, when

from tutor.main import create_app

scenarios("002-main-screen-shell.feature")

Languages = list[dict[str, Any]]


@when("a client lists the languages", target_fixture="languages")
def list_languages() -> Languages:
    response = TestClient(create_app()).get("/languages")
    assert response.status_code == 200
    body: Languages = response.json()
    assert body, "the registry offers at least one language"
    return body


@then("every level has a code and a whole-number rank of 1 or more")
def every_level_has_a_rank(languages: Languages) -> None:
    for language in languages:
        for level in language["levels"]:
            assert isinstance(level["code"], str)
            assert isinstance(level["rank"], int)
            assert level["rank"] >= 1


@then("no two levels of one language share a rank")
def ranks_are_unique(languages: Languages) -> None:
    for language in languages:
        ranks = [level["rank"] for level in language["levels"]]
        assert len(ranks) == len(set(ranks))


@then("each language's levels are in rising rank order")
def levels_come_easiest_first(languages: Languages) -> None:
    for language in languages:
        ranks = [level["rank"] for level in language["levels"]]
        assert ranks == sorted(ranks)
