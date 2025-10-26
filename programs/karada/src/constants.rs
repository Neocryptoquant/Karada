use anchor_lang::prelude::*;

// PDA Seeds
#[constant]
pub const GAME_CONFIG_SEED: &[u8] = b"game_config";

#[constant]
pub const GAME_SEED: &[u8] = b"game";

#[constant]
pub const PLAYER_STATE_SEED: &[u8] = b"player_state";

#[constant]
pub const CANVAS_SEED: &[u8] = b"canvas";

#[constant]
pub const GUESS_LOG_SEED: &[u8] = b"guess_log";

#[constant]
pub const PRIZE_POOL_SEED: &[u8] = b"prize_pool";

#[constant]
pub const PAYOUT_SEED: &[u8] = b"payout";

// Game Constants
#[constant]
pub const MIN_PLAYERS: u8 = 2;

#[constant]
pub const MAX_PLAYERS: u8 = 10;

#[constant]
pub const ROUND_DURATION: i64 = 80; // seconds

#[constant]
pub const LOBBY_TIMEOUT: i64 = 600; // 10 minutes

#[constant]
pub const CLAIM_DEADLINE: i64 = 604800; // 7 days

// Payout multipliers (basis points, 10000 = 100%)
// These sum to 9700 (97%), 3% goes to protocol fee
#[constant]
pub const PAYOUT_MULTIPLIERS: [u16; 10] = [
    3700,  // 1st: 37% of pool (1.85x stake for 5 players)
    2800,  // 2nd: 28%
    1900,  // 3rd: 19%
    900,   // 4th: 9%
    500,   // 5th: 5%
    300,   // 6th: 3%
    200,   // 7th: 2%
    100,   // 8th: 1%
    100,   // 9th: 1%
    100,   // 10th: 1%
];

// Points calculation
#[constant]
pub const MAX_POINTS: u32 = 1500;

#[constant]
pub const MIN_POINTS: u32 = 100;
