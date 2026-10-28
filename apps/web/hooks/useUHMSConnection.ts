"use client";

import {
  useConnection,
  useConnect,
  useDisconnect,
  useConnectors,
  useChains,
  useSwitchChain,
} from "wagmi";
import { useContractOwner, useStudent, useWarden } from "./useUHMSRead";

/**
 * Hook providing wallet connection state and UHMS user role resolution.
 * Built using Wagmi v3 connection and connector APIs.
 */
export function useUHMSConnection() {
  const connection = useConnection();
  const connectMutation = useConnect();
  const disconnectMutation = useDisconnect();
  const switchChainMutation = useSwitchChain();
  const connectors = useConnectors();
  const chains = useChains();

  const { data: ownerAddress, isLoading: isOwnerLoading } = useContractOwner();
  const { data: wardenData, isLoading: isWardenLoading } = useWarden(connection.address);
  const { data: studentData, isLoading: isStudentLoading } = useStudent(connection.address);

  const address = connection.address;
  const isOwner = Boolean(
    address &&
      ownerAddress &&
      address.toLowerCase() === (ownerAddress as string).toLowerCase()
  );

  const isWarden = Boolean(
    wardenData &&
      Array.isArray(wardenData) &&
      wardenData[3] === true
  );

  const isStudent = Boolean(
    studentData &&
      Array.isArray(studentData) &&
      studentData[2] === true
  );

  return {
    // Wagmi v3 Connection State
    connection,
    address: connection.address,
    addresses: connection.addresses,
    chain: connection.chain,
    chainId: connection.chainId,
    connector: connection.connector,
    status: connection.status,
    isConnected: connection.isConnected,
    isConnecting: connection.isConnecting,
    isDisconnected: connection.isDisconnected,
    isReconnecting: connection.isReconnecting,

    // Connector & Chains Management
    connectors,
    chains,

    // Mutation triggers (Wagmi v3 TanStack Query naming)
    connect: connectMutation.mutate,
    connectAsync: connectMutation.mutateAsync,
    isConnectingWallet: connectMutation.isPending,
    connectError: connectMutation.error,

    disconnect: disconnectMutation.mutate,
    disconnectAsync: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,

    switchChain: switchChainMutation.mutate,
    switchChainAsync: switchChainMutation.mutateAsync,
    isSwitchingChain: switchChainMutation.isPending,

    // UHMS Role Helpers
    isOwner,
    isWarden,
    isStudent,
    wardenHostelId: wardenData && Array.isArray(wardenData) ? wardenData[2] : undefined,
    studentCurrentApplicationId:
      studentData && Array.isArray(studentData) ? studentData[3] : undefined,
    isRolesLoading: isOwnerLoading || isWardenLoading || isStudentLoading,
  };
}
