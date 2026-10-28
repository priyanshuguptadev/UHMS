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

  // Apply form state
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
        <h2 className="text-xl font-semibold text-gray-900">Student Portal</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please connect your registered student wallet to view hostel applications.
        </p>
      </div>
    );
  }

  if (isStudentLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-sm text-gray-500 animate-pulse">Loading student record...</p>
      </div>
    );
  }

  if (isStudentError && !studentError?.message?.includes("Student not registered")) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <CrossCircledIcon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900">
              Contract Call Error
            </h3>
            <p className="mt-1 text-xs text-red-700">
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-start gap-4">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900">
              Wallet Not Registered
            </h3>
            <p className="mt-1 text-xs text-amber-700">
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
      {/* Student Profile Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Student Portal
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded">
              Verified Student
            </span>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Wallet: {formatAddress(wallet)}
          </p>
        </div>

        {idCardIpfsHash && (
          <a
            href={`https://gateway.pinata.cloud/ipfs/${idCardIpfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <FileTextIcon className="w-3.5 h-3.5" />
            <span>View ID Card IPFS</span>
            <ExternalLinkIcon className="w-3 h-3 text-gray-400" />
          </a>
        )}
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
          <span>{feedback.message}</span>
        </div>
      )}

      {/* If Student already has an active application */}
      {hasActiveApplication && appData ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Your Hostel Application
              </h2>
              <p className="text-xs text-gray-500">
                Application #{appId?.toString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                (appStatus as ApplicationStatus) || 0
              )}`}
            >
              {getStatusLabel((appStatus as ApplicationStatus) || 0)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-md border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Applied Hostel</span>
              <p className="font-semibold text-gray-900 text-sm">
                {hostelName || `Hostel #${appHostelId?.toString()}`}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-md border border-gray-100 space-y-1">
              <span className="text-gray-500 font-medium">Submitted On</span>
              <p className="font-medium text-gray-700 flex items-center gap-1.5">
                <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                {formatTimestamp(appCreatedAt)}
              </p>
            </div>
          </div>

          {appRemark && (
            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-1">
              <span className="text-xs font-medium text-gray-700">Warden Remark:</span>
              <p className="text-xs text-gray-600 italic">&ldquo;{appRemark}&rdquo;</p>
            </div>
          )}

          <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>Last Updated: {formatTimestamp(appUpdatedAt)}</span>
            <span className="font-mono">
              Applicant: {formatAddress(wallet)}
            </span>
          </div>
        </div>
      ) : (
        /* Apply Form when no active application exists */
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Apply for Hostel Accommodation
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select one of the registered hostels to submit your on-chain application.
            </p>
          </div>

          {hostelCount === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500 bg-gray-50 rounded-md border border-dashed border-gray-200">
              No hostels are currently registered by the administrator.
            </div>
          ) : (
            <form onSubmit={handleApply} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {selectedHostelId
                    ? `Selected Hostel ID #${selectedHostelId.toString()}`
                    : "Please select a hostel"}
                </span>

                <button
                  type="submit"
                  disabled={
                    !selectedHostelId ||
                    applyHook.isPrompting ||
                    applyHook.isMining
                  }
                  className="bg-gray-900 text-white text-xs font-medium px-5 py-2.5 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {applyHook.isPrompting || applyHook.isMining
                    ? "Submitting Application..."
                    : "Submit Hostel Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
