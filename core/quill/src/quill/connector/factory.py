import importlib

from quill.model.data_source import DataSource
from quill.model.error import ErrorCode, QuillError

_REGISTRY: dict[DataSource, str] = {
    DataSource.postgres: "quill.connector.postgres",
    DataSource.mysql: "quill.connector.mysql",
    DataSource.doris: "quill.connector.mysql",
    DataSource.mssql: "quill.connector.mssql",
    DataSource.quill: "quill.connector.quill",
    DataSource.bigquery: "quill.connector.bigquery",
    DataSource.datafusion: "quill.connector.datafusion",
    DataSource.local_file: "quill.connector.duckdb",
    DataSource.s3_file: "quill.connector.duckdb",
    DataSource.minio_file: "quill.connector.duckdb",
    DataSource.gcs_file: "quill.connector.duckdb",
    DataSource.duckdb: "quill.connector.duckdb",
    DataSource.redshift: "quill.connector.redshift",
    DataSource.spark: "quill.connector.spark",
    DataSource.databricks: "quill.connector.databricks",
    DataSource.trino: "quill.connector.trino",
    DataSource.clickhouse: "quill.connector.clickhouse",
    DataSource.oracle: "quill.connector.oracle",
    DataSource.snowflake: "quill.connector.snowflake",
    DataSource.athena: "quill.connector.athena",
}

# Map data sources to the correct pip extra when they share a connector module
_INSTALL_EXTRA: dict[DataSource, str] = {
    DataSource.doris: "mysql",
    DataSource.quill: "postgres",
    DataSource.local_file: "duckdb",
    DataSource.s3_file: "duckdb",
    DataSource.minio_file: "duckdb",
    DataSource.gcs_file: "duckdb",
}

_NEEDS_DATA_SOURCE = {
    DataSource.mysql,
    DataSource.doris,
    DataSource.trino,
}


def get_connector(data_source: DataSource, connection_info):
    module_path = _REGISTRY.get(data_source)
    if module_path is None:
        raise QuillError(
            ErrorCode.NOT_IMPLEMENTED,
            f"Unsupported data source: {data_source}",
        )

    try:
        module = importlib.import_module(module_path)
    except ImportError as e:
        extra = _INSTALL_EXTRA.get(data_source, data_source.value)
        raise QuillError(
            ErrorCode.NOT_IMPLEMENTED,
            f"Connector '{data_source.value}' requires additional dependencies: {e}. "
            f"Install with: pip install 'quill[{extra}]'",
        ) from e

    if data_source in _NEEDS_DATA_SOURCE:
        return module.create_connector(data_source, connection_info)
    return module.create_connector(connection_info)
