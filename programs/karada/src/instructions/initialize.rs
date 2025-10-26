use anchor_lang::prelude::*;
use crate::{GameConfig, PrizePool, GameStatus, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
#[instruction(game_code: [u8; 6], stake_amount: u64, max_players: u8)]
pub struct InitializeGame<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + GameConfig::INIT_SPACE,
        seeds = [GAME_CONFIG_SEED, &game_code],
        bump,
    )]
    pub game_config: Account<'info, GameConfig>,

    #[account(
        init,
        payer = creator,
        space = 8 + PrizePool::INIT_SPACE,
        seeds = [PRIZE_POOL_SEED, game_config.key().as_ref()],
        bump,
    )]
    pub prize_pool: Account<'info, PrizePool>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeGame>,
    game_code: [u8; 6],
    stake_amount: u64,
    max_players: u8,
) -> Result<()> {
    // Validate inputs
    require!(
        max_players >= MIN_PLAYERS && max_players <= MAX_PLAYERS,
        crate::error::ErrorCode::InvalidPlayerCount
    );

    let game_config = &mut ctx.accounts.game_config;
    let prize_pool = &mut ctx.accounts.prize_pool;
    let clock = Clock::get()?;

    // Initialize game config
    game_config.game_code = game_code;
    game_config.creator = ctx.accounts.creator.key();
    game_config.stake_amount = stake_amount;
    game_config.max_players = max_players;
    game_config.player_count = 0;
    game_config.status = GameStatus::Lobby;
    game_config.prize_pool = prize_pool.key();
    game_config.created_at = clock.unix_timestamp;
    game_config.started_at = 0;
    game_config.ended_at = 0;
    game_config.bump = ctx.bumps.game_config;

    // Initialize prize pool
    prize_pool.game_config = game_config.key();
    prize_pool.total_staked = 0;
    prize_pool.total_distributed = 0;
    prize_pool.bump = ctx.bumps.prize_pool;

    msg!("Game created with code: {:?}", game_code);
    msg!("Stake amount: {} lamports", stake_amount);
    msg!("Max players: {}", max_players);

    Ok(())
}
