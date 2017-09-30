pragma solidity ^0.4.15;
import "./Token.sol";
import "./OutcomeToken.sol";
import "../OracleRequests.sol";
import "../RealityToken.sol";
import "../OracleAnswers.sol";

/// @title Event contract - Provide basic functionality required by different event types
/// @author Stefan George - <stefan@gnosis.pm>  modified by josojo@hotmail.de
contract Event {

    /*
     *  Events
     */
    event OutcomeTokenCreation(OutcomeToken outcomeToken, uint8 index);
    event OutcomeTokenSetIssuance(address indexed buyer, uint collateralTokenCount);
    event OutcomeTokenSetRevocation(address indexed seller, uint outcomeTokenCount);
    event OutcomeAssignment(uint outcome,bytes32 realityToken);
    event WinningsRedemption(address indexed receiver, uint winnings, bytes32 realityToken);

    /*
     *  Storage
     */
     struct RealityTokenBranch{
       bool isOutcomeSet;
       uint outcome;

     }
     mapping(bytes32 => RealityTokenBranch) realityTokens;

   address public oracleRequestContract;
   bytes32 public initialRealityTokenBranch;
   address public realityToken;
    OutcomeToken[] public outcomeTokens;

    /*
     *  Public functions
     */
    /// @dev Contract constructor validates and sets basic event properties
    /// @param _realityToken Tokens used as collateral in exchange for outcome tokens
    /// @param _oracleRequestContract Oracle contract used to resolve the event
    /// @param outcomeCount Number of event outcomes
   function Event(address _realityToken, bytes32 _branchId, address _oracleRequestContract, uint8 outcomeCount)
         public payable
    { // Validate input
      require(address(_realityToken) != 0 && address(_oracleRequestContract) != 0 && outcomeCount >= 2);
      realityToken=_realityToken;
      initialRealityTokenBranch=_branchId;
      // Store Input
      oracleRequestContract=_oracleRequestContract;
      // Create an outcome token for each outcome
      for (uint8 i = 0; i < outcomeCount; i++) {
          OutcomeToken outcomeToken = new OutcomeToken();
          outcomeTokens.push(outcomeToken);
          OutcomeTokenCreation(outcomeToken, i);
      }
    }
    bytes32 oracleRequestHashid;
    bool requestHashSet=false;
    function createOracleRequest(bytes32 oracleRequestDescription)  {
      // testing only
      //bytes32 oracleRequestDescription='af';
      require(!requestHashSet);
      RealityToken R=RealityToken(realityToken);
      // Create OracleRquest
      require( R.transferFrom(msg.sender,this, 1,initialRealityTokenBranch));
      require( R.approve(oracleRequestContract,1,initialRealityTokenBranch));
      oracleRequestHashid=OracleRequests(oracleRequestContract).pushRequest(initialRealityTokenBranch, oracleRequestDescription);
      requestHashSet=true;
    }
    /// @dev Buys equal number of tokens of all outcomes, exchanging collateral tokens and sets of outcome tokens 1:1
    /// @param collateralTokenCount Number of collateral tokens
    function buyAllOutcomes(uint collateralTokenCount, address _realityToken)
        public
    {
        // Transfer collateral tokens to events contract
        require(RealityToken(_realityToken).transferFrom(msg.sender, this, collateralTokenCount,initialRealityTokenBranch));
        // Issue new outcome tokens to sender
        for (uint8 i = 0; i < outcomeTokens.length; i++)
            outcomeTokens[i].issue(msg.sender, collateralTokenCount);
        OutcomeTokenSetIssuance(msg.sender, collateralTokenCount);
    }

    /// @dev Sets winning event outcome
    function setOutcome(bytes32 _realityTokenBranch)
        public
    {
        // Winning outcome is not set yet in event contract but in oracle contract
        require(!realityTokens[_realityTokenBranch].isOutcomeSet);
        // Set winning outcome
        uint outcome=OracleAnswers(RealityToken(realityToken).getDataContract(_realityTokenBranch)).getAnswer(_realityTokenBranch);
        realityTokens[_realityTokenBranch].outcome = outcome;
        realityTokens[_realityTokenBranch].isOutcomeSet = true;
        OutcomeAssignment(outcome, _realityTokenBranch);
    }
    function getOutcome( bytes32 _realityTokenBranch)
        public returns (uint)
    {
        return realityTokens[_realityTokenBranch].outcome;

    }
    /// @dev Returns outcome count
    /// @return Outcome count
    function getOutcomeCount()
        public
        constant
        returns (uint8)
    {
        return uint8(outcomeTokens.length);
    }

    /// @dev Returns outcome tokens array
    /// @return Outcome tokens
    function getOutcomeTokens()
        public
        constant
        returns (OutcomeToken[])
    {
        return outcomeTokens;
    }

    /// @dev Returns the amount of outcome tokens held by owner
    /// @return Outcome token distribution
    function getOutcomeTokenDistribution(address owner)
        public
        constant
        returns (uint[] outcomeTokenDistribution)
    {
        outcomeTokenDistribution = new uint[](outcomeTokens.length);
        for (uint8 i = 0; i < outcomeTokenDistribution.length; i++)
            outcomeTokenDistribution[i] = outcomeTokens[i].balanceOf(owner);
    }

    mapping(address => mapping (bytes32 =>bool)) withDrawnCollateral;
    /// @dev Exchanges sender's winning outcome tokens for collateral tokens
    /// @return Sender's winnings
    function redeemWinnings(bytes32 realityTokenBranch_)
        public
        returns (uint winnings)
    {
        // Winning outcome has to be set
        // getting payouts is only possible in the branch, which set the answer
        require(realityTokens[realityTokenBranch_].isOutcomeSet);


        // Calculate winnings
        winnings = outcomeTokens[uint(realityTokens[realityTokenBranch_].outcome)].balanceOf(msg.sender);
        // Revoke tokens from winning outcome
        outcomeTokens[uint(realityTokens[realityTokenBranch_].outcome)].setWithdrawnInOneBranch(msg.sender);
        require(!withDrawnCollateral[msg.sender][realityTokenBranch_]);
        // Payout winnings
        require(RealityToken(realityToken).transfer(msg.sender, winnings,realityTokenBranch_));
        withDrawnCollateral[msg.sender][realityTokenBranch_]=true;
        WinningsRedemption(msg.sender, winnings, realityTokenBranch_);
    }

    /// @dev Calculates and returns event hash
    /// @return Event hash
    function getEventHash(address realityToken_)
        public
        constant
        returns (bytes32)
    {
        return keccak256(realityToken_, outcomeTokens.length);
    }
}
