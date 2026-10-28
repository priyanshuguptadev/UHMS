"use client";

import { useHostel } from "@/hooks/useUHMSRead";
import { formatAddress } from "@/lib/utils";
import { HomeIcon } from "@radix-ui/react-icons";

export function HostelItem({ hostelId }: { hostelId: bigint }) {
  const { data: hostel, isLoading } = useHostel(hostelId);

  if (isLoading || !hostel) {
    return (
      <div className="p-4 border border-gray-100 rounded-md bg-gray-50/50 animate-pulse h-16" />
    );
  }

  const { id, name, warden, exists } = hostel;

  if (!exists) return null;

  const hasWarden = warden && warden !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-md bg-white hover:border-gray-300 transition">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded text-gray-700">
          <HomeIcon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{name}</h4>
            <span className="text-xs text-gray-400 font-mono">#{id.toString()}</span>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Warden: {hasWarden ? formatAddress(warden) : "Not assigned"}
          </p>
        </div>
      </div>
      <div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
            hasWarden
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {hasWarden ? "Active" : "Pending Warden"}
        </span>
      </div>
    </div>
  );
}
