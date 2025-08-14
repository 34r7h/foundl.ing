// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FoundlingIdea
 * @dev NFT contract representing idea provenance equity with execution bidding system
 */
contract FoundlingIdea is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Execution proposal structure
    struct ExecutionProposal {
        uint256 proposalId;
        address executor;
        string executionPlan;
        uint256 proposedBudget;
        uint256 estimatedDuration;
        uint256 equityRequested; // Percentage (0-100)
        uint256 proposedAt;
        bool isAccepted;
        bool isRejected;
    }
    
    // Idea metadata
    struct Idea {
        uint256 tokenId;
        address creator;
        string title;
        string description;
        string category;
        uint256 createdAt;
        uint256 royaltyPercentage; // 5% = 500 (basis points)
        IdeaStatus status;
        uint256 totalFunding;
        address[] funders;
        mapping(address => uint256) fundingAmounts;
        ExecutionProposal[] executionProposals;
        uint256 acceptedProposalId;
        uint256 projectTokenId; // Links to FoundlingProject when executed
    }
    
    enum IdeaStatus {
        Open,           // Open for execution proposals
        InExecution,    // Execution proposal accepted, project created
        Funded,         // Project funded and in progress
        Completed,      // Project completed successfully
        Failed          // Project failed, back to open status
    }
    
    // Token ID to Idea mapping
    mapping(uint256 => Idea) public ideas;
    
    // Proposal counter
    uint256 public proposalCounter;
    
    // Events
    event IdeaCreated(uint256 indexed tokenId, address indexed creator, string title);
    event ExecutionProposalSubmitted(uint256 indexed tokenId, uint256 indexed proposalId, address indexed executor);
    event ExecutionProposalAccepted(uint256 indexed tokenId, uint256 indexed proposalId, address indexed executor);
    event ExecutionProposalRejected(uint256 indexed tokenId, uint256 indexed proposalId, address indexed executor);
    event IdeaStatusChanged(uint256 indexed tokenId, IdeaStatus status);
    event ProjectCreated(uint256 indexed tokenId, uint256 indexed projectTokenId);
    
    // Constants
    uint256 public constant ROYALTY_BASIS_POINTS = 500; // 5%
    uint256 public constant MIN_FUNDING_AMOUNT = 0.01 ether;
    
    constructor() ERC721("FoundlingIdea", "FIDEA") Ownable() {}
    
    /**
     * @dev Create a new idea and mint NFT
     */
    function createIdea(
        string memory title,
        string memory description,
        string memory category,
        string memory tokenURI
    ) external returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(bytes(category).length > 0, "Category cannot be empty");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Initialize idea data
        Idea storage newIdea = ideas[newTokenId];
        newIdea.tokenId = newTokenId;
        newIdea.creator = msg.sender;
        newIdea.title = title;
        newIdea.description = description;
        newIdea.category = category;
        newIdea.createdAt = block.timestamp;
        newIdea.royaltyPercentage = ROYALTY_BASIS_POINTS;
        newIdea.status = IdeaStatus.Open;
        newIdea.totalFunding = 0;
        newIdea.acceptedProposalId = 0;
        newIdea.projectTokenId = 0;
        
        emit IdeaCreated(newTokenId, msg.sender, title);
        
        return newTokenId;
    }
    
    /**
     * @dev Submit execution proposal for an idea
     */
    function submitExecutionProposal(
        uint256 tokenId,
        string memory executionPlan,
        uint256 proposedBudget,
        uint256 estimatedDuration,
        uint256 equityRequested
    ) external returns (uint256) {
        require(_exists(tokenId), "Idea does not exist");
        require(ideas[tokenId].status == IdeaStatus.Open, "Idea not open for execution");
        require(msg.sender != ideas[tokenId].creator, "Creator cannot execute own idea");
        require(bytes(executionPlan).length > 0, "Execution plan cannot be empty");
        require(proposedBudget > 0, "Budget must be greater than 0");
        require(estimatedDuration > 0, "Duration must be greater than 0");
        require(equityRequested <= 100, "Equity cannot exceed 100%");
        
        proposalCounter++;
        uint256 proposalId = proposalCounter;
        
        ExecutionProposal memory newProposal = ExecutionProposal({
            proposalId: proposalId,
            executor: msg.sender,
            executionPlan: executionPlan,
            proposedBudget: proposedBudget,
            estimatedDuration: estimatedDuration,
            equityRequested: equityRequested,
            proposedAt: block.timestamp,
            isAccepted: false,
            isRejected: false
        });
        
        ideas[tokenId].executionProposals.push(newProposal);
        
        emit ExecutionProposalSubmitted(tokenId, proposalId, msg.sender);
        
        return proposalId;
    }
    
    /**
     * @dev Accept an execution proposal (only idea creator)
     */
    function acceptExecutionProposal(uint256 tokenId, uint256 proposalId) external {
        require(_exists(tokenId), "Idea does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only creator can accept proposals");
        require(ideas[tokenId].status == IdeaStatus.Open, "Idea not open for execution");
        
        Idea storage idea = ideas[tokenId];
        bool proposalFound = false;
        
        for (uint256 i = 0; i < idea.executionProposals.length; i++) {
            if (idea.executionProposals[i].proposalId == proposalId) {
                require(!idea.executionProposals[i].isAccepted && !idea.executionProposals[i].isRejected, "Proposal already processed");
                
                idea.executionProposals[i].isAccepted = true;
                idea.acceptedProposalId = proposalId;
                idea.status = IdeaStatus.InExecution;
                proposalFound = true;
                
                emit ExecutionProposalAccepted(tokenId, proposalId, idea.executionProposals[i].executor);
                emit IdeaStatusChanged(tokenId, IdeaStatus.InExecution);
                break;
            }
        }
        
        require(proposalFound, "Proposal not found");
    }
    
    /**
     * @dev Reject an execution proposal (only idea creator)
     */
    function rejectExecutionProposal(uint256 tokenId, uint256 proposalId) external {
        require(_exists(tokenId), "Idea does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only creator can reject proposals");
        require(ideas[tokenId].status == IdeaStatus.Open, "Idea not open for execution");
        
        Idea storage idea = ideas[tokenId];
        bool proposalFound = false;
        
        for (uint256 i = 0; i < idea.executionProposals.length; i++) {
            if (idea.executionProposals[i].proposalId == proposalId) {
                require(!idea.executionProposals[i].isAccepted && !idea.executionProposals[i].isRejected, "Proposal already processed");
                
                idea.executionProposals[i].isRejected = true;
                proposalFound = true;
                
                emit ExecutionProposalRejected(tokenId, proposalId, idea.executionProposals[i].executor);
                break;
            }
        }
        
        require(proposalFound, "Proposal not found");
    }
    
    /**
     * @dev Link project NFT when execution begins
     */
    function linkProject(uint256 tokenId, uint256 projectTokenId) external {
        require(_exists(tokenId), "Idea does not exist");
        require(ideas[tokenId].status == IdeaStatus.InExecution, "Idea not in execution");
        require(ideas[tokenId].projectTokenId == 0, "Project already linked");
        
        ideas[tokenId].projectTokenId = projectTokenId;
        emit ProjectCreated(tokenId, projectTokenId);
    }
    
    /**
     * @dev Update idea status (only creator or linked project contract)
     */
    function updateIdeaStatus(uint256 tokenId, IdeaStatus newStatus) external {
        require(_exists(tokenId), "Idea does not exist");
        require(
            ownerOf(tokenId) == msg.sender || 
            ideas[tokenId].projectTokenId != 0, // Allow linked project contract
            "Not authorized"
        );
        
        ideas[tokenId].status = newStatus;
        emit IdeaStatusChanged(tokenId, newStatus);
    }
    
    /**
     * @dev Get idea details
     */
    function getIdea(uint256 tokenId) external view returns (
        address creator,
        string memory title,
        string memory description,
        string memory category,
        uint256 createdAt,
        uint256 royaltyPercentage,
        IdeaStatus status,
        uint256 totalFunding,
        uint256 funderCount,
        uint256 proposalCount,
        uint256 acceptedProposalId,
        uint256 projectTokenId
    ) {
        require(_exists(tokenId), "Idea does not exist");
        Idea storage idea = ideas[tokenId];
        
        return (
            idea.creator,
            idea.title,
            idea.description,
            idea.category,
            idea.createdAt,
            idea.royaltyPercentage,
            idea.status,
            idea.totalFunding,
            idea.funders.length,
            idea.executionProposals.length,
            idea.acceptedProposalId,
            idea.projectTokenId
        );
    }
    
    /**
     * @dev Get execution proposal details
     */
    function getExecutionProposal(uint256 tokenId, uint256 proposalId) external view returns (
        address executor,
        string memory executionPlan,
        uint256 proposedBudget,
        uint256 estimatedDuration,
        uint256 equityRequested,
        uint256 proposedAt,
        bool isAccepted,
        bool isRejected
    ) {
        require(_exists(tokenId), "Idea does not exist");
        Idea storage idea = ideas[tokenId];
        
        for (uint256 i = 0; i < idea.executionProposals.length; i++) {
            if (idea.executionProposals[i].proposalId == proposalId) {
                ExecutionProposal storage proposal = idea.executionProposals[i];
                return (
                    proposal.executor,
                    proposal.executionPlan,
                    proposal.proposedBudget,
                    proposal.estimatedDuration,
                    proposal.equityRequested,
                    proposal.proposedAt,
                    proposal.isAccepted,
                    proposal.isRejected
                );
            }
        }
        
        revert("Proposal not found");
    }
    
    /**
     * @dev Get all execution proposals for an idea
     */
    function getExecutionProposals(uint256 tokenId) external view returns (uint256[] memory) {
        require(_exists(tokenId), "Idea does not exist");
        Idea storage idea = ideas[tokenId];
        
        uint256[] memory proposalIds = new uint256[](idea.executionProposals.length);
        for (uint256 i = 0; i < idea.executionProposals.length; i++) {
            proposalIds[i] = idea.executionProposals[i].proposalId;
        }
        
        return proposalIds;
    }
    
    /**
     * @dev Get accepted execution proposal
     */
    function getAcceptedProposal(uint256 tokenId) external view returns (
        address executor,
        string memory executionPlan,
        uint256 proposedBudget,
        uint256 estimatedDuration,
        uint256 equityRequested
    ) {
        require(_exists(tokenId), "Idea does not exist");
        require(ideas[tokenId].acceptedProposalId != 0, "No accepted proposal");
        
        Idea storage idea = ideas[tokenId];
        uint256 acceptedId = idea.acceptedProposalId;
        
        for (uint256 i = 0; i < idea.executionProposals.length; i++) {
            if (idea.executionProposals[i].proposalId == acceptedId) {
                ExecutionProposal storage proposal = idea.executionProposals[i];
                return (
                    proposal.executor,
                    proposal.executionPlan,
                    proposal.proposedBudget,
                    proposal.estimatedDuration,
                    proposal.equityRequested
                );
            }
        }
        
        revert("Accepted proposal not found");
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


