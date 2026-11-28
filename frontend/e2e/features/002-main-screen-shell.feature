Feature: Main screen shell

  @smoke
  Scenario: The main screen opens on Conversation
    Given the learner has not chosen a language
    When the learner opens the app
    Then the page shows the app name
    And the "Conversation" mode tab is the current page
    And the page title is "Conversation · Vaikhari"

  Scenario: The learner switches practice modes
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner picks the "Grammar" mode tab
    Then the "Grammar" mode tab is the current page
    And the address ends with "/grammar"
    And the page shows the heading "Grammar"

  Scenario: A mode can be opened directly by its address
    Given the learner has not chosen a language
    When the learner opens the app at "/vocabulary"
    Then the "Vocabulary" mode tab is the current page

  Scenario: The learner chooses a language and level
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    And the learner picks the level "L2"
    And the learner closes the language picker
    Then the language button reads "Examplish · L2"

  Scenario: A language with a single level has it selected
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Samplese"
    Then the level "S1" is selected

  Scenario: A language with several levels starts at its easiest level
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the level "L1" is selected

  Scenario: The level list belongs to the chosen language
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the level group is labelled "Level (TEST)"
    And the levels offered are "L1, L2"

  Scenario: Switching back to a language keeps its current level
    Given the learner has chosen "Examplish" at level "L2"
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Samplese"
    And the learner picks the language "Examplish"
    Then the level "L2" is selected

  Scenario: Each language's current level is remembered after a reload
    Given the learner has chosen "Examplish" at level "L2"
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Samplese"
    And the learner reloads the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the level "L2" is selected

  Scenario: The chosen language is remembered after a reload
    Given the learner has chosen "Examplish" at level "L1"
    When the learner reloads the app
    Then the language button reads "Examplish · L1"

  Scenario: On a phone the mode tabs are a bottom bar
    Given the learner uses a phone-sized screen
    And the learner has chosen "Examplish" at level "L1"
    When the learner opens the app
    Then the mode tabs are at the bottom of the screen
    And every mode tab is at least 44 pixels tall
    And the language button reads "XX · L1"

  Scenario: On a desktop the mode tabs are under the header
    Given the learner uses a desktop-sized screen
    When the learner opens the app
    Then the mode tabs are under the header

  Scenario: On a tablet the mode tabs are under the header
    Given the learner uses a tablet-sized screen
    When the learner opens the app
    Then the mode tabs are under the header

  Scenario: Escape closes the language picker
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner presses Escape
    Then the language picker is not shown
    And the language button has focus

  Scenario: An unknown address goes to Conversation
    Given the learner has not chosen a language
    When the learner opens the app at "/no-such-page"
    Then the address ends with "/conversation"

  Scenario: A saved level the language no longer offers falls back to its easiest level
    Given the learner has chosen "Examplish" at level "L9"
    When the learner opens the app
    Then the language button reads "Examplish · L1"

  Scenario: A saved language that is no longer offered is ignored
    Given the learner has chosen "Examplish" at level "L1"
    And the API no longer offers "Examplish"
    When the learner reloads the app
    Then the language button reads "Choose language"

  Scenario: The learner can retry when languages fail to load
    Given the languages request fails once
    When the learner opens the app
    Then the language button reads "Languages unavailable"
    When the learner picks "Try again"
    Then the language button reads "Choose language"

  Scenario: A damaged saved choice is ignored
    Given the saved language choice is not valid JSON
    When the learner opens the app
    Then the language button reads "Choose language"

  Scenario: A language list with the wrong shape counts as a failure
    Given the languages request answers with the wrong shape
    When the learner opens the app
    Then the language button reads "Languages unavailable"

  Scenario: Without a chosen language the learner is asked to choose one
    Given the learner has not chosen a language
    When the learner opens the app
    Then the language button reads "Choose language"
    And the page shows "Choose the language you want to practise"

  Scenario: The language button waits while languages load
    Given the languages request is slow
    When the learner opens the app
    Then the language button reads "Loading languages"
    And the language button is disabled

  Scenario: With no languages on offer the learner is told so
    Given the API offers no languages
    When the learner opens the app
    Then the language prompt says "No languages are available yet."

  Scenario: Keyboard focus stays in the open language picker
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner presses Tab from the "Done" button
    Then keyboard focus is inside the language picker

  Scenario: Levels are listed easiest first whatever order the API sends
    Given the learner has not chosen a language
    And the API sends the levels of "Examplish" in the order "L2, L1"
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the levels offered are "L1, L2"
    And the level "L1" is selected

  Scenario: Levels are ordered by difficulty, not by name
    Given the learner has not chosen a language
    And the API offers "Ordish" with level "Zed" at rank 1 and level "Alpha" at rank 2
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Ordish"
    Then the levels offered are "Zed, Alpha"
    And the level "Zed" is selected
