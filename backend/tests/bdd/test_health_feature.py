"""Step definitions for features/health.feature.

This is the reference example for BDD tests. Each spec's Given/When/Then
acceptance criteria become a .feature file, and the steps live in a file like this.
"""

import httpx
from fastapi.testclient import TestClient
from pytest_bdd import given, parsers, scenarios, then, when

from tutor.main import create_app

scenarios("health.feature")


@given("the API is running", target_fixture="client")
def api_client() -> TestClient:
    return TestClient(create_app())


@when("I request the health endpoint", target_fixture="response")
def request_health(client: TestClient) -> httpx.Response:
    return client.get("/health")


@then(parsers.parse("the response status is {status:d}"))
def check_status(response: httpx.Response, status: int) -> None:
    assert response.status_code == status


@then(parsers.parse('the reported status is "{value}"'))
def check_reported_status(response: httpx.Response, value: str) -> None:
    assert response.json()["status"] == value
