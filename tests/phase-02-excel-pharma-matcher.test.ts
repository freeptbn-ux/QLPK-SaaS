import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';
import {
  parseSpreadsheet,
  parseSpreadsheetBuffer,
  parseVietnameseNumber,
  stripPharmaStopWords,
  extractDosageTokens,
  areDosagesConflicting,
  normalizePharmaName,
  matchMedicineRows,
  classifyMedicineRow,
  createAliasLookup,
  levenshteinSimilarity,
  diceCoefficient,
  trigramSimilarity,
} from '@/lib/pharma';
import { Medicine } from '@/types/database';

describe('Phase 02: Spreadsheet Parser & Multi-Layer Pharma Matching Engine', () => {
  // Load real catalog fixture from backup
  const backupCatalogPath = path.resolve(
    process.cwd(),
    'backups/backup_20261104_142726/medicines.json'
  );
  let realCatalog: Medicine[] = [];

  if (fs.existsSync(backupCatalogPath)) {
    realCatalog = JSON.parse(fs.readFileSync(backupCatalogPath, 'utf8'));
  } else {
    // Fallback minimal fixture if file is missing
    realCatalog = [
      { id: 5, name: 'ATErsin', packing_spec: 'Hộp 1 chai 60ml', price: 26, stock_quantity: 0 },
      { id: 70, name: 'Neo-Beta', packing_spec: 'Lọ 5ml', price: 15, stock_quantity: 18 },
      { id: 88, name: 'Siro A.Tzinc 10mg/5ml', packing_spec: 'Ống', price: 24, stock_quantity: 5 },
      { id: 131, name: 'Oselvir 75', packing_spec: 'Viên', price: 20, stock_quantity: 5 },
      { id: 136, name: 'Paracetamol 325mg Agimol', packing_spec: 'Gói', price: 1.5, stock_quantity: 10 },
      { id: 139, name: 'Aladka', packing_spec: 'Chai', price: 23, stock_quantity: 11 },
      { id: 187, name: 'Augixine 250mg', packing_spec: 'Hộp', price: 23, stock_quantity: 4 },
      { id: 9984, name: 'Oran C', packing_spec: 'Chai', price: 20, stock_quantity: 3 },
      { id: 10, name: 'Augbidil 1g', packing_spec: 'Hộp', price: 50, stock_quantity: 10 },
      { id: 12, name: 'Augbidil 500mg', packing_spec: 'Hộp 12 gói', price: 40, stock_quantity: 10 },
    ] as Medicine[];
  }

  // --------------------------------------------------------------------------
  // Test 1: Spreadsheet Ingestion Test
  // --------------------------------------------------------------------------
  describe('1. Spreadsheet Ingestion Test', () => {
    it('should parse synthetic workbook with diverse headers, messy formats, and skip empty/summary rows', async () => {
      // Build a mock workbook in memory
      const rows = [
        ['BẢNG BÁO GIÁ DƯỢC PHẨM THÁNG 11/2026', '', '', '', '', ''],
        ['', '', '', '', '', ''], // empty row
        ['STT', 'Tên sản phẩm', 'Hãng SX', 'Đóng gói', 'Số lượng nhập', 'Đơn giá'],
        [1, 'Paracetamol 500mg', 'Hậu Giang', 'Hộp 10 vỉ', '20,5', '1.500'],
        [2, 'Ibuprofen 400mg', 'Dược Hà Tây', 'Vỉ 10 viên', 15, '2,500'],
        ['', '', '', '', '', ''], // empty row
        ['', 'Tổng cộng:', '', '', '35.5', ''], // summary row
      ];

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const parsed = await parseSpreadsheet(buffer);

      expect(parsed).toHaveLength(2);

      // Verify row 1
      expect(parsed[0].name).toBe('Paracetamol 500mg');
      expect(parsed[0].brand).toBe('Hậu Giang');
      expect(parsed[0].spec).toBe('Hộp 10 vỉ');
      expect(parsed[0].quantity).toBe(20.5);
      expect(parsed[0].price).toBe(1500);
      expect(parsed[0].rowIndex).toBe(4); // 1-based index in Excel

      // Verify row 2
      expect(parsed[1].name).toBe('Ibuprofen 400mg');
      expect(parsed[1].brand).toBe('Dược Hà Tây');
      expect(parsed[1].spec).toBe('Vỉ 10 viên');
      expect(parsed[1].quantity).toBe(15);
      expect(parsed[1].price).toBe(2500);
      expect(parsed[1].rowIndex).toBe(5);
    });

    it('should correctly parse Vietnamese numeric formats', () => {
      expect(parseVietnameseNumber('1,5')).toBe(1.5);
      expect(parseVietnameseNumber('281,25')).toBe(281.25);
      expect(parseVietnameseNumber('22.5')).toBe(22.5);
      expect(parseVietnameseNumber('1.250,50')).toBe(1250.5);
      expect(parseVietnameseNumber('1,250.50')).toBe(1250.5);
      expect(parseVietnameseNumber(100)).toBe(100);
      expect(parseVietnameseNumber('')).toBe(0);
      expect(parseVietnameseNumber(null)).toBe(0);
    });
  });

  // --------------------------------------------------------------------------
  // Test 2: Alias Resolution Priority Test
  // --------------------------------------------------------------------------
  describe('2. Alias Resolution Priority Test', () => {
    it('should immediately resolve an ambiguous supplier raw name when present in alias memory with 100% confidence', () => {
      const ambiguousRow = {
        rowIndex: 2,
        name: 'Agimol 325 Gói Bột',
        quantity: 10,
      };

      // Target medicine: Paracetamol 325mg Agimol (ID 136)
      const targetMed = realCatalog.find((m) => m.id === 136)!;
      expect(targetMed).toBeDefined();

      // Without alias: Ambiguous string matching
      const resultWithoutAlias = classifyMedicineRow(
        ambiguousRow,
        realCatalog,
        new Map()
      );
      // Even if suggested or matched, score without alias is not from ALIAS source
      expect(resultWithoutAlias.matchSource).not.toBe('ALIAS');

      // With alias dictionary:
      const aliasMap = createAliasLookup([
        { clinic_id: 1, raw_name: 'Agimol 325 Gói Bột', medicine_id: 136, id: 1, created_at: '' },
      ]);

      const resultWithAlias = classifyMedicineRow(
        ambiguousRow,
        realCatalog,
        aliasMap
      );

      expect(resultWithAlias.confidenceStatus).toBe('CONFIDENT');
      expect(resultWithAlias.matchScore).toBe(1.0);
      expect(resultWithAlias.matchSource).toBe('ALIAS');
      expect(resultWithAlias.matchedMedicineId).toBe(136);
      expect(resultWithAlias.matchedMedicine?.id).toBe(136);
    });
  });

  // --------------------------------------------------------------------------
  // Test 3: Pharma Normalization Test
  // --------------------------------------------------------------------------
  describe('3. Pharma Normalization Test', () => {
    it('should unaccent, strip punctuation, remove pharmaceutical stop words while isolating dosage/volume tokens', () => {
      // 1. Thuốc Xịt Mũi Aladka 15ml
      const norm1 = normalizePharmaName('Thuốc Xịt Mũi Aladka 15ml');
      expect(norm1.baseName).toBe('aladka');
      expect(norm1.dosages).toHaveLength(1);
      expect(norm1.dosages[0].raw).toBe('15ml');
      expect(norm1.dosages[0].value).toBe(15);
      expect(norm1.dosages[0].unit).toBe('ml');

      // 2. Atersin (Chai 60ml)
      const norm2 = normalizePharmaName('Atersin (Chai 60ml)');
      expect(norm2.baseName).toBe('atersin');
      expect(norm2.dosages).toHaveLength(1);
      expect(norm2.dosages[0].raw).toBe('60ml');

      // 3. A.Tzinc siro dạng ống 10mg/5ml
      const norm3 = normalizePharmaName('A.Tzinc siro dạng ống 10mg/5ml');
      expect(norm3.baseName).toBe('atzinc');
      expect(norm3.dosages.some((d) => d.raw === '10mg/5ml')).toBe(true);

      // 4. Oran-C
      const norm4 = normalizePharmaName('Oran-C');
      expect(norm4.baseName).toBe('oran c');

      // 5. Augxicine 250mg/31,25mg
      const norm5 = normalizePharmaName('Augxicine 250mg/31,25mg');
      expect(norm5.baseName).toBe('augxicine');
      expect(norm5.dosages.some((d) => d.raw === '250mg/31.25mg')).toBe(true);
    });

    it('should calculate string similarity algorithms accurately', () => {
      // Levenshtein
      expect(levenshteinSimilarity('augxicine', 'augixine')).toBeGreaterThan(0.75);
      expect(levenshteinSimilarity('same', 'same')).toBe(1.0);

      // Dice
      expect(diceCoefficient('augxicine', 'augixine')).toBeGreaterThan(0.6);

      // Trigram
      expect(trigramSimilarity('augxicine', 'augixine')).toBeGreaterThan(0.3);
    });
  });

  // --------------------------------------------------------------------------
  // Test 4: Real-World Fixture Matching Test (Danh_sach_thuoc.xlsx)
  // --------------------------------------------------------------------------
  describe('4. Real-World Fixture Matching Test', () => {
    it('should parse Danh_sach_thuoc.xlsx and correctly classify all 10 supplier medicine rows', async () => {
      const excelFilePath = path.resolve(process.cwd(), 'Danh_sach_thuoc.xlsx');
      expect(fs.existsSync(excelFilePath)).toBe(true);

      const fileBuffer = fs.readFileSync(excelFilePath);
      const parsedRows = await parseSpreadsheet(fileBuffer);

      // Acceptance Criteria 1: Exactly 10 valid medicine rows extracted
      expect(parsedRows).toHaveLength(10);

      const matchedResults = matchMedicineRows(parsedRows, realCatalog);
      expect(matchedResults).toHaveLength(10);

      // Row 2: Atersin (Chai 60ml) -> ATErsin (ID 5)
      const atersinResult = matchedResults.find((r) => r.rawRow.name.includes('Atersin'));
      expect(atersinResult).toBeDefined();
      expect(atersinResult!.confidenceStatus).toBe('CONFIDENT');
      expect(atersinResult!.matchedMedicineId).toBe(5);
      expect(atersinResult!.matchedMedicine?.name).toBe('ATErsin');

      // Row 10: Thuốc Xịt Mũi Aladka 15ml -> Aladka (ID 139)
      const aladkaResult = matchedResults.find((r) => r.rawRow.name.includes('Aladka'));
      expect(aladkaResult).toBeDefined();
      expect(aladkaResult!.confidenceStatus).toBe('CONFIDENT');
      expect(aladkaResult!.matchedMedicineId).toBe(139);
      expect(aladkaResult!.matchedMedicine?.name).toBe('Aladka');

      // Row 7: Neo-Beta 5ml -> Neo-Beta (ID 70)
      const neoBetaResult = matchedResults.find((r) => r.rawRow.name.includes('Neo-Beta'));
      expect(neoBetaResult).toBeDefined();
      expect(neoBetaResult!.confidenceStatus).toBe('CONFIDENT');
      expect(neoBetaResult!.matchedMedicineId).toBe(70);
      expect(neoBetaResult!.matchedMedicine?.name).toBe('Neo-Beta');

      // Row 8: Oran-C -> Oran C (ID 9984)
      const oranCResult = matchedResults.find((r) => r.rawRow.name === 'Oran-C');
      expect(oranCResult).toBeDefined();
      expect(oranCResult!.confidenceStatus).toBe('CONFIDENT');
      expect(oranCResult!.matchedMedicineId).toBe(9984);
      expect(oranCResult!.matchedMedicine?.name).toBe('Oran C');

      // Row 6: A.Tzinc siro dạng ống 10mg/5ml -> Siro A.Tzinc 10mg/5ml (ID 88)
      const atzincResult = matchedResults.find((r) => r.rawRow.name.includes('A.Tzinc'));
      expect(atzincResult).toBeDefined();
      expect(atzincResult!.confidenceStatus).toBe('CONFIDENT');
      expect(atzincResult!.matchedMedicineId).toBe(88);

      // Row 9: Oselvir 75 Boston Pharma -> Oselvir 75 (ID 131)
      const oselvirResult = matchedResults.find((r) => r.rawRow.name.includes('Oselvir 75'));
      expect(oselvirResult).toBeDefined();
      expect(oselvirResult!.confidenceStatus).toBe('CONFIDENT');
      expect(oselvirResult!.matchedMedicineId).toBe(131);

      // Row 5: Augxicine 250mg/31,25mg -> Augixine 250mg (ID 187) [SUGGESTED / FUZZY]
      const augxicineResult = matchedResults.find((r) => r.rawRow.name.includes('Augxicine'));
      expect(augxicineResult).toBeDefined();
      expect(augxicineResult!.confidenceStatus).toBe('SUGGESTED');
      expect(augxicineResult!.matchSource).toBe('FUZZY');
      expect(augxicineResult!.matchedMedicineId).toBe(187);
      expect(augxicineResult!.matchedMedicine?.name).toBe('Augixine 250mg');
      expect(augxicineResult!.matchScore).toBeGreaterThanOrEqual(0.5);
      expect(augxicineResult!.matchScore).toBeLessThan(0.85);

      // Row 3: Augbactam 281,25mg -> Never falsely matched to 500mg or 1g variant (Criteria 4)
      const augbactamResult = matchedResults.find((r) => r.rawRow.name.includes('Augbactam 281'));
      expect(augbactamResult).toBeDefined();
      expect(augbactamResult!.confidenceStatus).not.toBe('CONFIDENT');
      if (augbactamResult!.matchedMedicine) {
        expect(augbactamResult!.matchedMedicine.name).not.toMatch(/500|1g/);
      }

      // Row 4: Augbactam 562.5mg -> Differs in dosage from 281mg, never auto-merged to 281mg variant
      const augbactam562Result = matchedResults.find((r) => r.rawRow.name.includes('562.5'));
      expect(augbactam562Result).toBeDefined();
      expect(augbactam562Result!.matchedMedicineId).not.toBe(190);
      expect(augbactam562Result!.confidenceStatus).not.toBe('CONFIDENT');
    });
  });

  // --------------------------------------------------------------------------
  // Test 5: Dosage Mismatch Protection Test (LASA Guard)
  // --------------------------------------------------------------------------
  describe('5. Dosage Mismatch Protection Test', () => {
    it('should flag conflicting dosages as distinct items and NEVER auto-merge as CONFIDENT', () => {
      // Test the helper directly
      const dose281 = extractDosageTokens('Augbactam 281,25mg');
      const dose562 = extractDosageTokens('Augbactam 562.5mg');
      const dose500 = extractDosageTokens('Augbidil 500mg');
      const dose1g = extractDosageTokens('Augbidil 1g');
      const dose250 = extractDosageTokens('Augbidil 250mg');

      expect(areDosagesConflicting(dose281, dose562)).toBe(true);
      expect(areDosagesConflicting(dose281, dose500)).toBe(true);
      expect(areDosagesConflicting(dose281, dose1g)).toBe(true);
      expect(areDosagesConflicting(dose281, dose250)).toBe(true);

      // Identical dosages should NOT conflict
      const dose250Same = extractDosageTokens('Amoxicillin 250mg');
      expect(areDosagesConflicting(dose250, dose250Same)).toBe(false);

      // Classification test: Raw row with 281.25mg matched against catalog containing 562.5mg variant
      const customCatalog: Medicine[] = [
        { id: 991, name: 'Augbactam 562.5mg', price: 50, stock_quantity: 10 } as Medicine,
        { id: 992, name: 'Augbidil 500mg', price: 40, stock_quantity: 10 } as Medicine,
        { id: 993, name: 'Augbidil 1g', price: 60, stock_quantity: 10 } as Medicine,
      ];

      const rawRow = {
        rowIndex: 3,
        name: 'Augbactam 281,25mg',
        quantity: 20,
      };

      const result = classifyMedicineRow(rawRow, customCatalog, new Map());

      // MUST NOT be CONFIDENT despite sharing identical base name "Augbactam"!
      expect(result.confidenceStatus).not.toBe('CONFIDENT');
      expect(result.confidenceStatus).toBe('UNMATCHED');
      expect(result.matchScore).toBeLessThan(0.5);
    });
  });

  // --------------------------------------------------------------------------
  // Test 6: Candidate Suggestions Generation Test
  // --------------------------------------------------------------------------
  describe('6. Candidate Suggestions Generation Test', () => {
    it('should provide prioritized top 3 nearest candidates for suggested or unmatched rows', () => {
      const unmatchedRow = {
        rowIndex: 4,
        name: 'Augbactam 281,25mg',
        quantity: 20,
      };

      const result = classifyMedicineRow(unmatchedRow, realCatalog, new Map());

      expect(result.candidateSuggestions).toBeDefined();
      expect(result.candidateSuggestions.length).toBeGreaterThan(0);
      expect(result.candidateSuggestions.length).toBeLessThanOrEqual(3);

      // Verify descending score order
      for (let i = 0; i < result.candidateSuggestions.length - 1; i++) {
        expect(result.candidateSuggestions[i].score).toBeGreaterThanOrEqual(
          result.candidateSuggestions[i + 1].score
        );
      }

      // Verify structure of candidate suggestion
      const firstCandidate = result.candidateSuggestions[0];
      expect(firstCandidate.medicine).toBeDefined();
      expect(typeof firstCandidate.score).toBe('number');
      expect(firstCandidate.matchSource).toBe('FUZZY');
    });
  });

  // --------------------------------------------------------------------------
  // Non-Functional: High Performance Test (< 100ms for 200 rows x 500 medicines)
  // --------------------------------------------------------------------------
  describe('7. Performance & Determinism Test', () => {
    it('should match 200 Excel rows against 500 medicines in under 100 milliseconds', () => {
      // Synthesize 500 catalog medicines
      const largeCatalog: Medicine[] = [];
      for (let i = 1; i <= 500; i++) {
        largeCatalog.push({
          id: i,
          name: `Catalog Drug ${i} 500mg`,
          price: 1000 + i,
          stock_quantity: 10,
        } as Medicine);
      }

      // Synthesize 200 Excel rows
      const largeRows = [];
      for (let j = 1; j <= 200; j++) {
        largeRows.push({
          rowIndex: j,
          name: `Catalog Drug ${j % 50} 500mg`,
          quantity: 10,
        });
      }

      const t0 = performance.now();
      const results = matchMedicineRows(largeRows, largeCatalog);
      const elapsed = performance.now() - t0;

      expect(results).toHaveLength(200);
      expect(elapsed).toBeLessThan(100); // Must be under 100ms!
    });
  });
});
