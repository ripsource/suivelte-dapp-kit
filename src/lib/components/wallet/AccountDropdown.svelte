<!-- src/lib/components/wallet/AccountDropdown.svelte -->
<script lang="ts">
  import type { WalletAccount } from "@mysten/wallet-standard";
  import { walletStore } from "../../stores/wallet.svelte.js";
  import { walletActions } from "../../actions/wallet-actions.svelte.js";
  import { formatAddress } from "../../utils/format.js";

  interface Props {
    currentAccount: WalletAccount;
    onAccountChange?: (account: WalletAccount) => void;
    onDisconnect?: () => void;
  }

  let { currentAccount, onAccountChange, onDisconnect }: Props = $props();

  let isOpen = $state(false);
  let dropdownElement: HTMLDivElement;

  // Get all available accounts
  const accounts = $derived(walletStore.accounts);
  const currentWallet = $derived(walletStore.currentWallet);

  // Close dropdown when clicking outside
  $effect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
        isOpen = false;
      }
    }

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  });

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function handleAccountSelect(account: WalletAccount) {
    if (account.address !== currentAccount.address) {
      walletActions.switchAccount(account);
      onAccountChange?.(account);
    }
    isOpen = false;
  }

  function handleDisconnect() {
    walletActions.disconnectWallet();
    onDisconnect?.();
    isOpen = false;
  }

  function getAccountDisplayName(account: WalletAccount): string {
    return account.label || formatAddress(account.address);
  }
</script>

<div class="account-dropdown" bind:this={dropdownElement}>
  <button
    class="dropdown-trigger"
    onclick={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <div class="account-info">
      <span class="account-name">{getAccountDisplayName(currentAccount)}</span>
      {#if currentWallet}
        <span class="wallet-name">{currentWallet.name}</span>
      {/if}
    </div>

    <div class="dropdown-arrow" class:rotated={isOpen}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M4 6l4 4 4-4"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </button>

  {#if isOpen}
    <div class="dropdown-menu">
      <!-- Account List -->
      {#if accounts.length > 1}
        <div class="menu-section">
          <div class="section-title">Switch Account</div>
          {#each accounts as account (account.address)}
            <button
              class="menu-item account-item"
              class:active={account.address === currentAccount.address}
              onclick={() => handleAccountSelect(account)}
            >
              <div class="account-details">
                <span class="account-address"
                  >{getAccountDisplayName(account)}</span
                >
                <span class="address-hash"
                  >{formatAddress(account.address, 4, 4)}</span
                >
              </div>

              {#if account.address === currentAccount.address}
                <div class="check-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M13.5 4.5L6 12l-3.5-3.5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
              {/if}
            </button>
          {/each}
        </div>

        <div class="menu-divider"></div>
      {/if}

      <!-- Actions -->
      <div class="menu-section">
        <button class="menu-item action-item" onclick={handleDisconnect}>
          <div class="action-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 13l4-4-4-4M14 9H6"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          Disconnect
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .account-dropdown {
    position: relative;
    display: inline-block;
  }

  .dropdown-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 200px;
  }

  .dropdown-trigger:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .account-info {
    flex: 1;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .account-name {
    font-weight: 500;
    color: #1e293b;
    font-size: 0.875rem;
  }

  .wallet-name {
    font-size: 0.75rem;
    color: #64748b;
  }

  .dropdown-arrow {
    color: #94a3b8;
    transition: transform 0.2s;
  }

  .dropdown-arrow.rotated {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 280px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    overflow: hidden;
    animation: dropdown-in 0.15s ease-out;
  }

  @keyframes dropdown-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu-section {
    padding: 8px 0;
  }

  .section-title {
    padding: 8px 16px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .menu-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
    text-align: left;
  }

  .menu-item:hover {
    background: #f8fafc;
  }

  .account-item {
    justify-content: space-between;
  }

  .account-item.active {
    background: #eff6ff;
  }

  .account-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .account-address {
    font-weight: 500;
    color: #1e293b;
    font-size: 0.875rem;
  }

  .address-hash {
    font-size: 0.75rem;
    color: #64748b;
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
  }

  .check-icon {
    color: #059669;
  }

  .action-item {
    gap: 12px;
    color: #dc2626;
  }

  .action-item:hover {
    background: #fef2f2;
  }

  .action-icon {
    color: inherit;
  }

  .menu-divider {
    height: 1px;
    background: #e2e8f0;
    margin: 0 16px;
  }
</style>
