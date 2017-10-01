
var Events = artifacts.require("./PredictionMarkets/Event.sol");
var OracleAnswers = artifacts.require("./OracleAnswers.sol");
var OracleRequests = artifacts.require("./OracleRequests.sol");
var RealityToken = artifacts.require("./RealityToken.sol");

module.exports = function(deployer) {
	let realityToken;
  deployer.deploy(RealityToken).then(function(ans){
	realityToken=ans;
    return deployer.deploy(OracleRequests,RealityToken.address);
 });

};
