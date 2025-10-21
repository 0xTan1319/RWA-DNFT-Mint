const hre = require("hardhat");

async function main() {
  // Get the contract address from command line arguments
  const contractAddress = process.env.CONTRACT_ADDRESS;
  
  if (!contractAddress) {
    console.error("❌ Please provide CONTRACT_ADDRESS environment variable");
    console.log("Usage: CONTRACT_ADDRESS=0x... npx hardhat run scripts/mint.js --network <network>");
    process.exit(1);
  }

  console.log("Minting NFT...");
  console.log("Contract address:", contractAddress);

  // Get the contract
  const KeeperFlower = await hre.ethers.getContractFactory("keeperFlower");
  const keeperFlower = await KeeperFlower.attach(contractAddress);

  // Get the signer (the account that will receive the NFT)
  const [signer] = await hre.ethers.getSigners();
  console.log("Minting to address:", signer.address);

  // Mint the NFT
  const tx = await keeperFlower.safeMint(signer.address);
  console.log("Transaction hash:", tx.hash);
  
  // Wait for the transaction to be mined
  await tx.wait();
  
  // Get the token ID that was just minted
  const tokenId = (await keeperFlower.tokenIdCounter()).sub(1);
  console.log("✅ NFT minted successfully!");
  console.log("Token ID:", tokenId.toString());
  
  // Get the current token URI
  const tokenURI = await keeperFlower.tokenURI(tokenId);
  console.log("Token URI:", tokenURI);
  
  // Get the flower stage
  const stage = await keeperFlower.flowerStage(tokenId);
  console.log("Flower stage:", stage.toString(), "(0=seed, 1=sprout, 2=bloom)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

