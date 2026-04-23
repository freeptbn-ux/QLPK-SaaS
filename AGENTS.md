<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## 📏 MUI Link Convention
In Server Components (without 'use client'):
- ❌ **DO NOT** use: `<Button component={Link} href="...">` or `<MuiLink component={Link} href="...">`
  - This causes serialization errors because functions/components cannot be passed as props from Server to Client.
- ✅ **DO** use: `<Link href="..." passHref legacyBehavior><Button>...</Button></Link>`
<!-- END:nextjs-agent-rules -->
