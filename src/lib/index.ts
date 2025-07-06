// src/lib/index.ts
// Stores
export { walletStore } from "./stores/wallet.svelte";
export {
  setSuiClientContext,
  getSuiClientContext,
} from "./stores/sui-client.svelte";

// Actions
export { walletActions } from "./actions/wallet-actions.svelte";
export { transactionActions } from "./actions/transaction-actions.svelte";

// Utils
export { autoConnectManager } from "./utils/auto-connect.svelte";

// Components
export { default as ConnectButton } from "./components/wallet/ConnectButton.svelte";
export { default as WalletModal } from "./components/wallet/WalletModal.svelte";
export { default as AccountDropdown } from "./components/wallet/AccountDropdown.svelte";
export { default as WalletListItem } from "./components/wallet/WalletListItem.svelte";
export { default as WalletProvider } from "./components/providers/WalletProvider.svelte";
export { default as TransactionDemo } from "./components/demos/TransactionDemo.svelte";

// Utils
export * from "./utils/wallet-utils";
export * from "./utils/format";
export * from "./utils/transaction-builders";

// Types
export type * from "./types/wallet";
export type * from "./types/sui";

// Re-export important types from dependencies
export type {
  WalletAccount,
  WalletWithRequiredFeatures,
  Wallet,
} from "@mysten/wallet-standard";

export type { SuiClient, SuiClientOptions } from "@mysten/sui/client";
