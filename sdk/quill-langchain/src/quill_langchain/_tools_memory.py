"""LangChain tool wrappers for memory operations.

Three tools, all enabled when memory is detected (``.quill/memory/`` exists):
  - ``quill_fetch_context``: schema/business context via embedding search
  - ``quill_recall_queries``: similar past NL→SQL pairs
  - ``quill_store_query``: persist a confirmed pair (filtered by include_write)
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Literal

from langchain_core.tools import tool

from quill_langchain._envelope import make_error, make_success
from quill_langchain._format import (
    format_fetch_context_content,
    format_recall_content,
    format_store_content,
)

if TYPE_CHECKING:
    from quill_langchain._toolkit import QuillToolkit


def build_memory_tools(
    toolkit: QuillToolkit,
    *,
    raise_on_error: bool,
    include_write: bool,
) -> list:
    tools = [
        _build_fetch_context(toolkit, raise_on_error=raise_on_error),
        _build_recall_queries(toolkit, raise_on_error=raise_on_error),
    ]
    if include_write:
        tools.append(_build_store_query(toolkit, raise_on_error=raise_on_error))
    return tools


def _build_fetch_context(toolkit: QuillToolkit, *, raise_on_error: bool):
    @tool("quill_fetch_context")
    def quill_fetch_context(
        question: str,
        limit: int = 5,
        item_type: Literal["model", "column", "relationship", "view"] | None = None,
        model: str | None = None,
    ) -> dict[str, Any]:
        """Fetch relevant schema and business context for an analytical question.

        Call this BEFORE writing SQL so you query the correct Quill models and
        columns. Use ``item_type`` to narrow scope (e.g. only columns) and
        ``model`` to narrow to a single model when known.
        """
        try:
            result = toolkit.memory.fetch(
                question, limit=limit, item_type=item_type, model=model
            )
        except Exception as exc:
            if raise_on_error:
                raise
            return make_error(exc)

        return make_success(
            content=format_fetch_context_content(result),
            data=result,
        )

    return quill_fetch_context


def _build_recall_queries(toolkit: QuillToolkit, *, raise_on_error: bool):
    @tool("quill_recall_queries")
    def quill_recall_queries(question: str, limit: int = 3) -> dict[str, Any]:
        """Recall up to *limit* past NL→SQL pairs similar to *question*.

        Useful as few-shot examples before writing new SQL. Pairs are
        previously confirmed by users (or seeded for the project).
        """
        try:
            rows = toolkit.memory.recall(question, limit=limit)
        except Exception as exc:
            if raise_on_error:
                raise
            return make_error(exc)

        return make_success(
            content=format_recall_content(rows),
            data={"results": rows},
        )

    return quill_recall_queries


def _build_store_query(toolkit: QuillToolkit, *, raise_on_error: bool):
    @tool("quill_store_query")
    def quill_store_query(
        nl: str,
        sql: str,
        tags: list[str] | None = None,
    ) -> dict[str, Any]:
        """Save a confirmed natural-language → SQL pair for future recall.

        Call this AFTER ``quill_query`` succeeds and the result was useful,
        so future agent runs can recall the example via ``quill_recall_queries``.
        """
        # Normalize once up-front so every downstream caller (memory.store,
        # format_store_content, the data payload) sees a list — no hidden
        # `None`-handling expectations to leak.
        tags_list = tags or []
        try:
            toolkit.memory.store(nl=nl, sql=sql, tags=tags_list)
        except Exception as exc:
            if raise_on_error:
                raise
            return make_error(exc)

        return make_success(
            content=format_store_content(nl, sql, tags_list),
            data={"nl": nl, "sql": sql, "tags": tags_list},
        )

    return quill_store_query
