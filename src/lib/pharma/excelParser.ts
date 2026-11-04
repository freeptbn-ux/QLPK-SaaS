import * as XLSX from 'xlsx';
import { removeDiacritics } from '@/lib/utils/normalize';
import { ParsedSpreadsheetRow, SpreadsheetParseOptions } from './types';

/**
 * Parses Vietnamese numeric formats handling comma/period decimals,
 * thousand separators, and integer strings.
 */
export function parseVietnameseNumber(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : val;
  }

  const str = String(val).trim();
  if (!str) return 0;

  // If contains both . and ,
  if (str.includes('.') && str.includes(',')) {
    const lastDot = str.lastIndexOf('.');
    const lastComma = str.lastIndexOf(',');
    if (lastComma > lastDot) {
      // European/Vietnamese standard: 1.250,50 -> 1250.50
      return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      // US standard: 1,250.50 -> 1250.50
      return parseFloat(str.replace(/,/g, '')) || 0;
    }
  }

  // Thousand separators without decimals (e.g. '1.500', '2,500', '25.000')
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(str)) {
    return parseFloat(str.replace(/[.,]/g, '')) || 0;
  }

  // If only comma (e.g. '1,5' or '281,25')
  if (str.includes(',')) {
    return parseFloat(str.replace(',', '.')) || 0;
  }

  // Standard float / integer
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Column header synonym definitions (normalized without diacritics).
 */
const COLUMN_SYNONYMS = {
  name: [
    'ten thuoc',
    'ten hang',
    'ten san pham',
    'thuoc',
    'medicine name',
    'medicine',
    'san pham',
    'biet duoc',
    'ten biet duoc',
    'ten duoc pham',
    'item name',
    'product name',
    'drug name',
  ],
  quantity: [
    'so luong',
    'sl',
    'so luong nhap',
    'qty',
    'quantity',
    'amount',
    'so luong giao',
  ],
  spec: [
    'quy cach',
    'dong goi',
    'spec',
    'specification',
    'quy cach dong goi',
    'don vi tinh',
    'dvt',
    'unit',
    'packing',
  ],
  brand: [
    'thuong hieu',
    'nha san xuat',
    'hang sx',
    'brand',
    'manufacturer',
    'nsx',
    'cong ty sx',
    'hang duoc',
    'xuat xu',
  ],
  price: [
    'don gia',
    'gia',
    'price',
    'don gia nhap',
    'gia nhap',
    'thanh tien',
    'cost',
    'unit price',
  ],
};

function normalizeHeaderString(val: any): string {
  if (!val) return '';
  return removeDiacritics(String(val)).toLowerCase().trim();
}

interface ColumnMapping {
  nameCol: number;
  quantityCol: number;
  specCol: number;
  brandCol: number;
  priceCol: number;
  headerRowIndex: number;
}

/**
 * Automatically inspects the first N rows of a spreadsheet to detect table column headers.
 */
function detectColumnHeaders(grid: any[][], maxScanRows: number = 20): ColumnMapping | null {
  let bestHeaderRow = -1;
  let bestScore = -1;
  let bestMapping: Omit<ColumnMapping, 'headerRowIndex'> = {
    nameCol: -1,
    quantityCol: -1,
    specCol: -1,
    brandCol: -1,
    priceCol: -1,
  };

  const limit = Math.min(grid.length, maxScanRows);

  for (let r = 0; r < limit; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    let score = 0;
    let nameCol = -1;
    let quantityCol = -1;
    let specCol = -1;
    let brandCol = -1;
    let priceCol = -1;

    for (let c = 0; c < row.length; c++) {
      const cellVal = normalizeHeaderString(row[c]);
      if (!cellVal) continue;

      if (COLUMN_SYNONYMS.name.some((syn) => cellVal === syn || cellVal.includes(syn))) {
        nameCol = c;
        score += 10;
      } else if (COLUMN_SYNONYMS.quantity.some((syn) => cellVal === syn || cellVal.startsWith(syn))) {
        quantityCol = c;
        score += 8;
      } else if (COLUMN_SYNONYMS.spec.some((syn) => cellVal === syn || cellVal.includes(syn))) {
        specCol = c;
        score += 5;
      } else if (COLUMN_SYNONYMS.brand.some((syn) => cellVal === syn || cellVal.includes(syn))) {
        brandCol = c;
        score += 5;
      } else if (COLUMN_SYNONYMS.price.some((syn) => cellVal === syn || cellVal.includes(syn))) {
        priceCol = c;
        score += 5;
      }
    }

    // Must identify at least a medicine name column to qualify as a valid header
    if (nameCol !== -1 && score > bestScore) {
      bestScore = score;
      bestHeaderRow = r;
      bestMapping = { nameCol, quantityCol, specCol, brandCol, priceCol };
    }
  }

  if (bestHeaderRow === -1 || bestMapping.nameCol === -1) {
    return null;
  }

  // Fallback: If priceCol was not explicitly named, check if there is an unnamed column right after quantity with numbers
  if (bestMapping.priceCol === -1 && bestMapping.quantityCol !== -1) {
    const candidatePriceCol = bestMapping.quantityCol + 1;
    const headerCell = grid[bestHeaderRow]?.[candidatePriceCol];
    if (!headerCell || String(headerCell).trim() === '') {
      // Check if subsequent data rows have numbers here
      let numericSampleCount = 0;
      for (let r = bestHeaderRow + 1; r < Math.min(grid.length, bestHeaderRow + 6); r++) {
        const val = grid[r]?.[candidatePriceCol];
        if (val !== undefined && val !== null && val !== '') {
          const num = parseVietnameseNumber(val);
          if (num > 0) numericSampleCount++;
        }
      }
      if (numericSampleCount >= 1) {
        bestMapping.priceCol = candidatePriceCol;
      }
    }
  }

  return {
    ...bestMapping,
    headerRowIndex: bestHeaderRow,
  };
}

/**
 * Checks if a row is a summary or footer row (e.g. "Tổng cộng", "Cộng:").
 */
function isSummaryRow(name: string): boolean {
  const norm = normalizeHeaderString(name);
  return (
    norm.startsWith('tong cong') ||
    norm.startsWith('tong so') ||
    norm.startsWith('cong:') ||
    norm.startsWith('cong ') ||
    norm.startsWith('total')
  );
}

/**
 * Parses raw spreadsheet binary buffer into structured ParsedSpreadsheetRow items.
 */
export function parseSpreadsheetBuffer(
  buffer: ArrayBuffer | Uint8Array | Buffer,
  options?: SpreadsheetParseOptions
): ParsedSpreadsheetRow[] {
  // Read workbook using SheetJS
  const workbook = XLSX.read(buffer, {
    type: buffer instanceof ArrayBuffer ? 'array' : 'buffer',
    cellDates: true,
    raw: true,
  });

  const sheetName = options?.sheetName || workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    return [];
  }

  // Convert sheet to 2D array of rows
  const grid: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  if (!grid || grid.length === 0) {
    return [];
  }

  const mapping = detectColumnHeaders(grid, options?.maxHeaderScanRows || 25);
  if (!mapping) {
    throw new Error(
      'Không tìm thấy cột Tên thuốc trong file bảng tính. Vui lòng kiểm tra lại định dạng file.'
    );
  }

  const { nameCol, quantityCol, specCol, brandCol, priceCol, headerRowIndex } = mapping;
  const results: ParsedSpreadsheetRow[] = [];

  for (let r = headerRowIndex + 1; r < grid.length; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    const rawName = row[nameCol];
    if (rawName === undefined || rawName === null) continue;

    const nameStr = String(rawName).trim();
    if (!nameStr) continue;

    // Skip repeat headers or summary rows
    if (isSummaryRow(nameStr) || COLUMN_SYNONYMS.name.some((syn) => normalizeHeaderString(nameStr) === syn)) {
      continue;
    }

    const quantityVal = quantityCol !== -1 ? parseVietnameseNumber(row[quantityCol]) : 1;
    const specVal = specCol !== -1 && row[specCol] ? String(row[specCol]).trim() : undefined;
    const brandVal = brandCol !== -1 && row[brandCol] ? String(row[brandCol]).trim() : undefined;
    const priceVal = priceCol !== -1 && row[priceCol] ? parseVietnameseNumber(row[priceCol]) : undefined;

    // Construct raw object mapping
    const rawRecord: Record<string, any> = {};
    const headerRow = grid[headerRowIndex] || [];
    for (let c = 0; c < row.length; c++) {
      const colHeader = String(headerRow[c] || `col_${c}`).trim();
      rawRecord[colHeader] = row[c];
    }

    results.push({
      rowIndex: r + 1, // 1-based index in Excel
      name: nameStr,
      quantity: quantityVal,
      spec: specVal,
      brand: brandVal,
      price: priceVal,
      raw: rawRecord,
    });
  }

  return results;
}

/**
 * Asynchronously parses a spreadsheet File or ArrayBuffer.
 */
export async function parseSpreadsheet(
  input: File | ArrayBuffer | Uint8Array | Buffer,
  options?: SpreadsheetParseOptions
): Promise<ParsedSpreadsheetRow[]> {
  let buffer: ArrayBuffer | Uint8Array | Buffer;

  if (
    (typeof File !== 'undefined' && input instanceof File) ||
    (typeof Blob !== 'undefined' && input instanceof Blob)
  ) {
    if (typeof (input as any).arrayBuffer === 'function') {
      buffer = await (input as any).arrayBuffer();
    } else if (typeof FileReader !== 'undefined') {
      buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error || new Error('Không thể đọc dữ liệu file'));
        reader.readAsArrayBuffer(input as any);
      });
    } else {
      buffer = input as any;
    }
  } else {
    buffer = input as ArrayBuffer | Uint8Array | Buffer;
  }

  return parseSpreadsheetBuffer(buffer, options);
}
