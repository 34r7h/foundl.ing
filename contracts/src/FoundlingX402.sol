// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./FoundlingProject.sol";

/**
 * @title FoundlingX402
 * @dev x402 protocol integration for milestone-based USDC streams and monetized agent services
 */
contract FoundlingX402 is Ownable, ReentrancyGuard {
    FoundlingProject public projectContract;
    IERC20 public usdcToken;
    
    // x402 stream configuration
    struct StreamConfig {
        uint256 projectId;
        uint256 milestoneId;
        address recipient;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 lastClaimTime;
        bool isActive;
        uint256 totalClaimed;
    }
    
    // Agent service pricing
    struct AgentService {
        string name;
        string description;
        uint256 pricePerUse;
        bool isActive;
        uint256 totalUsage;
        uint256 totalRevenue;
    }
    
    // Stream tracking
    mapping(uint256 => StreamConfig) public streams; // streamId => StreamConfig
    uint256 public streamCounter;
    
    // Agent services
    mapping(string => AgentService) public agentServices;
    string[] public serviceNames;
    
    // User balances
    mapping(address => uint256) public userBalances;
    
    // Events
    event StreamCreated(uint256 indexed streamId, uint256 indexed projectId, uint256 indexed milestoneId, address recipient, uint256 amount);
    event StreamClaimed(uint256 indexed streamId, address indexed recipient, uint256 amount);
    event StreamCompleted(uint256 indexed streamId);
    event AgentServiceCreated(string indexed serviceName, uint256 pricePerUse);
    event AgentServiceUsed(string indexed serviceName, address indexed user, uint256 amount);
    event BalanceWithdrawn(address indexed user, uint256 amount);
    
    // Modifiers
    modifier onlyProjectContract() {
        require(msg.sender == address(projectContract), "Only project contract");
        _;
    }
    
    modifier streamExists(uint256 streamId) {
        require(streams[streamId].isActive, "Stream does not exist");
        _;
    }
    
    modifier serviceExists(string memory serviceName) {
        require(agentServices[serviceName].isActive, "Service does not exist");
        _;
    }
    
    constructor(address _projectContract, address _usdcToken) Ownable() {
        projectContract = FoundlingProject(_projectContract);
        usdcToken = IERC20(_usdcToken);
        
        // Initialize default agent services
        _createAgentService("idea_analysis", "AI-powered idea feasibility analysis", 50 * 10**6); // 50 USDC
        _createAgentService("builder_matching", "AI-driven builder-executor matching", 100 * 10**6); // 100 USDC
        _createAgentService("funding_intelligence", "VC database analysis and targeting", 200 * 10**6); // 200 USDC
        _createAgentService("pitch_generation", "AI-generated investor pitch decks", 150 * 10**6); // 150 USDC
    }
    
    /**
     * @dev Create a milestone-based USDC stream (called by project contract)
     */
    function createMilestoneStream(
        uint256 projectId,
        uint256 milestoneId,
        address recipient,
        uint256 amount,
        uint256 duration
    ) external onlyProjectContract returns (uint256) {
        require(amount > 0, "Amount must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        require(recipient != address(0), "Invalid recipient");
        
        streamCounter++;
        uint256 streamId = streamCounter;
        
        StreamConfig storage newStream = streams[streamId];
        newStream.projectId = projectId;
        newStream.milestoneId = milestoneId;
        newStream.recipient = recipient;
        newStream.amount = amount;
        newStream.startTime = block.timestamp;
        newStream.endTime = block.timestamp + duration;
        newStream.lastClaimTime = block.timestamp;
        newStream.isActive = true;
        newStream.totalClaimed = 0;
        
        emit StreamCreated(streamId, projectId, milestoneId, recipient, amount);
        
        return streamId;
    }
    
    /**
     * @dev Claim available USDC from a stream
     */
    function claimStream(uint256 streamId) external nonReentrant streamExists(streamId) {
        StreamConfig storage stream = streams[streamId];
        require(msg.sender == stream.recipient, "Only recipient can claim");
        
        uint256 claimableAmount = _calculateClaimableAmount(stream);
        require(claimableAmount > 0, "No amount to claim");
        
        stream.lastClaimTime = block.timestamp;
        stream.totalClaimed += claimableAmount;
        
        // Check if stream is completed
        if (stream.totalClaimed >= stream.amount) {
            stream.isActive = false;
            emit StreamCompleted(streamId);
        }
        
        // Transfer USDC to recipient
        require(usdcToken.transfer(msg.sender, claimableAmount), "USDC transfer failed");
        
        emit StreamClaimed(streamId, msg.sender, claimableAmount);
    }
    
    /**
     * @dev Use an agent service
     */
    function useAgentService(string memory serviceName) external payable nonReentrant serviceExists(serviceName) {
        AgentService storage service = agentServices[serviceName];
        require(msg.value >= service.pricePerUse, "Insufficient payment");
        
        // Update service metrics
        service.totalUsage++;
        service.totalRevenue += msg.value;
        
        // Add to user balance for potential refunds
        userBalances[msg.sender] += msg.value;
        
        emit AgentServiceUsed(serviceName, msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw user balance
     */
    function withdrawBalance() external nonReentrant {
        uint256 balance = userBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        
        userBalances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdrawal failed");
        
        emit BalanceWithdrawn(msg.sender, balance);
    }
    
    /**
     * @dev Get stream details
     */
    function getStream(uint256 streamId) external view returns (
        uint256 projectId,
        uint256 milestoneId,
        address recipient,
        uint256 amount,
        uint256 startTime,
        uint256 endTime,
        uint256 lastClaimTime,
        bool isActive,
        uint256 totalClaimed
    ) {
        StreamConfig storage stream = streams[streamId];
        return (
            stream.projectId,
            stream.milestoneId,
            stream.recipient,
            stream.amount,
            stream.startTime,
            stream.endTime,
            stream.lastClaimTime,
            stream.isActive,
            stream.totalClaimed
        );
    }
    
    /**
     * @dev Get agent service details
     */
    function getAgentService(string memory serviceName) external view returns (
        string memory description,
        uint256 pricePerUse,
        bool isActive,
        uint256 totalUsage,
        uint256 totalRevenue
    ) {
        AgentService storage service = agentServices[serviceName];
        return (
            service.description,
            service.pricePerUse,
            service.isActive,
            service.totalUsage,
            service.totalRevenue
        );
    }
    
    /**
     * @dev Get all service names
     */
    function getAllServiceNames() external view returns (string[] memory) {
        return serviceNames;
    }
    
    /**
     * @dev Calculate claimable amount for a stream
     */
    function _calculateClaimableAmount(StreamConfig storage stream) internal view returns (uint256) {
        if (!stream.isActive) return 0;
        
        uint256 currentTime = block.timestamp;
        uint256 streamDuration = stream.endTime - stream.startTime;
        uint256 elapsedTime = currentTime - stream.startTime;
        
        if (elapsedTime >= streamDuration) {
            // Stream completed, return remaining amount
            return stream.amount - stream.totalClaimed;
        }
        
        // Calculate proportional amount based on time elapsed
        uint256 proportionalAmount = (stream.amount * elapsedTime) / streamDuration;
        uint256 claimable = proportionalAmount - stream.totalClaimed;
        
        return claimable > 0 ? claimable : 0;
    }
    
    /**
     * @dev Create a new agent service (only owner)
     */
    function _createAgentService(
        string memory name,
        string memory description,
        uint256 pricePerUse
    ) internal {
        agentServices[name] = AgentService({
            name: name,
            description: description,
            pricePerUse: pricePerUse,
            isActive: true,
            totalUsage: 0,
            totalRevenue: 0
        });
        
        serviceNames.push(name);
        emit AgentServiceCreated(name, pricePerUse);
    }
    
    /**
     * @dev Update agent service (only owner)
     */
    function updateAgentService(
        string memory serviceName,
        uint256 newPrice,
        bool isActive
    ) external onlyOwner serviceExists(serviceName) {
        agentServices[serviceName].pricePerUse = newPrice;
        agentServices[serviceName].isActive = isActive;
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Emergency USDC withdrawal (only owner)
     */
    function emergencyWithdrawUSDC() external onlyOwner {
        uint256 balance = usdcToken.balanceOf(address(this));
        require(balance > 0, "No USDC balance to withdraw");
        
        require(usdcToken.transfer(owner(), balance), "USDC transfer failed");
    }
}


