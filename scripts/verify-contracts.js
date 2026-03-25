cat > ~/tips-ecosystem/scripts/verify-contracts.js << 'EOF'
const { ethers } = require("hardhat");
const config = require("../config/deployed.json");

async function main() {
    console.log("==============================================");
    console.log("  Tips Ecosystem L1 - Contract Verification");
    console.log("==============================================\n");

    const contracts = [
        { name: "TrustedForwarder", address: config.contractAddresses.trustedForwarder, args: [] },
        { name: "TipCoin", address: config.contractAddresses.tipCoin, args: [] },
        { name: "USDTC", address: config.contractAddresses.usdtc, args: [] },
        { name: "TipsNameService", address: config.contractAddresses.tipsNameService, args: [] }
    ];

    for (const contract of contracts) {
        try {
            console.log(`Verifying ${contract.name}...`);
            await hre.run("verify:verify", {
                address: contract.address,
                constructorArguments: contract.args
            });
            console.log(`✅ ${contract.name} verified\n`);
        } catch (error) {
            console.log(`⚠️ ${contract.name} verification failed: ${error.message}\n`);
        }
    }

    console.log("==============================================");
    console.log("  VERIFICATION COMPLETE");
    console.log("==============================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
EOF