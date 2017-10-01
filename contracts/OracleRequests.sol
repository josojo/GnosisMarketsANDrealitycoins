pragma solidity ^0.4.15;
import "./RealityToken.sol";

contract OracleRequests{
  event TakeRequests(bytes32 hashid, address  sender);
    struct OracleRequest{
        address from;
        bytes32 rootbranchhash;
        string oracleRequestDescription;
    }
   mapping(bytes32 =>OracleRequest) oracleRequests;
   address public realityToken;
   function OracleRequests(address realityToken_){
     realityToken=realityToken_;
   }

    function pushRequest( bytes32 rootbranchhash_, string oracleRequestDescription_)  returns (bytes32){
        //request some kind of fee
        require(RealityToken(realityToken).transferFrom(msg.sender,this,1,rootbranchhash_));
        bytes32 hashid =sha3(block.number,rootbranchhash_,oracleRequestDescription_,msg.sender);
        oracleRequests[hashid]=OracleRequest({
            from: msg.sender,
            rootbranchhash:rootbranchhash_,
            oracleRequestDescription: oracleRequestDescription_
        });
        TakeRequests(hashid,msg.sender);

        return hashid;
    }
}
