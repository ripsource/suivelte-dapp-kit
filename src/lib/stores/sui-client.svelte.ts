// sui-client.svelte.ts
import { getContext, setContext } from "svelte";
import { SuiClient, type SuiClientOptions } from "@mysten/sui/client";

type NetworkConfig = SuiClientOptions & {
  variables?: Record<string, any>;
};

type NetworkConfigs = Record<string, NetworkConfig | SuiClient>;

interface SuiClientState {
  client: SuiClient;
  networks: NetworkConfigs;
  network: string;
  config: NetworkConfig | null;
}

class SuiClientStore {
  #state = $state<SuiClientState>({
    client: new SuiClient({ url: "http://localhost:9000" }), // default
    networks: {},
    network: "",
    config: null,
  });

  constructor(networks: NetworkConfigs, defaultNetwork: string) {
    this.#state.networks = networks;
    this.#state.network = defaultNetwork;
    this.#updateClient();
  }

  get client() {
    return this.#state.client;
  }
  get networks() {
    return this.#state.networks;
  }
  get network() {
    return this.#state.network;
  }
  get config() {
    return this.#state.config;
  }

  selectNetwork(network: string) {
    if (this.#state.network === network) return;
    this.#state.network = network;
    this.#updateClient();
  }

  #updateClient() {
    const networkConfig = this.#state.networks[this.#state.network];

    if (networkConfig instanceof SuiClient) {
      this.#state.client = networkConfig;
      this.#state.config = null;
    } else {
      this.#state.client = new SuiClient(networkConfig);
      this.#state.config = networkConfig;
    }
  }
}

const SUI_CLIENT_KEY = Symbol("sui-client");

export function setSuiClientContext(
  networks: NetworkConfigs,
  defaultNetwork: string
) {
  const store = new SuiClientStore(networks, defaultNetwork);
  setContext(SUI_CLIENT_KEY, store);
  return store;
}

export function getSuiClientContext(): SuiClientStore {
  const store = getContext<SuiClientStore>(SUI_CLIENT_KEY);
  if (!store) {
    throw new Error(
      "SuiClient context not found. Make sure to call setSuiClientContext in a parent component."
    );
  }
  return store;
}
