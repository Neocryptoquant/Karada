'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b-2 border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image
              src="/karada.png"
              alt="Karada"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-black bg-gradient-to-r from-pink-500 via-teal-500 to-yellow-400 bg-clip-text text-transparent">
              KARADA
            </span>
          </Link>

          {/* Navigation + Wallet */}
          <div className="flex items-center space-x-4">
            <Link
              href="/create"
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-pink-500 transition-colors"
            >
              Create Game
            </Link>
            <Link
              href="/join"
              className="hidden sm:block text-sm font-medium text-gray-700 hover:text-teal-500 transition-colors"
            >
              Join Game
            </Link>

            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
}
