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
    return <div className="h-20 border border-gray-100 rounded-md bg-gray-50 animate-pulse" />;
  }

  const { id, name, warden, exists } = hostel;

  if (!exists) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={`text-left w-full p-4 rounded-lg border transition-all ${
        isSelected
          ? "border-gray-900 bg-gray-50/80 shadow-xs ring-1 ring-gray-900"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">{name}</span>
            <span className="text-xs text-gray-400 font-mono">#{id.toString()}</span>
          </div>
          <p className="text-xs text-gray-500 font-mono mt-1">
            Warden: {warden ? formatAddress(warden) : "Unassigned"}
          </p>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-gray-900 text-white flex items-center justify-center">
            <CheckIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
    </button>
  );
}
