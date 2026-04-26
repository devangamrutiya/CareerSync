import { Card } from '@/components/ui/card';
import { Target, Mail, FileText, CheckCircle2 } from 'lucide-react';

const steps = [
  { num: '01', title: 'Create an account and open your dashboard', icon: Target },
  { num: '02', title: 'Add jobs manually or connect Gmail for inbox-powered updates', icon: Mail },
  { num: '03', title: 'Upload your resume and paste a job description for AI analysis', icon: FileText },
  { num: '04', title: 'Review suggestions, accept changes, and export your tailored PDF', icon: CheckCircle2 },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-slate-900/50 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl mb-4 font-semibold tracking-tight">How It Works</h2>
            <p className="text-gray-400 text-lg">
              Get started in minutes. No complex setup, no steep learning curve.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step) => (
              <Card key={step.num} className="bg-white/5 border-white/10 backdrop-blur-sm p-6 rounded-2xl hover:border-cyan-500/30 transition group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition">
                    <step.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm text-cyan-400 mb-1">Step {step.num}</div>
                    <div className="text-lg font-medium">{step.title}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
