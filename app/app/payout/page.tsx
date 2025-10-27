'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { SystemProgram, PublicKey } from '@solana/web3.js';
import {
  getProgram,
  getGameConfigPDA,
  getPayoutPDA,
  getPrizePoolPDA,
  lamportsToSol,
} from '@/lib/anchor';

interface Payout {
  player: PublicKey;
  amount: number;
  rank: number;
  claimed: boolean;
}

export default function PayoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { connection } = useConnection();
  const wallet = useWallet();

  const gameCode = searchParams.get('code');

  const [payout, setPayout] = useState<Payout | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wallet.publicKey || !gameCode) return;

    const fetchPayout = async () => {
      try {
        const program = getProgram(connection, wallet);
        const payoutPDA = getPayoutPDA(gameCode, wallet.publicKey!);

        const payoutAccount = await program.account.payout.fetch(payoutPDA);

        setPayout({
          player: payoutAccount.player,
          amount: payoutAccount.amount.toNumber(),
          rank: payoutAccount.rank,
          claimed: payoutAccount.claimed,
        });
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching payout:', err);
        setError('No payout found for this game');
        setLoading(false);
      }
    };

    fetchPayout();
  }, [connection, wallet.publicKey, gameCode]);

  const handleClaimPayout = async () => {
    if (!wallet.publicKey || !gameCode || !payout) return;

    setClaiming(true);
    setError(null);

    try {
      const program = getProgram(connection, wallet);
      const gameConfigPDA = getGameConfigPDA(gameCode);
      const payoutPDA = getPayoutPDA(gameCode, wallet.publicKey);
      const prizePoolPDA = getPrizePoolPDA(gameCode);

      const tx = await program.methods
        .claimPayout()
        .accounts({
          gameConfig: gameConfigPDA,
          payout: payoutPDA,
          prizePool: prizePoolPDA,
          player: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Payout claimed! Transaction:', tx);

      // Update state
      setPayout({ ...payout, claimed: true });
    } catch (err: any) {
      console.error('Error claiming payout:', err);
      setError(err.message || 'Failed to claim payout');
    } finally {
      setClaiming(false);
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-gray-200 to-gray-400';
  };

  if (!gameCode) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">No game code provided</p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto w-8 h-8" />
          <p className="text-gray-600">Loading payout...</p>
        </div>
      </main>
    );
  }

  if (error || !payout) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">No Payout</h2>
          <p className="text-gray-600 mb-6">
            {error || 'No payout available for this game'}
          </p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-6">
        {/* Rank Card */}
        <div className="card text-center animate-bounce-in">
          <div className="mb-6">
            <div className="text-8xl mb-4">{getRankEmoji(payout.rank)}</div>
            <h1
              className={`text-4xl font-black bg-gradient-to-r ${getRankColor(
                payout.rank
              )} bg-clip-text text-transparent mb-2`}
            >
              {payout.rank === 1
                ? 'WINNER!'
                : payout.rank === 2
                ? '2nd Place'
                : payout.rank === 3
                ? '3rd Place'
                : `${payout.rank}th Place`}
            </h1>
            <p className="text-gray-600">Game: {gameCode}</p>
          </div>

          {/* Payout Amount */}
          <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl p-8 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Reward</p>
            <p className="text-6xl font-black text-green-600">
              {lamportsToSol(payout.amount).toFixed(3)}
            </p>
            <p className="text-xl text-gray-700 mt-1">SOL</p>
          </div>

          {/* Claim Button */}
          {payout.claimed ? (
            <div className="bg-green-100 border-2 border-green-300 rounded-xl p-4">
              <p className="text-green-700 font-semibold">
                Payout already claimed!
              </p>
            </div>
          ) : (
            <button
              onClick={handleClaimPayout}
              disabled={claiming}
              className="btn btn-primary w-full text-lg"
            >
              {claiming ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" />
                  Claiming...
                </span>
              ) : (
                'Claim Reward'
              )}
            </button>
          )}

          {error && (
            <div className="bg-red-100 border-2 border-red-300 rounded-xl p-3 text-red-700 text-sm mt-4">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/create')}
            className="btn btn-accent flex-1"
          >
            New Game
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn btn-secondary flex-1"
          >
            Home
          </button>
        </div>

        {/* Fun Stats */}
        {payout.rank === 1 && !payout.claimed && (
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Congratulations! You're the winner! 🎉
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
