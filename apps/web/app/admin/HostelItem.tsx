"use client";

import { useHostel } from "@/hooks/useUHMSRead";
import { formatAddress } from "@/lib/utils";
import { HomeIcon } from "@radix-ui/react-icons";

export function HostelItem({ hostelId }: { hostelId: bigint }) {
  const { data: hostel, isLoading } = useHostel(hostelId);

  if (isLoading || !hostel) {
    return (
      <div className="p-4 border border-[#e6e6e6] rounded-md bg-[#f8f8f8] h-16" />
    );
  }

  const { id, name, warden, exists } = hostel;

  if (!exists) return null;

  const hasWarden = warden && warden !== "0x0000000000000000000000000000000000000000";

  return (
    <div className="flex items-center justify-between p-4 border border-[#e6e6e6] rounded-md bg-white hover:border-[#d4d4d4] transition">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#f8f8f8] border border-[#e6e6e6] rounded flex items-center justify-center text-[#0a0a0a]">
          <HomeIcon className="w-4 h-4 text-[#6b6b6b]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-semibold text-[#0a0a0a]">{name}</h4>
            <span className="text-[11px] text-[#6b6b6b] tabular-nums">#{id.toString()}</span>
          </div>
          <p className="text-xs text-[#6b6b6b] mt-0.5">
            Warden:{" "}
            {hasWarden ? (
              <span className="font-mono tabular-nums text-[#0a0a0a]">{formatAddress(warden)}</span>
            ) : (
              <span className="text-[#6b6b6b] italic">Not assigned</span>
            )}
          </p>
        </div>
      </div>
      <div>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
            hasWarden
              ? "bg-[#dcfae5] text-[#04250e] border-[#bbf7d0]"
              : "bg-[#fffbeb] text-[#92400e] border-[#fde68a]"
          }`}
        >
          {hasWarden ? "Active" : "Unassigned"}
        </span>
      </div>
    </div>
  );
}
