Feature: Grammar topics

  Background:
    Given the learner has chosen "Examplish" at level "L1"
    And the grammar topics on offer are the fake set

  Scenario: The level's topics are listed
    When the learner opens Grammar
    Then the page shows the heading "L1 grammar topics"
    And the topics listed are "Topic one, Topic two, Topic three"

  Scenario: Each topic shows its progress
    When the learner opens Grammar
    Then the "Topic one" topic shows "Passed"
    And the "Topic one" topic shows "Learned 2× · best test 8/10"
    And the "Topic two" topic shows "Learned 1× · best test 5/10"
    And the "Topic three" topic shows "Not started"

  Scenario: A topic never learned offers Learn, a learned one Learn again
    When the learner opens Grammar
    Then the "Topic three" topic offers "Learn"
    And the "Topic one" topic offers "Learn again"

  Scenario: The combination test needs at least one topic
    When the learner opens Grammar
    Then the combination test action reads "Choose topics first" and is disabled
    When the learner ticks "Topic two"
    Then the combination test action reads "Start test · 1 topic"

  Scenario: Select all passed and Clear
    When the learner opens Grammar
    And the learner ticks "Topic two"
    And the learner picks "Select all passed"
    Then only "Topic one" is ticked
    When the learner picks "Clear"
    Then no topic is ticked

  Scenario: Starting a combination test
    When the learner opens Grammar
    And the learner ticks "Topic one"
    And the learner ticks "Topic three"
    And the learner starts the combination test
    Then the address ends with "/grammar/test?topics=g-1,g-3"
    And the "Grammar" mode tab is the current page

  Scenario: On a phone the combination test bar sits above the tab bar
    Given the learner uses a phone-sized screen
    When the learner opens Grammar
    Then the combination test bar is just above the mode tabs
