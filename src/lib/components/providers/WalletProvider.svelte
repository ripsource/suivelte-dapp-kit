<!-- src/lib/components/providers/WalletProvider.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";
  import { walletStore } from "../../stores/wallet.svelte.js";
  import { autoConnectManager } from "../../utils/auto-connect.svelte.js";
  import { defaultWalletFilter } from "../../utils/wallet-utils.js";

  interface Props {
    autoConnect?: boolean;
    preferredWallets?: string[];
    walletFilter?: (wallet: WalletWithRequiredFeatures) => boolean;
    maxRetries?: number;
    retryDelay?: number;
    children: any;
  }

  let {
    autoConnect = false,
    preferredWallets = [],
    walletFilter = defaultWalletFilter,
    maxRetries = 3,
    retryDelay = 1000,
    children,
  }: Props = $props();

  let isInitialized = $state(false);

  onMount(async () => {
    // Configure auto-connect
    autoConnectManager.configure({
      enabled: autoConnect,
      preferredWallets,
      walletFilter,
      maxRetries,
      retryDelay,
    });

    // Initialize auto-connect
    await autoConnectManager.initialize();
    isInitialized = true;
  });

  onDestroy(() => {
    walletStore.destroy();
  });

  // Watch for prop changes and update configuration
  $effect(() => {
    if (isInitialized) {
      autoConnectManager.configure({
        enabled: autoConnect,
        preferredWallets,
        walletFilter,
        maxRetries,
        retryDelay,
      });
    }
  });
</script>

<!-- Debug info during development -->
{#if import.meta.env.DEV}
  <div class="wallet-provider-debug">
    <details>
      <summary>Wallet Provider Debug</summary>
      <div>
        <p>
          <strong>Auto-connect:</strong>
          {autoConnect ? "enabled" : "disabled"}
        </p>
        <p><strong>Status:</strong> {autoConnectManager.status}</p>
        <p><strong>Connection:</strong> {walletStore.connectionStatus}</p>
        <p><strong>Wallets found:</strong> {walletStore.wallets.length}</p>
        {#if autoConnectManager.error}
          <p><strong>Error:</strong> {autoConnectManager.error.message}</p>
        {/if}
        {#if autoConnectManager.hasFailed}
          <button onclick={() => autoConnectManager.retry()}>
            Retry Auto-connect
          </button>
        {/if}
      </div>
    </details>
  </div>
{/if}

{@render children()}

<style>
  .wallet-provider-debug {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    z-index: 10000;
  }

  .wallet-provider-debug details {
    cursor: pointer;
  }

  .wallet-provider-debug summary {
    margin-bottom: 8px;
  }

  .wallet-provider-debug p {
    margin: 4px 0;
  }

  .wallet-provider-debug button {
    margin-top: 8px;
    padding: 4px 8px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
  }
</style>
