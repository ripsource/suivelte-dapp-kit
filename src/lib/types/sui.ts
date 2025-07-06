// src/lib/types/sui.ts
import type { SuiClient, SuiClientOptions } from "@mysten/sui/client";

export type NetworkConfig = SuiClientOptions & {
  variables?: Record<string, any>;
};

export type NetworkConfigs = Record<string, NetworkConfig | SuiClient>;

export interface SuiClientState {
  client: SuiClient;
  networks: NetworkConfigs;
  network: string;
  config: NetworkConfig | null;
}

export interface TransactionResult {
  digest: string;
  effects?: any;
  rawEffects?: number[];
}

export interface SignTransactionArgs {
  transaction: any; // Transaction object or string
  account?: string;
  chain?: string;
}

export interface SuiError extends Error {
  code?: string;
  details?: any;
}
