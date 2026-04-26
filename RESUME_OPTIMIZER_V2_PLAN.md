# 🚀 Resume Optimizer V2 — Full Implementation Plan

> **Project**: JobSync AI  
> **Date**: April 23, 2026  
> **Status**: Awaiting approval

---

## 📌 Problem with Current Approach

The current resume optimizer is a **single-shot flow**:

```
Upload PDF → Extract text → Gemini rewrites everything → Dump to DOCX
```

**Issues:**
- ❌ No control over what changes — you get a blob of AI text
- ❌ AI can hallucinate skills, companies, tools you never had
- ❌ Formatting is broken — layout/design is lost
- ❌ No way to accept some changes and reject others
- ❌ No structured data — just raw text in, raw text out

---

## ✅ What V2 Will Do

```
Upload → Parse → Analyze Gap → Generate Suggestions → Review & Accept/Reject → Render → Export PDF/DOCX
```

**Key principle**: The LLM handles **content intelligence** only. Our code handles **layout and formatting**.

---

## 🏗️ Architecture Decision

| Option | Description | Recommendation |
|--------|-------------|----------------|
| Next.js API Routes | Move resume logic to client-side API routes | ❌ Would duplicate auth, Prisma, middleware |
| **NestJS Backend** | Keep new endpoints alongside existing auth/jobs/gmail | ✅ **Chosen** — consistent, reuses existing infrastructure |

The Next.js client stays as the **UI layer only**. All AI processing, database operations, and file handling stay in the NestJS backend.

---

## 📊 New Database Tables

These tables track each optimization run through every stage:

### `ResumeRun` — Tracks one optimization request
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| userId | string | FK to User |
| status | enum | `uploaded` → `parsed` → `analyzed` → `suggested` → `reviewed` → `finalized` → `exported` → `failed` |
| originalResumeFileUrl | string | Path to uploaded resume |
| originalJdText | string? | Raw job description text |
| createdAt | datetime | When created |
| updatedAt | datetime | Last updated |

### `ParsedResume` — Structured resume data extracted by AI
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| runId | string | FK to ResumeRun (unique) |
| data | JSON | `ResumeJson` structure |

### `ParsedJobDescription` — Structured JD data extracted by AI
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| runId | string | FK to ResumeRun (unique) |
| data | JSON | `JobDescriptionJson` structure |

### `AnalysisResult` — Gap analysis between resume and JD
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| runId | string | FK to ResumeRun (unique) |
| data | JSON | `GapAnalysisJson` structure |

### `Suggestion` — AI-generated improvement suggestions
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| runId | string | FK to ResumeRun (unique) |
| data | JSON | `ResumeSuggestionsJson` structure |

### `FinalResume` — The accepted/merged final version
| Field | Type | Description |
|-------|------|-------------|
| id | uuid | Primary key |
| runId | string | FK to ResumeRun (unique) |
| data | JSON | Final `ResumeJson` after merge |
| html | string? | Rendered HTML |
| pdfUrl | string? | Path to exported PDF |
| docxUrl | string? | Path to exported DOCX |

---

## 📋 Core JSON Schemas

### ResumeJson
```typescript
type ResumeJson = {
  basics: {
    fullName: string
    email: string
    phone?: string
    location?: string
    linkedin?: string
    github?: string
    portfolio?: string
  }
  summary: string
  skills: {
    technical: string[]
    tools: string[]
    soft?: string[]
  }
  experience: Array<{
    id: string
    company: string
    title: string
    location?: string
    startDate: string
    endDate: string
    current?: boolean
    bullets: string[]
  }>
  projects: Array<{
    id: string
    name: string
    techStack?: string[]
    bullets: string[]
    link?: string
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field?: string
    startDate?: string
    endDate?: string
    score?: string
  }>
  certifications?: Array<{
    id: string
    name: string
    issuer?: string
    date?: string
  }>
}
```

### JobDescriptionJson
```typescript
type JobDescriptionJson = {
  title: string
  company?: string
  location?: string
  employmentType?: string
  seniority?: string
  mustHaveSkills: string[]
  niceToHaveSkills: string[]
  responsibilities: string[]
  qualifications: string[]
  keywords: string[]
  tools: string[]
  experienceRequired?: string
  educationRequired?: string
}
```

### GapAnalysisJson
```typescript
type GapAnalysisJson = {
  overallMatchScore: number        // 0-100
  matchedKeywords: string[]
  missingKeywords: string[]
  strengths: string[]
  gaps: string[]
  sectionsToImprove: Array<{
    section: "summary" | "skills" | "experience" | "projects"
    reason: string
  }>
  experienceBulletCandidates: Array<{
    experienceId: string
    bulletIndex: number
    reason: string
    targetKeywords: string[]
  }>
  warnings: string[]
}
```

### ResumeSuggestionsJson
```typescript
type ResumeSuggestionsJson = {
  summarySuggestion?: {
    original: string
    suggested: string
    reason: string
  }
  skillsSuggestion?: {
    original: { technical: string[]; tools: string[]; soft?: string[] }
    suggested: { technical: string[]; tools: string[]; soft?: string[] }
    reason: string
  }
  experienceSuggestions: Array<{
    experienceId: string
    originalBullets: string[]
    suggestedBullets: string[]
    reasons: string[]
  }>
  projectSuggestions: Array<{
    projectId: string
    originalBullets: string[]
    suggestedBullets: string[]
    reasons: string[]
  }>
  missingKeywords: string[]
  warnings: string[]
}
```

---

## 🔌 API Endpoints (NestJS)

All endpoints are JWT-protected.

### `POST /resume-optimizer/analyze`

**Receives**: Resume PDF + JD text (multipart form-data)  
**Does**:
1. Store uploaded file
2. Parse resume → `ResumeJson`
3. Parse JD → `JobDescriptionJson`
4. Run gap analysis → `GapAnalysisJson`
5. Generate suggestions → `ResumeSuggestionsJson`
6. Validate (no hallucinations)
7. Save all artifacts to DB

**Returns**:
```json
{ "runId": "run_123", "status": "suggested" }
```

---

### `GET /resume-optimizer/runs/:runId`

**Returns** everything needed for the review screen:
```json
{
  "run": { "id": "...", "status": "suggested", ... },
  "resume": { /* ResumeJson */ },
  "jobDescription": { /* JobDescriptionJson */ },
  "analysis": { /* GapAnalysisJson */ },
  "suggestions": { /* ResumeSuggestionsJson */ }
}
```

---

### `POST /resume-optimizer/runs/:runId/apply`

**Receives** accepted changes:
```json
{
  "accepted": {
    "summary": true,
    "skills": true,
    "experience": [
      { "experienceId": "exp_1", "accepted": true },
      { "experienceId": "exp_2", "accepted": false }
    ],
    "projects": [
      { "projectId": "proj_1", "accepted": true }
    ]
  }
}
```

**Does**: Merge accepted changes into `ResumeJson`, save as `FinalResume`.

---

### `POST /resume-optimizer/runs/:runId/export`

**Receives**:
```json
{ "format": "pdf", "template": "classic" }
```

**Does**: Render final resume HTML → export PDF or DOCX → return file URL.

---

## 🎨 Frontend Pages

### Page 1: Upload (`/resume-optimizer`)

```
┌────────────────────────────────────────┐
│          Resume Optimizer V2           │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  📄 Drop your resume PDF here   │  │
│  │     or click to browse           │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │  Job Description                 │  │
│  │  Paste the full JD here...       │  │
│  │                                  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [ 🔍 Analyze Resume ]                │
└────────────────────────────────────────┘
```

---

### Page 2: Review (`/resume-optimizer/review/:runId`)

```
┌────────────────────────────────────────────────┐
│  ATS Score: 72/100    Target: .NET Developer   │
│                                                │
│  ✅ Matched: C#, .NET, SQL, Entity Framework   │
│  ❌ Missing: ASP.NET MVC, IIS, Visual Basic    │
│                                                │
│  ┌──────┬────────┬────────────┬──────────┐     │
│  │Summary│ Skills │ Experience │ Projects │     │
│  └──────┴────────┴────────────┴──────────┘     │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ Yudiz Solutions Limited                  │  │
│  │ .NET Developer                           │  │
│  │                                          │  │
│  │ Original:                                │  │
│  │ • Built internal dashboard for ops team  │  │
│  │                                          │  │
│  │ Suggested:                               │  │
│  │ • Built internal dashboards using        │  │
│  │   ASP.NET MVC and Entity Framework,      │  │
│  │   improving operations visibility        │  │
│  │                                          │  │
│  │ Reason: Better alignment to ASP.NET,     │  │
│  │ MVC, and Entity Framework in JD          │  │
│  │                                          │  │
│  │        [ ✅ Accept ] [ ❌ Reject ]       │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [ Apply Selected Changes → ]                  │
└────────────────────────────────────────────────┘
```

---

### Page 3: Preview & Export (`/resume-optimizer/preview/:runId`)

```
┌────────────────────────────────────────┐
│  Final Resume Preview                  │
│  ┌──────────────────────────────────┐  │
│  │ ┌────────────────────────────┐   │  │
│  │ │     Devang Amrutiya        │   │  │
│  │ │   .NET Full Stack Dev      │   │  │
│  │ │   email | phone | linkedin │   │  │
│  │ ├────────────────────────────┤   │  │
│  │ │ Summary                    │   │  │
│  │ │ Skilled .NET Developer...  │   │  │
│  │ ├────────────────────────────┤   │  │
│  │ │ Experience                 │   │  │
│  │ │ • Yudiz Solutions          │   │  │
│  │ │   - bullet 1               │   │  │
│  │ │   - bullet 2               │   │  │
│  │ └────────────────────────────┘   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [ 📄 Export PDF ] [ 📝 Export DOCX ]  │
└────────────────────────────────────────┘
```

---

## 🧠 Gemini AI Modules

Each AI task is a separate, focused module:

| Module | Input | Output | Prompt Style |
|--------|-------|--------|--------------|
| `parse-resume.ts` | Resume PDF | `ResumeJson` | Strict extraction, no inference |
| `parse-job-description.ts` | JD text/PDF | `JobDescriptionJson` | Separate must-have vs nice-to-have |
| `analyze-gap.ts` | Resume + JD JSON | `GapAnalysisJson` | Comparison only, no invention |
| `rewrite-resume.ts` | Resume + JD + Gap | `ResumeSuggestionsJson` | Targeted rewrites, no new content |
| `validate-suggestions.ts` | Original + Suggestions | Warnings[] | Critic, flags hallucinations |

### Anti-Hallucination Validation Rules (enforced in code)

Before saving suggestions, **reject or flag** if:
- ❌ A skill appears in suggestion but NOT in source resume
- ❌ Company name changes
- ❌ Job title changes without clear source
- ❌ Dates change
- ❌ Metrics appear out of nowhere (e.g., "improved by 40%")
- ❌ Certifications appear without source evidence
- ❌ Tools/frameworks appear without source evidence

---

## 🔄 Merge Logic

When user clicks "Apply Changes", we **do NOT regenerate the whole resume**. We merge only accepted pieces:

```typescript
function mergeAcceptedChanges(
  original: ResumeJson,
  suggestions: ResumeSuggestionsJson,
  accepted: {
    summary?: boolean
    skills?: boolean
    experience?: Array<{ experienceId: string; accepted: boolean }>
    projects?: Array<{ projectId: string; accepted: boolean }>
  }
): ResumeJson {
  const result = structuredClone(original)

  if (accepted.summary && suggestions.summarySuggestion) {
    result.summary = suggestions.summarySuggestion.suggested
  }

  if (accepted.skills && suggestions.skillsSuggestion) {
    result.skills = suggestions.skillsSuggestion.suggested
  }

  for (const exp of accepted.experience ?? []) {
    if (!exp.accepted) continue
    const suggestion = suggestions.experienceSuggestions
      .find(s => s.experienceId === exp.experienceId)
    const entry = result.experience.find(e => e.id === exp.experienceId)
    if (suggestion && entry) {
      entry.bullets = suggestion.suggestedBullets
    }
  }

  for (const proj of accepted.projects ?? []) {
    if (!proj.accepted) continue
    const suggestion = suggestions.projectSuggestions
      .find(s => s.projectId === proj.projectId)
    const entry = result.projects.find(p => p.id === proj.projectId)
    if (suggestion && entry) {
      entry.bullets = suggestion.suggestedBullets
    }
  }

  return result
}
```

---

## 📁 Project Structure (New Files)

```
server/src/resume-optimizer/
  ├── resume-optimizer.module.ts
  ├── resume-optimizer.controller.ts
  ├── resume-optimizer.service.ts
  │
  ├── types/
  │   └── resume.types.ts          # All JSON schemas
  │
  ├── gemini/
  │   ├── gemini-resume.client.ts   # Shared Gemini client
  │   ├── parse-resume.ts
  │   ├── parse-job-description.ts
  │   ├── analyze-gap.ts
  │   ├── rewrite-resume.ts
  │   └── validate-suggestions.ts
  │
  ├── logic/
  │   ├── merge-accepted-changes.ts
  │   └── keyword-match.ts
  │
  └── render/
      ├── render-resume-html.ts     # ResumeJson → styled HTML
      ├── export-pdf.ts             # HTML → PDF
      └── export-docx.ts            # ResumeJson → DOCX

client/src/
  ├── app/
  │   └── resume-optimizer/
  │       ├── page.tsx              # Upload page
  │       ├── review/
  │       │   └── [runId]/
  │       │       └── page.tsx      # Review page
  │       └── preview/
  │           └── [runId]/
  │               └── page.tsx      # Preview + Export page
  │
  └── components/
      └── resume-optimizer/
          ├── ResumeUploadForm.tsx
          ├── MatchOverview.tsx
          ├── SuggestionCard.tsx
          ├── BulletDiffCard.tsx
          ├── SectionTabs.tsx
          └── ResumePreview.tsx
```

---

## 📐 Build Order (MVP First)

| Step | What | Priority |
|------|------|----------|
| 1 | TypeScript schemas (`ResumeJson`, etc.) | 🔴 Must |
| 2 | Prisma schema + migration | 🔴 Must |
| 3 | Gemini parse functions | 🔴 Must |
| 4 | `POST /analyze` endpoint | 🔴 Must |
| 5 | `GET /runs/:runId` endpoint | 🔴 Must |
| 6 | Upload page (frontend) | 🔴 Must |
| 7 | Review page with accept/reject | 🔴 Must |
| 8 | Merge logic | 🔴 Must |
| 9 | Resume React template | 🔴 Must |
| 10 | Preview page | 🔴 Must |
| 11 | PDF export | 🔴 Must |
| 12 | DOCX export | 🟡 Nice to have |
| 13 | Multiple templates | 🟡 Nice to have |
| 14 | Cover letter generation | 🟢 Future |
| 15 | Interview Q&A | 🟢 Future |

---

## ❓ Decisions Needed From You

### 1. PDF Generation Library

| Option | Pros | Cons |
|--------|------|------|
| **Puppeteer** | Pixel-perfect, supports all CSS | Heavy (~300MB), needs Chrome |
| **html-pdf-node** | Lightweight, fast | Less CSS support |
| **@react-pdf/renderer** | React-native PDF, no browser | Different component syntax |

**My recommendation**: Puppeteer for best quality. What do you think?

### 2. Old `/resumes/optimize` Endpoint

| Option | Description |
|--------|-------------|
| **Keep both** | Old simple endpoint stays, new pipeline added alongside |
| **Replace** | Remove old endpoint entirely, only new pipeline |

**My recommendation**: Replace it. The new pipeline is strictly better.

### 3. File Storage

| Option | Description | Cost |
|--------|-------------|------|
| **Local disk** | Store in `uploads/` folder | Free, MVP only |
| **S3/R2** | Cloud storage from day 1 | Small monthly cost |

**My recommendation**: Local disk for MVP, migrate to cloud later.

---

## ✅ Once You Approve

I will start building in the exact order listed above. The full MVP should take approximately **3–4 focused sessions** to complete.

Just reply with your decisions on the 3 questions above and say **"Go"** to start! 🚀
