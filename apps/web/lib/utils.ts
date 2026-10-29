import { ApplicationStatus } from "@/types/uhms";

export function formatAddress(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatTimestamp(ts?: bigint | number) {
  if (!ts) return "—";
  const num = typeof ts === "bigint" ? Number(ts) : ts;
  if (num === 0) return "—";
  return new Date(num * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusLabel(status: ApplicationStatus) {
  switch (status) {
    case ApplicationStatus.None:
      return "None";
    case ApplicationStatus.Submitted:
      return "Submitted";
    case ApplicationStatus.UnderReview:
      return "Under Review";
    case ApplicationStatus.Approved:
      return "Approved";
    case ApplicationStatus.Rejected:
      return "Rejected";
    default:
      return "Unknown";
  }
}

export function getStatusBadgeClass(status: ApplicationStatus) {
  switch (status) {
    case ApplicationStatus.Submitted:
      return "bg-[#fffbeb] text-[#92400e] border-[#fde68a]";
    case ApplicationStatus.UnderReview:
      return "bg-[#eff6ff] text-[#1d5fbf] border-[#bfdbfe]";
    case ApplicationStatus.Approved:
      return "bg-[#dcfae5] text-[#04250e] border-[#bbf7d0]";
    case ApplicationStatus.Rejected:
      return "bg-[#ffedea] text-[#831c1e] border-[#fecaca]";
    default:
      return "bg-[#eeeeee] text-[#3d3d3d] border-[#e6e6e6]";
  }
}
