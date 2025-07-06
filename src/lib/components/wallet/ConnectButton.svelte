<!-- src/lib/components/wallet/ConnectButton.svelte -->
<script lang="ts">
  import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";
  import { walletStore } from "../../stores/wallet.svelte.js";
  import { walletActions } from "../../actions/wallet-actions.svelte.js";
  import { defaultWalletFilter } from "../../utils/wallet-utils.js";
  import WalletModal from "./WalletModal.svelte";
  import AccountDropdown from "./AccountDropdown.svelte";

  interface Props {
    connectText?: string;
    class?: string;
    walletFilter?: (wallet: WalletWithRequiredFeatures) => boolean;
    preferredWallets?: string[];
    variant?: "primary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
  }

  let {
    connectText = "Connect Wallet",
    class: className = "",
    walletFilter = defaultWalletFilter,
    preferredWallets = [],
    variant = "primary",
    size = "md",
    ...props
  }: Props = $props();

  let showModal = $state(false);

  // Reactive values from store
  const currentAccount = $derived(walletStore.currentAccount);
  const isConnected = $derived(walletStore.isConnected);
  const isConnecting = $derived(walletActions.isConnecting);

  function handleConnect() {
    showModal = true;
  }

  function handleModalClose() {
    showModal = false;
  }

  // Compute button classes based on variant and size
  const buttonClasses = $derived(() => {
    const base = "connect-button";
    const variantClass = `variant-${variant}`;
    const sizeClass = `size-${size}`;
    const stateClass = isConnecting ? "loading" : "";

    return [base, variantClass, sizeClass, stateClass, className]
      .filter(Boolean)
      .join(" ");
  });
</script>

{#if currentAccount}
  <!-- Show account dropdown when connected -->
  <AccountDropdown {currentAccount} />
{:else}
  <!-- Show connect button when not connected -->
  <button
    class={buttonClasses}
    onclick={handleConnect}
    disabled={isConnecting}
    {...props}
  >
    {#if isConnecting}
      <div class="spinner"></div>
      Connecting...
    {:else}
      <div class="wallet-icon">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M4 6h12a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
          <circle cx="14" cy="10" r="1" fill="currentColor" />
          <path
            d="M6 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </div>
      {connectText}
    {/if}
  </button>
{/if}

<!-- Wallet Selection Modal -->
{#if showModal}
  <WalletModal
    bind:show={showModal}
    onClose={handleModalClose}
    {walletFilter}
    {preferredWallets}
  />
{/if}

<style>
  .connect-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 500;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
    text-decoration: none;
    white-space: nowrap;
  }

  .connect-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Variants */
  .variant-primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .variant-primary:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
  }

  .variant-outline {
    background: white;
    color: #3b82f6;
    border-color: #3b82f6;
  }

  .variant-outline:hover:not(:disabled) {
    background: #eff6ff;
    transform: translateY(-1px);
  }

  .variant-ghost {
    background: transparent;
    color: #3b82f6;
    border-color: transparent;
  }

  .variant-ghost:hover:not(:disabled) {
    background: #eff6ff;
  }

  /* Sizes */
  .size-sm {
    padding: 8px 16px;
    font-size: 0.875rem;
  }

  .size-md {
    padding: 12px 20px;
    font-size: 1rem;
  }

  .size-lg {
    padding: 16px 24px;
    font-size: 1.125rem;
  }

  /* Loading state */
  .loading {
    position: relative;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .wallet-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Focus styles */
  .connect-button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .variant-outline {
      background: #1e293b;
      color: #60a5fa;
      border-color: #60a5fa;
    }

    .variant-outline:hover:not(:disabled) {
      background: #334155;
    }

    .variant-ghost:hover:not(:disabled) {
      background: #334155;
    }
  }
</style>
