#!/bin/bash

# 🧪 Foundling Production-Grade Test Suite Runner
# Comprehensive testing across client, contracts, and server

set -e

echo "🚀 Starting Foundling Production Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check directory
if [ ! -f "package.json" ]; then
    print_error "Please run from tests directory"
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
bun install

# Create directories
mkdir -p test-results coverage

# Set environment
export NODE_ENV=test
export TEST_ENV=production
export COVERAGE=true

print_status "Running unit tests..."
if bun test --coverage --verbose > test-results/unit.log 2>&1; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    cat test-results/unit.log
    exit 1
fi

print_status "Running integration tests..."
if bun test integration/ --coverage --verbose > test-results/integration.log 2>&1; then
    print_success "Integration tests passed"
else
    print_error "Integration tests failed"
    cat test-results/integration.log
    exit 1
fi

print_status "Running performance tests..."
if bun test performance/ --coverage --verbose > test-results/performance.log 2>&1; then
    print_success "Performance tests passed"
else
    print_error "Performance tests failed"
    cat test-results/performance.log
    exit 1
fi

print_status "Testing smart contracts..."
cd ../contracts
if npx hardhat test > ../tests/test-results/contracts.log 2>&1; then
    print_success "Contract tests passed"
else
    print_error "Contract tests failed"
    cat ../tests/test-results/contracts.log
    exit 1
fi

print_status "Generating contract coverage..."
if npx hardhat coverage > ../tests/test-results/contract-coverage.log 2>&1; then
    print_success "Contract coverage generated"
else
    print_warning "Contract coverage failed"
fi
cd ../tests

print_status "Running end-to-end tests..."
if npx playwright test > test-results/e2e.log 2>&1; then
    print_success "E2E tests passed"
else
    print_error "E2E tests failed"
    cat test-results/e2e.log
    exit 1
fi

print_success "🎉 All tests completed successfully!"
echo "📁 Results: test-results/"
echo "📊 Coverage: coverage/"

exit 0
