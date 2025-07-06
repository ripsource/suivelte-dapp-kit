// src/lib/utils/wallet-utils.ts
import type {
  Wallet,
  WalletWithRequiredFeatures,
} from "@mysten/wallet-standard";
import {
  getWallets,
  isWalletWithRequiredFeatureSet,
} from "@mysten/wallet-standard";

/**
 * Get a unique identifier for a wallet (prefers id over name)
 */
export function getWalletUniqueIdentifier(
  wallet?: Wallet | null
): string | undefined {
  return wallet?.id ?? wallet?.name;
}

/**
 * Get all registered wallets, filtered and sorted by preference
 */
export function getRegisteredWallets(
  preferredWallets: string[] = [],
  walletFilter?: (wallet: WalletWithRequiredFeatures) => boolean
): WalletWithRequiredFeatures[] {
  const walletsApi = getWallets();
  const wallets = walletsApi.get();

  // Filter to wallets that meet requirements
  const suiWallets = wallets.filter(
    (wallet): wallet is WalletWithRequiredFeatures =>
      isWalletWithRequiredFeatureSet(wallet) &&
      (!walletFilter || walletFilter(wallet))
  );

  // Sort by preference
  const preferredSet = new Set(preferredWallets);
  const preferred = preferredWallets
    .map((name) =>
      suiWallets.find(
        (wallet) =>
          getWalletUniqueIdentifier(wallet) === name || wallet.name === name
      )
    )
    .filter(Boolean) as WalletWithRequiredFeatures[];

  const others = suiWallets.filter(
    (wallet) =>
      !preferredSet.has(getWalletUniqueIdentifier(wallet) || "") &&
      !preferredSet.has(wallet.name)
  );

  return [...preferred, ...others];
}

/**
 * Check if a wallet supports specific features
 */
export function walletSupportsFeatures(
  wallet: Wallet,
  features: string[]
): boolean {
  return features.every((feature) => feature in wallet.features);
}

/**
 * Get wallet icon as data URL or return default
 */
export function getWalletIcon(wallet: Wallet): string {
  if (wallet.icon && typeof wallet.icon === "string" && wallet.icon.trim()) {
    return wallet.icon;
  }

  // Default wallet icon (simple SVG)
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#f0f0f0"/>
      <rect x="8" y="12" width="16" height="8" rx="2" fill="#666"/>
      <circle cx="20" cy="16" r="1.5" fill="#f0f0f0"/>
    </svg>
  `)}`;
}

/**
 * Default wallet filter - requires signing capabilities
 */
export function defaultWalletFilter(
  wallet: WalletWithRequiredFeatures
): boolean {
  return walletSupportsFeatures(wallet, [
    "sui:signTransaction",
    "sui:signTransactionBlock",
  ]);
}

/**
 * Get display name for wallet (handles duplicates)
 */
export function getWalletDisplayName(
  wallet: Wallet,
  allWallets: Wallet[]
): string {
  const sameName = allWallets.filter((w) => w.name === wallet.name);

  if (sameName.length === 1) {
    return wallet.name;
  }

  // If multiple wallets have same name, add identifier
  const identifier = wallet.id || "unknown";
  return `${wallet.name} (${identifier.slice(0, 8)})`;
}

/**
 * Storage helpers for persisting wallet connection
 */
export const WalletStorage = {
  STORAGE_KEY: "sui-svelte-kit:wallet-connection",

  save(walletName: string, accountAddress: string) {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          walletName,
          accountAddress,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn("Failed to save wallet connection:", error);
    }
  },

  load(): { walletName: string; accountAddress: string } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Check if stored data is not too old (7 days)
      if (Date.now() - parsed.timestamp > 7 * 24 * 60 * 60 * 1000) {
        this.clear();
        return null;
      }

      return {
        walletName: parsed.walletName,
        accountAddress: parsed.accountAddress,
      };
    } catch (error) {
      console.warn("Failed to load wallet connection:", error);
      return null;
    }
  },

  clear() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear wallet connection:", error);
    }
  },
};
