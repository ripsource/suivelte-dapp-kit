<!-- src/lib/components/wallet/WalletListItem.svelte -->
<script lang="ts">
  import type { WalletWithRequiredFeatures } from "@mysten/wallet-standard";

  interface Props {
    wallet: WalletWithRequiredFeatures;
    displayName: string;
    icon: string;
    isSelected?: boolean;
    onclick?: () => void;
  }

  let {
    wallet,
    displayName,
    icon,
    isSelected = false,
    onclick,
  }: Props = $props();
</script>

<button class="wallet-item" class:selected={isSelected} {onclick} type="button">
  <div class="wallet-icon">
    <img src={icon} alt={wallet.name} />
  </div>

  <div class="wallet-info">
    <span class="wallet-name">{displayName}</span>
    {#if wallet.accounts && wallet.accounts.length > 0}
      <span class="wallet-status">Connected</span>
    {/if}
  </div>

  <div class="wallet-arrow">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </div>
</button>

<style>
  .wallet-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 16px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .wallet-item:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .wallet-item.selected {
    background: #eff6ff;
    border-color: #3b82f6;
  }

  .wallet-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wallet-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .wallet-info {
    flex: 1;
    margin-left: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .wallet-name {
    font-weight: 500;
    color: #1e293b;
    font-size: 1rem;
  }

  .wallet-status {
    font-size: 0.875rem;
    color: #059669;
    font-weight: 500;
  }

  .wallet-arrow {
    flex-shrink: 0;
    color: #94a3b8;
    transition: transform 0.2s;
  }

  .wallet-item:hover .wallet-arrow {
    color: #64748b;
    transform: translateX(2px);
  }
</style>
