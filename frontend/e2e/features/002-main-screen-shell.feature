Feature: Main screen shell

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

  Scenario: An unknown address goes to Conversation
    Given the learner has not chosen a language
    When the learner opens the app at "/no-such-page"
    Then the address ends with "/conversation"

  Scenario: Without a chosen language the learner is asked to choose one
    Given the learner has not chosen a language
    When the learner opens the app
    Then the language button reads "Choose language"
    And the page shows "Choose the language you want to practise"

  Scenario: The learner chooses a language and level
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    And the learner picks the level "L2"
    And the learner closes the language picker
    Then the language button reads "Examplish · L2"

  Scenario: Picking a language selects its first level
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Samplese"
    Then the level "S1" is selected

  Scenario: The level list belongs to the chosen language
    Given the learner has not chosen a language
    When the learner opens the app
    And the learner opens the language picker
    And the learner picks the language "Examplish"
    Then the level group is labelled "Level (TEST)"
    And the levels offered are "L1, L2"

  Scenario: The chosen language is remembered after a reload
    Given the learner has chosen "Examplish" at level "L1"
    When the learner reloads the app
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
