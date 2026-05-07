import { v4 as uuidv4 } from "uuid";

export interface StakeholderProfile {
  id: string;
  name: string;
  organisation: string;
  role: string;
  projects: string[];
  currentConcerns: string[];
  communicationStyle: string;
  openActions: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectProfile {
  id: string;
  name: string;
  status: "On Track" | "At Risk" | "Delayed" | "Delivered";
  lead: string;
  stakeholder: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  id: string;
  timestamp: Date;
  rawInput: string;
  inputType: string[];
  agentsCalled: string[];
  output: Record<string, unknown>;
  processingTime: number;
}

export interface Session {
  id: string;
  startedAt: Date;
  lastActivity: Date;
  interactions: Interaction[];
}

class InMemoryStore {
  private stakeholders: Map<string, StakeholderProfile> = new Map();
  private projects: Map<string, ProjectProfile> = new Map();
  private session: Session;
  private failureCount = 0;

  constructor() {
    this.session = {
      id: uuidv4(),
      startedAt: new Date(),
      lastActivity: new Date(),
      interactions: [],
    };
    this.seedData();
  }

  private seedData() {
    const stakeholderSeeds: Omit<StakeholderProfile, "id" | "createdAt" | "updatedAt">[] = [
      {
        name: "Sarah Mitchell",
        organisation: "Client Co",
        role: "Vertical Lead / Director",
        projects: ["Project Alpha", "Project Beta"],
        currentConcerns: ["Alpha delivery delay", "Q2 board review"],
        communicationStyle: "Direct, expects clear timelines",
        openActions: ["Awaiting timeline confirmation"],
        notes: "",
      },
      {
        name: "James Patel",
        organisation: "Client Co",
        role: "Decision Maker",
        projects: ["Project Gamma", "Project Delta"],
        currentConcerns: ["UAT progress", "Phase 2 planning"],
        communicationStyle: "Data-driven, needs numbers",
        openActions: [],
        notes: "",
      },
      {
        name: "Priya Sharma",
        organisation: "Client Co",
        role: "Product Manager",
        projects: ["Project Beta", "Project Epsilon"],
        currentConcerns: ["Scope expansion", "Enhancement backlog"],
        communicationStyle: "Collaborative, detail-oriented",
        openActions: [],
        notes: "",
      },
      {
        name: "Robert Chen",
        organisation: "Client Co",
        role: "Engineering Partner",
        projects: ["Project Alpha", "Project Beta", "Project Gamma", "Project Delta", "Project Epsilon"],
        currentConcerns: ["Overall programme health"],
        communicationStyle: "Executive, outcomes-focused",
        openActions: [],
        notes: "",
      },
      {
        name: "Alex Thompson",
        organisation: "Delivery Co",
        role: "Delivery Lead",
        projects: ["Project Alpha", "Project Beta"],
        currentConcerns: ["Resource availability", "Timeline"],
        communicationStyle: "Technical, detail-oriented",
        openActions: [],
        notes: "",
      },
      {
        name: "Maya Singh",
        organisation: "Delivery Co",
        role: "Internal Lead",
        projects: ["Project Gamma", "Project Delta"],
        currentConcerns: ["UAT blockers", "Prod access"],
        communicationStyle: "Direct, delivery-focused",
        openActions: [],
        notes: "",
      },
    ];

    for (const s of stakeholderSeeds) {
      const id = uuidv4();
      this.stakeholders.set(id, { ...s, id, createdAt: new Date(), updatedAt: new Date() });
    }

    const projectSeeds: Omit<ProjectProfile, "id" | "createdAt" | "updatedAt">[] = [
      { name: "Project Alpha", status: "At Risk", lead: "Alex Thompson", stakeholder: "Sarah Mitchell", notes: "Beta delayed. Re-architecture in progress." },
      { name: "Project Beta", status: "On Track", lead: "Alex Thompson", stakeholder: "Sarah Mitchell", notes: "Phase 2 active. On track for June delivery." },
      { name: "Project Gamma", status: "On Track", lead: "Maya Singh", stakeholder: "James Patel", notes: "MVP live. Phase 2 enhancements in progress." },
      { name: "Project Delta", status: "At Risk", lead: "Maya Singh", stakeholder: "James Patel", notes: "Final UAT phase. Prod resources not yet assigned." },
      { name: "Project Epsilon", status: "On Track", lead: "Delivery Co Team", stakeholder: "Priya Sharma", notes: "Delivered Phase 1. Enhancement backlog active." },
    ];

    for (const p of projectSeeds) {
      const id = uuidv4();
      this.projects.set(id, { ...p, id, createdAt: new Date(), updatedAt: new Date() });
    }
  }

  // Stakeholder CRUD
  getAllStakeholders(): StakeholderProfile[] {
    return Array.from(this.stakeholders.values());
  }
  getStakeholder(id: string): StakeholderProfile | undefined {
    return this.stakeholders.get(id);
  }
  findStakeholderByName(name: string): StakeholderProfile | undefined {
    const lower = name.toLowerCase();
    return Array.from(this.stakeholders.values()).find(s => s.name.toLowerCase().includes(lower));
  }
  createStakeholder(data: Omit<StakeholderProfile, "id" | "createdAt" | "updatedAt">): StakeholderProfile {
    const id = uuidv4();
    const stakeholder: StakeholderProfile = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    this.stakeholders.set(id, stakeholder);
    return stakeholder;
  }
  updateStakeholder(id: string, data: Partial<StakeholderProfile>): StakeholderProfile | undefined {
    const existing = this.stakeholders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    this.stakeholders.set(id, updated);
    return updated;
  }
  deleteStakeholder(id: string): boolean {
    return this.stakeholders.delete(id);
  }

  // Project CRUD
  getAllProjects(): ProjectProfile[] {
    return Array.from(this.projects.values());
  }
  getProject(id: string): ProjectProfile | undefined {
    return this.projects.get(id);
  }
  createProject(data: Omit<ProjectProfile, "id" | "createdAt" | "updatedAt">): ProjectProfile {
    const id = uuidv4();
    const project: ProjectProfile = { ...data, id, createdAt: new Date(), updatedAt: new Date() };
    this.projects.set(id, project);
    return project;
  }
  updateProject(id: string, data: Partial<ProjectProfile>): ProjectProfile | undefined {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }
  deleteProject(id: string): boolean {
    return this.projects.delete(id);
  }

  // Session / Interactions
  addInteraction(interaction: Omit<Interaction, "id">): Interaction {
    const id = uuidv4();
    const full: Interaction = { ...interaction, id };
    this.session.lastActivity = new Date();
    this.session.interactions.push(full);
    // Summarise after 10 interactions - keep last 20 in memory
    if (this.session.interactions.length > 20) {
      this.session.interactions = this.session.interactions.slice(-20);
    }
    return full;
  }
  getRecentInteractions(limit = 10): Interaction[] {
    return this.session.interactions.slice(-limit);
  }
  clearSession() {
    this.session.interactions = [];
  }

  // Circuit breaker
  recordFailure() { this.failureCount++; }
  recordSuccess() { this.failureCount = 0; }
  isCircuitOpen(): boolean { return this.failureCount >= 5; }
  getSession(): Session { return this.session; }
}

export const store = new InMemoryStore();
