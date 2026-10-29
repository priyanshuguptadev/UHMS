"use client";

import { useState } from "react";
import { useUHMSConnection } from "@/hooks/useUHMSConnection";
import {
  useGetStudent,
  useHostelCounter,
  useHostel,
  useGetApplication,
} from "@/hooks/useUHMSRead";
import { useApplyForHostel } from "@/hooks/useUHMSWrite";
import { HostelSelectionCard } from "./HostelSelectionCard";
import {
  formatAddress,
  formatTimestamp,
  getStatusLabel,
  getStatusBadgeClass,
} from "@/lib/utils";
import { ApplicationStatus } from "@/types/uhms";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  FileTextIcon,
  ClockIcon,
  PlusIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";

export default function StudentPortal() {
  const { address, isConnected } = useUHMSConnection();
  const {
    data: studentData,
    isLoading: isStudentLoading,
    isError: isStudentError,
    error: studentError,
    refetch: refetchStudent,
  } = useGetStudent(address);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawStudent = studentData as any;
  const wallet = Array.isArray(rawStudent) ? rawStudent[0] : rawStudent?.wallet;
  const idCardIpfsHash = Array.isArray(rawStudent)
    ? rawStudent[1]
    : rawStudent?.idCardIpfsHash;
  const isRegistered = Boolean(
    Array.isArray(rawStudent) ? rawStudent[2] : rawStudent?.isRegistered
  );
  const currentApplicationId = Array.isArray(rawStudent)
    ? rawStudent[3]
    : rawStudent?.currentApplicationId;

  const hasActiveApplication =
    currentApplicationId !== undefined && currentApplicationId > BigInt(0);

  // Application details
  const { data: appData, refetch: refetchApplication } = useGetApplication(
    hasActiveApplication ? currentApplicationId : undefined
  );

  const appId = appData?.id;
  const appHostelId = appData?.hostelId;
  const appStatus = appData?.status;
  const appRemark = appData?.remark;
  const appCreatedAt = appData?.createdAt;
  const appUpdatedAt = appData?.updatedAt;

  // Hostel details of applied hostel
  const { data: appliedHostel } = useHostel(appHostelId);
  const hostelName = appliedHostel?.name;

  // Available hostels
  const { data: hostelCountData } = useHostelCounter();
  const hostelCount = hostelCountData ? Number(hostelCountData) : 0;

  // Apply form state & modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedHostelId, setSelectedHostelId] = useState<bigint | null>(null);
  const applyHook = useApplyForHostel();

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!selectedHostelId) return;

    try {
      await applyHook.applyForHostelAsync(selectedHostelId);
      setFeedback({
        type: "success",
        message: "Application submitted successfully to blockchain",
      });
      setIsApplyModalOpen(false);
      setTimeout(() => {
        refetchStudent();
        refetchApplication();
      }, 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply";
      setFeedback({ type: "error", message: msg });
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-semibold text-[#0a0a0a]">Student Portal</h2>
        <p className="mt-2 text-xs text-[#6b6b6b]">
          Please connect your registered student wallet to view hostel accommodation.
        </p>
      </div>
    );
  }

  if (isStudentLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-xs text-[#6b6b6b]">Loading student record...</p>
      </div>
    );
  }

  if (isStudentError && !studentError?.message?.includes("Student not registered")) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-[#ffedea] border border-[#fecaca] rounded-lg p-5 flex items-start gap-3">
          <CrossCircledIcon className="w-5 h-5 text-[#c4242a] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-[#831c1e]">
              Contract Call Error
            </h3>
            <p className="text-xs text-[#831c1e]">
              {studentError?.message || "Failed to load student record from blockchain."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-lg p-5 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-[#92400e] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-[#92400e]">
              Wallet Not Registered
            </h3>
            <p className="text-xs text-[#92400e]/90">
              The connected address ({formatAddress(address)}) is not registered as a student in the contract.
              Please reach out to the university administrator to register your wallet and verify your ID card.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Student Profile Header */}
      <div className="bg-white border border-[#e6e6e6] rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[#0a0a0a]">
              Student Accommodation Portal
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#dcfae5] text-[#04250e] border border-[#bbf7d0] rounded">
              Verified Student
            </span>
          </div>
          <p className="text-xs text-[#6b6b6b]">
            Wallet: <span className="font-mono tabular-nums text-[#0a0a0a]">{formatAddress(wallet)}</span>
          </p>
        </div>

        {idCardIpfsHash && (
          <a
            href={`https://gateway.pinata.cloud/ipfs/${idCardIpfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e6e6e6] rounded-md text-xs font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] transition"
          >
            <FileTextIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
            <span>View Verified ID Card</span>
            <ExternalLinkIcon className="w-3 h-3 text-[#6b6b6b]" />
          </a>
        )}
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
          <span>{feedback.message}</span>
        </div>
      )}

      {/* If Student already has an active application */}
      {hasActiveApplication && appData ? (
        <div className="bg-white border border-[#e6e6e6] rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0a0a0a]">
                Active Application
              </h2>
              <p className="text-xs text-[#6b6b6b] tabular-nums">
                Application #{appId?.toString()}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded text-xs font-medium border ${getStatusBadgeClass(
                (appStatus as ApplicationStatus) || 0
              )}`}
            >
              {getStatusLabel((appStatus as ApplicationStatus) || 0)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#f8f8f8] rounded-md border border-[#e6e6e6] space-y-1">
              <span className="text-[#6b6b6b] font-medium">Allocated Hostel</span>
              <p className="font-semibold text-[#0a0a0a] text-sm">
                {hostelName || `Hostel #${appHostelId?.toString()}`}
              </p>
            </div>

            <div className="p-3 bg-[#f8f8f8] rounded-md border border-[#e6e6e6] space-y-1">
              <span className="text-[#6b6b6b] font-medium">Submitted On</span>
              <p className="font-medium text-[#0a0a0a] flex items-center gap-1.5 tabular-nums">
                <ClockIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
                {formatTimestamp(appCreatedAt)}
              </p>
            </div>
          </div>

          {appRemark && (
            <div className="p-3 bg-[#f8f8f8] rounded-md border border-[#e6e6e6] space-y-1">
              <span className="text-xs font-medium text-[#0a0a0a]">Warden Official Remark:</span>
              <p className="text-xs text-[#6b6b6b] italic">&ldquo;{appRemark}&rdquo;</p>
            </div>
          )}

          <div className="text-xs text-[#6b6b6b] pt-3 border-t border-[#f0f0f0] flex items-center justify-between">
            <span className="tabular-nums">Last Updated: {formatTimestamp(appUpdatedAt)}</span>
            <span>
              Applicant: <span className="font-mono tabular-nums text-[#0a0a0a]">{formatAddress(wallet)}</span>
            </span>
          </div>
        </div>
      ) : (
        /* When no active application exists */
        <div className="bg-white border border-[#e6e6e6] rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[#0a0a0a]">
                Hostel Accommodation Application
              </h2>
              <p className="text-xs text-[#6b6b6b] mt-0.5">
                Submit an on-chain accommodation request to your preferred campus hostel block
              </p>
            </div>

            {hostelCount > 0 && (
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#141414] text-white hover:bg-[#262626] rounded-md text-xs font-medium transition cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Apply for Hostel</span>
              </button>
            )}
          </div>

          {hostelCount === 0 ? (
            <div className="p-8 text-center text-xs text-[#6b6b6b] bg-[#f8f8f8] rounded-md border border-[#e6e6e6]">
              No hostels are currently registered by the university administrator.
            </div>
          ) : (
            <div className="p-5 bg-[#f8f8f8] border border-[#e6e6e6] rounded-md space-y-2">
              <p className="text-xs text-[#0a0a0a] font-medium">
                Ready to submit an accommodation request?
              </p>
              <p className="text-xs text-[#6b6b6b]">
                There are currently {hostelCount} registered hostels available on campus.
                Click below to select a hostel and submit your on-chain application.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-4 py-2 bg-[#141414] text-white text-xs font-medium rounded-md hover:bg-[#262626] transition cursor-pointer"
                >
                  Start Application
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Apply for Hostel */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-5 border border-[#e6e6e6] shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#0a0a0a]">
                  Apply for Hostel Accommodation
                </h3>
                <p className="text-xs text-[#6b6b6b] mt-0.5">
                  Select a hostel hall to submit your on-chain allocation request
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 text-[#6b6b6b] hover:text-[#0a0a0a] rounded hover:bg-[#f8f8f8] transition cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-5">
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {Array.from({ length: hostelCount }, (_, i) => BigInt(i + 1)).map(
                  (id) => (
                    <HostelSelectionCard
                      key={id.toString()}
                      hostelId={id}
                      isSelected={selectedHostelId === id}
                      onSelect={(chosenId) => setSelectedHostelId(chosenId)}
                    />
                  )
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
                <span className="text-xs text-[#6b6b6b] tabular-nums">
                  {selectedHostelId
                    ? `Selected Hostel ID #${selectedHostelId.toString()}`
                    : "Please select a hostel"}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-3.5 py-2 border border-[#d4d4d4] rounded-md text-xs font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !selectedHostelId ||
                      applyHook.isPrompting ||
                      applyHook.isMining
                    }
                    className="px-4 py-2 bg-[#141414] text-white text-xs font-medium rounded-md hover:bg-[#262626] transition disabled:opacity-50 cursor-pointer"
                  >
                    {applyHook.isPrompting || applyHook.isMining
                      ? "Submitting..."
                      : "Confirm & Submit"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
