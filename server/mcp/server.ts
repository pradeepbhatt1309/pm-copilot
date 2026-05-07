import { getMcpResources, EMAIL_TEMPLATES } from "./resources.js";
import { store } from "../storage.js";

export function getMcpContext(stakeholderName?: string): string {
  const resources = getMcpResources();

  let context = "## MCP Knowledge Base\n\n";

  if (stakeholderName) {
    const stakeholder = store.findStakeholderByName(stakeholderName);
    if (stakeholder) {
      const projects = store.getAllProjects().filter(p => stakeholder.projects.includes(p.name));
      context += `### Stakeholder: ${stakeholder.name}\n${JSON.stringify(stakeholder, null, 2)}\n\n`;
      context += `### Related Projects:\n${JSON.stringify(projects, null, 2)}\n\n`;
    }
  } else {
    context += `### All Stakeholders:\n${resources.stakeholders.map(s => `- ${s.name}: ${s.description}`).join("\n")}\n\n`;
    context += `### Active Projects:\n${resources.projects.map(p => `- ${p.name}: ${p.description}`).join("\n")}\n\n`;
  }

  context += `### Available Templates:\n${Object.keys(EMAIL_TEMPLATES).join(", ")}\n`;

  return context;
}

export function searchKnowledgeBase(query: string): string {
  const stakeholders = store.getAllStakeholders();
  const projects = store.getAllProjects();
  const queryLower = query.toLowerCase();

  const matchedStakeholders = stakeholders.filter(s =>
    s.name.toLowerCase().includes(queryLower) ||
    s.role.toLowerCase().includes(queryLower) ||
    s.organisation.toLowerCase().includes(queryLower) ||
    s.projects.some(p => p.toLowerCase().includes(queryLower))
  );

  const matchedProjects = projects.filter(p =>
    p.name.toLowerCase().includes(queryLower) ||
    p.notes.toLowerCase().includes(queryLower) ||
    p.lead.toLowerCase().includes(queryLower)
  );

  return JSON.stringify({ stakeholders: matchedStakeholders, projects: matchedProjects });
}
