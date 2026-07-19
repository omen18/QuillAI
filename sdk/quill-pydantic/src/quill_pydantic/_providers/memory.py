"""Memory providers resolve where the long-lived context store lives.

v0.1 ships:
  - ``LocalLanceDBMemoryProvider``: opens a ``MemoryStore`` against a local
    ``.quill/memory/`` directory.
  - ``NoopMemoryProvider``: signals that memory is disabled. Direct API calls
    raise ``MemoryNotEnabledError``; LLM-facing tools are filtered out.

Auto-selection is performed by ``QuillToolkit.from_project`` based on whether
``<project>/.quill/memory/`` exists.
"""

from pathlib import Path

from quill.memory.store import MemoryStore

from quill_pydantic.exceptions import MemoryNotEnabledError


class LocalLanceDBMemoryProvider:
    """Lazily opens a local LanceDB-backed ``MemoryStore`` on first use."""

    enabled = True

    def __init__(self, *, memory_path: Path):
        self._memory_path = memory_path

    def open(self) -> MemoryStore:
        return MemoryStore(path=self._memory_path)


class NoopMemoryProvider:
    """Inert provider used when no ``.quill/memory/`` exists in the project."""

    enabled = False

    def open(self) -> MemoryStore:
        raise MemoryNotEnabledError(
            "memory is not enabled for this toolkit. "
            "Run `quill memory index` in your project to enable it."
        )
