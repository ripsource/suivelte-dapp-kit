// src/lib/utils/auto-connect.svelte.ts
import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";
import { walletStore } from "../stores/wallet.svelte.js";
import { walletActions } from "../actions/wallet-actions.svelte.js";

interface AutoConnectConfig {
  enabled?: boolean;
  preferredWallets?: string[];
  walletFilter?: (wallet: WalletWithRequiredFeatures) => boolean;
  maxRetries?: number;
  retryDelay?: number;
}

type AutoConnectStatus =
  | "disabled"
  | "idle"
  | "attempting"
  | "success"
  | "failed";

class AutoConnectManager {
  #config: Required<AutoConnectConfig> = {
    enabled: false,
    preferredWallets: [],
    walletFilter: () => true,
    maxRetries: 3,
    retryDelay: 1000,
  };

  #status = $state<AutoConnectStatus>("disabled");
  #error: Error | null = $state(null);
  #retryCount = 0;
  #isInitialized = false;

  get status() {
    return this.#status;
  }

  get error() {
    return this.#error;
  }

  get isAttempting() {
    return this.#status === "attempting";
  }

  get hasSucceeded() {
    return this.#status === "success";
  }

  get hasFailed() {
    return this.#status === "failed";
  }

  configure(config: AutoConnectConfig) {
    this.#config = { ...this.#config, ...config };

    if (config.enabled !== undefined) {
      walletStore.enableAutoConnect(config.enabled);
      this.#status = config.enabled ? "idle" : "disabled";
    }

    // Update wallet list with new filters
    if (config.preferredWallets || config.walletFilter) {
      walletStore.updateWallets(
        this.#config.preferredWallets,
        this.#config.walletFilter
      );
    }
  }

  async initialize() {
    if (this.#isInitialized) return;
    this.#isInitialized = true;

    if (!this.#config.enabled) {
      this.#status = "disabled";
      return;
    }

    // Wait for DOM to be ready in browser environment
    if (typeof window !== "undefined") {
      if (document.readyState === "loading") {
        await new Promise((resolve) => {
          document.addEventListener("DOMContentLoaded", resolve, {
            once: true,
          });
        });
      }

      // Small delay to let wallet extensions load
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    await this.#attemptAutoConnect();
  }

  async #attemptAutoConnect() {
    if (walletStore.isConnected || walletStore.autoConnectAttempted) {
      this.#status = walletStore.isConnected ? "success" : "failed";
      return;
    }

    this.#status = "attempting";
    this.#error = null;

    try {
      const success = await walletStore.attemptAutoConnect();

      if (success) {
        this.#status = "success";
        this.#retryCount = 0;
      } else {
        await this.#handleFailure(new Error("Auto-connect failed"));
      }
    } catch (error) {
      await this.#handleFailure(error as Error);
    }
  }

  async #handleFailure(error: Error) {
    this.#error = error;
    this.#retryCount++;

    if (this.#retryCount < this.#config.maxRetries) {
      // Retry with exponential backoff
      const delay = this.#config.retryDelay * Math.pow(2, this.#retryCount - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      await this.#attemptAutoConnect();
    } else {
      this.#status = "failed";
    }
  }

  reset() {
    this.#status = this.#config.enabled ? "idle" : "disabled";
    this.#error = null;
    this.#retryCount = 0;
    // Reset the store's auto-connect attempted flag
    walletStore.resetAutoConnectAttempted();
  }

  async retry() {
    if (this.#status === "attempting") return;

    this.#retryCount = 0;
    await this.#attemptAutoConnect();
  }
}

// Create singleton instance
export const autoConnectManager = new AutoConnectManager();
