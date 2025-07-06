// src/lib/actions/transaction-actions.svelte.ts
import { Transaction } from "@mysten/sui/transactions";
import { toBase64 } from "@mysten/sui/utils";
import type {
  SuiSignTransactionInput,
  SuiSignAndExecuteTransactionInput,
  SuiSignPersonalMessageInput,
  WalletAccount,
} from "@mysten/wallet-standard";
import { signTransaction } from "@mysten/wallet-standard";
import { walletStore } from "../stores/wallet.svelte";
import { getSuiClientContext } from "../stores/sui-client.svelte";
import { transactionContext } from "../utils/transaction-context.svelte";

// Types for transaction actions
interface SignTransactionArgs {
  transaction: Transaction | string;
  account?: WalletAccount;
  chain?: string;
}

interface SignAndExecuteTransactionArgs extends SignTransactionArgs {
  options?: {
    showRawEffects?: boolean;
    showEffects?: boolean;
    showEvents?: boolean;
    showObjectChanges?: boolean;
    showBalanceChanges?: boolean;
  };
}

interface SignPersonalMessageArgs {
  message: Uint8Array;
  account?: WalletAccount;
  chain?: string;
}

interface TransactionResult {
  digest: string;
  effects?: any;
  rawEffects?: number[];
  events?: any[] | null;
  objectChanges?: any[] | null;
  balanceChanges?: any[] | null;
}

interface SignedTransaction {
  bytes: string;
  signature: string;
  reportTransactionEffects: (effects: string) => void;
}

interface TransactionState {
  isSigningTransaction: boolean;
  isExecutingTransaction: boolean;
  isSigningMessage: boolean;
  signTransactionError: Error | null;
  executeTransactionError: Error | null;
  signMessageError: Error | null;
}

class TransactionActionsStore {
  #state = $state<TransactionState>({
    isSigningTransaction: false,
    isExecutingTransaction: false,
    isSigningMessage: false,
    signTransactionError: null,
    executeTransactionError: null,
    signMessageError: null,
  });

  // Getters
  get isSigningTransaction() {
    return this.#state.isSigningTransaction;
  }
  get isExecutingTransaction() {
    return this.#state.isExecutingTransaction;
  }
  get isSigningMessage() {
    return this.#state.isSigningMessage;
  }
  get signTransactionError() {
    return this.#state.signTransactionError;
  }
  get executeTransactionError() {
    return this.#state.executeTransactionError;
  }
  get signMessageError() {
    return this.#state.signMessageError;
  }
  get isAnyTransactionPending() {
    return (
      this.#state.isSigningTransaction || this.#state.isExecutingTransaction
    );
  }

  /**
   * Sign a transaction without executing it
   */
  async signTransaction({
    transaction,
    account,
    chain,
  }: SignTransactionArgs): Promise<SignedTransaction> {
    const currentWallet = walletStore.currentWallet;
    const currentAccount = account || walletStore.currentAccount;
    const suiContext = transactionContext;
    // const suiContext = getSuiClientContext();

    if (!currentWallet) {
      throw new Error("No wallet is connected.");
    }

    if (!currentAccount) {
      throw new Error("No account is selected to sign the transaction with.");
    }

    if (
      !currentWallet.features["sui:signTransaction"] &&
      !currentWallet.features["sui:signTransactionBlock"]
    ) {
      throw new Error(
        "This wallet doesn't support transaction signing features."
      );
    }

    try {
      this.#state.isSigningTransaction = true;
      this.#state.signTransactionError = null;

      const activeChain = (chain ??
        `sui:${suiContext.network}`) as `${string}:${string}`;

      const { bytes, signature } = await signTransaction(currentWallet, {
        transaction: {
          toJSON: async () => {
            return typeof transaction === "string"
              ? transaction
              : await transaction.toJSON({
                  supportedIntents: walletStore.supportedIntents || [],
                  client: suiContext.client,
                });
          },
        },
        account: currentAccount,
        chain: activeChain,
      });

      return {
        bytes,
        signature,
        reportTransactionEffects: (effects: string) => {
          this.#reportTransactionEffects({
            effects,
            account: currentAccount,
            chain: activeChain,
          });
        },
      };
    } catch (error) {
      this.#state.signTransactionError = error as Error;
      throw error;
    } finally {
      this.#state.isSigningTransaction = false;
    }
  }

  /**
   * Sign and execute a transaction in one step
   */
  async signAndExecuteTransaction({
    transaction,
    account,
    chain,
    options = {},
  }: SignAndExecuteTransactionArgs): Promise<TransactionResult> {
    const currentWallet = walletStore.currentWallet;
    const currentAccount = account || walletStore.currentAccount;
    const suiContext = transactionContext;

    if (!currentWallet) {
      throw new Error("No wallet is connected.");
    }

    if (!currentAccount) {
      throw new Error(
        "No account is selected to execute the transaction with."
      );
    }

    if (
      !currentWallet.features["sui:signTransaction"] &&
      !currentWallet.features["sui:signTransactionBlock"]
    ) {
      throw new Error(
        "This wallet doesn't support transaction signing features."
      );
    }

    try {
      this.#state.isExecutingTransaction = true;
      this.#state.executeTransactionError = null;

      const activeChain = (chain ??
        `sui:${suiContext.network}`) as `${string}:${string}`;

      // First sign the transaction
      const { bytes, signature } = await signTransaction(currentWallet, {
        transaction: {
          toJSON: async () => {
            return typeof transaction === "string"
              ? transaction
              : await transaction.toJSON({
                  supportedIntents: walletStore.supportedIntents || [],
                  client: suiContext.client,
                });
          },
        },
        account: currentAccount,
        chain: activeChain,
      });

      // Then execute it
      const result = await suiContext.client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          ...options,
        },
      });

      // Report effects back to wallet if supported
      if (result.rawEffects) {
        const effects = toBase64(new Uint8Array(result.rawEffects));
        this.#reportTransactionEffects({
          effects,
          account: currentAccount,
          chain: activeChain,
        });
      }

      return {
        digest: result.digest,
        effects: result.effects,
        rawEffects: result.rawEffects,
        events: result.events,
        objectChanges: result.objectChanges,
        balanceChanges: result.balanceChanges,
      };
    } catch (error) {
      this.#state.executeTransactionError = error as Error;
      throw error;
    } finally {
      this.#state.isExecutingTransaction = false;
    }
  }

  /**
   * Sign a personal message
   */
  async signPersonalMessage({
    message,
    account,
    chain,
  }: SignPersonalMessageArgs): Promise<{ bytes: string; signature: string }> {
    const currentWallet = walletStore.currentWallet;
    const currentAccount = account || walletStore.currentAccount;
    const suiContext = transactionContext;
    const network = suiContext.network;

    if (!currentWallet) {
      throw new Error("No wallet is connected.");
    }

    if (!currentAccount) {
      throw new Error("No account is selected to sign the message with.");
    }

    try {
      this.#state.isSigningMessage = true;
      this.#state.signMessageError = null;

      const activeChain = (chain ??
        `sui:${suiContext.network}`) as `${string}:${string}`;

      // Try modern signPersonalMessage first
      const signPersonalMessageFeature =
        currentWallet.features["sui:signPersonalMessage"];
      if (signPersonalMessageFeature) {
        return await signPersonalMessageFeature.signPersonalMessage({
          message,
          account: currentAccount,
          chain: activeChain,
        });
      }

      // Fallback to legacy signMessage
      const signMessageFeature = currentWallet.features["sui:signMessage"];
      if (signMessageFeature) {
        console.warn(
          "This wallet doesn't support signPersonalMessage, falling back to signMessage"
        );
        const { messageBytes, signature } =
          await signMessageFeature.signMessage({
            message,
            account: currentAccount,
          });
        return { bytes: messageBytes, signature };
      }

      throw new Error("This wallet doesn't support message signing features.");
    } catch (error) {
      this.#state.signMessageError = error as Error;
      throw error;
    } finally {
      this.#state.isSigningMessage = false;
    }
  }

  /**
   * Execute a pre-signed transaction
   */
  async executeSignedTransaction(
    bytes: string,
    signature: string,
    options = {}
  ): Promise<TransactionResult> {
    const suiContext = getSuiClientContext();

    try {
      this.#state.isExecutingTransaction = true;
      this.#state.executeTransactionError = null;

      const result = await suiContext.client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          ...options,
        },
      });

      return {
        digest: result.digest,
        effects: result.effects,
        rawEffects: result.rawEffects,
        events: result.events,
        objectChanges: result.objectChanges,
        balanceChanges: result.balanceChanges,
      };
    } catch (error) {
      this.#state.executeTransactionError = error as Error;
      throw error;
    } finally {
      this.#state.isExecutingTransaction = false;
    }
  }

  /**
   * Report transaction effects back to the wallet
   */
  async #reportTransactionEffects({
    effects,
    account,
    chain,
  }: {
    effects: string;
    account: WalletAccount;
    chain: string;
  }) {
    const currentWallet = walletStore.currentWallet;
    if (!currentWallet) return;
    const suiContext = getSuiClientContext();
    const activeChain = (chain ??
      `sui:${suiContext.network}`) as `${string}:${string}`;

    try {
      const reportFeature =
        currentWallet.features["sui:reportTransactionEffects"];
      if (reportFeature) {
        await reportFeature.reportTransactionEffects({
          effects,
          account,
          chain: activeChain,
        });
      }
    } catch (error) {
      console.warn("Failed to report transaction effects:", error);
    }
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.#state.signTransactionError = null;
    this.#state.executeTransactionError = null;
    this.#state.signMessageError = null;
  }
}

// Create singleton instance
export const transactionActions = new TransactionActionsStore();
