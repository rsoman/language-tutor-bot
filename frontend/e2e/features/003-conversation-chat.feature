Feature: Conversation chat

  Background:
    Given the learner has chosen "Examplish" at level "L1"

  Scenario: The tutor opens the conversation
    Given the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    Then the tutor says "Opening line"
    And the translation "Opening translation" is shown under it

  @smoke
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

  Scenario: Changing the language starts a new conversation
    Given the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    And the learner sends "My message"
    And the learner changes the language to "Samplese"
    Then the learner's message "My message" is not shown
    And the tutor says "Opening line"

  Scenario: A word the learner already learned gets a reminder
    Given the tutor will mark a known word: "apple" is "the-apple" in "I eat the-apple."
    When the learner opens Conversation
    And the learner sends "I eat apple."
    Then a card headed "You've seen this one" is shown
    And the card says "Moved up in your drills"
    And the card ends with the sentence "I eat the-apple." with "the-apple" in bold

  Scenario: The learner sends a message with the Enter key
    Given the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner types "My message"
    And the learner presses Enter
    Then the learner's message "My message" is shown
    And the tutor says "Reply line"

  Scenario: Feedback cards keep the order the tutor sends them in
    Given the tutor will send a new word card and then a grammar mistake card
    When the learner opens Conversation
    And the learner sends "My message"
    Then the cards are headed "New word, Almost there" in that order

  Scenario: The learner can resend a message that failed
    Given sending will fail once
    And the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends "My message"
    Then the message "My message" is marked "Not sent."
    When the learner picks "Try again"
    Then the tutor says "Reply line"

  Scenario: Trying again sends the same text
    Given sending will fail once
    When the learner opens Conversation
    And the learner sends "My message"
    And the learner picks "Try again"
    Then the tutor received the message "My message"

  Scenario: The learner can send a new message while an earlier one is not sent
    Given sending will fail once
    And the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends "First message"
    And the learner sends "Second message"
    Then the message "First message" is marked "Not sent."
    And the messages are in the order "First message, Second message, Reply line"

  Scenario: Trying again keeps the failed message in place
    Given sending will fail once
    And the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends "First message"
    And the learner sends "Second message"
    And the learner picks "Try again"
    Then the messages are in the order "First message, Second message, Reply line, Reply line"

  Scenario: The learner can retry when the conversation fails to start
    Given starting will fail once
    And the tutor will open with "Opening line" translated as "Opening translation"
    When the learner opens Conversation
    Then the page shows "Couldn't start a conversation."
    When the learner picks "Try again"
    Then the tutor says "Opening line"

  Scenario: An empty message cannot be sent
    When the learner opens Conversation
    Then the Send button is disabled
    When the learner types "   "
    Then the Send button is disabled

  Scenario: Send is disabled while the conversation starts
    Given the conversation is slow to start
    When the learner opens Conversation
    And the learner types "My message"
    Then the Send button is disabled

  Scenario: Send is disabled while the tutor is replying
    Given the tutor is slow to reply
    When the learner opens Conversation
    And the learner sends "My message"
    Then the Send button is disabled
    And the page shows "Tutor is typing"

  Scenario: A message stops at 500 characters
    When the learner opens Conversation
    And the learner types 501 characters
    Then the message box holds 500 characters

  Scenario: The learner sees that the conversation is starting
    Given the conversation is slow to start
    When the learner opens Conversation
    Then the page shows "Starting a conversation…"

  Scenario: Shift and Enter do not send the message
    When the learner opens Conversation
    And the learner types "My message"
    And the learner presses Shift+Enter
    Then the learner's message "My message" is not shown

  Scenario: New messages are announced and scrolled into view
    Given the learner uses a phone-sized screen
    And the tutor will reply "Reply line"
    When the learner opens Conversation
    And the learner sends 8 messages
    Then the messages are in a region that screen readers announce
    And the last "Reply line" is in view
