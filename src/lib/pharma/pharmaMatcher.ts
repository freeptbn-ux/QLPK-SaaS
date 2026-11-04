import { Medicine, MedicineAlias } from '@/types/database';
import {
  ParsedSpreadsheetRow,
  MatchedMedicineRow,
  CandidateSuggestion,
  NormalizedMedicineInfo,
} from './types';
import {
  normalizePharmaName,
  areDosagesConflicting,
  extractDosageTokens,
} from './pharmaNormalizer';
import { combinedFuzzyScore, levenshteinSimilarity } from './similarity';

/**
 * Normalizes user-supplied alias mappings into an indexed lookup Map.
 */
export function createAliasLookup(
  aliases?: Record<string, number> | MedicineAlias[] | Map<string, number>
): Map<string, number> {
  const map = new Map<string, number>();
  if (!aliases) return map;

  if (aliases instanceof Map) {
    for (const [key, val] of aliases.entries()) {
      map.set(key.trim().toLowerCase(), val);
    }
    return map;
  }

  if (Array.isArray(aliases)) {
    for (const item of aliases) {
      if (item.raw_name && item.medicine_id) {
        map.set(item.raw_name.trim().toLowerCase(), item.medicine_id);
      }
    }
    return map;
  }

  if (typeof aliases === 'object') {
    for (const [key, val] of Object.entries(aliases)) {
      map.set(key.trim().toLowerCase(), val);
    }
  }

  return map;
}

/**
 * Pre-computes normalized pharmaceutical information for each catalog medicine.
 */
export function prepareCatalogInfo(catalog: Medicine[]): NormalizedMedicineInfo[] {
  return catalog.map((medicine) => {
    const info = normalizePharmaName(medicine.name);

    // If packaging spec has volume info (e.g. "Hộp 1 chai 60ml" or "Lọ 5ml"), extract it
    if (medicine.packing_spec) {
      const specDosages = extractDosageTokens(medicine.packing_spec, true);
      for (const d of specDosages) {
        if (!info.dosages.some((existing) => existing.raw === d.raw)) {
          info.dosages.push(d);
        }
      }
    }

    return {
      medicine,
      cleanName: info.cleanName,
      baseName: info.baseName,
      dosages: info.dosages,
      tokens: info.tokens,
    };
  });
}

/**
 * Evaluates a single parsed Excel row against the medicine catalog and alias memory.
 */
export function classifyMedicineRow(
  rawRow: ParsedSpreadsheetRow,
  catalog: Medicine[],
  aliasMap: Map<string, number>,
  preparedCatalog?: NormalizedMedicineInfo[]
): MatchedMedicineRow {
  const rawNameClean = rawRow.name.trim();
  const rawNameLower = rawNameClean.toLowerCase();

  // ----------------------------------------------------
  // TIER 1: Exact Match (Case-insensitive String Equality)
  // ----------------------------------------------------
  const exactMatch = catalog.find(
    (m) => m.name.trim().toLowerCase() === rawNameLower
  );
  if (exactMatch) {
    return {
      rawRow,
      matchedMedicineId: exactMatch.id,
      matchedMedicine: exactMatch,
      confidenceStatus: 'CONFIDENT',
      matchScore: 1.0,
      matchSource: 'EXACT',
      candidateSuggestions: [],
    };
  }

  // ----------------------------------------------------
  // TIER 2: Alias Memory Match (Clinic-Specific Dictionary)
  // ----------------------------------------------------
  if (aliasMap.has(rawNameLower)) {
    const aliasMedId = aliasMap.get(rawNameLower)!;
    const aliasMatch = catalog.find((m) => m.id === aliasMedId);
    if (aliasMatch) {
      return {
        rawRow,
        matchedMedicineId: aliasMatch.id,
        matchedMedicine: aliasMatch,
        confidenceStatus: 'CONFIDENT',
        matchScore: 1.0,
        matchSource: 'ALIAS',
        candidateSuggestions: [],
      };
    }
  }

  // Prepare normalized representations
  const catalogInfos = preparedCatalog || prepareCatalogInfo(catalog);
  const rawInfo = normalizePharmaName(rawRow.name, rawRow.brand);

  // If rawRow has spec with volume (e.g. "Hộp 1 chai 60ml"), incorporate it
  if (rawRow.spec) {
    const specDosages = extractDosageTokens(rawRow.spec, true);
    for (const d of specDosages) {
      if (!rawInfo.dosages.some((existing) => existing.raw === d.raw)) {
        rawInfo.dosages.push(d);
      }
    }
  }

  // ----------------------------------------------------
  // TIER 3: Pharma Normalized Match (Identical Base Name & Compatible Dosage)
  // ----------------------------------------------------
  if (rawInfo.baseName) {
    // Look for candidates whose baseName matches exactly
    const baseMatches = catalogInfos.filter(
      (c) => c.baseName === rawInfo.baseName
    );

    if (baseMatches.length > 0) {
      // Find candidate with non-conflicting dosage
      for (const candidate of baseMatches) {
        const isConflict = areDosagesConflicting(rawInfo.dosages, candidate.dosages);

        if (!isConflict) {
          // If both have dosage, verify exact match or volume validation
          const bothHaveDosages = rawInfo.dosages.length > 0 && candidate.dosages.length > 0;
          const score = bothHaveDosages ? 1.0 : 0.95;

          return {
            rawRow,
            matchedMedicineId: candidate.medicine.id,
            matchedMedicine: candidate.medicine,
            confidenceStatus: 'CONFIDENT',
            matchScore: score,
            matchSource: 'NORMALIZED',
            candidateSuggestions: [],
          };
        }
      }
    }
  }

  // ----------------------------------------------------
  // TIER 4: Fuzzy String Similarity (Levenshtein + Trigram + LASA Dosage Guard)
  // ----------------------------------------------------
  const scoredCandidates: CandidateSuggestion[] = [];

  for (const cat of catalogInfos) {
    const baseSim = combinedFuzzyScore(rawInfo.baseName, cat.baseName);
    const wholeSim = combinedFuzzyScore(rawInfo.cleanName, cat.cleanName);
    let bestSim = Math.max(baseSim, wholeSim);

    // Check dosage conflict
    const isConflict = areDosagesConflicting(rawInfo.dosages, cat.dosages);

    let finalScore = bestSim;

    if (isConflict) {
      // LASA Protection: Conflicting dosages can NEVER be confident!
      // Demote score heavily and cap below confident threshold
      finalScore = Math.min(0.48, bestSim * 0.5);
    } else {
      // If dosages match identically or are compatible, grant confidence boost
      const hasSharedStrength = rawInfo.dosages.some((dA) =>
        cat.dosages.some((dB) => dA.raw === dB.raw || (dA.normalizedMg && dA.normalizedMg === dB.normalizedMg))
      );
      if (hasSharedStrength) {
        finalScore = Math.min(1.0, bestSim + 0.05);
      }
    }

    if (finalScore > 0.15) {
      scoredCandidates.push({
        medicine: cat.medicine,
        score: Math.round(finalScore * 100) / 100,
        matchSource: 'FUZZY',
        reason: isConflict ? 'Cảnh báo: Khác biệt hàm lượng (LASA)' : undefined,
      });
    }
  }

  // Sort candidates by score descending
  scoredCandidates.sort((a, b) => b.score - a.score);

  const topCandidate = scoredCandidates[0];

  if (topCandidate && topCandidate.score >= 0.85) {
    return {
      rawRow,
      matchedMedicineId: topCandidate.medicine.id,
      matchedMedicine: topCandidate.medicine,
      confidenceStatus: 'CONFIDENT',
      matchScore: topCandidate.score,
      matchSource: 'FUZZY',
      candidateSuggestions: scoredCandidates.slice(0, 3),
    };
  }

  if (topCandidate && topCandidate.score >= 0.50) {
    return {
      rawRow,
      matchedMedicineId: topCandidate.medicine.id,
      matchedMedicine: topCandidate.medicine,
      confidenceStatus: 'SUGGESTED',
      matchScore: topCandidate.score,
      matchSource: 'FUZZY',
      candidateSuggestions: scoredCandidates.slice(0, 3),
    };
  }

  // Unmatched
  return {
    rawRow,
    matchedMedicineId: null,
    matchedMedicine: null,
    confidenceStatus: 'UNMATCHED',
    matchScore: topCandidate ? topCandidate.score : 0.0,
    matchSource: 'NONE',
    candidateSuggestions: scoredCandidates.slice(0, 3),
  };
}

/**
 * Matches an array of parsed spreadsheet rows against the clinic's medicine catalog.
 */
export function matchMedicineRows(
  rows: ParsedSpreadsheetRow[],
  catalog: Medicine[],
  aliases?: Record<string, number> | MedicineAlias[] | Map<string, number>
): MatchedMedicineRow[] {
  const aliasMap = createAliasLookup(aliases);
  const preparedCatalog = prepareCatalogInfo(catalog);

  return rows.map((row) =>
    classifyMedicineRow(row, catalog, aliasMap, preparedCatalog)
  );
}
