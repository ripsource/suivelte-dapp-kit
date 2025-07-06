import type {
  WalletAccount,
  WalletWithRequiredFeatures,
} from "@mysten/wallet-standard";

type WalletConnectionStatus = "disconnected" | "connecting" | "connected";

interface WalletState {
  wallets: WalletWithRequiredFeatures[];
  accounts: readonly WalletAccount[];
  currentWallet: WalletWithRequiredFeatures | null;
  currentAccount: WalletAccount | null;
  connectionStatus: WalletConnectionStatus;
  lastConnectedWalletName: string | null;
  lastConnectedAccountAddress: string | null;
  supportedIntents: string[];
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
  });

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

  // Actions
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
    this.#state.lastConnectedWalletName = wallet.name;
    this.#state.lastConnectedAccountAddress = selectedAccount?.address || null;
  }

  setWalletDisconnected() {
    this.#state.currentWallet = null;
    this.#state.accounts = [];
    this.#state.currentAccount = null;
    this.#state.connectionStatus = "disconnected";
    this.#state.supportedIntents = [];
    this.#state.lastConnectedWalletName = null;
    this.#state.lastConnectedAccountAddress = null;
  }

  switchAccount(account: WalletAccount) {
    this.#state.currentAccount = account;
    this.#state.lastConnectedAccountAddress = account.address;
  }

  setWallets(wallets: WalletWithRequiredFeatures[]) {
    this.#state.wallets = wallets;
  }
}

// Create singleton instance
export const walletStore = new WalletStore();
