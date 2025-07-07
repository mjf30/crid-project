const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Descreve o conjunto de testes para o contrato Crid
describe("Crid Contract (ERC-721)", function () {
  // Fixture para fazer o deploy do contrato uma única vez e reutilizar o estado
  async function deployCridFixture() {
    // Obtém as contas do Hardhat (a primeira é o owner por padrão)
    const [owner, student1, otherAccount] = await ethers.getSigners();

    // Obtém a fábrica do contrato
    const Crid = await ethers.getContractFactory("Crid");
    // Faz o deploy
    const crid = await Crid.deploy();
    await crid.waitForDeployment();

    return { crid, owner, student1, otherAccount };
  }

  // Teste de Deploy
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { crid, owner } = await loadFixture(deployCridFixture);
      expect(await crid.owner()).to.equal(owner.address);
    });

    it("Should have the correct name and symbol", async function () {
      const { crid } = await loadFixture(deployCridFixture);
      expect(await crid.name()).to.equal("Crid");
      expect(await crid.symbol()).to.equal("CRID");
    });
  });

  // Testes da função de Mint
  describe("Minting", function () {
    it("Should allow the owner to mint a new Crid NFT", async function () {
      const { crid, owner, student1 } = await loadFixture(deployCridFixture);
      
      // Owner minta um NFT para o student1
      await expect(crid.connect(owner).safeMint(student1.address))
        .to.emit(crid, "Transfer") // Verifica se o evento Transfer foi emitido
        .withArgs(ethers.ZeroAddress, student1.address, 0); // De: endereço nulo, Para: student1, Token ID: 0

      // Verifica se o balanço do student1 aumentou para 1
      expect(await crid.balanceOf(student1.address)).to.equal(1);
      // Verifica se o dono do token 0 é o student1
      expect(await crid.ownerOf(0)).to.equal(student1.address);
    });

    it("Should fail if a non-owner tries to mint", async function () {
      const { crid, student1, otherAccount } = await loadFixture(deployCridFixture);
      
      // Tenta mintar usando uma conta que não é a do owner
      await expect(
        crid.connect(otherAccount).safeMint(student1.address)
      ).to.be.revertedWithCustomError(crid, "OwnableUnauthorizedAccount")
       .withArgs(otherAccount.address);
    });

    it("Should increment token IDs sequentially", async function () {
        const { crid, owner, student1 } = await loadFixture(deployCridFixture);

        // Minta o primeiro token (ID 0)
        await crid.connect(owner).safeMint(student1.address);
        expect(await crid.ownerOf(0)).to.equal(student1.address);

        // Minta o segundo token (ID 1)
        await crid.connect(owner).safeMint(owner.address);
        expect(await crid.ownerOf(1)).to.equal(owner.address);
    });
  });

  // Testes da URI de Metadados
  describe("Metadata URI", function () {
    it("Should allow the owner to set the base URI", async function () {
        const { crid, owner } = await loadFixture(deployCridFixture);
        const newBaseURI = "https://api.example.com/crids/";

        // Define a nova URI base
        await crid.connect(owner).setBaseURI(newBaseURI);

        // Minta um token para testar a URI
        await crid.connect(owner).safeMint(owner.address);
        
        // Verifica se a tokenURI está correta (baseURI + tokenId)
        expect(await crid.tokenURI(0)).to.equal(newBaseURI + "0");
    });

    it("Should fail if a non-owner tries to set the base URI", async function () {
        const { crid, otherAccount } = await loadFixture(deployCridFixture);
        const newBaseURI = "https://api.example.com/crids/";

        await expect(
            crid.connect(otherAccount).setBaseURI(newBaseURI)
        ).to.be.revertedWithCustomError(crid, "OwnableUnauthorizedAccount")
         .withArgs(otherAccount.address);
    });

    it("Should return an empty string for tokenURI if base URI is not set", async function () {
        const { crid, owner } = await loadFixture(deployCridFixture);
        await crid.connect(owner).safeMint(owner.address);
        expect(await crid.tokenURI(0)).to.equal("");
    });
  });
});