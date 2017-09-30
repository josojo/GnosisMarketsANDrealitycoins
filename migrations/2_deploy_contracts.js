
var Events = artifacts.require("./PredictionMarkets/Events.sol");
var OracleAnswers = artifacts.require("./OracleAnswers.sol");
var OracleRequests = artifacts.require("./OracleRequests.sol");
var RealityToken = artifacts.require("./realityToken.sol");

module.exports = function(deployer) {
  deployer.deploy(RealityToken).then(function(){
    return deployer.deploy(OracleRequests);
 }).then(function() {
  return deployer.deploy(Events,RealityToken.address,"Hash","Will this work?",2);
 })
 });

};
