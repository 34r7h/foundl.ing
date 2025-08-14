// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./FoundlingIdea.sol";

/**
 * @title FoundlingProject
 * @dev Contract for managing project execution and milestone tracking
 */
contract FoundlingProject is Ownable, ReentrancyGuard, Pausable {
    FoundlingIdea public ideaContract;
    
    struct Milestone {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        uint256 deadline;
        bool isCompleted;
        bool isPaid;
        address executor;
        uint256 completedAt;
    }
    
    struct Project {
        uint256 id;
        uint256 ideaTokenId;
        address creator;
        address executor;
        string title;
        string description;
        uint256 totalBudget;
        uint256 currentMilestone;
        uint256 createdAt;
        ProjectStatus status;
        Milestone[] milestones;
        mapping(uint256 => uint256) milestoneIndexes; // milestone id to array index
    }
    
    enum ProjectStatus {
        Open,
        InProgress,
        Completed,
        Cancelled,
        Disputed
    }
    
    // Project tracking
    mapping(uint256 => Project) public projects;
    uint256 public projectCounter;
    
    // Events
    event ProjectCreated(uint256 indexed projectId, uint256 indexed ideaTokenId, address indexed creator);
    event ExecutorAssigned(uint256 indexed projectId, address indexed executor);
    event MilestoneAdded(uint256 indexed projectId, uint256 indexed milestoneId, string title, uint256 amount);
    event MilestoneCompleted(uint256 indexed projectId, uint256 indexed milestoneId, address indexed executor);
    event MilestonePaid(uint256 indexed projectId, uint256 indexed milestoneId, address indexed executor, uint256 amount);
    event ProjectStatusChanged(uint256 indexed projectId, ProjectStatus status);
    
    // Modifiers
    modifier onlyProjectCreator(uint256 projectId) {
        require(projects[projectId].creator == msg.sender, "Only project creator");
        _;
    }
    
    modifier onlyExecutor(uint256 projectId) {
        require(projects[projectId].executor == msg.sender, "Only project executor");
        _;
    }
    
    modifier projectExists(uint256 projectId) {
        require(projects[projectId].id != 0, "Project does not exist");
        _;
    }
    
    modifier milestoneExists(uint256 projectId, uint256 milestoneId) {
        require(projects[projectId].milestoneIndexes[milestoneId] != 0, "Milestone does not exist");
        _;
    }
    
    constructor(address _ideaContract) Ownable() {
        ideaContract = FoundlingIdea(_ideaContract);
    }
    
    /**
     * @dev Create a new project from an idea
     */
    function createProject(
        uint256 ideaTokenId,
        string memory title,
        string memory description,
        uint256 totalBudget
    ) external returns (uint256) {
        require(ideaContract.ownerOf(ideaTokenId) == msg.sender, "Must own idea NFT");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(totalBudget > 0, "Budget must be greater than 0");
        
        projectCounter++;
        uint256 projectId = projectCounter;
        
        Project storage newProject = projects[projectId];
        newProject.id = projectId;
        newProject.ideaTokenId = ideaTokenId;
        newProject.creator = msg.sender;
        newProject.title = title;
        newProject.description = description;
        newProject.totalBudget = totalBudget;
        newProject.currentMilestone = 0;
        newProject.createdAt = block.timestamp;
        newProject.status = ProjectStatus.Open;
        
        emit ProjectCreated(projectId, ideaTokenId, msg.sender);
        
        return projectId;
    }
    
    /**
     * @dev Assign an executor to a project
     */
    function assignExecutor(uint256 projectId, address executor) external onlyProjectCreator(projectId) {
        require(projects[projectId].status == ProjectStatus.Open, "Project not open for execution");
        require(executor != address(0), "Invalid executor address");
        require(executor != msg.sender, "Cannot assign self as executor");
        
        projects[projectId].executor = executor;
        projects[projectId].status = ProjectStatus.InProgress;
        
        emit ExecutorAssigned(projectId, executor);
        emit ProjectStatusChanged(projectId, ProjectStatus.InProgress);
    }
    
    /**
     * @dev Add a milestone to a project
     */
    function addMilestone(
        uint256 projectId,
        string memory title,
        string memory description,
        uint256 amount,
        uint256 deadline
    ) external onlyProjectCreator(projectId) {
        require(projects[projectId].status == ProjectStatus.InProgress, "Project must be in progress");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(amount > 0, "Amount must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        
        Project storage project = projects[projectId];
        
        uint256 milestoneId = project.milestones.length + 1;
        Milestone memory newMilestone = Milestone({
            id: milestoneId,
            title: title,
            description: description,
            amount: amount,
            deadline: deadline,
            isCompleted: false,
            isPaid: false,
            executor: project.executor,
            completedAt: 0
        });
        
        project.milestones.push(newMilestone);
        project.milestoneIndexes[milestoneId] = project.milestones.length - 1;
        
        emit MilestoneAdded(projectId, milestoneId, title, amount);
    }
    
    /**
     * @dev Complete a milestone
     */
    function completeMilestone(uint256 projectId, uint256 milestoneId) 
        external 
        onlyExecutor(projectId) 
        projectExists(projectId) 
        milestoneExists(projectId, milestoneId) 
    {
        Project storage project = projects[projectId];
        uint256 milestoneIndex = project.milestoneIndexes[milestoneId];
        Milestone storage milestone = project.milestones[milestoneIndex];
        
        require(!milestone.isCompleted, "Milestone already completed");
        require(block.timestamp <= milestone.deadline, "Milestone deadline passed");
        
        milestone.isCompleted = true;
        milestone.completedAt = block.timestamp;
        project.currentMilestone = milestoneId;
        
        emit MilestoneCompleted(projectId, milestoneId, msg.sender);
        
        // Check if all milestones are completed
        bool allCompleted = true;
        for (uint256 i = 0; i < project.milestones.length; i++) {
            if (!project.milestones[i].isCompleted) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            project.status = ProjectStatus.Completed;
            emit ProjectStatusChanged(projectId, ProjectStatus.Completed);
        }
    }
    
    /**
     * @dev Pay for a completed milestone
     */
    function payMilestone(uint256 projectId, uint256 milestoneId) 
        external 
        payable 
        nonReentrant 
        onlyProjectCreator(projectId) 
        projectExists(projectId) 
        milestoneExists(projectId, milestoneId) 
    {
        Project storage project = projects[projectId];
        uint256 milestoneIndex = project.milestoneIndexes[milestoneId];
        Milestone storage milestone = project.milestones[milestoneIndex];
        
        require(milestone.isCompleted, "Milestone not completed");
        require(!milestone.isPaid, "Milestone already paid");
        require(msg.value == milestone.amount, "Incorrect payment amount");
        
        milestone.isPaid = true;
        
        // Transfer payment to executor
        (bool success, ) = milestone.executor.call{value: msg.value}("");
        require(success, "Payment transfer failed");
        
        emit MilestonePaid(projectId, milestoneId, milestone.executor, msg.value);
    }
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 projectId) external view returns (
        uint256 ideaTokenId,
        address creator,
        address executor,
        string memory title,
        string memory description,
        uint256 totalBudget,
        uint256 currentMilestone,
        uint256 createdAt,
        ProjectStatus status,
        uint256 milestoneCount
    ) {
        require(projects[projectId].id != 0, "Project does not exist");
        Project storage project = projects[projectId];
        
        return (
            project.ideaTokenId,
            project.creator,
            project.executor,
            project.title,
            project.description,
            project.totalBudget,
            project.currentMilestone,
            project.createdAt,
            project.status,
            project.milestones.length
        );
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 projectId, uint256 milestoneId) external view returns (
        string memory title,
        string memory description,
        uint256 amount,
        uint256 deadline,
        bool isCompleted,
        bool isPaid,
        address executor,
        uint256 completedAt
    ) {
        require(projects[projectId].id != 0, "Project does not exist");
        require(projects[projectId].milestoneIndexes[milestoneId] != 0, "Milestone does not exist");
        
        Project storage project = projects[projectId];
        uint256 milestoneIndex = project.milestoneIndexes[milestoneId];
        Milestone storage milestone = project.milestones[milestoneIndex];
        
        return (
            milestone.title,
            milestone.description,
            milestone.amount,
            milestone.deadline,
            milestone.isCompleted,
            milestone.isPaid,
            milestone.executor,
            milestone.completedAt
        );
    }
    
    /**
     * @dev Get all milestones for a project
     */
    function getProjectMilestones(uint256 projectId) external view returns (uint256[] memory) {
        require(projects[projectId].id != 0, "Project does not exist");
        Project storage project = projects[projectId];
        
        uint256[] memory milestoneIds = new uint256[](project.milestones.length);
        for (uint256 i = 0; i < project.milestones.length; i++) {
            milestoneIds[i] = project.milestones[i].id;
        }
        
        return milestoneIds;
    }
    
    /**
     * @dev Cancel a project (only creator)
     */
    function cancelProject(uint256 projectId) external onlyProjectCreator(projectId) {
        require(projects[projectId].status == ProjectStatus.Open, "Project not open");
        
        projects[projectId].status = ProjectStatus.Cancelled;
        emit ProjectStatusChanged(projectId, ProjectStatus.Cancelled);
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}


