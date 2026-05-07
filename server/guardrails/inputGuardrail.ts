export interface GuardrailResult {
  passed: boolean;
  reason?: string;
}

export function checkInputGuardrail(input: string): GuardrailResult {
  if (!input || input.trim().length < 3) {
    return { passed: false, reason: "Input too short" };
  }

  if (input.length > 50000) {
    return { passed: false, reason: "Input exceeds maximum length" };
  }

  return { passed: true };
}
