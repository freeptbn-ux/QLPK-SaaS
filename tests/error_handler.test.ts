import { getGenericErrorMessage } from '../src/lib/error-handler';
import { describe, it, expect } from 'vitest';

describe('Error Handler Logic', () => {
  it('maps unique constraint violation to user-friendly message', () => {
    const error = new Error('duplicate key value violates unique constraint "medicines_name_clinic_id_key"');
    expect(getGenericErrorMessage(error)).toBe('Dữ liệu này đã tồn tại trong hệ thống.');
  });

  it('maps insufficient stock error from RPC to user-friendly message', () => {
    const error = new Error('Insufficient stock. Current: 10, Requested adjustment: -20');
    expect(getGenericErrorMessage(error)).toBe('Số lượng tồn kho không đủ để thực hiện thao tác này.');
  });

  it('maps foreign key constraint violation to user-friendly message', () => {
    const error = new Error('violates foreign key constraint "some_fk"');
    expect(getGenericErrorMessage(error)).toBe('Không thể thực hiện tác vụ này vì dữ liệu đang được sử dụng ở nơi khác.');
  });

  it('returns default message for unknown errors', () => {
    const error = new Error('Some random backend crash');
    expect(getGenericErrorMessage(error)).toBe('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
  });
});
