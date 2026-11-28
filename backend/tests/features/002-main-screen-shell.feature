Feature: Languages API contract

  Scenario: Every level carries its difficulty rank
    When a client lists the languages
    Then every level has a code and a whole-number rank of 1 or more
    And no two levels of one language share a rank

  Scenario: Levels come easiest first
    When a client lists the languages
    Then each language's levels are in rising rank order
