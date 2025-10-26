'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Floating background shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-pink-300/20 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 right-20 w-40 h-40 bg-teal-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-yellow-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Main content */}
      <div className="relative z-10 text-center space-y-8 animate-bounce-in">
        {/* Logo */}
        <div className="mb-4">
          <h1 className="text-8xl font-black tracking-tight mb-4">
            <span className="bg-gradient-to-r from-pink-500 via-teal-500 to-yellow-400 bg-clip-text text-transparent animate-float">
              KARADA
            </span>
          </h1>
          <p className="text-2xl text-gray-600 font-medium">
            Draw. Guess. Win SOL. 🎨
          </p>
        </div>

        {/* Description */}
        <div className="max-w-2xl mx-auto space-y-4">
          <p className="text-lg text-foreground/80">
            The first Web3 drawing game on Solana with real stakes.
          </p>
          <p className="text-base text-muted">
            Create a game, invite friends, and compete for the prize pool. Powered by Ephemeral Rollups for instant, gasless gameplay.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link
            href="/create"
            className="btn btn-primary text-lg px-10 py-5 w-full sm:w-auto"
          >
            🎮 Create Game
          </Link>

          <Link
            href="/join"
            className="btn btn-secondary text-lg px-10 py-5 w-full sm:w-auto"
          >
            🔗 Join Game
          </Link>
        </div>

        {/* Stats (placeholder) */}
        <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-500 mb-2">$5.2K</div>
            <div className="text-sm text-gray-600">Total Won</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-teal-500 mb-2">127</div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-500 mb-2">2.3s</div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </div>
        </div>

        {/* How it works */}
        <div className="pt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="card card-hover text-center">
              <div className="text-4xl mb-4">1️⃣</div>
              <h3 className="font-bold mb-2">Create</h3>
              <p className="text-sm text-gray-600">
                Set your stake amount and max players
              </p>
            </div>

            <div className="card card-hover text-center">
              <div className="text-4xl mb-4">2️⃣</div>
              <h3 className="font-bold mb-2">Invite</h3>
              <p className="text-sm text-gray-600">
                Share the game code with friends
              </p>
            </div>

            <div className="card card-hover text-center">
              <div className="text-4xl mb-4">3️⃣</div>
              <h3 className="font-bold mb-2">Play</h3>
              <p className="text-sm text-gray-600">
                Draw and guess in real-time
              </p>
            </div>

            <div className="card card-hover text-center">
              <div className="text-4xl mb-4">4️⃣</div>
              <h3 className="font-bold mb-2">Win</h3>
              <p className="text-sm text-gray-600">
                Claim your SOL rewards instantly
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="pt-16 text-center">
          <p className="text-sm text-gray-600">
            Powered by{' '}
            <a
              href="https://magicblock.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline font-medium"
            >
              MagicBlock Ephemeral Rollups
            </a>
            {' '}on Solana
          </p>
        </div>
      </div>
    </main>
  );
}
