/**
 * Removes diacritics from Vietnamese text.
 * Ported from common Vietnamese normalization utilities.
 */
export function removeDiacritics(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}
