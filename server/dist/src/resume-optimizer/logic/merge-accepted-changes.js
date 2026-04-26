"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAcceptedChanges = mergeAcceptedChanges;
function mergeAcceptedChanges(original, suggestions, accepted) {
    const result = structuredClone(original);
    if (accepted.summary && suggestions.summarySuggestion) {
        result.summary = suggestions.summarySuggestion.suggested;
    }
    if (accepted.skills && suggestions.skillsSuggestion) {
        result.skills = suggestions.skillsSuggestion.suggested;
    }
    for (const expAcceptance of accepted.experience ?? []) {
        if (!expAcceptance.accepted)
            continue;
        const suggestion = suggestions.experienceSuggestions.find((s) => s.experienceId === expAcceptance.experienceId);
        const exp = result.experience.find((e) => e.id === expAcceptance.experienceId);
        if (suggestion && exp) {
            exp.bullets = suggestion.suggestedBullets;
        }
    }
    for (const projectAcceptance of accepted.projects ?? []) {
        if (!projectAcceptance.accepted)
            continue;
        const suggestion = suggestions.projectSuggestions.find((s) => s.projectId === projectAcceptance.projectId);
        const proj = result.projects.find((p) => p.id === projectAcceptance.projectId);
        if (suggestion && proj) {
            proj.bullets = suggestion.suggestedBullets;
        }
    }
    return result;
}
//# sourceMappingURL=merge-accepted-changes.js.map