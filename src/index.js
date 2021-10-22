var Web3          = require('web3');
const express     = require('express');
const app         = express();
const path        = require('path');
var parisContract = require('../build/contracts/Paris.json');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views/'))

app.get('/' , (req , res)=>{
    var reward = 0;
    var marketIsClosed = false;
    let web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider('http://localhost:7545'));
    
    var myContract = new web3.eth.Contract( parisContract.abi, '0x39B16c46de5337c4dE37Ef9Daf17102A760104fa',  {
        from: '0x61639B80171D8175760204636e3a56BdB931bdf6',
        gasPrice: '20000000000'
    });

    var remote = {};
    myContract.methods.getTotalReward().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
    .then((reward) => {
        remote['reward'] =  web3.utils.fromWei(reward, 'ether');
    }) 
    .then(function() {
        myContract.methods.marketIsClosed().call({from : '0x6781EC56a01c4331d39a221B1A0b24003B709C13'})
        .then((isCLose) => {
            return remote['isCLose'] = isCLose;
        })

        return remote;
    })
    .then((contract) => {
        res.render('market', {contractName : parisContract.contractName, reward: contract.reward, marketIsClosed : contract.marketIsClosed});
    })
    .catch((err) => {
        console.log(err);
    });



    function placeMarketStatus(contract, isClosed) {
        remoteContract['marketIsClosed'] = isClosed;
        return remoteContract;
    }

})

app.listen(8080, ()=>{
    console.log('server running on port 8080');
});

