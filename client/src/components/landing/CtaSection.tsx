import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function CtaSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-500/20 border-white/20 backdrop-blur-xl p-12 md:p-16 rounded-3xl text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl mb-6 font-semibold tracking-tight">
              Build a job search workflow you can actually trust
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Create your account, connect the tools you need, and keep every opportunity visible from one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-gray-100 rounded-2xl px-10 h-14" asChild>
                <Link href="/register">Start free</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 hover:bg-white/10 rounded-2xl px-10 h-14" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
