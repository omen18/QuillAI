"""Shared pytest fixtures for quill-langchain tests."""

import json

import pytest


@pytest.fixture
def tmp_project(tmp_path):
    """A minimal valid Quill project directory.

    Layout:
      <tmp_path>/
        quill_project.yml
        target/mdl.json
    """
    (tmp_path / "quill_project.yml").write_text("schema_version: 1\n")
    target = tmp_path / "target"
    target.mkdir()
    (target / "mdl.json").write_text(json.dumps({"models": []}))
    return tmp_path


@pytest.fixture
def fake_active_profile(monkeypatch):
    """Patch profile resolution to return a duckdb in-memory active profile."""
    monkeypatch.setattr(
        "quill_langchain._providers.connection.list_profiles",
        lambda: {"test": {"datasource": "duckdb", "path": ":memory:"}},
    )
    monkeypatch.setattr(
        "quill_langchain._providers.connection.get_active_profile",
        lambda: ("test", {"datasource": "duckdb", "path": ":memory:"}),
    )
