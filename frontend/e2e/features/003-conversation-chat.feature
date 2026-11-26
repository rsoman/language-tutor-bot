Feature: Conversation chat

  Background:
    Given the learner has chosen "Examplish" at level "L1"

  Scenario: The tutor opens the conversation
    Given the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    Then the tutor says "Opening line"
    And the translation "Opening translation" is shown under it

  Scenario: The learner sends a message and the tutor replies
    Given the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends "My message"
    Then the learner's message "My message" is shown
    And the tutor says "Reply line"
    And the message box is empty

  Scenario: A grammar mistake gets a correction card ending with the corrected sentence
    Given the tutor will mark a grammar mistake: "bad part" should be "good part" in "Start good part end."
    When the learner opens Conversation
    And the learner sends "Start bad part end."
    Then a card headed "Almost there" is shown
    And the card ends with the sentence "Start good part end." with "good part" in bold

  Scenario: A word in the learner's own language becomes a new word
    Given the tutor will mark a new word: "apple" is "the-apple" in "I eat the-apple."
    When the learner opens Conversation
    And the learner sends "I eat apple."
    Then a card headed "New word" is shown
    And the card says "Added to your drills"
    And the card ends with the sentence "I eat the-apple." with "the-apple" in bold

  Scenario: An unclear word gets a question, not a correction
    Given the tutor will ask about an unclear word: "What did you mean by blorp?"
    When the learner opens Conversation
    And the learner sends "I eat blorp."
    Then a card headed "Which word did you mean?" is shown
    And the card says "What did you mean by blorp?"

  Scenario: An empty message cannot be sent
    When the learner opens Conversation
    Then the Send button is disabled
    When the learner types "   "
    Then the Send button is disabled

  Scenario: The learner can resend a message that failed
    Given sending will fail once
    And the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends "My message"
    Then the message "My message" is marked "Not sent."
    When the learner picks "Try again"
    Then the tutor says "Reply line"

  Scenario: Changing the level starts a new conversation
    Given the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    And the learner sends "My message"
    And the learner changes the level to "L2"
    Then the learner's message "My message" is not shown
    And the tutor says "Opening line"

  Scenario: On a phone the message box sits above the tab bar
    Given the learner uses a phone-sized screen
    When the learner opens Conversation
    Then the message box is just above the mode tabs
