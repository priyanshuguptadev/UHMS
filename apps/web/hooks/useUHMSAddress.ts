"use client";

import { useChainId } from "wagmi";
import { getUHMSAddress } from "@/config/contracts";

export function useUHMSAddress(overrideAddress?: `0x${string}`): `0x${string}` | undefined {
  const chainId = useChainId();
  if (overrideAddress) return overrideAddress;
  return getUHMSAddress(chainId);
}
