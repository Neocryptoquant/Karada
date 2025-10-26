use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::{GameConfig, PrizePool, PlayerState, GameStatus, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
pub struct CancelGame<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        constraint = game_config.creator == creator.key() @ crate::error::ErrorCode::NotCreator,
        constraint = game_config.status == GameStatus::Lobby @ crate::error::ErrorCode::GameAlreadyStarted,
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [PRIZE_POOL_SEED, game_config.key().as_ref()],
        bump = prize_pool.bump,
    )]
    pub prize_pool: Account<'info, PrizePool>,

    pub system_program: Program<'info, System>,
}

pub fn cancel_handler(ctx: Context<CancelGame>) -> Result<()> {
    let game_config = &mut ctx.accounts.game_config;
    let clock = Clock::get()?;

    // Update status
    game_config.status = GameStatus::Cancelled;
    game_config.ended_at = clock.unix_timestamp;

    msg!("Game cancelled. Players must claim refunds individually.");

    emit!(GameCancelled {
        game: game_config.key(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct RefundStake<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        constraint = game_config.status == GameStatus::Cancelled @ crate::error::ErrorCode::GameNotActive,
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [PLAYER_STATE_SEED, game_config.key().as_ref(), player.key().as_ref()],
        bump = player_state.bump,
        close = player, // Close account and return rent to player
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

pub fn refund_handler(ctx: Context<RefundStake>) -> Result<()> {
    let prize_pool = &mut ctx.accounts.prize_pool;
    let game_config = &ctx.accounts.game_config;
    let player = &ctx.accounts.player;

    // Transfer stake back to player
    let game_config_key = game_config.key();
    let seeds = &[
        PRIZE_POOL_SEED,
        game_config_key.as_ref(),
        &[prize_pool.bump],
    ];
    let signer_seeds = &[&seeds[..]];

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: prize_pool.to_account_info(),
                to: player.to_account_info(),
            },
            signer_seeds,
        ),
        game_config.stake_amount,
    )?;

    msg!("Stake refunded: {} lamports to {}",
         game_config.stake_amount, player.key());

    Ok(())
}

#[event]
pub struct GameCancelled {
    pub game: Pubkey,
    pub timestamp: i64,
}
