# Projeto CRID - Certificado de Registro de Inscrição em Disciplina

Este projeto implementa um sistema de verificação de certificados digitais usando um smart contract na blockchain Ethereum. A principal característica é a verificação on-chain de assinaturas geradas off-chain, o que resulta em uma grande economia de custos de gás, pois os dados dos certificados não são armazenados na blockchain.

## Como Funciona

1.  **Geração Off-Chain**: A instituição de ensino (o "owner" do contrato) gera um certificado com os dados do aluno, curso, etc.
2.  **Assinatura Off-Chain**: A instituição usa sua chave privada para assinar a hash dos dados do certificado.
3.  **Verificação On-Chain**: Qualquer pessoa pode chamar a função `verificarCertificado` no smart contract, fornecendo os dados do certificado e a assinatura. O contrato reconstrói a hash, recupera o endereço do assinante e verifica se corresponde ao endereço da instituição.

## Estrutura do Projeto

-   `contracts/Crid.sol`: O smart contract principal escrito em Solidity.
-   `test/Crid.test.js`: Testes automatizados para o contrato usando Hardhat, Ethers.js, Mocha e Chai.
-   `scripts/deploy.js`: Script para fazer o deploy do contrato.
-   `.github/workflows/ci.yml`: Workflow de Integração Contínua com GitHub Actions para rodar os testes automaticamente.
-   `hardhat.config.js`: Arquivo de configuração do Hardhat.
-   `package.json`: Dependências e scripts do projeto.

## Começando

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior)
-   [npm](https://www.npmjs.com/)

### Instalação

Clone o repositório e instale as dependências:

```bash
git clone <URL_DO_REPOSITORIO>
cd crid-project
npm install
```

### Compilação

Para compilar os smart contracts, use o comando:

```bash
npx hardhat compile
```

### Testes

Para rodar os testes automatizados, execute:

```bash
npx hardhat test
```

### Deploy

Para fazer o deploy do contrato em uma rede (configurada no `hardhat.config.js`), use o script:

```bash
npx hardhat run scripts/deploy.js --network <NOME_DA_REDE>
```
