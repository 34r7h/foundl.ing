// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./FoundlingIdea.sol";

/**
 * @title FoundlingProject
 * @dev NFT contract for project management with milestone enforcement and investor deals
 */
contract FoundlingProject is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    FoundlingIdea public ideaContract;
    
    // Investor deal structure
    struct InvestorDeal {
        uint256 dealId;
        address investor;
        uint256 fundingAmount;
        uint256 equityPercentage;
        string terms;
        uint256 proposedAt;
        bool isAccepted;
        bool isRejected;
        bool isActive;
        uint256 fundedAt;
    }
    
    // Milestone structure with deadline enforcement
    struct Milestone {
        uint256 id;
        string title;
        string description;
        uint256 amount;
        uint256 deadline;
        bool isCompleted;
        bool isPaid;
        bool isOverdue;
        address executor;
        uint256 completedAt;
    }
    
    // Project structure
    struct Project {
        uint256 tokenId;
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
        mapping(uint256 => uint256) milestoneIndexes;
        InvestorDeal[] investorDeals;
        uint256 acceptedDealId;
        uint256 totalFunding;
        uint256 executorEquity;
        uint256 investorEquity;
        uint256 creatorEquity;
    }
    
    enum ProjectStatus {
        Open,           // Open for investor deals
        Funded,         // Investor deal accepted, project funded
        InProgress,     // Milestones being executed
        Completed,      // All milestones completed
        Failed,         // Milestones failed, back to open
        Cancelled       // Project cancelled
    }
    
    // Project tracking
    mapping(uint256 => Project) public projects;
    
    // Deal counter
    uint256 public dealCounter;
    
    // Events
    event ProjectCreated(uint256 indexed projectTokenId, uint256 indexed ideaTokenId, address indexed creator);
    event MilestoneAdded(uint256 indexed projectTokenId, uint256 indexed milestoneId, string title, uint256 amount, uint256 deadline);
    event MilestoneCompleted(uint256 indexed projectTokenId, uint256 indexed milestoneId, address indexed executor);
    event MilestoneFailed(uint256 indexed projectTokenId, uint256 indexed milestoneId, uint256 deadline);
    event MilestonePaid(uint256 indexed projectTokenId, uint256 indexed milestoneId, address indexed executor, uint256 amount);
    event InvestorDealProposed(uint256 indexed projectTokenId, uint256 indexed dealId, address indexed investor);
    event InvestorDealAccepted(uint256 indexed projectTokenId, uint256 indexed dealId, address indexed investor);
    event InvestorDealRejected(uint256 indexed projectTokenId, uint256 indexed dealId, address indexed investor);
    event ProjectStatusChanged(uint256 indexed projectTokenId, ProjectStatus status);
    event ProjectFailed(uint256 indexed projectTokenId, string reason);
    
    // Modifiers
    modifier onlyProjectCreator(uint256 projectTokenId) {
        require(projects[projectTokenId].creator == msg.sender, "Only project creator");
        _;
    }
    
    modifier onlyExecutor(uint256 projectTokenId) {
        require(projects[projectTokenId].executor == msg.sender, "Only project executor");
        _;
    }
    
    modifier projectExists(uint256 projectTokenId) {
        require(projects[projectTokenId].tokenId != 0, "Project does not exist");
        _;
    }
    
    modifier milestoneExists(uint256 projectTokenId, uint256 milestoneId) {
        require(projects[projectTokenId].milestoneIndexes[milestoneId] != 0, "Milestone does not exist");
        _;
    }
    
    constructor(address _ideaContract) ERC721("FoundlingProject", "FPROJ") Ownable() {
        ideaContract = FoundlingIdea(_ideaContract);
    }
    
    /**
     * @dev Create a new project from an accepted idea execution proposal
     */
    function createProject(
        uint256 ideaTokenId,
        string memory title,
        string memory description,
        uint256 totalBudget,
        string memory tokenURI
    ) external returns (uint256) {
        require(ideaContract.ownerOf(ideaTokenId) == msg.sender, "Must own idea NFT");
        require(ideaContract.getIdea(ideaTokenId).status == IdeaStatus.InExecution, "Idea not in execution");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(totalBudget > 0, "Budget must be greater than 0");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Get accepted execution proposal details
        (
            address executor,
            , // executionPlan
            , // proposedBudget
            , // estimatedDuration
            uint256 equityRequested
        ) = ideaContract.getAcceptedProposal(ideaTokenId);
        
        // Initialize project data
        Project storage newProject = projects[newTokenId];
        newProject.tokenId = newTokenId;
        newProject.ideaTokenId = ideaTokenId;
        newProject.creator = msg.sender;
        newProject.executor = executor;
        newProject.title = title;
        newProject.description = description;
        newProject.totalBudget = totalBudget;
        newProject.currentMilestone = 0;
        newProject.createdAt = block.timestamp;
        newProject.status = ProjectStatus.Open;
        newProject.executorEquity = equityRequested;
        newProject.creatorEquity = 100 - equityRequested;
        newProject.investorEquity = 0;
        
        // Link project to idea
        ideaContract.linkProject(ideaTokenId, newTokenId);
        
        emit ProjectCreated(newTokenId, ideaTokenId, msg.sender);
        
        return newTokenId;
    }
    
    /**
     * @dev Add a milestone to a project
     */
    function addMilestone(
        uint256 projectTokenId,
        string memory title,
        string memory description,
        uint256 amount,
        uint256 deadline
    ) external onlyProjectCreator(projectTokenId) {
        require(projects[projectTokenId].status == ProjectStatus.Open || projects[projectTokenId].status == ProjectStatus.Funded, "Project not open for milestones");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(amount > 0, "Amount must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        
        Project storage project = projects[projectTokenId];
        
        uint256 milestoneId = project.milestones.length + 1;
        Milestone memory newMilestone = Milestone({
            id: milestoneId,
            title: title,
            description: description,
            amount: amount,
            deadline: deadline,
            isCompleted: false,
            isPaid: false,
            isOverdue: false,
            executor: project.executor,
            completedAt: 0
        });
        
        project.milestones.push(newMilestone);
        project.milestoneIndexes[milestoneId] = project.milestones.length - 1;
        
        emit MilestoneAdded(projectTokenId, milestoneId, title, amount, deadline);
    }
    
    /**
     * @dev Complete a milestone
     */
    function completeMilestone(uint256 projectTokenId, uint256 milestoneId) 
        external 
        onlyExecutor(projectTokenId) 
        projectExists(projectTokenId) 
        milestoneExists(projectTokenId, milestoneId) 
    {
        Project storage project = projects[projectTokenId];
        uint256 milestoneIndex = project.milestoneIndexes[milestoneId];
        Milestone storage milestone = project.milestones[milestoneIndex];
        
        require(!milestone.isCompleted, "Milestone already completed");
        require(block.timestamp <= milestone.deadline, "Milestone deadline passed");
        
        milestone.isCompleted = true;
        milestone.completedAt = block.timestamp;
        project.currentMilestone = milestoneId;
        
        emit MilestoneCompleted(projectTokenId, milestoneId, msg.sender);
        
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
            emit ProjectStatusChanged(projectTokenId, ProjectStatus.Completed);
            
            // Update idea status to completed
            ideaContract.updateIdeaStatus(project.ideaTokenId, IdeaStatus.Completed);
        }
    }
    
    /**
     * @dev Check milestone deadlines and fail overdue ones
     */
    function checkMilestoneDeadlines(uint256 projectTokenId) external {
        Project storage project = projects[projectTokenId];
        require(project.status == ProjectStatus.Funded || project.status == ProjectStatus.InProgress, "Project not in execution");
        
        bool hasOverdue = false;
        
        for (uint256 i = 0; i < project.milestones.length; i++) {
            Milestone storage milestone = project.milestones[i];
            
            if (!milestone.isCompleted && !milestone.isOverdue && block.timestamp > milestone.deadline) {
                milestone.isOverdue = true;
                hasOverdue = true;
                
                emit MilestoneFailed(projectTokenId, milestone.id, milestone.deadline);
            }
        }
        
        // If any milestone is overdue, fail the project
        if (hasOverdue) {
            project.status = ProjectStatus.Failed;
            emit ProjectStatusChanged(projectTokenId, ProjectStatus.Failed);
            emit ProjectFailed(projectTokenId, "Milestone deadlines not met");
            
            // Update idea status back to open for new execution
            ideaContract.updateIdeaStatus(project.ideaTokenId, IdeaStatus.Open);
        }
    }
    
    /**
     * @dev Submit investor deal proposal
     */
    function submitInvestorDeal(
        uint256 projectTokenId,
        uint256 fundingAmount,
        uint256 equityPercentage,
        string memory terms
    ) external returns (uint256) {
        require(projects[projectTokenId].status == ProjectStatus.Open, "Project not open for funding");
        require(msg.sender != projects[projectTokenId].creator, "Creator cannot fund own project");
        require(msg.sender != projects[projectTokenId].executor, "Executor cannot fund own project");
        require(fundingAmount > 0, "Funding amount must be greater than 0");
        require(equityPercentage > 0 && equityPercentage <= 100, "Invalid equity percentage");
        
        Project storage project = projects[projectTokenId];
        require(project.investorEquity + equityPercentage <= 100, "Total equity cannot exceed 100%");
        
        dealCounter++;
        uint256 dealId = dealCounter;
        
        InvestorDeal memory newDeal = InvestorDeal({
            dealId: dealId,
            investor: msg.sender,
            fundingAmount: fundingAmount,
            equityPercentage: equityPercentage,
            terms: terms,
            proposedAt: block.timestamp,
            isAccepted: false,
            isRejected: false,
            isActive: false,
            fundedAt: 0
        });
        
        project.investorDeals.push(newDeal);
        
        emit InvestorDealProposed(projectTokenId, dealId, msg.sender);
        
        return dealId;
    }
    
    /**
     * @dev Accept investor deal (only project creator)
     */
    function acceptInvestorDeal(uint256 projectTokenId, uint256 dealId) external onlyProjectCreator(projectTokenId) {
        require(projects[projectTokenId].status == ProjectStatus.Open, "Project not open for funding");
        
        Project storage project = projects[projectTokenId];
        bool dealFound = false;
        
        for (uint256 i = 0; i < project.investorDeals.length; i++) {
            if (project.investorDeals[i].dealId == dealId) {
                require(!project.investorDeals[i].isAccepted && !project.investorDeals[i].isRejected, "Deal already processed");
                
                project.investorDeals[i].isAccepted = true;
                project.investorDeals[i].isActive = true;
                project.acceptedDealId = dealId;
                project.investorEquity = project.investorDeals[i].equityPercentage;
                project.totalFunding = project.investorDeals[i].fundingAmount;
                project.status = ProjectStatus.Funded;
                
                dealFound = true;
                
                emit InvestorDealAccepted(projectTokenId, dealId, project.investorDeals[i].investor);
                emit ProjectStatusChanged(projectTokenId, ProjectStatus.Funded);
                break;
            }
        }
        
        require(dealFound, "Deal not found");
    }
    
    /**
     * @dev Reject investor deal (only project creator)
     */
    function rejectInvestorDeal(uint256 projectTokenId, uint256 dealId) external onlyProjectCreator(projectTokenId) {
        require(projects[projectTokenId].status == ProjectStatus.Open, "Project not open for funding");
        
        Project storage project = projects[projectTokenId];
        bool dealFound = false;
        
        for (uint256 i = 0; i < project.investorDeals.length; i++) {
            if (project.investorDeals[i].dealId == dealId) {
                require(!project.investorDeals[i].isAccepted && !project.investorDeals[i].isRejected, "Deal already processed");
                
                project.investorDeals[i].isRejected = true;
                dealFound = true;
                
                emit InvestorDealRejected(projectTokenId, dealId, project.investorDeals[i].investor);
                break;
            }
        }
        
        require(dealFound, "Deal not found");
    }
    
    /**
     * @dev Pay for a completed milestone
     */
    function payMilestone(uint256 projectTokenId, uint256 milestoneId) 
        external 
        payable 
        nonReentrant 
        onlyProjectCreator(projectTokenId) 
        projectExists(projectTokenId) 
        milestoneExists(projectTokenId, milestoneId) 
    {
        Project storage project = projects[projectTokenId];
        uint256 milestoneIndex = project.milestoneIndexes[milestoneId];
        Milestone storage milestone = project.milestones[milestoneIndex];
        
        require(milestone.isCompleted, "Milestone not completed");
        require(!milestone.isPaid, "Milestone already paid");
        require(msg.value == milestone.amount, "Incorrect payment amount");
        require(project.status == ProjectStatus.Funded, "Project not funded");
        
        milestone.isPaid = true;
        
        // Transfer payment to executor
        (bool success, ) = milestone.executor.call{value: msg.value}("");
        require(success, "Payment transfer failed");
        
        emit MilestonePaid(projectTokenId, milestoneId, milestone.executor, msg.value);
    }
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 projectTokenId) external view returns (
        uint256 ideaTokenId,
        address creator,
        address executor,
        string memory title,
        string memory description,
        uint256 totalBudget,
        uint256 currentMilestone,
        uint256 createdAt,
        ProjectStatus status,
        uint256 milestoneCount,
        uint256 totalFunding,
        uint256 executorEquity,
        uint256 investorEquity,
        uint256 creatorEquity
    ) {
        require(projects[projectTokenId].tokenId != 0, "Project does not exist");
        Project storage project = projects[projectTokenId];
        
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
            project.milestones.length,
            project.totalFunding,
            project.executorEquity,
            project.investorEquity,
            project.creatorEquity
        );
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 projectTokenId, uint256 milestoneId) external view returns (
        string memory title,
        string memory description,
        uint256 amount,
        uint256 deadline,
        bool isCompleted,
        bool isPaid,
        bool isOverdue,
        address executor,
        uint256 completedAt
    ) {
        require(projects[projectTokenId].tokenId != 0, "Project does not exist");
        require(projects[projectTokenId].milestoneIndexes[milestoneId] != 0, "Milestone does not exist");
        
        Project storage project = projects[projectTokenId];
        uint256 milestoneIndex = project.milestoneIndexes[milestoneId];
        Milestone storage milestone = project.milestones[milestoneIndex];
        
        return (
            milestone.title,
            milestone.description,
            milestone.amount,
            milestone.deadline,
            milestone.isCompleted,
            milestone.isPaid,
            milestone.isOverdue,
            milestone.executor,
            milestone.completedAt
        );
    }
    
    /**
     * @dev Get investor deal details
     */
    function getInvestorDeal(uint256 projectTokenId, uint256 dealId) external view returns (
        address investor,
        uint256 fundingAmount,
        uint256 equityPercentage,
        string memory terms,
        uint256 proposedAt,
        bool isAccepted,
        bool isRejected,
        bool isActive,
        uint256 fundedAt
    ) {
        require(projects[projectTokenId].tokenId != 0, "Project does not exist");
        Project storage project = projects[projectTokenId];
        
        for (uint256 i = 0; i < project.investorDeals.length; i++) {
            if (project.investorDeals[i].dealId == dealId) {
                InvestorDeal storage deal = project.investorDeals[i];
                return (
                    deal.investor,
                    deal.fundingAmount,
                    deal.equityPercentage,
                    deal.terms,
                    deal.proposedAt,
                    deal.isAccepted,
                    deal.isRejected,
                    deal.isActive,
                    deal.fundedAt
                );
            }
        }
        
        revert("Deal not found");
    }
    
    /**
     * @dev Get all milestones for a project
     */
    function getProjectMilestones(uint256 projectTokenId) external view returns (uint256[] memory) {
        require(projects[projectTokenId].tokenId != 0, "Project does not exist");
        Project storage project = projects[projectTokenId];
        
        uint256[] memory milestoneIds = new uint256[](project.milestones.length);
        for (uint256 i = 0; i < project.milestones.length; i++) {
            milestoneIds[i] = project.milestones[i].id;
        }
        
        return milestoneIds;
    }
    
    /**
     * @dev Get all investor deals for a project
     */
    function getProjectInvestorDeals(uint256 projectTokenId) external view returns (uint256[] memory) {
        require(projects[projectTokenId].tokenId != 0, "Project does not exist");
        Project storage project = projects[projectTokenId];
        
        uint256[] memory dealIds = new uint256[](project.investorDeals.length);
        for (uint256 i = 0; i < project.investorDeals.length; i++) {
            dealIds[i] = project.investorDeals[i].dealId;
        }
        
        return dealIds;
    }
    
    /**
     * @dev Override required functions
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}


