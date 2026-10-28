"use server";

export interface PinataUploadResult {
  success: boolean;
  ipfsHash?: string;
  error?: string;
}

/**
 * Server action to upload an ID card image to IPFS via Pinata.
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

    if (!pinataJwt) {
      // Development fallback if Pinata JWT is not configured yet
      console.warn(
        "PINATA_JWT environment variable not detected. Generating deterministic mock IPFS hash."
      );
      // Generate a mock IPFS CID v0 format for testing
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let hash = 0;
      for (let i = 0; i < bytes.length; i++) {
        hash = (hash << 5) - hash + bytes[i];
        hash |= 0;
      }
      const pseudoHash = Math.abs(hash).toString(16).padStart(8, "0");
      const mockCid = `QmDev${pseudoHash}${Date.now().toString(16)}`;

      return {
        success: true,
        ipfsHash: mockCid,
      };
    }

    const pinataFormData = new FormData();
    pinataFormData.append("file", file);

    const metadata = JSON.stringify({
      name: `UHMS-ID-${Date.now()}-${file.name}`,
    });
    pinataFormData.append("pinataMetadata", metadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    pinataFormData.append("pinataOptions", pinataOptions);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: pinataFormData,
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        error: `Pinata upload failed (${res.status}): ${errText}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      ipfsHash: data.IpfsHash,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload error";
    return { success: false, error: message };
  }
}
