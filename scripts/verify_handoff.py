#!/usr/bin/env python3
"""Verifier agent to keep AGENTS.md accurate.

This script performs lightweight checks to confirm that the master handoff
instructions describe the repository correctly and still include key rules.
"""
from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, List

ROOT = Path(__file__).resolve().parents[1]
DOC_PATH = ROOT / "AGENTS.md"


@dataclass
class CheckResult:
    description: str
    passed: bool
    detail: str | None = None


def file_exists(path: Path) -> CheckResult:
    return CheckResult(
        description=f"{path.relative_to(ROOT)} exists",
        passed=path.exists(),
        detail=None if path.exists() else "Missing expected file or directory",
    )


def doc_contains(phrase: str) -> CheckResult:
    if not DOC_PATH.exists():
        return CheckResult(description="AGENTS.md is present", passed=False, detail="AGENTS.md not found")

    content = DOC_PATH.read_text(encoding="utf-8")
    found = phrase in content
    return CheckResult(
        description=f"AGENTS.md mentions '{phrase}'",
        passed=found,
        detail=None if found else "Update AGENTS.md to include required instruction",
    )


def run_checks(checks: Iterable[Callable[[], CheckResult]]) -> List[CheckResult]:
    return [check() for check in checks]


def print_report(results: List[CheckResult]) -> None:
    for result in results:
        status = "PASS" if result.passed else "FAIL"
        line = f"[{status}] {result.description}"
        if result.detail and not result.passed:
            line += f" - {result.detail}"
        print(line)


def main() -> int:
    checks: List[Callable[[], CheckResult]] = [
        lambda: file_exists(DOC_PATH),
        lambda: doc_contains("concise summary of what you changed"),
        lambda: doc_contains("File structure snapshot"),
        lambda: doc_contains("Plan.md"),
        lambda: doc_contains("scripts/manage_agents.py"),
        lambda: doc_contains("templates/delegation_template.md"),
        lambda: doc_contains("delegation template"),
        lambda: doc_contains("delegate-note"),
        lambda: doc_contains("--session-start"),
        lambda: doc_contains("Start every session"),
        lambda: doc_contains("scripts/verify_handoff.py"),
        lambda: file_exists(ROOT / "apps" / "web"),
        lambda: file_exists(ROOT / "apps" / "web" / "package.json"),
        lambda: file_exists(ROOT / "apps" / "web" / "vite.config.ts"),
        lambda: file_exists(ROOT / "apps" / "web" / "src"),
        lambda: file_exists(ROOT / "coco-dashboard"),
        lambda: file_exists(ROOT / "coco-dashboard" / "README.md"),
        lambda: file_exists(ROOT / "coco-dashboard" / "build.gradle.kts"),
        lambda: file_exists(ROOT / "coco-dashboard" / "app"),
        lambda: file_exists(ROOT / "templates" / "delegation_template.md"),
        lambda: file_exists(ROOT / "scripts" / "manage_agents.py"),
        lambda: file_exists(ROOT / "scripts" / "verify_handoff.py"),
    ]

    results = run_checks(checks)
    print_report(results)

    failures = [r for r in results if not r.passed]
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
