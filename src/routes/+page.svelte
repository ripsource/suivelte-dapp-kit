<!-- Demo page for development -->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    setSuiClientContext,
    walletStore,
    ConnectButton,
    WalletModal,
    AccountDropdown,
    formatAddress,
    formatSuiAmount,
    formatTimestamp,
  } from "$lib/index.js";
  import { getFullnodeUrl } from "@mysten/sui/client";

  let showWalletModal = $state(false);
  $effect(() => {
    // Automatically open the wallet modal if showWalletModal is true
    console.log("showWalletModal changed:", showWalletModal);
  });

  onMount(() => {
    // Initialize the Sui client context
    setSuiClientContext(
      {
        mainnet: { url: getFullnodeUrl("mainnet") },
        testnet: { url: getFullnodeUrl("testnet") },
        localnet: { url: getFullnodeUrl("localnet") },
      },
      "testnet"
    );
  });

  // Reactive values using the wallet store
  walletStore.isConnected;
  walletStore.isConnecting;
  walletStore.currentAccount;
  walletStore.currentWallet;
  walletStore.accounts;
  walletStore.connectionStatus;
</script>

<svelte:head>
  <title>Sui Svelte Kit Demo</title>
  <meta
    name="description"
    content="Demo of Sui Svelte Kit components and utilities"
  />
</svelte:head>

<main>
  <header>
    <h1>🌊 Sui Svelte Kit</h1>
    <p>Modern Svelte 5 toolkit for building Sui dApps</p>
  </header>

  <!-- Connection Status Banner -->
  <div
    class="status-banner"
    class:connected={walletStore.isConnected}
    class:connecting={walletStore.isConnecting}
  >
    <div class="status-indicator"></div>
    <span class="status-text">
      {#if walletStore.isConnecting}
        Connecting to wallet...
      {:else if walletStore.isConnected}
        Connected to {walletStore.currentWallet?.name}
      {:else}
        Not connected
      {/if}
    </span>
  </div>

  <!-- Main Connection Section -->
  <section class="connection-section">
    <h2>Wallet Connection</h2>

    <div class="connection-demo">
      <div class="demo-group">
        <h3>Primary Button</h3>
        <ConnectButton />
      </div>

      <div class="demo-group">
        <h3>Outline Button</h3>
        <ConnectButton variant="outline" />
      </div>

      <div class="demo-group">
        <h3>Ghost Button</h3>
        <ConnectButton variant="ghost" />
      </div>

      <div class="demo-group">
        <h3>Custom Modal Trigger</h3>
        <button
          class="custom-button"
          onclick={() => (showWalletModal = !showWalletModal)}
        >
          Choose Wallet
        </button>
      </div>
    </div>
  </section>

  <!-- Account Information -->
  {#if walletStore.isConnected && walletStore.currentAccount && walletStore.currentWallet}
    <section class="account-section">
      <h2>Account Information</h2>

      <div class="account-card">
        <div class="account-header">
          <h3>Current Account</h3>
          <AccountDropdown currentAccount={walletStore.currentAccount} />
        </div>

        <div class="account-details">
          <div class="detail-row">
            <span class="label">Address:</span>
            <span class="value mono">{walletStore.currentAccount.address}</span>
            <span class="formatted"
              >({formatAddress(walletStore.currentAccount.address)})</span
            >
          </div>

          <div class="detail-row">
            <span class="label">Wallet:</span>
            <span class="value">{walletStore.currentWallet.name}</span>
          </div>

          {#if walletStore.currentAccount.label}
            <div class="detail-row">
              <span class="label">Label:</span>
              <span class="value">{walletStore.currentAccount.label}</span>
            </div>
          {/if}

          <div class="detail-row">
            <span class="label">Chains:</span>
            <span class="value"
              >{walletStore.currentAccount.chains.join(", ")}</span
            >
          </div>
        </div>

        {#if walletStore.accounts.length > 1}
          <div class="accounts-list">
            <h4>All Connected Accounts ({walletStore.accounts.length})</h4>
            {#each walletStore.accounts as account}
              <div
                class="account-item"
                class:current={account.address ===
                  walletStore.currentAccount.address}
              >
                <span class="account-name">
                  {account.label || formatAddress(account.address)}
                </span>
                <span class="account-address mono"
                  >{formatAddress(account.address, 4, 4)}</span
                >
                {#if account.address === walletStore.currentAccount.address}
                  <span class="current-badge">Current</span>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </section>
  {/if}

  <!-- Utility Functions Demo -->
  <section class="utilities-section">
    <h2>Utility Functions Demo</h2>

    <div class="utility-demos">
      <div class="demo-group">
        <h3>Address Formatting</h3>
        <div class="examples">
          <div class="example">
            <code
              >formatAddress('0x1234567890abcdef1234567890abcdef12345678')</code
            >
            <span class="result"
              >{formatAddress(
                "0x1234567890abcdef1234567890abcdef12345678"
              )}</span
            >
          </div>
        </div>
      </div>

      <div class="demo-group">
        <h3>SUI Amount Formatting</h3>
        <div class="examples">
          <div class="example">
            <code>formatSuiAmount('1000000000')</code>
            <span class="result">{formatSuiAmount("1000000000")} SUI</span>
          </div>
          <div class="example">
            <code>formatSuiAmount('500000000')</code>
            <span class="result">{formatSuiAmount("500000000")} SUI</span>
          </div>
          <div class="example">
            <code>formatSuiAmount('1500000')</code>
            <span class="result">{formatSuiAmount("1500000")} SUI</span>
          </div>
        </div>
      </div>

      <div class="demo-group">
        <h3>Timestamp Formatting</h3>
        <div class="examples">
          <div class="example">
            <code>formatTimestamp(Date.now())</code>
            <span class="result">{formatTimestamp(Date.now())}</span>
          </div>
          <div class="example">
            <code>formatTimestamp(Date.now() - 86400000)</code>
            <span class="result">{formatTimestamp(Date.now() - 86400000)}</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Features Overview -->
  <section class="features-section">
    <h2>Features</h2>

    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>Svelte 5 Native</h3>
        <p>Built with runes for optimal reactivity and performance</p>
        <div class="feature-status completed">✅ Complete</div>
      </div>

      <div class="feature-card">
        <div class="feature-icon">🔗</div>
        <h3>Wallet Integration</h3>
        <p>Connect to any Sui-compatible wallet seamlessly</p>
        <div class="feature-status completed">✅ Complete</div>
      </div>

      <div class="feature-card">
        <div class="feature-icon">⚡</div>
        <h3>Type Safe</h3>
        <p>Full TypeScript support with comprehensive type definitions</p>
        <div class="feature-status completed">✅ Complete</div>
      </div>

      <div class="feature-card">
        <div class="feature-icon">🧪</div>
        <h3>Transaction Signing</h3>
        <p>Sign and execute transactions with ease</p>
        <div class="feature-status planned">🚧 Planned</div>
      </div>

      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Query Utilities</h3>
        <p>Fetch blockchain data with reactive queries</p>
        <div class="feature-status planned">🚧 Planned</div>
      </div>

      <div class="feature-card">
        <div class="feature-icon">🔄</div>
        <h3>Auto Reconnect</h3>
        <p>Automatically reconnect to previously connected wallets</p>
        <div class="feature-status planned">🚧 Planned</div>
      </div>
    </div>
  </section>
</main>

<!-- Custom Wallet Modal -->
{#if showWalletModal}
  <WalletModal
    bind:show={showWalletModal}
    onClose={() => (showWalletModal = false)}
  />
{/if}

<!-- Demo page for development -->

<style>
  main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  header {
    text-align: center;
    margin-bottom: 3rem;
  }

  header h1 {
    font-size: 3rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  header p {
    font-size: 1.125rem;
    color: #64748b;
    margin: 0;
  }

  .status-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    margin-bottom: 3rem;
    transition: all 0.3s;
  }

  .status-banner.connecting {
    background: #fef3c7;
    border-color: #f59e0b;
  }

  .status-banner.connected {
    background: #d1fae5;
    border-color: #059669;
  }

  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #94a3b8;
    transition: all 0.3s;
  }

  .status-banner.connecting .status-indicator {
    background: #f59e0b;
    animation: pulse 2s infinite;
  }

  .status-banner.connected .status-indicator {
    background: #059669;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .status-text {
    font-weight: 500;
    color: #1e293b;
  }

  section {
    margin-bottom: 4rem;
  }

  section h2 {
    font-size: 1.875rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0 0 1.5rem;
  }

  .connection-demo {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .demo-group {
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
  }

  .demo-group h3 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 500;
    color: #374151;
  }

  .custom-button {
    padding: 12px 20px;
    background: #8b5cf6;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .custom-button:hover {
    background: #7c3aed;
  }

  .account-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .account-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .account-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .label {
    font-weight: 500;
    color: #64748b;
    min-width: 80px;
  }

  .value {
    color: #1e293b;
    word-break: break-all;
  }

  .mono {
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    font-size: 0.875rem;
  }

  .formatted {
    color: #64748b;
    font-size: 0.875rem;
  }

  .accounts-list {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e2e8f0;
  }

  .accounts-list h4 {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 500;
    color: #374151;
  }

  .account-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 8px;
    transition: background 0.2s;
  }

  .account-item:hover {
    background: #f8fafc;
  }

  .account-item.current {
    background: #eff6ff;
  }

  .account-name {
    font-weight: 500;
    color: #1e293b;
  }

  .account-address {
    color: #64748b;
    font-size: 0.875rem;
  }

  .current-badge {
    margin-left: auto;
    padding: 0.25rem 0.5rem;
    background: #3b82f6;
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 4px;
  }

  .utility-demos {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .examples {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .example {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
  }

  .example code {
    display: block;
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    font-size: 0.875rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }

  .result {
    font-weight: 500;
    color: #059669;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .feature-card {
    padding: 1.5rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    text-align: center;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }

  .feature-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    margin: 0 0 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
  }

  .feature-card p {
    margin: 0 0 1rem;
    color: #64748b;
    line-height: 1.5;
  }

  .feature-status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .feature-status.completed {
    background: #d1fae5;
    color: #059669;
  }

  .feature-status.planned {
    background: #fef3c7;
    color: #d97706;
  }

  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }

    header h1 {
      font-size: 2rem;
    }

    .connection-demo {
      grid-template-columns: 1fr;
    }

    .utility-demos {
      grid-template-columns: 1fr;
    }

    .features-grid {
      grid-template-columns: 1fr;
    }

    .detail-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>
