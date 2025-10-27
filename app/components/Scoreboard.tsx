'use client';

import { PublicKey } from '@solana/web3.js';

interface Player {
  player: PublicKey;
  score: number;
  isDrawer?: boolean;
  isCurrentPlayer?: boolean;
}

interface ScoreboardProps {
  players: Player[];
}

export default function Scoreboard({ players }: ScoreboardProps) {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="card h-full">
      <h2 className="text-2xl font-bold mb-4 text-center">Scoreboard</h2>

      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.player.toBase58()}
            className={`relative rounded-xl p-4 transition-all ${
              player.isDrawer
                ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                : player.isCurrentPlayer
                ? 'bg-gradient-to-r from-pink-100 to-teal-100 border-2 border-pink-400'
                : 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200'
            }`}
          >
            {/* Rank Badge */}
            <div
              className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                  : index === 1
                  ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'
                  : index === 2
                  ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>

            <div className="flex items-center justify-between ml-4">
              {/* Player Info */}
              <div className="flex-1">
                <div className="font-mono text-sm text-gray-700 mb-1">
                  {player.player.toBase58().slice(0, 8)}...
                  {player.player.toBase58().slice(-4)}
                </div>
                <div className="flex gap-2">
                  {player.isDrawer && (
                    <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      Drawing
                    </span>
                  )}
                  {player.isCurrentPlayer && (
                    <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      You
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div
                  className={`text-3xl font-black ${
                    index === 0
                      ? 'text-yellow-600'
                      : index === 1
                      ? 'text-gray-600'
                      : index === 2
                      ? 'text-orange-600'
                      : 'text-gray-500'
                  }`}
                >
                  {player.score}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-6 pt-4 border-t-2 border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-pink-600">
              {players.length}
            </div>
            <div className="text-xs text-gray-600">Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-teal-600">
              {Math.max(...players.map((p) => p.score), 0)}
            </div>
            <div className="text-xs text-gray-600">High Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
