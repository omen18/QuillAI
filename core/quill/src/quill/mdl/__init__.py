"""MDL processing utilities backed by quill-core-py."""

from functools import cache

import quill_core


@cache
def get_session_context(
    manifest_str: str | None,
    function_path: str | None,
    properties: frozenset | None = None,
    data_source: str | None = None,
) -> quill_core.SessionContext:
    return quill_core.SessionContext(
        manifest_str, function_path, properties, data_source
    )


def get_manifest_extractor(manifest_str: str) -> quill_core.ManifestExtractor:
    return quill_core.ManifestExtractor(manifest_str)


def to_json_base64(manifest) -> str:
    return quill_core.to_json_base64(manifest)


def transform_sql(
    manifest_str: str,
    sql: str,
    data_source: str | None = None,
    function_path: str | None = None,
    properties: dict | None = None,
) -> str:
    """Transform SQL through quill-core MDL processing.

    Returns the planned SQL string (dialect-neutral DataFusion SQL).
    """
    processed = None
    if properties:
        processed = frozenset(properties.items())

    session = get_session_context(manifest_str, function_path, processed, data_source)
    return session.transform_sql(sql)
