"""Quill — semantic SQL layer for 20+ data sources."""

from importlib.metadata import PackageNotFoundError
from importlib.metadata import version as _pkg_version

from quill.engine import QuillEngine
from quill.model.data_source import DataSource
from quill.model.error import QuillError

try:
    __version__ = _pkg_version("quill")
except PackageNotFoundError:  # editable install without metadata, dev checkouts
    __version__ = "0.0.0+unknown"

__all__ = ["QuillEngine", "DataSource", "QuillError", "__version__"]
