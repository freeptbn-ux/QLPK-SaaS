import { describe, it, expect } from 'vitest';
import { runDatabaseMigration } from '../src/actions/system';

describe('Security Phase 01: Critical DB & Repo Fixes', () => {
  it('should have runDatabaseMigration disabled', async () => {
    const result = await runDatabaseMigration();
    expect(result.success).toBe(false);
    expect(result.error).toContain('vô hiệu hóa');
  });
});
