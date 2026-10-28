export enum ApplicationStatus {
  None = 0,
  Submitted = 1,
  UnderReview = 2,
  Approved = 3,
  Rejected = 4,
}

export interface Hostel {
  id: bigint;
  name: string;
  warden: `0x${string}`;
  exists: boolean;
}

export interface Student {
  wallet: `0x${string}`;
  idCardIpfsHash: string;
  isRegistered: boolean;
  currentApplicationId: bigint;
}

export interface Warden {
  wallet: `0x${string}`;
  idCardIpfsHash: string;
  hostelId: bigint;
  isRegistered: boolean;
}

export interface Application {
  id: bigint;
  student: `0x${string}`;
  hostelId: bigint;
  status: ApplicationStatus;
  remark: string;
  createdAt: bigint;
  updatedAt: bigint;
}
