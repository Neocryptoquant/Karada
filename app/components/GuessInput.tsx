'use client';

import { useState, useRef, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';

interface Guess {
  player: PublicKey;
  word: string;
  timestamp: number;
  correct: boolean;
  points?: number;
}

interface GuessInputProps {
  guesses: Guess[];
  onSubmitGuess?: (word: string) => void;
  disabled?: boolean;
  currentPlayer?: PublicKey;
}

export default function GuessInput({
  guesses,
  onSubmitGuess,
  disabled = false,
  currentPlayer,
}: GuessInputProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new guesses come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [guesses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed && onSubmitGuess && !disabled) {
      onSubmitGuess(trimmed);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Guesses List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 mb-4 p-4 bg-gray-50 rounded-xl min-h-[400px] max-h-[500px]"
      >
        {guesses.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No guesses yet. Be the first!
          </div>
        ) : (
          guesses.map((guess, index) => {
            const isCurrentPlayer = currentPlayer && guess.player.equals(currentPlayer);

            return (
              <div
                key={index}
                className={`p-3 rounded-lg transition-all ${
                  guess.correct
                    ? 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-400'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-600">
                        {guess.player.toBase58().slice(0, 8)}...
                        {isCurrentPlayer && ' (You)'}
                      </span>
                      {guess.correct && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          Correct!
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-gray-800">
                      {guess.word}
                    </div>
                  </div>
                  {guess.correct && guess.points !== undefined && (
                    <div className="text-right">
                      <div className="text-2xl font-black text-green-600">
                        +{guess.points}
                      </div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? "You're the drawer!" : "Type your guess..."}
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-teal-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          maxLength={50}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="btn btn-secondary px-8"
        >
          Guess
        </button>
      </form>

      {disabled && (
        <p className="text-sm text-gray-500 text-center mt-2">
          You're drawing this round!
        </p>
      )}
    </div>
  );
}
