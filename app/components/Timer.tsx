'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
  timeRemaining: number; // in seconds
  maxTime?: number; // for progress bar
  onTimeUp?: () => void;
}

export default function Timer({
  timeRemaining,
  maxTime = 80,
  onTimeUp,
}: TimerProps) {
  const [time, setTime] = useState(timeRemaining);

  useEffect(() => {
    setTime(timeRemaining);
  }, [timeRemaining]);

  // Local countdown (for smooth animation)
  useEffect(() => {
    if (time <= 0) {
      if (onTimeUp) onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTime((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [time, onTimeUp]);

  const progress = (time / maxTime) * 100;
  const isLow = time <= 10;
  const isVeryLow = time <= 5;

  return (
    <div className="card text-center">
      {/* Timer Display */}
      <div
        className={`text-8xl font-black mb-4 transition-all ${
          isVeryLow
            ? 'text-red-600 animate-pulse'
            : isLow
            ? 'text-orange-500'
            : 'text-teal-600'
        }`}
      >
        {time}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
            isVeryLow
              ? 'bg-gradient-to-r from-red-500 to-red-600'
              : isLow
              ? 'bg-gradient-to-r from-orange-400 to-orange-500'
              : 'bg-gradient-to-r from-teal-400 to-teal-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Label */}
      <p className="text-sm text-gray-600 mt-3">seconds remaining</p>

      {/* Warning */}
      {isLow && (
        <div className="mt-4 bg-red-100 border-2 border-red-300 rounded-xl p-3">
          <p className="text-red-700 font-semibold text-sm">
            {isVeryLow ? "Time's almost up!" : 'Hurry up!'}
          </p>
        </div>
      )}
    </div>
  );
}
