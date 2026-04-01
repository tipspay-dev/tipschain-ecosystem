/**
 * Transaction Utilities
 * Helper functions for constructing and validating transactions
 */

import { ethers } from "ethers";

/**
 * Validate transaction data before sending
 */
function validateTransactionData(txData) {
  const errors = [];

  // Check required fields
  if (!txData.to && !txData.data) {
    errors.push("Transaction must have 'to' address or 'data'");
  }

  // Validate addresses if present
  if (txData.to && !ethers.isAddress(txData.to)) {
    errors.push(`Invalid 'to' address: ${txData.to}`);
  }

  if (txData.from && !ethers.isAddress(txData.from)) {
    errors.push(`Invalid 'from' address: ${txData.from}`);
  }

  // Validate numeric fields
  if (txData.gasLimit && !ethers.isBigNumberish(txData.gasLimit)) {
    errors.push(`Invalid 'gasLimit': ${txData.gasLimit}`);
  }

  if (txData.gasPrice && !ethers.isBigNumberish(txData.gasPrice)) {
    errors.push(`Invalid 'gasPrice': ${txData.gasPrice}`);
  }

  if (txData.value && !ethers.isBigNumberish(txData.value)) {
    errors.push(`Invalid 'value': ${txData.value}`);
  }

  if (txData.nonce !== undefined && typeof txData.nonce !== "number") {
    errors.push(`Invalid 'nonce': ${txData.nonce}`);
  }

  // Validate data if present
  if (txData.data && typeof txData.data !== "string") {
    errors.push("Invalid 'data' format: must be hex string");
  }

  if (txData.data && !txData.data.startsWith("0x")) {
    errors.push("Invalid 'data' format: must start with 0x");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Build transaction with proper options for EIP-1559
 */
async function buildTransaction(provider, baseData) {
  const validation = validateTransactionData(baseData);
  if (!validation.valid) {
    throw new Error(`Invalid transaction data: ${validation.errors.join(", ")}`);
  }

  const feeData = await provider.getFeeData();

  // Determine gas settings based on network type
  let gasSettings = {};

  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    // EIP-1559 network
    gasSettings = {
      maxFeePerGas: baseData.maxFeePerGas || feeData.maxFeePerGas,
      maxPriorityFeePerGas: baseData.maxPriorityFeePerGas || feeData.maxPriorityFeePerGas,
    };
  } else if (feeData.gasPrice) {
    // Legacy network
    gasSettings = {
      gasPrice: baseData.gasPrice || feeData.gasPrice,
    };
  }

  return {
    ...baseData,
    ...gasSettings,
    gasLimit: baseData.gasLimit || 500000,
    value: baseData.value || 0,
  };
}

/**
 * Send transaction with proper error handling
 */
async function sendTransaction(signer, txData) {
  try {
    const validation = validateTransactionData(txData);
    if (!validation.valid) {
      throw new Error(`Invalid transaction: ${validation.errors.join(", ")}`);
    }

    console.log("📤 Sending transaction:", {
      to: txData.to,
      value: txData.value ? txData.value.toString() : "0",
      gasLimit: txData.gasLimit?.toString?.(),
      data: txData.data?.slice?.(0, 50) + "...",
    });

    const txResponse = await signer.sendTransaction(txData);

    console.log(`✓ Transaction sent: ${txResponse.hash}`);

    const receipt = await txResponse.wait(1);

    if (!receipt) {
      throw new Error("Transaction failed - no receipt received");
    }

    return {
      hash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      status: receipt.status === 1 ? "success" : "failed",
    };
  } catch (error) {
    console.error("❌ Transaction failed:", error.message);
    throw error;
  }
}

export { validateTransactionData, buildTransaction, sendTransaction };
