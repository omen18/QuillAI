"""Tests for QuillToolkit construction (from_project)."""

import pytest
from quill.profile import _reset_env_loaded_for_tests

from quill_langchain import QuillToolkit
from quill_langchain._providers.memory import (
    LocalLanceDBMemoryProvider,
    NoopMemoryProvider,
)
from quill_langchain.exceptions import QuillToolkitInitError


def test_from_project_raises_when_project_yml_missing(tmp_path, fake_active_profile):
    """A directory without quill_project.yml is not a Quill project."""
    with pytest.raises(QuillToolkitInitError, match="quill_project.yml"):
        QuillToolkit.from_project(tmp_path)


def test_from_project_raises_when_target_mdl_missing(tmp_path, fake_active_profile):
    """A project without target/mdl.json hasn't been built."""
    (tmp_path / "quill_project.yml").write_text("schema_version: 1\n")
    with pytest.raises(QuillToolkitInitError, match="target/mdl.json"):
        QuillToolkit.from_project(tmp_path)


def test_from_project_returns_toolkit_when_prereqs_met(
    tmp_project, fake_active_profile
):
    """from_project returns a QuillToolkit when all prerequisites exist."""
    toolkit = QuillToolkit.from_project(tmp_project)
    assert isinstance(toolkit, QuillToolkit)


def test_from_project_relative_path_resolves(
    tmp_project, fake_active_profile, monkeypatch
):
    """from_project accepts relative paths and resolves them."""
    monkeypatch.chdir(tmp_project.parent)
    toolkit = QuillToolkit.from_project(tmp_project.name)
    assert isinstance(toolkit, QuillToolkit)


def test_memory_auto_detect_disabled_when_dir_missing(tmp_project, fake_active_profile):
    """Without .quill/memory/, memory auto-detects as Noop."""
    toolkit = QuillToolkit.from_project(tmp_project)
    assert isinstance(toolkit._memory, NoopMemoryProvider)


def test_memory_auto_detect_enabled_when_dir_exists(tmp_project, fake_active_profile):
    """With .quill/memory/, memory auto-detects as LocalLanceDB."""
    (tmp_project / ".quill" / "memory").mkdir(parents=True)
    toolkit = QuillToolkit.from_project(tmp_project)
    assert isinstance(toolkit._memory, LocalLanceDBMemoryProvider)


def test_from_project_loads_dotenv_from_project_path(tmp_project, monkeypatch):
    """from_project loads <path>/.env so ${VAR} secrets resolve regardless of CWD.

    Regression: previously the SDK relied on Core's CWD-relative .env discovery,
    which fails when the user runs Python from anywhere other than the project
    directory.
    """
    # Stage 1: a profile that references an env var the caller's shell does NOT have.
    sentinel_var = "QUILL_LANGCHAIN_TEST_HOST_DOES_NOT_EXIST_IN_SHELL"
    monkeypatch.delenv(sentinel_var, raising=False)
    monkeypatch.setattr(
        "quill_langchain._providers.connection.list_profiles",
        lambda: {
            "test": {
                "datasource": "duckdb",
                "host": f"${{{sentinel_var}}}",
                "format": "duckdb",
            }
        },
    )
    monkeypatch.setattr(
        "quill_langchain._providers.connection.get_active_profile",
        lambda: (
            "test",
            {
                "datasource": "duckdb",
                "host": f"${{{sentinel_var}}}",
                "format": "duckdb",
            },
        ),
    )

    # Stage 2: place the var only inside the project's .env.
    (tmp_project / ".env").write_text(f"{sentinel_var}=resolved-from-project-env\n")

    # Stage 3: run from a different CWD so Core's CWD-walk would NOT find the file.
    monkeypatch.chdir(tmp_project.parent)
    _reset_env_loaded_for_tests()

    try:
        toolkit = QuillToolkit.from_project(tmp_project)
        assert (
            toolkit._connection.connection_info()["host"] == "resolved-from-project-env"
        )
    finally:
        # Reset the global loader flag again so this test cannot leak its
        # half-loaded state into whatever runs next in the session.
        _reset_env_loaded_for_tests()
