Feature: Conversation API contract

  Scenario Outline: A conversation needs a supported language and level
    When a client starts a conversation in <language> at <level>
    Then the API answers <status>
      Examples:
        | language                | level                    | status |
        | a supported language    | one of its levels        | 501    |
        | an unsupported language | any level (ignored)      | 422    |
        | a supported language    | a level it does not have | 422    |

  Scenario Outline: A turn message is 1 to 500 characters and not only spaces
    When a client sends a turn with <message>
    Then the API answers <status>
      Examples:
        | message            | status |
        | the text "Hello"   | 501    |
        | an empty message   | 422    |
        | only spaces        | 422    |
        | 500 characters     | 501    |
        | 501 characters     | 422    |
        | 500 characters with spaces around them | 501 |
