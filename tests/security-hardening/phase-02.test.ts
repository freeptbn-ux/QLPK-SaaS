/**
 * Phase 02 Security Tests: Middleware Configuration
 *
 * These tests verify:
 * 1. proxy.ts exports the correct function name 'proxy' (Next.js 16 convention)
 * 2. The config.matcher is defined
 * 3. The proxy function implements route guard logic for protected paths
 *
 * RUN: npx vitest run tests/security-hardening/phase-02.test.ts
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const PROXY_FILE = path.resolve(process.cwd(), 'src/proxy.ts');
const proxyContent = fs.readFileSync(PROXY_FILE, 'utf-8');

describe('Phase 02: Middleware (proxy.ts) Configuration', () => {

  it('proxy.ts file exists', () => {
    expect(fs.existsSync(PROXY_FILE)).toBe(true);
  });

  it('exports function named "proxy" (Next.js 16 convention)', () => {
    expect(proxyContent).toMatch(/export\s+async\s+function\s+proxy\s*\(/);
  });

  it('does NOT export a function named "middleware" (old convention — would be ignored)', () => {
    expect(proxyContent).not.toMatch(/export\s+(async\s+)?function\s+middleware\s*\(/);
  });

  it('exports config with matcher', () => {
    expect(proxyContent).toMatch(/export\s+const\s+config\s*=/);
    expect(proxyContent).toMatch(/matcher/);
  });

  it('calls updateSession for token refresh', () => {
    expect(proxyContent).toMatch(/updateSession/);
  });

  it('imports NextResponse for redirect capability', () => {
    expect(proxyContent).toMatch(/NextResponse/);
  });

  it('has protected path check logic', () => {
    // Should contain route guard logic referencing protected routes
    const hasPatients = proxyContent.includes('/patients');
    const hasMedicines = proxyContent.includes('/medicines');
    expect(hasPatients).toBe(true);
    expect(hasMedicines).toBe(true);
  });

  it('redirects to /login when unauthenticated (has redirect logic)', () => {
    expect(proxyContent).toMatch(/\/login/);
    expect(proxyContent).toMatch(/redirect/i);
  });

  describe('src/lib/supabase/proxy.ts — updateSession implementation', () => {
    const LIB_PROXY = path.resolve(process.cwd(), 'src/lib/supabase/proxy.ts');
    const libContent = fs.readFileSync(LIB_PROXY, 'utf-8');

    it('updateSession file exists', () => {
      expect(fs.existsSync(LIB_PROXY)).toBe(true);
    });

    it('uses getAll/setAll cookie pattern (Next.js 16 compatible)', () => {
      expect(libContent).toMatch(/getAll/);
      expect(libContent).toMatch(/setAll/);
    });

    it('does NOT use deprecated cookies().set() pattern', () => {
      // Old pattern that was removed in Next.js 16
      expect(libContent).not.toMatch(/cookies\(\)\.set\(/);
    });
  });
});
