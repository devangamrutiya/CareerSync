import { Card } from '@/components/ui/card';
import { XCircle, Mail, FileText } from 'lucide-react';

const problems = [
  {
    icon: XCircle,
    iconColor: 'text-red-400',
    gradientFrom: 'from-red-500/20',
    gradientTo: 'to-orange-500/20',
    title: "Spreadsheets don't scale",
    description: 'Tracking 50+ applications in Google Sheets leads to missed deadlines and forgotten follow-ups.',
  },
  {
    icon: Mail,
    iconColor: 'text-yellow-400',
    gradientFrom: 'from-yellow-500/20',
    gradientTo: 'to-amber-500/20',
    title: 'Inbox chaos',
    description: 'Interview invitations, rejections, and scheduling emails get buried in cluttered inboxes.',
  },
  {
    icon: FileText,
    iconColor: 'text-blue-400',
    gradientFrom: 'from-blue-500/20',
    gradientTo: 'to-purple-500/20',
    title: "One resume doesn't fit all",
    description: 'Sending the same generic resume to every job kills your ATS match rate.',
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-center mb-4 font-semibold tracking-tight">Why CareerSync?</h2>
        <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Traditional job search methods don&apos;t scale for modern candidates
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem) => (
            <Card key={problem.title} className="bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-3xl hover:bg-white/10 transition">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${problem.gradientFrom} ${problem.gradientTo} flex items-center justify-center mb-6`}>
                <problem.icon className={`w-7 h-7 ${problem.iconColor}`} />
              </div>
              <h3 className="text-xl mb-3 font-semibold">{problem.title}</h3>
              <p className="text-gray-400">{problem.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
