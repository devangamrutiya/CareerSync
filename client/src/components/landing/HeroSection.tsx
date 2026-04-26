import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Inbox, FileText, Target, ChevronRight } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.22),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_32%)] opacity-50" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy + CTAs */}
          <div>
            <Badge className="mb-6 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400 rounded-full px-4 py-1">
              AI-Powered Job Search OS
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent font-semibold tracking-tight">
              Track every application. Tailor every resume. Never miss an opportunity.
            </h1>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              CareerSync turns scattered applications, Gmail updates, and resumes into one clean workflow — powered by AI that understands what recruiters want.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl px-8 h-14" asChild>
                <Link href="/register">
                  Create your workspace
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5 rounded-2xl px-8 h-14" asChild>
                <a href="#how-it-works">See how it works</a>
              </Button>
            </div>

            {/* Mini stat cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <Inbox className="w-6 h-6 text-cyan-400 mb-2" />
                <div className="text-sm font-medium mb-1">Inbox-aware</div>
                <div className="text-xs text-gray-400">Connect Gmail for automatic job update detection</div>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <FileText className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-sm font-medium mb-1">Role-specific resumes</div>
                <div className="text-xs text-gray-400">AI-tailored resumes for each job description</div>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-4 rounded-2xl">
                <Target className="w-6 h-6 text-purple-400 mb-2" />
                <div className="text-sm font-medium mb-1">Single dashboard</div>
                <div className="text-xs text-gray-400">Track every company, status, and date in one view</div>
              </Card>
            </div>
          </div>

          {/* Right: Product mockup */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 blur-3xl rounded-full" />
            <Card className="relative bg-white/5 border-white/10 backdrop-blur-xl p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Application Dashboard</h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                  Gmail Synced
                </Badge>
              </div>
              <div className="space-y-3">
                {[
                  { company: 'TechCorp', role: 'Senior Engineer', status: 'Interview', statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                  { company: 'StartupXYZ', role: 'Full Stack Dev', status: 'Shortlisted', statusColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
                  { company: 'BigCo Inc', role: 'Frontend Lead', status: 'Applied', statusColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
                ].map((job, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium mb-1">{job.company}</div>
                        <div className="text-sm text-gray-400">{job.role}</div>
                      </div>
                      <Badge className={job.statusColor}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
