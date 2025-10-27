'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram } from '@solana/web3.js';
import {
  getProgram,
  getGameConfigPDA,
  getPlayerStatePDA,
  getPrizePoolPDA,
} from '@/lib/anchor';

export default function JoinGame() {
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();

  const [gameCode, setGameCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinGame = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    const code = gameCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Game code must be 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const program = getProgram(connection, wallet);

      const gameConfigPDA = getGameConfigPDA(code);
      const playerStatePDA = getPlayerStatePDA(code, wallet.publicKey);
      const prizePoolPDA = getPrizePoolPDA(code);

      // Check if game exists
      const gameConfig = await program.account.gameConfig.fetch(gameConfigPDA);
      console.log('Game found:', gameConfig);

      // Call join_game instruction
      const tx = await program.methods
        .joinGame()
        .accounts({
          gameConfig: gameConfigPDA,
          playerState: playerStatePDA,
          prizePool: prizePoolPDA,
          player: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Joined game! Transaction:', tx);

      // Redirect to game lobby
      router.push(`/game/${code}`);
    } catch (err: any) {
      console.error('Error joining game:', err);
      if (err.message.includes('Account does not exist')) {
        setError('Game not found. Please check the code.');
      } else {
        setError(err.message || 'Failed to join game');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="card max-w-md w-full space-y-6 animate-bounce-in">
        <div className="text-center">
          <h1 className="text-4xl font-black bg-gradient-to-r from-teal-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Join Game
          </h1>
          <p className="text-gray-600">Enter a game code to join</p>
        </div>

        {/* Game Code Input */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Game Code
          </label>
          <input
            type="text"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="w-full text-center text-2xl font-bold tracking-widest uppercase"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">
            6-character code from game creator
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Connect Wallet or Join Button */}
        {!wallet.connected ? (
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-3 text-yellow-800 text-sm text-center">
            Please connect your wallet to join a game
          </div>
        ) : (
          <button
            onClick={handleJoinGame}
            disabled={loading || gameCode.length !== 6}
            className="btn btn-secondary w-full text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner" />
                Joining...
              </span>
            ) : (
              'Join Game'
            )}
          </button>
        )}

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Create Game Link */}
        <button
          onClick={() => router.push('/create')}
          className="btn btn-accent w-full"
        >
          Create New Game
        </button>
      </div>
    </main>
  );
}
