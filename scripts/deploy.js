const hre = require("hardhat");

async function main() {
  // Compila o contrato
  await hre.run('compile');

  // Obtém o contrato que será implantado
  const Crid = await hre.ethers.getContractFactory("Crid");

  // Faz o deploy do contrato
  const crid = await Crid.deploy();

  // Aguarda a confirmação do deploy na rede
  await crid.waitForDeployment();

  // Exibe o endereço do contrato no console
  console.log(`Contrato Crid (Registro Customizado) implantado em: ${crid.target}`);
}

// Padrão recomendado para lidar com erros e executar a função main.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
