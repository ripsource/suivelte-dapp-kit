// src/lib/utils/-transaction-context.svelte.ts
import type { SuiClient } from "@mysten/sui/client";
import { getSuiClientContext } from "../stores/sui-client.svelte.js";
import { walletStore } from "../stores/wallet.svelte.js";

interface TransactionContextState {
  client: SuiClient;
  network: string;
  currentAccount: string | null;
  supportedIntents: string[];
}

/**
 *  transaction context that matches dapp-kit-core functionality
 */
class TransactionContextManager {
  #state = $state<TransactionContextState>({
    client: null as any,
    network: "",
    currentAccount: null,
    supportedIntents: [],
  });

  /**
   * Initialize with reactive updates
   */
  initialize() {
    const suiContext = getSuiClientContext();

    // React to changes in client/network
    $effect(() => {
      this.#state.client = suiContext.client;
      this.#state.network = suiContext.network;
    });

    // React to wallet changes
    $effect(() => {
      this.#state.currentAccount = walletStore.currentAccount?.address || null;
      this.#state.supportedIntents = walletStore.supportedIntents;
    });
  }

  get client(): SuiClient {
    if (!this.#state.client) {
      throw new Error("Transaction context not initialized");
    }
    return this.#state.client;
  }

  get network(): string {
    if (!this.#state.network) {
      throw new Error("Transaction context not initialized");
    }
    return this.#state.network;
  }

  get currentAccount(): string | null {
    return this.#state.currentAccount;
  }

  get supportedIntents(): string[] {
    return this.#state.supportedIntents;
  }

  get chain(): `sui:${string}` {
    return `sui:${this.network}`;
  }
}

export const transactionContext = new TransactionContextManager();
