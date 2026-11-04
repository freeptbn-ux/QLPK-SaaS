import { Medicine, MedicineAlias } from '@/types/database';

export type ConfidenceStatus = 'CONFIDENT' | 'SUGGESTED' | 'UNMATCHED';

export type MatchSource = 'EXACT' | 'ALIAS' | 'NORMALIZED' | 'FUZZY' | 'NONE';

export interface ParsedSpreadsheetRow {
  rowIndex: number;
  name: string;
  quantity: number;
  spec?: string;
  brand?: string;
  price?: number;
  raw?: Record<string, any>;
}

export interface DosageToken {
  raw: string;
  value: number;
  unit: string; // 'mg' | 'g' | 'mcg' | 'ml' | '%' | 'standalone'
  normalizedMg?: number;
  secondaryValue?: number;
  secondaryUnit?: string;
  isRatio?: boolean;
}

export interface CandidateSuggestion {
  medicine: Medicine;
  score: number;
  matchSource: MatchSource;
  reason?: string;
}

export interface MatchedMedicineRow {
  rawRow: ParsedSpreadsheetRow;
  matchedMedicineId: number | null;
  matchedMedicine: Medicine | null;
  confidenceStatus: ConfidenceStatus;
  matchScore: number;
  matchSource: MatchSource;
  candidateSuggestions: CandidateSuggestion[];
}

export interface NormalizedMedicineInfo {
  medicine: Medicine;
  cleanName: string;
  baseName: string;
  dosages: DosageToken[];
  tokens: string[];
}

export interface SpreadsheetParseOptions {
  sheetName?: string;
  headerRowIndex?: number;
  maxHeaderScanRows?: number;
}

