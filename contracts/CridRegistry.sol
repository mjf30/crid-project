// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CridRegistry
 * @dev Contrato que funciona como um cartório ou registro centralizado para
 * Certificados de Registro de Inscrição em Disciplina (CRID).
 * A instituição (owner) pode emitir, revogar e consultar certificados.
 * Os certificados são armazenados como registros de dados seguros e imutáveis diretamente no contrato.
 */
contract CridRegistry is Ownable {

    // Estrutura que define os dados de um certificado
    struct Certificado {
        uint256 id;
        address studentAddress; // Endereço do aluno que recebeu o certificado
        string courseName;
        string professorName;
        uint256 issueDate;
        bool isValid; // Permite que o certificado seja revogado
    }

    // Mapeamento do ID do certificado para o struct do certificado
    mapping(uint256 => Certificado) private _certificates;
    
    // Contador para gerar o próximo ID de certificado
    uint256 private _nextCertificateId;

    // Evento emitido quando um novo certificado é criado
    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed studentAddress,
        string courseName
    );

    // Evento emitido quando um certificado é revogado
    event CertificateRevoked(uint256 indexed certificateId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Emite um novo certificado para um aluno.
     * Apenas o owner do contrato (a instituição) pode chamar esta função.
     * @param _studentAddress O endereço do aluno.
     * @param _courseName O nome do curso ou disciplina.
     * @param _professorName O nome do professor.
     */
    function issueCertificate(
        address _studentAddress,
        string memory _courseName,
        string memory _professorName
    ) public onlyOwner {
        uint256 id = _nextCertificateId;
        
        _certificates[id] = Certificado({
            id: id,
            studentAddress: _studentAddress,
            courseName: _courseName,
            professorName: _professorName,
            issueDate: block.timestamp,
            isValid: true
        });

        _nextCertificateId++;

        emit CertificateIssued(id, _studentAddress, _courseName);
    }

    /**
     * @dev Revoga um certificado, tornando-o inválido.
     * Apenas o owner pode chamar esta função.
     * @param _certificateId O ID do certificado a ser revogado.
     */
    function revokeCertificate(uint256 _certificateId) public onlyOwner {
        Certificado storage cert = _certificates[_certificateId];
        // Garante que o certificado existe antes de tentar revogá-lo
        require(cert.issueDate != 0, "Certificado nao encontrado");
        
        cert.isValid = false;
        emit CertificateRevoked(_certificateId);
    }

    /**
     * @dev Retorna os detalhes de um certificado específico.
     * Função pública para que qualquer pessoa possa verificar um certificado.
     * @param _certificateId O ID do certificado.
     * @return O struct completo do certificado.
     */
    function getCertificate(
        uint256 _certificateId
    ) public view returns (Certificado memory) {
        return _certificates[_certificateId];
    }
}
