<!-- src/lib/components/wallet/WalletModal.svelte -->
<script lang="ts">
  import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";
  import { walletStore } from "../../stores/wallet.svelte.js";
  import { walletActions } from "../../actions/wallet-actions.svelte.js";
  import {
    getRegisteredWallets,
    getWalletIcon,
    getWalletDisplayName,
    defaultWalletFilter,
  } from "../../utils/wallet-utils.js";
  import WalletListItem from "./WalletListItem.svelte";

  interface Props {
    show: boolean;
    onClose?: () => void;
    walletFilter?: (wallet: WalletWithRequiredFeatures) => boolean;
    preferredWallets?: string[];
  }

  let {
    show = $bindable(),
    onClose,
    walletFilter = defaultWalletFilter,
    preferredWallets = [],
  }: Props = $props();

  let modalElement: HTMLDialogElement;
  let selectedWallet: WalletWithRequiredFeatures | null = $state(null);
  let currentView: "wallets" | "connecting" | "error" = $state("wallets");
  let errorMessage = $state("");

  // Get available wallets
  const availableWallets = $derived(
    getRegisteredWallets(preferredWallets, walletFilter)
  );
  const isConnecting = $derived(walletActions.isConnecting);
  const connectionError = $derived(walletActions.error);

  // Watch for connection changes
  $effect(() => {
    if (walletStore.isConnected && show) {
      handleClose();
    }
  });

  // Watch for connection errors
  $effect(() => {
    if (connectionError) {
      currentView = "error";
      errorMessage = connectionError.message;
    }
  });

  // Handle modal show/hide
  $effect(() => {
    if (show && modalElement) {
      modalElement.showModal();
      document.body.style.overflow = "hidden";
    } else if (modalElement) {
      modalElement.close();
      document.body.style.overflow = "";
    }
  });

  function handleClose() {
    show = false;
    selectedWallet = null;
    currentView = "wallets";
    errorMessage = "";
    onClose?.();
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === modalElement) {
      handleClose();
    }
  }

  async function handleWalletSelect(wallet: WalletWithRequiredFeatures) {
    selectedWallet = wallet;
    currentView = "connecting";

    try {
      await walletActions.connectWallet({ wallet });
      // Modal will close automatically via effect when connected
    } catch (error) {
      currentView = "error";
      errorMessage =
        error instanceof Error ? error.message : "Connection failed";
    }
  }

  function handleRetry() {
    currentView = "wallets";
    errorMessage = "";
  }

  function handleInstallWallet() {
    // Open Sui wallet installation page
    window.open(
      "https://chrome.google.com/webstore/detail/sui-wallet/opcgpfmipidbgpenhmajoajpbobppdil",
      "_blank"
    );
  }
</script>

<dialog
  bind:this={modalElement}
  class="wallet-modal"
  onclick={handleBackdropClick}
>
  <div class="modal-content">
    <!-- Header -->
    <header class="modal-header">
      <h2>
        {#if currentView === "connecting"}
          Connecting to {selectedWallet?.name}
        {:else if currentView === "error"}
          Connection Failed
        {:else}
          Connect Wallet
        {/if}
      </h2>

      <button class="close-button" onclick={handleClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </header>

    <!-- Content -->
    <div class="modal-body">
      {#if currentView === "wallets"}
        {#if availableWallets.length > 0}
          <div class="wallet-list">
            {#each availableWallets as wallet (wallet.name)}
              <WalletListItem
                {wallet}
                displayName={getWalletDisplayName(wallet, availableWallets)}
                icon={getWalletIcon(wallet)}
                onclick={() => handleWalletSelect(wallet)}
              />
            {/each}
          </div>
        {:else}
          <div class="no-wallets">
            <div class="no-wallets-content">
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
                class="no-wallets-icon"
              >
                <rect
                  x="12"
                  y="20"
                  width="40"
                  height="24"
                  rx="4"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                />
                <circle cx="44" cy="32" r="2" fill="currentColor" />
                <path
                  d="M20 28h8M20 36h12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>

              <h3>No Wallets Found</h3>
              <p>
                To connect to Sui, you'll need to install a compatible wallet
                extension.
              </p>

              <button class="install-button" onclick={handleInstallWallet}>
                Install Sui Wallet
              </button>
            </div>
          </div>
        {/if}
      {:else if currentView === "connecting"}
        <div class="connecting-view">
          <div class="connecting-content">
            {#if selectedWallet}
              <img
                src={getWalletIcon(selectedWallet)}
                alt={selectedWallet.name}
                class="connecting-icon"
              />
            {/if}

            <div class="spinner"></div>
            <p>Opening {selectedWallet?.name}...</p>
            <p class="connecting-subtitle">
              Confirm the connection in your wallet
            </p>
          </div>
        </div>
      {:else if currentView === "error"}
        <div class="error-view">
          <div class="error-content">
            <div class="error-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <path
                  d="M16 16l16 16M32 16L16 32"
                  stroke="currentColor"
                  stroke-width="2"
                />
              </svg>
            </div>

            <h3>Connection Failed</h3>
            <p class="error-message">{errorMessage}</p>

            <div class="error-actions">
              <button class="retry-button" onclick={handleRetry}>
                Try Again
              </button>
              <button class="cancel-button" onclick={handleClose}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</dialog>

<style>
  .wallet-modal {
    padding: 0;
    margin: auto;
    border: none;
    border-radius: 16px;
    max-width: 480px;
    width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    background: white;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .wallet-modal::backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px 24px 0;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 24px;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .close-button {
    padding: 8px;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    color: #64748b;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .modal-body {
    flex: 1;
    padding: 0 24px 24px;
    overflow-y: auto;
  }

  .wallet-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .no-wallets {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .no-wallets-content {
    text-align: center;
    max-width: 280px;
  }

  .no-wallets-icon {
    color: #94a3b8;
    margin-bottom: 16px;
  }

  .no-wallets-content h3 {
    margin: 0 0 8px;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
  }

  .no-wallets-content p {
    margin: 0 0 24px;
    color: #64748b;
    line-height: 1.5;
  }

  .install-button {
    padding: 12px 24px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .install-button:hover {
    background: #2563eb;
  }

  .connecting-view,
  .error-view {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  .connecting-content,
  .error-content {
    text-align: center;
    max-width: 280px;
  }

  .connecting-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    margin-bottom: 16px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f1f5f9;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 16px auto;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .connecting-content p {
    margin: 8px 0;
    color: #1e293b;
    font-weight: 500;
  }

  .connecting-subtitle {
    color: #64748b !important;
    font-weight: 400 !important;
    font-size: 0.875rem;
  }

  .error-icon {
    color: #ef4444;
    margin-bottom: 16px;
  }

  .error-content h3 {
    margin: 0 0 8px;
    color: #1e293b;
    font-weight: 600;
  }

  .error-message {
    margin: 0 0 24px;
    color: #64748b;
    line-height: 1.5;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .retry-button,
  .cancel-button {
    padding: 10px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .retry-button {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .retry-button:hover {
    background: #2563eb;
    border-color: #2563eb;
  }

  .cancel-button {
    background: white;
    color: #64748b;
  }

  .cancel-button:hover {
    background: #f8fafc;
    color: #1e293b;
  }
</style>
