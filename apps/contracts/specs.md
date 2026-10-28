# UHMS (University Hostel Management System) Specification

## 1. Overview
The **University Hostel Management System (UHMS)** is a blockchain-based dApp designed to maintain transparent, tamper-proof records for hostel registration, warden assignment, student verification, and application status workflows.

Operational aspects such as fee collection, room capacity tracking, and gender allocation rules are managed off-chain, keeping the smart contract lean, gas-efficient, and privacy-conscious.

---

## 2. Actors & Access Control

### 2.1 Admin (Contract Owner)
- **Identity:** Single owner wallet address (`Ownable`).
- **Permissions:**
  - Register new Hostels (with session-based names, e.g., *"BR Ambedkar Hostel 2025-26"*).
  - Register Wardens by binding their wallet address, ID card IPFS hash, and assigned `hostelId`.
  - Register Students by binding their wallet address and ID card IPFS hash.
  - Transfer or renounce contract ownership.

### 2.2 Warden
- **Identity:** Registered wallet address associated with a specific `hostelId` and an IPFS hash of their identity proof.
- **Permissions:**
  - View applications submitted specifically to their assigned hostel.
  - Transition application status:
    - Mark as `UnderReview`.
    - Mark as `Approved`.
    - Mark as `Rejected` with a required string `remark` (reason for rejection).
- **Restrictions:** Cannot review or modify applications for hostels they do not manage.

### 2.3 Student
- **Identity:** Pre-registered wallet address associated with their ID card IPFS hash.
- **Permissions:**
  - Apply to an active hostel.
  - Track their application status and view rejection remarks (if any).
- **Restrictions:**
  - Can only have **one active application** at a time (`Submitted`, `UnderReview`, or `Approved`).
  - Allowed to submit a new application only if their previous application was `Rejected`.

---

## 3. Data Privacy & Storage (IPFS)
- **Personally Identifiable Information (PII):** Student and warden ID cards are stored off-chain on IPFS.
- **On-chain Storage:** Only the cryptographic content identifiers (IPFS CID hashes as `string`) are stored in the smart contract, preserving user privacy on a public ledger.

---

## 4. Data Models

### 4.1 Status Enum
```solidity
enum ApplicationStatus {
    None,         // 0: Uninitialized
    Submitted,    // 1: Applied by student
    UnderReview,  // 2: Warden is reviewing
    Approved,     // 3: Application accepted
    Rejected      // 4: Application rejected with remarks
}
```

### 4.2 Hostel
```solidity
struct Hostel {
    uint256 id;
    string name;          // e.g., "BR Ambedkar Hostel 2025-26"
    address warden;       // Assigned warden's wallet address
    bool exists;
}
```

### 4.3 Student
```solidity
struct Student {
    address wallet;
    string idCardIpfsHash;
    bool isRegistered;
    uint256 currentApplicationId; // 0 if no application exists
}
```

### 4.4 Warden
```solidity
struct Warden {
    address wallet;
    string idCardIpfsHash;
    uint256 hostelId;     // The hostel this warden is assigned to
    bool isRegistered;
}
```

### 4.5 Application
```solidity
struct Application {
    uint256 id;
    address student;
    uint256 hostelId;
    ApplicationStatus status;
    string remark;        // Provided by warden upon rejection
    uint256 createdAt;
    uint256 updatedAt;
}
```

---

## 5. Application Lifecycle & State Machine

```
              ┌──────────────────────────┐
              │      [Not Applied]       │
              └─────────────┬────────────┘
                            │
                            │ student applies
                            ▼
              ┌──────────────────────────┐
              │        Submitted         │
              └─────────────┬────────────┘
                            │
                            │ warden starts review
                            ▼
              ┌──────────────────────────┐
              │       UnderReview        │
              └─────────────┬────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            │ warden approves               │ warden rejects + remark
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│       Approved        │       │       Rejected        │
│   (Final for session) │       │ (Can apply elsewhere) │
└───────────────────────┘       └───────────────────────┘
```

### Invariant Rules:
1. **Single Active Application Rule:** A student cannot call `apply()` if their current application status is `Submitted`, `UnderReview`, or `Approved`.
2. **Re-application Rule:** If an application status is `Rejected`, the student's active slot is cleared, permitting an application to another hostel.
3. **Scoping Rule:** A warden can only invoke `setUnderReview()`, `approveApplication()`, and `rejectApplication()` on applications pointing to their assigned `hostelId`.

---

## 6. Smart Contract Interface (Proposed)

### 6.1 Admin Functions
- `registerHostel(string calldata name) external returns (uint256 hostelId)`
- `registerWarden(address wardenWallet, string calldata idCardIpfsHash, uint256 hostelId) external`
- `registerStudent(address studentWallet, string calldata idCardIpfsHash) external`

### 6.2 Student Functions
- `applyForHostel(uint256 hostelId) external returns (uint256 applicationId)`
- `getMyApplication() external view returns (Application memory)`

### 6.3 Warden Functions
- `markUnderReview(uint256 applicationId) external`
- `approveApplication(uint256 applicationId) external`
- `rejectApplication(uint256 applicationId, string calldata remark) external`
- `getHostelApplications(uint256 hostelId) external view returns (uint256[] memory)`

### 6.4 View / Helper Functions
- `getHostel(uint256 hostelId) external view returns (Hostel memory)`
- `getStudent(address student) external view returns (Student memory)`
- `getWarden(address warden) external view returns (Warden memory)`
- `getApplication(uint256 applicationId) external view returns (Application memory)`

---

## 7. Key Events for Web Frontend Tracking
- `HostelRegistered(uint256 indexed hostelId, string name)`
- `WardenRegistered(address indexed warden, uint256 indexed hostelId, string idCardIpfsHash)`
- `StudentRegistered(address indexed student, string idCardIpfsHash)`
- `ApplicationSubmitted(uint256 indexed applicationId, address indexed student, uint256 indexed hostelId)`
- `ApplicationStatusUpdated(uint256 indexed applicationId, ApplicationStatus status, string remark)`
