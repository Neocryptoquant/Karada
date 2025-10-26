use anchor_lang::prelude::*;

// Status enum for game lifecycle
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Default, InitSpace)]
pub enum GameStatus {
    #[default]
    Lobby,          // Waiting for players
    Active,         // Game in progress (delegated to ER)
    Ended,          // Game finished, payouts available
    Cancelled,      // Game cancelled, refunds available
}

// Main game config (lives on mainnet, NOT delegated)
#[account]
#[derive(InitSpace)]
pub struct GameConfig {
    pub game_code: [u8; 6],         // 6-character alphanumeric code
    pub creator: Pubkey,
    pub stake_amount: u64,          // SOL amount each player must stake
    pub max_players: u8,            // 2-10 players
    pub player_count: u8,           // Current number of joined players
    pub status: GameStatus,
    pub prize_pool: Pubkey,         // Prize pool vault
    pub created_at: i64,
    pub started_at: i64,
    pub ended_at: i64,
    pub bump: u8,
}

// Active game state (lives in ER during gameplay)
#[account]
#[derive(InitSpace)]
pub struct Game {
    pub config: Pubkey,             // Reference to GameConfig
    pub current_word: [u8; 32],     // Current word being drawn (encrypted/hidden)
    pub current_drawer_index: u8,   // Index into players array
    pub current_round: u8,          // 0-indexed round number
    pub round_start_time: i64,
    pub round_duration: i64,        // 80 seconds default
    pub time_remaining: i64,
    #[max_len(10)]
    pub players: Vec<Pubkey>,       // Ordered list of players
    pub bump: u8,
}

// Per-player state (lives in ER during gameplay)
#[account]
#[derive(InitSpace)]
pub struct PlayerState {
    pub game_config: Pubkey,
    pub player: Pubkey,
    pub score: u32,
    pub has_guessed_current_round: bool,
    pub is_active: bool,            // False if disconnected
    pub joined_at: i64,
    pub bump: u8,
}

// Drawing canvas for current round (lives in ER)
#[account]
pub struct DrawingCanvas {
    pub game: Pubkey,
    pub round: u8,
    pub strokes: Vec<DrawStroke>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct DrawStroke {
    pub points: Vec<u16>,           // Compressed coordinates [x1,y1,x2,y2,...]
    pub color: u32,                 // RGB color
    pub width: u8,                  // Line width 1-20
    pub timestamp: i64,
}

// Guess log for current round (lives in ER)
#[account]
pub struct GuessLog {
    pub game: Pubkey,
    pub round: u8,
    pub guesses: Vec<Guess>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Guess {
    pub player: Pubkey,
    pub word: String,               // The guessed word
    pub timestamp: i64,             // When guess was made
    pub correct: bool,
    pub points_awarded: u32,
}
