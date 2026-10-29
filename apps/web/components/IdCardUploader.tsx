"use client";

import { useState } from "react";
import { uploadIdCardToPinata } from "@/app/actions/ipfs";
import { UploadIcon, CheckCircledIcon, CrossCircledIcon } from "@radix-ui/react-icons";

interface IdCardUploaderProps {
  onUploaded: (hash: string) => void;
  currentHash?: string;
}

export function IdCardUploader({ onUploaded, currentHash }: IdCardUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCid, setUploadedCid] = useState<string | null>(currentHash || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadIdCardToPinata(formData);

      if (res.success && res.ipfsHash) {
        setUploadedCid(res.ipfsHash);
        onUploaded(res.ipfsHash);
      } else {
        setError(res.error || "Failed to upload ID card to IPFS");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload error";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-[#0a0a0a]">
        ID Card Document (Pinata / IPFS)
      </label>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-[#d4d4d4] rounded-md bg-white hover:bg-[#f8f8f8] text-xs font-medium text-[#0a0a0a] transition focus-within:ring-1 focus-within:ring-[#141414]">
          <UploadIcon className="w-3.5 h-3.5 text-[#6b6b6b]" />
          <span>{isUploading ? "Pinning to IPFS..." : "Select Document"}</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </label>

        {uploadedCid && (
          <div className="flex items-center gap-1.5 text-xs text-[#04250e] bg-[#dcfae5] border border-[#bbf7d0] px-2.5 py-1.5 rounded-md">
            <CheckCircledIcon className="w-3.5 h-3.5 text-[#2e7d32] shrink-0" />
            <span className="font-mono tabular-nums text-[11px] truncate max-w-[220px]" title={uploadedCid}>
              {uploadedCid}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-[#831c1e] bg-[#ffedea] border border-[#fecaca] px-2.5 py-1.5 rounded-md">
          <CrossCircledIcon className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
