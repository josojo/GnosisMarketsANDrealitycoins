var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
var ether=1000000000000000000;
var Escalation = artifacts.require("./Escalation.sol");
var VeriethCore = artifacts.require("./VeriethCore.sol");
var VeriethDAO = artifacts.require("./VeriethDAO.sol");
var VeriethVoting = artifacts.require("./VeriethVoting.sol");
var OracleRequests = artifacts.require("./OracleRequests.sol");
var VotingAboutOracle = artifacts.require("./VotingAboutOracle.sol");
var utils = require("./utils.js");
function deployer(accounts){
	var EscalationContract, VeriethCoreContract,VeriethDAOContract,VeriethDAOContractId,OracleRequestsContract,VotingAboutOracleContract,VeriethVotingContract,positionOfOracleVote;
	return Escalation.deployed(
				).then(function(Escalation1) {
				EscalationContract=Escalation1;
				return OracleRequests.deployed(
				)}).then(function(OracleRequests1) {
					OracleRequestsContract=OracleRequests1;
				return VotingAboutOracle.deployed(
				)}).then(function(VotingAboutOracle1) {
					VotingAboutOracleContract=VotingAboutOracle1;
				return VeriethVoting.deployed(
				)}).then(function(VeriethVoting1) {
					VeriethVotingContract=VeriethVoting1;
				return VeriethDAO.deployed()
				}).then(function(VeriethDAO1){
          				VeriethDAOContract=VeriethDAO1;
				return VeriethCore.deployed();
				}).then(function(instance5) {
							VeriethCoreContract=instance5;
					 return VeriethCoreContract.VeriethDAOContractId.call();
			 }).then(function(ContractId) {
			  VeriethDAOContractId=ContractId;

				return VotingAboutOracleContract.proposeNewOracle(VeriethCoreContract.address,accounts[2],accounts[2],100,100,{from:accounts[0],value: 1*ether/1000+10});
			}).then(function(id) {
					var b=(id.receipt.logs[0].data).substr(id.receipt.logs[0].data.length - 32);
					positionOfOracleVote=Number(b)-1;
				 return VotingAboutOracleContract.vote(positionOfOracleVote,true,{from:accounts[1]});
			 	}).then(function(balance) {
				return shiftTimePromisified(60*60*24*4);
				 }).then(function(){
	 			return VotingAboutOracleContract.evaluate(positionOfOracleVote);
				}).then(function(){
				return distributeFunds(VeriethCoreContract,accounts);
			 	}).then(function(balance) {
								return VeriethDAOContract.getOracle.call(VeriethDAOContractId);
			 	}).then(function(balance) {
							 assert.equal(balance.valueOf(), accounts[2], "oracle not installed");
					return new Promise(function(accept,reject){
										web3.eth.getBlock('latest', function(err, block){
										      if(err) return reject(err)
										      timestampBeforeJump = block.timestamp
										      accept({
									        				EscalationContract: EscalationContract,
									        				VeriethCoreContract: VeriethCoreContract,
																	VeriethDAOContract: VeriethDAOContract,
																	VeriethDAOContractId:VeriethDAOContractId,
																	VeriethVotingContract: VeriethVotingContract,
																	OracleRequestsContract:OracleRequestsContract,
																	OracleAddress:accounts[2]
									    					});
										 });});
				});
}
function getbalance(account){
 return new Promise(function(accept,reject){
					 web3.eth.getBalance(account, function(err, bal){
								 if(err) return reject(err)
								 accept(bal);
						});
	 });
}
function shiftTimePromisified(seconds){
return new Promise(function(accept,reject){
				 web3.eth.getBlock('latest', function(err, block){
							 if(err) return reject(err)
							 timestampBeforeJump = block.timestamp
							 accept();
					});

									 }).then(function(){
				 return new Promise(function(accept, reject) {
						 web3.currentProvider.sendAsync({jsonrpc: "2.0",method: "evm_increaseTime",params: [seconds], id: 						new Date().getTime()}, function(err) {
							 if (err) return reject(err);
							 accept();
						 }) });
							 //return web3.currentProvider.sendAsync({ jsonrpc: "2.0",method: "evm_mine",id: new Date().getTime()})
									 }).then(function(){
						 return new Promise(function(accept, reject) {
					 web3.currentProvider.sendAsync({
						 jsonrpc: "2.0",
						 method: "evm_mine",
						 //params: [10],
						 id: new Date().getTime()
					 }, function(err) {
						 if (err) return reject(err);
						 accept();
					 }) });
						 //return web3.currentProvider.sendAsync({ jsonrpc: "2.0",method: "evm_mine",id: new Date().getTime()})
						 })
						 .then(function() {
							 web3.eth.getBlock('latest', function(err, block){
				 if(err) return done(err)
				 var secondsJumped = block.timestamp - timestampBeforeJump
				 // Somehow it jumps an extra 18 seconds, ish, when run inside the whole
				 // test suite. It might have something to do with when the before block
				 // runs and when the test runs. Likely the last block didn't occur for
				 // awhile.
				 assert(secondsJumped >=seconds);

						 });})
}
function oracleAnswering(id, additionalDelay, answer, OracleAddress,OracleRequestsContract){
 return OracleRequestsContract.receiveAnswer(id,answer,{from:OracleAddress})
 .then(function(result){
		return shiftTimePromisified(1+additionalDelay)}).then(function(){
	 return OracleRequestsContract.sendAnswer(id,{from:OracleAddress,gas:100000000})
 });
}
function distributeFunds(VeriethContract,accounts){

	 return VeriethContract.transfer(accounts[3],10000000,{from: accounts[1]})
	 .then(function(tx){
					 return VeriethContract.transfer(accounts[3],10000000,{from: accounts[1]});
			 }).then(function(tx){
					 return VeriethContract.transfer(accounts[4],10000000,{from: accounts[1]});
			 }).then(function(tx){
				 return VeriethContract.transfer(accounts[5],10000000,{from: accounts[1]});
			 }).then(function(tx){
					 return VeriethContract.transfer(accounts[6],10000000,{from: accounts[1]});
			 });
}

function goToStage( stage,accounts, EscalationContract, VeriethCoreContract){
				var positionOfIssue;

						if(stage=1) return {positionOfIssue:positionOfIssue};
						else {
							return {positionOfIssue:positionOfIssue};
						}
					});

}
function prepareEscalationWith(accounts,amountSharesVoteIsIssue,amountSharesVoteIsNoIssue,amountWeiSentIsIssue,amountWeiSentIsNoIssue,currentPrice){
	var EscalationContract, VeriethCoreContract,VeriethDAOContract,VeriethDAOContractId,OracleRequestsContract,VotingAboutOracleContract,VeriethVotingContract,positionOfOracleVote,positionOfEscalationIssue;

	prepareFunctions.deployer(accounts).then(function(Contracts){
			EscalationContract=Contracts.EscalationContract;
			VeriethCoreContract=Contracts.VeriethCoreContract;
			VeriethDAOContract=Contracts.VeriethDAOContract;
			VeriethDAOContractId=Contracts.VeriethDAOContractId;
			VeriethVotingContract=Contracts.VeriethVotingContract;
			OracleRequestsContract=Contracts.OracleRequestsContract;
			OracleAddress=Contracts.OracleAddress;
			return VeriethDAOContract.stageNr.call(VeriethDAOContractId);
	}).then(function(ans){
			assert.equals(ans,1,"escalationSTage not right");
				return OracleRequestsContract.pushRequestFromOraclePlatform(VeriethDAOContract.address,VeriethDAOContractId);
			}).then(function(result){
				id=Number(result.receipt.logs[0].data.substring(2, 66));
				return oracleAnswering(id, 0,currentPrice, OracleAddress,OracleRequestsContract)
			}).then(function(){
				return VeriethContract.veriethTokenPrice(VeriethDAOContractI);
			}).then(function(result){
				assert.equal(result,currentPrice,"test for price update failed");
				return EscalationContract.reportIssue(0, VeriethCoreContract.address,"111111111111111111111111111111111111",{from: accounts[8], value:1*ether/1000})
			}).then(function(id){
				positionOfEscalationIssue=Number(id.receipt.logs[0].data);
				return VeriethCoreContract.stageNr.call(VeriethDAOContractI);
			}).then(function(stageAns){
				  assert.equal((stageAns), 1);
					return VeriethContract.balanceOf(accounts[3]);
			}).then(function(tx){
					var1=tx;
					console.log("voting for split with "+amountSharesVoteIsIssue+"tokens");
					return EscalationContract.vote(true, positionOfEscalationIssue,{from: accounts[3]});
			}).then(function(tx){
				return VeriethContract.balanceOf(accounts[3]);
		}).then(function(tx){
				var2=tx;
				console.log(var1);
				return EscalationContract.vote(false,positionOfEscalationIssue,{from: accounts[4]});
		}).then(function(tx){
					return EscalationContract.issueInfoVotedFor.call(positionOfEscalationIssue)
			}).then(function(tx){
				assert.equal(var1.c[0],tx.c[0],"right before time shift");
				return VeriethDAOContract.stageNr.call(VeriethDAOContractId);
			}).then(function(stageAns){
				return shiftTimePromisified(60*60*24*2+600)}).then(function(){
				stage=2;
				return EscalationContract.startSellingOfSplitTokens(positionOfEscalationIssue,{from: accounts[9]});
			}).then(function(tx){
				return VeriethDAOContract.stageNr.call(VeriethDAOContractId);
			}).then(function(stageAns){
				assert.equal(stageAns.c,utils.EscalationStates.SellingOfSplittedTokens,"not in right state");
				return EscalationContract.SellingOfSplitTokens(true,positionOfEscalationIssue,{from:accounts[3],value:amountWeiSentIsIssue})
			}).then(function(result){
				console.log("selling of all split tokens with vote false"+amountWeiSentIsNoIssue);
				return EscalationContract.SellingOfSplitTokens(false,positionOfEscalationIssue,{from:accounts[4],value:amountWeiSentIsNoIssue})
			}).then(function(result){
				return shiftTimePromisified(60*60*24*2+600)}).then(function(){
					return VeriethDAOContract.stageNr.call(VeriethDAOContractId)
				}).then(function(result){
					console.log(result);
					assert.equal(result.c,utils.EscalationStates.SellingOfSplittedTokens,'state not set correctly in verieth contract');

						return VeriethContract.totalBalance.call();
						}).then(function(result){
							console.log("total verieth balance"+result);
				return EscalationContract.evaluate(positionOfEscalationIssue)
			}).then(function(result){
				return VeriethContract.stageNr.call(VeriethDAOContractId)
			}).then(function(result){
				console.log(result);
				assert.equal(result.c,utils.EscalationStates.EmergencySettlementsAllowance,'state not set correctly in verieth contract');

		return new Promise(function(accept,reject){
							web3.eth.getBlock('latest', function(err, block){
										if(err) return reject(err)
										timestampBeforeJump = block.timestamp
										accept({

															EscalationContract: EscalationContract,
															VeriethCoreContract: VeriethCoreContract,
															VeriethDAOContract: VeriethDAOContract,
															VeriethDAOContractId:VeriethDAOContractId,
															VeriethVotingContract: VeriethVotingContract,
															OracleRequestsContract:OracleRequestsContract,
															OracleAddress:accounts[2],
															positionOfEscalationIssue:positionOfEscalationIssue
													});
							 });})
			});
module.exports = {
deployer: deployer,
getbalance: getbalance,
shiftTimePromisified:shiftTimePromisified,
oracleAnswering:oracleAnswering,
oracleAnswer:oracleAnswer ,
distributeFunds:distributeFunds,
prepareEscalationWith:prepareEscalationWith,
}
