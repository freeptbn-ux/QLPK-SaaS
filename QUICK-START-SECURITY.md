# How to Use Security Analysis Prompts - Quick Start

## 📋 Files Created

1. **security-analysis-prompt.json** - Comprehensive prompt with full configuration
2. **security-prompt-simple.json** - Simplified version ready to paste into AI models
3. **SECURITY-ANALYSIS-GUIDE.md** - Detailed usage guide
4. **THIS FILE** - Quick reference

---

## 🚀 Quick Start: Generate Security Report in 3 Steps

### Step 1: Copy Your Code
Gather all your source code files that need analysis:
- API routes: `/src/app/api/**`
- Business logic: `/src/lib/**`  
- Database code: `/src/actions/**`
- Components with business logic: `/src/components/**`
- Migrations: `/supabase/migrations/**`

### Step 2: Use the Prompt

#### Option A: Use with ChatGPT/Claude Web
1. Open https://chatgpt.com or https://claude.ai
2. Paste the content from `security-prompt-simple.json`
3. Add your code files or paste code snippets
4. Ask: "Analyze this code for security vulnerabilities as specified in the prompt"

#### Option B: Use with Copilot (VS Code)
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Shift+I` (Mac)
- Paste the prompt content
- Attach your code files or folders
- Submit the request

#### Option C: API Integration (if using API)
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {
        "role": "system",
        "content": "You are an expert security analyst..."
      },
      {
        "role": "user", 
        "content": "Please analyze this code: [CODE HERE]"
      }
    ]
  }'
```

### Step 3: Save Output as secu.md

The AI will generate a security report. Save it as:
```
/home/skul9x/Desktop/Test_code/QLPK-SaaS-main/secu.md
```

---

## 📝 What Your secu.md Should Contain

```markdown
# Security Analysis Report

## Executive Summary
- Risk Level: [Critical/High/Medium/Low]
- Total Issues Found: [number]
- Critical Issues: X
- High Risk Issues: Y
- Medium Issues: Z
- Low Issues: W

## Critical Vulnerabilities (requires immediate fix)
### 1. SQL Injection in User Query
- **Location**: src/lib/queries.ts:45
- **Severity**: CRITICAL
- **Description**: Direct string interpolation in SQL query
- **Code**: `SELECT * FROM users WHERE id = ${id}`
- **Fix**: Use parameterized queries

[...more critical issues...]

## High Risk Vulnerabilities
[...similar format...]

## Medium Risk Issues
[...similar format...]

## Low Risk Issues & Best Practices
[...similar format...]

## Security Checklist
- ✓ Authentication properly implemented
- ✗ RLS policies not enabled on medicines table
- ✓ Input validation using Zod
[...complete checklist...]

## Remediation Plan
1. **TODAY**: Fix SQL injection (CRITICAL)
2. **This Week**: Enable RLS policies (HIGH)
3. **Next Week**: Improve error handling (MEDIUM)
[...rest of plan...]
```

---

## 🔍 Key Things the Analysis Should Check

Based on your tech stack (Next.js + Supabase + TypeScript), look for:

### Database Security 🗄️
- [ ] SQL Injection vulnerabilities (string concatenation in queries)
- [ ] RLS policies enabled on all tables
- [ ] Proper permission scoping
- [ ] No credential exposure

### Authentication 🔐
- [ ] Proper Supabase Auth setup
- [ ] JWT handling is secure
- [ ] Session management correct
- [ ] Protected routes

### API Security 🔌
- [ ] API routes have auth checks
- [ ] CORS is configured properly
- [ ] Rate limiting exists
- [ ] Input validation on all endpoints

### Frontend Security ⚛️
- [ ] No XSS vulnerabilities (dangerouslySetInnerHTML check)
- [ ] Sensitive data not in localStorage
- [ ] API keys not exposed to client
- [ ] Form inputs properly validated

### Secrets Management 🔑
- [ ] No hardcoded API keys
- [ ] Environment variables properly used
- [ ] .env.local in .gitignore
- [ ] Secrets not logged

---

## 💡 Example Prompts to Use

### Full Analysis
```
"I have a Next.js medical SaaS application with Supabase backend. 
Please perform a comprehensive security analysis focusing on:
1. Authentication and authorization
2. SQL injection prevention
3. XSS vulnerabilities  
4. Supabase Row Level Security policies
5. Secrets and credentials management

Here are my source files: [CODE]

Output the analysis as a markdown file ready for secu.md"
```

### Focused on Specific Issue
```
"I'm concerned about SQL injection in my data access layer. 
Here's my code that queries the database. Please identify any SQL injection risks 
and recommend fixes: [CODE]"
```

### RLS Policy Review
```
"Please review my Supabase RLS policies to ensure they properly protect data.
Here are my migrations: [MIGRATIONS]"
```

---

## ✅ Validation Checklist

After receiving the analysis, verify that it includes:

- [ ] Specific file paths and line numbers
- [ ] Clear severity levels for each issue
- [ ] Code examples of the vulnerability
- [ ] Proof of concept when applicable
- [ ] Working code fixes with explanations
- [ ] Remediation priority/sequencing
- [ ] Use of markdown formatting
- [ ] English language throughout
- [ ] Actionable recommendations
- [ ] Technology-specific advice for Next.js/Supabase

---

## 🎯 Next Steps After Report Generation

1. **Read the Executive Summary** - Understand your security posture
2. **Prioritize CRITICAL items** - Fix immediately
3. **Create Issues/Tickets** - Track fixes in your project management
4. **Assign Fixes** - Distribute work to team members
5. **Implement Fixes** - Follow the recommendations
6. **Add Tests** - Prevent regression
7. **Re-run Analysis** - Verify all fixes
8. **Archive Report** - Save for compliance/audit

---

## 📞 Support

If the analysis seems incomplete:
- Ask the AI to focus on specific areas
- Provide more code context
- Request examples with your specific tech stack
- Ask for remediation code samples

---

**Created for**: QLPK-SaaS Medical Application
**Tech**: Next.js 16 + React 19 + TypeScript + Supabase + PostgreSQL
**Date**: May 2026
