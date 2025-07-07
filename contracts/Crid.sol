// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Crid
 * @dev Implementa um Certificado de Registro de Inscrição em Disciplina (CRID)
 * como um token não fungível (NFT) no padrão ERC-721.
 * Cada certificado é um NFT único, de propriedade do aluno, emitido pela
 * instituição (owner do contrato).
 */
contract Crid is ERC721, Ownable {
    // Contador para gerar IDs de token únicos e sequenciais.
    // Começa em 0 e é incrementado antes de cada mint.
    uint256 private _tokenIdCounter;

    // A URL base para os metadados dos tokens. Ex: "https://api.sua-faculdade.com/crid/"
    // A URI final de um token será: baseURI + tokenId.
    string private _baseURIextended;

    /**
     * @dev Configura o nome do token ("Crid"), o símbolo ("CRID") e o dono do contrato.
     */
    constructor() ERC721("Crid", "CRID") Ownable(msg.sender) {}

    /**
     * @dev Retorna a URI base para construir as URIs de metadados dos tokens.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseURIextended;
    }

    /**
     * @dev Permite que o owner do contrato defina a URI base dos metadados.
     * A URI deve terminar com uma barra "/".
     * @param baseURI A nova URI base.
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseURIextended = baseURI;
    }

    /**
     * @dev Emite um novo certificado (NFT) para um endereço de aluno.
     * Apenas o owner do contrato (a instituição) pode chamar esta função.
     * @param to O endereço do aluno que receberá o NFT.
     * @return O ID do novo token criado.
     */
    function safeMint(address to) public onlyOwner returns (uint256) {
        // O ID do token é o valor atual do contador.
        uint256 tokenId = _tokenIdCounter;
        
        // Incrementa o contador para o próximo mint.
        _tokenIdCounter++;
        
        // Cria (minta) o novo token e o atribui ao endereço do aluno.
        _safeMint(to, tokenId);

        return tokenId;
    }
}