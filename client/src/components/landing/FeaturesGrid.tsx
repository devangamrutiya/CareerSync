import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target, Mail, Sparkles, FileText,
  BarChart3, GitBranch, CheckCircle2,
} from 'lucide-react';

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-center mb-4 font-semibold tracking-tight">
          Everything your job search needs — in one place
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Purpose-built features that work together seamlessly
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Application Tracker - Large (2-col) */}
          <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-3xl hover:border-cyan-500/30 transition group">
            <Target className="w-10 h-10 text-cyan-400 mb-6" />
            <h3 className="text-2xl mb-3 font-semibold">Application Tracker</h3>
            <p className="text-gray-400 mb-6">
              Add jobs manually or auto-detect from Gmail. Track company, role, status, applied date. Filter by status, search by company.
            </p>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 mb-3">
                <div>Company</div>
                <div>Role</div>
                <div>Status</div>
                <div>Date</div>
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-2 text-xs py-2 border-t border-white/5">
                  <div className="text-white">Company {i}</div>
                  <div className="text-gray-400">Role</div>
                  <div><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Active</span></div>
                  <div className="text-gray-400">Apr {20 + i}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Gmail Sync */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-3xl hover:border-blue-500/30 transition">
            <Mail className="w-10 h-10 text-blue-400 mb-6" />
            <h3 className="text-2xl mb-3 font-semibold">Gmail Sync</h3>
            <p className="text-gray-400 mb-6">
              Connect your Gmail account. CareerSync scans your inbox and auto-detects application confirmations, interview invitations, and more.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              Connected &amp; syncing
            </div>
          </Card>

          {/* Smart Status Detection */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-3xl hover:border-purple-500/30 transition">
            <Sparkles className="w-10 h-10 text-purple-400 mb-6" />
            <h3 className="text-2xl mb-3 font-semibold">Smart Status Detection</h3>
            <p className="text-gray-400 mb-6">
              AI reads your emails and detects specific stages — Applied, Shortlisted, Interview Scheduled, and more.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Applied', 'Shortlisted', 'Interview', 'Offer'].map((status) => (
                <Badge key={status} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {status}
                </Badge>
              ))}
            </div>
          </Card>

          {/* AI Resume Optimizer - Large (2-col) */}
          <Card className="lg:col-span-2 bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-3xl hover:border-cyan-500/30 transition">
            <FileText className="w-10 h-10 text-cyan-400 mb-6" />
            <h3 className="text-2xl mb-3 font-semibold">AI Resume Optimizer</h3>
            <p className="text-gray-400 mb-6">
              Upload your resume PDF. Paste the job description. CareerSync&apos;s AI analyzes gaps, rewrites bullet points, and generates a tailored ATS-optimized PDF.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="text-xs text-gray-400 mb-2">Before</div>
                <div className="space-y-1">
                  <div className="h-2 bg-white/10 rounded w-full" />
                  <div className="h-2 bg-white/10 rounded w-5/6" />
                  <div className="h-2 bg-white/10 rounded w-4/6" />
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-cyan-500/30">
                <div className="text-xs text-cyan-400 mb-2">After</div>
                <div className="space-y-1">
                  <div className="h-2 bg-cyan-500/30 rounded w-full" />
                  <div className="h-2 bg-cyan-500/30 rounded w-full" />
                  <div className="h-2 bg-cyan-500/30 rounded w-5/6" />
                </div>
              </div>
            </div>
          </Card>

          {/* Match Score */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-3xl hover:border-green-500/30 transition">
            <BarChart3 className="w-10 h-10 text-green-400 mb-6" />
            <h3 className="text-2xl mb-3 font-semibold">Match Score &amp; Gap Analysis</h3>
            <p className="text-gray-400 mb-6">
              See your ATS compatibility score (0-100), matched keywords, missing keywords, and improvement suggestions.
            </p>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/10" />
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset="63" className="text-green-400" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-semibold">85</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Accept/Reject Changes */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-3xl hover:border-blue-500/30 transition">
            <GitBranch className="w-10 h-10 text-blue-400 mb-6" />
            <h3 className="text-2xl mb-3 font-semibold">Accept / Reject Changes</h3>
            <p className="text-gray-400 mb-6">
              Review every AI suggestion individually. See original vs. suggested bullet points with reasons. Accept what you like.
            </p>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-gray-400">Suggestion {i}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
