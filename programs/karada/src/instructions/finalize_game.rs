use anchor_lang::prelude::*;
use crate::{GameConfig, Game, PrizePool, Payout, GameStatus, ErrorCode};
use crate::constants::*;

// This instruction should be called after undelegating from ER
#[derive(Accounts)]
#[instruction(player_scores: Vec<PlayerScore>)]
pub struct FinalizeGame<'info> {
    #[account(mut)]
    pub authority: Signer<'info>, // Backend authority

    #[account(
        mut,
        constraint = game_config.status == GameStatus::Active @ crate::error::ErrorCode::GameNotActive,
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        seeds = [GAME_SEED, game_config.key().as_ref()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,

    #[account(
        seeds = [PRIZE_POOL_SEED, game_config.key().as_ref()],
        bump = prize_pool.bump,
    )]
    pub prize_pool: Account<'info, PrizePool>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlayerScore {
    pub player: Pubkey,
    pub score: u32,
}

// Note: Payout PDAs are created in separate transactions due to account limits
pub fn handler(ctx: Context<FinalizeGame>, player_scores: Vec<PlayerScore>) -> Result<()> {
    let game_config = &mut ctx.accounts.game_config;
    let prize_pool = &ctx.accounts.prize_pool;
    let clock = Clock::get()?;

    // Sort players by score (descending)
    let mut ranked_players = player_scores.clone();
    ranked_players.sort_by(|a, b| b.score.cmp(&a.score));

    // Calculate payouts based on rankings
    let total_pool = prize_pool.total_staked;
    let player_count = ranked_players.len();

    msg!("Finalizing game with {} players", player_count);
    msg!("Total prize pool: {} lamports", total_pool);

    // Update game config
    game_config.status = GameStatus::Ended;
    game_config.ended_at = clock.unix_timestamp;

    // Emit final standings event
    emit!(GameFinalized {
        game: game_config.key(),
        total_pool,
        player_count: player_count as u8,
        winners: ranked_players.iter().take(3).map(|p| p.player).collect(),
        timestamp: clock.unix_timestamp,
    });

    msg!("Game finalized. Payouts can now be created and claimed.");

    Ok(())
}

#[event]
pub struct GameFinalized {
    pub game: Pubkey,
    pub total_pool: u64,
    pub player_count: u8,
    pub winners: Vec<Pubkey>,
    pub timestamp: i64,
}
