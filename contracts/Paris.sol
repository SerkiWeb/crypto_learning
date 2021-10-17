// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Paris {

    enum Outcome {EQUIPE1, NUL, EQUIPE2} 

    address private _createur;

    Outcome coteGagnante;

    uint256 totalReward;

    uint256 private _coteEquipe1;
    uint256 private _coteNul;
    uint256 private _coteEquipe2;

    uint endGameTime;

    struct Bet {
        Outcome outcome;
        uint256 cote;
        uint256 reward;
    }

    mapping (address => Bet) markets;

    constructor(uint256 coteEquipe1_, uint256 coteNul_, uint256 coteEquipe2_, uint duration) payable public {
        require(msg.value > 0);

        _createur = msg.sender;
        _coteEquipe1 = coteEquipe1_;
        _coteNul = coteNul_;
        _coteEquipe2 = coteEquipe2_;
        endGameTime = block.timestamp + duration;
        totalReward = msg.value;
    }

    function addBet(uint256 outcome) payable public {
        require(outcome == 0 || outcome == 1 || outcome == 2);
        require(msg.value > 0);

        if (outcome == 0) {
            markets[msg.sender] =  Bet(Outcome.EQUIPE1, _coteEquipe1, (_coteEquipe1 * msg.value));
        } else if (outcome == 1) {
            markets[msg.sender] = Bet(Outcome.NUL, _coteNul, (_coteNul * msg.value));
        } else if (outcome == 2) {
            markets[msg.sender] =  Bet(Outcome.EQUIPE2, _coteNul, (_coteEquipe2 * msg.value));
        } else {
            revert("Your outcome is not available");
        }
    }

    function resultGame() public {
        require(msg.sender == _createur, "not authorized");
        require(block.timestamp > endGameTime, "event is not finished");

        coteGagnante = Outcome.EQUIPE1;
    }
}