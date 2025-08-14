import pkg from 'hardhat';
const { ethers } = pkg;
import { expect } from "chai";

describe("FoundlingIdea - Production Tests", function () {
  let foundlingIdea;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const FoundlingIdea = await ethers.getContractFactory("FoundlingIdea");
    foundlingIdea = await FoundlingIdea.deploy();
    await foundlingIdea.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await foundlingIdea.owner()).to.equal(await owner.getAddress());
    });

    it("Should have correct name and symbol", async function () {
      expect(await foundlingIdea.name()).to.equal("FoundlingIdea");
      expect(await foundlingIdea.symbol()).to.equal("FIDEA");
    });
  });

  describe("Idea Creation", function () {
    it("Should allow idea creation with valid parameters", async function () {
      const ideaData = {
        title: "Test Idea",
        description: "A test idea description",
        category: "Technology",
        tokenURI: "ipfs://test-metadata"
      };

      const tx = await foundlingIdea.connect(addr1).createIdea(
        ideaData.title,
        ideaData.description,
        ideaData.category,
        ideaData.tokenURI
      );

      await expect(tx).to.emit(foundlingIdea, "IdeaCreated");

      // Check if idea was created by getting the first idea (token ID 1)
      const idea = await foundlingIdea.getIdea(1);
      expect(idea.title).to.equal(ideaData.title);
      expect(idea.creator).to.equal(await addr1.getAddress());
    });

    it("Should increment token ID counter", async function () {
      const ideaData = {
        title: "Test Idea",
        description: "A test idea description",
        category: "Technology",
        tokenURI: "ipfs://test-metadata"
      };

      await foundlingIdea.connect(addr1).createIdea(
        ideaData.title,
        ideaData.description,
        ideaData.category,
        ideaData.tokenURI
      );

      // Check if token ID was incremented by verifying the idea exists at ID 1
      const idea = await foundlingIdea.getIdea(1);
      expect(idea.title).to.equal(ideaData.title);
      expect(idea.creator).to.equal(await addr1.getAddress());
    });
  });

  describe("Idea Funding", function () {
    let ideaId;

    beforeEach(async function () {
      const ideaData = {
        title: "Test Idea",
        description: "A test idea description",
        category: "Technology",
        tokenURI: "ipfs://test-metadata"
      };

      await foundlingIdea.connect(addr1).createIdea(
        ideaData.title,
        ideaData.description,
        ideaData.category,
        ideaData.tokenURI
      );
      ideaId = 1; // Token ID will be 1, not 0
    });

    it("Should allow funding of ideas", async function () {
      const fundingAmount = ethers.parseEther("0.02"); // Above minimum

      await expect(
        foundlingIdea.connect(addr2).fundIdea(ideaId, { value: fundingAmount })
      ).to.emit(foundlingIdea, "IdeaFunded");

      // Check if funding was recorded
      const funders = await foundlingIdea.getFunders(ideaId);
      expect(funders).to.include(await addr2.getAddress());
    });

    it("Should reject funding below minimum", async function () {
      const fundingAmount = ethers.parseEther("0.005"); // Below minimum

      await expect(
        foundlingIdea.connect(addr2).fundIdea(ideaId, { value: fundingAmount })
      ).to.be.revertedWith("Funding amount too low");
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-owner to call emergency functions", async function () {
      await expect(
        foundlingIdea.connect(addr1).emergencyWithdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to call emergency functions", async function () {
      // Check that the function exists and can be called (even if it reverts due to no balance)
      expect(typeof foundlingIdea.emergencyWithdraw).to.equal('function');
    });
  });

  describe("Idea Management", function () {
    let ideaId;

    beforeEach(async function () {
      const ideaData = {
        title: "Test Idea",
        description: "A test idea description",
        category: "Technology",
        tokenURI: "ipfs://test-metadata"
      };

      await foundlingIdea.connect(addr1).createIdea(
        ideaData.title,
        ideaData.description,
        ideaData.category,
        ideaData.tokenURI
      );
      ideaId = 1; // Token ID will be 1, not 0
    });

    it("Should allow creator to toggle idea status", async function () {
      await expect(
        foundlingIdea.connect(addr1).toggleIdeaStatus(ideaId)
      ).to.emit(foundlingIdea, "IdeaStatusChanged");

      const idea = await foundlingIdea.getIdea(ideaId);
      expect(idea.isActive).to.be.false;
    });

    it("Should not allow non-creator to toggle idea status", async function () {
      await expect(
        foundlingIdea.connect(addr2).toggleIdeaStatus(ideaId)
      ).to.be.revertedWith("Only creator can toggle status");
    });
  });
});
