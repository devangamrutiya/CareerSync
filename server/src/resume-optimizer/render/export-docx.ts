import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
} from 'docx';
import type { ResumeJson } from '../types/resume.types';

function displayUrl(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  if (/^www\./i.test(t)) return `https://${t}`;
  if (/^(linkedin\.com|github\.com|gitlab\.com)\b/i.test(t)) return `https://${t}`;
  return t;
}

/**
 * Convert a ResumeJson into a structured DOCX buffer.
 */
export async function exportDocx(resume: ResumeJson): Promise<Buffer> {
  const children: Paragraph[] = [];

  // ─── Header ─────────────────────────────────────────
  children.push(
    new Paragraph({
      children: [new TextRun({ text: resume.basics.fullName, bold: true, size: 32 })],
      heading: HeadingLevel.HEADING_1,
    }),
  );

  const contactParts: string[] = [];
  if (resume.basics.email) contactParts.push(resume.basics.email);
  if (resume.basics.phone) contactParts.push(resume.basics.phone);
  if (resume.basics.location) contactParts.push(resume.basics.location);
  if (resume.basics.linkedin) contactParts.push(displayUrl(resume.basics.linkedin));
  if (resume.basics.github) contactParts.push(displayUrl(resume.basics.github));
  if (resume.basics.portfolio) contactParts.push(displayUrl(resume.basics.portfolio));
  if (contactParts.length) {
    children.push(new Paragraph({ children: [new TextRun({ text: contactParts.join(' | '), size: 18, color: '555555' })] }));
  }

  children.push(new Paragraph({ children: [] }));

  // ─── Summary ────────────────────────────────────────
  if (resume.summary) {
    children.push(new Paragraph({ text: 'Professional Summary', heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph({ children: [new TextRun({ text: resume.summary })] }));
    children.push(new Paragraph({ children: [] }));
  }

  // ─── Skills ─────────────────────────────────────────
  if (resume.skills.technical.length || resume.skills.tools.length) {
    children.push(new Paragraph({ text: 'Skills', heading: HeadingLevel.HEADING_2 }));
    if (resume.skills.technical.length) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Technical: ', bold: true }),
            new TextRun({ text: resume.skills.technical.join(', ') }),
          ],
        }),
      );
    }
    if (resume.skills.tools.length) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Tools: ', bold: true }),
            new TextRun({ text: resume.skills.tools.join(', ') }),
          ],
        }),
      );
    }
    if (resume.skills.soft?.length) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Soft Skills: ', bold: true }),
            new TextRun({ text: resume.skills.soft.join(', ') }),
          ],
        }),
      );
    }
    children.push(new Paragraph({ children: [] }));
  }

  // ─── Experience ─────────────────────────────────────
  if (resume.experience.length) {
    children.push(new Paragraph({ text: 'Work Experience', heading: HeadingLevel.HEADING_2 }));
    for (const exp of resume.experience) {
      const dateRange = `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`;
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.title, bold: true }),
            new TextRun({ text: `  |  ${dateRange}`, color: '555555' }),
          ],
        }),
      );
      const companyLine: TextRun[] = [
        new TextRun({ text: exp.company, italics: true, color: '444444' }),
      ];
      if (exp.location) {
        companyLine.push(
          new TextRun({ text: `  ·  ${exp.location}`, italics: true, color: '666666' }),
        );
      }
      children.push(new Paragraph({ children: companyLine }));
      for (const bullet of exp.bullets) {
        children.push(new Paragraph({ children: [new TextRun({ text: bullet })], bullet: { level: 0 } }));
      }
      children.push(new Paragraph({ children: [] }));
    }
  }

  // ─── Projects ───────────────────────────────────────
  if (resume.projects.length) {
    children.push(new Paragraph({ text: 'Projects', heading: HeadingLevel.HEADING_2 }));
    for (const proj of resume.projects) {
      const titleParts = [new TextRun({ text: proj.name, bold: true })];
      if (proj.techStack?.length) {
        titleParts.push(new TextRun({ text: `  (${proj.techStack.join(', ')})`, color: '555555' }));
      }
      children.push(new Paragraph({ children: titleParts }));
      for (const bullet of proj.bullets) {
        children.push(new Paragraph({ children: [new TextRun({ text: bullet })], bullet: { level: 0 } }));
      }
      children.push(new Paragraph({ children: [] }));
    }
  }

  // ─── Education ──────────────────────────────────────
  if (resume.education.length) {
    children.push(new Paragraph({ text: 'Education', heading: HeadingLevel.HEADING_2 }));
    for (const edu of resume.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.institution, bold: true }),
            new TextRun({ text: ` — ${edu.degree}${edu.field ? ', ' + edu.field : ''}` }),
          ],
        }),
      );
      if (edu.score) {
        children.push(new Paragraph({ children: [new TextRun({ text: edu.score, color: '555555' })] }));
      }
    }
    children.push(new Paragraph({ children: [] }));
  }

  // ─── Certifications ─────────────────────────────────
  if (resume.certifications?.length) {
    children.push(new Paragraph({ text: 'Certifications', heading: HeadingLevel.HEADING_2 }));
    for (const cert of resume.certifications) {
      const text = `${cert.name}${cert.issuer ? ' — ' + cert.issuer : ''}${cert.date ? ' (' + cert.date + ')' : ''}`;
      children.push(new Paragraph({ children: [new TextRun({ text })] }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  return await Packer.toBuffer(doc);
}
