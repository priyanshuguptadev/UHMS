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
      return "bg-amber-50 text-amber-700 border-amber-200";
    case ApplicationStatus.UnderReview:
      return "bg-sky-50 text-sky-700 border-sky-200";
    case ApplicationStatus.Approved:
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case ApplicationStatus.Rejected:
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}
