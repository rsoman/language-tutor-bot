Feature: Word help

  Background:
    Given the learner has chosen "Examplish" at level "L1"
    And the dictionary knows "coffee" as "the-coffee", a "noun" with "gender" "neuter" and "plural" "the-coffees"
    When the learner opens Conversation

  Scenario: Word help opens from the message box
    When the learner opens word help
    Then the word help panel is shown
    And the word help input has focus

  Scenario: Looking up a word shows its translation, features and example
    When the learner opens word help
    And the learner looks up "coffee"
    Then the word help shows "the-coffee"
    And the word help shows "noun · gender: neuter · plural: the-coffees"
    And the word help shows the example sentence

  Scenario: A word the dictionary does not know
    When the learner opens word help
    And the learner looks up "blorp"
    Then the word help shows 'No match for "blorp".'

  Scenario: The found word goes into the message
    When the learner types "I want"
    And the learner opens word help
    And the learner looks up "coffee"
    And the learner inserts the word into the message
    Then the message box contains "I want the-coffee"
    And the word help panel is not shown

  Scenario: Escape closes word help
    When the learner opens word help
    And the learner presses Escape
    Then the word help panel is not shown
    And the word help button has focus

  Scenario: On a phone word help is a bottom sheet
    Given the learner uses a phone-sized screen
    When the learner opens word help
    Then the word help panel spans the width of the screen
