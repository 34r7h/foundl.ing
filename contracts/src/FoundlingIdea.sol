// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FoundlingIdea
 * @dev NFT contract representing idea provenance equity with perpetual royalties
 */
contract FoundlingIdea is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    // Idea metadata
    struct Idea {
        uint256 tokenId;
        address creator;
        string title;
        string description;
        string category;
        uint256 createdAt;
        uint256 royaltyPercentage; // 5% = 500 (basis points)
        bool isActive;
        uint256 totalFunding;
        address[] funders;
        mapping(address => uint256) fundingAmounts;
    }
    
    // Token ID to Idea mapping
    mapping(uint256 => Idea) public ideas;
    
    // Events
    event IdeaCreated(uint256 indexed tokenId, address indexed creator, string title);
    event IdeaFunded(uint256 indexed tokenId, address indexed funder, uint256 amount);
    event RoyaltyDistributed(uint256 indexed tokenId, address indexed recipient, uint256 amount);
    event IdeaStatusChanged(uint256 indexed tokenId, bool isActive);
    
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
        newIdea.isActive = true;
        newIdea.totalFunding = 0;
        
        emit IdeaCreated(newTokenId, msg.sender, title);
        
        return newTokenId;
    }
    
    /**
     * @dev Fund an idea
     */
    function fundIdea(uint256 tokenId) external payable nonReentrant {
        require(_exists(tokenId), "Idea does not exist");
        require(ideas[tokenId].isActive, "Idea is not active");
        require(msg.value >= MIN_FUNDING_AMOUNT, "Funding amount too low");
        require(msg.sender != ideas[tokenId].creator, "Creator cannot fund own idea");
        
        Idea storage idea = ideas[tokenId];
        
        // Add funder if not already funded
        if (idea.fundingAmounts[msg.sender] == 0) {
            idea.funders.push(msg.sender);
        }
        
        idea.fundingAmounts[msg.sender] += msg.value;
        idea.totalFunding += msg.value;
        
        emit IdeaFunded(tokenId, msg.sender, msg.value);
    }
    
    /**
     * @dev Distribute royalties to idea creator
     */
    function distributeRoyalties(uint256 tokenId) external nonReentrant {
        require(_exists(tokenId), "Idea does not exist");
        require(ideas[tokenId].totalFunding > 0, "No funding to distribute");
        
        Idea storage idea = ideas[tokenId];
        uint256 royaltyAmount = (idea.totalFunding * idea.royaltyPercentage) / 10000;
        
        require(royaltyAmount > 0, "No royalties to distribute");
        
        // Reset funding for next distribution cycle
        idea.totalFunding = 0;
        
        // Transfer royalties to creator
        (bool success, ) = idea.creator.call{value: royaltyAmount}("");
        require(success, "Royalty transfer failed");
        
        emit RoyaltyDistributed(tokenId, idea.creator, royaltyAmount);
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
        bool isActive,
        uint256 totalFunding,
        uint256 funderCount
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
            idea.isActive,
            idea.totalFunding,
            idea.funders.length
        );
    }
    
    /**
     * @dev Get funder information
     */
    function getFunderInfo(uint256 tokenId, address funder) external view returns (uint256 amount) {
        require(_exists(tokenId), "Idea does not exist");
        return ideas[tokenId].fundingAmounts[funder];
    }
    
    /**
     * @dev Get all funders for an idea
     */
    function getFunders(uint256 tokenId) external view returns (address[] memory) {
        require(_exists(tokenId), "Idea does not exist");
        return ideas[tokenId].funders;
    }
    
    /**
     * @dev Toggle idea status (only creator)
     */
    function toggleIdeaStatus(uint256 tokenId) external {
        require(_exists(tokenId), "Idea does not exist");
        require(ownerOf(tokenId) == msg.sender, "Only creator can toggle status");
        
        ideas[tokenId].isActive = !ideas[tokenId].isActive;
        emit IdeaStatusChanged(tokenId, ideas[tokenId].isActive);
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
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}


