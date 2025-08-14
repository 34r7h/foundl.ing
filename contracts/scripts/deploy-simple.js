const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Foundling contract deployment to Base Testnet...");

  // Generate a random private key for testing (NOT for production!)
  const privateKey = "0x" + "0".repeat(64);
  const wallet = new ethers.Wallet(privateKey, ethers.provider);
  
  console.log("📝 Deploying contracts with account:", wallet.address);
  console.log("💰 Account balance:", (await wallet.getBalance()).toString());

  // Deploy MockUSDC first
  console.log("\n🔧 Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.connect(wallet).deploy();
  await mockUSDC.deployed();
  console.log("✅ MockUSDC deployed to:", mockUSDC.address);

  // Mint some USDC to the deployer for testing
  const mintAmount = ethers.utils.parseEther("1000000"); // 1M USDC
  await mockUSDC.connect(wallet).mint(wallet.address, mintAmount);
  console.log("💰 Minted", ethers.utils.formatEther(mintAmount), "USDC to deployer");

  // Deploy FoundlingIdea
  console.log("\n🔧 Deploying FoundlingIdea...");
  const FoundlingIdea = await ethers.getContractFactory("FoundlingIdea");
  const foundlingIdea = await FoundlingIdea.connect(wallet).deploy();
  await foundlingIdea.deployed();
  console.log("✅ FoundlingIdea deployed to:", foundlingIdea.address);

  // Deploy FoundlingProject
  console.log("\n🔧 Deploying FoundlingProject...");
  const FoundlingProject = await ethers.getContractFactory("FoundlingProject");
  const foundlingProject = await FoundlingProject.connect(wallet).deploy(
    foundlingIdea.address,
    mockUSDC.address
  );
  await foundlingProject.deployed();
  console.log("✅ FoundlingProject deployed to:", foundlingProject.address);

  // Deploy FoundlingX402
  console.log("\n🔧 Deploying FoundlingX402...");
  const FoundlingX402 = await ethers.getContractFactory("FoundlingX402");
  const foundlingX402 = await FoundlingX402.connect(wallet).deploy(
    foundlingIdea.address,
    foundlingProject.address,
    mockUSDC.address
  );
  await foundlingX402.deployed();
  console.log("✅ FoundlingX402 deployed to:", foundlingX402.address);

  // Set up permissions and relationships
  console.log("\n🔗 Setting up contract relationships...");
  
  // Grant project contract permission to mint idea NFTs
  await foundlingIdea.connect(wallet).grantRole(await foundlingIdea.EXECUTOR_ROLE(), foundlingProject.address);
  console.log("✅ Granted EXECUTOR_ROLE to FoundlingProject");

  // Grant x402 contract permission to manage projects
  await foundlingProject.connect(wallet).grantRole(await foundlingProject.X402_ROLE(), foundlingX402.address);
  console.log("✅ Granted X402_ROLE to FoundlingX402");

  // Verify deployments
  console.log("\n🔍 Verifying contract deployments...");
  
  const ideaCount = await foundlingIdea.getIdeaCount();
  const projectCount = await foundlingProject.getProjectCount();
  const streamCount = await foundlingX402.getStreamCount();
  
  console.log("📊 Initial state:");
  console.log("   - Ideas:", ideaCount.toString());
  console.log("   - Projects:", projectCount.toString());
  console.log("   - Streams:", streamCount.toString());

  // Deployer info
  console.log("\n👤 Deployer information:");
  console.log("   - Address:", wallet.address);
  console.log("   - USDC Balance:", ethers.utils.formatEther(await mockUSDC.balanceOf(wallet.address)));

  // Contract addresses for frontend
  console.log("\n📋 Contract addresses for frontend configuration:");
  console.log("   MOCK_USDC_ADDRESS:", mockUSDC.address);
  console.log("   FOUNDLING_IDEA_ADDRESS:", foundlingIdea.address);
  console.log("   FOUNDLING_PROJECT_ADDRESS:", foundlingProject.address);
  console.log("   FOUNDLING_X402_ADDRESS:", foundlingX402.address);

  // Network info
  const network = await ethers.provider.getNetwork();
  console.log("\n🌐 Network information:");
  console.log("   - Chain ID:", network.chainId);
  console.log("   - Network Name:", network.name === "unknown" ? "Base Testnet" : network.name);

  console.log("\n🎉 Foundling contracts deployed successfully to Base Testnet!");
  console.log("🔗 View contracts on BaseScan: https://sepolia.basescan.org");
  
  // Save deployment info to file
  const deploymentInfo = {
    network: "baseTestnet",
    chainId: network.chainId,
    deployer: wallet.address,
    contracts: {
      MockUSDC: mockUSDC.address,
      FoundlingIdea: foundlingIdea.address,
      FoundlingProject: foundlingProject.address,
      FoundlingX402: foundlingX402.address
    },
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\n💾 Deployment info saved to deployment-info.json");
  
  return {
    mockUSDC: mockUSDC.address,
    foundlingIdea: foundlingIdea.address,
    foundlingProject: foundlingProject.address,
    foundlingX402: foundlingX402.address
  };
}

main()
  .then((addresses) => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
