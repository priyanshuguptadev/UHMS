"use client";

import { useUHMSConnection } from "@/hooks/useUHMSConnection";
import {
  useGetWarden,
  useHostel,
  useHostelApplications,
} from "@/hooks/useUHMSRead";
import { ApplicationCard } from "./ApplicationCard";
import { formatAddress } from "@/lib/utils";
import {
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HomeIcon,
} from "@radix-ui/react-icons";

export default function WardenPortal() {
  const { address, isConnected } = useUHMSConnection();
  const { data: wardenData, isLoading: isWardenLoading } = useGetWarden(address);

  const wallet = wardenData?.wallet;
  const idCardIpfsHash = wardenData?.idCardIpfsHash;
  const hostelId = wardenData?.hostelId;
  const isRegistered = Boolean(wardenData?.isRegistered);

  // Hostel info
  const { data: hostelData } = useHostel(isRegistered ? hostelId : undefined);
  const hostelName = hostelData?.name;

  // Application IDs submitted to this hostel
  const {
    data: applicationsData,
    isLoading: isAppsLoading,
    refetch: refetchApplications,
  } = useHostelApplications(isRegistered ? hostelId : undefined);

  const applicationIds = (applicationsData as bigint[]) || [];

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Warden Portal</h2>
        <p className="mt-2 text-sm text-gray-600">
          Please connect your registered warden wallet to manage hostel applications.
        </p>
      </div>
    );
  }

  if (isWardenLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-sm text-gray-500 animate-pulse">Loading warden details...</p>
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
              Not Registered as Warden
            </h3>
            <p className="mt-1 text-xs text-amber-700">
              The connected wallet address ({formatAddress(address)}) is not registered as a warden for any hostel.
              Contact the university administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Warden Header Profile */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Warden Portal
            </h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
              Assigned Warden
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 font-mono mt-1">
            <span>Wallet: {formatAddress(wallet)}</span>
            <span className="flex items-center gap-1 font-sans text-gray-800 font-medium">
              <HomeIcon className="w-3.5 h-3.5 text-gray-500" />
              {hostelName || `Hostel #${hostelId?.toString()}`}
            </span>
          </div>
        </div>

        {idCardIpfsHash && (
          <a
            href={`https://gateway.pinata.cloud/ipfs/${idCardIpfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <FileTextIcon className="w-3.5 h-3.5" />
            <span>View Warden ID Card</span>
            <ExternalLinkIcon className="w-3 h-3 text-gray-400" />
          </a>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Applications for {hostelName || `Hostel #${hostelId?.toString()}`}
            </h2>
            <p className="text-xs text-gray-500">
              Review and update status of student accommodation requests
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
            Total: {applicationIds.length}
          </span>
        </div>

        {isAppsLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">
            Loading applications from blockchain...
          </div>
        ) : applicationIds.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-lg p-10 text-center text-xs text-gray-500">
            No applications have been submitted for this hostel yet.
          </div>
        ) : (
          <div className="space-y-3">
            {[...applicationIds].reverse().map((id) => (
              <ApplicationCard
                key={id.toString()}
                applicationId={id}
                onActionComplete={refetchApplications}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
