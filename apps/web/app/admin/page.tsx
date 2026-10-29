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
  Cross2Icon,
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

  // Modals state: "hostel" | "student" | "warden" | null
  const [activeModal, setActiveModal] = useState<"hostel" | "student" | "warden" | null>(null);

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
      setActiveModal(null);
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
      setActiveModal(null);
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
      setActiveModal(null);
      setTimeout(() => refetchHostels(), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setFeedback({ type: "error", message: msg });
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-semibold text-[#0a0a0a]">Admin Portal</h2>
        <p className="mt-2 text-xs text-[#6b6b6b]">
          Please connect the contract administrator wallet to access this portal.
        </p>
      </div>
    );
  }

  if (isOwnerLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-xs text-[#6b6b6b]">Verifying contract permissions...</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg p-5 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-[#92400e] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-[#92400e]">
              Access Restricted
            </h3>
            <p className="text-xs text-[#92400e]/90">
              The connected address ({formatAddress(address)}) is not the contract owner.
              Only the contract owner ({owner ? formatAddress(owner as string) : "..."}) can manage registrations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Top Header & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e6e6e6]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0a0a0a]">
              Administrator Portal
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#eeeeee] text-[#0a0a0a] rounded">
              Contract Owner
            </span>
          </div>
          <p className="text-xs text-[#6b6b6b] mt-1">
            System configuration, hostel registration, and role verification
          </p>
        </div>

        {/* Action Buttons to open Modals */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveModal("hostel")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#141414] text-white hover:bg-[#262626] rounded-md text-xs font-medium transition cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Register Hostel</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("student")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#eeeeee] text-[#0a0a0a] hover:bg-[#e5e5e5] rounded-md text-xs font-medium transition cursor-pointer"
          >
            <PersonIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
            <span>Register Student</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveModal("warden")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#eeeeee] text-[#0a0a0a] hover:bg-[#e5e5e5] rounded-md text-xs font-medium transition cursor-pointer"
          >
            <IdCardIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
            <span>Register Warden</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md border flex items-start gap-3 text-xs ${
            feedback.type === "success"
              ? "bg-[#dcfae5] border-[#bbf7d0] text-[#04250e]"
              : "bg-[#ffedea] border-[#fecaca] text-[#831c1e]"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircledIcon className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
          ) : (
            <CrossCircledIcon className="w-4 h-4 text-[#c4242a] shrink-0 mt-0.5" />
          )}
          <span className="break-all">{feedback.message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e6e6e6] rounded-lg p-5">
          <span className="text-xs text-[#6b6b6b] font-medium">Registered Hostels</span>
          <p className="text-2xl font-semibold text-[#0a0a0a] tabular-nums mt-1">
            {hostelCount}
          </p>
        </div>
        <div className="bg-white border border-[#e6e6e6] rounded-lg p-5">
          <span className="text-xs text-[#6b6b6b] font-medium">Administrator Address</span>
          <p className="font-mono tabular-nums text-xs font-medium text-[#0a0a0a] mt-2">
            {formatAddress(address)}
          </p>
        </div>
        <div className="bg-white border border-[#e6e6e6] rounded-lg p-5">
          <span className="text-xs text-[#6b6b6b] font-medium">Contract Scope</span>
          <p className="text-xs font-medium text-[#0a0a0a] mt-2">
            Decentralized Access Registry
          </p>
        </div>
      </div>

      {/* Registered Hostels List */}
      <div className="bg-white border border-[#e6e6e6] rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#0a0a0a]">
              Registered Hostels ({hostelCount})
            </h2>
            <p className="text-xs text-[#6b6b6b]">
              Campus accommodation facilities recorded on-chain
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("hostel")}
            className="text-xs text-[#141414] hover:underline font-medium cursor-pointer"
          >
            + Add Hostel
          </button>
        </div>

        {hostelCount === 0 ? (
          <div className="p-8 text-center text-xs text-[#6b6b6b] bg-[#f8f8f8] rounded-md border border-[#e6e6e6] space-y-2">
            <p>No hostels registered yet.</p>
            <button
              type="button"
              onClick={() => setActiveModal("hostel")}
              className="px-3 py-1.5 bg-[#141414] text-white text-xs font-medium rounded-md hover:bg-[#262626] transition cursor-pointer"
            >
              Register First Hostel
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {Array.from({ length: hostelCount }, (_, i) => BigInt(i + 1)).map(
              (id) => (
                <HostelItem key={id.toString()} hostelId={id} />
              )
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Register Hostel */}
      {activeModal === "hostel" && (
        <div className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-5 border border-[#e6e6e6] shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#0a0a0a]">
                  Register New Hostel
                </h3>
                <p className="text-xs text-[#6b6b6b] mt-0.5">
                  Record a new university hostel hall onto the blockchain contract
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#6b6b6b] hover:text-[#0a0a0a] rounded hover:bg-[#f8f8f8] transition cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterHostel} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0a0a0a] mb-1">
                  Hostel Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Block A - Ramanujan Hall"
                  value={hostelName}
                  onChange={(e) => setHostelName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#d4d4d4] rounded-md text-xs text-[#0a0a0a] bg-white focus:outline-hidden focus:border-[#141414] focus:ring-1 focus:ring-[#141414]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f0f0]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 border border-[#d4d4d4] rounded-md text-xs font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerHostelHook.isPrompting || registerHostelHook.isMining}
                  className="px-4 py-2 bg-[#141414] text-white text-xs font-medium rounded-md hover:bg-[#262626] transition disabled:opacity-50 cursor-pointer"
                >
                  {registerHostelHook.isPrompting || registerHostelHook.isMining
                    ? "Submitting..."
                    : "Confirm Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Register Student */}
      {activeModal === "student" && (
        <div className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-5 border border-[#e6e6e6] shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#0a0a0a]">
                  Register Student
                </h3>
                <p className="text-xs text-[#6b6b6b] mt-0.5">
                  Link an authorized student wallet address with their IPFS verified ID
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#6b6b6b] hover:text-[#0a0a0a] rounded hover:bg-[#f8f8f8] transition cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0a0a0a] mb-1">
                  Student Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x1234567890abcdef..."
                  value={studentWallet}
                  onChange={(e) => setStudentWallet(e.target.value)}
                  required
                  pattern="^0x[a-fA-F0-9]{40}$"
                  title="Must be a valid 42-character Ethereum address starting with 0x"
                  className="w-full font-mono tabular-nums text-xs px-3 py-2 border border-[#d4d4d4] rounded-md text-[#0a0a0a] bg-white focus:outline-hidden focus:border-[#141414] focus:ring-1 focus:ring-[#141414]"
                />
              </div>

              <IdCardUploader
                onUploaded={(hash) => setStudentIpfsHash(hash)}
                currentHash={studentIpfsHash}
              />

              <div>
                <label className="block text-xs font-medium text-[#0a0a0a] mb-1">
                  IPFS Document CID
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="CID appears here after document upload"
                  value={studentIpfsHash}
                  className="w-full font-mono tabular-nums text-xs px-3 py-2 bg-[#f8f8f8] border border-[#e6e6e6] rounded-md text-[#6b6b6b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f0f0]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 border border-[#d4d4d4] rounded-md text-xs font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !studentIpfsHash ||
                    registerStudentHook.isPrompting ||
                    registerStudentHook.isMining
                  }
                  className="px-4 py-2 bg-[#141414] text-white text-xs font-medium rounded-md hover:bg-[#262626] transition disabled:opacity-50 cursor-pointer"
                >
                  {registerStudentHook.isPrompting || registerStudentHook.isMining
                    ? "Submitting to Chain..."
                    : "Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Register Warden */}
      {activeModal === "warden" && (
        <div className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-5 border border-[#e6e6e6] shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#0a0a0a]">
                  Register Warden
                </h3>
                <p className="text-xs text-[#6b6b6b] mt-0.5">
                  Authorize a warden wallet and assign them to an existing hostel block
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-[#6b6b6b] hover:text-[#0a0a0a] rounded hover:bg-[#f8f8f8] transition cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterWarden} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0a0a0a] mb-1">
                  Warden Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0xabcdef1234567890..."
                  value={wardenWallet}
                  onChange={(e) => setWardenWallet(e.target.value)}
                  required
                  pattern="^0x[a-fA-F0-9]{40}$"
                  title="Must be a valid 42-character Ethereum address starting with 0x"
                  className="w-full font-mono tabular-nums text-xs px-3 py-2 border border-[#d4d4d4] rounded-md text-[#0a0a0a] bg-white focus:outline-hidden focus:border-[#141414] focus:ring-1 focus:ring-[#141414]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#0a0a0a] mb-1">
                  Assign to Hostel ID
                </label>
                <input
                  type="number"
                  min="1"
                  max={hostelCount > 0 ? hostelCount : 1}
                  value={wardenHostelId}
                  onChange={(e) => setWardenHostelId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-[#d4d4d4] rounded-md text-xs text-[#0a0a0a] bg-white focus:outline-hidden focus:border-[#141414] focus:ring-1 focus:ring-[#141414]"
                />
                <p className="text-[11px] text-[#6b6b6b] mt-1 tabular-nums">
                  Total hostels available: {hostelCount}
                </p>
              </div>

              <IdCardUploader
                onUploaded={(hash) => setWardenIpfsHash(hash)}
                currentHash={wardenIpfsHash}
              />

              <div>
                <label className="block text-xs font-medium text-[#0a0a0a] mb-1">
                  IPFS Document CID
                </label>
                <input
                  type="text"
                  readOnly
                  placeholder="CID appears here after document upload"
                  value={wardenIpfsHash}
                  className="w-full font-mono tabular-nums text-xs px-3 py-2 bg-[#f8f8f8] border border-[#e6e6e6] rounded-md text-[#6b6b6b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f0f0]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3.5 py-2 border border-[#d4d4d4] rounded-md text-xs font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !wardenIpfsHash ||
                    registerWardenHook.isPrompting ||
                    registerWardenHook.isMining
                  }
                  className="px-4 py-2 bg-[#141414] text-white text-xs font-medium rounded-md hover:bg-[#262626] transition disabled:opacity-50 cursor-pointer"
                >
                  {registerWardenHook.isPrompting || registerWardenHook.isMining
                    ? "Submitting to Chain..."
                    : "Register Warden"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
