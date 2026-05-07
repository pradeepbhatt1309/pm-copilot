import { store } from "../storage.js";

export const EMAIL_TEMPLATES = {
  "status-update": {
    subject: "Project Status Update — Week of {{weekOf}}",
    body: `Dear {{recipient}},

Please find below this week's project status update.

**Portfolio Summary:** {{portfolioHealth}}

**Key Updates:**
{{updates}}

**Actions Required:**
{{actions}}

Please let me know if you have any questions or concerns.

Best regards,
{{sender}}`,
  },
  "escalation": {
    subject: "ESCALATION: {{issue}} — Immediate Attention Required",
    body: `Dear {{recipient}},

I am writing to escalate the following issue that requires your immediate attention.

**Issue:** {{issue}}
**Severity:** {{severity}}
**Impact:** {{impact}}

**Recommended Actions:**
{{actions}}

I am available to discuss this at your earliest convenience.

Best regards,
{{sender}}`,
  },
  "risk-alert": {
    subject: "Risk Alert: {{riskTitle}} — {{severity}} Severity",
    body: `Dear {{recipient}},

I want to bring the following risk to your attention.

**Risk:** {{riskTitle}}
**Severity:** {{severity}}
**Likelihood:** {{likelihood}}
**Impact:** {{impact}}

**Proposed Mitigation:**
{{mitigation}}

Please advise on the appropriate escalation path.

Best regards,
{{sender}}`,
  },
  "meeting-summary": {
    subject: "Meeting Summary — {{meetingTitle}} — {{date}}",
    body: `Dear {{recipients}},

Thank you for attending today's meeting. Please find below a summary of the key points discussed.

**Decisions Made:**
{{decisions}}

**Action Items:**
{{actionItems}}

**Next Steps:**
{{nextSteps}}

Please confirm receipt and flag any corrections by end of business today.

Best regards,
{{sender}}`,
  },
};

export const REPORT_TEMPLATE = {
  subject: "Weekly Project Report — Week of {{weekOf}}",
  sections: ["Executive Summary", "Portfolio Health", "Project Updates", "Key Achievements", "Risks & Issues", "Decisions Required", "Next Week Outlook"],
};

export function getMcpResources() {
  const stakeholders = store.getAllStakeholders();
  const projects = store.getAllProjects();

  return {
    stakeholders: stakeholders.map(s => ({
      uri: `stakeholders://people/${s.id}`,
      name: s.name,
      description: `${s.role} at ${s.organisation}`,
      data: s,
    })),
    projects: projects.map(p => ({
      uri: `projects://active/${p.id}`,
      name: p.name,
      description: `Status: ${p.status}`,
      data: p,
    })),
    templates: Object.entries(EMAIL_TEMPLATES).map(([key, template]) => ({
      uri: `templates://email/${key}`,
      name: key,
      data: template,
    })),
  };
}
