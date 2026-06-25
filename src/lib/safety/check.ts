/**
 * Crisis detection helper for therapist chat.
 * Checks for indicators of self-harm, suicide, or harm to others.
 */

const CRISIS_PATTERNS = [
  /\bsuicid(e|al)\b/i,
  /\bkill\s+my(self|life)\b/i,
  /\bend\s+my\s+life\b/i,
  /\bend\s+it\s+all\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bdon'?t\s+want\s+to\s+live\b/i,
  /\b(hurt|harm)\s+myself\b/i,
  /\bcut(ting)?\s+myself\b/i,
  /\bself-harm\b/i,
  /\boverdos(e|ing)\b/i,
  /\bhang\s+myself\b/i,
  /\bslit\s+my\s+wrist\b/i,
  /\bkms\b/i,
  /\bkill\s+(others|someone|people)\b/i,
  /\bhurt\s+(others|someone|people)\b/i,
  /\bharm\s+(others|someone|people)\b/i,
];

export interface SafetyCheckResult {
  isCrisis: boolean;
  matchedPattern?: string;
}

export function checkCrisis(text: string): SafetyCheckResult {
  if (!text) {
    return { isCrisis: false };
  }

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isCrisis: true,
        matchedPattern: pattern.toString(),
      };
    }
  }

  return { isCrisis: false };
}
