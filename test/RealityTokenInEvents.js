
const expectThrow  =require( './utils/expectThrow.js');
const RealityToken = artifacts.require("./RealityToken.sol");
const OracleRequests = artifacts.require("./OracleRequests.sol");
const OracleAnswers = artifacts.require("./OracleAnswers.sol");
const Event = artifacts.require("./PredictionMarket/Event.sol");
const utils = require("./utils/utils.js");
// accounts
const crowdfundcontract = 0;
const oracle = 1;
const customer1=2;
const customer2=3;
const attacker1=4;
const attacker2=5;
const customer3=6;
const customer4=7;
let realityToken
let oracleRequests
let oracleAnswers
let oracleAnswer1
let oracleAnswer2
let eventContract
let oracleRequestHash
let merkle_root
//Actors definition


contract('EscalationContract Testing:', function(accounts) {
      /*
    before(utils.createGasStatCollectorBeforeHook(contracts))
    after(utils.createGasStatCollectorAfterHook(contracts))

    */
	let MarketParticipants=[{address: accounts[customer2],coinsToBeSpent:90000000}]

    before(async () => {
            realityToken = await RealityToken.deployed({from:accounts[crowdfundcontract]});
				            oracleRequests = await OracleRequests.deployed();
            await distributeTokens(realityToken,await realityToken.getWindowBranches(0),accounts);

      				//Push oracle answer
						merkle_root= (await realityToken.getWindowBranches(0))[0];
						eventContract = await Event.new(realityToken.address,merkle_root,oracleRequests.address,2);
					 await realityToken.approve(eventContract.address,1,merkle_root,{from: accounts[crowdfundcontract]});
					 oracleRequestHash=getParamFromTxEvent(await eventContract.createOracleRequest("Will BTC>ETH on 01.01.2017 00:00"), 'hash', null, 'OracleRequestDone') ;
					 for(var i=0;i<MarketParticipants.length;i++){
									await realityToken.approve(eventContract.address,MarketParticipants[i].coinsToBeSpent,merkle_root,{from: MarketParticipants[i].address});
									eventContract.buyAllOutcomes(MarketParticipants[i].coinsToBeSpent,{from: MarketParticipants[i].address});
								}
		console.log("before () done");

	})
    beforeEach(async () => {
    })


        it("Push answer true and withdraw funds", async () => {

		oracleAnswer1 = await OracleAnswers.new();
		await oracleAnswer1.addAnswer(oracleRequestHash,1);
		await oracleAnswer1.finalize();

		oracleAnswer2 = await OracleAnswers.new({from: accounts[attacker1]});
		await oracleAnswer2.addAnswer(oracleRequestHash,0,{from: accounts[attacker1]});
		await oracleAnswer2.finalize({from: accounts[attacker1]});

		oracleAnswer3 = await OracleAnswers.new({from: accounts[attacker1]});
		await oracleAnswer3.addAnswer(oracleRequestHash,0,{from: accounts[attacker1]});
		await oracleAnswer3.finalize({from: accounts[attacker1]});
		            timeTravel(86400 * 3) //3 days later
                await mineBlock();

		branchHash1=await realityToken.createBranch.call(merkle_root,merkle_root,oracleAnswer1.address);
		await realityToken.createBranch(merkle_root,merkle_root,oracleAnswer1.address);

		branchHash2= await realityToken.createBranch.call(merkle_root,merkle_root,oracleAnswer2.address);
		await realityToken.createBranch(merkle_root,merkle_root,oracleAnswer2.address)
		assert.equal(await realityToken.getDataContract.call(branchHash1),oracleAnswer1.address);

		assert.equal(await oracleAnswer1.getAnswer.call(oracleRequestHash),1);
		await eventContract.setOutcome(branchHash1);
		await eventContract.setOutcome(branchHash2);
		await eventContract.redeemWinnings(branchHash1,branchHash1,{from: MarketParticipants[0].address});
		console.log(await realityToken.balanceOf(MarketParticipants[0].address,branchHash1));
		assert.equal(await realityToken.balanceOf(MarketParticipants[0].address,branchHash1),100000000);

		assert.equal(await realityToken.balanceOf(MarketParticipants[0].address,branchHash2),100000000-MarketParticipants[0].coinsToBeSpent);


	});

        it("Testing Reward of Reporter in case of truthful reporting", async () => {
          });

	});
  const timeTravel = function (time) {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync({
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [time], // 86400 is num seconds in day
        id: new Date().getTime()
      }, (err, result) => {
        if(err){ return reject(err) }
        return resolve(result)
      });
    })
  }
  const mineBlock = async function () {
  return new Promise((resolve, reject) => {
    web3.currentProvider.sendAsync({
      jsonrpc: "2.0",
      method: "evm_mine"
    }, (err, result) => {
      if(err){ return reject(err) }
      return resolve(result)
    });
  })
  }
  function getParamFromTxEvent(transaction, paramName, contractFactory, eventName) {
    assert.isObject(transaction)
    let logs = transaction.logs
    if(eventName != null) {
        logs = logs.filter((l) => l.event === eventName)
    }
    assert.equal(logs.length, 1, 'too many logs found!')
    let param = logs[0].args[paramName]
    if(contractFactory != null) {
        let contract = contractFactory.at(param)
        assert.isObject(contract, `getting ${paramName} failed for ${param}`)
        return contract
    } else {
        return param
    }
  }
const distributeTokens = async function(realityToken,_initialBranch,accounts){

              // distributeFunds
              await realityToken.transfer(accounts[customer1],100000000,_initialBranch[0],{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[customer2],100000000,_initialBranch[0],{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[customer3],100000000,_initialBranch[0],{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[customer4],100000000,_initialBranch[0],{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[attacker1],100000000,_initialBranch[0],{from: accounts[crowdfundcontract]});
              await realityToken.transfer(accounts[attacker2],100000000,_initialBranch[0],{from: accounts[crowdfundcontract]});

}
