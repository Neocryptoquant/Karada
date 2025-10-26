use anchor_lang::prelude::*;
use crate::{Game, PlayerState, GuessLog, Guess, GameConfig, GameStatus, ErrorCode};
use crate::constants::*;

#[derive(Accounts)]
pub struct SubmitGuess<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

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
        mut,
        seeds = [PLAYER_STATE_SEED, game_config.key().as_ref(), player.key().as_ref()],
        bump = player_state.bump,
        constraint = player_state.is_active @ crate::error::ErrorCode::GameCancelled,
        constraint = !player_state.has_guessed_current_round @ crate::error::ErrorCode::AlreadyGuessed,
    )]
    pub player_state: Account<'info, PlayerState>,

    #[account(
        init_if_needed,
        payer = player,
        space = 8 + 32 + 1 + 4 + (100 * (32 + 32 + 8 + 1 + 4)) + 1, // Space for guesses
        seeds = [GUESS_LOG_SEED, game.key().as_ref(), &[game.current_round]],
        bump,
    )]
    pub guess_log: Account<'info, GuessLog>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<SubmitGuess>, word: String) -> Result<()> {
    let game = &ctx.accounts.game;
    let player_state = &mut ctx.accounts.player_state;
    let guess_log = &mut ctx.accounts.guess_log;
    let clock = Clock::get()?;

    // Check if round is still active
    require!(
        game.time_remaining > 0,
        crate::error::ErrorCode::RoundOver
    );

    // Check player is not the current drawer
    let current_drawer = game.players.get(game.current_drawer_index as usize)
        .ok_or(crate::error::ErrorCode::NotCurrentDrawer)?;
    require!(
        *current_drawer != ctx.accounts.player.key(),
        crate::error::ErrorCode::CannotGuessAsDrawer
    );

    // Initialize guess log if needed
    if guess_log.game == Pubkey::default() {
        guess_log.game = game.key();
        guess_log.round = game.current_round;
        guess_log.bump = ctx.bumps.guess_log;
    }

    // Check if guess is correct (compare with current_word)
    // Note: In production, current_word should be hashed/encrypted
    let word_lower = word.to_lowercase();
    let current_word_str = String::from_utf8_lossy(&game.current_word);
    let is_correct = word_lower == current_word_str.trim_end_matches('\0').to_lowercase();

    let points_awarded = if is_correct {
        // Calculate time-decay points
        let elapsed = clock.unix_timestamp - game.round_start_time;
        let time_factor = game.round_duration - elapsed.min(game.round_duration);
        let points_range = MAX_POINTS - MIN_POINTS;

        let points = MIN_POINTS + ((points_range as i64 * time_factor) / game.round_duration) as u32;

        // Award points
        player_state.score = player_state.score
            .checked_add(points)
            .ok_or(crate::error::ErrorCode::ArithmeticOverflow)?;

        player_state.has_guessed_current_round = true;

        points
    } else {
        0
    };

    // Log the guess
    let guess = Guess {
        player: ctx.accounts.player.key(),
        word: word.clone(),
        timestamp: clock.unix_timestamp,
        correct: is_correct,
        points_awarded,
    };

    guess_log.guesses.push(guess);

    // Emit event
    emit!(GuessSubmitted {
        game: game.key(),
        round: game.current_round,
        player: ctx.accounts.player.key(),
        word,
        correct: is_correct,
        points: points_awarded,
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct GuessSubmitted {
    pub game: Pubkey,
    pub round: u8,
    pub player: Pubkey,
    pub word: String,
    pub correct: bool,
    pub points: u32,
    pub timestamp: i64,
}
