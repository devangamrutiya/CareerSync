'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold group-hover:scale-105 transition-transform">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all">
                Career
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all">
                Sync
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition">How It Works</a>
            <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#trust" className="text-sm text-gray-300 hover:text-white transition">Trust</a>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full px-6" asChild>
              <Link href="/register">Start Free</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-300 hover:text-white transition">How It Works</a>
            <a href="#pricing" className="text-sm text-gray-300 hover:text-white transition">Pricing</a>
            <a href="#trust" className="text-sm text-gray-300 hover:text-white transition">Trust</a>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 w-full" asChild>
              <Link href="/register">Start Free</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
