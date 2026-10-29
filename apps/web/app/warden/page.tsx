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
  const {
    data: wardenData,
    isLoading: isWardenLoading,
    isError: isWardenError,
    error: wardenError,
  } = useGetWarden(address);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawWarden = wardenData as any;
  const wallet = Array.isArray(rawWarden) ? rawWarden[0] : rawWarden?.wallet;
  const idCardIpfsHash = Array.isArray(rawWarden)
    ? rawWarden[1]
    : rawWarden?.idCardIpfsHash;
  const hostelId = Array.isArray(rawWarden) ? rawWarden[2] : rawWarden?.hostelId;
  const isRegistered = Boolean(
    Array.isArray(rawWarden) ? rawWarden[3] : rawWarden?.isRegistered
  );

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
        <h2 className="text-xl font-semibold text-[#0a0a0a]">Warden Portal</h2>
        <p className="mt-2 text-xs text-[#6b6b6b]">
          Please connect your registered warden wallet to manage hostel applications.
        </p>
      </div>
    );
  }

  if (isWardenLoading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <p className="text-xs text-[#6b6b6b]">Loading warden record...</p>
      </div>
    );
  }

  if (isWardenError && !wardenError?.message?.includes("Warden not registered")) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="bg-[#ffedea] border border-[#fecaca] rounded-lg p-5 flex items-start gap-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-[#c4242a] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-[#831c1e]">
              Contract Call Error
            </h3>
            <p className="text-xs text-[#831c1e]">
              {wardenError?.message || "Failed to load warden record from blockchain."}
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
              Not Registered as Warden
            </h3>
            <p className="text-xs text-[#92400e]/90">
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
      <div className="bg-white border border-[#e6e6e6] rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-[#0a0a0a]">
              Warden Administration Portal
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-[#eff6ff] text-[#1d5fbf] border border-[#bfdbfe] rounded">
              Assigned Warden
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#6b6b6b] mt-1">
            <span>
              Wallet: <span className="font-mono tabular-nums text-[#0a0a0a]">{formatAddress(wallet)}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#0a0a0a]">
              <HomeIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
              {hostelName || `Hostel #${hostelId?.toString()}`}
            </span>
          </div>
        </div>

        {idCardIpfsHash && (
          <a
            href={`https://gateway.pinata.cloud/ipfs/${idCardIpfsHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e6e6e6] rounded-md text-xs font-medium text-[#0a0a0a] hover:bg-[#f8f8f8] transition"
          >
            <FileTextIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
            <span>View Warden ID Card</span>
            <ExternalLinkIcon className="w-3 h-3 text-[#6b6b6b]" />
          </a>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#0a0a0a]">
              Applications Queue ({applicationIds.length})
            </h2>
            <p className="text-xs text-[#6b6b6b]">
              Applicant queue for {hostelName || `Hostel #${hostelId?.toString()}`}
            </p>
          </div>
          <span className="text-xs font-medium text-[#0a0a0a] bg-[#eeeeee] px-2.5 py-1 rounded tabular-nums">
            Total: {applicationIds.length}
          </span>
        </div>

        {isAppsLoading ? (
          <div className="p-8 text-center text-xs text-[#6b6b6b] bg-white border border-[#e6e6e6] rounded-md">
            Loading applications from blockchain...
          </div>
        ) : applicationIds.length === 0 ? (
          <div className="bg-white border border-[#e6e6e6] rounded-lg p-10 text-center text-xs text-[#6b6b6b]">
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
