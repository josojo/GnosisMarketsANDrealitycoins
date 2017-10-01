pragma solidity ^0.4.15;

contract OracleAnswers{
   mapping(bytes32 =>uint ) answers;
   mapping(bytes32 =>bool) answerGiven;
   address public realityToken;
   address public owner;
   bool public finished;
   function OracleAnswers(){
     finished=false;
     owner=msg.sender;
   }
   //all answeres needs to be added one after another;
   function addAnswer(bytes32 hashid_, uint answer_){
     require(!finished);
       require(msg.sender==owner);
     answers[hashid_]=answer_;
     answerGiven[hashid_]=true;
   }
   function finalize(){
     require(msg.sender==owner);
     finished=true;
   }
   function getAnswer(bytes32 hashid_) constant public returns (uint){
     require(answerGiven[hashid_]);
     return answers[hashid_];
   }
}
