import type { JobDescriptionJson, ResumeJson } from '../types/resume.types';

function jdKeywordTokens(jd: JobDescriptionJson): string[] {
  const parts = [
    ...(jd.mustHaveSkills ?? []),
    ...(jd.keywords ?? []),
    ...(jd.niceToHaveSkills ?? []),
    ...(jd.tools ?? []),
  ];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const t = String(p).toLowerCase().trim();
    if (t.length && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
}

/** Higher = better match; -1 = no match */
function matchScore(skill: string, tokens: string[]): number {
  const s = skill.toLowerCase();
  let best = -1;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t) continue;
    if (s.includes(t) || t.includes(s)) {
      const score = tokens.length - i;
      if (score > best) best = score;
    }
  }
  return best;
}

function partitionStable(skillList: string[], tokens: string[]): string[] {
  if (!skillList.length || !tokens.length) return [...skillList];

  const decorated = skillList.map((skill, originalIndex) => ({
    skill,
    originalIndex,
    score: matchScore(skill, tokens),
  }));

  const matched = decorated
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex);

  const unmatched = decorated
    .filter((x) => x.score < 0)
    .sort((a, b) => a.originalIndex - b.originalIndex);

  return [...matched, ...unmatched].map((x) => x.skill);
}

/**
 * Reorder technical / tools / soft so JD-relevant tokens appear first.
 * Does not add or remove skills.
 */
export function prioritizeSkillsByJobKeywords(
  resume: ResumeJson,
  jd: JobDescriptionJson | null | undefined,
): ResumeJson {
  if (!jd) return resume;

  const tokens = jdKeywordTokens(jd);
  if (!tokens.length) return resume;

  return {
    ...resume,
    skills: {
      technical: partitionStable(resume.skills.technical, tokens),
      tools: partitionStable(resume.skills.tools, tokens),
      soft: resume.skills.soft?.length
        ? partitionStable(resume.skills.soft, tokens)
        : undefined,
    },
  };
}
