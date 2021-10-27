// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Paris {

    enum Outcome {EQUIPE1, NUL, EQUIPE2} 

    Outcome outcomeGagnant;

    uint256 totalReward;
    uint endGameTime;

    uint256 private _coteEquipe1;
    uint256 private _coteNul;
    uint256 private _coteEquipe2;
    address private _createur;

    struct Bet {
        Outcome outcome;
        uint256 cote;
        uint256 reward;
    }

    mapping (address => Bet) markets;

    constructor(

        uint256 coteEquipe1_, 
        uint256 coteNul_, 
        uint256 coteEquipe2_, 
        uint duration) public {

        _createur = msg.sender;
        _coteEquipe1 = coteEquipe1_;
        _coteNul = coteNul_;
        _coteEquipe2 = coteEquipe2_;
        endGameTime = block.timestamp + duration;
        totalReward = 0;

    }

    function addBet(uint256 outcome) payable public {
        require(outcome == 0 || outcome == 1 || outcome == 2, "wrong outcome");
        require(msg.value > 0, "no ether was send");
        require(block.timestamp <= endGameTime, "market is closed");

        if (outcome == 0) {
            markets[msg.sender] =  Bet(Outcome.EQUIPE1, _coteEquipe1, (_coteEquipe1 * msg.value));
        } else if (outcome == 1) {
            markets[msg.sender] = Bet(Outcome.NUL, _coteNul, (_coteNul * msg.value));
        } else if (outcome == 2) {
            markets[msg.sender] =  Bet(Outcome.EQUIPE2, _coteNul, (_coteEquipe2 * msg.value));
        } else {
            revert("Your outcome is not available");
        }

        totalReward += msg.value;
    }

    function resultGame() public {
        require(msg.sender == _createur, "not authorized");
        require(block.timestamp > endGameTime, "event is not finished");

        outcomeGagnant = Outcome.EQUIPE1;
    }

    function getTotalReward() public view returns(uint256) {
        return totalReward;
    }

    function distributeReward() public payable {
        require(block.timestamp > endGameTime, "event is not finished");
        
        if (markets[msg.sender].outcome == outcomeGagnant) {
             msg.sender.transfer(totalReward);
        }
    }

    function marketIsClosed() public view returns(bool) {
        bool marketIsClose =  (block.timestamp > endGameTime);

        return marketIsClose;
    }

    function getCote1() public view returns(uint256) {
        return _coteEquipe1;
    }

    function getCote2()  public view  returns(uint256) {
        return _coteEquipe2;
    }

    function getCoteNulle()public view returns(uint256) {
        return _coteNul;
    }

    function getBets() public view 
        returns(Outcome outcome, uint256 cote, uint256 reward) {
        address sender = msg.sender;
        Bet memory userBet = markets[msg.sender];
        return (userBet.outcome, userBet.cote, userBet.reward);
    }
}