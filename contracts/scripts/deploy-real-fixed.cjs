const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting REAL Foundling contract deployment to Base Testnet...");

  // Get the deployer account from hardhat config (which reads from .env)
  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    console.error("❌ No deployer account found. Please check your .env file and PRIVATE_KEY.");
    process.exit(1);
  }
  
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  try {
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
      console.error("❌ Insufficient balance for deployment");
      console.error("You need at least 0.01 ETH on Base testnet");
      console.error("Get testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to get balance:", error);
    process.exit(1);
  }

  try {
    // Deploy MockUSDC first
    console.log("\n🔧 Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("✅ MockUSDC deployed to:", mockUSDCAddress);

    // Mint some USDC to the deployer for testing
    const mintAmount = ethers.parseEther("1000000"); // 1M USDC
    await mockUSDC.mint(deployer.address, mintAmount);
    console.log("💰 Minted", ethers.formatEther(mintAmount), "USDC to deployer");

    // Deploy FoundlingIdea
    console.log("\n🔧 Deploying FoundlingIdea...");
    const FoundlingIdea = await ethers.getContractFactory("FoundlingIdea");
    const foundlingIdea = await FoundlingIdea.deploy();
    await foundlingIdea.waitForDeployment();
    const foundlingIdeaAddress = await foundlingIdea.getAddress();
    console.log("✅ FoundlingIdea deployed to:", foundlingIdeaAddress);

    // Deploy FoundlingProject
    console.log("\n🔧 Deploying FoundlingProject...");
    const FoundlingProject = await ethers.getContractFactory("FoundlingProject");
    const foundlingProject = await FoundlingProject.deploy(
      foundlingIdeaAddress,
      mockUSDCAddress
    );
    await foundlingProject.waitForDeployment();
    const foundlingProjectAddress = await foundlingProject.getAddress();
    console.log("✅ FoundlingProject deployed to:", foundlingProjectAddress);

    // Deploy FoundlingX402
    console.log("\n🔧 Deploying FoundlingX402...");
    const FoundlingX402 = await ethers.getContractFactory("FoundlingX402");
    const foundlingX402 = await FoundlingX402.deploy(
      foundlingIdeaAddress,
      foundlingProjectAddress,
      mockUSDCAddress
    );
    await foundlingX402.waitForDeployment();
    const foundlingX402Address = await foundlingX402.getAddress();
    console.log("✅ FoundlingX402 deployed to:", foundlingX402Address);

    // Set up permissions and relationships
    console.log("\n🔗 Setting up contract relationships...");
    
    // Grant project contract permission to mint idea NFTs
    const executorRole = await foundlingIdea.EXECUTOR_ROLE();
    await foundlingIdea.grantRole(executorRole, foundlingProjectAddress);
    console.log("✅ Granted EXECUTOR_ROLE to FoundlingProject");

    // Grant x402 contract permission to manage projects
    const x402Role = await foundlingProject.X402_ROLE();
    await foundlingProject.grantRole(x402Role, foundlingX402Address);
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
    console.log("   - Address:", deployer.address);
    try {
      const usdcBalance = await mockUSDC.balanceOf(deployer.address);
      console.log("   - USDC Balance:", ethers.formatEther(usdcBalance));
    } catch (error) {
      console.log("   - USDC Balance: Could not retrieve");
    }

    // Contract addresses for frontend
    console.log("\n📋 Contract addresses for frontend configuration:");
    console.log("   MOCK_USDC_ADDRESS:", mockUSDCAddress);
    console.log("   FOUNDLING_IDEA_ADDRESS:", foundlingIdeaAddress);
    console.log("   FOUNDLING_PROJECT_ADDRESS:", foundlingProjectAddress);
    console.log("   FOUNDLING_X402_ADDRESS:", foundlingX402Address);

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
      deployer: deployer.address,
      contracts: {
        MockUSDC: mockUSDCAddress,
        FoundlingIdea: foundlingIdeaAddress,
        FoundlingProject: foundlingProjectAddress,
        FoundlingX402: foundlingX402Address
      },
      timestamp: new Date().toISOString(),
      blockNumber: await ethers.provider.getBlockNumber()
    };

    // Write to deployment-info.json
    const fs = require('fs');
    fs.writeFileSync('deployment-info.json', JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-info.json");
    
    return {
      mockUSDC: mockUSDCAddress,
      foundlingIdea: foundlingIdeaAddress,
      foundlingProject: foundlingProjectAddress,
      foundlingX402: foundlingX402Address
    };
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  }
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

