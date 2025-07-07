const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Descreve o conjunto de testes para o contrato CridRegistry
describe("CridRegistry Contract", function () {
  
  // Fixture para fazer o deploy do contrato e obter contas
  async function deployCridRegistryFixture() {
    const [owner, student1, otherAccount] = await ethers.getSigners();
    const CridRegistry = await ethers.getContractFactory("CridRegistry");
    const cridRegistry = await CridRegistry.deploy();
    await cridRegistry.waitForDeployment();
    return { cridRegistry, owner, student1, otherAccount };
  }

  // Testes de Deploy
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { cridRegistry, owner } = await loadFixture(deployCridRegistryFixture);
      expect(await cridRegistry.owner()).to.equal(owner.address);
    });
  });

  // Testes da função de Emissão de Certificados
  describe("Certificate Issuance", function () {
    it("Should allow the owner to issue a new certificate", async function () {
      const { cridRegistry, owner, student1 } = await loadFixture(deployCridRegistryFixture);
      const courseName = "Introdução a Solidity";
      const professorName = "Dr. Satoshi";

      // Emite um novo certificado e verifica o evento
      await expect(cridRegistry.connect(owner).issueCertificate(student1.address, courseName, professorName))
        .to.emit(cridRegistry, "CertificateIssued")
        .withArgs(0, student1.address, courseName);

      // Verifica se os dados do certificado foram armazenados corretamente
      const cert = await cridRegistry.getCertificate(0);
      expect(cert.id).to.equal(0);
      expect(cert.studentAddress).to.equal(student1.address);
      expect(cert.courseName).to.equal(courseName);
      expect(cert.professorName).to.equal(professorName);
      expect(cert.isValid).to.be.true;
    });

    it("Should fail if a non-owner tries to issue a certificate", async function () {
      const { cridRegistry, student1, otherAccount } = await loadFixture(deployCridRegistryFixture);
      
      // Tenta emitir usando uma conta não autorizada
      await expect(
        cridRegistry.connect(otherAccount).issueCertificate(student1.address, "Curso Fake", "Prof Fake")
      ).to.be.revertedWithCustomError(cridRegistry, "OwnableUnauthorizedAccount")
       .withArgs(otherAccount.address);
    });

    it("Should increment certificate IDs sequentially", async function () {
        const { cridRegistry, owner, student1 } = await loadFixture(deployCridRegistryFixture);

        // Emite o primeiro certificado (ID 0)
        await cridRegistry.connect(owner).issueCertificate(student1.address, "Curso A", "Prof A");
        const cert0 = await cridRegistry.getCertificate(0);
        expect(cert0.id).to.equal(0);

        // Emite o segundo certificado (ID 1)
        await cridRegistry.connect(owner).issueCertificate(owner.address, "Curso B", "Prof B");
        const cert1 = await cridRegistry.getCertificate(1);
        expect(cert1.id).to.equal(1);
    });
  });

  // Testes da função de Revogação de Certificados
  describe("Certificate Revocation", function () {
    it("Should allow the owner to revoke a certificate", async function () {
        const { cridRegistry, owner, student1 } = await loadFixture(deployCridRegistryFixture);
        await cridRegistry.connect(owner).issueCertificate(student1.address, "Curso Revogavel", "Prof C");

        // Verifica se o certificado é válido antes da revogação
        const certBefore = await cridRegistry.getCertificate(0);
        expect(certBefore.isValid).to.be.true;

        // Revoga o certificado e verifica o evento
        await expect(cridRegistry.connect(owner).revokeCertificate(0))
            .to.emit(cridRegistry, "CertificateRevoked")
            .withArgs(0);

        // Verifica se o certificado agora está inválido
        const certAfter = await cridRegistry.getCertificate(0);
        expect(certAfter.isValid).to.be.false;
    });

    it("Should fail if a non-owner tries to revoke a certificate", async function () {
        const { cridRegistry, owner, student1, otherAccount } = await loadFixture(deployCridRegistryFixture);
        await cridRegistry.connect(owner).issueCertificate(student1.address, "Curso D", "Prof D");

        await expect(
            cridRegistry.connect(otherAccount).revokeCertificate(0)
        ).to.be.revertedWithCustomError(cridRegistry, "OwnableUnauthorizedAccount")
         .withArgs(otherAccount.address);
    });

    it("Should revert when trying to revoke a non-existent certificate", async function () {
        const { cridRegistry, owner } = await loadFixture(deployCridRegistryFixture);
        await expect(
            cridRegistry.connect(owner).revokeCertificate(99) // ID que não existe
        ).to.be.revertedWith("Certificado nao encontrado");
    });
  });
});