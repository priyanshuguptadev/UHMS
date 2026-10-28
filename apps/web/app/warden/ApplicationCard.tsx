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
    return <div className="h-28 border border-gray-100 rounded-lg bg-gray-50/50 animate-pulse" />;
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
    <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4 hover:border-gray-300 transition">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-sm text-gray-900">
            Application #{id.toString()}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(
              currentStatus
            )}`}
          >
            {getStatusLabel(currentStatus)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
          <span>Student: {formatAddress(student)}</span>
          {studentIpfs && (
            <a
              href={`https://gateway.pinata.cloud/ipfs/${studentIpfs}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gray-700 hover:text-gray-900 underline underline-offset-2"
            >
              <span>ID Card</span>
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
            Created: {formatTimestamp(createdAt)}
          </span>
          {updatedAt && createdAt && updatedAt > createdAt && (
            <span>Updated: {formatTimestamp(updatedAt)}</span>
          )}
        </div>

        {/* Actions depending on status */}
        <div className="flex items-center gap-2">
          {currentStatus === ApplicationStatus.Submitted && (
            <button
              onClick={handleReview}
              disabled={isSubmitting || reviewHook.isPrompting || reviewHook.isMining}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-md hover:bg-sky-100 text-xs font-medium transition disabled:opacity-50"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-xs font-medium transition disabled:opacity-50"
              >
                <CheckIcon className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md hover:bg-rose-100 text-xs font-medium transition disabled:opacity-50"
              >
                <Cross2Icon className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>

      {remark && (
        <div className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-700">
          <span className="font-semibold text-gray-900">Remark: </span>
          <span className="italic">&ldquo;{remark}&rdquo;</span>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Reject Application #{id.toString()}
            </h3>
            <p className="text-xs text-gray-500">
              Please enter an official remark/reason for rejecting this student&apos;s hostel application.
            </p>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Rejection Remark
                </label>
                <textarea
                  value={rejectRemark}
                  onChange={(e) => setRejectRemark(e.target.value)}
                  placeholder="e.g. Incomplete verification documents / No vacant capacity"
                  rows={3}
                  required
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50"
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
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-medium hover:bg-rose-700 disabled:opacity-50"
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
