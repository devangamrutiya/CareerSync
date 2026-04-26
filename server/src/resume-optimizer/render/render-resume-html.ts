import type { ResumeJson } from '../types/resume.types';

/**
 * Render a ResumeJson into a clean, styled HTML string
 * suitable for PDF export and preview.
 */
export function renderResumeHtml(resume: ResumeJson): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const contactParts: string[] = [];
  if (resume.basics.email) contactParts.push(esc(resume.basics.email));
  if (resume.basics.phone) contactParts.push(esc(resume.basics.phone));
  if (resume.basics.location) contactParts.push(esc(resume.basics.location));
  if (resume.basics.linkedin) contactParts.push(`<a href="${esc(resume.basics.linkedin)}">${esc(resume.basics.linkedin)}</a>`);
  if (resume.basics.github) contactParts.push(`<a href="${esc(resume.basics.github)}">${esc(resume.basics.github)}</a>`);
  if (resume.basics.portfolio) contactParts.push(`<a href="${esc(resume.basics.portfolio)}">${esc(resume.basics.portfolio)}</a>`);

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(resume.basics.fullName)} - Resume</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #1a1a1a;
    padding: 40px 50px;
    max-width: 800px;
    margin: 0 auto;
  }
  h1 { font-size: 22pt; font-weight: 700; color: #111; margin-bottom: 4px; }
  .contact { font-size: 9.5pt; color: #444; margin-bottom: 16px; }
  .contact a { color: #2563eb; text-decoration: none; }
  h2 {
    font-size: 12pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #111;
    border-bottom: 1.5px solid #333;
    padding-bottom: 3px;
    margin-top: 18px;
    margin-bottom: 8px;
  }
  .summary { font-size: 10.5pt; color: #333; margin-bottom: 4px; }
  .skills-list { font-size: 10.5pt; color: #333; margin-bottom: 2px; }
  .skills-list strong { color: #111; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-top: 10px; }
  .exp-title { font-weight: 600; font-size: 11pt; }
  .exp-date { font-size: 9.5pt; color: #555; }
  .exp-company { font-size: 10pt; color: #444; font-style: italic; }
  ul { padding-left: 18px; margin-top: 4px; margin-bottom: 8px; }
  li { font-size: 10.5pt; margin-bottom: 2px; color: #333; }
  .edu-entry { margin-top: 6px; }
  .edu-entry .institution { font-weight: 600; }
  .edu-entry .degree { font-size: 10pt; color: #444; }
  .edu-entry .score { font-size: 9.5pt; color: #555; }
  .proj-name { font-weight: 600; font-size: 11pt; margin-top: 10px; }
  .proj-tech { font-size: 9.5pt; color: #555; }
  .cert-entry { font-size: 10.5pt; margin-top: 4px; }
</style>
</head>
<body>
`;

  // Header
  html += `<h1>${esc(resume.basics.fullName)}</h1>\n`;
  if (contactParts.length) {
    html += `<div class="contact">${contactParts.join(' · ')}</div>\n`;
  }

  // Summary
  if (resume.summary) {
    html += `<h2>Professional Summary</h2>\n`;
    html += `<p class="summary">${esc(resume.summary)}</p>\n`;
  }

  // Skills
  if (resume.skills.technical.length || resume.skills.tools.length) {
    html += `<h2>Skills</h2>\n`;
    if (resume.skills.technical.length) {
      html += `<p class="skills-list"><strong>Technical:</strong> ${resume.skills.technical.map(esc).join(', ')}</p>\n`;
    }
    if (resume.skills.tools.length) {
      html += `<p class="skills-list"><strong>Tools:</strong> ${resume.skills.tools.map(esc).join(', ')}</p>\n`;
    }
    if (resume.skills.soft?.length) {
      html += `<p class="skills-list"><strong>Soft Skills:</strong> ${resume.skills.soft.map(esc).join(', ')}</p>\n`;
    }
  }

  // Experience
  if (resume.experience.length) {
    html += `<h2>Work Experience</h2>\n`;
    for (const exp of resume.experience) {
      html += `<div class="exp-header">
  <span class="exp-title">${esc(exp.title)}</span>
  <span class="exp-date">${esc(exp.startDate)} – ${exp.current ? 'Present' : esc(exp.endDate)}</span>
</div>\n`;
      html += `<div class="exp-company">${esc(exp.company)}${exp.location ? ' · ' + esc(exp.location) : ''}</div>\n`;
      if (exp.bullets.length) {
        html += `<ul>\n${exp.bullets.map((b) => `  <li>${esc(b)}</li>`).join('\n')}\n</ul>\n`;
      }
    }
  }

  // Projects
  if (resume.projects.length) {
    html += `<h2>Projects</h2>\n`;
    for (const proj of resume.projects) {
      html += `<div class="proj-name">${esc(proj.name)}</div>\n`;
      if (proj.techStack?.length) {
        html += `<div class="proj-tech">${proj.techStack.map(esc).join(', ')}</div>\n`;
      }
      if (proj.bullets.length) {
        html += `<ul>\n${proj.bullets.map((b) => `  <li>${esc(b)}</li>`).join('\n')}\n</ul>\n`;
      }
    }
  }

  // Education
  if (resume.education.length) {
    html += `<h2>Education</h2>\n`;
    for (const edu of resume.education) {
      html += `<div class="edu-entry">\n`;
      html += `  <div class="institution">${esc(edu.institution)}</div>\n`;
      html += `  <div class="degree">${esc(edu.degree)}${edu.field ? ' — ' + esc(edu.field) : ''}</div>\n`;
      if (edu.score) html += `  <div class="score">${esc(edu.score)}</div>\n`;
      html += `</div>\n`;
    }
  }

  // Certifications
  if (resume.certifications?.length) {
    html += `<h2>Certifications</h2>\n`;
    for (const cert of resume.certifications) {
      html += `<div class="cert-entry">${esc(cert.name)}${cert.issuer ? ' — ' + esc(cert.issuer) : ''}${cert.date ? ' (' + esc(cert.date) + ')' : ''}</div>\n`;
    }
  }

  html += `</body>\n</html>`;
  return html;
}
