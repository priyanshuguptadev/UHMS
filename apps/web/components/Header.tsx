"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUHMSConnection } from "@/hooks/useUHMSConnection";
import { PersonIcon, ExitIcon, DotFilledIcon } from "@radix-ui/react-icons";

export function Header() {
  const pathname = usePathname();
  const {
    address,
    isConnected,
    isOwner,
    isWarden,
    isStudent,
    connect,
    disconnect,
    connectors,
    isConnectingWallet,
  } = useUHMSConnection();

  const shortenAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center text-white font-bold text-sm tracking-wider">
              U
            </div>
            <span className="font-semibold text-gray-900 text-base tracking-tight">
              UHMS
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === "/"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/admin")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
              {isOwner && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
            <Link
              href="/student"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/student")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Student
              {isStudent && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
            <Link
              href="/warden"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/warden")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Warden
              {isWarden && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" />
              )}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs">
                <DotFilledIcon className="text-emerald-500 w-4 h-4" />
                <span className="font-mono text-gray-700">
                  {shortenAddress(address)}
                </span>
                {isOwner && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-gray-200 text-gray-800 rounded">
                    Admin
                  </span>
                )}
                {isWarden && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-800 rounded">
                    Warden
                  </span>
                )}
                {isStudent && (
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">
                    Student
                  </span>
                )}
              </div>
              <button
                onClick={() => disconnect()}
                title="Disconnect"
                className="p-2 text-gray-500 hover:text-gray-800 border border-gray-200 rounded-md hover:bg-gray-50 transition"
              >
                <ExitIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const connector = connectors[0];
                if (connector) connect({ connector });
              }}
              disabled={isConnectingWallet}
              className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
            >
              <PersonIcon className="w-3.5 h-3.5" />
              {isConnectingWallet ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
