// src/lib/utils/transaction-context.svelte.ts
import type { SuiClient } from "@mysten/sui/client";
import { getSuiClientContext } from "../stores/sui-client.svelte.js";

/**
 * Transaction context wrapper that provides SuiClient context
 * to transaction actions without needing to pass it every time
 */
class TransactionContextManager {
  #suiClient: SuiClient | null = null;
  #network: string | null = null;

  /**
   * Initialize with the current SuiClient context
   * Call this from component initialization
   */
  initialize() {
    const context = getSuiClientContext();
    this.#suiClient = context.client;
    this.#network = context.network;
  }

  /**
   * Get the current SuiClient
   */
  get client(): SuiClient {
    if (!this.#suiClient) {
      throw new Error(
        "Transaction context not initialized. Call initialize() first."
      );
    }
    return this.#suiClient;
  }

  /**
   * Get the current network
   */
  get network(): string {
    if (!this.#network) {
      throw new Error(
        "Transaction context not initialized. Call initialize() first."
      );
    }
    return this.#network;
  }

  /**
   * Check if context is initialized
   */
  get isInitialized(): boolean {
    return this.#suiClient !== null && this.#network !== null;
  }

  /**
   * Update context (useful for network switching)
   */
  update() {
    this.initialize();
  }
}

// Create singleton instance
export const transactionContext = new TransactionContextManager();
