"""Guard tests for the skills/ distribution stubs.

The new model:
- skills/quill/SKILL.md is the single discovery stub that lists every CLI surface.
- The five previously-shipped fat skills (and their one-release redirect
  stubs) are gone — agents fetch workflow guides via `quill skills get`.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

pytestmark = pytest.mark.unit

_REPO = Path(__file__).resolve().parents[4]
_SKILLS = _REPO / "skills"

DEPRECATED_DIRS = [
    "quill-onboarding",
    "quill-usage",
    "quill-generate-mdl",
    "quill-dlt-connector",
    "quill-enrich-context",
]


def test_discovery_stub_exists():
    stub = _SKILLS / "quill" / "SKILL.md"
    assert stub.is_file()
    text = stub.read_text()
    assert text.startswith("---")
    assert "allowed-tools:" in text
    # discovery stub points at the CLI surfaces
    assert "quill skills list" in text
    assert "quill docs connection-info" in text
    assert "quill ask" in text


def test_deprecated_dirs_removed():
    """The five deprecated redirect-stub dirs must NOT come back: regenerating
    them would reintroduce the version-drift problem the new model exists to
    solve."""
    for name in DEPRECATED_DIRS:
        assert not (_SKILLS / name).exists(), (
            f"skills/{name}/ was removed when the redirect window closed; "
            "do not reintroduce. Content lives in core/quill/src/quill/"
            f"skills_content/{name.removeprefix('quill-')}/."
        )


def test_versions_json_removed():
    assert not (_SKILLS / "versions.json").exists(), (
        "versions.json should be deleted (version drift impossible in the new model)"
    )
    assert not (_SKILLS / "check-versions.sh").exists(), (
        "check-versions.sh should be deleted (no per-skill versions anymore)"
    )


def test_install_sh_installs_discovery_stub():
    install = (_SKILLS / "install.sh").read_text()
    assert 'SKILL="quill"' in install, (
        "install.sh must install the new `quill` discovery stub"
    )


def test_index_json_lists_only_discovery_stub():
    data = json.loads((_SKILLS / "index.json").read_text())
    names = [s["name"] for s in data["skills"]]
    assert names == ["quill"], (
        f"index.json must list only the discovery stub, got: {names}"
    )
