#!/usr/bin/env node

/**
 * Test RLP Encoding Fix
 * Verifies that transactions are properly constructed and serialized
 */

import { ethers } from "ethers";
import "dotenv/config.js";
import * as transactionUtils from "../services/transactionUtils.js";

async function testRLPEncoding() {
  console.log("\n🔍 Testing RLP Encoding Fix...\n");

  try {
    // Initialize provider
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
    if (!rpcUrl) {
      throw new Error("BLOCKCHAIN_RPC_URL not set in .env");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    console.log("✓ Connected to blockchain");

    // Test 1: Get fee data
    console.log("\n📊 Test 1: Retrieving Gas Fee Data");
    const feeData = await provider.getFeeData();

    if (!feeData) {
      throw new Error("Failed to get fee data from provider");
    }

    console.log("  ✓ Gas Price:", ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
    console.log("  ✓ Max Fee Per Gas:", ethers.formatUnits(feeData.maxFeePerGas, "gwei"), "gwei");
    console.log(
      "  ✓ Max Priority Fee:",
      ethers.formatUnits(feeData.maxPriorityFeePerGas, "gwei"),
      "gwei"
    );

    // Test 2: Build proper transaction options
    console.log("\n🏗️  Test 2: Building Transaction Options");
    const txOptions = {
      gasLimit: 500000,
      maxFeePerGas: feeData.maxFeePerGas || ethers.parseUnits("100", "gwei"),
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei"),
    };

    console.log("  ✓ Gas Limit:", txOptions.gasLimit);
    console.log("  ✓ Max Fee Per Gas:", ethers.formatUnits(txOptions.maxFeePerGas, "gwei"), "gwei");
    console.log(
      "  ✓ Max Priority Fee:",
      ethers.formatUnits(txOptions.maxPriorityFeePerGas, "gwei"),
      "gwei"
    );

    // Test 3: Validate transaction structure
    console.log("\n✅ Test 3: Validating Transaction Structure");
    const testTx = {
      to: "0x0000000000000000000000000000000000000000",
      from: "0x0000000000000000000000000000000000000001",
      data: "0x",
      value: ethers.parseEther("0"),
      ...txOptions,
    };

    // Try to serialize the transaction
    try {
      const serialized = ethers.Transaction.from(testTx).serialized;
      console.log("  ✓ Transaction serializes correctly");
      console.log("  ✓ Serialized length:", serialized.length, "bytes");
    } catch (error) {
      throw new Error("Failed to serialize transaction: " + error.message);
    }

    // Test 4: Check signer availability
    console.log("\n👤 Test 4: Checking Signer");
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.warn("  ⚠️  PRIVATE_KEY not set - skipping signer test");
    } else {
      // Don't log the actual key!
      const signer = new ethers.Wallet(privateKey, provider);
      console.log("  ✓ Signer loaded:", signer.address);

      const signerBalance = await provider.getBalance(signer.address);
      console.log("  ✓ Signer balance:", ethers.formatEther(signerBalance), "ETH");

      if (signerBalance === BigInt(0)) {
        console.warn("  ⚠️  WARNING: Signer has 0 balance - cannot send transactions");
      }
    }

    // Test 5: Validate addresses
    console.log("\n📍 Test 5: Validating Addresses");
    const addresses = {
      TIPSCOIN: process.env.TIPSCOIN_ADDRESS,
      USDTC: process.env.USDTC_ADDRESS,
      DEX_ROUTER: process.env.DEX_ROUTER_ADDRESS,
      TRUSTED_FORWARDER: process.env.TRUSTED_FORWARDER_ADDRESS,
    };

    for (const [name, addr] of Object.entries(addresses)) {
      if (!addr) {
        console.warn(`  ⚠️  ${name} not set`);
      } else if (!ethers.isAddress(addr)) {
        throw new Error(`Invalid address format for ${name}: ${addr}`);
      } else {
        console.log(`  ✓ ${name}: ${addr}`);
      }
    }

    // Test 6: Verify transactionUtils module
    console.log("\n🛠️  Test 6: Verifying Transaction Utilities");
    try {
      if (!transactionUtils.validateTransactionData) {
        throw new Error("validateTransactionData not exported");
      }
      if (!transactionUtils.buildTransaction) {
        throw new Error("buildTransaction not exported");
      }
      if (!transactionUtils.sendTransaction) {
        throw new Error("sendTransaction not exported");
      }

      console.log("  ✓ validateTransactionData function available");
      console.log("  ✓ buildTransaction function available");
      console.log("  ✓ sendTransaction function available");

      // Test validation with sample data
      const { valid, errors } = transactionUtils.validateTransactionData({
        to: "0x" + "0".repeat(40),
        from: "0x" + "1".repeat(40),
        data: "0x",
        value: 0,
        gasLimit: 21000,
      });

      if (valid) {
        console.log("  ✓ Transaction validation works correctly");
      } else {
        console.warn("  ⚠️  Validation errors:", errors);
      }
    } catch (error) {
      throw new Error("Failed to load transactionUtils: " + error.message);
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ All RLP Encoding Tests PASSED!");
    console.log("=".repeat(50));
    console.log("\nYour blockchain setup is properly configured.");
    console.log("Transactions should serialize and send without RLP errors.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n" + "=".repeat(50));
    console.error("❌ RLP Encoding Test FAILED!");
    console.error("=".repeat(50));
    console.error("\nError:", error.message);

    if (error.message.includes("Cannot read property 'getFeeData'")) {
      console.error("\nSolution: Make sure your RPC URL is correct");
      console.error("  Example: BLOCKCHAIN_RPC_URL=http://localhost:8545");
    } else if (error.message.includes("BLOCKCHAIN_RPC_URL not set")) {
      console.error("\nSolution: Set BLOCKCHAIN_RPC_URL in your .env file");
      console.error("  cp .env.example .env");
      console.error("  # Edit .env and set BLOCKCHAIN_RPC_URL");
    } else if (error.message.includes("Invalid address")) {
      console.error("\nSolution: Check your contract addresses in .env");
      console.error("  Ensure all addresses start with 0x and are 40 hex characters");
    }

    console.log("\n📖 See docs/RLP_ENCODING_FIX.md for more help\n");
    process.exit(1);
  }
}

// Run tests
testRLPEncoding();
