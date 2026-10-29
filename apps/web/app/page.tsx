"use client";

import Link from "next/link";
import { useUHMSConnection } from "@/hooks/useUHMSConnection";
import { useHostelCounter, useApplicationCounter } from "@/hooks/useUHMSRead";
import {
  ArrowRightIcon,
  CheckCircledIcon,
  DotFilledIcon,
} from "@radix-ui/react-icons";

export default function HomePage() {
  const { isConnected, isOwner, isWarden, isStudent, connect, connectors, isConnectingWallet } =
    useUHMSConnection();

  const { data: hostelCount } = useHostelCounter();
  const { data: applicationCount } = useApplicationCounter();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-10">
      {/* Overview Header Panel */}
      <div className="bg-white border border-[#e6e6e6] rounded-lg p-6 sm:p-8 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#eeeeee] text-[#0a0a0a]">
            <span>On-Chain Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0a0a0a]">
            University Hostel System
          </h1>
          <p className="text-xs sm:text-sm text-[#6b6b6b] leading-relaxed">
            A blockchain-backed portal for hostel allocation and student verification.
            All registrations, student credentials, and warden decisions are committed on-chain with decentralized IPFS storage.
          </p>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-5 border-t border-[#f0f0f0]">
          <div>
            <span className="text-xs text-[#6b6b6b] font-medium">Registered Hostels</span>
            <p className="text-2xl font-semibold text-[#0a0a0a] tabular-nums mt-0.5">
              {hostelCount !== undefined ? hostelCount.toString() : "0"}
            </p>
          </div>
          <div>
            <span className="text-xs text-[#6b6b6b] font-medium">Applications Filed</span>
            <p className="text-2xl font-semibold text-[#0a0a0a] tabular-nums mt-0.5">
              {applicationCount !== undefined ? applicationCount.toString() : "0"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-xs text-[#6b6b6b] font-medium">Network</span>
            <p className="text-xs font-medium text-[#0a0a0a] mt-2 flex items-center gap-1.5">
              <DotFilledIcon className="w-3.5 h-3.5 text-[#2e7d32]" />
              <span>Ganache (Chain ID 1337)</span>
            </p>
          </div>
        </div>

        {!isConnected && (
          <div className="pt-2">
            <button
              onClick={() => {
                const connector = connectors[0];
                if (connector) connect({ connector });
              }}
              disabled={isConnectingWallet}
              className="inline-flex items-center gap-2 bg-[#141414] text-white text-xs font-medium px-4 py-2.5 rounded-md hover:bg-[#262626] transition disabled:opacity-50 cursor-pointer"
            >
              <span>{isConnectingWallet ? "Connecting..." : "Connect Wallet to Begin"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Role Portals */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-[#0a0a0a]">
            Portal Gateways
          </h2>
          <p className="text-xs text-[#6b6b6b]">
            Direct access for administrators, registered students, and appointed wardens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Admin Card */}
          <div className="bg-white border border-[#e6e6e6] rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-[#d4d4d4] transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0a0a0a]">Admin Portal</span>
                {isOwner && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#eeeeee] text-[#0a0a0a] rounded">
                    Contract Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Register new hostel blocks, onboard authorized wardens, and verify student records with IPFS ID hashes.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/admin"
                className="inline-flex items-center justify-between w-full text-xs font-medium px-3 py-2 rounded-md bg-[#f8f8f8] text-[#0a0a0a] hover:bg-[#eeeeee] transition border border-[#e6e6e6]"
              >
                <span>{isOwner ? "Manage System" : "Open Admin Portal"}</span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
              </Link>
              {isOwner && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#2e7d32]">
                  <CheckCircledIcon className="w-3.5 h-3.5" />
                  <span>Authorized Administrator</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Card */}
          <div className="bg-white border border-[#e6e6e6] rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-[#d4d4d4] transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0a0a0a]">Student Portal</span>
                {isStudent && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#dcfae5] text-[#04250e] rounded">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Browse registered campus hostels, submit accommodation requests on-chain, and track verification decisions.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/student"
                className="inline-flex items-center justify-between w-full text-xs font-medium px-3 py-2 rounded-md bg-[#f8f8f8] text-[#0a0a0a] hover:bg-[#eeeeee] transition border border-[#e6e6e6]"
              >
                <span>{isStudent ? "View Application" : "Open Student Portal"}</span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
              </Link>
              {isStudent && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#2e7d32]">
                  <CheckCircledIcon className="w-3.5 h-3.5" />
                  <span>Registered Student Profile</span>
                </div>
              )}
            </div>
          </div>

          {/* Warden Card */}
          <div className="bg-white border border-[#e6e6e6] rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-[#d4d4d4] transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0a0a0a]">Warden Portal</span>
                {isWarden && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#eff6ff] text-[#1d5fbf] rounded">
                    Assigned
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6b6b6b] leading-relaxed">
                Review student applicants for your assigned hostel, verify credentials on IPFS, approve, or reject with official remarks.
              </p>
            </div>

            <div className="pt-2 space-y-2">
              <Link
                href="/warden"
                className="inline-flex items-center justify-between w-full text-xs font-medium px-3 py-2 rounded-md bg-[#f8f8f8] text-[#0a0a0a] hover:bg-[#eeeeee] transition border border-[#e6e6e6]"
              >
                <span>{isWarden ? "Review Applications" : "Open Warden Portal"}</span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
              </Link>
              {isWarden && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#1d5fbf]">
                  <CheckCircledIcon className="w-3.5 h-3.5" />
                  <span>Assigned Hostel Warden</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
