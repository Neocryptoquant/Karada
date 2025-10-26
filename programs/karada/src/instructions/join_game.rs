use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::{GameConfig, PlayerState, PrizePool, GameStatus, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
pub struct JoinGame<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        constraint = game_config.status == GameStatus::Lobby @ crate::error::ErrorCode::GameAlreadyStarted,
        constraint = game_config.player_count < game_config.max_players @ crate::error::ErrorCode::GameFull,
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = player,
        space = 8 + PlayerState::INIT_SPACE,
        seeds = [PLAYER_STATE_SEED, game_config.key().as_ref(), player.key().as_ref()],
        bump,
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(
        mut,
        seeds = [PRIZE_POOL_SEED, game_config.key().as_ref()],
        bump = prize_pool.bump,
    )]
    pub prize_pool: Account<'info, PrizePool>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<JoinGame>) -> Result<()> {
    let game_config = &mut ctx.accounts.game_config;
    let player_state = &mut ctx.accounts.player_state;
    let prize_pool = &mut ctx.accounts.prize_pool;
    let clock = Clock::get()?;

    // Check lobby timeout
    require!(
        clock.unix_timestamp - game_config.created_at < LOBBY_TIMEOUT,
        crate::error::ErrorCode::LobbyTimeout
    );

    // Transfer stake to prize pool
    transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: prize_pool.to_account_info(),
            },
        ),
        game_config.stake_amount,
    )?;

    // Update prize pool
    prize_pool.total_staked = prize_pool.total_staked
        .checked_add(game_config.stake_amount)
        .ok_or(crate::error::ErrorCode::ArithmeticOverflow)?;

    // Initialize player state
    player_state.game_config = game_config.key();
    player_state.player = ctx.accounts.player.key();
    player_state.score = 0;
    player_state.has_guessed_current_round = false;
    player_state.is_active = true;
    player_state.joined_at = clock.unix_timestamp;
    player_state.bump = ctx.bumps.player_state;

    // Update game config
    game_config.player_count = game_config.player_count
        .checked_add(1)
        .ok_or(crate::error::ErrorCode::ArithmeticOverflow)?;

    msg!("Player {} joined game", ctx.accounts.player.key());
    msg!("Total players: {}/{}", game_config.player_count, game_config.max_players);
    msg!("Prize pool: {} lamports", prize_pool.total_staked);

    Ok(())
}
