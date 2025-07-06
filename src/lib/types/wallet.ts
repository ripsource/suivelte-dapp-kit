// src/lib/types/wallet.ts
import type {
  WalletAccount,
  WalletWithRequiredFeatures,
} from "@mysten/wallet-standard";

export type WalletConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected";

export interface WalletState {
  wallets: WalletWithRequiredFeatures[];
  accounts: readonly WalletAccount[];
  currentWallet: WalletWithRequiredFeatures | null;
  currentAccount: WalletAccount | null;
  connectionStatus: WalletConnectionStatus;
  lastConnectedWalletName: string | null;
  lastConnectedAccountAddress: string | null;
  supportedIntents: string[];
}

export interface ConnectWalletArgs {
  wallet: WalletWithRequiredFeatures;
  accountAddress?: string;
  silent?: boolean;
}

export interface WalletError extends Error {
  code?: string;
  wallet?: string;
}

export interface WalletModalProps {
  show: boolean;
  onClose?: () => void;
  walletFilter?: (wallet: WalletWithRequiredFeatures) => boolean;
  preferredWallets?: string[];
}

export interface AccountDropdownProps {
  currentAccount: WalletAccount;
  onAccountChange?: (account: WalletAccount) => void;
  onDisconnect?: () => void;
}
