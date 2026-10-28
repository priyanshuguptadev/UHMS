// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.34;

/**
 * @title UHMS (University Hostel Management System)
 * @notice Blockchain-based system for transparent hostel registration,
 * warden assignment, student verification, and application status workflows.
 */
contract UHMS {
    // --- Data Models ---

    enum ApplicationStatus {
        None,         // 0: Uninitialized
        Submitted,    // 1: Applied by student
        UnderReview,  // 2: Warden is reviewing
        Approved,     // 3: Application accepted
        Rejected      // 4: Application rejected with remarks
    }

    struct Hostel {
        uint256 id;
        string name;          // e.g., "BR Ambedkar Hostel 2025-26"
        address warden;       // Assigned warden's wallet address
        bool exists;
    }

    struct Student {
        address wallet;
        string idCardIpfsHash;
        bool isRegistered;
        uint256 currentApplicationId; // 0 if no application exists
    }

    struct Warden {
        address wallet;
        string idCardIpfsHash;
        uint256 hostelId;     // The hostel this warden is assigned to
        bool isRegistered;
    }

    struct Application {
        uint256 id;
        address student;
        uint256 hostelId;
        ApplicationStatus status;
        string remark;        // Provided by warden upon rejection
        uint256 createdAt;
        uint256 updatedAt;
    }

    // --- State Variables ---

    address private _owner;

    uint256 public hostelCounter;
    uint256 public applicationCounter;

    mapping(uint256 => Hostel) public hostels;
    mapping(address => Student) public students;
    mapping(address => Warden) public wardens;
    mapping(uint256 => Application) public applications;

    // hostelId => array of application IDs
    mapping(uint256 => uint256[]) private _hostelApplications;

    // --- Events ---

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event HostelRegistered(uint256 indexed hostelId, string name);
    event WardenRegistered(address indexed warden, uint256 indexed hostelId, string idCardIpfsHash);
    event StudentRegistered(address indexed student, string idCardIpfsHash);
    event ApplicationSubmitted(uint256 indexed applicationId, address indexed student, uint256 indexed hostelId);
    event ApplicationStatusUpdated(uint256 indexed applicationId, ApplicationStatus status, string remark);

    // --- Modifiers ---

    modifier onlyOwner() {
        require(msg.sender == _owner, "Ownable: caller is not the owner");
        _;
    }

    // --- Constructor ---

    constructor() {
        _transferOwnership(msg.sender);
    }

    // --- Ownable Functions ---

    function owner() public view returns (address) {
        return _owner;
    }

    function renounceOwnership() public onlyOwner {
        _transferOwnership(address(0));
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // --- Admin Functions ---

    /**
     * @notice Registers a new hostel with a session-based name.
     * @param name Name of the hostel (e.g., "BR Ambedkar Hostel 2025-26").
     * @return hostelId The assigned hostel ID.
     */
    function registerHostel(string calldata name) external onlyOwner returns (uint256 hostelId) {
        require(bytes(name).length > 0, "Hostel name cannot be empty");

        hostelCounter++;
        hostelId = hostelCounter;

        hostels[hostelId] = Hostel({
            id: hostelId,
            name: name,
            warden: address(0),
            exists: true
        });

        emit HostelRegistered(hostelId, name);
        return hostelId;
    }

    /**
     * @notice Registers a warden by binding their wallet, ID card IPFS hash, and assigned hostel.
     * @param wardenWallet Wallet address of the warden.
     * @param idCardIpfsHash IPFS CID hash of the warden's ID card proof.
     * @param hostelId ID of the hostel assigned to this warden.
     */
    function registerWarden(
        address wardenWallet,
        string calldata idCardIpfsHash,
        uint256 hostelId
    ) external onlyOwner {
        require(wardenWallet != address(0), "Invalid warden address");
        require(bytes(idCardIpfsHash).length > 0, "IPFS hash cannot be empty");
        require(hostels[hostelId].exists, "Hostel does not exist");
        require(!wardens[wardenWallet].isRegistered, "Warden already registered");

        wardens[wardenWallet] = Warden({
            wallet: wardenWallet,
            idCardIpfsHash: idCardIpfsHash,
            hostelId: hostelId,
            isRegistered: true
        });

        hostels[hostelId].warden = wardenWallet;

        emit WardenRegistered(wardenWallet, hostelId, idCardIpfsHash);
    }

    /**
     * @notice Registers a student by binding their wallet address and ID card IPFS hash.
     * @param studentWallet Wallet address of the student.
     * @param idCardIpfsHash IPFS CID hash of the student's ID card proof.
     */
    function registerStudent(
        address studentWallet,
        string calldata idCardIpfsHash
    ) external onlyOwner {
        require(studentWallet != address(0), "Invalid student address");
        require(bytes(idCardIpfsHash).length > 0, "IPFS hash cannot be empty");
        require(!students[studentWallet].isRegistered, "Student already registered");

        students[studentWallet] = Student({
            wallet: studentWallet,
            idCardIpfsHash: idCardIpfsHash,
            isRegistered: true,
            currentApplicationId: 0
        });

        emit StudentRegistered(studentWallet, idCardIpfsHash);
    }

    // --- Student Functions ---

    /**
     * @notice Submits an application to an active hostel.
     * @dev A student can only have one active application (Submitted, UnderReview, Approved).
     * Re-application is allowed only if their previous application was Rejected.
     * @param hostelId The ID of the hostel to apply for.
     * @return applicationId The newly created application ID.
     */
    function applyForHostel(uint256 hostelId) public returns (uint256 applicationId) {
        require(students[msg.sender].isRegistered, "Caller is not a registered student");
        require(hostels[hostelId].exists, "Hostel does not exist");

        uint256 currentAppId = students[msg.sender].currentApplicationId;
        if (currentAppId != 0) {
            ApplicationStatus currentStatus = applications[currentAppId].status;
            require(
                currentStatus == ApplicationStatus.Rejected,
                "Active application already exists"
            );
        }

        applicationCounter++;
        applicationId = applicationCounter;

        applications[applicationId] = Application({
            id: applicationId,
            student: msg.sender,
            hostelId: hostelId,
            status: ApplicationStatus.Submitted,
            remark: "",
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        students[msg.sender].currentApplicationId = applicationId;
        _hostelApplications[hostelId].push(applicationId);

        emit ApplicationSubmitted(applicationId, msg.sender, hostelId);
        return applicationId;
    }

    /**
     * @notice Retrieves the current application of the caller student.
     * @return The student's current Application struct.
     */
    function getMyApplication() external view returns (Application memory) {
        require(students[msg.sender].isRegistered, "Caller is not a registered student");
        uint256 currentAppId = students[msg.sender].currentApplicationId;
        require(currentAppId != 0, "No application found");
        return applications[currentAppId];
    }

    // --- Warden Functions ---

    /**
     * @notice Transitions an application to UnderReview status.
     * @param applicationId The ID of the application to review.
     */
    function markUnderReview(uint256 applicationId) public {
        require(wardens[msg.sender].isRegistered, "Caller is not a registered warden");
        require(applicationId > 0 && applicationId <= applicationCounter, "Application does not exist");
        require(
            applications[applicationId].hostelId == wardens[msg.sender].hostelId,
            "Not authorized for this hostel"
        );
        require(
            applications[applicationId].status == ApplicationStatus.Submitted,
            "Application not in Submitted status"
        );

        applications[applicationId].status = ApplicationStatus.UnderReview;
        applications[applicationId].updatedAt = block.timestamp;

        emit ApplicationStatusUpdated(applicationId, ApplicationStatus.UnderReview, "");
    }

    /**
     * @notice Alias for markUnderReview as referenced in invariant rule 3.
     */
    function setUnderReview(uint256 applicationId) external {
        markUnderReview(applicationId);
    }

    /**
     * @notice Approves an application currently UnderReview.
     * @param applicationId The ID of the application to approve.
     */
    function approveApplication(uint256 applicationId) external {
        require(wardens[msg.sender].isRegistered, "Caller is not a registered warden");
        require(applicationId > 0 && applicationId <= applicationCounter, "Application does not exist");
        require(
            applications[applicationId].hostelId == wardens[msg.sender].hostelId,
            "Not authorized for this hostel"
        );
        require(
            applications[applicationId].status == ApplicationStatus.UnderReview,
            "Application not in UnderReview status"
        );

        applications[applicationId].status = ApplicationStatus.Approved;
        applications[applicationId].updatedAt = block.timestamp;

        emit ApplicationStatusUpdated(applicationId, ApplicationStatus.Approved, "");
    }

    /**
     * @notice Rejects an application currently UnderReview with a required remark.
     * @param applicationId The ID of the application to reject.
     * @param remark Reason for rejection (required).
     */
    function rejectApplication(uint256 applicationId, string calldata remark) external {
        require(wardens[msg.sender].isRegistered, "Caller is not a registered warden");
        require(bytes(remark).length > 0, "Rejection remark cannot be empty");
        require(applicationId > 0 && applicationId <= applicationCounter, "Application does not exist");
        require(
            applications[applicationId].hostelId == wardens[msg.sender].hostelId,
            "Not authorized for this hostel"
        );
        require(
            applications[applicationId].status == ApplicationStatus.UnderReview,
            "Application not in UnderReview status"
        );

        applications[applicationId].status = ApplicationStatus.Rejected;
        applications[applicationId].remark = remark;
        applications[applicationId].updatedAt = block.timestamp;

        emit ApplicationStatusUpdated(applicationId, ApplicationStatus.Rejected, remark);
    }

    /**
     * @notice Returns all application IDs submitted to a specific hostel.
     * @param hostelId The ID of the hostel.
     * @return Array of application IDs.
     */
    function getHostelApplications(uint256 hostelId) external view returns (uint256[] memory) {
        require(hostels[hostelId].exists, "Hostel does not exist");
        return _hostelApplications[hostelId];
    }

    // --- View / Helper Functions ---

    /**
     * @notice Fetches details of a hostel.
     * @param hostelId The ID of the hostel.
     * @return Hostel struct.
     */
    function getHostel(uint256 hostelId) external view returns (Hostel memory) {
        require(hostels[hostelId].exists, "Hostel does not exist");
        return hostels[hostelId];
    }

    /**
     * @notice Fetches details of a registered student.
     * @param student The wallet address of the student.
     * @return Student struct.
     */
    function getStudent(address student) external view returns (Student memory) {
        require(students[student].isRegistered, "Student not registered");
        return students[student];
    }

    /**
     * @notice Fetches details of a registered warden.
     * @param warden The wallet address of the warden.
     * @return Warden struct.
     */
    function getWarden(address warden) external view returns (Warden memory) {
        require(wardens[warden].isRegistered, "Warden not registered");
        return wardens[warden];
    }

    /**
     * @notice Fetches details of an application.
     * @param applicationId The ID of the application.
     * @return Application struct.
     */
    function getApplication(uint256 applicationId) external view returns (Application memory) {
        require(applicationId > 0 && applicationId <= applicationCounter, "Application does not exist");
        return applications[applicationId];
    }
}
