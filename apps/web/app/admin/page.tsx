"use client";

import { useState } from "react";
import { useUHMSConnection } from "@/hooks/useUHMSConnection";
import { useHostelCounter, useContractOwner } from "@/hooks/useUHMSRead";
import {
  useRegisterHostel,
  useRegisterStudent,
  useRegisterWarden,
} from "@/hooks/useUHMSWrite";
import { IdCardUploader } from "@/components/IdCardUploader";
import { HostelItem } from "./HostelItem";
import { formatAddress } from "@/lib/utils";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PersonIcon,
  IdCardIcon,
} from "@radix-ui/react-icons";

export default function AdminPage() {
  const { address, isConnected } = useUHMSConnection();
  const { data: owner, isLoading: isOwnerLoading } = useContractOwner();
  const isOwner = Boolean(
    address &&
      owner &&
      address.toLowerCase() === (owner as string).toLowerCase()
  );

  // Read hostels count
  const { data: hostelCounterData, refetch: refetchHostels } = useHostelCounter();
  const hostelCount = hostelCounterData ? Number(hostelCounterData) : 0;

  // Writes
  const registerHostelHook = useRegisterHostel();
  const registerStudentHook = useRegisterStudent();
  const registerWardenHook = useRegisterWarden();

  // Local form states
  const [hostelName, setHostelName] = useState("");

  const [studentWallet, setStudentWallet] = useState("");
  const [studentIpfsHash, setStudentIpfsHash] = useState("");

  const [wardenWallet, setWardenWallet] = useState("");
  const [wardenIpfsHash, setWardenIpfsHash] = useState("");
  const [wardenHostelId, setWardenHostelId] = useState<string>("1");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Submit Register Hostel
  const handleRegisterHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!hostelName.trim()) return;

    try {
      await registerHostelHook.registerHostelAsync(hostelName.trim());
      setFeedback({
        type: "success",
        message: `Transaction sent to register hostel "${hostelName}"`,
      });
      setHostelName("");
      setTimeout(() => refetchHostels(), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setFeedback({ type: "error", message: msg });
    }
  };

  // Submit Register Student
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!studentWallet || !studentIpfsHash) {
      setFeedback({
        type: "error",
        message: "Wallet address and IPFS hash are required",
      });
      return;
    }

    try {
      await registerStudentHook.registerStudentAsync(
        studentWallet as `0x${string}`,
        studentIpfsHash
      );
      setFeedback({
        type: "success",
        message: `Student registered successfully (${formatAddress(studentWallet)})`,
      });
      setStudentWallet("");
      setStudentIpfsHash("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setFeedback({ type: "error", message: msg });
    }
  };

  // Submit Register Warden
  const handleRegisterWarden = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!wardenWallet || !wardenIpfsHash || !wardenHostelId) {
      setFeedback({
        type: "error",
        message: "Warden address, IPFS hash, and hostel ID are required",
      });
      return;
    }

    try {
      await registerWardenHook.registerWardenAsync(
        wardenWallet as `0x${string}`,
        wardenIpfsHash,
        BigInt(wardenHostelId)
      );
      setFeedback({
        type: "success",
        message: `Warden registered successfully for Hostel #${wardenHostelId}`,
      });
      setWardenWallet("");
      setWardenIpfsHash("");
      setTimeout(() => refetchHostels(), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setFeedback({ type: "error", message: msg });
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Admin Portal</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please connect the contract administrator wallet to access this portal.
        </p>
      </div>
    );
  }

  if (isOwnerLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-sm text-gray-500 animate-pulse">Verifying contract permissions...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Access Restricted
            </h3>
            <p className="mt-1 text-xs text-amber-700">
              The connected address ({formatAddress(address)}) is not the contract owner.
              Only the contract owner ({owner ? formatAddress(owner as string) : "Loading..."}) can manage registrations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Administrator Portal
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage university hostels, register authorized wardens, and register verified students.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md border flex items-start gap-3 text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircledIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <CrossCircledIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="break-all">{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Register Hostel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 text-gray-900">
            <PlusIcon className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold">Register New Hostel</h2>
          </div>
          <form onSubmit={handleRegisterHostel} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Hostel Name
              </label>
              <input
                type="text"
                placeholder="e.g. Block A - Ramanujan Hall"
                value={hostelName}
                onChange={(e) => setHostelName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <button
              type="submit"
              disabled={registerHostelHook.isPrompting || registerHostelHook.isMining}
              className="w-full bg-gray-900 text-white text-xs font-medium py-2.5 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            >
              {registerHostelHook.isPrompting || registerHostelHook.isMining
                ? "Submitting to Blockchain..."
                : "Register Hostel"}
            </button>
          </form>
        </div>

        {/* Section 2: Register Student */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          <div className="flex items-center gap-2 text-gray-900">
            <PersonIcon className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold">Register Student</h2>
          </div>
          <form onSubmit={handleRegisterStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Student Wallet Address (0x...)
              </label>
              <input
                type="text"
                placeholder="0x123..."
                value={studentWallet}
                onChange={(e) => setStudentWallet(e.target.value)}
                required
                pattern="^0x[a-fA-F0-9]{40}$"
                title="Must be a valid 42-character Ethereum address starting with 0x"
                className="w-full font-mono text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <IdCardUploader
              onUploaded={(hash) => setStudentIpfsHash(hash)}
              currentHash={studentIpfsHash}
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                IPFS Hash
              </label>
              <input
                type="text"
                readOnly
                placeholder="Uploaded ID CID appears here"
                value={studentIpfsHash}
                className="w-full font-mono text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600"
              />
            </div>

            <button
              type="submit"
              disabled={
                !studentIpfsHash ||
                registerStudentHook.isPrompting ||
                registerStudentHook.isMining
              }
              className="w-full bg-gray-900 text-white text-xs font-medium py-2.5 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            >
              {registerStudentHook.isPrompting || registerStudentHook.isMining
                ? "Submitting..."
                : "Register Student On-Chain"}
            </button>
          </form>
        </div>

        {/* Section 3: Register Warden */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5 md:col-span-2">
          <div className="flex items-center gap-2 text-gray-900">
            <IdCardIcon className="w-4 h-4 text-gray-700" />
            <h2 className="text-base font-semibold">Register Warden</h2>
          </div>
          <form onSubmit={handleRegisterWarden} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Warden Wallet Address (0x...)
                </label>
                <input
                  type="text"
                  placeholder="0x456..."
                  value={wardenWallet}
                  onChange={(e) => setWardenWallet(e.target.value)}
                  required
                  pattern="^0x[a-fA-F0-9]{40}$"
                  title="Must be a valid 42-character Ethereum address starting with 0x"
                  className="w-full font-mono text-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Assign to Hostel ID
                </label>
                <input
                  type="number"
                  min="1"
                  max={hostelCount > 0 ? hostelCount : 1}
                  value={wardenHostelId}
                  onChange={(e) => setWardenHostelId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-hidden focus:ring-1 focus:ring-gray-900"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Total hostels registered: {hostelCount}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <IdCardUploader
                onUploaded={(hash) => setWardenIpfsHash(hash)}
                currentHash={wardenIpfsHash}
              />

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  IPFS Hash
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="Uploaded ID CID appears here"
                  value={wardenIpfsHash}
                  className="w-full font-mono text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={
                  !wardenIpfsHash ||
                  registerWardenHook.isPrompting ||
                  registerWardenHook.isMining
                }
                className="w-full bg-gray-900 text-white text-xs font-medium py-2.5 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
              >
                {registerWardenHook.isPrompting || registerWardenHook.isMining
                  ? "Submitting..."
                  : "Register Warden On-Chain"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Registered Hostels List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Registered Hostels ({hostelCount})
          </h2>
        </div>
        {hostelCount === 0 ? (
          <p className="text-xs text-gray-500">
            No hostels registered yet. Use the form above to add one.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: hostelCount }, (_, i) => BigInt(i + 1)).map(
              (id) => (
                <HostelItem key={id.toString()} hostelId={id} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
