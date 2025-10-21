const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("keeperFlower", function () {
  let keeperFlower;
  let owner;
  let addr1;
  let addr2;
  const INTERVAL = 60; // 60 seconds

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the contract
    const KeeperFlower = await ethers.getContractFactory("keeperFlower");
    keeperFlower = await KeeperFlower.deploy(INTERVAL);
    await keeperFlower.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      expect(await keeperFlower.name()).to.equal("FlowerTan");
      expect(await keeperFlower.symbol()).to.equal("fTAN");
    });

    it("Should start with token counter at 0", async function () {
      expect(await keeperFlower.tokenIdCounter()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint a new token", async function () {
      await keeperFlower.safeMint(addr1.address);
      expect(await keeperFlower.ownerOf(0)).to.equal(addr1.address);
      expect(await keeperFlower.tokenIdCounter()).to.equal(1);
    });

    it("Should set initial token URI to seed stage", async function () {
      await keeperFlower.safeMint(addr1.address);
      const tokenURI = await keeperFlower.tokenURI(0);
      expect(tokenURI).to.include("seed.json");
    });

    it("Should mint multiple tokens", async function () {
      await keeperFlower.safeMint(addr1.address);
      await keeperFlower.safeMint(addr2.address);
      
      expect(await keeperFlower.ownerOf(0)).to.equal(addr1.address);
      expect(await keeperFlower.ownerOf(1)).to.equal(addr2.address);
      expect(await keeperFlower.tokenIdCounter()).to.equal(2);
    });
  });

  describe("Flower Stage", function () {
    beforeEach(async function () {
      await keeperFlower.safeMint(addr1.address);
    });

    it("Should start at stage 0 (seed)", async function () {
      expect(await keeperFlower.flowerStage(0)).to.equal(0);
    });

    it("Should grow to stage 1 (sprout)", async function () {
      await keeperFlower.growFlower(0);
      expect(await keeperFlower.flowerStage(0)).to.equal(1);
    });

    it("Should grow to stage 2 (bloom)", async function () {
      await keeperFlower.growFlower(0);
      await keeperFlower.growFlower(0);
      expect(await keeperFlower.flowerStage(0)).to.equal(2);
    });

    it("Should not grow beyond stage 2", async function () {
      await keeperFlower.growFlower(0);
      await keeperFlower.growFlower(0);
      await keeperFlower.growFlower(0);
      expect(await keeperFlower.flowerStage(0)).to.equal(2);
    });
  });

  describe("Keeper Functionality", function () {
    beforeEach(async function () {
      await keeperFlower.safeMint(addr1.address);
    });

    it("Should not need upkeep immediately after minting", async function () {
      const [upkeepNeeded] = await keeperFlower.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;
    });

    it("Should need upkeep after interval passes", async function () {
      // Fast forward time by INTERVAL + 1 second
      await ethers.provider.send("evm_increaseTime", [INTERVAL + 1]);
      await ethers.provider.send("evm_mine");

      const [upkeepNeeded] = await keeperFlower.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.true;
    });

    it("Should perform upkeep and grow flower", async function () {
      expect(await keeperFlower.flowerStage(0)).to.equal(0);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [INTERVAL + 1]);
      await ethers.provider.send("evm_mine");

      await keeperFlower.performUpkeep("0x");
      expect(await keeperFlower.flowerStage(0)).to.equal(1);
    });

    it("Should not need upkeep when flower is fully grown", async function () {
      // Grow flower to max stage
      await keeperFlower.growFlower(0);
      await keeperFlower.growFlower(0);
      expect(await keeperFlower.flowerStage(0)).to.equal(2);

      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [INTERVAL + 1]);
      await ethers.provider.send("evm_mine");

      const [upkeepNeeded] = await keeperFlower.checkUpkeep("0x");
      expect(upkeepNeeded).to.be.false;
    });
  });

  describe("String Comparison", function () {
    it("Should correctly compare equal strings", async function () {
      expect(await keeperFlower.compareStrings("hello", "hello")).to.be.true;
    });

    it("Should correctly compare different strings", async function () {
      expect(await keeperFlower.compareStrings("hello", "world")).to.be.false;
    });
  });
});

