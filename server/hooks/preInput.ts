export interface PreInputResult {
  allowed: boolean;
  sanitizedInput?: string;
  reason?: string;
  language?: string;
  timestamp: Date;
}

const SENSITIVE_PATTERNS = [
  /(?:api[_-]?key|password|secret|token)\s*[:=]\s*\S+/i,
  /sk-[a-zA-Z0-9]{32,}/,
  /Bearer\s+[a-zA-Z0-9\-._~+/]+=*/i,
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(?:a\s+)?(?:dan|evil|jailbreak)/i,
  /system\s*prompt\s*:\s*you\s+are/i,
  /\[\[.*\]\]/,
];

export function runPreInputHook(input: string): PreInputResult {
  const timestamp = new Date();

  if (!input || input.trim().length === 0) {
    return { allowed: false, reason: "Empty input", timestamp };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { allowed: false, reason: "Potential prompt injection detected", timestamp };
    }
  }

  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(input)) {
      return { allowed: false, reason: "Input contains potentially sensitive credentials", timestamp };
    }
  }

  const language = detectLanguage(input);

  return {
    allowed: true,
    sanitizedInput: input.trim(),
    language,
    timestamp,
  };
}

function detectLanguage(text: string): string {
  // Simple heuristic — most content will be English
  return "en";
}
