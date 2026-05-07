export interface OutputGuardrailResult {
  passed: boolean;
  reason?: string;
  output?: Record<string, unknown>;
}

export function checkOutputGuardrail(output: unknown): OutputGuardrailResult {
  if (typeof output !== "object" || output === null) {
    return { passed: false, reason: "Output is not a valid object" };
  }

  return { passed: true, output: output as Record<string, unknown> };
}
