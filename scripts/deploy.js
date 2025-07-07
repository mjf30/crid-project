const hre = require("hardhat");

async function main() {
  // Obtém o contrato que será implantado
  const CridRegistry = await hre.ethers.getContractFactory("CridRegistry");

  // Faz o deploy do contrato
  const cridRegistry = await CridRegistry.deploy();

  // Aguarda a confirmação do deploy na rede
  await cridRegistry.waitForDeployment();

  // Exibe o endereço do contrato no console
  console.log(`Contrato CridRegistry implantado em: ${cridRegistry.target}`);
}

// Padrão recomendado para lidar com erros e executar a função main.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});