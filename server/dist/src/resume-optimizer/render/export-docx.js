"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDocx = exportDocx;
const docx_1 = require("docx");
async function exportDocx(resume) {
    const children = [];
    children.push(new docx_1.Paragraph({
        children: [new docx_1.TextRun({ text: resume.basics.fullName, bold: true, size: 32 })],
        heading: docx_1.HeadingLevel.HEADING_1,
    }));
    const contactParts = [];
    if (resume.basics.email)
        contactParts.push(resume.basics.email);
    if (resume.basics.phone)
        contactParts.push(resume.basics.phone);
    if (resume.basics.location)
        contactParts.push(resume.basics.location);
    if (resume.basics.linkedin)
        contactParts.push(resume.basics.linkedin);
    if (resume.basics.github)
        contactParts.push(resume.basics.github);
    if (contactParts.length) {
        children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: contactParts.join(' | '), size: 18, color: '555555' })] }));
    }
    children.push(new docx_1.Paragraph({ children: [] }));
    if (resume.summary) {
        children.push(new docx_1.Paragraph({ text: 'Professional Summary', heading: docx_1.HeadingLevel.HEADING_2 }));
        children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: resume.summary })] }));
        children.push(new docx_1.Paragraph({ children: [] }));
    }
    if (resume.skills.technical.length || resume.skills.tools.length) {
        children.push(new docx_1.Paragraph({ text: 'Skills', heading: docx_1.HeadingLevel.HEADING_2 }));
        if (resume.skills.technical.length) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: 'Technical: ', bold: true }),
                    new docx_1.TextRun({ text: resume.skills.technical.join(', ') }),
                ],
            }));
        }
        if (resume.skills.tools.length) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: 'Tools: ', bold: true }),
                    new docx_1.TextRun({ text: resume.skills.tools.join(', ') }),
                ],
            }));
        }
        if (resume.skills.soft?.length) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: 'Soft Skills: ', bold: true }),
                    new docx_1.TextRun({ text: resume.skills.soft.join(', ') }),
                ],
            }));
        }
        children.push(new docx_1.Paragraph({ children: [] }));
    }
    if (resume.experience.length) {
        children.push(new docx_1.Paragraph({ text: 'Work Experience', heading: docx_1.HeadingLevel.HEADING_2 }));
        for (const exp of resume.experience) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: `${exp.title} — ${exp.company}`, bold: true }),
                    new docx_1.TextRun({ text: `  |  ${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`, color: '555555' }),
                ],
            }));
            if (exp.location) {
                children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: exp.location, italics: true, color: '777777' })] }));
            }
            for (const bullet of exp.bullets) {
                children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: bullet })], bullet: { level: 0 } }));
            }
            children.push(new docx_1.Paragraph({ children: [] }));
        }
    }
    if (resume.projects.length) {
        children.push(new docx_1.Paragraph({ text: 'Projects', heading: docx_1.HeadingLevel.HEADING_2 }));
        for (const proj of resume.projects) {
            const titleParts = [new docx_1.TextRun({ text: proj.name, bold: true })];
            if (proj.techStack?.length) {
                titleParts.push(new docx_1.TextRun({ text: `  (${proj.techStack.join(', ')})`, color: '555555' }));
            }
            children.push(new docx_1.Paragraph({ children: titleParts }));
            for (const bullet of proj.bullets) {
                children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: bullet })], bullet: { level: 0 } }));
            }
            children.push(new docx_1.Paragraph({ children: [] }));
        }
    }
    if (resume.education.length) {
        children.push(new docx_1.Paragraph({ text: 'Education', heading: docx_1.HeadingLevel.HEADING_2 }));
        for (const edu of resume.education) {
            children.push(new docx_1.Paragraph({
                children: [
                    new docx_1.TextRun({ text: edu.institution, bold: true }),
                    new docx_1.TextRun({ text: ` — ${edu.degree}${edu.field ? ', ' + edu.field : ''}` }),
                ],
            }));
            if (edu.score) {
                children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text: edu.score, color: '555555' })] }));
            }
        }
        children.push(new docx_1.Paragraph({ children: [] }));
    }
    if (resume.certifications?.length) {
        children.push(new docx_1.Paragraph({ text: 'Certifications', heading: docx_1.HeadingLevel.HEADING_2 }));
        for (const cert of resume.certifications) {
            const text = `${cert.name}${cert.issuer ? ' — ' + cert.issuer : ''}${cert.date ? ' (' + cert.date + ')' : ''}`;
            children.push(new docx_1.Paragraph({ children: [new docx_1.TextRun({ text })] }));
        }
    }
    const doc = new docx_1.Document({ sections: [{ children }] });
    return await docx_1.Packer.toBuffer(doc);
}
//# sourceMappingURL=export-docx.js.map