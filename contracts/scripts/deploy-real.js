const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting REAL Foundling contract deployment to Base Testnet...");

  // Check if private key is provided
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ PRIVATE_KEY environment variable is required");
    console.error("Please set PRIVATE_KEY in your .env file");
    console.error("Make sure you have Base testnet ETH for deployment");
    process.exit(1);
  }

  // Create wallet from private key
  const wallet = new ethers.Wallet(privateKey, ethers.provider);
  
  console.log("📝 Deploying contracts with account:", wallet.address);
  
  try {
    const balance = await ethers.provider.getBalance(wallet.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.01")) {
      console.error("❌ Insufficient balance for deployment");
      console.error("Please get Base testnet ETH from: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
      process.exit(1);
    }

    console.log("✅ Sufficient balance for deployment");

    // Deploy MockUSDC first
    console.log("\n📦 Deploying MockUSDC...");
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.connect(wallet).deploy();
    await mockUSDC.waitForDeployment();
    const mockUSDCAddress = await mockUSDC.getAddress();
    console.log("✅ MockUSDC deployed to:", mockUSDCAddress);

    // Mint some USDC for testing
    const mintAmount = ethers.parseEther("1000000");
    await mockUSDC.connect(wallet).mint(wallet.address, mintAmount);
    console.log("✅ Minted", ethers.formatEther(mintAmount), "USDC");

    // Deploy FoundlingIdea
    console.log("\n📦 Deploying FoundlingIdea...");
    const FoundlingIdea = await ethers.getContractFactory("FoundlingIdea");
    const foundlingIdea = await FoundlingIdea.connect(wallet).deploy();
    await foundlingIdea.waitForDeployment();
    const foundlingIdeaAddress = await foundlingIdea.getAddress();
    console.log("✅ FoundlingIdea deployed to:", foundlingIdeaAddress);

    // Deploy FoundlingProject
    console.log("\n📦 Deploying FoundlingProject...");
    const FoundlingProject = await ethers.getContractFactory("FoundlingProject");
    const foundlingProject = await FoundlingProject.connect(wallet).deploy();
    await foundlingProject.waitForDeployment();
    const foundlingProjectAddress = await foundlingProject.getAddress();
    console.log("✅ FoundlingProject deployed to:", foundlingProjectAddress);

    // Deploy FoundlingX402
    console.log("\n📦 Deploying FoundlingX402...");
    const FoundlingX402 = await ethers.getContractFactory("FoundlingX402");
    const foundlingX402 = await FoundlingX402.connect(wallet).deploy(
      mockUSDCAddress,
      foundlingIdeaAddress,
      foundlingProjectAddress
    );
    await foundlingX402.waitForDeployment();
    const foundlingX402Address = await foundlingX402.getAddress();
    console.log("✅ FoundlingX402 deployed to:", foundlingX402Address);

    // Grant roles
    console.log("\n🔐 Setting up contract permissions...");
    
    const EXECUTOR_ROLE = await foundlingX402.EXECUTOR_ROLE();
    const X402_ROLE = await foundlingX402.X402_ROLE();
    
    await foundlingX402.connect(wallet).grantRole(EXECUTOR_ROLE, wallet.address);
    await foundlingX402.connect(wallet).grantRole(X402_ROLE, wallet.address);
    
    console.log("✅ Roles granted to deployer");

    // Update deployment info
    const deploymentInfo = {
      network: "base-sepolia",
      chainId: 84532,
      deployer: wallet.address,
      contracts: {
        MockUSDC: mockUSDCAddress,
        FoundlingIdea: foundlingIdeaAddress,
        FoundlingProject: foundlingProjectAddress,
        FoundlingX402: foundlingX402Address
      },
      deploymentTime: new Date().toISOString(),
      transactionHashes: {
        MockUSDC: mockUSDC.deploymentTransaction?.hash,
        FoundlingIdea: foundlingIdea.deploymentTransaction?.hash,
        FoundlingProject: foundlingProject.deploymentTransaction?.hash,
        FoundlingX402: foundlingX402.deploymentTransaction?.hash
      }
    };

    // Save deployment info
    const fs = require("fs");
    fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
    
    console.log("\n🎉 DEPLOYMENT COMPLETE!");
    console.log("=====================================");
    console.log("📋 Contract Addresses:");
    console.log("   MockUSDC:", mockUSDCAddress);
    console.log("   FoundlingIdea:", foundlingIdeaAddress);
    console.log("   FoundlingProject:", foundlingProjectAddress);
    console.log("   FoundlingX402:", foundlingX402Address);
    console.log("\n📁 Deployment info saved to: deployment-info.json");
    console.log("\n🔗 View on Base Sepolia Explorer:");
    console.log("   https://sepolia.basescan.org/");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
