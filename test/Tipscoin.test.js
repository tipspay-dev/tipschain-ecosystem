cat > ~/tips-ecosystem/test/TipCoin.test.js << 'EOF'
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipCoin", function () {
    let tipCoin;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const TipCoin = await ethers.getContractFactory("TipCoin");
        tipCoin = await TipCoin.deploy();
        await tipCoin.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await tipCoin.owner()).to.equal(owner.address);
        });

        it("Should assign total supply to owner", async function () {
            const ownerBalance = await tipCoin.balanceOf(owner.address);
            expect(await tipCoin.totalSupply()).to.equal(ownerBalance);
        });

        it("Should have correct token name and symbol", async function () {
            expect(await tipCoin.name()).to.equal("Tip Coin");
            expect(await tipCoin.symbol()).to.equal("TPC");
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            await tipCoin.transfer(addr1.address, 50000);
            const addr1Balance = await tipCoin.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50000);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            await expect(
                tipCoin.connect(addr1).transfer(owner.address, 1)
            ).to.be.reverted;
        });
    });

    describe("Pause/Unpause", function () {
        it("Should pause and unpause", async function () {
            await tipCoin.pause();
            expect(await tipCoin.paused()).to.be.true;

            await tipCoin.unpause();
            expect(await tipCoin.paused()).to.be.false;
        });

        it("Should fail transfer when paused", async function () {
            await tipCoin.pause();
            await expect(
                tipCoin.transfer(addr1.address, 50000)
            ).to.be.reverted;
        });
    });
});
EOF
