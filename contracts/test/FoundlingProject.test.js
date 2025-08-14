import pkg from 'hardhat';
const { ethers } = pkg;
import { expect } from "chai";

describe("FoundlingProject - Production Tests", function () {
  let foundlingProject;
  let foundlingIdea;
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

    // Deploy FoundlingProject (only takes idea contract address)
    const FoundlingProject = await ethers.getContractFactory("FoundlingProject");
    foundlingProject = await FoundlingProject.deploy(
      await foundlingIdea.getAddress()
    );
    await foundlingProject.waitForDeployment();

    // Mint some USDC to test accounts (using owner account)
    const mintAmount = ethers.parseEther("1000000"); // 1M USDC
    await mockUSDC.mint(addr1.address, mintAmount);
    await mockUSDC.mint(addr2.address, mintAmount);
    await mockUSDC.mint(addr3.address, mintAmount);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await foundlingProject.owner()).to.equal(await owner.getAddress());
    });

    it("Should have correct idea contract address", async function () {
      expect(await foundlingProject.ideaContract()).to.equal(await foundlingIdea.getAddress());
    });
  });

  describe("Project Creation", function () {
    let ideaId;

    beforeEach(async function () {
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
      ideaId = 1; // Token ID will be 1
    });

    it("Should allow project creation with valid parameters", async function () {
      const projectData = {
        title: "Test Project",
        description: "A test project description",
        totalBudget: ethers.parseEther("10000")
      };

      await expect(
        foundlingProject.connect(addr1).createProject(
          ideaId,
          projectData.title,
          projectData.description,
          projectData.totalBudget
        )
      ).to.emit(foundlingProject, "ProjectCreated");

      // Check if project was created (project ID will be 1, not 0)
      const project = await foundlingProject.projects(1);
      expect(project.title).to.equal(projectData.title);
      expect(project.creator).to.equal(await addr1.getAddress());
    });

    it("Should increment project counter", async function () {
      const projectData = {
        title: "Test Project",
        description: "A test project description",
        totalBudget: ethers.parseEther("10000")
      };

      await foundlingProject.connect(addr1).createProject(
        ideaId,
        projectData.title,
        projectData.description,
        projectData.totalBudget
      );

      // Check if project counter was incremented
      const projectCount = await foundlingProject.projectCounter();
      expect(projectCount).to.equal(1);
    });
  });

  describe("Access Control", function () {
    it("Should not allow non-owner to pause contract", async function () {
      await expect(
        foundlingProject.connect(addr1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to pause contract", async function () {
      await expect(
        foundlingProject.connect(owner).pause()
      ).to.emit(foundlingProject, "Paused");

      expect(await foundlingProject.paused()).to.be.true;
    });
  });
});
