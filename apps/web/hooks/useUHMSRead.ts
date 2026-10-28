"use client";

import type { ContractFunctionArgs, ContractFunctionName } from "viem";
import { useReadContract, useConnection } from "wagmi";
import { UHMS_ABI } from "@/config/contracts";
import { useUHMSAddress } from "./useUHMSAddress";

/**
 * Generic type-safe read hook for the UHMS smart contract using Wagmi v3.
 */
export function useReadUHMS<
  TFunctionName extends ContractFunctionName<typeof UHMS_ABI, "view" | "pure">
>(
  functionName: TFunctionName,
  args?: ContractFunctionArgs<typeof UHMS_ABI, "view" | "pure", TFunctionName>,
  options?: {
    enabled?: boolean;
    address?: `0x${string}`;
    account?: `0x${string}`;
  }
) {
  const defaultAddress = useUHMSAddress();
  const address = options?.address ?? defaultAddress;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (useReadContract as any)({
    abi: UHMS_ABI,
    address,
    functionName,
    args,
    account: options?.account,
    query: {
      enabled: Boolean(address && (options?.enabled ?? true)),
    },
  });
}

/**
 * Reads hostel details by hostel ID.
 */
export function useHostel(hostelId?: bigint | number) {
  const address = useUHMSAddress();
  const parsedId = hostelId !== undefined ? BigInt(hostelId) : undefined;

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "getHostel",
    args: parsedId !== undefined ? [parsedId] : undefined,
    query: {
      enabled: Boolean(address && parsedId !== undefined),
    },
  });
}

/**
 * Reads the caller student's current application.
 * In Wagmi v3, reads the connected account from useConnection()
 * so the view function msg.sender resolves to the connected user.
 */
export function useMyApplication(enabled = true) {
  const address = useUHMSAddress();
  const connection = useConnection();

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "getMyApplication",
    account: connection.address,
    query: {
      enabled: Boolean(address && connection.address && enabled),
    },
  });
}

/**
 * Reads student mapping by wallet address.
 */
export function useStudent(studentAddress?: `0x${string}`) {
  const address = useUHMSAddress();

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "students",
    args: studentAddress ? [studentAddress] : undefined,
    query: {
      enabled: Boolean(address && studentAddress),
    },
  });
}

/**
 * Reads student struct using getStudent view function.
 */
export function useGetStudent(studentAddress?: `0x${string}`) {
  const address = useUHMSAddress();

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "getStudent",
    args: studentAddress ? [studentAddress] : undefined,
    query: {
      enabled: Boolean(address && studentAddress),
    },
  });
}

/**
 * Reads warden mapping by wallet address.
 */
export function useWarden(wardenAddress?: `0x${string}`) {
  const address = useUHMSAddress();

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "wardens",
    args: wardenAddress ? [wardenAddress] : undefined,
    query: {
      enabled: Boolean(address && wardenAddress),
    },
  });
}

/**
 * Reads warden struct using getWarden view function.
 */
export function useGetWarden(wardenAddress?: `0x${string}`) {
  const address = useUHMSAddress();

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "getWarden",
    args: wardenAddress ? [wardenAddress] : undefined,
    query: {
      enabled: Boolean(address && wardenAddress),
    },
  });
}

/**
 * Reads application mapping by ID.
 */
export function useApplication(applicationId?: bigint | number) {
  const address = useUHMSAddress();
  const parsedId = applicationId !== undefined ? BigInt(applicationId) : undefined;

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "applications",
    args: parsedId !== undefined ? [parsedId] : undefined,
    query: {
      enabled: Boolean(address && parsedId !== undefined),
    },
  });
}

/**
 * Reads application struct using getApplication view function.
 */
export function useGetApplication(applicationId?: bigint | number) {
  const address = useUHMSAddress();
  const parsedId = applicationId !== undefined ? BigInt(applicationId) : undefined;

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "getApplication",
    args: parsedId !== undefined ? [parsedId] : undefined,
    query: {
      enabled: Boolean(address && parsedId !== undefined),
    },
  });
}

/**
 * Reads array of application IDs for a specific hostel.
 */
export function useHostelApplications(hostelId?: bigint | number) {
  const address = useUHMSAddress();
  const parsedId = hostelId !== undefined ? BigInt(hostelId) : undefined;

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "getHostelApplications",
    args: parsedId !== undefined ? [parsedId] : undefined,
    query: {
      enabled: Boolean(address && parsedId !== undefined),
    },
  });
}

/**
 * Reads the total number of hostels registered.
 */
export function useHostelCounter() {
  const address = useUHMSAddress();

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "hostelCounter",
    query: {
      enabled: Boolean(address),
    },
  });
}

/**
 * Reads the total number of applications submitted.
 */
export function useApplicationCounter() {
  const address = useUHMSAddress();

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "applicationCounter",
    query: {
      enabled: Boolean(address),
    },
  });
}

/**
 * Reads the contract owner address.
 */
export function useContractOwner() {
  const address = useUHMSAddress();

  return useReadContract({
    abi: UHMS_ABI,
    address,
    functionName: "owner",
    query: {
      enabled: Boolean(address),
    },
  });
}
