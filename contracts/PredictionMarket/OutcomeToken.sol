pragma solidity ^0.4.15;
import "../StandardToken.sol";
import '../SafeMath.sol';
/// @title Outcome token contract - Issuing and revoking outcome tokens
/// @author Stefan George - <stefan@gnosis.pm>
contract OutcomeToken is StandardToken {
    using SafeMath for *;

    /*
     *  Events
     */
    event Issuance(address indexed owner, uint amount);
    event Revocation(address indexed owner, uint amount);

    /*
     *  Storage
     */
    address public eventContract;
    mapping (address => bool) withDrawnInOneReality;
    function isWithDrawninOneReality(address account) returns (bool){
      return withDrawnInOneReality[account];
    }

    /*
     *  Modifiers
     */
    modifier isEventContract () {
        // Only event contract is allowed to proceed
        require(msg.sender == eventContract);
        _;
    }

    /*
     *  Public functions
     */
    /// @dev Constructor sets events contract address
    function OutcomeToken()
        public
    {
        eventContract = msg.sender;
    }

    /// @dev Events contract issues new tokens for address. Returns success
    /// @param _for Address of receiver
    /// @param outcomeTokenCount Number of tokens to issue
    function issue(address _for, uint outcomeTokenCount)
        public
        isEventContract
    {
        balances[_for] = balances[_for].add(outcomeTokenCount);
        totalSupply = totalSupply.add(outcomeTokenCount);
        Issuance(_for, outcomeTokenCount);
    }

    /****************ERC20 token standard****************/

    function transfer(address _to, uint256 _value) returns (bool) {
            // Abort if coin are locked
      require(!withDrawnInOneReality[msg.sender]);
    	return super.transfer(_to,_value);
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success){
          // Abort if coin are locked
      require(!withDrawnInOneReality[msg.sender]);
      return super.transferFrom(_from,_to,_value);
    }


    /// @dev Events contract revokes tokens for address. Returns success
    /// @param _for Address of token holder
    /// @param outcomeTokenCount Number of tokens to revoke
    function revoke(address _for, uint outcomeTokenCount)
        public
        isEventContract
    {
        balances[_for] = balances[_for].sub(outcomeTokenCount);
        totalSupply = totalSupply.sub(outcomeTokenCount);
        Revocation(_for, outcomeTokenCount);
    }

    function setWithdrawnInOneBranch(address _for)
    public
     isEventContract{
      withDrawnInOneReality[_for]=true;
    }
}
