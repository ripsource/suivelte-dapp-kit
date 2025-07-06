Sui Svelte Kit
A modern Svelte 5 toolkit for building Sui dApps with runes-based state management.

Features
🎯 Svelte 5 Native - Built with runes ($state, $derived, $effect)
🔗 Wallet Integration - Connect to any Sui-compatible wallet
⚡ Type Safe - Full TypeScript support
🧪 Developer Friendly - Hot reload, excellent DX
📦 Tree Shakeable - Import only what you need
Installation
bash
npm install @your-org/sui-svelte-kit @mysten/sui @mysten/wallet-standard
Quick Start
svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { 
    setSuiClientContext, 
    walletStore, 
    ConnectButton 
  } from '@rippy/suivelte-dapp-kit';
  import { getFullnodeUrl } from '@mysten/sui/client';

  onMount(() => {
    setSuiClientContext({
      mainnet: { url: getFullnodeUrl('mainnet') },
      testnet: { url: getFullnodeUrl('testnet') }
    }, 'testnet');
  });

  $: isConnected = walletStore.isConnected;
  $: currentAccount = walletStore.currentAccount;
</script>

<ConnectButton />

{#if isConnected}
  <p>Connected: {currentAccount?.address}</p>
{/if}
Core Components
Stores (Reactive State)
typescript
import { walletStore, getSuiClientContext } from '@your-org/sui-svelte-kit';

// Wallet state
$: isConnected = walletStore.isConnected;
$: currentWallet = walletStore.currentWallet;
$: accounts = walletStore.accounts;

// SuiClient context
const suiContext = getSuiClientContext();
$: client = suiContext.client;
Actions (Wallet Operations)
typescript
import { walletActions } from '@your-org/sui-svelte-kit';

// Connect to a wallet
await walletActions.connectWallet({ wallet });

// Disconnect
await walletActions.disconnectWallet();

// Switch accounts
walletActions.switchAccount(account);
Components
<ConnectButton /> - Smart wallet connection button
<WalletModal /> - Wallet selection modal
<AccountDropdown /> - Account switching dropdown
API Reference
walletStore
Reactive store containing wallet state:

typescript
interface WalletStore {
  wallets: WalletWithRequiredFeatures[];
  accounts: readonly WalletAccount[];
  currentWallet: WalletWithRequiredFeatures | null;
  currentAccount: WalletAccount | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
}
setSuiClientContext(networks, defaultNetwork)
Initialize the SuiClient context:

typescript
setSuiClientContext({
  mainnet: { url: 'https://fullnode.mainnet.sui.io' },
  testnet: { url: 'https://fullnode.testnet.sui.io' }
}, 'testnet');
walletActions
Async wallet operations:

typescript
interface WalletActions {
  connectWallet(args: ConnectWalletArgs): Promise<{ accounts: WalletAccount[] }>;
  disconnectWallet(): Promise<void>;
  switchAccount(account: WalletAccount): void;
  isConnecting: boolean;
  error: Error | null;
}
Development
bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build

# Package for npm
npm run package

# Run tests
npm test
Roadmap
 Basic wallet connection
 Account management
 SuiClient integration
 Transaction signing
 Query utilities
 Auto-reconnection
 Multi-wallet support
 Transaction history
Contributing
Contributions welcome! Please read our contributing guide and submit PRs.

License
MIT

