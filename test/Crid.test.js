const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Crid", function () {
  let Crid, crid, owner, otherAccount;

  // Antes de cada teste, fazemos o deploy do contrato e obtemos as contas
  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    const CridFactory = await ethers.getContractFactory("Crid");
    crid = await CridFactory.deploy();
  });

  // Função auxiliar para criar uma assinatura
  async function signCertificate(signer, certificado) {
    // A forma como o contrato empacota e hasheia os dados
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "string", "string", "uint256", "uint256"],
      [
        certificado.idAluno,
        certificado.nomeCurso,
        certificado.nomeProfessor,
        certificado.dataEmissao,
        certificado.nonce,
      ]
    );

    // O ethers.js adiciona automaticamente o prefixo "\x19Ethereum Signed Message:\n32"
    // ao assinar a mensagem. `ethers.getBytes` é necessário para garantir que a string
    // de hash seja tratada como um array de bytes.
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    return signature;
  }

  describe("Deployment", function () {
    it("Deve atribuir o owner corretamente", async function () {
      expect(await crid.owner()).to.equal(owner.address);
    });
  });

  describe("Verificacao de Certificado", function () {
    const certificado = {
      idAluno: 12345,
      nomeCurso: "Ciencia da Computacao",
      nomeProfessor: "Dr. Alan Turing",
      dataEmissao: Math.floor(Date.now() / 1000),
      nonce: 1,
    };

    it("Deve retornar true para uma assinatura valida do owner", async function () {
      const signature = await signCertificate(owner, certificado);
      expect(await crid.verificarCertificado(certificado, signature)).to.be.true;
    });

    it("Deve retornar false para uma assinatura invalida", async function () {
      let signature = await signCertificate(owner, certificado);
      // Altera a assinatura para torná-la inválida
      signature = signature.slice(0, -2) + "00"; 
      expect(await crid.verificarCertificado(certificado, signature)).to.be.false;
    });

    it("Deve retornar false se o assinante nao for o owner", async function () {
      const signature = await signCertificate(otherAccount, certificado);
      expect(await crid.verificarCertificado(certificado, signature)).to.be.false;
    });

    it("Deve retornar false se os dados do certificado forem alterados apos a assinatura", async function () {
      const signature = await signCertificate(owner, certificado);
      const certificadoAlterado = { ...certificado, nomeCurso: "Engenharia de Software" };
      expect(await crid.verificarCertificado(certificadoAlterado, signature)).to.be.false;
    });
  });
});
