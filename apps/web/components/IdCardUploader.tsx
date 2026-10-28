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
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-700">
        ID Card Document (Uploaded to Pinata / IPFS)
      </label>
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md shadow-xs bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-gray-900">
          <UploadIcon className="w-3.5 h-3.5 text-gray-500" />
          <span>{isUploading ? "Pinning to IPFS..." : "Choose File"}</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
          />
        </label>

        {uploadedCid && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
            <CheckCircledIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-mono truncate max-w-[200px]" title={uploadedCid}>
              {uploadedCid}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <CrossCircledIcon className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
