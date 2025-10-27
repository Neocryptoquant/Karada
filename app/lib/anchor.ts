import { AnchorProvider, Program, Idl, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import type { WalletContextState } from '@solana/wallet-adapter-react';
import idl from './idl/karada.json';

// Program ID from deployment
export const PROGRAM_ID = new PublicKey('FnCM1n5gesrckxQRSjA5h1ENmiBpkxEDZ8a4hBWn2UQU');

/**
 * Convert WalletContextState to AnchorWallet format
 */
export function toAnchorWallet(wallet: WalletContextState) {
  if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
    throw new Error('Wallet not connected or missing required methods');
  }

  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction.bind(wallet),
    signAllTransactions: wallet.signAllTransactions.bind(wallet),
  };
}

/**
 * Get the Anchor program instance
 */
export function getProgram(connection: Connection, wallet: WalletContextState) {
  const anchorWallet = toAnchorWallet(wallet);
  const provider = new AnchorProvider(connection, anchorWallet, {
    commitment: 'confirmed',
  });
  return new Program(idl as Idl, provider);
}

/**
 * Derive GameConfig PDA
 */
export function getGameConfigPDA(gameCode: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game_config'), Buffer.from(gameCode)],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Derive Game PDA (for ER delegation)
 */
export function getGamePDA(gameCode: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('game'), Buffer.from(gameCode)],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Derive PrizePool PDA
 */
export function getPrizePoolPDA(gameCode: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('prize_pool'), Buffer.from(gameCode)],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Derive PlayerState PDA
 */
export function getPlayerStatePDA(gameCode: string, player: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('player_state'), Buffer.from(gameCode), player.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Derive DrawingCanvas PDA
 */
export function getDrawingCanvasPDA(gameCode: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('drawing_canvas'), Buffer.from(gameCode)],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Derive GuessLog PDA
 */
export function getGuessLogPDA(gameCode: string) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('guess_log'), Buffer.from(gameCode)],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Derive Payout PDA
 */
export function getPayoutPDA(gameCode: string, player: PublicKey) {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('payout'), Buffer.from(gameCode), player.toBuffer()],
    PROGRAM_ID
  );
  return pda;
}

/**
 * Generate a random 6-character game code
 */
export function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Convert SOL to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1_000_000_000);
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / 1_000_000_000;
}
