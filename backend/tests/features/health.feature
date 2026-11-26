Feature: Health check
  So that the deploy pipeline knows the API is up,
  the API reports its health.

  Scenario: The API is healthy
    Given the API is running
    When I request the health endpoint
    Then the response status is 200
    And the reported status is "ok"
