'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import {
  getProgram,
  getGameConfigPDA,
  getPrizePoolPDA,
  generateGameCode,
  solToLamports,
} from '@/lib/anchor';

export default function CreateGame() {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();

  const [stakeAmount, setStakeAmount] = useState<string>('0.1');
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateGame = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    const stake = parseFloat(stakeAmount);
    if (isNaN(stake) || stake <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    if (maxPlayers < 2 || maxPlayers > 10) {
      setError('Max players must be between 2 and 10');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = getProgram(connection, wallet);
      const gameCode = generateGameCode();

      const gameConfigPDA = getGameConfigPDA(gameCode);
      const prizePoolPDA = getPrizePoolPDA(gameCode);

      // Call initialize_game instruction
      const tx = await program.methods
        .initializeGame(
          gameCode,
          new BN(solToLamports(stake)),
          maxPlayers
        )
        .accounts({
          gameConfig: gameConfigPDA,
          prizePool: prizePoolPDA,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Game created! Transaction:', tx);
      console.log('Game code:', gameCode);

      // Redirect to game lobby
      router.push(`/game/${gameCode}`);
    } catch (err: any) {
      console.error('Error creating game:', err);
      setError(err.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-yellow-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        <div className="card space-y-8 animate-bounce-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
              Create Game
            </h1>
            <p className="text-gray-600 text-lg">Set your stake and start a new game</p>
          </div>

          {/* Stake Amount */}
          <div className="space-y-3">
            <label className="block text-base font-bold text-gray-800">
              Stake Amount (SOL)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.1"
                className="w-full text-2xl font-bold text-center"
              />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Each player stakes this amount to join
            </p>
          </div>

          {/* Max Players */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-base font-bold text-gray-800">
                Max Players
              </label>
              <span className="text-3xl font-black bg-gradient-to-r from-pink-500 to-teal-500 bg-clip-text text-transparent">
                {maxPlayers}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-pink-200 to-teal-200 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ff6b9d ${((maxPlayers - 2) / 8) * 100}%, #e5e7eb ${((maxPlayers - 2) / 8) * 100}%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>2 players</span>
              <span>10 players</span>
            </div>
          </div>

          {/* Prize Pool Preview - CENTERED */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 p-8 text-center border-2 border-pink-200 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-pink-200/20 animate-pulse" />
            <div className="relative z-10">
              <div className="text-base font-semibold text-gray-700 mb-3">
                💰 Total Prize Pool
              </div>
              <div className="text-6xl font-black bg-gradient-to-r from-yellow-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {(parseFloat(stakeAmount || '0') * maxPlayers).toFixed(2)}
              </div>
              <div className="text-2xl font-bold text-gray-700">SOL</div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4 text-red-700 font-semibold text-center animate-wiggle">
              {error}
            </div>
          )}

          {/* Connect Wallet or Create Button */}
          {!wallet.connected ? (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-4 text-yellow-900 font-semibold text-center">
              Please connect your wallet to create a game
            </div>
          ) : (
            <button
              onClick={handleCreateGame}
              disabled={loading}
              className="btn btn-primary w-full text-xl py-4 shadow-lg hover:shadow-2xl transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="spinner" />
                  Creating your game...
                </span>
              ) : (
                '🎮 Create Game'
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
