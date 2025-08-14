<template>
  <div class="space-y-16">
    <!-- Hero Section -->
    <section class="text-center py-16">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-gradient mb-6">
          The Autonomous Venture Studio
        </h1>
        <p class="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
          Where brilliant ideas meet execution power through AI-driven matching and onchain monetization. 
          Connect innovators, executors, and funders in a seamless ecosystem built on Base.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link to="/marketplace" class="btn btn-primary text-lg px-8 py-3">
            Explore Ideas
          </router-link>
          <router-link to="/tools" class="btn btn-outline text-lg px-8 py-3">
            Use Tools
          </router-link>
        </div>
      </div>
    </section>

    <!-- Value Proposition -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="card text-center">
        <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">For Innovators</h3>
        <p class="text-secondary-600">
          Submit ideas, get AI analysis, and earn 5% perpetual royalties through smart contracts.
        </p>
      </div>
      
      <div class="card text-center">
        <div class="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">For Builders</h3>
        <p class="text-secondary-600">
          Discover vetted opportunities with built-in funding pathways and milestone-based payments.
        </p>
      </div>
      
      <div class="card text-center">
        <div class="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold mb-2">For Investors</h3>
        <p class="text-secondary-600">
          Access AI-curated deal flow with transparent tracking and automated revenue sharing.
        </p>
      </div>
    </section>

    <!-- How It Works -->
    <section class="text-center">
      <h2 class="text-3xl font-bold mb-12">How It Works</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div class="relative">
          <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            1
          </div>
          <h3 class="text-lg font-semibold mb-2">Submit Idea</h3>
          <p class="text-secondary-600 text-sm">
            Creators submit ideas with metadata and mint NFTs for ownership representation
          </p>
          <div class="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-primary-300 transform translate-x-4"></div>
        </div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            2
          </div>
          <h3 class="text-lg font-semibold mb-2">AI Analysis</h3>
          <p class="text-secondary-600 text-sm">
            AI agents evaluate feasibility, score viability, and provide improvement recommendations
          </p>
          <div class="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-primary-300 transform translate-x-4"></div>
        </div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            3
          </div>
          <h3 class="text-lg font-semibold mb-2">Match & Execute</h3>
          <p class="text-secondary-600 text-sm">
            AI-driven matching connects ideas with builders and funding opportunities
          </p>
          <div class="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-primary-300 transform translate-x-4"></div>
        </div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            4
          </div>
          <h3 class="text-lg font-semibold mb-2">Launch & Scale</h3>
          <p class="text-secondary-600 text-sm">
            Projects launch with milestone tracking and automated royalty distribution
          </p>
        </div>
      </div>
    </section>

    <!-- CDP Integration -->
    <section class="bg-gradient-primary text-white rounded-2xl p-8">
      <div class="text-center max-w-4xl mx-auto">
        <h2 class="text-3xl font-bold mb-6">Built on Coinbase Developer Platform</h2>
        <p class="text-xl mb-8 opacity-90">
          Our winning strategy leverages deep CDP integration across all core functionality
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h4 class="font-semibold mb-2">CDP Wallets</h4>
            <p class="text-sm opacity-80">Escrow idea equity and automate payouts</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 class="font-semibold mb-2">x402 Protocol</h4>
            <p class="text-sm opacity-80">Milestone-based USDC streams</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 class="font-semibold mb-2">Coinbase Data</h4>
            <p class="text-sm opacity-80">Market intelligence for AI agents</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 class="font-semibold mb-2">Base Mini App</h4>
            <p class="text-sm opacity-80">Native wallet experience</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="text-center">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold mb-6">Ready to Build the Future?</h2>
        <p class="text-xl text-secondary-600 mb-8">
          Join the autonomous venture studio and be part of the next generation of idea execution.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            v-if="!blockchainStore.isConnected"
            @click="connectWallet"
            class="btn btn-primary text-lg px-8 py-3"
          >
            Connect Wallet & Start
          </button>
          <router-link 
            v-else
            to="/marketplace" 
            class="btn btn-primary text-lg px-8 py-3"
          >
            Browse Ideas
          </router-link>
          <router-link to="/tools" class="btn btn-outline text-lg px-8 py-3">
            Explore Tools
          </router-link>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="bg-white rounded-2xl p-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        <div>
          <div class="text-3xl font-bold text-primary-600 mb-2">5%</div>
          <div class="text-secondary-600">Perpetual Royalties</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-primary-600 mb-2">14K+</div>
          <div class="text-secondary-600">VC Database</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-primary-600 mb-2">AI</div>
          <div class="text-secondary-600">Driven Matching</div>
        </div>
        <div>
          <div class="text-3xl font-bold text-primary-600 mb-2">Base</div>
          <div class="text-secondary-600">Network Built</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useBlockchainStore } from '../../stores/blockchain'
import { useAppStore } from '../../stores/app'

const blockchainStore = useBlockchainStore()
const appStore = useAppStore()

const connectWallet = async () => {
  try {
    await blockchainStore.connectWallet()
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'success',
      title: 'Wallet Connected',
      message: 'Successfully connected to Base testnet'
    })
  } catch (error) {
    appStore.addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Connection Failed',
      message: error instanceof Error ? error.message : 'Failed to connect wallet'
    })
  }
}
</script>
