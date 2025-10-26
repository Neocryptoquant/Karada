#[allow(unexpected_cfgs, unused_imports)]
use anchor_lang::prelude::*;
use crate::{Game, DrawingCanvas, DrawStroke, GameStatus, GameConfig, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
pub struct AddStroke<'info> {
    #[account(mut)]
    pub drawer: Signer<'info>,

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

    #[account(
        init_if_needed,
        payer = drawer,
        space = 8 + 32 + 1 + 4 + (100 * (2 * 50 + 4 + 1 + 8)) + 1, // Reasonable space for strokes
        seeds = [CANVAS_SEED, game.key().as_ref(), &[game.current_round]],
        bump,
    )]
    pub canvas: Account<'info, DrawingCanvas>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<AddStroke>,
    points: Vec<u16>,
    color: u32,
    width: u8,
) -> Result<()> {
    let game = &ctx.accounts.game;
    let canvas = &mut ctx.accounts.canvas;
    let clock = Clock::get()?;

    // Check if drawer is current drawer
    let current_drawer = game.players.get(game.current_drawer_index as usize)
        .ok_or(crate::error::ErrorCode::NotCurrentDrawer)?;

    require!(
        *current_drawer == ctx.accounts.drawer.key(),
        crate::error::ErrorCode::NotCurrentDrawer
    );

    // Check if round is still active
    require!(
        game.time_remaining > 0,
        crate::error::ErrorCode::RoundOver
    );

    // Initialize canvas if needed
    if canvas.game == Pubkey::default() {
        canvas.game = game.key();
        canvas.round = game.current_round;
        canvas.bump = ctx.bumps.canvas;
    }

    // Add stroke
    let stroke = DrawStroke {
        points,
        color,
        width,
        timestamp: clock.unix_timestamp,
    };

    canvas.strokes.push(stroke);

    // Emit event for real-time sync
    emit!(StrokeAdded {
        game: game.key(),
        round: game.current_round,
        drawer: ctx.accounts.drawer.key(),
        color,
        width,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct StrokeAdded {
    pub game: Pubkey,
    pub round: u8,
    pub drawer: Pubkey,
    pub color: u32,
    pub width: u8,
    pub timestamp: i64,
}
