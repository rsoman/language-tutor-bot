Feature: Scenario picker

  Background:
    Given the learner has chosen "Examplish" at level "L1"
    And the scenarios on offer are the fake set

  Scenario: Without a scenario the chat offers one
    When the learner opens Conversation
    Then the scenario chip reads "Free conversation · Choose a scenario"

  Scenario: The scenario page groups scenarios
    When the learner opens Conversation
    And the learner opens the scenario page
    Then the section "Recommended next" lists "Cafe scene"
    And the section "All L1 scenarios" lists "Cafe scene, Bakery scene"
    And the section "Stretch · L2" lists "Doctor scene"
    And the page says "1 of 2 L1 scenarios done"

  Scenario: A done scenario shows its last result
    When the learner opens Conversation
    And the learner opens the scenario page
    Then the "Bakery scene" card shows "Done"
    And the "Bakery scene" card shows "Last time: 1 correction"

  Scenario: Picking a scenario starts a conversation in it
    When the learner opens Conversation
    And the learner opens the scenario page
    And the learner picks the scenario "Cafe scene"
    Then the address ends with "/conversation"
    And the scenario chip reads "Scenario: Cafe scene · Change"
    And the conversation was started with scenario "s-cafe"

  Scenario: The learner can go back to a free conversation
    When the learner opens Conversation
    And the learner opens the scenario page
    And the learner picks the scenario "Cafe scene"
    And the learner opens the scenario page
    And the learner picks "Free conversation"
    Then the scenario chip reads "Free conversation · Choose a scenario"

  Scenario: The Conversation tab stays current on the scenario page
    When the learner opens Conversation
    And the learner opens the scenario page
    Then the "Conversation" mode tab is the current page
