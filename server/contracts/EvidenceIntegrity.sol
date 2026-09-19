// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EvidenceIntegrity {
    struct EvidenceRecord {
        bytes32 commitment;
        uint256 timestamp;
        address anchoredBy;
        bool exists;
    }

    mapping(bytes32 => EvidenceRecord) private evidenceRecords;

    event EvidenceAnchored(
        bytes32 indexed fileId,
        bytes32 indexed commitment,
        uint256 timestamp,
        address indexed anchoredBy
    );

    function anchorEvidence(
        bytes32 fileId,
        bytes32 commitment
    ) external {
        require(fileId != bytes32(0), "Invalid file ID");
        require(commitment != bytes32(0), "Invalid commitment");
        require(
            !evidenceRecords[fileId].exists,
            "Evidence already anchored"
        );

        evidenceRecords[fileId] = EvidenceRecord({
            commitment: commitment,
            timestamp: block.timestamp,
            anchoredBy: msg.sender,
            exists: true
        });

        emit EvidenceAnchored(
            fileId,
            commitment,
            block.timestamp,
            msg.sender
        );
    }

    function getEvidence(
        bytes32 fileId
    )
        external
        view
        returns (
            bytes32 commitment,
            uint256 timestamp,
            address anchoredBy,
            bool exists
        )
    {
        EvidenceRecord memory record = evidenceRecords[fileId];

        return (
            record.commitment,
            record.timestamp,
            record.anchoredBy,
            record.exists
        );
    }

    function verifyEvidence(
        bytes32 fileId,
        bytes32 currentCommitment
    ) external view returns (bool) {
        EvidenceRecord memory record = evidenceRecords[fileId];

        if (!record.exists) {
            return false;
        }

        return record.commitment == currentCommitment;
    }
}