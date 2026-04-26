import { Card } from '@/components/ui/card';
import { Shield, Lock, Database } from 'lucide-react';

const trustItems = [
  {
    icon: Shield,
    iconColor: 'text-cyan-400',
    hoverBorder: 'hover:border-cyan-500/30',
    title: 'Per-user data isolation',
    description: 'Your data is isolated behind JWT-authenticated API routes. No cross-user access, ever.',
  },
  {
    icon: Lock,
    iconColor: 'text-blue-400',
    hoverBorder: 'hover:border-blue-500/30',
    title: 'Opt-in Gmail integration',
    description: 'Gmail integration is completely optional and only activated when you explicitly connect your account.',
  },
  {
    icon: Database,
    iconColor: 'text-purple-400',
    hoverBorder: 'hover:border-purple-500/30',
    title: 'Unified workflow',
    description: 'Resume optimization happens inside your workflow, not scattered across third-party tools.',
  },
];

export function TrustSection() {
  return (
    <section id="trust" className="py-20 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-center mb-4 font-semibold tracking-tight">
          Built with transparency — no hidden behavior
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Your data security and privacy are our top priorities
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {trustItems.map((item) => (
            <Card key={item.title} className={`bg-white/5 border-white/10 backdrop-blur-sm p-8 rounded-3xl ${item.hoverBorder} transition`}>
              <item.icon className={`w-12 h-12 ${item.iconColor} mb-6`} />
              <h3 className="text-xl mb-3 font-semibold">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
