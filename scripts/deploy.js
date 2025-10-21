const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get the contract factory
  const KeeperFlower = await hre.ethers.getContractFactory("keeperFlower");
  
  // Set the interval (in seconds) for the keeper to check
  // Default: 60 seconds (1 minute) for testing
  // You can change this to a larger value for production
  const interval = 60; // 60 seconds
  
  console.log(`Deploying keeperFlower contract with interval: ${interval} seconds...`);
  
  // Deploy the contract
  const keeperFlower = await KeeperFlower.deploy(interval);
  
  await keeperFlower.deployed();
  
  console.log("✅ keeperFlower contract deployed to:", keeperFlower.address);
  console.log("Interval set to:", interval, "seconds");
  console.log("\nNext steps:");
  console.log("1. Mint your first NFT by calling safeMint()");
  console.log("2. Register this contract with Chainlink Keepers at: https://keepers.chain.link");
  console.log("3. Wait for the interval to pass and watch your NFT grow!");
  console.log("\nContract verification command:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${keeperFlower.address} ${interval}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

