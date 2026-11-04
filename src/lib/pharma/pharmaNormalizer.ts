import { removeDiacritics } from '@/lib/utils/normalize';
import { DosageToken } from './types';

// Multi-word pharmaceutical filler phrases (strip first with word boundaries)
export const PHARMA_STOP_WORDS_MULTI = [
  'thuoc xit mui',
  'thuoc nho mat',
  'thuoc nho mui',
  'thuoc nho tai',
  'thuoc uong',
  'thuoc tiem',
  'thuoc boi',
  'dang ong',
  'dang xit',
  'dang goi',
  'dung dich nho mat',
  'dung dich nho mui',
  'dung dich tiem',
  'dung dich uong',
  'dung dich',
  'hon dich uong',
  'hon dich',
];

// Single-word pharmaceutical filler words (strip next with word boundaries)
export const PHARMA_STOP_WORDS_SINGLE = [
  'thuoc',
  'siro',
  'syrup',
  'hop',
  'chai',
  'lo',
  'vi',
  'vien',
  'goi',
  'ong',
  'tuyp',
  'tube',
  'binh',
];

/**
 * Strips pharmaceutical filler words from Vietnamese text after unaccenting.
 */
export function stripPharmaStopWords(text: string): string {
  if (!text) return '';
  // Collapse acronym dots (e.g. A.Tzinc -> ATzinc)
  const collapsed = text.replace(/([a-zA-Z])\.([a-zA-Z])/g, '$1$2');
  let cleaned = removeDiacritics(collapsed).toLowerCase();

  // Strip multi-word phrases first
  for (const phrase of PHARMA_STOP_WORDS_MULTI) {
    const reg = new RegExp(`\\b${phrase}\\b`, 'gi');
    cleaned = cleaned.replace(reg, ' ');
  }

  // Strip single-word stop words
  for (const word of PHARMA_STOP_WORDS_SINGLE) {
    const reg = new RegExp(`\\b${word}\\b`, 'gi');
    cleaned = cleaned.replace(reg, ' ');
  }

  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts structured pharmaceutical dosage and volume tokens from text.
 * Strictly preserves numeric strengths and units (mg, g, mcg, ml, %, standalone numbers).
 */
export function extractDosageTokens(text: string, isPackagingSpec: boolean = false): DosageToken[] {
  if (!text) return [];

  // Normalize decimal commas in numbers (e.g. 281,25mg -> 281.25mg)
  const normalized = text.replace(/(\d+),(\d+)/g, '$1.$2');
  const tokens: DosageToken[] = [];
  const seenRaws = new Set<string>();

  // 1. Ratios and combination strengths (e.g., 250mg/31.25mg, 10mg/5ml, 200mg/10ml)
  const ratioRegex = /(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|%)\s*\/\s*(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml)?(?![a-zA-Z\u00C0-\u1EF9])/gi;
  const ratioMatches = [...normalized.matchAll(ratioRegex)];

  if (!isPackagingSpec) {
    for (const match of ratioMatches) {
      const rawRatio = match[0].toLowerCase().replace(/\s+/g, '');
      const v1 = parseFloat(match[1]);
      const u1 = match[2].toLowerCase();
      const v2 = parseFloat(match[3]);
      const u2 = (match[4] || (u1 === 'mg' ? 'ml' : u1)).toLowerCase();

      tokens.push({
        raw: rawRatio,
        value: v1,
        unit: u1,
        normalizedMg: u1 === 'g' ? v1 * 1000 : u1 === 'mg' ? v1 : u1 === 'mcg' ? v1 / 1000 : undefined,
        secondaryValue: v2,
        secondaryUnit: u2,
        isRatio: true,
      });
      seenRaws.add(rawRatio);
    }
  }

  // 2. Standard unit dosages (e.g., 250mg, 500mg, 60ml, 15ml, 5ml, 1g)
  const unitRegex = /(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g|%)(?![a-zA-Z\u00C0-\u1EF9])/gi;
  const unitMatches = [...normalized.matchAll(unitRegex)];

  for (const match of unitMatches) {
    const raw = match[0].toLowerCase().replace(/\s+/g, '');
    // Skip if already captured in a ratio
    const isSubOfRatio = tokens.some((t) => t.isRatio && t.raw.includes(raw));
    if (isSubOfRatio || seenRaws.has(raw)) continue;

    const val = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    // From packaging specifications, strictly only extract liquid volume (ml)
    if (isPackagingSpec && unit !== 'ml') {
      continue;
    }

    tokens.push({
      raw,
      value: val,
      unit,
      normalizedMg: unit === 'g' ? val * 1000 : unit === 'mg' ? val : unit === 'mcg' ? val / 1000 : undefined,
    });
    seenRaws.add(raw);
  }

  // 3. Standalone strength numbers (e.g., Agimol 325, Oselvir 75, Augmentin 500)
  // Only extract if not packaging spec, and not followed by packaging words
  if (!isPackagingSpec) {
    const unaccentedLower = removeDiacritics(normalized).toLowerCase();
    // Match 2-4 digit integer not preceded or followed by dot/comma/digits (not part of decimal)
    const numRegex = /(?:^|[^\d.,])(\d{2,4})(?=[^\d.,]|$)/g;
    const numMatches = [...unaccentedLower.matchAll(numRegex)];

    for (const match of numMatches) {
      const raw = match[1];
      const matchIndex = match.index! + match[0].indexOf(raw);
      const afterMatch = unaccentedLower.slice(matchIndex + raw.length).trim();

      // Skip if followed by packaging units (e.g. 12 goi, 10 vien, 30 ong) or multiplication (x 10)
      if (/^(?:goi|vien|chai|lo|vi|ong|hop|tuyp|tube|binh|blister|pack|tablet|amp)\b/i.test(afterMatch)) {
        continue;
      }
      const beforeMatch = unaccentedLower.slice(0, matchIndex).trim();
      if (/x\s*$/i.test(beforeMatch) || /^x\s*\d/i.test(afterMatch)) {
        continue;
      }

      const val = parseFloat(raw);

      // Verify it wasn't part of any unit/ratio match
      const alreadyCaptured = tokens.some(
        (t) => t.raw.includes(raw) || t.value === val || t.secondaryValue === val
      );
      if (!alreadyCaptured && !seenRaws.has(raw)) {
        tokens.push({
          raw,
          value: val,
          unit: 'standalone',
          normalizedMg: val,
        });
        seenRaws.add(raw);
      }
    }
  }

  return tokens;
}

/**
 * Checks if two sets of dosage tokens have contradictory/conflicting strengths.
 * Used for Look-Alike Sound-Alike (LASA) safety protection.
 */
export function areDosagesConflicting(tokensA: DosageToken[], tokensB: DosageToken[]): boolean {
  if (!tokensA.length || !tokensB.length) {
    // If one side has no dosage info, there is no direct conflict
    return false;
  }

  // Extract active strength values (normalized to mg if possible)
  const strengthsA = tokensA
    .filter((t) => t.unit === 'mg' || t.unit === 'g' || t.unit === 'mcg' || t.unit === 'standalone')
    .map((t) => t.normalizedMg ?? t.value);

  const strengthsB = tokensB
    .filter((t) => t.unit === 'mg' || t.unit === 'g' || t.unit === 'mcg' || t.unit === 'standalone')
    .map((t) => t.normalizedMg ?? t.value);

  // If both have active drug strengths, check for overlap
  if (strengthsA.length > 0 && strengthsB.length > 0) {
    const hasSharedStrength = strengthsA.some((sA) =>
      strengthsB.some((sB) => Math.abs(sA - sB) < 0.01)
    );
    if (!hasSharedStrength) {
      return true; // Conflicting active strengths! (e.g. 281.25mg vs 562.5mg, 250mg vs 500mg)
    }
  }

  // Extract volume values (ml)
  const volumesA = tokensA.filter((t) => t.unit === 'ml').map((t) => t.value);
  const volumesB = tokensB.filter((t) => t.unit === 'ml').map((t) => t.value);

  if (volumesA.length > 0 && volumesB.length > 0) {
    const hasSharedVolume = volumesA.some((vA) =>
      volumesB.some((vB) => Math.abs(vA - vB) < 0.01)
    );
    if (!hasSharedVolume) {
      return true; // Conflicting volumes! (e.g. 15ml vs 60ml)
    }
  }

  return false;
}

/**
 * Strips dosages, units, and punctuation to produce a clean base name and token list.
 */
export function normalizePharmaName(
  rawName: string,
  brand?: string
): {
  cleanName: string;
  baseName: string;
  dosages: DosageToken[];
  tokens: string[];
} {
  if (!rawName) {
    return { cleanName: '', baseName: '', dosages: [], tokens: [] };
  }

  // Pre-process acronym dots (e.g. A.Tzinc -> ATzinc)
  const processedName = rawName.replace(/([a-zA-Z])\.([a-zA-Z])/g, '$1$2');

  // 1. Extract dosage tokens before stripping
  const dosages = extractDosageTokens(processedName);

  // 2. Unaccent and strip stop words
  let base = stripPharmaStopWords(processedName);

  // 3. Remove brand name if present in string
  if (brand) {
    const cleanBrand = removeDiacritics(brand).toLowerCase().trim();
    if (cleanBrand.length >= 3) {
      base = base.replace(new RegExp(`\\b${cleanBrand}\\b`, 'gi'), ' ');
    }
  }

  // 4. Strip dosage patterns from base string
  base = base.replace(/(\d+),(\d+)/g, '$1.$2');
  // Strip ratios
  base = base.replace(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|%)\s*\/\s*(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml)?/gi, ' ');
  // Strip unit dosages
  base = base.replace(/(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g|%)\b/gi, ' ');
  // Strip standalone numbers >= 10
  base = base.replace(/\b(\d{2,4})\b/g, ' ');

  // 5. Replace punctuation with spaces (preserving alphanumeric characters)
  base = base.replace(/[\(\)\[\]\{\}\/\\,_\-\+\*=\.:;!?'"]/g, ' ');

  // 6. Collapse whitespace
  base = base.replace(/\s+/g, ' ').trim();

  // Extract individual word tokens (min length 2)
  const tokens = base.split(' ').filter((t) => t.length > 0);

  return {
    cleanName: stripPharmaStopWords(rawName),
    baseName: base,
    dosages,
    tokens,
  };
}
