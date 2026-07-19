"""LangChain BaseTool conformance: each Quill tool must satisfy the contract.

A LangChain agent (and LangGraph ToolNode) relies on:
- ``tool.name`` (str, fixed identifier)
- ``tool.description`` (str, non-empty)
- ``tool.args_schema`` (Pydantic model with the expected fields)
- ``tool.invoke({...})`` returns a JSON-serializable dict envelope
"""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pyarrow as pa
import pytest
from langchain_core.tools import BaseTool

from quill_langchain import QuillToolkit

_EXPECTED_TOOL_NAMES = {
    "quill_query",
    "quill_dry_plan",
    "quill_list_models",
    "quill_fetch_context",
    "quill_recall_queries",
    "quill_store_query",
}


def _all_tools(tmp_project):
    """Build a toolkit with memory enabled and stubbed engine + memory store."""
    (tmp_project / ".quill" / "memory").mkdir(parents=True)
    fake_store = MagicMock(name="MemoryStore")
    fake_store.get_context.return_value = {"strategy": "search", "results": []}
    fake_store.recall_queries.return_value = []
    fake_engine = MagicMock(name="QuillEngine")
    fake_engine.query.return_value = pa.table({"x": [1]})
    fake_engine.dry_plan.return_value = "SELECT 1"
    fake_engine._connector = MagicMock()

    with (
        patch("quill_langchain._providers.memory.MemoryStore", return_value=fake_store),
        patch("quill_langchain._toolkit.QuillEngine", return_value=fake_engine),
    ):
        toolkit = QuillToolkit.from_project(tmp_project)
        yield toolkit


@pytest.fixture
def all_tools(tmp_project, fake_active_profile):
    yield from _all_tools(tmp_project)


def test_get_tools_yields_all_expected_tools(all_tools):
    names = {t.name for t in all_tools.get_tools()}
    assert names == _EXPECTED_TOOL_NAMES


@pytest.mark.parametrize("expected_name", sorted(_EXPECTED_TOOL_NAMES))
def test_each_tool_is_a_basetool(all_tools, expected_name):
    tools_by_name = {t.name: t for t in all_tools.get_tools()}
    tool = tools_by_name[expected_name]
    assert isinstance(tool, BaseTool)


@pytest.mark.parametrize("expected_name", sorted(_EXPECTED_TOOL_NAMES))
def test_each_tool_has_non_empty_description(all_tools, expected_name):
    tools_by_name = {t.name: t for t in all_tools.get_tools()}
    tool = tools_by_name[expected_name]
    assert tool.description
    assert len(tool.description.strip()) > 10


@pytest.mark.parametrize(
    "tool_name,required_args",
    [
        ("quill_query", {"sql"}),
        ("quill_dry_plan", {"sql"}),
        ("quill_list_models", set()),
        ("quill_fetch_context", {"question"}),
        ("quill_recall_queries", {"question"}),
        ("quill_store_query", {"nl", "sql"}),
    ],
)
def test_each_tool_args_schema_includes_expected_fields(
    all_tools, tool_name, required_args
):
    tools_by_name = {t.name: t for t in all_tools.get_tools()}
    tool = tools_by_name[tool_name]
    schema = tool.args_schema
    assert schema is not None
    fields = set(schema.model_fields.keys())
    for arg in required_args:
        assert arg in fields, f"{tool_name} missing arg {arg!r}; fields={fields}"


@pytest.mark.parametrize(
    "tool_name,invoke_args",
    [
        ("quill_query", {"sql": "SELECT 1"}),
        ("quill_dry_plan", {"sql": "SELECT 1"}),
        ("quill_list_models", {}),
        ("quill_fetch_context", {"question": "what models exist?"}),
        ("quill_recall_queries", {"question": "top customers"}),
        ("quill_store_query", {"nl": "x", "sql": "SELECT 1"}),
    ],
)
def test_each_tool_invoke_returns_envelope_dict(all_tools, tool_name, invoke_args):
    tools_by_name = {t.name: t for t in all_tools.get_tools()}
    tool = tools_by_name[tool_name]
    result = tool.invoke(invoke_args)

    assert isinstance(result, dict)
    assert "ok" in result
    if result["ok"]:
        assert "content" in result
        assert "data" in result
        assert "warnings" in result
    else:
        assert "content" in result
        assert "error" in result
        assert "code" in result["error"]
