from unittest.mock import Mock, patch

import pytest
import requests

from processor.jira_client import (
    JiraAuthError,
    JiraClient,
    JiraConnectionError,
    JiraRequestError,
)
from processor.models import ActionItem


def _client():
    return JiraClient(base_url="https://example.atlassian.net", email="a@b.com", api_token="token")


def _item():
    return ActionItem(
        task_summary="Renew cert",
        owner_name="Alex",
        source_meeting="m1",
        assignee_account_id="acc-1",
    )


@patch("processor.jira_client.requests.post")
def test_create_task_success(mock_post):
    mock_post.return_value = Mock(status_code=201, json=lambda: {"key": "VER-IOT-200"})

    result = _client().create_task(_item())

    assert result["key"] == "VER-IOT-200"


@patch("processor.jira_client.requests.post")
def test_create_task_auth_failure(mock_post):
    mock_post.return_value = Mock(status_code=401, text="Unauthorized")

    with pytest.raises(JiraAuthError):
        _client().create_task(_item())


@patch("processor.jira_client.requests.post")
def test_create_task_invalid_project(mock_post):
    mock_post.return_value = Mock(status_code=400, text="Invalid project key")

    with pytest.raises(JiraRequestError):
        _client().create_task(_item())


@patch("processor.jira_client.requests.post")
def test_create_task_network_error(mock_post):
    mock_post.side_effect = requests.exceptions.ConnectionError("boom")

    with pytest.raises(JiraConnectionError):
        _client().create_task(_item())
