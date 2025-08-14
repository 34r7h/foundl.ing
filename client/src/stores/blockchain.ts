import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ethers } from 'ethers'

// Contract ABIs (simplified for prototype)
const IDEA_ABI = [
  'function createIdea(string title, string description, string category, string tokenURI) external returns (uint256)',
  'function fundIdea(uint256 tokenId) external payable',
  'function getIdea(uint256 tokenId) external view returns (address, string, string, string, uint256, uint256, bool, uint256, uint256)',
  'function getFunders(uint256 tokenId) external view returns (address[])',
  'event IdeaCreated(uint256 indexed tokenId, address indexed creator, string title)',
  'event IdeaFunded(uint256 indexed tokenId, address indexed funder, uint256 amount)'
]

const PROJECT_ABI = [
  'function createProject(uint256 ideaTokenId, string title, string description, uint256 totalBudget) external returns (uint256)',
  'function assignExecutor(uint256 projectId, address executor) external',
  'function addMilestone(uint256 projectId, string title, string description, uint256 amount, uint256 deadline) external',
  'function completeMilestone(uint256 projectId, uint256 milestoneId) external',
  'function payMilestone(uint256 projectId, uint256 milestoneId) external payable',
  'function getProject(uint256 projectId) external view returns (uint256, address, address, string, string, uint256, uint256, uint256, uint8, uint256)',
  'event ProjectCreated(uint256 indexed projectId, uint256 indexed ideaTokenId, address indexed creator)'
]

const X402_ABI = [
  'function useAgentService(string serviceName) external payable',
  'function getAgentService(string serviceName) external view returns (string, uint256, bool, uint256, uint256)',
  'function getAllServiceNames() external view returns (string[])',
  'event AgentServiceUsed(string indexed serviceName, address indexed user, uint256 amount)'
]

export const useBlockchainStore = defineStore('blockchain', () => {
  // State
  const provider = ref<ethers.BrowserProvider | null>(null)
  const signer = ref<ethers.JsonRpcSigner | null>(null)
  const contracts = ref<{
    idea: ethers.Contract | null
    project: ethers.Contract | null
    x402: ethers.Contract | null
  }>({
    idea: null,
    project: null,
    x402: null
  })

  const isConnected = ref(false)
  const currentAccount = ref<string | null>(null)
  const network = ref<string | null>(null)
  const balance = ref<string>('0')

  // Contract addresses (Base testnet)
  const CONTRACT_ADDRESSES = {
    idea: '0x2345678901234567890123456789012345678901', // FoundlingIdea
    project: '0x3456789012345678901234567890123456789012', // FoundlingProject
    x402: '0x4567890123456789012345678901234567890123' // FoundlingX402
    // Replace with real addresses after deployment
    // Example:
    // idea: deploymentInfo.contracts.FoundlingIdea,
    // project: deploymentInfo.contracts.FoundlingProject,
    // x402: deploymentInfo.contracts.FoundlingX402
  }

  // Computed
  const isBaseNetwork = computed(() => network.value === 'Base Sepolia')
  const canInteract = computed(() => isConnected.value && isBaseNetwork.value && !!signer.value)

  // Actions
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length === 0) {
        throw new Error('No accounts found')
      }

      // Create provider and signer
      provider.value = new ethers.BrowserProvider(window.ethereum)
      signer.value = await provider.value.getSigner()

      // Get network info
      const networkInfo = await provider.value.getNetwork()
      network.value = networkInfo.name

      // Check if we're on Base testnet
      if (networkInfo.chainId !== BigInt(84532)) {
        throw new Error('Please switch to Base Sepolia testnet')
      }

      // Get account info
      currentAccount.value = accounts[0]
      const balanceWei = await provider.value.getBalance(currentAccount.value)
      balance.value = ethers.formatEther(balanceWei)

      // Initialize contracts
      await initializeContracts()

      isConnected.value = true

      return true
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  const initializeContracts = async () => {
    if (!signer.value) return

    try {
      contracts.value.idea = new ethers.Contract(
        CONTRACT_ADDRESSES.idea,
        IDEA_ABI,
        signer.value
      )

      contracts.value.project = new ethers.Contract(
        CONTRACT_ADDRESSES.project,
        PROJECT_ABI,
        signer.value
      )

      contracts.value.x402 = new ethers.Contract(
        CONTRACT_ADDRESSES.x402,
        X402_ABI,
        signer.value
      )
    } catch (error) {
      console.error('Failed to initialize contracts:', error)
    }
  }

  const disconnectWallet = () => {
    provider.value = null
    signer.value = null
    contracts.value = { idea: null, project: null, x402: null }
    isConnected.value = false
    currentAccount.value = null
    network.value = null
    balance.value = '0'
  }

  const switchToBaseTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x14a34', // 84532 in hex
          chainName: 'Base Sepolia',
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: ['https://sepolia.base.org'],
          blockExplorerUrls: ['https://sepolia.basescan.org']
        }]
      })

      // Switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x14a34' }]
      })

      return true
    } catch (error) {
      console.error('Failed to switch network:', error)
      throw error
    }
  }

  const createIdea = async (title: string, description: string, category: string, tokenURI: string) => {
    if (!contracts.value.idea || !signer.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const tx = await contracts.value.idea.createIdea(title, description, category, tokenURI)
      const receipt = await tx.wait()

      // Find the IdeaCreated event
      const event = receipt.logs.find(log => {
        try {
          return contracts.value.idea?.interface.parseLog(log as any)?.name === 'IdeaCreated'
        } catch {
          return false
        }
      })

      if (event) {
        const parsed = contracts.value.idea?.interface.parseLog(event as any)
        return parsed?.args?.[0] // tokenId
      }

      return null
    } catch (error) {
      console.error('Failed to create idea:', error)
      throw error
    }
  }

  const fundIdea = async (tokenId: number, amount: string) => {
    if (!contracts.value.idea || !signer.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const amountWei = ethers.parseEther(amount)
      const tx = await contracts.value.idea.fundIdea(tokenId, { value: amountWei })
      await tx.wait()
      return true
    } catch (error) {
      console.error('Failed to fund idea:', error)
      throw error
    }
  }

  // Executor submits proposal (offchain, handled in app store)

  // Innovator accepts proposal and mints project NFT with terms/milestones
  const mintProjectNFT = async (ideaTokenId: number, executor: string, title: string, description: string, milestones: any[], terms: string, totalBudget: string) => {
    if (!contracts.value.project || !signer.value) {
      throw new Error('Wallet not connected')
    }
    try {
      const budgetWei = ethers.parseEther(totalBudget)
      // Assume contract supports passing milestones and terms
      const tx = await contracts.value.project.createProject(ideaTokenId, title, description, budgetWei)
      const receipt = await tx.wait()
      // Assign executor and milestones
      // (In real contract, these would be set in createProject or via additional calls)
      // Assign executor
      const projectId = receipt.logs.find(log => {
        try {
          return contracts.value.project?.interface.parseLog(log as any)?.name === 'ProjectCreated'
        } catch {
          return false
        }
      })
      if (projectId) {
        const parsed = contracts.value.project?.interface.parseLog(projectId as any)
        await contracts.value.project.assignExecutor(parsed?.args?.[0], executor)
        // Add milestones
        for (const m of milestones) {
          await contracts.value.project.addMilestone(parsed?.args?.[0], m.title, m.description, ethers.parseEther(m.amount), m.deadline.getTime())
        }
        // Terms could be stored in contract or as metadata
        return parsed?.args?.[0]
      }
      return null
    } catch (error) {
      console.error('Failed to mint project NFT:', error)
      throw error
    }
  }

  // Investor proposes deal (offchain, handled in app store)

  // Executor accepts investor deal, investor sends funds
  const fundProject = async (projectId: number, amount: string) => {
    if (!contracts.value.project || !signer.value) {
      throw new Error('Wallet not connected')
    }
    try {
      const amountWei = ethers.parseEther(amount)
      // Assume contract supports payment streaming
      const tx = await contracts.value.project.payMilestone(projectId, 0, { value: amountWei })
      await tx.wait()
      return true
    } catch (error) {
      console.error('Failed to fund project:', error)
      throw error
    }
  }

  // Milestone enforcement (offchain, handled in app store)

  // Equity allocation and NFT update (offchain, handled in app store)

  const useAgentService = async (serviceName: string, amount: string) => {
    if (!contracts.value.x402 || !signer.value) {
      throw new Error('Wallet not connected')
    }

    try {
      const amountWei = ethers.parseEther(amount)
      const tx = await contracts.value.x402.useAgentService(serviceName, { value: amountWei })
      await tx.wait()
      return true
    } catch (error) {
      console.error('Failed to use agent service:', error)
      throw error
    }
  }

  const updateBalance = async () => {
    if (!provider.value || !currentAccount.value) return

    try {
      const balanceWei = await provider.value.getBalance(currentAccount.value)
      balance.value = ethers.formatEther(balanceWei)
    } catch (error) {
      console.error('Failed to update balance:', error)
    }
  }

  // Listen for account changes
  if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else {
        currentAccount.value = accounts[0]
        updateBalance()
      }
    })

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })
  }

  return {
    // State
    provider,
    signer,
    contracts,
    isConnected,
    currentAccount,
    network,
    balance,

    // Computed
    isBaseNetwork,
    canInteract,

    // Actions
    connectWallet,
    disconnectWallet,
    switchToBaseTestnet,
    createIdea,
    fundIdea,
  mintProjectNFT,
  fundProject,
    useAgentService,
    updateBalance
  }
})

// Extend Window interface for MetaMask
declare global {
  interface Window {
    ethereum?: any
  }
}


