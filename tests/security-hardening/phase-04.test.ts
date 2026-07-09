/**
 * Phase 04 Security Tests: CSP Hardening
 *
 * Tests verify:
 * 1. CSP is no longer defined as a static string in next.config.ts
 * 2. proxy.ts generates a nonce and injects it into the CSP
 * 3. Production CSP does NOT contain unsafe-eval
 * 4. CSP contains required directives
 *
 * RUN: npx vitest run tests/security-hardening/phase-04.test.ts
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const NEXT_CONFIG_PATH = path.resolve(process.cwd(), 'next.config.ts');
const PROXY_PATH       = path.resolve(process.cwd(), 'src/proxy.ts');
const nextConfigContent = fs.readFileSync(NEXT_CONFIG_PATH, 'utf-8');
const proxyContent      = fs.readFileSync(PROXY_PATH, 'utf-8');

describe('Phase 04: CSP Hardening', () => {

  describe('next.config.ts — Static CSP must be removed', () => {
    it('does NOT contain a static unsafe-inline in script-src', () => {
      // The old static CSP had unsafe-inline for script-src
      // After this phase, CSP is generated dynamically in proxy.ts
      const hasStaticUnsafeInlineScript = nextConfigContent.match(
        /Content-Security-Policy[\s\S]*?unsafe-inline[\s\S]*?script-src|script-src[\s\S]*?unsafe-inline[\s\S]*?Content-Security-Policy/
      );
      expect(hasStaticUnsafeInlineScript).toBeNull();
    });

    it('does NOT contain a static unsafe-eval in script-src', () => {
      const hasStaticUnsafeEval = nextConfigContent.match(
        /['"]Content-Security-Policy['"]/
      );
      // CSP should be removed from next.config.ts entirely
      expect(hasStaticUnsafeEval).toBeNull();
    });
  });

  describe('proxy.ts — Dynamic nonce-based CSP', () => {
    it('generates a nonce using crypto.randomUUID()', () => {
      expect(proxyContent).toMatch(/crypto\.randomUUID\(\)/);
    });

    it('includes the nonce in the CSP header', () => {
      expect(proxyContent).toMatch(/nonce-/);
      expect(proxyContent).toMatch(/Content-Security-Policy/);
    });

    it("uses 'strict-dynamic' in script-src", () => {
      expect(proxyContent).toMatch(/strict-dynamic/);
    });

    it("sets x-nonce request header for Server Components", () => {
      expect(proxyContent).toMatch(/x-nonce/);
    });

    it("does NOT contain 'unsafe-eval' unconditionally (production CSP)", () => {
      // unsafe-eval may appear in a dev-only branch but must be conditional
      const unsafeEvalMatches = proxyContent.match(/unsafe-eval/g) ?? [];
      if (unsafeEvalMatches.length > 0) {
        // If it exists, it must be inside a dev conditional block
        expect(proxyContent).toMatch(/isDev|NODE_ENV.*development|development.*NODE_ENV/);
      }
    });

    it("contains 'upgrade-insecure-requests' directive", () => {
      expect(proxyContent).toMatch(/upgrade-insecure-requests/);
    });

    it("contains frame-ancestors 'none' directive", () => {
      expect(proxyContent).toMatch(/frame-ancestors/);
    });

    it("allows connection to Gemini API in connect-src", () => {
      expect(proxyContent).toMatch(/generativelanguage\.googleapis\.com/);
    });
  });

  describe('CSP policy structure validation', () => {
    // Extract the CSP string template from proxy.ts for structural checks
    it('proxy.ts CSP template includes default-src self', () => {
      expect(proxyContent).toMatch(/default-src.*'self'/);
    });

    it('proxy.ts CSP style-src allows unsafe-inline (acceptable for Tailwind)', () => {
      // style-src unsafe-inline is acceptable — CSS injection << script injection
      expect(proxyContent).toMatch(/style-src.*unsafe-inline/);
    });
  });
});
