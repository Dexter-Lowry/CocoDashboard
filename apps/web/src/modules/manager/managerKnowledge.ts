export type ManagerSection = {
  title: string
  items: string[]
}

export const managerMissionAnchor =
  'Keep the dashboard tools stable while delivering incremental improvements with clear delegation.'

export const managerChanges: string[] = [
  'Manager agent now generates mission-aware delegate briefs and reusable templates for head-agent handoffs.',
  'Delegation template lives at templates/delegation_template.md and is included in manager outputs.',
  'Verifier agent keeps AGENTS.md, manager guidance, and required paths honest after updates.',
  'Session-start snapshot records git status, untracked artifacts, and verifier results with --session-start.'
]

export const managerCapabilities: string[] = [
  'Re-prompt agents with mission, compute-hygiene reminders, and concise task lists.',
  'Emit delegate notes and structured templates in text or JSON for the head agent.',
  'Cross-check the handoff guide, repository map, and required scripts to keep instructions accurate.',
  'Capture a session-start report of git status, new artifacts, and verifier health before work begins.'
]

export const managerRisks: string[] = [
  'Run scripts/verify_handoff.py after edits so AGENTS.md stays truthful.',
  'Keep delegate notes aligned with the mission; override it explicitly when priorities shift.',
  'Mind compute time: prefer concise prompts, reuse templates, and avoid redundant refreshes.'
]

export const managerNextSteps: string[] = [
  'Share a delegate note with the head agent using the template to align on priorities.',
  'Confirm AGENTS.md plus templates remain accurate by running scripts/verify_handoff.py.',
  'Capture any new feature requests in a brief so the manager can route them efficiently.',
  'Start your session with python scripts/manage_agents.py --session-start to log state and verify instructions.'
]

export const quickPrompts = [
  {
    label: 'Recent changes',
    prompt: 'Summarize what changed and what to watch for.'
  },
  {
    label: 'Risks',
    prompt: 'What problems or risks should I know about?'
  },
  {
    label: 'Features',
    prompt: 'Walk me through the manager capabilities and templates.'
  },
  {
    label: 'Next steps',
    prompt: 'Propose next steps for the head agent.'
  },
  {
    label: 'Session start',
    prompt: 'Run the session-start snapshot and tell me what changed plus any artifacts.'
  }
]
