"use server";

import { PinataSDK } from "pinata";

export interface PinataUploadResult {
  success: boolean;
  ipfsHash?: string;
  error?: string;
}

/**
 * Server action to upload an ID card image to IPFS via the Pinata SDK.
 * Falls back to mock hash if Pinata JWT is not provided in development.
 */
export async function uploadIdCardToPinata(
  formData: FormData
): Promise<PinataUploadResult> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Basic validation
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload a JPG, PNG, WEBP, or PDF.",
      };
    }

    const pinataJwt = process.env.PINATA_JWT;
    const pinataGateway = process.env.PINATA_GATEWAY;


    const pinata = new PinataSDK({
      pinataJwt,
      pinataGateway,
    });

    const upload = await pinata.upload.public
      .file(file)
      .name(`UHMS-ID-${Date.now()}-${file.name}`);

    return {
      success: true,
      ipfsHash: upload.cid,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload error";
    return { success: false, error: message };
  }
}
