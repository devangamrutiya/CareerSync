import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

const features = [
  'Unlimited job tracking',
  'Gmail sync & smart detection',
  'AI resume optimization',
  'PDF export & download',
  'Match score analysis',
  'Accept/reject suggestions',
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-center mb-4 font-semibold tracking-tight">
          Start free. No credit card required.
        </h2>
        <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Everything you need to land your next role, completely free
        </p>

        <Card className="max-w-lg mx-auto bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 backdrop-blur-xl p-10 rounded-3xl shadow-[0_0_80px_rgba(59,130,246,0.2)]">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-500/30 text-cyan-400 rounded-full px-4 py-2">
              Free Forever
            </Badge>
            <div className="text-6xl font-bold">$0</div>
            <p className="text-gray-400 mt-2">No hidden costs, no trials</p>
          </div>

          <div className="space-y-4 mb-8">
            {features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl h-14 mb-4" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>

          <p className="text-center text-sm text-gray-400">
            No credit card • No trial limit • Just start
          </p>
        </Card>
      </div>
    </section>
  );
}
