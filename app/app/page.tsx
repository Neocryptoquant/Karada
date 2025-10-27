'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Dynamic animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Multiple floating orbs with different animations */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-pink-300/40 to-purple-300/40 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-teal-300/40 to-blue-300/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-yellow-300/40 to-orange-300/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s', animationDuration: '6s' }} />
        <div className="absolute bottom-40 right-10 w-64 h-64 bg-gradient-to-br from-pink-200/35 to-red-200/35 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <div className="space-y-8 animate-bounce-in">
          {/* Logo with pulse effect */}
          <div className="flex justify-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 animate-pulse transition-opacity" />
              <img
                src="/karada.png"
                alt="Karada Logo"
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl shadow-2xl transform transition-transform group-hover:scale-110 group-hover:rotate-3"
              />
            </div>
          </div>

          {/* Animated gradient title */}
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight">
            <span className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              KARADA
            </span>
          </h1>

          <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700 bg-clip-text text-transparent">
            Draw. Guess. Win SOL. 🎨
          </p>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto px-4 leading-relaxed">
            The first Web3 drawing game on Solana.<br />
            Create a room, invite friends, and compete for real rewards.
          </p>
        </div>

        {/* CTA Buttons with enhanced animations */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
          <Link
            href="/create"
            className="group relative btn btn-primary text-lg sm:text-xl px-10 sm:px-14 py-5 sm:py-6 w-full sm:w-auto overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">🎮</span>
              <span>Create Game</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/join"
            className="group relative btn btn-secondary text-lg sm:text-xl px-10 sm:px-14 py-5 sm:py-6 w-full sm:w-auto overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span className="text-2xl">🔗</span>
              <span>Join Game</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 sm:pt-12 max-w-3xl mx-auto px-4">
          {[
            { value: '$5.2K', label: 'Total Won', color: 'pink', gradient: 'from-pink-500 to-rose-500' },
            { value: '127', label: 'Games Played', color: 'teal', gradient: 'from-teal-500 to-cyan-500' },
            { value: '2.3s', label: 'Avg Speed', color: 'yellow', gradient: 'from-yellow-500 to-orange-500' }
          ].map((stat, index) => (
            <div
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border-2 border-white shadow-lg transform transition-transform group-hover:scale-105">
                <div className={`text-3xl sm:text-5xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 font-semibold">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="pt-12 sm:pt-16 px-4">
          <h2 className="text-3xl sm:text-4xl font-black mb-8 sm:mb-12 bg-gradient-to-r from-pink-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[
              { emoji: '🎯', title: 'Create', desc: 'Set your stake & max players', color: 'from-pink-100 to-rose-100', border: 'border-pink-200' },
              { emoji: '👥', title: 'Invite', desc: 'Share code with friends', color: 'from-purple-100 to-violet-100', border: 'border-purple-200' },
              { emoji: '🎨', title: 'Play', desc: 'Draw and guess in real-time', color: 'from-teal-100 to-cyan-100', border: 'border-teal-200' },
              { emoji: '🏆', title: 'Win', desc: 'Claim SOL rewards instantly', color: 'from-yellow-100 to-orange-100', border: 'border-yellow-200' }
            ].map((step, index) => (
              <div
                key={index}
                className="relative group"
                onMouseEnter={() => setHoveredCard(index + 10)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className={`relative bg-gradient-to-br ${step.color} rounded-2xl p-6 sm:p-8 border-2 ${step.border} transform transition-all duration-300 group-hover:scale-105 group-hover:-rotate-1 shadow-lg`}>
                  <div className="text-5xl sm:text-6xl mb-4 transform transition-transform group-hover:scale-125 group-hover:rotate-12">
                    {step.emoji}
                  </div>
                  <h3 className="font-black text-lg sm:text-xl mb-2 text-gray-800">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-12 sm:pt-16 pb-8 text-center px-4">
          <p className="text-sm text-gray-600">
            Powered by{' '}
            <a
              href="https://magicblock.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 transition-all"
            >
              MagicBlock Ephemeral Rollups
            </a>
            {' '}on{' '}
            <span className="font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
              Solana
            </span>
          </p>
        </div>
      </div>
    </main>
  );
}
