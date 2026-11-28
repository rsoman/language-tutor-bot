"""Unit tests for level ranks and LanguageProfile checks (spec 002, below the UI).

The languages here are made up, so no real language or level system is hard-coded.
"""

import pytest

from tutor.languages import LanguageProfile, LevelSystem

SCALE = LevelSystem(name="TestScale", levels=("L1", "L2", "L3"))


def make_profile(levels: tuple[str, ...]) -> LanguageProfile:
    return LanguageProfile(
        code="xx", name="Examplish", native_name="Exemplar", level_system=SCALE, levels=levels
    )


def test_rank_is_position_in_level_system_counted_from_one() -> None:
    assert SCALE.rank("L1") == 1
    assert SCALE.rank("L3") == 3


def test_a_subset_of_levels_keeps_its_system_ranks() -> None:
    profile = make_profile(("L1", "L3"))
    assert [profile.level_system.rank(level) for level in profile.levels] == [1, 3]


def test_profile_rejects_levels_out_of_system_order() -> None:
    with pytest.raises(ValueError, match="easiest first"):
        make_profile(("L2", "L1"))


def test_profile_rejects_no_levels() -> None:
    with pytest.raises(ValueError, match="at least one level"):
        make_profile(())


def test_profile_rejects_a_repeated_level() -> None:
    with pytest.raises(ValueError, match="easiest first"):
        make_profile(("L1", "L1"))
