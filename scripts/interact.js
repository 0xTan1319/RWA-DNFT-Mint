const hre = require("hardhat");

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Please provide CONTRACT_ADDRESS environment variable");
    console.log("Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/interact.js --network <network>");
    process.exit(1);
  }

  console.log("Interacting with keeperFlower contract...");
  console.log("Contract address:", contractAddress);

  // Get the contract
  const KeeperFlower = await hre.ethers.getContractFactory("keeperFlower");
  const keeperFlower = await KeeperFlower.attach(contractAddress);

  // Get the total supply
  const totalSupply = await keeperFlower.tokenIdCounter();
  console.log("\n📊 Contract Statistics:");
  console.log("Total tokens minted:", totalSupply.toString());

  if (totalSupply.gt(0)) {
    // Show information for each token
    for (let i = 0; i < totalSupply.toNumber(); i++) {
      console.log(`\n🌸 Token #${i}:`);
      try {
        const owner = await keeperFlower.ownerOf(i);
        const tokenURI = await keeperFlower.tokenURI(i);
        const stage = await keeperFlower.flowerStage(i);
        
        console.log("  Owner:", owner);
        console.log("  Token URI:", tokenURI);
        console.log("  Flower stage:", stage.toString(), "(0=seed, 1=sprout, 2=bloom)");
      } catch (error) {
        console.log("  Error reading token:", error.message);
      }
    }
  }

  // Check if upkeep is needed
  console.log("\n⏰ Keeper Status:");
  try {
    const [upkeepNeeded] = await keeperFlower.checkUpkeep("0x");
    console.log("Upkeep needed:", upkeepNeeded);
    
    if (upkeepNeeded) {
      console.log("✅ The keeper can perform an update now!");
    } else {
      console.log("⏳ Not ready for update yet. Wait for the interval to pass or all flowers are fully grown.");
    }
  } catch (error) {
    console.log("Could not check upkeep status:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

