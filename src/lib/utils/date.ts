/**
 * Format ngày khám cuối cùng thành dạng thân thiện
 * - Nếu null → "Chưa khám"
 * - Nếu hôm nay → "Hôm nay"
 * - Nếu hôm qua → "Hôm qua"
 * - Nếu trong tuần → "X ngày trước"
 * - Nếu trong tháng → "X tuần trước"
 * - Nếu cũ hơn → "dd/MM/yyyy"
 */
export function formatLastVisit(date: string | null | undefined): string {
  if (!date) return 'Chưa khám';
  
  const visitDate = new Date(date);
  const now = new Date();
  
  // Reset time to compare dates only
  const d1 = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
  const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffMs = d2.getTime() - d1.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  
  return visitDate.toLocaleDateString('vi-VN');
}

/**
 * Format ngày sinh sang dạng DD/MM/YYYY
 * @param dob - Ngày sinh dạng ISO string (YYYY-MM-DD) hoặc null
 * @returns Chuỗi DD/MM/YYYY hoặc 'N/A' nếu không có dữ liệu
 */
export function formatDob(dob: string | null): string {
  if (!dob) return 'N/A';

  const date = new Date(dob);
  if (isNaN(date.getTime())) return 'N/A';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}
