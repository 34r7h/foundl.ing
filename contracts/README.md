# Foundling Smart Contracts

This directory contains the smart contracts for Foundling: The Autonomous Venture Studio, built on Base testnet with x402 protocol integration.

## 🏗️ Contract Architecture

### Core Contracts

1. **FoundlingIdea.sol** - NFT contract representing idea provenance equity
   - 5% perpetual royalties for idea creators
   - Idea funding and tracking
   - IP protection through blockchain timestamping

2. **FoundlingProject.sol** - Project execution and milestone tracking
   - Project creation from ideas
   - Milestone-based development tracking
   - Executor assignment and payment management

3. **FoundlingX402.sol** - x402 protocol integration
   - Milestone-based USDC streams
   - Monetized AI agent services
   - Automated payment execution

4. **MockUSDC.sol** - Test USDC token for Base testnet

## 🚀 Deployment

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Fill in your `.env` file:
   - `PRIVATE_KEY`: Your wallet private key
   - `BASESCAN_API_KEY`: BaseScan API key for verification

### Deploy to Base Testnet

```bash
npm run deploy:testnet
```

### Deploy to Base Mainnet

```bash
npm run deploy:mainnet
```

## 🔧 Development

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Local Development

```bash
npm run node
```

## 📊 Contract Features

### FoundlingIdea
- **Idea Creation**: Submit ideas with metadata and mint NFTs
- **Funding**: Allow others to fund ideas with ETH
- **Royalties**: 5% perpetual royalties on all funding
- **IP Protection**: Blockchain timestamped ownership

### FoundlingProject
- **Project Creation**: Convert ideas into executable projects
- **Milestone Tracking**: Break down projects into milestones
- **Executor Management**: Assign and manage project executors
- **Payment System**: Milestone-based payment releases

### FoundlingX402
- **USDC Streams**: Time-based USDC distribution for milestones
- **Agent Services**: Monetized AI agent access
- **Payment Automation**: Automated milestone payments
- **Service Marketplace**: Pay-per-use agent services

## 🔗 Integration Points

### CDP Integration
- **CDP Wallets**: Escrow and payment management
- **x402 Protocol**: Automated payment streams
- **Base Network**: Low-cost, high-speed transactions

### AI Agent Services
- **Idea Analysis**: Feasibility scoring and recommendations
- **Builder Matching**: AI-driven executor matching
- **Funding Intelligence**: VC database analysis
- **Pitch Generation**: AI-generated investor materials

## 🧪 Testing

### Test Coverage
- Unit tests for all contract functions
- Integration tests for contract interactions
- Gas optimization testing
- Security vulnerability testing

### Test Commands
```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/FoundlingIdea.test.ts

# Run with gas reporting
REPORT_GAS=true npm run test
```

## 🔒 Security Features

- **Reentrancy Protection**: All external calls protected
- **Access Control**: Role-based permissions
- **Pausable**: Emergency pause functionality
- **Ownable**: Administrative controls
- **Input Validation**: Comprehensive parameter checking

## 📈 Gas Optimization

- **Efficient Storage**: Optimized data structures
- **Batch Operations**: Minimize transaction costs
- **View Functions**: Free data retrieval
- **Optimizer Settings**: Solidity optimizer enabled

## 🌐 Network Support

- **Base Testnet**: Development and testing
- **Base Mainnet**: Production deployment
- **Ethereum**: Future expansion (configurable)

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🆘 Support

For technical support or questions about the contracts:
- Create an issue in the repository
- Join our Discord community
- Check the documentation at [docs.cdp.coinbase.com](https://docs.cdp.coinbase.com/)


