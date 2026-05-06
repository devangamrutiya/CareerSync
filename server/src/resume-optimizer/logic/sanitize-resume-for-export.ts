import type { ResumeJson } from '../types/resume.types';

/**
 * Plain-text cleanup for ATS exports: strip markdown headings, links, and
 * stray emphasis markers that models sometimes put inside JSON strings.
 */
export function sanitizeAtsString(raw: string): string {
  let s = raw.replace(/\r\n/g, '\n').replace(/\t/g, ' ');

  // Markdown links [label](url) → label, or url if label empty
  s = s.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, label: string, url: string) => {
    const t = String(label).trim();
    const u = String(url).trim();
    return t || u;
  });

  s = s.replace(/\*\*/g, '');
  s = s.replace(/\s+/g, ' ').trim();

  // Leading markdown headings (any line start in single-line strings)
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/^#{1,6}\s+/, '').trim();
  }

  return s;
}

function cleanOptional(s: string | undefined): string | undefined {
  if (s === undefined || s === null) return undefined;
  const out = sanitizeAtsString(String(s));
  return out.length ? out : undefined;
}

export function sanitizeResumeForExport(resume: ResumeJson): ResumeJson {
  return {
    basics: {
      fullName: sanitizeAtsString(resume.basics.fullName),
      email: sanitizeAtsString(resume.basics.email),
      phone: cleanOptional(resume.basics.phone),
      location: cleanOptional(resume.basics.location),
      linkedin: cleanOptional(resume.basics.linkedin),
      github: cleanOptional(resume.basics.github),
      portfolio: cleanOptional(resume.basics.portfolio),
    },
    summary: sanitizeAtsString(resume.summary),
    skills: {
      technical: resume.skills.technical.map((x) => sanitizeAtsString(x)).filter(Boolean),
      tools: resume.skills.tools.map((x) => sanitizeAtsString(x)).filter(Boolean),
      soft:
        resume.skills.soft === undefined
          ? undefined
          : resume.skills.soft.map((x) => sanitizeAtsString(x)).filter(Boolean),
    },
    experience: resume.experience.map((exp) => ({
      ...exp,
      company: sanitizeAtsString(exp.company),
      title: sanitizeAtsString(exp.title),
      location: cleanOptional(exp.location),
      startDate: sanitizeAtsString(exp.startDate),
      endDate: sanitizeAtsString(exp.endDate),
      bullets: exp.bullets.map((b) => sanitizeAtsString(b)).filter(Boolean),
    })),
    projects: resume.projects.map((p) => ({
      ...p,
      name: sanitizeAtsString(p.name),
      techStack: p.techStack?.map((t) => sanitizeAtsString(t)).filter(Boolean),
      bullets: p.bullets.map((b) => sanitizeAtsString(b)).filter(Boolean),
      link: cleanOptional(p.link),
    })),
    education: resume.education.map((edu) => ({
      ...edu,
      institution: sanitizeAtsString(edu.institution),
      degree: sanitizeAtsString(edu.degree),
      field: cleanOptional(edu.field),
      startDate: cleanOptional(edu.startDate),
      endDate: cleanOptional(edu.endDate),
      score: cleanOptional(edu.score),
    })),
    certifications: resume.certifications?.map((c) => ({
      ...c,
      name: sanitizeAtsString(c.name),
      issuer: cleanOptional(c.issuer),
      date: cleanOptional(c.date),
    })),
  };
}
