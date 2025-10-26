pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("FnCM1n5gesrckxQRSjA5h1ENmiBpkxEDZ8a4hBWn2UQU");

#[program]
pub mod karada {
    use super::*;

    // Game lifecycle
    pub fn initialize_game(
        ctx: Context<InitializeGame>,
        game_code: [u8; 6],
        stake_amount: u64,
        max_players: u8,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, game_code, stake_amount, max_players)
    }

    pub fn join_game(ctx: Context<JoinGame>) -> Result<()> {
        instructions::join_game::handler(ctx)
    }

    pub fn start_game(ctx: Context<StartGame>) -> Result<()> {
        instructions::start_game::handler(ctx)
    }

    pub fn cancel_game(ctx: Context<CancelGame>) -> Result<()> {
        instructions::cancel_game::cancel_handler(ctx)
    }

    pub fn refund_stake(ctx: Context<RefundStake>) -> Result<()> {
        instructions::cancel_game::refund_handler(ctx)
    }

    // Gameplay instructions (execute in Ephemeral Rollup)
    pub fn add_stroke(
        ctx: Context<AddStroke>,
        points: Vec<u16>,
        color: u32,
        width: u8,
    ) -> Result<()> {
        instructions::add_stroke::handler(ctx, points, color, width)
    }

    pub fn submit_guess(ctx: Context<SubmitGuess>, word: String) -> Result<()> {
        instructions::submit_guess::handler(ctx, word)
    }

    pub fn tick(ctx: Context<Tick>) -> Result<()> {
        instructions::tick::handler(ctx)
    }

    pub fn end_round(ctx: Context<EndRound>, params: EndRoundParams) -> Result<()> {
        instructions::end_round::handler(ctx, params)
    }

    // Finalization and payouts
    pub fn finalize_game(
        ctx: Context<FinalizeGame>,
        player_scores: Vec<PlayerScore>,
    ) -> Result<()> {
        instructions::finalize_game::handler(ctx, player_scores)
    }

    pub fn create_payout(ctx: Context<CreatePayout>, rank: u8) -> Result<()> {
        instructions::claim_payout::create_payout_handler(ctx, rank)
    }

    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        instructions::claim_payout::claim_payout_handler(ctx)
    }
}
