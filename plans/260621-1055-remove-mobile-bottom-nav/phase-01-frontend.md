# Phase 01: Remove Mobile Bottom Nav
Status: ✅ Completed
Dependencies: None

## Objective
Remove the bottom navigation bar (`MobileNav`) in the mobile view, remove its reference from `DashboardShell`, and clean up any related layout spacing.

## Requirements
### Functional
- Mobile viewport (`md:hidden`) must no longer display the bottom navigation bar.
- Layout margin at the bottom of the main content on mobile screens must be removed.

### Non-Functional
- Main container layout should remain correct on all screen sizes.
- No layout shift or content overlapping issues on mobile or desktop viewports.

## Implementation Steps
1. [x] Modify `src/components/features/DashboardShell.tsx`:
   - Remove `<MobileNav />` import and JSX render tag.
   - Adjust `main` class styling: remove `mb-16 md:mb-0` margin spacing since the bottom navigation bar is no longer present on mobile view.
2. [x] Safely deprecate/remove `src/components/features/MobileNav.tsx` or update it to return `null` if kept. (Recommended: delete the file if no longer needed, but let's delete it to clean up the codebase).

## Files to Create/Modify
- [MODIFY] [DashboardShell.tsx](file:///d:/skul9x/QLPK-SaaS-main/src/components/features/DashboardShell.tsx)
- [DELETE] [MobileNav.tsx](file:///d:/skul9x/QLPK-SaaS-main/src/components/features/MobileNav.tsx)

## Test Criteria
- Verify compilation succeeds after modifying `DashboardShell.tsx` and removing `MobileNav.tsx`.
- Perform visual/DOM tests in the next phase.

---
Next Phase: [Phase 02: Verify and Update Tests](file:///d:/skul9x/QLPK-SaaS-main/plans/260621-1055-remove-mobile-bottom-nav/phase-02-testing.md)
