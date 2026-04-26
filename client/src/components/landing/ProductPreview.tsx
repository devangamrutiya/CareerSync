'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export function ProductPreview() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400 rounded-full px-4 py-1">
            See CareerSync in action
          </Badge>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Experience the full workflow</h2>
        </div>

        <Card className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.15)]">
          <Tabs defaultValue="dashboard" className="w-full">
            <div className="border-b border-white/10 px-6">
              <TabsList className="bg-transparent h-auto p-0 gap-1">
                <TabsTrigger value="dashboard" className="rounded-t-xl data-[state=active]:bg-white/10 data-[state=active]:border-t data-[state=active]:border-x border-white/10 px-6 py-4">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="optimizer" className="rounded-t-xl data-[state=active]:bg-white/10 data-[state=active]:border-t data-[state=active]:border-x border-white/10 px-6 py-4">
                  Resume Optimizer
                </TabsTrigger>
                <TabsTrigger value="review" className="rounded-t-xl data-[state=active]:bg-white/10 data-[state=active]:border-t data-[state=active]:border-x border-white/10 px-6 py-4">
                  Review &amp; Accept
                </TabsTrigger>
                <TabsTrigger value="export" className="rounded-t-xl data-[state=active]:bg-white/10 data-[state=active]:border-t data-[state=active]:border-x border-white/10 px-6 py-4">
                  Export
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="p-8 m-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">Your Applications</h3>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">12 Active</Badge>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">5 Interview</Badge>
                  </div>
                </div>
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="grid grid-cols-5 gap-4 text-sm text-gray-400 mb-4">
                    <div>Company</div>
                    <div>Role</div>
                    <div>Status</div>
                    <div>Applied</div>
                    <div>Last Update</div>
                  </div>
                  {[
                    { company: 'TechCorp', role: 'Senior Engineer', status: 'Interview', date: 'Apr 20', update: '2 days ago' },
                    { company: 'StartupXYZ', role: 'Full Stack Developer', status: 'Shortlisted', date: 'Apr 18', update: '4 days ago' },
                    { company: 'BigCo Inc', role: 'Frontend Lead', status: 'Applied', date: 'Apr 15', update: '1 week ago' },
                  ].map((job, i) => (
                    <div key={i} className="grid grid-cols-5 gap-4 text-sm py-3 border-t border-white/10">
                      <div>{job.company}</div>
                      <div className="text-gray-400">{job.role}</div>
                      <div><Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{job.status}</Badge></div>
                      <div className="text-gray-400">{job.date}</div>
                      <div className="text-gray-400">{job.update}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Optimizer Tab */}
            <TabsContent value="optimizer" className="p-8 m-0">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl mb-4 font-semibold">Upload Resume</h3>
                  <div className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Drop your resume PDF here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-xl mb-4 font-semibold">Job Description</h3>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="w-full bg-transparent text-sm text-gray-400 h-32 flex items-start">
                        Paste the job description here...
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl mb-4 font-semibold">Gap Analysis</h3>
                  <Card className="bg-white/5 border-white/10 p-6 rounded-2xl mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-400">ATS Match Score</span>
                      <span className="text-3xl text-green-400 font-semibold">85%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-400 to-cyan-400 w-[85%]" />
                    </div>
                  </Card>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Matched Keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {['React', 'TypeScript', 'Node.js'].map((kw) => (
                          <Badge key={kw} className="bg-green-500/20 text-green-400 border-green-500/30">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Missing Keywords</div>
                      <div className="flex flex-wrap gap-2">
                        {['GraphQL', 'AWS', 'Docker'].map((kw) => (
                          <Badge key={kw} className="bg-red-500/20 text-red-400 border-red-500/30">{kw}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="p-8 m-0">
              <h3 className="text-2xl mb-6 font-semibold">Review AI Suggestions</h3>
              <div className="space-y-4">
                {[
                  { original: 'Worked on frontend projects using React', suggested: 'Architected and delivered 5+ production React applications serving 100K+ users, improving core web vitals by 40%' },
                  { original: 'Used TypeScript for development', suggested: 'Led TypeScript migration across 20+ microservices, reducing runtime errors by 60% and improving developer velocity' },
                ].map((item, i) => (
                  <Card key={i} className="bg-white/5 border-white/10 p-6 rounded-2xl">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-400 mb-2">Original</div>
                        <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-300">{item.original}</div>
                      </div>
                      <div>
                        <div className="text-sm text-cyan-400 mb-2">AI Suggestion</div>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-sm">{item.suggested}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="sm" className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/5">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="p-8 m-0">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl mb-4 font-semibold">Your Optimized Resume</h3>
                  <div className="bg-white rounded-2xl p-8 text-slate-900 shadow-2xl">
                    <div className="mb-4">
                      <h4 className="text-2xl mb-1 font-semibold text-slate-900">John Doe</h4>
                      <p className="text-sm text-gray-600">Senior Software Engineer</p>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="h-2 bg-slate-200 rounded w-full" />
                      <div className="h-2 bg-slate-200 rounded w-5/6" />
                      <div className="h-2 bg-slate-200 rounded w-4/6" />
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="h-2 bg-slate-200 rounded w-full mb-2" />
                        <div className="h-2 bg-slate-200 rounded w-full mb-2" />
                        <div className="h-2 bg-slate-200 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="text-2xl mb-4 font-semibold">Ready to export</h3>
                  <p className="text-gray-400 mb-6">Your resume has been optimized and is ready to download as a PDF.</p>
                  <div className="space-y-3">
                    <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl">
                      Download PDF
                    </Button>
                    <Button size="lg" variant="outline" className="w-full border-white/20 hover:bg-white/5 rounded-2xl">
                      Copy to Clipboard
                    </Button>
                  </div>
                  <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <div className="text-cyan-400 mb-1 font-medium">ATS Optimized</div>
                        <div className="text-gray-400">This resume is formatted to pass Applicant Tracking Systems</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  );
}
