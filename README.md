# CRID Registry - Cartório de Certificados em Blockchain

Este projeto implementa um sistema de registro de certificados digitais (CRID - Certificado de Registro de Inscrição em Disciplina) na blockchain, funcionando como um cartório digital. A abordagem utiliza um smart contract para armazenar e gerenciar os certificados como registros de dados on-chain.

A instituição de ensino, como proprietária do contrato, tem autoridade exclusiva para emitir e revogar certificados, garantindo um registro de dados autoritativo, imutável e publicamente verificável.

## Funcionalidades

*   **Emissão de Certificados:** Apenas o dono do contrato pode registrar novos certificados, associando-os a um endereço de aluno.
*   **Revogação de Certificados:** O dono do contrato pode invalidar um certificado existente, mantendo o histórico da emissão.
*   **Consulta Pública:** Qualquer pessoa ou sistema pode verificar os detalhes e a validade de um certificado usando seu ID único.

## Tecnologias Utilizadas

*   **Solidity:** Linguagem para escrever o smart contract.
*   **Hardhat:** Ambiente de desenvolvimento para compilação, testes e deploy.
*   **OpenZeppelin:** Biblioteca para contratos seguros, utilizada aqui para o controle de acesso (`Ownable`).
*   **Ethers.js & Chai:** Para a suíte de testes automatizados.

## Como Começar

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão 18.x ou superior)
*   [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

### 1. Instalação

Clone o repositório e instale as dependências:

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd crid-project
npm install
```

### 2. Compilação

Para compilar os smart contracts, use o comando:

```bash
npx hardhat compile
```
Isso irá gerar os artefatos da compilação (ABI e bytecode) no diretório `artifacts/`.

### 3. Testes

Para rodar a suíte de testes automatizados e garantir que tudo está funcionando como esperado:

```bash
npx hardhat test
```

### 4. Deploy

Para fazer o deploy do contrato em uma rede local do Hardhat:

1.  Inicie um nó local em um terminal:
    ```bash
    npx hardhat node
    ```

2.  Em outro terminal, execute o script de deploy:
    ```bash
    npx hardhat run scripts/deploy.js --network localhost
    ```

O endereço do contrato implantado será exibido no console.
