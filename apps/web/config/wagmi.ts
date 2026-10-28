import { defineChain } from "viem";
import { http, createConfig, createStorage, cookieStorage } from "wagmi";
/**
 * Local Ganache network definition (chain ID: 1337)
 */
export const ganache = defineChain({
  id: 1337,
  name: "Ganache",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL!],
    },
  },
});

export function getConfig() {
  return createConfig({
    chains: [ganache],
    ssr: true,
    storage: createStorage({
      storage: cookieStorage,
    }),
    transports: {
      [ganache.id]: http(process.env.NEXT_PUBLIC_RPC_URL!)
    },
  });
}

export const config = getConfig();

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
