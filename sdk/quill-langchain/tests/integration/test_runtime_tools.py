"""End-to-end integration: QuillToolkit running real queries against DuckDB."""

from __future__ import annotations

from quill_langchain import QuillToolkit


def test_query_executes_against_duckdb_returns_arrow_table(duckdb_project):
    """toolkit.query against a real DuckDB-backed project returns rows."""
    toolkit = QuillToolkit.from_project(duckdb_project)

    table = toolkit.query("SELECT id, name FROM customers ORDER BY id")

    assert table.column_names == ["id", "name"]
    assert table.to_pylist() == [
        {"id": 1, "name": "Acme"},
        {"id": 2, "name": "Globex"},
    ]


def test_quill_query_tool_returns_envelope_with_real_rows(duckdb_project):
    """The LangChain quill_query tool returns a full envelope from a real query."""
    toolkit = QuillToolkit.from_project(duckdb_project)
    quill_query = next(t for t in toolkit.get_tools() if t.name == "quill_query")

    envelope = quill_query.invoke({"sql": "SELECT id, name FROM customers ORDER BY id"})

    assert envelope["ok"] is True
    assert envelope["data"]["row_count"] == 2
    assert envelope["data"]["rows"][0]["name"] == "Acme"


def test_quill_list_models_tool_renders_manifest(duckdb_project):
    toolkit = QuillToolkit.from_project(duckdb_project)
    list_models = next(t for t in toolkit.get_tools() if t.name == "quill_list_models")

    envelope = list_models.invoke({})

    assert envelope["ok"] is True
    assert "customers" in envelope["content"]
    assert envelope["data"]["models"][0]["name"] == "customers"


def test_connector_reused_across_queries(duckdb_project):
    """After the first query, ``_connector_cache`` is populated and reused."""
    toolkit = QuillToolkit.from_project(duckdb_project)

    toolkit.query("SELECT 1")
    first_connector = toolkit._connector_cache
    assert first_connector is not None

    toolkit.query("SELECT 2")
    assert toolkit._connector_cache is first_connector
