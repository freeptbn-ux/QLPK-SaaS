/**
 * Escapes special characters used in SQL LIKE patterns (%, _)
 * to prevent wildcard injection/attacks.
 */
export function escapeLikePattern(str: string): string {
  if (!str) return '';
  // Escape backslash first, then % and _
  return str.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}
