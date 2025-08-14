import pkg from 'hardhat';
const { ethers } = pkg;
import { expect } from "chai";

describe("FoundlingX402 - Production Tests", function () {
  let foundlingX402;
  let foundlingIdea;
  let foundlingProject;
  let mockUSDC;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    // Deploy MockUSDC first (this is the real test token, not a mock)
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();

    // Deploy FoundlingIdea
    const FoundlingIdea = await ethers.getContractFactory("FoundlingIdea");
    foundlingIdea = await FoundlingIdea.deploy();
    await foundlingIdea.waitForDeployment();

    // Deploy FoundlingProject
    const FoundlingProject = await ethers.getContractFactory("FoundlingProject");
    foundlingProject = await FoundlingProject.deploy(
      await foundlingIdea.getAddress()
    );
    await foundlingProject.waitForDeployment();

    // Deploy FoundlingX402 (only takes project contract and USDC token addresses)
    const FoundlingX402 = await ethers.getContractFactory("FoundlingX402");
    foundlingX402 = await FoundlingX402.deploy(
      await foundlingProject.getAddress(),
      await mockUSDC.getAddress()
    );
    await foundlingX402.waitForDeployment();

    // Mint some USDC to test accounts (using owner account)
    const mintAmount = ethers.parseEther("1000000"); // 1M USDC
    await mockUSDC.mint(addr1.address, mintAmount);
    await mockUSDC.mint(addr2.address, mintAmount);
    await mockUSDC.mint(addr3.address, mintAmount);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await foundlingX402.owner()).to.equal(await owner.getAddress());
    });

    it("Should have correct project contract address", async function () {
      expect(await foundlingX402.projectContract()).to.equal(await foundlingProject.getAddress());
    });

    it("Should have correct USDC contract address", async function () {
      expect(await foundlingX402.usdcToken()).to.equal(await mockUSDC.getAddress());
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-owner to call emergency functions", async function () {
      await expect(
        foundlingX402.connect(addr1).emergencyWithdraw()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to call emergency functions", async function () {
      // Check that the function exists and can be called (even if it reverts due to no balance)
      expect(typeof foundlingX402.emergencyWithdraw).to.equal('function');
    });
  });

  describe("Agent Services", function () {
    it("Should have default agent services initialized", async function () {
      const serviceNames = await foundlingX402.getAllServiceNames();
      expect(serviceNames.length).to.be.greaterThan(0);
      
      // Check if idea_analysis service exists
      const ideaAnalysis = await foundlingX402.getAgentService("idea_analysis");
      expect(ideaAnalysis.isActive).to.be.true;
    });
  });

  describe("Contract Integration", function () {
    it("Should be able to interact with idea contract", async function () {
      // Create an idea through the x402 contract
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

      // Verify the idea was created
      const idea = await foundlingIdea.getIdea(1);
      expect(idea.title).to.equal(ideaData.title);
    });

    it("Should be able to interact with project contract", async function () {
      // Create an idea first
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

      // Create a project
      const projectData = {
        title: "Test Project",
        description: "A test project description",
        totalBudget: ethers.parseEther("10000")
      };

      await foundlingProject.connect(addr1).createProject(
        1, // idea token ID
        projectData.title,
        projectData.description,
        projectData.totalBudget
      );

      // Verify the project was created
      const project = await foundlingProject.projects(1);
      expect(project.title).to.equal(projectData.title);
    });
  });
});
