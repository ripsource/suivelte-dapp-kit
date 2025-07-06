// src/lib/utils/errors.ts

// Base error class for all dApp errors
export class DAppKitError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DAppKitError";
  }
}

// Wallet connection errors
export class WalletNotConnectedError extends DAppKitError {
  constructor(message: string = "No wallet is connected") {
    super(message);
    this.name = "WalletNotConnectedError";
  }
}

export class WalletAccountNotFoundError extends DAppKitError {
  constructor(message: string) {
    super(message);
    this.name = "WalletAccountNotFoundError";
  }
}

export class WalletNoAccountsConnectedError extends DAppKitError {
  constructor(message: string = "No accounts are connected") {
    super(message);
    this.name = "WalletNoAccountsConnectedError";
  }
}

// Feature support errors
export class FeatureNotSupportedError extends DAppKitError {
  constructor(message: string) {
    super(message);
    this.name = "FeatureNotSupportedError";
  }
}

export class ChainNotSupportedError extends DAppKitError {
  constructor(message: string) {
    super(message);
    this.name = "ChainNotSupportedError";
  }
}

// Transaction errors
export class TransactionError extends DAppKitError {
  constructor(
    message: string,
    public readonly digest?: string
  ) {
    super(message);
    this.name = "TransactionError";
  }
}

export class TransactionTimeoutError extends TransactionError {
  constructor(message: string = "Transaction timed out", digest?: string) {
    super(message, digest);
    this.name = "TransactionTimeoutError";
  }
}

// Network errors
export class NetworkError extends DAppKitError {
  constructor(
    message: string,
    public readonly network?: string
  ) {
    super(message);
    this.name = "NetworkError";
  }
}

// Error type guards
export function isWalletError(
  error: unknown
): error is
  | WalletNotConnectedError
  | WalletAccountNotFoundError
  | WalletNoAccountsConnectedError {
  return (
    error instanceof WalletNotConnectedError ||
    error instanceof WalletAccountNotFoundError ||
    error instanceof WalletNoAccountsConnectedError
  );
}

export function isFeatureError(
  error: unknown
): error is FeatureNotSupportedError | ChainNotSupportedError {
  return (
    error instanceof FeatureNotSupportedError ||
    error instanceof ChainNotSupportedError
  );
}

export function isTransactionError(error: unknown): error is TransactionError {
  return error instanceof TransactionError;
}

export function isDAppKitError(error: unknown): error is DAppKitError {
  return error instanceof DAppKitError;
}

// Error severity levels
export enum ErrorSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (error instanceof WalletNotConnectedError) {
    return ErrorSeverity.INFO;
  }

  if (
    error instanceof FeatureNotSupportedError ||
    error instanceof ChainNotSupportedError
  ) {
    return ErrorSeverity.WARNING;
  }

  if (
    error instanceof WalletAccountNotFoundError ||
    error instanceof WalletNoAccountsConnectedError
  ) {
    return ErrorSeverity.ERROR;
  }

  if (error instanceof TransactionError || error instanceof NetworkError) {
    return ErrorSeverity.ERROR;
  }

  return ErrorSeverity.CRITICAL;
}

// Error message formatter
export function formatErrorMessage(error: unknown): string {
  if (isDAppKitError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred";
}

// Error recovery suggestions
export function getErrorRecoveryAction(error: unknown): string | null {
  if (error instanceof WalletNotConnectedError) {
    return "connect_wallet";
  }

  if (error instanceof WalletAccountNotFoundError) {
    return "switch_account";
  }

  if (error instanceof FeatureNotSupportedError) {
    return "use_different_wallet";
  }

  if (error instanceof NetworkError) {
    return "switch_network";
  }

  if (error instanceof TransactionTimeoutError) {
    return "retry_transaction";
  }

  return null;
}
