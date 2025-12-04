#!/usr/bin/env python3
"""Manager agent to re-prompt contributors and propose tasks.

The script summarizes the main mission, efficiency reminders, and
suggested tasks so agents can stay aligned and use compute time wisely.
"""
from __future__ import annotations

import argparse
import json
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List

ROOT = Path(__file__).resolve().parents[1]
HANDOFF_PATH = ROOT / "AGENTS.md"

MISSION = (
    "Keep AGENTS.md accurate, ship focused changes across apps/web and "
    "coco-dashboard, and conserve compute by running the smallest useful checks."
)


@dataclass
class Task:
    title: str
    reason: str
    steps: List[str]


@dataclass
class AgentBrief:
    mission: str
    quick_checks: List[str]
    compute_hygiene: List[str]
    tasks: List[Task]
    session_snapshot: SessionSnapshot | None = None


@dataclass
class DelegateBrief:
    mission: str
    note: str
    call_to_action: List[str]


@dataclass
class DelegateTemplate:
    mission: str
    delegate_note: str
    sections: List[str]


@dataclass
class SessionSnapshot:
    status: List[str]
    untracked: List[str]
    verifier_summary: str


def build_quick_checks() -> List[str]:
    return [
        "Read AGENTS.md fully before editing anything.",
        "Run python scripts/verify_handoff.py after pulling or updating instructions.",
        "Use repo-specific workflows (npm for apps/web, Gradle for coco-dashboard).",
        "End final responses with a concise summary of changes and relevant tests.",
        "At session start, run python scripts/manage_agents.py --session-start to snapshot changes and artifacts.",
    ]


def build_compute_hygiene() -> List[str]:
    return [
        "Prefer targeted commands (rg over grep -R, scoped builds over full rebuilds).",
        "Batch related edits to reduce redundant tooling and formatting passes.",
        "Preview commands before running long tasks; stop anything not adding value.",
    ]


def build_tasks() -> List[Task]:
    tasks: List[Task] = [
        Task(
            title="Confirm handoff accuracy",
            reason="Keeps the master guide trustworthy for every agent",
            steps=[
                "Open AGENTS.md and ensure the quick-start, file snapshot, and working agreements reflect reality.",
                "Run python scripts/verify_handoff.py and address any failures.",
            ],
        ),
        Task(
            title="Plan next incremental change",
            reason="Maintains focus on small, scoped improvements",
            steps=[
                "Identify the smallest valuable task in apps/web or coco-dashboard.",
                "Capture the plan in your response and execute only the scoped steps.",
            ],
        ),
        Task(
            title="Start-of-session intake",
            reason="Ensures every session logs state, artifacts, and instruction fidelity",
            steps=[
                "Run python scripts/manage_agents.py --session-start to record git status and new artifacts.",
                "Review verifier results and fix any mismatches before proceeding.",
            ],
        ),
        Task(
            title="Audit compute usage",
            reason="Prevents wasted cycles while agents iterate",
            steps=[
                "Review recent commands; replace heavy scans with rg or targeted builds.",
                "Document any efficiency tweaks in your notes for the next agent.",
            ],
        ),
    ]

    return tasks


def load_handoff_snippet(path: Path) -> str:
    if not path.exists():
        return "AGENTS.md not found; create it before proceeding."

    content = path.read_text(encoding="utf-8")
    start = content.splitlines()
    preview_lines = []
    for line in start:
        preview_lines.append(line)
        if len(preview_lines) >= 5:
            break
    snippet = "\n".join(preview_lines)
    return f"Preview from AGENTS.md:\n{snippet}"


def build_brief(mission: str) -> AgentBrief:
    return AgentBrief(
        mission=mission,
        quick_checks=build_quick_checks(),
        compute_hygiene=build_compute_hygiene(),
        tasks=build_tasks(),
        session_snapshot=None,
    )


def build_delegate_brief(mission: str, note: str) -> DelegateBrief:
    return DelegateBrief(
        mission=mission,
        note=note,
        call_to_action=[
            "Restate the mission and align all contributors on priorities.",
            "Break the delegate note into concrete tasks with owners and due order.",
            "Report back with the assigned tasks and any blockers or risks.",
        ],
    )


def build_delegate_template(mission: str, note: str | None) -> DelegateTemplate:
    return DelegateTemplate(
        mission=mission,
        delegate_note=note or "<what you need the head agent to drive>",
        sections=[
            "Mission anchor: mission, delegate note, and time sensitivity",
            "Context: current state, desired outcome, and constraints",
            "Priority tasks: owners, ordering, and expected outputs",
            "Risks and dependencies: blockers plus mitigations",
            "Check-ins: sync rhythm, reporting format, and completion signal",
        ],
    )


def gather_git_status() -> tuple[List[str], List[str]]:
    try:
        proc = subprocess.run(
            ["git", "status", "-sb"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        lines = [line.strip() for line in proc.stdout.splitlines() if line.strip()]
    except Exception as exc:  # pragma: no cover - defensive logging only
        return [f"Unable to read git status: {exc}"], []

    if not lines:
        lines = ["Working tree clean"]

    untracked = []
    for line in lines:
        if line.startswith("??"):
            untracked.append(line.replace("??", "", 1).strip())

    return lines, untracked


def run_verifier() -> str:
    verifier_path = ROOT / "scripts" / "verify_handoff.py"
    if not verifier_path.exists():
        return "Verifier missing; expected scripts/verify_handoff.py"

    proc = subprocess.run(
        ["python", str(verifier_path)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    status = "PASS" if proc.returncode == 0 else "FAIL"
    summary_lines = [line.strip() for line in proc.stdout.splitlines() if line.strip()]
    summary_excerpt = "; ".join(summary_lines[:5]) if summary_lines else "No verifier output"
    return f"{status}: {summary_excerpt}"


def build_session_snapshot(include_snapshot: bool) -> SessionSnapshot | None:
    if not include_snapshot:
        return None

    status_lines, untracked = gather_git_status()
    verifier_summary = run_verifier()
    return SessionSnapshot(status=status_lines, untracked=untracked, verifier_summary=verifier_summary)


def format_brief_as_text(
    brief: AgentBrief,
    include_snippet: bool,
    delegate_brief: DelegateBrief | None,
    delegate_template: DelegateTemplate | None,
    session_snapshot: SessionSnapshot | None,
) -> str:
    lines = ["=== Manager Agent Brief ===", f"Mission: {brief.mission}", ""]

    lines.append("Quick checks:")
    lines.extend([f"- {item}" for item in brief.quick_checks])
    lines.append("")

    lines.append("Compute hygiene:")
    lines.extend([f"- {item}" for item in brief.compute_hygiene])
    lines.append("")

    lines.append("Suggested tasks:")
    for task in brief.tasks:
        lines.append(f"- {task.title} — {task.reason}")
        for step in task.steps:
            lines.append(f"  • {step}")
    lines.append("")

    if session_snapshot:
        lines.append("=== Session start snapshot ===")
        lines.append("Working tree status:")
        lines.extend([f"- {line}" for line in session_snapshot.status])
        if session_snapshot.untracked:
            lines.append("Untracked artifacts:")
            lines.extend([f"  • {item}" for item in session_snapshot.untracked])
        lines.append(f"Verifier: {session_snapshot.verifier_summary}")
        lines.append("")

    if delegate_brief:
        lines.append("=== Delegate Brief for Head Agent ===")
        lines.append(f"Mission anchor: {delegate_brief.mission}")
        lines.append(f"Delegate note: {delegate_brief.note}")
        lines.append("Call to action:")
        for item in delegate_brief.call_to_action:
            lines.append(f"- {item}")
        lines.append("")

    if delegate_template:
        lines.append("=== Delegation Template ===")
        lines.append(f"Mission: {delegate_template.mission}")
        lines.append(f"Delegate note: {delegate_template.delegate_note}")
        lines.append("Fill out these sections before handing off:")
        for section in delegate_template.sections:
            lines.append(f"- {section}")
        lines.append("")

    if include_snippet:
        lines.append(load_handoff_snippet(HANDOFF_PATH))

    return "\n".join(lines)


def format_brief(
    brief: AgentBrief,
    output_format: str,
    include_snippet: bool,
    delegate_brief: DelegateBrief | None,
    delegate_template: DelegateTemplate | None,
    session_snapshot: SessionSnapshot | None,
) -> str:
    if output_format == "json":
        payload = asdict(brief)
        if payload.get("session_snapshot") is None:
            payload.pop("session_snapshot", None)
        if delegate_brief:
            payload["delegate_brief"] = asdict(delegate_brief)
        if delegate_template:
            payload["delegate_template"] = asdict(delegate_template)
        if session_snapshot:
            payload["session_snapshot"] = asdict(session_snapshot)
        if include_snippet:
            payload["handoff_preview"] = load_handoff_snippet(HANDOFF_PATH)
        return json.dumps(payload, indent=2)

    return format_brief_as_text(
        brief,
        include_snippet,
        delegate_brief,
        delegate_template,
        session_snapshot,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Re-prompt agents with the mission, efficiency reminders, and actionable tasks.",
    )
    parser.add_argument(
        "--format",
        choices=["text", "json"],
        default="text",
        help="Choose text or json output (default: text).",
    )
    parser.add_argument(
        "--no-snippet",
        action="store_true",
        help="Skip including a short preview from AGENTS.md.",
    )
    parser.add_argument(
        "--mission",
        help="Override the default mission when re-prompts require custom focus.",
    )
    parser.add_argument(
        "--delegate-note",
        help=(
            "Message for the head agent to turn into delegated tasks; pairs with the mission to drive assignments."
        ),
    )
    parser.add_argument(
        "--template",
        action="store_true",
        help="Include a delegation template that can be copied into a head-agent brief.",
    )
    parser.add_argument(
        "--session-start",
        action="store_true",
        help="Capture git status, untracked artifacts, and verifier results for new sessions.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    mission = args.mission or MISSION
    brief = build_brief(mission)
    session_snapshot = build_session_snapshot(args.session_start)
    brief.session_snapshot = session_snapshot
    delegate_brief = None
    delegate_template = None
    if args.delegate_note:
        delegate_brief = build_delegate_brief(mission=mission, note=args.delegate_note)
    if args.template:
        delegate_template = build_delegate_template(mission=mission, note=args.delegate_note)

    output = format_brief(
        brief,
        args.format,
        include_snippet=not args.no_snippet,
        delegate_brief=delegate_brief,
        delegate_template=delegate_template,
        session_snapshot=session_snapshot,
    )
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
