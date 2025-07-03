// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Crid
 * @dev Contrato para verificar a autenticidade de um Certificado de Registro de Inscrição 
 * em Disciplina (CRID) através de assinaturas digitais.
 * A faculdade (owner do contrato) assina os dados do certificado off-chain,
 * e qualquer pessoa pode verificar a assinatura on-chain sem a necessidade
 * de armazenar os dados do certificado no contrato, economizando gás.
 */
contract Crid is Ownable {

    constructor() Ownable(msg.sender) {}

    // Estrutura que define os dados de um certificado.
    struct Certificado {
        uint256 idAluno;
        string nomeCurso;
        string nomeProfessor;
        uint256 dataEmissao;
        uint256 nonce; // Nonce para prevenir ataques de replay
    }

    /**
     * @dev Verifica a validade de um certificado.
     * @param _certificado O struct contendo os dados do certificado.
     * @param _assinatura A assinatura digital gerada pela faculdade (owner).
     * @return bool Retorna true se a assinatura for válida e o assinante for o owner.
     */
    function verificarCertificado(
        Certificado calldata _certificado,
        bytes calldata _assinatura
    ) public view returns (bool) {
        // Reconstrói a hash da mensagem que foi assinada off-chain.
        bytes32 messageHash = _getMessageHash(_certificado);

        // Adiciona o prefixo padrão do Ethereum para garantir que a assinatura
        // não seja válida para outras transações (proteção contra replay).
        bytes32 prefixedHash = _getEthSignedMessageHash(messageHash);

        // Usa ecrecover para extrair o endereço do assinante a partir da hash e da assinatura.
        address signer = _recoverSigner(prefixedHash, _assinatura);

        // A verificação é bem-sucedida se o endereço recuperado não for nulo
        // e for igual ao endereço do owner do contrato (a faculdade).
        return signer != address(0) && signer == owner();
    }

    /**
     * @dev Gera a hash keccak256 dos dados do certificado.
     * Esta função deve ser replicada exatamente da mesma forma no lado do cliente (off-chain)
     * para gerar a mesma hash que será assinada.
     * @param _certificado O struct do certificado.
     * @return bytes32 A hash dos dados.
     */
    function _getMessageHash(
        Certificado calldata _certificado
    ) private pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                _certificado.idAluno,
                _certificado.nomeCurso,
                _certificado.nomeProfessor,
                _certificado.dataEmissao,
                _certificado.nonce
            )
        );
    }

    /**
     * @dev Adiciona o prefixo "\x19Ethereum Signed Message:\n32" à hash da mensagem.
     * Este é o padrão usado por carteiras como a MetaMask ao assinar mensagens,
     * garantindo que a assinatura seja única para a blockchain Ethereum.
     * @param _messageHash A hash original da mensagem.
     * @return bytes32 A hash com o prefixo.
     */
    function _getEthSignedMessageHash(
        bytes32 _messageHash
    ) private pure returns (bytes32) {
        return keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash)
        );
    }

    /**
     * @dev Recupera o endereço do assinante a partir de uma assinatura.
     * A assinatura é dividida em seus componentes v, r, e s.
     * @param _ethSignedMessageHash A hash da mensagem com o prefixo Ethereum.
     * @param _assinatura A assinatura completa.
     * @return address O endereço do assinante.
     */
    function _recoverSigner(
        bytes32 _ethSignedMessageHash,
        bytes memory _assinatura
    ) private pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_assinatura);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    /**
     * @dev Divide a assinatura em seus componentes (r, s, v).
     * @param _assinatura A assinatura em bytes.
     * @return r O componente r da assinatura.
     * @return s O componente s da assinatura.
     * @return v O componente v da assinatura.
     */
    function _splitSignature(
        bytes memory _assinatura
    ) private pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_assinatura.length == 65, "Assinatura invalida");
        
        assembly {
            // Primeiro 32 bytes
            r := mload(add(_assinatura, 32))
            // Próximos 32 bytes
            s := mload(add(_assinatura, 64))
            // Último byte
            v := byte(0, mload(add(_assinatura, 96)))
        }
    }

    /**
     * @dev Função pública para obter a hash da mensagem. Útil para testes e integração.
     */
    function getMessageHash(
        Certificado calldata _certificado
    ) public pure returns (bytes32) {
        return _getMessageHash(_certificado);
    }
}