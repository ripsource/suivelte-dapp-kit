// src/lib/actions/wallet-actions.svelte.ts
import type {
  WalletWithRequiredFeatures,
  WalletAccount,
} from "@mysten/wallet-standard";
import { walletStore } from "../stores/wallet.svelte.js";

interface ConnectWalletArgs {
  wallet: WalletWithRequiredFeatures;
  accountAddress?: string;
  silent?: boolean;
}

interface WalletActions {
  isConnecting: boolean;
  error: Error | null;
}

class WalletActionsStore {
  #state = $state<WalletActions>({
    isConnecting: false,
    error: null,
  });

  get isConnecting() {
    return this.#state.isConnecting;
  }
  get error() {
    return this.#state.error;
  }

  async connectWallet({
    wallet,
    accountAddress,
    silent = false,
  }: ConnectWalletArgs) {
    try {
      this.#state.isConnecting = true;
      this.#state.error = null;
      walletStore.setConnectionStatus("connecting");

      const connectResult = await wallet.features["standard:connect"].connect({
        silent,
      });

      // Filter for Sui accounts only
      const suiAccounts = connectResult.accounts.filter((account) =>
        account.chains.some((chain) => chain.split(":")[0] === "sui")
      );

      const selectedAccount = this.#getSelectedAccount(
        suiAccounts,
        accountAddress
      );

      walletStore.setWalletConnected(
        wallet,
        suiAccounts,
        selectedAccount,
        connectResult.supportedIntents || []
      );

      return { accounts: suiAccounts };
    } catch (error) {
      this.#state.error = error as Error;
      walletStore.setConnectionStatus("disconnected");
      throw error;
    } finally {
      this.#state.isConnecting = false;
    }
  }

  async disconnectWallet() {
    const currentWallet = walletStore.currentWallet;
    if (!currentWallet) {
      throw new Error("No wallet is connected.");
    }

    try {
      // Try to disconnect if wallet supports it
      await currentWallet.features["standard:disconnect"]?.disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }

    walletStore.setWalletDisconnected();
  }

  switchAccount(account: WalletAccount) {
    const currentWallet = walletStore.currentWallet;
    if (!currentWallet) {
      throw new Error("No wallet is connected.");
    }

    const accountExists = currentWallet.accounts.find(
      (walletAccount) => walletAccount.address === account.address
    );

    if (!accountExists) {
      throw new Error(`Account ${account.address} not found in wallet.`);
    }

    walletStore.switchAccount(account);
  }

  #getSelectedAccount(
    accounts: readonly WalletAccount[],
    accountAddress?: string
  ) {
    if (accounts.length === 0) return null;

    if (accountAddress) {
      const found = accounts.find(
        (account) => account.address === accountAddress
      );
      return found || accounts[0];
    }

    return accounts[0];
  }

  // Clear any connection errors
  clearError() {
    this.#state.error = null;
  }
}

export const walletActions = new WalletActionsStore();
