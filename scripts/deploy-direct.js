cat > ~/tips-ecosystem/scripts/deploy-direct.js << 'EOF'
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("==============================================");
    console.log("  Tips Ecosystem L1 - Direct Deployment");
    console.log("  Owner: TheArchitect");
    console.log("==============================================\n");

    const [deployer] = await ethers.getSigners();
    console.log(`Deploying with: ${deployer.address}\n`);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH\n`);

    const deployContract = async (name, args = []) => {
        console.log(`Deploying ${name}...`);
        const Contract = await ethers.getContractFactory(name);
        const contract = await Contract.deploy(...args);
        await contract.waitForDeployment();
        const address = await contract.getAddress();
        console.log(`✅ ${name}: ${address}\n`);
        return { name, address, contract };
    };

    const { address: forwarderAddr } = await deployContract("TrustedForwarder");
    const { address: tipCoinAddr } = await deployContract("TipCoin");
    const { address: usdtcAddr } = await deployContract("USDTC");
    const { address: nameServiceAddr } = await deployContract("TipsNameService");

    console.log("Configuring TrustedForwarder whitelist...");
    const Forwarder = await ethers.getContractFactory("TrustedForwarder");
    const forwarder = Forwarder.attach(forwarderAddr);
    
    await (await forwarder.addTrustedConsumer(tipCoinAddr)).wait();
    console.log(`✅ TipCoin whitelisted`);
    
    await (await forwarder.addTrustedConsumer(usdtcAddr)).wait();
    console.log(`✅ USDTC whitelisted`);
    
    await (await forwarder.addTrustedConsumer(nameServiceAddr)).wait();
    console.log(`✅ NameService whitelisted\n`);

    const config = {
        network: "localhost",
        chainId: 31337,
        rpcUrl: "http://127.0.0.1:8545",
        contractAddresses: {
            trustedForwarder: forwarderAddr,
            tipCoin: tipCoinAddr,
            usdtc: usdtcAddr,
            tipsNameService: nameServiceAddr
        },
        deployer: deployer.address,
        deployedAt: new Date().toISOString()
    };

    const configPath = path.join(__dirname, "../config/deployed.json");
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Config saved to: ${configPath}\n`);

    console.log("==============================================");
    console.log("  DEPLOYMENT COMPLETE | Owner: TheArchitect");
    console.log("==============================================");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
EOF
