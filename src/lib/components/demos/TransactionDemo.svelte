<!-- src/lib/components/demos/TransactionDemo.svelte -->
<script lang="ts">
  import { Transaction } from "@mysten/sui/transactions";
  import { MIST_PER_SUI } from "@mysten/sui/utils";
  import { transactionActions } from "../../actions/transaction-actions.svelte.js";
  import { walletStore } from "../../stores/wallet.svelte.js";
  import { getSuiClientContext } from "../../stores/sui-client.svelte.js";
  import {
    buildTransferSuiInSuiUnits,
    buildMoveCallTransaction,
    estimateTransactionGas,
  } from "../../utils/transaction-builders.js";
  import { formatSuiAmount, formatAddress } from "../../utils/format.js";
  import { transactionContext } from "$lib/utils/transaction-context.svelte.js";

  // Form state
  let transferRecipient = $state("");
  let transferAmount = $state("0.1");
  let personalMessage = $state("Hello from Sui Svelte Kit!");
  let moveCallTarget = $state("0x2::coin::zero");
  let moveCallTypeArgs = $state("0x2::sui::SUI");

  // Transaction results
  let lastTransactionDigest = $state("");
  let lastSignature = $state("");
  let lastMessageSignature = $state("");
  let gasEstimate = $state<any>(null);

  // Reactive values
  const currentAccount = $derived(walletStore.currentAccount);
  const isConnected = $derived(walletStore.isConnected);
  const suiContext = transactionContext;

  const isSigningTransaction = $derived(
    transactionActions.isSigningTransaction
  );
  const isExecutingTransaction = $derived(
    transactionActions.isExecutingTransaction
  );
  const isSigningMessage = $derived(transactionActions.isSigningMessage);
  const signTransactionError = $derived(
    transactionActions.signTransactionError
  );
  const executeTransactionError = $derived(
    transactionActions.executeTransactionError
  );
  const signMessageError = $derived(transactionActions.signMessageError);

  // Helper functions
  function clearResults() {
    lastTransactionDigest = "";
    lastSignature = "";
    lastMessageSignature = "";
    gasEstimate = null;
    transactionActions.clearErrors();
  }

  async function handleTransferSui() {
    if (!currentAccount || !transferRecipient) return;

    try {
      clearResults();

      const transaction = buildTransferSuiInSuiUnits({
        to: transferRecipient,
        suiAmount: parseFloat(transferAmount),
        sender: currentAccount.address,
      });

      const result = await transactionActions.signAndExecuteTransaction({
        transaction,

        options: {
          showEffects: true,
          showObjectChanges: true,
          showBalanceChanges: true,
        },
      });

      lastTransactionDigest = result.digest;
      console.log("Transfer successful:", result);
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  }

  async function handleSignTransaction() {
    if (!currentAccount || !transferRecipient) return;

    try {
      clearResults();

      const transaction = buildTransferSuiInSuiUnits({
        to: transferRecipient,
        suiAmount: parseFloat(transferAmount),
        sender: currentAccount.address,
      });

      const result = await transactionActions.signTransaction({
        transaction,
      });

      lastSignature = result.signature;
      console.log("Transaction signed:", result);
    } catch (error) {
      console.error("Signing failed:", error);
    }
  }

  async function handleSignMessage() {
    if (!currentAccount) return;

    try {
      clearResults();

      const message = new TextEncoder().encode(personalMessage);
      const result = await transactionActions.signPersonalMessage({
        message,
      });

      lastMessageSignature = result.signature;
      console.log("Message signed:", result);
    } catch (error) {
      console.error("Message signing failed:", error);
    }
  }

  async function handleMoveCall() {
    if (!currentAccount) return;

    try {
      clearResults();

      const transaction = buildMoveCallTransaction({
        target: moveCallTarget,
        typeArguments: moveCallTypeArgs ? [moveCallTypeArgs] : [],
        sender: currentAccount.address,
      });

      const result = await transactionActions.signAndExecuteTransaction({
        transaction,

        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      lastTransactionDigest = result.digest;
      console.log("Move call successful:", result);
    } catch (error) {
      console.error("Move call failed:", error);
    }
  }

  async function handleEstimateGas() {
    if (!currentAccount || !transferRecipient) return;

    try {
      const transaction = buildTransferSuiInSuiUnits({
        to: transferRecipient,
        suiAmount: parseFloat(transferAmount),
        sender: currentAccount.address,
      });

      gasEstimate = await estimateTransactionGas(
        transaction,
        currentAccount.address,
        suiContext.client
      );
    } catch (error) {
      console.error("Gas estimation failed:", error);
    }
  }

  function handleViewTransaction() {
    if (lastTransactionDigest) {
      const baseUrl =
        suiContext.network === "mainnet"
          ? "https://suiscan.xyz"
          : `https://suiscan.xyz/${suiContext.network}`;
      window.open(`${baseUrl}/tx/${lastTransactionDigest}`, "_blank");
    }
  }
</script>

{#if !isConnected}
  <div class="not-connected">
    <p>Please connect your wallet to test transaction functionality.</p>
  </div>
{:else}
  <div class="transaction-demo">
    <!-- SUI Transfer Section -->
    <section class="demo-section">
      <h3>🪙 SUI Transfer</h3>

      <div class="form-group">
        <label for="recipient">Recipient Address:</label>
        <input
          id="recipient"
          type="text"
          bind:value={transferRecipient}
          placeholder="0x..."
          class="address-input"
        />
      </div>

      <div class="form-group">
        <label for="amount">Amount (SUI):</label>
        <input
          id="amount"
          type="number"
          bind:value={transferAmount}
          min="0"
          step="0.001"
          class="number-input"
        />
      </div>

      <div class="button-group">
        <button
          onclick={handleTransferSui}
          disabled={isExecutingTransaction || !transferRecipient}
          class="action-button primary"
        >
          {#if isExecutingTransaction}
            <div class="spinner"></div>
            Executing...
          {:else}
            Sign & Execute Transfer
          {/if}
        </button>

        <button
          onclick={handleSignTransaction}
          disabled={isSigningTransaction || !transferRecipient}
          class="action-button secondary"
        >
          {#if isSigningTransaction}
            <div class="spinner"></div>
            Signing...
          {:else}
            Sign Only
          {/if}
        </button>

        <button
          onclick={handleEstimateGas}
          disabled={!transferRecipient}
          class="action-button outline"
        >
          Estimate Gas
        </button>
      </div>

      {#if executeTransactionError}
        <div class="error-message">
          <strong>Execution Error:</strong>
          {executeTransactionError.message}
        </div>
      {/if}

      {#if signTransactionError}
        <div class="error-message">
          <strong>Signing Error:</strong>
          {signTransactionError.message}
        </div>
      {/if}
    </section>

    <!-- Message Signing Section -->
    <section class="demo-section">
      <h3>✍️ Personal Message Signing</h3>

      <div class="form-group">
        <label for="message">Message to Sign:</label>
        <textarea
          id="message"
          bind:value={personalMessage}
          placeholder="Enter your message here..."
          rows="3"
          class="message-input"
        ></textarea>
      </div>

      <div class="button-group">
        <button
          onclick={handleSignMessage}
          disabled={isSigningMessage}
          class="action-button primary"
        >
          {#if isSigningMessage}
            <div class="spinner"></div>
            Signing...
          {:else}
            Sign Message
          {/if}
        </button>
      </div>

      {#if signMessageError}
        <div class="error-message">
          <strong>Message Signing Error:</strong>
          {signMessageError.message}
        </div>
      {/if}
    </section>

    <!-- Move Call Section -->
    <section class="demo-section">
      <h3>🔧 Move Call</h3>

      <div class="form-group">
        <label for="target">Function Target:</label>
        <input
          id="target"
          type="text"
          bind:value={moveCallTarget}
          placeholder="package::module::function"
          class="address-input"
        />
      </div>

      <div class="form-group">
        <label for="typeargs">Type Arguments (optional):</label>
        <input
          id="typeargs"
          type="text"
          bind:value={moveCallTypeArgs}
          placeholder="0x2::sui::SUI"
          class="address-input"
        />
      </div>

      <div class="button-group">
        <button
          onclick={handleMoveCall}
          disabled={isExecutingTransaction}
          class="action-button primary"
        >
          {#if isExecutingTransaction}
            <div class="spinner"></div>
            Executing...
          {:else}
            Execute Move Call
          {/if}
        </button>
      </div>
    </section>

    <!-- Results Section -->
    {#if lastTransactionDigest || lastSignature || lastMessageSignature || gasEstimate}
      <section class="results-section">
        <h3>📋 Results</h3>

        {#if lastTransactionDigest}
          <div class="result-item">
            <strong>Transaction Digest:</strong>
            <span class="mono"
              >{formatAddress(lastTransactionDigest, 8, 8)}</span
            >
            <button onclick={handleViewTransaction} class="link-button">
              View on Explorer
            </button>
          </div>
        {/if}

        {#if lastSignature}
          <div class="result-item">
            <strong>Signature:</strong>
            <span class="mono">{formatAddress(lastSignature, 12, 12)}</span>
          </div>
        {/if}

        {#if lastMessageSignature}
          <div class="result-item">
            <strong>Message Signature:</strong>
            <span class="mono"
              >{formatAddress(lastMessageSignature, 12, 12)}</span
            >
          </div>
        {/if}

        {#if gasEstimate}
          <div class="result-item">
            <strong>Gas Estimate:</strong>
            <div class="gas-details">
              <div>
                Computation: {formatSuiAmount(
                  gasEstimate.computationCost.toString()
                )} SUI
              </div>
              <div>
                Storage: {formatSuiAmount(gasEstimate.storageCost.toString())} SUI
              </div>
              <div>
                Storage Rebate: {formatSuiAmount(
                  gasEstimate.storageRebate.toString()
                )} SUI
              </div>
              <div>
                <strong
                  >Total Cost: {formatSuiAmount(
                    gasEstimate.totalCost.toString()
                  )} SUI</strong
                >
              </div>
            </div>
          </div>
        {/if}

        <button onclick={clearResults} class="action-button outline small">
          Clear Results
        </button>
      </section>
    {/if}

    <!-- Transaction Status -->
    <section class="status-section">
      <h3>⚡ Transaction Status</h3>

      <div class="status-grid">
        <div class="status-item">
          <span class="label">Signing Transaction:</span>
          <span class="value status-{isSigningTransaction ? 'active' : 'idle'}">
            {isSigningTransaction ? "Active" : "Idle"}
          </span>
        </div>

        <div class="status-item">
          <span class="label">Executing Transaction:</span>
          <span
            class="value status-{isExecutingTransaction ? 'active' : 'idle'}"
          >
            {isExecutingTransaction ? "Active" : "Idle"}
          </span>
        </div>

        <div class="status-item">
          <span class="label">Signing Message:</span>
          <span class="value status-{isSigningMessage ? 'active' : 'idle'}">
            {isSigningMessage ? "Active" : "Idle"}
          </span>
        </div>
      </div>
    </section>
  </div>
{/if}

<style>
  .not-connected {
    text-align: center;
    padding: 3rem;
    color: #64748b;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .transaction-demo {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .demo-section {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .demo-section h3 {
    margin: 0 0 1.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }

  .address-input,
  .number-input,
  .message-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    font-size: 0.875rem;
    transition: border-color 0.2s;
  }

  .address-input:focus,
  .number-input:focus,
  .message-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .message-input {
    resize: vertical;
    font-family: inherit;
  }

  .button-group {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
  }

  .action-button.small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }

  .action-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  .action-button.primary {
    background: #3b82f6;
    color: white;
  }

  .action-button.primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .action-button.secondary {
    background: #64748b;
    color: white;
  }

  .action-button.secondary:hover:not(:disabled) {
    background: #475569;
  }

  .action-button.outline {
    background: white;
    color: #3b82f6;
    border-color: #3b82f6;
  }

  .action-button.outline:hover:not(:disabled) {
    background: #eff6ff;
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

  .error-message {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.875rem;
  }

  .results-section {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .results-section h3 {
    margin: 0 0 1.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #0c4a6e;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .result-item:last-child {
    margin-bottom: 1.5rem;
  }

  .result-item strong {
    color: #0c4a6e;
    min-width: 120px;
  }

  .mono {
    font-family: "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace;
    font-size: 0.875rem;
    color: #1e293b;
    background: rgba(255, 255, 255, 0.7);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .link-button {
    padding: 0.25rem 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .link-button:hover {
    background: #2563eb;
  }

  .gas-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.875rem;
    background: rgba(255, 255, 255, 0.7);
    padding: 0.75rem;
    border-radius: 6px;
  }

  .status-section {
    background: #fefce8;
    border: 1px solid #fde047;
    border-radius: 12px;
    padding: 1.5rem;
  }

  .status-section h3 {
    margin: 0 0 1.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #a16207;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 8px;
    border: 1px solid #fbbf24;
  }

  .status-item .label {
    font-weight: 500;
    color: #92400e;
  }

  .status-item .value {
    font-weight: 600;
  }

  .value.status-idle {
    color: #64748b;
  }

  .value.status-active {
    color: #dc2626;
  }

  @media (max-width: 768px) {
    .button-group {
      flex-direction: column;
    }

    .result-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .status-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
