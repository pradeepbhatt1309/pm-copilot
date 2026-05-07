import { store } from "../storage.js";

export interface PostOutputData {
  input: string;
  output: Record<string, unknown>;
  agentsCalled: string[];
  processingTime: number;
  inputType: string[];
}

export function runPostOutputHook(data: PostOutputData): void {
  // Log interaction to session
  store.addInteraction({
    timestamp: new Date(),
    rawInput: data.input,
    inputType: data.inputType,
    agentsCalled: data.agentsCalled,
    output: data.output,
    processingTime: data.processingTime,
  });
}
