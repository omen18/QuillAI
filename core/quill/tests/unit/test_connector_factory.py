from __future__ import annotations

import pytest

from quill.connector import factory
from quill.model.data_source import DataSource
from quill.model.error import ErrorCode, QuillError

pytestmark = pytest.mark.unit


def test_connector_import_error_has_quoted_quill_extra_hint(monkeypatch) -> None:
    def _fake_import_module(name: str):
        if name == "quill.connector.mysql":
            raise ImportError("No module named 'mysqlclient'")
        raise AssertionError(f"Unexpected import: {name}")

    monkeypatch.setattr(factory.importlib, "import_module", _fake_import_module)

    with pytest.raises(QuillError) as exc:
        factory.get_connector(DataSource.doris, {})

    assert exc.value.error_code == ErrorCode.NOT_IMPLEMENTED
    assert "pip install 'quill[mysql]'" in str(exc.value)
