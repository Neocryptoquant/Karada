use anchor_lang::prelude::*;
use crate::{GameConfig, Game, GameStatus, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
pub struct StartGame<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        constraint = game_config.creator == creator.key() @ crate::error::ErrorCode::NotCreator,
        constraint = game_config.status == GameStatus::Lobby @ crate::error::ErrorCode::GameAlreadyStarted,
        constraint = game_config.player_count >= MIN_PLAYERS @ crate::error::ErrorCode::NotEnoughPlayers,
    )]
    pub game_config: Account<'info, GameConfig>,

    // This account will be delegated to Ephemeral Rollup
    #[account(
        init,
        payer = creator,
        space = 8 + Game::INIT_SPACE,
        seeds = [GAME_SEED, game_config.key().as_ref()],
        bump,
    )]
    pub game: Account<'info, Game>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<StartGame>) -> Result<()> {
    let game_config = &mut ctx.accounts.game_config;
    let game = &mut ctx.accounts.game;
    let clock = Clock::get()?;

    // Update game config status
    game_config.status = GameStatus::Active;
    game_config.started_at = clock.unix_timestamp;

    // Initialize active game state
    game.config = game_config.key();
    game.current_word = [0u8; 32]; // Will be set in first round
    game.current_drawer_index = 0;
    game.current_round = 0;
    game.round_start_time = clock.unix_timestamp;
    game.round_duration = ROUND_DURATION;
    game.time_remaining = ROUND_DURATION;
    game.players = vec![]; // Will be populated from PlayerState accounts
    game.bump = ctx.bumps.game;

    msg!("Game started!");
    msg!("Total players: {}", game_config.player_count);
    msg!("Game PDA will be delegated to Ephemeral Rollup");

    Ok(())
}
