"""SDK-specific exception types for quill-pydantic."""


class QuillToolkitInitError(Exception):
    """Raised when ``QuillToolkit.from_project(...)`` cannot validate prerequisites.

    Examples include missing ``quill_project.yml``, missing ``target/mdl.json``,
    or unresolvable profile.
    """


class MemoryNotEnabledError(Exception):
    """Raised when memory operations are called but no memory provider is active.

    Triggered by direct API access to ``toolkit.memory.*`` when the toolkit
    was initialized against a project without ``.quill/memory/``. LLM-facing
    tools handle this case via tool filtering, not by raising.
    """
