"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { UHMS_ABI } from "@/config/contracts";
import { useUHMSAddress } from "./useUHMSAddress";

/**
 * Hook to wait for transaction confirmation receipt.
 */
export function useWaitForUHMSTransaction(hash?: `0x${string}`) {
  return useWaitForTransactionReceipt({
    hash,
  });
}

/**
 * Base write hook with automatic receipt tracking for UHMS contract.
 * Uses Wagmi v3 TanStack Query mutation conventions (mutate / mutateAsync).
 */
export function useWriteUHMS() {
  const address = useUHMSAddress();
  const write = useWriteContract();

  const receipt = useWaitForTransactionReceipt({
    hash: write.data,
  });

  return {
    ...write,
    contractAddress: address,
    hash: write.data,
    receipt: receipt.data,
    // Wagmi v3 mutation states
    isPrompting: write.isPending, // Waiting for user signature in wallet
    isMining: receipt.isLoading, // Transaction submitted, awaiting block confirmation
    isConfirmed: receipt.isSuccess,
    receiptError: receipt.error,
  };
}

/**
 * Submits an application for a hostel.
 */
export function useApplyForHostel() {
  const uhms = useWriteUHMS();

  const mutate = (hostelId: bigint | number) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutate({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "applyForHostel",
      args: [BigInt(hostelId)],
    });
  };

  const mutateAsync = (hostelId: bigint | number) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutateAsync({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "applyForHostel",
      args: [BigInt(hostelId)],
    });
  };

  return {
    ...uhms,
    mutate,
    mutateAsync,
    applyForHostel: mutate,
    applyForHostelAsync: mutateAsync,
  };
}

/**
 * Transitions an application to UnderReview status (warden action).
 */
export function useMarkUnderReview() {
  const uhms = useWriteUHMS();

  const mutate = (applicationId: bigint | number) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutate({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "markUnderReview",
      args: [BigInt(applicationId)],
    });
  };

  const mutateAsync = (applicationId: bigint | number) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutateAsync({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "markUnderReview",
      args: [BigInt(applicationId)],
    });
  };

  return {
    ...uhms,
    mutate,
    mutateAsync,
    markUnderReview: mutate,
    markUnderReviewAsync: mutateAsync,
  };
}

/**
 * Approves an application currently UnderReview (warden action).
 */
export function useApproveApplication() {
  const uhms = useWriteUHMS();

  const mutate = (applicationId: bigint | number) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutate({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "approveApplication",
      args: [BigInt(applicationId)],
    });
  };

  const mutateAsync = (applicationId: bigint | number) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutateAsync({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "approveApplication",
      args: [BigInt(applicationId)],
    });
  };

  return {
    ...uhms,
    mutate,
    mutateAsync,
    approveApplication: mutate,
    approveApplicationAsync: mutateAsync,
  };
}

/**
 * Rejects an application with remarks (warden action).
 */
export function useRejectApplication() {
  const uhms = useWriteUHMS();

  const mutate = (applicationId: bigint | number, remark: string) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutate({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "rejectApplication",
      args: [BigInt(applicationId), remark],
    });
  };

  const mutateAsync = (applicationId: bigint | number, remark: string) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutateAsync({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "rejectApplication",
      args: [BigInt(applicationId), remark],
    });
  };

  return {
    ...uhms,
    mutate,
    mutateAsync,
    rejectApplication: mutate,
    rejectApplicationAsync: mutateAsync,
  };
}

/**
 * Registers a new hostel (admin action).
 */
export function useRegisterHostel() {
  const uhms = useWriteUHMS();

  const mutate = (name: string) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutate({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "registerHostel",
      args: [name],
    });
  };

  const mutateAsync = (name: string) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutateAsync({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "registerHostel",
      args: [name],
    });
  };

  return {
    ...uhms,
    mutate,
    mutateAsync,
    registerHostel: mutate,
    registerHostelAsync: mutateAsync,
  };
}

/**
 * Registers a warden (admin action).
 */
export function useRegisterWarden() {
  const uhms = useWriteUHMS();

  const mutate = (
    wardenWallet: `0x${string}`,
    idCardIpfsHash: string,
    hostelId: bigint | number
  ) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutate({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "registerWarden",
      args: [wardenWallet, idCardIpfsHash, BigInt(hostelId)],
    });
  };

  const mutateAsync = (
    wardenWallet: `0x${string}`,
    idCardIpfsHash: string,
    hostelId: bigint | number
  ) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutateAsync({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "registerWarden",
      args: [wardenWallet, idCardIpfsHash, BigInt(hostelId)],
    });
  };

  return {
    ...uhms,
    mutate,
    mutateAsync,
    registerWarden: mutate,
    registerWardenAsync: mutateAsync,
  };
}

/**
 * Registers a student (admin action).
 */
export function useRegisterStudent() {
  const uhms = useWriteUHMS();

  const mutate = (studentWallet: `0x${string}`, idCardIpfsHash: string) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutate({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "registerStudent",
      args: [studentWallet, idCardIpfsHash],
    });
  };

  const mutateAsync = (studentWallet: `0x${string}`, idCardIpfsHash: string) => {
    if (!uhms.contractAddress) throw new Error("UHMS contract address not configured");
    return uhms.mutateAsync({
      abi: UHMS_ABI,
      address: uhms.contractAddress,
      functionName: "registerStudent",
      args: [studentWallet, idCardIpfsHash],
    });
  };

  return {
    ...uhms,
    mutate,
    mutateAsync,
    registerStudent: mutate,
    registerStudentAsync: mutateAsync,
  };
}
