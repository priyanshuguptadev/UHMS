"use client";

import Link from "next/link";
import { useUHMSConnection } from "@/hooks/useUHMSConnection";
import { useHostelCounter, useApplicationCounter } from "@/hooks/useUHMSRead";
import {
  PersonIcon,
  HomeIcon,
  FileTextIcon,
  ArrowRightIcon,
  LockClosedIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";

export default function HomePage() {
  const { isConnected, isOwner, isWarden, isStudent, connect, connectors, isConnectingWallet } =
    useUHMSConnection();

  const { data: hostelCount } = useHostelCounter();
  const { data: applicationCount } = useApplicationCounter();

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* Hero section */}
      <div className="border border-gray-200 rounded-xl bg-white p-8 sm:p-10 space-y-6">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
            <span>Decentralized Hostel Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            University Hostel System
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            A blockchain-backed portal for hostel allocation and student verification.
            All registrations, applications, and status decisions are recorded on-chain with decentralized IPFS document storage.
          </p>
        </div>

        {/* Stats on-chain */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div>
            <span className="text-xs text-gray-500 font-medium">Registered Hostels</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {hostelCount !== undefined ? hostelCount.toString() : "0"}
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500 font-medium">Applications Filed</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {applicationCount !== undefined ? applicationCount.toString() : "0"}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-xs text-gray-500 font-medium">Network</span>
            <p className="text-sm font-semibold text-gray-900 mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Ganache (1337)
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
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-medium px-5 py-2.5 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            >
              <PersonIcon className="w-4 h-4" />
              <span>{isConnectingWallet ? "Connecting..." : "Connect Wallet to Begin"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Role Gateways */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Dedicated Portals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between space-y-4 hover:border-gray-300 transition">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-gray-100 text-gray-800 flex items-center justify-center">
                <LockClosedIcon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base">Admin Portal</h3>
              <p className="text-xs text-gray-500 leading-normal">
                Register new hostel blocks, onboard authorized wardens, and verify student records with IPFS ID hashes.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center justify-between w-full text-xs font-semibold px-3 py-2 rounded-md bg-gray-50 text-gray-900 hover:bg-gray-100 transition border border-gray-200"
              >
                <span>{isOwner ? "Manage System" : "Go to Admin"}</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
              {isOwner && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                  <CheckCircledIcon className="w-3.5 h-3.5" />
                  <span>Authorized Contract Owner</span>
                </div>
              )}
            </div>
          </div>

          {/* Student Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between space-y-4 hover:border-gray-300 transition">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center">
                <FileTextIcon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base">Student Portal</h3>
              <p className="text-xs text-gray-500 leading-normal">
                Browse available university hostels, submit on-chain accommodation applications, and track verification decisions.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/student"
                className="inline-flex items-center justify-between w-full text-xs font-semibold px-3 py-2 rounded-md bg-gray-50 text-gray-900 hover:bg-gray-100 transition border border-gray-200"
              >
                <span>{isStudent ? "View Application" : "Go to Student"}</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
              {isStudent && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                  <CheckCircledIcon className="w-3.5 h-3.5" />
                  <span>Registered Student</span>
                </div>
              )}
            </div>
          </div>

          {/* Warden Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col justify-between space-y-4 hover:border-gray-300 transition">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-purple-50 text-purple-700 flex items-center justify-center">
                <HomeIcon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900 text-base">Warden Portal</h3>
              <p className="text-xs text-gray-500 leading-normal">
                View student applicants for your assigned hostel, verify credentials on IPFS, mark under review, approve, or reject with remarks.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/warden"
                className="inline-flex items-center justify-between w-full text-xs font-semibold px-3 py-2 rounded-md bg-gray-50 text-gray-900 hover:bg-gray-100 transition border border-gray-200"
              >
                <span>{isWarden ? "Review Applications" : "Go to Warden"}</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
              {isWarden && (
                <div className="mt-2 flex items-center gap-1 text-[11px] text-purple-600 font-medium">
                  <CheckCircledIcon className="w-3.5 h-3.5" />
                  <span>Assigned Warden</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
