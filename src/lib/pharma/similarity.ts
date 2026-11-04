/**
 * String Similarity & Fuzzy Metrics for Pharmaceutical Matching
 */

/**
 * Calculates standard Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    const charB = b.charAt(i - 1);
    for (let j = 1; j <= a.length; j++) {
      const charA = a.charAt(j - 1);
      if (charA === charB) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates normalized Levenshtein similarity between 0.0 and 1.0.
 */
export function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(a, b);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Computes Sørensen-Dice coefficient using character bigrams.
 */
export function diceCoefficient(a: string, b: string): number {
  const s1 = a.toLowerCase();
  const s2 = b.toLowerCase();
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return 0.0;

  const bigrams1 = new Map<string, number>();
  for (let i = 0; i < s1.length - 1; i++) {
    const bigram = s1.substring(i, i + 2);
    bigrams1.set(bigram, (bigrams1.get(bigram) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bigram = s2.substring(i, i + 2);
    const count = bigrams1.get(bigram) || 0;
    if (count > 0) {
      bigrams1.set(bigram, count - 1);
      intersection++;
    }
  }

  const total = (s1.length - 1) + (s2.length - 1);
  return (2 * intersection) / total;
}

/**
 * Extracts trigrams with standard boundary padding.
 */
export function getTrigrams(str: string): Set<string> {
  const padded = `  ${str.toLowerCase()} `;
  const trigrams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    trigrams.add(padded.substring(i, i + 3));
  }
  return trigrams;
}

/**
 * Calculates Trigram similarity (Jaccard similarity of 3-character n-grams).
 */
export function trigramSimilarity(a: string, b: string): number {
  if (a === b) return 1.0;
  const t1 = getTrigrams(a);
  const t2 = getTrigrams(b);

  let intersection = 0;
  for (const tri of t1) {
    if (t2.has(tri)) {
      intersection++;
    }
  }

  const union = t1.size + t2.size - intersection;
  if (union === 0) return 0.0;
  return intersection / union;
}

/**
 * Measures token overlap ratio between two word arrays.
 */
export function tokenOverlapSimilarity(tokensA: string[], tokensB: string[]): number {
  if (!tokensA.length || !tokensB.length) return 0.0;
  const setB = new Set(tokensB);
  let matchCount = 0;
  for (const tok of tokensA) {
    if (setB.has(tok)) {
      matchCount++;
    }
  }
  const maxCount = Math.max(tokensA.length, tokensB.length);
  return maxCount > 0 ? matchCount / maxCount : 0.0;
}

/**
 * Combines Levenshtein, Dice, Trigram, and Token Overlap metrics into an optimal fuzzy similarity score.
 */
export function combinedFuzzyScore(a: string, b: string): number {
  if (!a || !b) return 0.0;
  const s1 = a.trim().toLowerCase();
  const s2 = b.trim().toLowerCase();
  if (s1 === s2) return 1.0;

  const lev = levenshteinSimilarity(s1, s2);
  const dice = diceCoefficient(s1, s2);
  const tri = trigramSimilarity(s1, s2);

  const tokensA = s1.split(/\s+/).filter(Boolean);
  const tokensB = s2.split(/\s+/).filter(Boolean);
  const tokenOv = tokenOverlapSimilarity(tokensA, tokensB);

  // Return the maximum of individual metric strengths, augmented if token overlap is high
  return Math.min(1.0, Math.max(lev, dice, tri, tokenOv));
}

