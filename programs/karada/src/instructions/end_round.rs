use anchor_lang::prelude::*;
use crate::{Game, GameConfig, GameStatus, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
pub struct EndRound<'info> {
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

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct EndRoundParams {
    pub next_word: [u8; 32], // Word for next round (or empty if game ending)
}

pub fn handler(ctx: Context<EndRound>, params: EndRoundParams) -> Result<()> {
    let game = &mut ctx.accounts.game;
    let game_config = &ctx.accounts.game_config;
    let clock = Clock::get()?;

    // Move to next drawer
    let next_drawer_index = (game.current_drawer_index + 1) as usize;

    // Check if all players have had their turn
    if next_drawer_index >= game.players.len() {
        // Game should end - emit event
        emit!(GameReadyToEnd {
            game: game.key(),
            total_rounds: game.current_round + 1,
            timestamp: clock.unix_timestamp,
        });

        msg!("All players have drawn. Game ready to finalize.");
        return Ok(());
    }

    // Reset for next round
    game.current_drawer_index = next_drawer_index as u8;
    game.current_round += 1;
    game.current_word = params.next_word;
    game.round_start_time = clock.unix_timestamp;
    game.time_remaining = game.round_duration;

    // Emit round started event
    emit!(RoundStarted {
        game: game.key(),
        round: game.current_round,
        drawer_index: game.current_drawer_index,
        drawer: *game.players.get(next_drawer_index).unwrap(),
        timestamp: clock.unix_timestamp,
    });

    msg!("Round {} started. Drawer: {}", game.current_round, game.current_drawer_index);

    Ok(())
}

#[event]
pub struct RoundStarted {
    pub game: Pubkey,
    pub round: u8,
    pub drawer_index: u8,
    pub drawer: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct GameReadyToEnd {
    pub game: Pubkey,
    pub total_rounds: u8,
    pub timestamp: i64,
}
