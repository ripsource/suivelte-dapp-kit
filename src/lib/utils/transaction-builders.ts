// src/lib/utils/transaction-builders.ts
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";

/**
 * Utility functions for building common Sui transactions
 */

/**
 * Convert Uint8Array modules to the format expected by Transaction.publish()
 */
export function convertModulesForPublish(modules: Uint8Array[]): number[][] {
  return modules.map((module) => Array.from(module));
}

/**
 * Build a SUI transfer transaction
 */
export function buildTransferSuiTransaction({
  to,
  amount,
  sender,
}: {
  to: string;
  amount: bigint | number;
  sender?: string;
}): Transaction {
  const tx = new Transaction();

  if (sender) {
    tx.setSender(sender);
  }

  // Convert to bigint if number
  const amountBigInt = typeof amount === "number" ? BigInt(amount) : amount;

  // Split coins and transfer
  const [coin] = tx.splitCoins(tx.gas, [amountBigInt]);
  tx.transferObjects([coin], to);

  return tx;
}

/**
 * Build a transaction to transfer SUI in human-readable units
 */
export function buildTransferSuiInSuiUnits({
  to,
  suiAmount,
  sender,
}: {
  to: string;
  suiAmount: number;
  sender?: string;
}): Transaction {
  const mistAmount = BigInt(Math.floor(suiAmount * Number(MIST_PER_SUI)));
  return buildTransferSuiTransaction({ to, amount: mistAmount, sender });
}

/**
 * Build a transaction to transfer multiple objects
 */
export function buildTransferObjectsTransaction({
  to,
  objectIds,
  sender,
}: {
  to: string;
  objectIds: string[];
  sender?: string;
}): Transaction {
  const tx = new Transaction();

  if (sender) {
    tx.setSender(sender);
  }

  // Transfer each object
  tx.transferObjects(objectIds, to);

  return tx;
}

/**
 * Build a transaction to merge coins
 */
export function buildMergeCoinsTransaction({
  primaryCoin,
  coinsToMerge,
  sender,
}: {
  primaryCoin: string;
  coinsToMerge: string[];
  sender?: string;
}): Transaction {
  const tx = new Transaction();

  if (sender) {
    tx.setSender(sender);
  }

  tx.mergeCoins(primaryCoin, coinsToMerge);

  return tx;
}

/**
 * Build a transaction to split coins
 */
export function buildSplitCoinsTransaction({
  coin,
  amounts,
  sender,
}: {
  coin: string;
  amounts: (bigint | number)[];
  sender?: string;
}): Transaction {
  const tx = new Transaction();

  if (sender) {
    tx.setSender(sender);
  }

  // Convert amounts to bigint
  const amountsBigInt = amounts.map((amount) =>
    typeof amount === "number" ? BigInt(amount) : amount
  );

  tx.splitCoins(coin, amountsBigInt);

  return tx;
}

/**
 * Build a transaction to publish a package
 */
export function buildPublishPackageTransaction({
  compiledModules,
  dependencies,
  sender,
}: {
  compiledModules: number[][];
  dependencies: string[];
  sender?: string;
}): Transaction {
  const tx = new Transaction();

  if (sender) {
    tx.setSender(sender);
  }

  tx.publish({
    modules: compiledModules,
    dependencies,
  });

  return tx;
}

/**
 * Build a move call transaction
 */
export function buildMoveCallTransaction({
  target,
  arguments: args = [],
  typeArguments = [],
  sender,
}: {
  target: string;
  arguments?: any[];
  typeArguments?: string[];
  sender?: string;
}): Transaction {
  const tx = new Transaction();

  if (sender) {
    tx.setSender(sender);
  }

  tx.moveCall({
    target,
    arguments: args,
    typeArguments,
  });

  return tx;
}

/**
 * Build a transaction with gas budget
 */
export function buildTransactionWithGasBudget(
  transaction: Transaction,
  gasBudget: bigint | number
): Transaction {
  const gasBudgetBigInt =
    typeof gasBudget === "number" ? BigInt(gasBudget) : gasBudget;
  transaction.setGasBudget(gasBudgetBigInt);
  return transaction;
}

/**
 * Build a transaction to stake SUI
 */
export function buildStakeSuiTransaction({
  validatorAddress,
  amount,
  sender,
}: {
  validatorAddress: string;
  amount: bigint | number;
  sender?: string;
}): Transaction {
  const tx = new Transaction();

  if (sender) {
    tx.setSender(sender);
  }

  const amountBigInt = typeof amount === "number" ? BigInt(amount) : amount;

  // Split coins for staking
  const [stakeCoin] = tx.splitCoins(tx.gas, [amountBigInt]);

  // Call the staking function
  tx.moveCall({
    target: "0x3::sui_system::request_add_stake",
    arguments: [
      tx.object("0x5"), // SUI_SYSTEM_STATE object
      stakeCoin,
      tx.pure.address(validatorAddress),
    ],
  });

  return tx;
}

/**
 * Build a transaction to withdraw stake
 */
export function buildWithdrawStakeTransaction({
  stakedSuiId,
  sender,
}: {
  stakedSuiId: string;
  sender?: string;
}): Transaction {
  const tx = new Transaction();

  if (sender) {
    tx.setSender(sender);
  }

  tx.moveCall({
    target: "0x3::sui_system::request_withdraw_stake",
    arguments: [
      tx.object("0x5"), // SUI_SYSTEM_STATE object
      tx.object(stakedSuiId),
    ],
  });

  return tx;
}

/**
 * Estimate transaction gas cost
 */
export async function estimateTransactionGas(
  transaction: Transaction,
  sender: string,
  suiClient: any
): Promise<{
  computationCost: bigint;
  storageCost: bigint;
  storageRebate: bigint;
  totalCost: bigint;
}> {
  try {
    // Build transaction bytes
    const transactionBytes = await transaction.build({ client: suiClient });

    const dryRunResult = await suiClient.dryRunTransactionBlock({
      transactionBlock: transactionBytes,
      sender,
    });

    const gasUsed = dryRunResult.effects?.gasUsed;
    if (!gasUsed) {
      throw new Error("Failed to estimate gas cost");
    }

    const computationCost = BigInt(gasUsed.computationCost);
    const storageCost = BigInt(gasUsed.storageCost);
    const storageRebate = BigInt(gasUsed.storageRebate);
    const totalCost = computationCost + storageCost - storageRebate;

    return {
      computationCost,
      storageCost,
      storageRebate,
      totalCost,
    };
  } catch (error) {
    console.error("Failed to estimate gas:", error);
    throw new Error("Failed to estimate transaction gas cost");
  }
}
