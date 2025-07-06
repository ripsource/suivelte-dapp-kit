// Stores
export { walletStore } from "./stores/wallet.svelte";
export {
  setSuiClientContext,
  getSuiClientContext,
} from "./stores/sui-client.svelte";

// Actions
export { walletActions } from "./actions/wallet-actions.svelte";

// Components
export { default as ConnectButton } from "./components/wallet/ConnectButton.svelte";
export { default as WalletModal } from "./components/wallet/WalletModal.svelte";
export { default as AccountDropdown } from "./components/wallet/AccountDropdown.svelte";
export { default as WalletListItem } from "./components/wallet/WalletListItem.svelte";
// Utils
export * from "./utils/wallet-utils";
export * from "./utils/format";

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
