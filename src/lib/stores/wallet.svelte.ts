// src/lib/stores/wallet.svelte.ts
import type {
  WalletAccount,
  WalletWithRequiredFeatures,
} from "@mysten/wallet-standard";
import { getWallets } from "@mysten/wallet-standard";
import {
  getRegisteredWallets,
  getWalletUniqueIdentifier,
} from "../utils/wallet-utils.js";

type WalletConnectionStatus = "disconnected" | "connecting" | "connected";

interface StoredWalletInfo {
  walletName: string;
  accountAddress: string;
  timestamp: number;
}

interface WalletState {
  wallets: WalletWithRequiredFeatures[];
  accounts: readonly WalletAccount[];
  currentWallet: WalletWithRequiredFeatures | null;
  currentAccount: WalletAccount | null;
  connectionStatus: WalletConnectionStatus;
  lastConnectedWalletName: string | null;
  lastConnectedAccountAddress: string | null;
  supportedIntents: string[];
  autoConnectEnabled: boolean;
  autoConnectAttempted: boolean;
  isConnected: boolean;
}

class WalletStore {
  #state = $state<WalletState>({
    wallets: [],
    accounts: [],
    currentWallet: null,
    currentAccount: null,
    connectionStatus: "disconnected",
    lastConnectedWalletName: null,
    lastConnectedAccountAddress: null,
    supportedIntents: [],
    autoConnectEnabled: false,
    autoConnectAttempted: false,
    isConnected: false,
  });

  #storage: Storage | null = null;
  #storageKey = "sui-svelte-kit:wallet-connection";
  #walletsUnsubscribe: (() => void) | null = null;

  constructor() {
    // Initialize storage if available
    if (typeof window !== "undefined" && window.localStorage) {
      this.#storage = window.localStorage;
    }

    // Set up wallet registration listeners
    this.#setupWalletListeners();

    // Load initial wallet list
    this.#updateWalletList();
  }

  // Reactive getters
  get wallets() {
    return this.#state.wallets;
  }
  get accounts() {
    return this.#state.accounts;
  }
  get currentWallet() {
    return this.#state.currentWallet;
  }
  get currentAccount() {
    return this.#state.currentAccount;
  }
  get connectionStatus() {
    return this.#state.connectionStatus;
  }
  get isConnected() {
    return this.#state.connectionStatus === "connected";
  }
  get isConnecting() {
    return this.#state.connectionStatus === "connecting";
  }
  get isDisconnected() {
    return this.#state.connectionStatus === "disconnected";
  }
  get autoConnectEnabled() {
    return this.#state.autoConnectEnabled;
  }
  get autoConnectAttempted() {
    return this.#state.autoConnectAttempted;
  }

  get lastConnectedWalletName() {
    return this.#state.lastConnectedWalletName;
  }

  get lastConnectedAccountAddress() {
    return this.#state.lastConnectedAccountAddress;
  }

  get supportedIntents() {
    return this.#state.supportedIntents;
  }

  // Configuration
  enableAutoConnect(enabled: boolean = true) {
    this.#state.autoConnectEnabled = enabled;
  }

  resetAutoConnectAttempted() {
    this.#state.autoConnectAttempted = false;
  }

  // Storage methods
  #saveConnectionInfo(walletName: string, accountAddress: string) {
    if (!this.#storage) return;

    try {
      const info: StoredWalletInfo = {
        walletName,
        accountAddress,
        timestamp: Date.now(),
      };
      this.#storage.setItem(this.#storageKey, JSON.stringify(info));
    } catch (error) {
      console.warn("Failed to save wallet connection info:", error);
    }
  }

  #loadConnectionInfo(): StoredWalletInfo | null {
    if (!this.#storage) return null;

    try {
      const stored = this.#storage.getItem(this.#storageKey);
      if (!stored) return null;

      const info: StoredWalletInfo = JSON.parse(stored);

      // Check if stored data is not too old (7 days)
      if (Date.now() - info.timestamp > 7 * 24 * 60 * 60 * 1000) {
        this.#clearConnectionInfo();
        return null;
      }

      return info;
    } catch (error) {
      console.warn("Failed to load wallet connection info:", error);
      return null;
    }
  }

  #clearConnectionInfo() {
    if (!this.#storage) return;

    try {
      this.#storage.removeItem(this.#storageKey);
    } catch (error) {
      console.warn("Failed to clear wallet connection info:", error);
    }
  }

  // Wallet list management
  #setupWalletListeners() {
    const walletsApi = getWallets();

    const unsubscribeRegister = walletsApi.on("register", () => {
      this.#updateWalletList();
    });

    const unsubscribeUnregister = walletsApi.on(
      "unregister",
      (unregisteredWallet) => {
        // If the currently connected wallet was unregistered, disconnect
        if (unregisteredWallet === this.#state.currentWallet) {
          this.setWalletDisconnected();
        }
        this.#updateWalletList();
      }
    );

    this.#walletsUnsubscribe = () => {
      unsubscribeRegister();
      unsubscribeUnregister();
    };
  }

  #updateWalletList(
    preferredWallets: string[] = [],
    walletFilter?: (wallet: WalletWithRequiredFeatures) => boolean
  ) {
    const wallets = getRegisteredWallets(preferredWallets, walletFilter);
    this.#state.wallets = wallets;
  }

  // Auto-connect functionality
  async attemptAutoConnect(): Promise<boolean> {
    if (!this.#state.autoConnectEnabled || this.#state.autoConnectAttempted) {
      this.#state.autoConnectAttempted = true;
      return false;
    }

    this.#state.autoConnectAttempted = true;

    const connectionInfo = this.#loadConnectionInfo();
    if (!connectionInfo || this.#state.isConnected) {
      return false;
    }

    const wallet = this.#state.wallets.find(
      (w) => getWalletUniqueIdentifier(w) === connectionInfo.walletName
    );

    if (!wallet) {
      this.#clearConnectionInfo();
      return false;
    }

    try {
      this.#state.connectionStatus = "connecting";

      const connectResult = await wallet.features["standard:connect"].connect({
        silent: true,
      });

      const suiAccounts = connectResult.accounts.filter((account) =>
        account.chains.some((chain) => chain.split(":")[0] === "sui")
      );

      const targetAccount = suiAccounts.find(
        (account) => account.address === connectionInfo.accountAddress
      );

      const selectedAccount = targetAccount || suiAccounts[0] || null;

      if (selectedAccount) {
        this.setWalletConnected(
          wallet,
          suiAccounts,
          selectedAccount,
          connectResult.supportedIntents || []
        );
        return true;
      } else {
        this.#state.connectionStatus = "disconnected";
        this.#clearConnectionInfo();
        return false;
      }
    } catch (error) {
      console.warn("Auto-connect failed:", error);
      this.#state.connectionStatus = "disconnected";
      this.#clearConnectionInfo();
      return false;
    }
  }

  // Connection management
  setConnectionStatus(status: WalletConnectionStatus) {
    this.#state.connectionStatus = status;
  }

  setWalletConnected(
    wallet: WalletWithRequiredFeatures,
    accounts: readonly WalletAccount[],
    selectedAccount: WalletAccount | null,
    supportedIntents: string[] = []
  ) {
    this.#state.currentWallet = wallet;
    this.#state.accounts = accounts;
    this.#state.currentAccount = selectedAccount;
    this.#state.connectionStatus = "connected";
    this.#state.supportedIntents = supportedIntents;

    const walletName = getWalletUniqueIdentifier(wallet);
    this.#state.lastConnectedWalletName = walletName || null;
    this.#state.lastConnectedAccountAddress = selectedAccount?.address || null;

    // Save to persistent storage
    if (walletName && selectedAccount) {
      this.#saveConnectionInfo(walletName, selectedAccount.address);
    }

    // Set up wallet event listeners for account changes
    this.#setupWalletEventListeners(wallet);
  }

  setWalletDisconnected() {
    this.#state.currentWallet = null;
    this.#state.accounts = [];
    this.#state.currentAccount = null;
    this.#state.connectionStatus = "disconnected";
    this.#state.supportedIntents = [];
    this.#state.lastConnectedWalletName = null;
    this.#state.lastConnectedAccountAddress = null;

    // Clear from persistent storage
    this.#clearConnectionInfo();
  }

  switchAccount(account: WalletAccount) {
    this.#state.currentAccount = account;
    this.#state.lastConnectedAccountAddress = account.address;

    // Update storage with new account
    const walletName = getWalletUniqueIdentifier(this.#state.currentWallet);
    if (walletName) {
      this.#saveConnectionInfo(walletName, account.address);
    }
  }

  updateWalletAccounts(accounts: readonly WalletAccount[]) {
    this.#state.accounts = accounts;

    // Check if current account still exists, if not switch to first available
    const currentAddress = this.#state.currentAccount?.address;
    const stillExists = accounts.find((acc) => acc.address === currentAddress);

    if (!stillExists && accounts.length > 0) {
      this.switchAccount(accounts[0]);
    } else if (!stillExists) {
      this.#state.currentAccount = null;
    }
  }

  // Wallet event handling
  #setupWalletEventListeners(wallet: WalletWithRequiredFeatures) {
    return wallet.features["standard:events"]?.on("change", ({ accounts }) => {
      if (accounts) {
        this.updateWalletAccounts(accounts);
      }
    });
  }

  // Update wallet list with filters
  updateWallets(
    preferredWallets: string[] = [],
    walletFilter?: (wallet: WalletWithRequiredFeatures) => boolean
  ) {
    this.#updateWalletList(preferredWallets, walletFilter);
  }

  // Cleanup
  destroy() {
    this.#walletsUnsubscribe?.();
  }

  // Reset auto-connect state (for development/testing)
  resetAutoConnectAttempt() {
    this.#state.autoConnectAttempted = false;
  }
}

// Create singleton instance
export const walletStore = new WalletStore();
