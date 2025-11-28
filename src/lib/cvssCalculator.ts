/**
 * CVSS 3.0 Calculator
 * Implements the CVSS v3.0 base score calculation according to the specification
 */

export interface CVSS3Metrics {
  attackVector: 'network' | 'adjacent' | 'local' | 'physical';
  attackComplexity: 'low' | 'high';
  privilegesRequired: 'none' | 'low' | 'high';
  userInteraction: 'none' | 'required';
  scope: 'unchanged' | 'changed';
  confidentiality: 'none' | 'low' | 'high';
  integrity: 'none' | 'low' | 'high';
  availability: 'none' | 'low' | 'high';
}

export interface CVSS3Result {
  baseScore: number;
  severity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  vectorString: string;
}

// CVSS 3.0 Metric Values
const METRIC_VALUES = {
  AV: {
    network: 0.85,
    adjacent: 0.62,
    local: 0.55,
    physical: 0.2,
  },
  AC: {
    low: 0.77,
    high: 0.44,
  },
  PR: {
    none: 0.85,
    low: {
      unchanged: 0.62,
      changed: 0.68,
    },
    high: {
      unchanged: 0.27,
      changed: 0.5,
    },
  },
  UI: {
    none: 0.85,
    required: 0.62,
  },
  S: {
    unchanged: 1,
    changed: 1.08,
  },
  C: {
    none: 0,
    low: 0.22,
    high: 0.56,
  },
  I: {
    none: 0,
    low: 0.22,
    high: 0.56,
  },
  A: {
    none: 0,
    low: 0.22,
    high: 0.56,
  },
} as const;

/**
 * Calculate CVSS 3.0 Base Score
 */
export function calculateCVSS3(metrics: Partial<CVSS3Metrics>): CVSS3Result | null {
  // Check if all required metrics are provided
  if (
    !metrics.attackVector ||
    !metrics.attackComplexity ||
    !metrics.privilegesRequired ||
    !metrics.userInteraction ||
    !metrics.scope ||
    !metrics.confidentiality ||
    !metrics.integrity ||
    !metrics.availability
  ) {
    return null;
  }

  // Get metric values
  const AV = METRIC_VALUES.AV[metrics.attackVector];
  const AC = METRIC_VALUES.AC[metrics.attackComplexity];
  
  // PR depends on scope
  const PR = typeof METRIC_VALUES.PR[metrics.privilegesRequired] === 'number'
    ? METRIC_VALUES.PR[metrics.privilegesRequired] as number
    : (METRIC_VALUES.PR[metrics.privilegesRequired] as { unchanged: number; changed: number })[metrics.scope];
  
  const UI = METRIC_VALUES.UI[metrics.userInteraction];
  const S = METRIC_VALUES.S[metrics.scope];
  const C = METRIC_VALUES.C[metrics.confidentiality];
  const I = METRIC_VALUES.I[metrics.integrity];
  const A = METRIC_VALUES.A[metrics.availability];

  // Calculate Impact Sub Score (ISC)
  const ISCbase = 1 - ((1 - C) * (1 - I) * (1 - A));
  
  // Calculate Impact
  let Impact: number;
  if (metrics.scope === 'unchanged') {
    Impact = 6.42 * ISCbase;
  } else {
    const iscModified = ISCbase - 0.029;
    const iscModifiedPow = Math.max(0, iscModified - 0.02);
    Impact = 7.52 * iscModified - 3.25 * Math.pow(iscModifiedPow, 15);
  }

  // Ensure Impact is not negative and round to 1 decimal place
  Impact = Math.max(0, Math.min(10, Math.round(Impact * 10) / 10));

  // Calculate Exploitability
  const Exploitability = 8.22 * AV * AC * PR * UI;

  // Calculate Base Score
  let BaseScore: number;
  if (Impact <= 0) {
    BaseScore = 0;
  } else {
    let score: number;
    if (metrics.scope === 'unchanged') {
      score = Math.min(10, Impact + Exploitability);
    } else {
      score = Math.min(10, 1.08 * (Impact + Exploitability));
    }
    // Round up to 1 decimal place
    BaseScore = Math.ceil(score * 10) / 10;
  }

  // Determine severity
  let severity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  if (BaseScore === 0) {
    severity = 'None';
  } else if (BaseScore >= 0.1 && BaseScore <= 3.9) {
    severity = 'Low';
  } else if (BaseScore >= 4.0 && BaseScore <= 6.9) {
    severity = 'Medium';
  } else if (BaseScore >= 7.0 && BaseScore <= 8.9) {
    severity = 'High';
  } else {
    severity = 'Critical';
  }

  // Generate CVSS Vector String
  const vectorString = generateCVSSVector(metrics);

  return {
    baseScore: BaseScore,
    severity,
    vectorString,
  };
}


/**
 * Generate CVSS Vector String
 */
function generateCVSSVector(metrics: Partial<CVSS3Metrics>): string {
  if (
    !metrics.attackVector ||
    !metrics.attackComplexity ||
    !metrics.privilegesRequired ||
    !metrics.userInteraction ||
    !metrics.scope ||
    !metrics.confidentiality ||
    !metrics.integrity ||
    !metrics.availability
  ) {
    return '';
  }

  const vectorMap = {
    attackVector: {
      network: 'AV:N',
      adjacent: 'AV:A',
      local: 'AV:L',
      physical: 'AV:P',
    },
    attackComplexity: {
      low: 'AC:L',
      high: 'AC:H',
    },
    privilegesRequired: {
      none: 'PR:N',
      low: 'PR:L',
      high: 'PR:H',
    },
    userInteraction: {
      none: 'UI:N',
      required: 'UI:R',
    },
    scope: {
      unchanged: 'S:U',
      changed: 'S:C',
    },
    confidentiality: {
      none: 'C:N',
      low: 'C:L',
      high: 'C:H',
    },
    integrity: {
      none: 'I:N',
      low: 'I:L',
      high: 'I:H',
    },
    availability: {
      none: 'A:N',
      low: 'A:L',
      high: 'A:H',
    },
  };

  const vectorParts = [
    'CVSS:3.0',
    vectorMap.attackVector[metrics.attackVector],
    vectorMap.attackComplexity[metrics.attackComplexity],
    vectorMap.privilegesRequired[metrics.privilegesRequired],
    vectorMap.userInteraction[metrics.userInteraction],
    vectorMap.scope[metrics.scope],
    vectorMap.confidentiality[metrics.confidentiality],
    vectorMap.integrity[metrics.integrity],
    vectorMap.availability[metrics.availability],
  ];

  return vectorParts.join('/');
}

/**
 * Get severity color classes (matching existing design system)
 */
export function getSeverityColor(severity: 'None' | 'Low' | 'Medium' | 'High' | 'Critical'): { bg: string; text: string } {
  switch (severity) {
    case 'None':
      return {
        bg: 'bg-[#E5E7EB] dark:bg-[#6B7280]',
        text: 'text-[#6B7280] dark:text-[#FFFFFF]',
      };
    case 'Low':
      return {
        bg: 'bg-[#DAE6FD] dark:bg-[#2382F6]',
        text: 'text-[#2382F6] dark:text-[#FFFFFF]',
      };
    case 'Medium':
      return {
        bg: 'bg-[#FDE68A] dark:bg-[#F59E0B]',
        text: 'text-[#92400E] dark:text-[#FFFFFF]',
      };
    case 'High':
      return {
        bg: 'bg-[#FECACA] dark:bg-[#F87171]',
        text: 'text-[#991B1B] dark:text-[#FFFFFF]',
      };
    case 'Critical':
      return {
        bg: 'bg-[#B91C1C] dark:bg-[#ff0f0f]',
        text: 'text-[#FFFFFF] dark:text-[#FFFFFF]',
      };
    default:
      return {
        bg: 'bg-[#E5E7EB] dark:bg-[#6B7280]',
        text: 'text-[#6B7280] dark:text-[#FFFFFF]',
      };
  }
}

