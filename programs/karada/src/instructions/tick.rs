use anchor_lang::prelude::*;
use crate::{Game, GameConfig, GameStatus, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
pub struct Tick<'info> {
    // Can be called by anyone (typically backend cron)
    pub authority: Signer<'info>,

    #[account(
        constraint = game_config.status == GameStatus::Active @ crate::error::ErrorCode::GameNotActive,
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [GAME_SEED, game_config.key().as_ref()],
        bump = game.bump,
    )]
    pub game: Account<'info, Game>,
}

pub fn handler(ctx: Context<Tick>) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let clock = Clock::get()?;

    // Calculate time elapsed since round start
    let elapsed = clock.unix_timestamp - game.round_start_time;

    // Update time remaining
    game.time_remaining = (game.round_duration - elapsed).max(0);

    // Emit event for frontend
    emit!(TimerTick {
        game: game.key(),
        round: game.current_round,
        time_remaining: game.time_remaining,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct TimerTick {
    pub game: Pubkey,
    pub round: u8,
    pub time_remaining: i64,
    pub timestamp: i64,
}
