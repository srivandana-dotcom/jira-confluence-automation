import requests

from processor.models import ActionItem


class JiraClientError(Exception):
    """Base error for Jira client failures."""


class JiraAuthError(JiraClientError):
    """Raised when Jira rejects the provided credentials."""


class JiraRequestError(JiraClientError):
    """Raised for invalid project/issue type or other 4xx responses."""


class JiraConnectionError(JiraClientError):
    """Raised for network/timeout errors talking to Jira."""


class JiraClient:
    """Creates Jira Task issues via the Jira Cloud REST API v3."""

    def __init__(self, base_url: str, email: str, api_token: str, project_key: str = "VER-IOT"):
        self.base_url = base_url.rstrip("/")
        self.email = email
        self.api_token = api_token
        self.project_key = project_key

    def create_task(self, item: ActionItem) -> dict:
        """Create a backlog Task issue for an approved action item."""
        url = f"{self.base_url}/rest/api/3/issue"
        payload = {
            "fields": {
                "project": {"key": self.project_key},
                "issuetype": {"name": "Task"},
                "summary": item.task_summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{"type": "text", "text": item.task_summary}],
                        }
                    ],
                },
            }
        }
        if item.assignee_account_id:
            payload["fields"]["assignee"] = {"id": item.assignee_account_id}

        try:
            response = requests.post(
                url,
                json=payload,
                auth=(self.email, self.api_token),
                headers={"Accept": "application/json"},
                timeout=10,
            )
        except requests.exceptions.RequestException as exc:
            raise JiraConnectionError(str(exc)) from exc

        if response.status_code == 401:
            raise JiraAuthError("Jira rejected the provided credentials.")
        if response.status_code >= 400:
            raise JiraRequestError(f"Jira API error {response.status_code}: {response.text}")

        return response.json()
