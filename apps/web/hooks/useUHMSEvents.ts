"use client";

import type { ContractEventName } from "viem";
import { useWatchContractEvent, type UseWatchContractEventParameters } from "wagmi";
import { UHMS_ABI } from "@/config/contracts";
import { useUHMSAddress } from "./useUHMSAddress";

export type UHMSEventName = ContractEventName<typeof UHMS_ABI>;

export type UHMSEventCallback<TEventName extends UHMSEventName> =
  UseWatchContractEventParameters<typeof UHMS_ABI, TEventName>["onLogs"];

/**
 * Generic event listener hook for any UHMS contract event in Wagmi v3.
 */
export function useWatchUHMSEvent<TEventName extends UHMSEventName>(
  eventName: TEventName,
  onLogs: UHMSEventCallback<TEventName>,
  options?: {
    enabled?: boolean;
    address?: `0x${string}`;
    poll?: boolean;
    pollingInterval?: number;
    onError?: (error: Error) => void;
  }
) {
  const defaultAddress = useUHMSAddress();
  const address = options?.address ?? defaultAddress;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (useWatchContractEvent as any)({
    abi: UHMS_ABI,
    address,
    eventName,
    onLogs,
    enabled: Boolean(address && (options?.enabled ?? true)),
    poll: options?.poll,
    pollingInterval: options?.pollingInterval,
    onError: options?.onError,
  });
}

/**
 * Subscribes to ApplicationSubmitted events in real time.
 */
export function useWatchApplicationSubmitted(
  onLogs: UHMSEventCallback<"ApplicationSubmitted">,
  options?: { enabled?: boolean; address?: `0x${string}`; onError?: (error: Error) => void }
) {
  return useWatchUHMSEvent("ApplicationSubmitted", onLogs, options);
}

/**
 * Subscribes to ApplicationStatusUpdated events in real time.
 */
export function useWatchApplicationStatusUpdated(
  onLogs: UHMSEventCallback<"ApplicationStatusUpdated">,
  options?: { enabled?: boolean; address?: `0x${string}`; onError?: (error: Error) => void }
) {
  return useWatchUHMSEvent("ApplicationStatusUpdated", onLogs, options);
}

/**
 * Subscribes to HostelRegistered events in real time.
 */
export function useWatchHostelRegistered(
  onLogs: UHMSEventCallback<"HostelRegistered">,
  options?: { enabled?: boolean; address?: `0x${string}`; onError?: (error: Error) => void }
) {
  return useWatchUHMSEvent("HostelRegistered", onLogs, options);
}

/**
 * Subscribes to WardenRegistered events in real time.
 */
export function useWatchWardenRegistered(
  onLogs: UHMSEventCallback<"WardenRegistered">,
  options?: { enabled?: boolean; address?: `0x${string}`; onError?: (error: Error) => void }
) {
  return useWatchUHMSEvent("WardenRegistered", onLogs, options);
}

/**
 * Subscribes to StudentRegistered events in real time.
 */
export function useWatchStudentRegistered(
  onLogs: UHMSEventCallback<"StudentRegistered">,
  options?: { enabled?: boolean; address?: `0x${string}`; onError?: (error: Error) => void }
) {
  return useWatchUHMSEvent("StudentRegistered", onLogs, options);
}
