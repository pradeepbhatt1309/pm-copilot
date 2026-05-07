# Skills — CLAUDE.md

<!-- glob: skills/*.md -->
<!-- glob: .claude/skills/**/*.md -->

All skill files MUST include SKILL.md frontmatter with these fields:
- name: string (kebab-case)
- description: one-sentence description
- trigger: precise conditions that activate this skill
- input: what the skill expects
- output: what the skill returns
- do-not-use: explicit exclusions

## Skill Inventory
1. email-triage — triage and draft replies to professional emails
2. meeting-notes — extract decisions and actions from meeting notes
3. weekly-report — generate leadership summary from project updates
4. risk-radar — identify and assess project risks
5. stakeholder-brief — generate context brief for a stakeholder

## Trigger Precision
Triggers must be specific enough to avoid false positives.
Each skill should have at least 3 concrete trigger examples.
Conflicting triggers: email-triage takes precedence over risk-radar for emails.
