'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import {
  getProgram,
  getGameConfigPDA,
  getGamePDA,
  getPlayerStatePDA,
  lamportsToSol,
} from '@/lib/anchor';

type GameStatus = 'Lobby' | 'Active' | 'Ended' | 'Cancelled';

interface GameConfig {
  gameCode: string;
  creator: PublicKey;
  stakeAmount: number;
  maxPlayers: number;
  playerCount: number;
  status: GameStatus;
  createdAt: number;
}

interface PlayerState {
  player: PublicKey;
  score: number;
  joinedAt: number;
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const { connection } = useConnection();
  const wallet = useWallet();

  const gameCode = (params.code as string).toUpperCase();

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  // Fetch game data
  useEffect(() => {
    if (!wallet.publicKey) return;

    const fetchGameData = async () => {
      try {
        const program = getProgram(connection, wallet);
        const gameConfigPDA = getGameConfigPDA(gameCode);

        // Fetch game config
        const config = await program.account.gameConfig.fetch(gameConfigPDA);
        setGameConfig({
          gameCode: config.gameCode,
          creator: config.creator,
          stakeAmount: config.stakeAmount.toNumber(),
          maxPlayers: config.maxPlayers,
          playerCount: config.playerCount,
          status: Object.keys(config.status)[0] as GameStatus,
          createdAt: config.createdAt.toNumber(),
        });

        // Fetch all player states
        const playerAccounts = await program.account.playerState.all([
          {
            memcmp: {
              offset: 8, // Skip discriminator
              bytes: gameConfigPDA.toBase58(),
            },
          },
        ]);

        const playerStates = playerAccounts.map((acc) => ({
          player: acc.account.player,
          score: acc.account.score,
          joinedAt: acc.account.joinedAt.toNumber(),
        }));

        setPlayers(playerStates);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    };

    fetchGameData();

    // Poll for updates every 2 seconds
    const interval = setInterval(fetchGameData, 2000);
    return () => clearInterval(interval);
  }, [connection, wallet.publicKey, gameCode]);

  const handleStartGame = async () => {
    if (!wallet.publicKey || !gameConfig) return;

    setStarting(true);
    try {
      const program = getProgram(connection, wallet);
      const gameConfigPDA = getGameConfigPDA(gameCode);
      const gamePDA = getGamePDA(gameCode);

      const tx = await program.methods
        .startGame()
        .accounts({
          gameConfig: gameConfigPDA,
          game: gamePDA,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log('Game started! Transaction:', tx);
    } catch (err: any) {
      console.error('Error starting game:', err);
      setError(err.message || 'Failed to start game');
    } finally {
      setStarting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCode);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4 mx-auto w-8 h-8" />
          <p className="text-gray-600">Loading game...</p>
        </div>
      </main>
    );
  }

  if (error || !gameConfig) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <div className="card max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Game not found'}</p>
          <button onClick={() => router.push('/')} className="btn btn-primary">
            Go Home
          </button>
        </div>
      </main>
    );
  }

  const isCreator = wallet.publicKey?.equals(gameConfig.creator);
  const prizePool = lamportsToSol(gameConfig.stakeAmount * gameConfig.playerCount);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Game Status Banner */}
        {gameConfig.status === 'Lobby' && (
          <div className="card mb-8 text-center animate-bounce-in">
            <h1 className="text-4xl font-black mb-4">Waiting for Players...</h1>

            {/* Game Code */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Game Code</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-5xl font-black tracking-widest bg-gradient-to-r from-pink-500 to-teal-500 bg-clip-text text-transparent">
                  {gameCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="btn btn-accent text-sm py-2 px-4"
                >
                  Copy
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Share this code with friends to join!
              </p>
            </div>

            {/* Prize Pool */}
            <div className="bg-gradient-to-r from-yellow-100 to-pink-100 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 mb-1">Prize Pool</p>
              <p className="text-5xl font-black text-pink-600">{prizePool.toFixed(2)} SOL</p>
              <p className="text-xs text-gray-500 mt-1">
                {gameConfig.playerCount} / {gameConfig.maxPlayers} players
              </p>
            </div>

            {/* Start Button (only for creator) */}
            {isCreator && (
              <button
                onClick={handleStartGame}
                disabled={starting || gameConfig.playerCount < 2}
                className="btn btn-primary w-full text-lg"
              >
                {starting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Starting...
                  </span>
                ) : gameConfig.playerCount < 2 ? (
                  'Need at least 2 players'
                ) : (
                  'Start Game'
                )}
              </button>
            )}

            {!isCreator && (
              <p className="text-gray-600">
                Waiting for host to start the game...
              </p>
            )}
          </div>
        )}

        {/* Players List */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Players</h2>
          <div className="space-y-3">
            {players.map((player, index) => (
              <div
                key={player.player.toBase58()}
                className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-teal-50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-mono text-sm">
                      {player.player.toBase58().slice(0, 8)}...
                      {player.player.toBase58().slice(-8)}
                    </p>
                    {player.player.equals(gameConfig.creator) && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                        Creator
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-pink-600">
                    {player.score}
                  </p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Game UI (to be implemented) */}
        {gameConfig.status === 'Active' && (
          <div className="card mt-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Game Active!</h2>
            <p className="text-gray-600">
              Gameplay UI coming soon...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
