// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Paris {

    enum Outcome {EQUIPE1, NUL, EQUIPE2}
    enum StatusEvent {NOT_STARTED, IN_PROGRESS, FINISHED, RESULTED }

    Outcome outcomeGagnant;

    uint256 totalReward;
    uint startEventTime;
    uint endEventTime;
    string equipe1;
    string equipe2;
    int butsEquipe1;
    int butsEquipe2;
    bool marketIsClose;
    StatusEvent statusMatch;

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
        string memory equipe1_,
        string memory equipe2_,
        uint256 coteEquipe1_, 
        uint256 coteNul_, 
        uint256 coteEquipe2_, 
        uint startEventTime_,
        uint duration
        ) public {    

        _createur = msg.sender;
        _coteEquipe1 = coteEquipe1_;
        _coteNul = coteNul_;
        _coteEquipe2 = coteEquipe2_;
        startEventTime = startEventTime_;
        endEventTime = startEventTime + duration;
        totalReward = 0;
        equipe1 = equipe1_;
        equipe2 = equipe2_;
        butsEquipe1 = 0;
        butsEquipe2 = 0;
        statusMatch = StatusEvent.NOT_STARTED;
        marketIsClose = false;
    }

    function addBet(uint256 outcome) payable public {
        require(outcome == 0 || outcome == 1 || outcome == 2, "wrong outcome");
        require(msg.value > 0, "no ether was send");
        require(block.timestamp <= endEventTime, "market is closed");

        if (outcome == 0) {
            markets[msg.sender] =  Bet(Outcome.EQUIPE1, _coteEquipe1, (_coteEquipe1 * msg.value));
        } else if (outcome == 1) {
            markets[msg.sender] = Bet(Outcome.NUL, _coteNul, (_coteNul * msg.value));
        } else if (outcome == 2) {
            markets[msg.sender] =  Bet(Outcome.EQUIPE2, _coteEquipe2, (_coteEquipe2 * msg.value));
        } else {
            revert("Your outcome is not available");
        }

        totalReward += msg.value;
    }

    function resultGame(int winner, int butsEquipe1_, int butsEquipe2_) public {
        require(winner == 0 || winner == 1 || winner == 2, "wrong outcome");
        require(msg.sender == _createur, "not authorized");
        require(block.timestamp > endEventTime, "event is not finished");

        if (winner == 0) {
             outcomeGagnant = Outcome.EQUIPE1;
        } else if (winner  == 1) {
            outcomeGagnant = Outcome.NUL;
        } else if (winner == 2) {
            outcomeGagnant = Outcome.EQUIPE2;
        } else {
            revert("Your outcome is not available");
        }

        butsEquipe1 = butsEquipe1_;
        butsEquipe2 = butsEquipe2_;

        statusMatch = StatusEvent.RESULTED;
    }

    function getTotalReward() public view returns(uint256) {
        return totalReward;
    }

    function distributeReward() public payable {
        require(block.timestamp > endEventTime, "event is not finished");
        
        if (markets[msg.sender].outcome == outcomeGagnant) {
             msg.sender.transfer(totalReward);
        }
    }

    function marketIsClosed() public returns(bool) {
        marketIsClose =  (block.timestamp > endEventTime);

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

    function getResult() public view returns(Paris.Outcome) {
        require(block.timestamp > endEventTime, 'event is not finished');

        return outcomeGagnant;
    }

    function getEquipe1() public view returns(string memory){
        return equipe1;
    }

    function getEquipe2() public view returns(string memory){ 
        return  equipe2;
    }

    function getButsEquipe1() public view returns(int){
        return butsEquipe1;
    }

    function getButsEquipe2() public view returns(int){ 
        return  butsEquipe2;
    }

    function getStatusMatch() public returns(string memory) {

        if (block.timestamp >= startEventTime && block.timestamp < endEventTime) {
            statusMatch = StatusEvent.IN_PROGRESS;
        }

        if (block.timestamp >= endEventTime) {
            statusMatch = StatusEvent.FINISHED;
            marketIsClose = true;
        }

        if (statusMatch == StatusEvent.NOT_STARTED) {
            return "Not started";
        } else if (statusMatch == StatusEvent.IN_PROGRESS) {
            return "In progress";
        } else if (statusMatch == StatusEvent.FINISHED) {
            return "Finished";
        } else if (statusMatch == StatusEvent.RESULTED) {
            return "Resulted";
        }
    }

    function getBets() public view 
        returns(Outcome outcome, uint256 cote, uint256 reward) {
        Bet memory userBet = markets[msg.sender];
        return (userBet.outcome, userBet.cote, userBet.reward);
    }
}