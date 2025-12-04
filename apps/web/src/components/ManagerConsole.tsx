import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import {
  managerCapabilities,
  managerChanges,
  managerMissionAnchor,
  managerNextSteps,
  managerRisks,
  quickPrompts,
  type ManagerSection
} from '../modules/manager/managerKnowledge'

type ConversationMessage = {
  id: string
  role: 'manager' | 'user'
  headline?: string
  body?: string
  sections?: ManagerSection[]
  timestamp: string
}

const defaultSections: ManagerSection[] = [
  { title: 'Recent changes', items: managerChanges },
  { title: 'Capabilities', items: managerCapabilities },
  { title: 'Risks & watchouts', items: managerRisks }
]

const buildResponse = (prompt: string): Pick<ConversationMessage, 'headline' | 'body' | 'sections'> => {
  const normalized = prompt.toLowerCase()
  const wantsChanges = /change|update|recent/.test(normalized)
  const wantsRisks = /risk|problem|issue|block/.test(normalized)
  const wantsFeatures = /feature|capability/.test(normalized)
  const wantsNext = /next|task|plan|step/.test(normalized)

  const sections: ManagerSection[] = []

  if (wantsChanges || (!wantsRisks && !wantsFeatures && !wantsNext)) {
    sections.push({ title: 'Recent changes', items: managerChanges })
  }

  if (wantsFeatures || (!wantsChanges && !wantsRisks && !wantsNext)) {
    sections.push({ title: 'Capabilities', items: managerCapabilities })
  }

  if (wantsRisks) {
    sections.push({ title: 'Risks & watchouts', items: managerRisks })
  }

  if (wantsNext) {
    sections.push({ title: 'Next steps', items: managerNextSteps })
  }

  const headline = wantsNext
    ? 'Here is a mission-ready brief with tasks you can assign.'
    : wantsRisks
      ? "I've flagged the risks and habits to keep the mission safe."
      : wantsFeatures
        ? 'Here is what the manager can deliver right now.'
        : 'Mission check-in ready. Here is the latest intel.'

  const body = wantsRisks
    ? 'I will keep the head agent on-mission and avoid wasted compute while we address these.'
    : 'Let me know if you want a delegate note or template for the head agent.'

  return { headline, body, sections }
}

const createMessage = (
  role: ConversationMessage['role'],
  prompt: string,
  extras?: Pick<ConversationMessage, 'headline' | 'body' | 'sections'>
): ConversationMessage => ({
  id: crypto.randomUUID(),
  role,
  body: extras?.body,
  headline: extras?.headline || prompt,
  sections: extras?.sections,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

export function ManagerConsole() {
  const [input, setInput] = useState('What changed recently?')
  const [messages, setMessages] = useState<ConversationMessage[]>(() => [
    createMessage('manager', 'Manager online', {
      headline: 'Manager online and synced to mission.',
      body: 'Ask me for changes, risks, or feature rundowns and I will brief you with what matters.',
      sections: defaultSections
    })
  ])

  const missionTag = useMemo(
    () => `Mission: ${managerMissionAnchor}`,
    []
  )

  const addPrompt = (prompt: string) => {
    if (!prompt.trim()) return
    const managerReply = buildResponse(prompt)
    setMessages((prev) => [
      ...prev,
      createMessage('user', prompt),
      createMessage('manager', prompt, managerReply)
    ])
    setInput('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    addPrompt(input)
  }

  return (
    <section className="manager-console">
      <div className="manager-top">
        <div>
          <p className="eyebrow">Manager brief</p>
          <h2>Talk to the manager</h2>
          <p className="subtitle">
            Ask about recent changes, risks, or available features. I will reply with a
            delegate-ready brief you can hand to the head agent.
          </p>
        </div>
        <div className="mission-chip" aria-label="Mission statement">
          <span className="chip-label">On-mission</span>
          <span className="chip-value">{missionTag}</span>
        </div>
      </div>

      <div className="manager-quick-actions">
        <span className="quick-actions-label">Quick asks</span>
        <div className="quick-actions">
          {quickPrompts.map((item) => (
            <button
              key={item.prompt}
              type="button"
              className="pill-button"
              onClick={() => addPrompt(item.prompt)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="manager-window">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`manager-message ${message.role === 'manager' ? 'manager' : 'user'}`}
            aria-label={`${message.role} message`}
          >
            <header className="message-head">
              <div className="message-meta">
                <span className="message-role">{message.role === 'manager' ? 'Manager' : 'You'}</span>
                <span className="message-time">{message.timestamp}</span>
              </div>
              {message.headline && <p className="message-title">{message.headline}</p>}
            </header>
            {message.body && <p className="message-body">{message.body}</p>}
            {message.sections && (
              <div className="message-sections">
                {message.sections.map((section) => (
                  <div className="message-section" key={section.title}>
                    <p className="section-title">{section.title}</p>
                    <ul className="section-list">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      <form className="manager-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="managerPrompt">
          Ask the manager a question
        </label>
        <input
          id="managerPrompt"
          name="managerPrompt"
          placeholder="Ask about changes, risks, features, or next steps"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="manager-input"
        />
        <button className="refresh-button" type="submit">
          Get brief
        </button>
      </form>
    </section>
  )
}
