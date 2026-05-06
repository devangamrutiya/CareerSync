# Applykr — Landing Page Wireframe Prompt

> Use this prompt in Figma AI, Framer, v0.dev, Relume, or any AI wireframe/design tool.

---

## 🎯 Prompt

Create a modern, premium SaaS landing page wireframe for **Applykr** — an AI-powered job application tracker and resume optimizer built for serious job seekers.

---

### 📐 Page Structure (Top → Bottom)

#### 1. Floating Navbar
- Logo (icon + "Applykr" wordmark) on the left
- Nav links: Features, How It Works, Pricing, Trust
- Right side: "Log in" text link + "Start Free" primary CTA button (gradient blue→purple, pill-shaped)
- Sticky on scroll, glassmorphism background (frosted blur + border)

#### 2. Hero Section
- **Badge**: Small pill tag above headline → "AI-Powered Job Search OS"
- **Headline** (large, bold, max 2 lines):
  "Track every application. Tailor every resume. Never miss an opportunity."
- **Subheadline** (muted, 2 lines max):
  "Applykr turns scattered applications, Gmail updates, and resumes into one clean workflow — powered by AI that understands what recruiters want."
- **Two CTAs side by side**:
  - Primary: "Create your workspace" (gradient bg, rounded-2xl)
  - Secondary: "See how it works" (ghost/outlined, rounded-2xl)
- **Three mini stat cards** below CTAs in a row:
  - "Inbox-aware" — Connect Gmail for automatic job update detection
  - "Role-specific resumes" — AI-tailored resumes for each job description
  - "Single dashboard" — Track every company, status, and date in one view
- **Right side / below**: A polished product mockup showing the dashboard UI with:
  - Job cards (company name, role, status badge)
  - Gmail sync indicator
  - Resume optimizer card preview

#### 3. Problem Section — "Why Applykr?"
Three cards in a row, each with icon + title + description:
- **Card 1**: "Spreadsheets don't scale" — Tracking 50+ applications in Google Sheets leads to missed deadlines and forgotten follow-ups.
- **Card 2**: "Inbox chaos" — Interview invitations, rejections, and scheduling emails get buried in cluttered inboxes.
- **Card 3**: "One resume doesn't fit all" — Sending the same generic resume to every job kills your ATS match rate.

#### 4. Bento Feature Grid (6 cards, asymmetric grid)
Large heading: "Everything your job search needs — in one place"

| Card | Size | Title | Description | Visual Element |
|------|------|-------|-------------|----------------|
| 1 | Large (2-col span) | Application Tracker | Add jobs manually or auto-detect from Gmail. Track company, role, status, applied date. Filter by status, search by company. | Mini dashboard table UI |
| 2 | Standard | Gmail Sync | Connect your Gmail account. Applykr scans your inbox and auto-detects application confirmations, interview invitations, shortlisting emails, and rejections. | Gmail icon + sync animation |
| 3 | Standard | Smart Status Detection | AI reads your emails and detects specific stages — Applied, Shortlisted, Interview Scheduled, 2nd Round, Practical Interview, Virtual Interview, Offer, Rejected. | Status badge flow diagram |
| 4 | Large (2-col span) | AI Resume Optimizer | Upload your resume PDF. Paste the job description. Applykr's AI analyzes gaps, rewrites bullet points, and generates a tailored ATS-optimized PDF. | Before/after resume preview |
| 5 | Standard | Match Score & Gap Analysis | See your ATS compatibility score (0-100), matched keywords, missing keywords, and section-by-section improvement suggestions. | Circular score gauge + keyword badges |
| 6 | Standard | Accept / Reject Changes | Review every AI suggestion individually. See original vs. suggested bullet points with reasons. Accept what you like, reject what you don't. | Toggle/checkbox card UI |

#### 5. Workflow Timeline Section — "How It Works"
Left side: Section heading + subtext
Right side: 4 vertical step cards with number badges:
1. "Create an account and open your dashboard"
2. "Add jobs manually or connect Gmail for inbox-powered updates"
3. "Upload your resume and paste a job description for AI analysis"
4. "Review suggestions, accept changes, and export your tailored PDF"

#### 6. Large Product Preview Section
Full-width rounded card with tab switcher:
- **Tab 1**: Dashboard — Shows job tracker table with status filters
- **Tab 2**: Resume Optimizer — Shows upload form + gap analysis results
- **Tab 3**: Review & Accept — Shows before/after bullet comparison with accept/reject toggles
- **Tab 4**: Export — Shows preview of final styled resume PDF

Label above: "See Applykr in action"
Subtle glow/gradient border around the preview card.

#### 7. Trust & Privacy Section
Heading: "Built with transparency — no hidden behavior"
Three cards:
- "Per-user data isolation behind JWT-authenticated API routes"
- "Gmail integration is opt-in — only activated when you connect your account"
- "Resume optimization happens inside your workflow, not scattered across tools"

#### 8. Pricing Section (Free MVP)
Heading: "Start free. No credit card required."
Single pricing card (centered):
- **Plan**: Free
- **Includes**: Unlimited job tracking, Gmail sync, AI resume optimization, PDF export
- **CTA**: "Get Started Free"
- **Note**: "No credit card • No trial limit • Just start"

#### 9. Final CTA Section
Gradient background card (blue→purple glow):
- Heading: "Build a job search workflow you can actually trust"
- Subtext: "Create your account, connect the tools you need, and keep every opportunity visible from one dashboard."
- Two CTAs: "Start free" + "Sign in"

#### 10. Footer
- Logo + tagline
- Links: Features, How It Works, Pricing, Privacy, Terms
- Social icons (GitHub, LinkedIn, Twitter)
- Copyright: "© 2026 Applykr. All rights reserved."

---

### 🎨 Design Style

| Property | Value |
|----------|-------|
| **Theme** | Dark mode (slate-950 background) |
| **Primary accent** | Cyan (#06B6D4) + Blue (#3B82F6) |
| **Secondary accent** | Purple (#8B5CF6) |
| **Card style** | Glassmorphism — frosted bg (white/5%), subtle border (white/10%), backdrop-blur |
| **Border radius** | Large rounded corners (1.5rem – 2rem) |
| **Typography** | Clean sans-serif (Inter or Geist), strong hierarchy |
| **Spacing** | Generous whitespace, breathing room between sections |
| **Effects** | Soft gradients, subtle glow on CTAs, radial gradient hero bg |
| **Grid** | Bento-style asymmetric layout for features |
| **Icons** | Minimal line icons or filled with accent colors |
| **Product previews** | Embedded mini UI mockups inside cards (not screenshots) |

---

### 📱 Responsive Requirements
- **Desktop**: Full bento grid, side-by-side hero layout
- **Tablet**: 2-column grid, stacked hero
- **Mobile**: Single column, stacked cards, hamburger nav, full-width CTAs

---

### ⚡ Key Design Principles
1. **Conversion-focused**: Every section leads toward "Start Free" CTA
2. **Visual hierarchy**: Large headlines → subtext → cards → CTA
3. **Product storytelling**: Show the actual UI inside feature cards
4. **Trust signals**: Privacy-first messaging, no-credit-card badge
5. **Premium feel**: Glassmorphism, gradients, generous spacing — not a generic template

--
### Application Name: **Applykr**
### Tagline: "AI-powered workflow for modern job seekers"
