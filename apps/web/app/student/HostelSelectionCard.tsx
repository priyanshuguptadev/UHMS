"use client";

import { useHostel } from "@/hooks/useUHMSRead";
import { formatAddress } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";

interface HostelSelectionCardProps {
  hostelId: bigint;
  isSelected: boolean;
  onSelect: (id: bigint) => void;
}

export function HostelSelectionCard({
  hostelId,
  isSelected,
  onSelect,
}: HostelSelectionCardProps) {
  const { data: hostel, isLoading } = useHostel(hostelId);

  if (isLoading || !hostel) {
    return <div className="h-16 border border-[#e6e6e6] rounded-md bg-[#f8f8f8]" />;
  }

  const { id, name, warden, exists } = hostel;

  if (!exists) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`text-left w-full p-3.5 rounded-md border transition cursor-pointer ${
        isSelected
          ? "border-[#141414] bg-[#f8f8f8] ring-1 ring-[#141414]"
          : "border-[#e6e6e6] bg-white hover:border-[#d4d4d4]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-[#0a0a0a]">{name}</span>
            <span className="text-[11px] text-[#6b6b6b] tabular-nums">#{id.toString()}</span>
          </div>
          <p className="text-[11px] text-[#6b6b6b] mt-0.5">
            Warden:{" "}
            {warden && warden !== "0x0000000000000000000000000000000000000000" ? (
              <span className="font-mono tabular-nums">{formatAddress(warden)}</span>
            ) : (
              <span className="italic">Unassigned</span>
            )}
          </p>
        </div>
        {isSelected && (
          <div className="w-4 h-4 rounded-full bg-[#141414] text-white flex items-center justify-center shrink-0">
            <CheckIcon className="w-3 h-3" />
          </div>
        )}
      </div>
    </button>
  );
}
