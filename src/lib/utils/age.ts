import dayjs from 'dayjs';

const DOB_REGEX_DDMMYYYY = /^\d{2}\/\d{2}\/\d{4}$/;
const DOB_REGEX_ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse DD/MM/YYYY or YYYY-MM-DD → dayjs object
 */
function parseDob(dob: string): dayjs.Dayjs | null {
  if (!dob) return null;

  let dd: string, mm: string, yyyy: string;

  if (DOB_REGEX_DDMMYYYY.test(dob)) {
    [dd, mm, yyyy] = dob.split('/');
  } else if (DOB_REGEX_ISO.test(dob)) {
    [yyyy, mm, dd] = dob.split('-');
  } else {
    return null;
  }

  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);

  const parsed = dayjs(`${yyyy}-${mm}-${dd}`);
  if (!parsed.isValid()) return null;

  // Strict check: dayjs auto-overflows (e.g., 32/01 -> 01/02)
  // We check if the parsed components match the input
  if (
    parsed.date() !== day ||
    parsed.month() !== month - 1 || // dayjs months are 0-indexed
    parsed.year() !== year
  ) {
    return null;
  }

  return parsed;
}

export type AgeUnit = 'day' | 'week' | 'month' | 'year';

export interface AgeParts {
  value: number;
  unit: AgeUnit;
}

/**
 * Tính tuổi và trả về { value, unit }
 * Quy tắc:
 *   < 7 ngày        → unit: 'day'
 *   < 2 tháng       → unit: 'week'
 *   < 6 tuổi (72m)  → unit: 'month'
 *   ≥ 6 tuổi        → unit: 'year'
 */
export function parseAgeParts(dob: string, referenceDate?: dayjs.Dayjs): AgeParts | null {
  const birth = parseDob(dob);
  if (!birth) return null;
  
  const now = referenceDate || dayjs();
  
  // If birth is in the future, we return null or handle as invalid
  if (birth.isAfter(now)) return null;

  const diffDays = now.diff(birth, 'day');
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = now.diff(birth, 'month');
  const diffYears = now.diff(birth, 'year');
  
  if (diffDays < 7) {
    return { value: diffDays, unit: 'day' };
  }
  
  // Under 2 months (60 days approximately, but diffMonths is more accurate for "months")
  // However, diffMonths < 2 is the requirement.
  if (diffMonths < 2) {
    return { value: diffWeeks, unit: 'week' };
  }
  
  // Under 6 years (72 months)
  if (diffYears < 6) {
    return { value: diffMonths, unit: 'month' };
  }
  
  return { value: diffYears, unit: 'year' };
}

/**
 * Format tuổi thành chuỗi hiển thị tiếng Việt
 */
export function formatAge(dob: string, referenceDate?: dayjs.Dayjs): string {
  const parts = parseAgeParts(dob, referenceDate);
  if (!parts) return '';
  
  switch (parts.unit) {
    case 'day':   return `${parts.value} ngày tuổi`;
    case 'week':  return `${parts.value} tuần tuổi`;
    case 'month': return `${parts.value} tháng tuổi`;
    case 'year':  return `${parts.value} tuổi`;
    default: return '';
  }
}

/**
 * Format DOB for input (always return DD/MM/YYYY if possible)
 */
export function formatDobForInput(dob: string): string {
  if (!dob) return '';
  if (DOB_REGEX_DDMMYYYY.test(dob)) return dob; // already DD/MM/YYYY
  if (DOB_REGEX_ISO.test(dob)) {
    const [yyyy, mm, dd] = dob.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
  return ''; // unrecognized format
}

/**
 * Parse DOB dạng legacy ("25 tuổi", "7 tháng", "5.5 tuổi") → age group name.
 * Chỉ dùng cho AgeGroupChart khi parseAgeParts() trả về null.
 * 
 * Returns tên nhóm tuổi trực tiếp, hoặc null nếu không parse được.
 */
export function parseLegacyAgeGroup(dob: string): string | null {
  if (!dob) return null;
  
  const normalized = dob.trim().toLowerCase();
  
  // Pattern: "X tháng" hoặc "X tháng tuổi"
  const monthMatch = normalized.match(/^(\d+(?:[.,]\d+)?)\s*tháng/);
  if (monthMatch) {
    const months = parseFloat(monthMatch[1].replace(',', '.'));
    if (months <= 2) return '0-2 tháng';
    if (months <= 6) return '2-6 tháng';
    if (months <= 24) return '6 tháng-2 tuổi';
    return '2-6 tuổi'; // > 24 months = > 2 years
  }
  
  // Pattern: "X tuổi" hoặc "X,Y tuổi" hoặc "X.Y tuổi"
  const yearMatch = normalized.match(/^(\d+(?:[.,]\d+)?)\s*tuổi/);
  if (yearMatch) {
    const years = parseFloat(yearMatch[1].replace(',', '.'));
    const ageInMonths = years * 12;
    if (ageInMonths <= 2) return '0-2 tháng';
    if (ageInMonths <= 6) return '2-6 tháng';
    if (ageInMonths <= 24) return '6 tháng-2 tuổi';
    if (ageInMonths <= 72) return '2-6 tuổi';
    if (ageInMonths <= 192) return '6-16 tuổi';
    return 'Người lớn';
  }
  
  // Không nhận dạng được (VD: "không tuổi")
  return null;
}
