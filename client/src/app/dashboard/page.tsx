'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiJson, getApiBaseUrl, getApiErrorMessage } from '@/lib/api';
import { getAccessToken, getAuthUser, setAccessToken, setAuthUser, signOut } from '@/lib/auth';

type Job = {
  id: string;
  companyName: string;
  jobTitle: string;
  status: string;
  appliedDate: string;
};

const jobStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Ghosted'];

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'Offer':
      return 'border-emerald-500/30 bg-emerald-500/15 text-emerald-100';
    case 'Interview':
      return 'border-sky-500/30 bg-sky-500/15 text-sky-100';
    case 'Applied':
      return 'border-violet-500/30 bg-violet-500/15 text-violet-100';
    case 'Rejected':
      return 'border-rose-500/30 bg-rose-500/15 text-rose-100';
    case 'Ghosted':
      return 'border-amber-500/30 bg-amber-500/15 text-amber-100';
    default:
      return 'border-white/20 bg-white/10 text-gray-100';
  }
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [gmailSyncResult, setGmailSyncResult] = useState<string | null>(null);
  const [gmailSyncing, setGmailSyncing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeJobDescription, setResumeJobDescription] = useState('');
  const [resumeOptimizing, setResumeOptimizing] = useState(false);
  const [resumeCooldownUntil, setResumeCooldownUntil] = useState(0);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const [filterCompany, setFilterCompany] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [newCompanyName, setNewCompanyName] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newStatus, setNewStatus] = useState('Applied');
  const [newAppliedDate, setNewAppliedDate] = useState('');

  const filteredJobs = useMemo(() => {
    const companyNeedle = filterCompany.trim().toLowerCase();
    return jobs.filter((j) => {
      if (filterStatus && j.status !== filterStatus) return false;
      if (companyNeedle && !j.companyName.toLowerCase().includes(companyNeedle)) return false;
      return true;
    });
  }, [jobs, filterCompany, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage]);

  useEffect(() => {
    setIsMounted(true);
    const authUser = getAuthUser();
    if (authUser?.email) {
      setMeEmail(authUser.email);
    }
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setSelectedJobIds((prev) => prev.filter((id) => jobs.some((j) => j.id === id)));
  }, [jobs]);

  useEffect(() => {
    if (resumeCooldownUntil <= 0) {
      setCooldownSecondsLeft(0);
      return;
    }

    const tick = () => {
      const diffMs = resumeCooldownUntil - Date.now();
      setCooldownSecondsLeft(diffMs > 0 ? Math.ceil(diffMs / 1000) : 0);
    };

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [resumeCooldownUntil]);

  const pageSelectionState = useMemo(() => {
    if (paginatedJobs.length === 0) return { all: false, partial: false };
    const selectedOnPage = paginatedJobs.filter((j) => selectedJobIds.includes(j.id)).length;
    return {
      all: selectedOnPage === paginatedJobs.length,
      partial: selectedOnPage > 0 && selectedOnPage < paginatedJobs.length,
    };
  }, [paginatedJobs, selectedJobIds]);

  const jobStats = useMemo(() => {
    const stats = {
      total: jobs.length,
      applied: 0,
      interview: 0,
      offer: 0,
      needsAttention: 0,
    };

    for (const job of jobs) {
      if (job.status === 'Applied') stats.applied += 1;
      if (job.status === 'Interview') stats.interview += 1;
      if (job.status === 'Offer') stats.offer += 1;
      if (job.status === 'Ghosted' || job.status === 'Rejected') stats.needsAttention += 1;
    }

    return stats;
  }, [jobs]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      const me = await apiJson<{ id: string; email: string }>('/auth/me');
      setMeEmail(me.email);
      setAuthUser(me);
      const list = await apiJson<Job[]>('/jobs');
      setJobs(list);
      const gmail = await apiJson<{ connected: boolean }>('/gmail/status');
      setGmailConnected(gmail.connected);
    } catch (err) {
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? typeof (err as { status?: unknown }).status === 'number'
            ? (err as { status: number }).status
            : undefined
          : undefined;
      if (status === 401) {
        signOut();
        router.replace('/login');
        return;
      }
      setError(getApiErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token');
    if (tokenFromQuery) {
      setAccessToken(tokenFromQuery);
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    }
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const created = await apiJson<Job>('/jobs', {
        method: 'POST',
        body: {
          companyName: newCompanyName,
          jobTitle: newJobTitle,
          status: newStatus,
          appliedDate: newAppliedDate || undefined,
        },
      });
      setJobs((prev) => [created, ...prev]);
      setNewCompanyName('');
      setNewJobTitle('');
      setNewStatus('Applied');
      setNewAppliedDate('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create job'));
    }
  }

  async function updateJob(id: string, patch: Partial<Pick<Job, 'companyName' | 'jobTitle' | 'status' | 'appliedDate'>>) {
    setError(null);
    try {
      const updated = await apiJson<Job>(`/jobs/${id}`, {
        method: 'PATCH',
        body: patch,
      });
      setJobs((prev) => prev.map((j) => (j.id === id ? updated : j)));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update job'));
    }
  }

  async function deleteJob(id: string) {
    setError(null);
    try {
      await apiJson<{ ok: true }>(`/jobs/${id}`, { method: 'DELETE' });
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setSelectedJobIds((prev) => prev.filter((jobId) => jobId !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete job'));
    }
  }

  async function bulkDeleteSelected() {
    if (selectedJobIds.length === 0) return;

    setError(null);
    setIsBulkDeleting(true);
    try {
      const ids = [...selectedJobIds];
      const settled = await Promise.allSettled(
        ids.map((id) => apiJson<{ ok: true }>(`/jobs/${id}`, { method: 'DELETE' })),
      );

      const failed = settled.filter((r) => r.status === 'rejected').length;
      const deletedIds = ids.filter((_id, idx) => settled[idx]?.status === 'fulfilled');

      if (deletedIds.length > 0) {
        setJobs((prev) => prev.filter((j) => !deletedIds.includes(j.id)));
      }

      setSelectedJobIds((prev) => prev.filter((id) => !deletedIds.includes(id)));

      if (failed > 0) {
        setError(`${failed} selected job(s) could not be deleted. Please retry.`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Bulk delete failed'));
    } finally {
      setIsBulkDeleting(false);
    }
  }

  function toggleJobSelection(id: string) {
    setSelectedJobIds((prev) => (prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]));
  }

  function toggleSelectAllOnPage() {
    const idsOnPage = paginatedJobs.map((j) => j.id);
    if (idsOnPage.length === 0) return;

    setSelectedJobIds((prev) => {
      const hasUnselected = idsOnPage.some((id) => !prev.includes(id));
      if (hasUnselected) {
        return Array.from(new Set([...prev, ...idsOnPage]));
      }

      return prev.filter((id) => !idsOnPage.includes(id));
    });
  }

  async function syncGmail() {
    setError(null);
    setGmailSyncResult(null);
    setGmailSyncing(true);
    try {
      const res = await apiJson<{
        scanned: number;
        upserted: number;
        skipped: number;
        fallbackSaved: number;
        processedPages: number;
        hasMore: boolean;
      }>('/gmail/sync', {
        method: 'POST',
        body: { maxMessages: 1500, query: '' },
      });
      setGmailSyncResult(
        `Scanned ${res.scanned} emails across ${res.processedPages} page(s), upserted ${res.upserted}, fallback-saved ${res.fallbackSaved}, skipped ${res.skipped}${res.hasMore ? '. More emails remain; run sync again to continue backfill.' : '.'}`,
      );
      await refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Gmail sync failed'));
    } finally {
      setGmailSyncing(false);
    }
  }

  async function optimizeResume(e: React.FormEvent) {
    e.preventDefault();
    if (resumeOptimizing) return;
    if (cooldownSecondsLeft > 0) {
      setResumeError('Please wait a few seconds before optimizing again.');
      return;
    }
    setResumeError(null);

    const token = getAccessToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    if (!resumeFile) {
      setResumeError('Please choose a PDF or DOCX resume file.');
      return;
    }
    if (!resumeJobDescription.trim()) {
      setResumeError('Please enter the job description to tailor your resume.');
      return;
    }

    setResumeOptimizing(true);
    try {
      const form = new FormData();
      form.append('file', resumeFile);
      form.append('jobDescription', resumeJobDescription);

      const res = await fetch(`${getApiBaseUrl()}/resumes/optimize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        let message = `Resume optimization failed (${res.status}).`;
        if (text) {
          try {
            const parsed = JSON.parse(text) as { message?: string | string[] };
            if (Array.isArray(parsed.message)) {
              message = parsed.message.join(', ');
            } else if (typeof parsed.message === 'string' && parsed.message.trim()) {
              message = parsed.message;
            } else {
              message = text;
            }
          } catch {
            message = text;
          }
        }
        setResumeError(message);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'optimized_resume.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setResumeError(getApiErrorMessage(err, 'Resume optimization failed'));
    } finally {
      setResumeCooldownUntil(Date.now() + 8000);
      setResumeOptimizing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-300">{!isMounted ? '—' : meEmail ? `Signed in as ${meEmail}` : '—'}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => refresh()}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                signOut();
                router.replace('/login');
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {gmailSyncResult ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {gmailSyncResult}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-gray-400">Total</div>
            <div className="mt-1 text-2xl font-semibold text-white">{jobStats.total}</div>
          </div>
          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-violet-200">Applied</div>
            <div className="mt-1 text-2xl font-semibold text-violet-50">{jobStats.applied}</div>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-sky-200">Interview</div>
            <div className="mt-1 text-2xl font-semibold text-sky-50">{jobStats.interview}</div>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-emerald-200">Offer</div>
            <div className="mt-1 text-2xl font-semibold text-emerald-50">{jobStats.offer}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="text-xs uppercase tracking-wide text-amber-200">Needs attention</div>
            <div className="mt-1 text-2xl font-semibold text-amber-50">{jobStats.needsAttention}</div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add job</h2>
              <div className="text-xs text-gray-300">
                Gmail: {gmailConnected === null ? '—' : gmailConnected ? 'Connected' : 'Not connected'}
              </div>
            </div>
            <form className="mt-4 space-y-4" onSubmit={createJob}>
              <div>
                <label className="mb-1 block text-sm text-gray-200">Company</label>
                <input
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Google"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-200">Role</label>
                <input
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-200">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {jobStatuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-200">Applied date</label>
                  <input
                    type="date"
                    value={newAppliedDate}
                    onChange={(e) => setNewAppliedDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <button className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition">
                Add
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => {
                  window.location.href = `${getApiBaseUrl()}/auth/google?mode=gmail`;
                }}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                {gmailConnected ? 'Reconnect Gmail' : 'Connect Gmail'}
              </button>
              <button
                onClick={() => void syncGmail()}
                disabled={!gmailConnected || gmailSyncing}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {gmailSyncing ? 'Syncing Gmail…' : 'Sync Gmail (manual)'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Jobs</h2>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Filter by company…"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All statuses</option>
                  {jobStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    setFilterCompany('');
                    setFilterStatus('');
                    setCurrentPage(1);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition"
                >
                  Clear filters
                </button>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              Showing {filteredJobs.length} of {jobs.length} job{jobs.length === 1 ? '' : 's'}.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-400">Selected: {selectedJobIds.length}</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJobIds([])}
                  disabled={selectedJobIds.length === 0 || isBulkDeleting}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={() => void bulkDeleteSelected()}
                  disabled={selectedJobIds.length === 0 || isBulkDeleting}
                  className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBulkDeleting ? 'Deleting…' : 'Delete selected'}
                </button>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-300">
                  <tr className="[&>th]:pb-3 [&>th]:font-medium">
                    <th className="w-10">
                      <input
                        type="checkbox"
                        checked={pageSelectionState.all}
                        ref={(el) => {
                          if (el) el.indeterminate = pageSelectionState.partial;
                        }}
                        onChange={() => toggleSelectAllOnPage()}
                        className="h-4 w-4 rounded border-white/20 bg-black/20"
                        aria-label="Select all jobs on current page"
                      />
                    </th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-gray-300">
                        Loading…
                      </td>
                    </tr>
                  ) : filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-gray-300">
                        No jobs yet.
                      </td>
                    </tr>
                  ) : (
                    paginatedJobs.map((j) => (
                      <tr key={j.id} className="border-t border-white/10">
                        <td className="py-3 pr-2">
                          <input
                            type="checkbox"
                            checked={selectedJobIds.includes(j.id)}
                            onChange={() => toggleJobSelection(j.id)}
                            className="h-4 w-4 rounded border-white/20 bg-black/20"
                            aria-label={`Select ${j.companyName} ${j.jobTitle}`}
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <input
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={j.companyName}
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v && v !== j.companyName) void updateJob(j.id, { companyName: v });
                            }}
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <input
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
                            defaultValue={j.jobTitle}
                            onBlur={(e) => {
                              const v = e.target.value.trim();
                              if (v && v !== j.jobTitle) void updateJob(j.id, { jobTitle: v });
                            }}
                          />
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            value={j.status}
                            onChange={(e) => void updateJob(j.id, { status: e.target.value })}
                            className={`rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 ${statusBadgeClass(j.status)}`}
                          >
                            {jobStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-3 text-gray-200">
                          {new Date(j.appliedDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => void deleteJob(j.id)}
                            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm hover:bg-white/10 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {filteredJobs.length > 0 ? (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Resume Optimizer</h2>
            <div className="text-xs text-gray-300">
              AI-powered resume optimization by CareerSync
            </div>
          </div>

          <form className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2" onSubmit={optimizeResume}>
            <div className="space-y-3">
              <label className="block text-sm text-gray-200">Resume file (PDF/DOCX)</label>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setResumeFile(file);
                }}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm"
              />
              <div className="text-xs text-gray-400">
                Stored temporarily on server (MVP). Max 10MB.
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-gray-200">Job description</label>
              <textarea
                value={resumeJobDescription}
                onChange={(e) => setResumeJobDescription(e.target.value)}
                rows={7}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste the job description here…"
              />
            </div>

            <div className="lg:col-span-2">
              {resumeError ? (
                <div className="mb-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {resumeError}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={resumeOptimizing || cooldownSecondsLeft > 0}
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {resumeOptimizing ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
                    Optimizing...
                  </span>
                ) : cooldownSecondsLeft > 0 ? (
                  `Please wait ${cooldownSecondsLeft}s...`
                ) : (
                  'Optimize & Download PDF'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading dashboard…</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
