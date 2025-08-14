#!/bin/bash

echo "🚀 Foundling Contract Deployment Helper"
echo "====================================="

# Check if .env file exists and has content
if [ ! -s .env ]; then
    echo "❌ .env file is empty or missing"
    echo "Please create a .env file with your private key:"
    echo ""
    echo "PRIVATE_KEY=your_private_key_here"
    echo ""
    echo "Make sure you have Base testnet ETH in the wallet!"
    exit 1
fi

# Source the .env file
echo "📋 Loading environment variables..."
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY not found in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "🔑 Private key: ${PRIVATE_KEY:0:10}...${PRIVATE_KEY: -4}"

# Check if we're ready to deploy
echo ""
echo "🚀 Ready to deploy contracts to Base Testnet!"
echo ""

# Ask for confirmation
read -p "Do you want to proceed with deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 1
fi

echo ""
echo "🚀 Starting deployment..."

# Run the deployment script
npx hardhat run scripts/deploy-with-env.cjs --network baseTestnet

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📁 Check deployment-info.json for contract addresses"
else
    echo ""
    echo "❌ Deployment failed!"
    exit 1
fi
