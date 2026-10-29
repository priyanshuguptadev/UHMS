"use client";

import { useState } from "react";
import { useGetApplication, useGetStudent } from "@/hooks/useUHMSRead";
import {
  useMarkUnderReview,
  useApproveApplication,
  useRejectApplication,
} from "@/hooks/useUHMSWrite";
import {
  formatAddress,
  formatTimestamp,
  getStatusLabel,
  getStatusBadgeClass,
} from "@/lib/utils";
import { ApplicationStatus } from "@/types/uhms";
import {
  CheckIcon,
  Cross2Icon,
  EyeOpenIcon,
  ExternalLinkIcon,
  ClockIcon,
} from "@radix-ui/react-icons";

interface ApplicationCardProps {
  applicationId: bigint;
  onActionComplete: () => void;
}

export function ApplicationCard({
  applicationId,
  onActionComplete,
}: ApplicationCardProps) {
  const { data: appData, isLoading } = useGetApplication(applicationId);

  const id = appData?.id;
  const student = appData?.student;
  const status = appData?.status;
  const remark = appData?.remark;
  const createdAt = appData?.createdAt;
  const updatedAt = appData?.updatedAt;

  // Get student details to show ID card IPFS CID
  const { data: studentRecord } = useGetStudent(student as `0x${string}`);
  const studentIpfs = studentRecord?.idCardIpfsHash;

  // Writes
  const reviewHook = useMarkUnderReview();
  const approveHook = useApproveApplication();
  const rejectHook = useRejectApplication();

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return <div className="h-24 border border-[#e6e6e6] rounded-md bg-[#f8f8f8]" />;
  }

  if (!id) return null;

  const currentStatus = (status as ApplicationStatus) || 0;

  const handleReview = async () => {
    setIsSubmitting(true);
    try {
      await reviewHook.markUnderReviewAsync(id);
      setTimeout(onActionComplete, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveHook.approveApplicationAsync(id);
      setTimeout(onActionComplete, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectRemark.trim()) return;
    setIsSubmitting(true);
    try {
      await rejectHook.rejectApplicationAsync(id, rejectRemark.trim());
      setShowRejectModal(false);
      setRejectRemark("");
      setTimeout(onActionComplete, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#e6e6e6] rounded-md p-4 space-y-3.5 hover:border-[#d4d4d4] transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#f0f0f0] pb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-xs text-[#0a0a0a] tabular-nums">
            Application #{id.toString()}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusBadgeClass(
              currentStatus
            )}`}
          >
            {getStatusLabel(currentStatus)}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#6b6b6b]">
          <span>
            Student:{" "}
            <span className="font-mono tabular-nums text-[#0a0a0a]">
              {formatAddress(student)}
            </span>
          </span>
          {studentIpfs && (
            <a
              href={`https://gateway.pinata.cloud/ipfs/${studentIpfs}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1d5fbf] hover:underline"
            >
              <span>ID Card</span>
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b6b6b]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 tabular-nums">
            <ClockIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
            Created: {formatTimestamp(createdAt)}
          </span>
          {updatedAt && createdAt && updatedAt > createdAt && (
            <span className="tabular-nums">Updated: {formatTimestamp(updatedAt)}</span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {currentStatus === ApplicationStatus.Submitted && (
            <button
              onClick={handleReview}
              disabled={isSubmitting || reviewHook.isPrompting || reviewHook.isMining}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eeeeee] text-[#0a0a0a] hover:bg-[#e5e5e5] rounded-md text-xs font-medium transition disabled:opacity-50 cursor-pointer"
            >
              <EyeOpenIcon className="w-3.5 h-3.5" />
              <span>Mark Under Review</span>
            </button>
          )}

          {currentStatus === ApplicationStatus.UnderReview && (
            <>
              <button
                onClick={handleApprove}
                disabled={
                  isSubmitting ||
                  approveHook.isPrompting ||
                  approveHook.isMining
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] text-white rounded-md hover:bg-[#262626] text-xs font-medium transition disabled:opacity-50 cursor-pointer"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffedea] text-[#831c1e] border border-[#fecaca] rounded-md hover:bg-[#fed7d7] text-xs font-medium transition disabled:opacity-50 cursor-pointer"
              >
                <Cross2Icon className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>

      {remark && (
        <div className="text-xs bg-[#f8f8f8] border border-[#e6e6e6] rounded-md p-3 text-[#0a0a0a]">
          <span className="font-semibold">Remark: </span>
          <span className="italic text-[#6b6b6b]">&ldquo;{remark}&rdquo;</span>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-[#0a0a0a]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 border border-[#e6e6e6] shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#0a0a0a]">
                  Reject Application #{id.toString()}
                </h3>
                <p className="text-xs text-[#6b6b6b] mt-0.5">
                  Enter an official remark stating the reason for rejecting this applicant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1 text-[#6b6b6b] hover:text-[#0a0a0a] rounded hover:bg-[#f8f8f8] transition cursor-pointer"
              >
                <Cross2Icon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#0a0a0a] mb-1">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="e.g. Incomplete verification documents / No vacant capacity"
                  rows={3}
                  required
                  className="w-full text-xs p-2.5 border border-[#d4d4d4] rounded-md bg-white text-[#0a0a0a] focus:outline-hidden focus:border-[#141414] focus:ring-1 focus:ring-[#141414]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0f0f0]">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3.5 py-2 border border-[#d4d4d4] rounded-md text-xs font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    rejectHook.isPrompting ||
                    rejectHook.isMining
                  }
                  className="px-4 py-2 bg-[#c4242a] text-white rounded-md text-xs font-medium hover:bg-[#a81c21] disabled:opacity-50 cursor-pointer transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
