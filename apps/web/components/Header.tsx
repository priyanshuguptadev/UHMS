"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUHMSConnection } from "@/hooks/useUHMSConnection";
import { ExitIcon, DotFilledIcon } from "@radix-ui/react-icons";

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
    <header className="bg-white border-b border-[#e6e6e6]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-[#141414] flex items-center justify-center text-white font-semibold text-xs tracking-wider">
              U
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#0a0a0a] text-sm tracking-tight leading-none">
                UHMS
              </span>
              <span className="text-[10px] text-[#6b6b6b] leading-tight">
                Hostel Registry
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-md transition-colors ${
                pathname === "/"
                  ? "bg-[#eeeeee] text-[#0a0a0a]"
                  : "text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f8f8f8]"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/admin")
                  ? "bg-[#eeeeee] text-[#0a0a0a]"
                  : "text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f8f8f8]"
              }`}
            >
              Admin
              {isOwner && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#1d5fbf]" title="Admin Authorized" />
              )}
            </Link>
            <Link
              href="/student"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/student")
                  ? "bg-[#eeeeee] text-[#0a0a0a]"
                  : "text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f8f8f8]"
              }`}
            >
              Student
              {isStudent && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" title="Student Verified" />
              )}
            </Link>
            <Link
              href="/warden"
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/warden")
                  ? "bg-[#eeeeee] text-[#0a0a0a]"
                  : "text-[#6b6b6b] hover:text-[#0a0a0a] hover:bg-[#f8f8f8]"
              }`}
            >
              Warden
              {isWarden && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#141414]" title="Warden Assigned" />
              )}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f8f8f8] border border-[#e6e6e6] rounded-md text-xs">
                <DotFilledIcon className="text-[#2e7d32] w-3.5 h-3.5" />
                <span className="font-mono tabular-nums text-[#0a0a0a] text-xs">
                  {shortenAddress(address)}
                </span>
                {isOwner && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#eeeeee] text-[#0a0a0a] rounded">
                    Admin
                  </span>
                )}
                {isWarden && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#eff6ff] text-[#1d5fbf] rounded">
                    Warden
                  </span>
                )}
                {isStudent && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#dcfae5] text-[#04250e] rounded">
                    Student
                  </span>
                )}
              </div>
              <button
                onClick={() => disconnect()}
                title="Disconnect wallet"
                className="p-2 text-[#6b6b6b] hover:text-[#0a0a0a] border border-[#e6e6e6] rounded-md hover:bg-[#f8f8f8] transition cursor-pointer"
              >
                <ExitIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const connector = connectors[0];
                if (connector) connect({ connector });
              }}
              disabled={isConnectingWallet}
              className="inline-flex items-center gap-2 bg-[#141414] text-white text-xs font-medium px-4 py-2 rounded-md hover:bg-[#262626] transition disabled:opacity-50 cursor-pointer"
            >
              <span>{isConnectingWallet ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
