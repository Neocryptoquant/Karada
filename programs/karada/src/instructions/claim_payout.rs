use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use crate::{GameConfig, PrizePool, Payout, GameStatus, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
#[instruction(rank: u8)]
pub struct CreatePayout<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        constraint = game_config.status == GameStatus::Ended @ crate::error::ErrorCode::GameNotEnded,
    )]
    pub game_config: Account<'info, GameConfig>,

    /// CHECK: Player who will claim this payout
    pub player: AccountInfo<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Payout::INIT_SPACE,
        seeds = [PAYOUT_SEED, game_config.key().as_ref(), player.key().as_ref()],
        bump,
    )]
    pub payout: Account<'info, Payout>,

    #[account(
        seeds = [PRIZE_POOL_SEED, game_config.key().as_ref()],
        bump = prize_pool.bump,
    )]
    pub prize_pool: Account<'info, PrizePool>,

    pub system_program: Program<'info, System>,
}

pub fn create_payout_handler(ctx: Context<CreatePayout>, rank: u8) -> Result<()> {
    let payout = &mut ctx.accounts.payout;
    let prize_pool = &ctx.accounts.prize_pool;
    let game_config = &ctx.accounts.game_config;
    let clock = Clock::get()?;

    // Calculate payout amount based on rank
    let multiplier = *PAYOUT_MULTIPLIERS.get(rank as usize).unwrap_or(&0) as u64;
    let payout_amount = (prize_pool.total_staked * multiplier) / 10000;

    // Initialize payout
    payout.game_config = game_config.key();
    payout.player = ctx.accounts.player.key();
    payout.amount = payout_amount;
    payout.claimed = false;
    payout.created_at = clock.unix_timestamp;
    payout.claimed_at = 0;
    payout.bump = ctx.bumps.payout;

    msg!("Payout created for player {} (rank {}): {} lamports",
         ctx.accounts.player.key(), rank, payout_amount);

    Ok(())
}

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        constraint = game_config.status == GameStatus::Ended @ crate::error::ErrorCode::GameNotEnded,
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        mut,
        seeds = [PAYOUT_SEED, game_config.key().as_ref(), player.key().as_ref()],
        bump = payout.bump,
        constraint = !payout.claimed @ crate::error::ErrorCode::PayoutAlreadyClaimed,
    )]
    pub payout: Account<'info, Payout>,

    #[account(
        mut,
        seeds = [PRIZE_POOL_SEED, game_config.key().as_ref()],
        bump = prize_pool.bump,
    )]
    pub prize_pool: Account<'info, PrizePool>,

    pub system_program: Program<'info, System>,
}

pub fn claim_payout_handler(ctx: Context<ClaimPayout>) -> Result<()> {
    let payout = &mut ctx.accounts.payout;
    let prize_pool = &mut ctx.accounts.prize_pool;
    let game_config = &ctx.accounts.game_config;
    let clock = Clock::get()?;

    // Check claim deadline
    require!(
        clock.unix_timestamp - game_config.ended_at < CLAIM_DEADLINE,
        crate::error::ErrorCode::ClaimDeadlineExceeded
    );

    // Transfer payout from prize pool to player
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
                to: ctx.accounts.player.to_account_info(),
            },
            signer_seeds,
        ),
        payout.amount,
    )?;

    // Update payout record
    payout.claimed = true;
    payout.claimed_at = clock.unix_timestamp;

    // Update prize pool
    prize_pool.total_distributed = prize_pool.total_distributed
        .checked_add(payout.amount)
        .ok_or(crate::error::ErrorCode::ArithmeticOverflow)?;

    msg!("Payout claimed: {} lamports transferred to {}",
         payout.amount, ctx.accounts.player.key());

    emit!(PayoutClaimed {
        game: game_config.key(),
        player: ctx.accounts.player.key(),
        amount: payout.amount,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct PayoutClaimed {
    pub game: Pubkey,
    pub player: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}
