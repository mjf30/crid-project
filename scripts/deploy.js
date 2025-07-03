// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const crid = await hre.ethers.deployContract("Crid");

  await crid.waitForDeployment();

  console.log(`Crid contract deployed to: ${crid.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
