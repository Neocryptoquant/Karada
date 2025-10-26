use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Game is full, cannot accept more players")]
    GameFull,

    #[msg("Game has already started")]
    GameAlreadyStarted,

    #[msg("Game is not in active status")]
    GameNotActive,

    #[msg("Game has not ended yet")]
    GameNotEnded,

    #[msg("Game has been cancelled")]
    GameCancelled,

    #[msg("Not enough players to start game")]
    NotEnoughPlayers,

    #[msg("Only game creator can perform this action")]
    NotCreator,

    #[msg("Only current drawer can draw")]
    NotCurrentDrawer,

    #[msg("Player has already guessed this round")]
    AlreadyGuessed,

    #[msg("Incorrect stake amount")]
    IncorrectStakeAmount,

    #[msg("Player already joined this game")]
    PlayerAlreadyJoined,

    #[msg("Invalid player count")]
    InvalidPlayerCount,

    #[msg("Lobby timeout exceeded")]
    LobbyTimeout,

    #[msg("Claim deadline exceeded")]
    ClaimDeadlineExceeded,

    #[msg("Payout already claimed")]
    PayoutAlreadyClaimed,

    #[msg("Invalid game code")]
    InvalidGameCode,

    #[msg("Round is over")]
    RoundOver,

    #[msg("Cannot guess as drawer")]
    CannotGuessAsDrawer,

    #[msg("Invalid word")]
    InvalidWord,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
}
