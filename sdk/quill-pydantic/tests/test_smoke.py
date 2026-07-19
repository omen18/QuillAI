"""Package skeleton smoke test — imports and exposes __version__."""

from __future__ import annotations


def test_package_imports():
    import quill_pydantic  # noqa: PLC0415

    assert isinstance(quill_pydantic.__version__, str)
    assert quill_pydantic.__version__
