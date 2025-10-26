use anchor_lang::prelude::*;

// Payout record for a player (created when game ends)
#[account]
#[derive(InitSpace)]
pub struct Payout {
    pub game_config: Pubkey,
    pub player: Pubkey,
    pub amount: u64,
    pub claimed: bool,
    pub created_at: i64,
    pub claimed_at: i64,
    pub bump: u8,
}

// Prize pool vault (holds all stakes)
#[account]
#[derive(InitSpace)]
pub struct PrizePool {
    pub game_config: Pubkey,
    pub total_staked: u64,
    pub total_distributed: u64,
    pub bump: u8,
}
